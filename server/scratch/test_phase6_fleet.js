// FleetHub – Phase 6: Comprehensive Automated Test Suite using native fetch
// Tests: Vehicle CRUD, Driver CRUD, Availability APIs, Maintenance Protection,
// Bidirectional Vehicle-Driver Assignment, Deletion Guards, Client Isolation & RBAC.

const API_BASE = 'http://localhost:5000/api/v1';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${message}`);
    passed++;
  } else {
    console.error(`  ${colors.red}✖ FAIL:${colors.reset} ${message}`);
    failed++;
  }
}

async function request(method, path, data = null, token = null) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(url, options);
  let resData;
  try {
    resData = await res.json();
  } catch {
    resData = null;
  }

  return {
    status: res.status,
    ok: res.ok,
    data: resData,
  };
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  FLEETHUB PHASE 6: VEHICLE & DRIVER MANAGEMENT TEST SUITE  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  try {
    // ── 1. Authentication ───────────────────────────────────────
    console.log(`${colors.yellow}1. Authenticating Super Admin & Client Admin...${colors.reset}`);
    
    // Super Admin login
    const adminLoginRes = await request('POST', '/auth/login', {
      email: 'admin@fastfleet.in',
      password: 'Password@123',
    });
    const adminToken = adminLoginRes.data?.data?.accessToken;
    assert(adminLoginRes.status === 200 && !!adminToken, 'Super Admin logged in successfully');

    // Domino's Client Admin login
    const clientAdminLoginRes = await request('POST', '/auth/login', {
      email: 'manager@dominos.in',
      password: 'Password@123',
    });
    const clientAdminToken = clientAdminLoginRes.data?.data?.accessToken;
    const dominosClientUser = clientAdminLoginRes.data?.data?.user;
    const dominosClientId = dominosClientUser?.client;
    assert(clientAdminLoginRes.status === 200 && !!clientAdminToken, 'Domino\'s Client Admin logged in successfully');

    // Fetch Domino's and KFC for test data
    const clientsRes = await request('GET', '/clients', null, adminToken);
    const dominosClient = clientsRes.data.data.clients.find(c => c.companyCode === 'DOMINOS') || clientsRes.data.data.clients[0];
    const kfcClient = clientsRes.data.data.clients.find(c => c.companyCode === 'KFC') || clientsRes.data.data.clients[1];
    assert(!!dominosClient && !!kfcClient, 'Found Domino\'s and KFC clients');

    // Fetch branches
    const domBranchesRes = await request('GET', `/branches?client=${dominosClient._id}`, null, adminToken);
    const domBranch = domBranchesRes.data.data.branches[0];
    assert(!!domBranch, `Found Domino's branch: ${domBranch.branchName}`);

    const kfcBranchesRes = await request('GET', `/branches?client=${kfcClient._id}`, null, adminToken);
    const kfcBranch = kfcBranchesRes.data.data.branches[0];
    assert(!!kfcBranch, `Found KFC branch: ${kfcBranch.branchName}`);

    const uniqueSuffix = Date.now().toString().slice(-4);

    // ── 2. Vehicle CRUD ──────────────────────────────────────────
    console.log(`\n${colors.yellow}2. Testing Vehicle CRUD Operations...${colors.reset}`);
    
    // Create vehicle
    const vehicleNum = `MH12AB${uniqueSuffix}`;
    const createVehRes = await request('POST', '/vehicles', {
      vehicleNumber: vehicleNum,
      vehicleType: 'ev_bike',
      brand: 'Ather',
      model: '450X Gen 3',
      client: dominosClient._id,
      branch: domBranch._id,
      fuelType: 'electric',
      availability: 'AVAILABLE',
      odometer: 1500,
    }, adminToken);

    const createdVehicle = createVehRes.data?.data?.vehicle;
    assert(createVehRes.status === 201, 'Vehicle created with status 201');
    assert(createdVehicle?.vehicleNumber === vehicleNum, `Vehicle number matches ${vehicleNum}`);
    assert(createdVehicle?.availability === 'AVAILABLE', 'Vehicle availability initialized to AVAILABLE');

    // Get Vehicle by ID
    const getVehRes = await request('GET', `/vehicles/${createdVehicle._id}`, null, adminToken);
    assert(getVehRes.data?.data?.vehicle?._id === createdVehicle._id, 'Retrieved vehicle by ID');
    assert(getVehRes.data?.data?.vehicle?.client?.companyCode === dominosClient.companyCode, 'Populated vehicle client correctly');

    // Update Vehicle
    const updateVehRes = await request('PUT', `/vehicles/${createdVehicle._id}`, {
      odometer: 1850,
      model: '450X Apex Edition',
    }, adminToken);
    assert(updateVehRes.data?.data?.vehicle?.odometer === 1850, 'Vehicle odometer updated to 1850 km');
    assert(updateVehRes.data?.data?.vehicle?.model === '450X Apex Edition', 'Vehicle model updated');

    // Prevent duplicate vehicleNumber
    const dupVehRes = await request('POST', '/vehicles', {
      vehicleNumber: vehicleNum,
      vehicleType: 'bike',
      client: dominosClient._id,
      branch: domBranch._id,
    }, adminToken);
    assert(dupVehRes.status === 409, 'Duplicate vehicleNumber correctly rejected with 409 Conflict');

    // Prevent branch not belonging to client
    const mismatchVehRes = await request('POST', '/vehicles', {
      vehicleNumber: `MH12XX${uniqueSuffix}`,
      vehicleType: 'bike',
      client: dominosClient._id,
      branch: kfcBranch._id, // KFC branch for Domino's client!
    }, adminToken);
    assert(mismatchVehRes.status === 400, 'Mismatched branch-client correctly rejected with 400 Bad Request');

    // ── 3. Driver CRUD ───────────────────────────────────────────
    console.log(`\n${colors.yellow}3. Testing Driver CRUD Operations...${colors.reset}`);

    const empId = `DRV-${uniqueSuffix}`;
    const licNum = `DL14${uniqueSuffix}9988`;
    const createDrvRes = await request('POST', '/drivers', {
      firstName: 'Rahul',
      lastName: 'Sharma',
      employeeId: empId,
      licenseNumber: licNum,
      phone: '+91 98765 11223',
      email: `rahul.${uniqueSuffix}@fastfleet.in`,
      client: dominosClient._id,
      branch: domBranch._id,
      status: 'available',
      availability: 'AVAILABLE',
      experience: 3,
    }, adminToken);

    const createdDriver = createDrvRes.data?.data?.driver;
    assert(createDrvRes.status === 201, 'Driver created with status 201');
    assert(createdDriver?.employeeId === empId, `Driver employeeId matches ${empId}`);
    assert(createdDriver?.availability === 'AVAILABLE', 'Driver availability initialized to AVAILABLE');

    // Get Driver by ID
    const getDrvRes = await request('GET', `/drivers/${createdDriver._id}`, null, adminToken);
    assert(getDrvRes.data?.data?.driver?._id === createdDriver._id, 'Retrieved driver by ID');
    assert(getDrvRes.data?.data?.driver?.fullName === 'Rahul Sharma', 'Virtual fullName works');

    // Update Driver
    const updateDrvRes = await request('PUT', `/drivers/${createdDriver._id}`, {
      phone: '+91 98765 99999',
      rating: 4.9,
    }, adminToken);
    assert(updateDrvRes.data?.data?.driver?.phone === '+91 98765 99999', 'Driver phone updated');
    assert(updateDrvRes.data?.data?.driver?.rating === 4.9, 'Driver rating updated to 4.9');

    // Prevent duplicate employeeId
    const dupEmpRes = await request('POST', '/drivers', {
      firstName: 'Amit',
      lastName: 'Kumar',
      employeeId: empId,
      licenseNumber: `DL99${uniqueSuffix}0000`,
      client: dominosClient._id,
      branch: domBranch._id,
    }, adminToken);
    assert(dupEmpRes.status === 409, 'Duplicate employeeId correctly rejected with 409 Conflict');

    // Prevent branch not belonging to client
    const mismatchDrvRes = await request('POST', '/drivers', {
      firstName: 'Amit',
      lastName: 'Kumar',
      employeeId: `DRV-M${uniqueSuffix}`,
      licenseNumber: `DL99${uniqueSuffix}1111`,
      client: dominosClient._id,
      branch: kfcBranch._id, // KFC branch for Domino's client!
    }, adminToken);
    assert(mismatchDrvRes.status === 400, 'Mismatched branch-client correctly rejected with 400 Bad Request');

    // ── 4. Driver ↔ Vehicle Assignment ───────────────────────────
    console.log(`\n${colors.yellow}4. Testing Bidirectional Driver ↔ Vehicle Assignment...${colors.reset}`);

    // Create a vehicle for KFC to test cross-client assignment protection
    const kfcVehicleRes = await request('POST', '/vehicles', {
      vehicleNumber: `KA05KF${uniqueSuffix}`,
      vehicleType: 'scooter',
      client: kfcClient._id,
      branch: kfcBranch._id,
      availability: 'AVAILABLE',
    }, adminToken);
    const kfcVehicle = kfcVehicleRes.data.data.vehicle;

    // Cross-client assignment protection: Try assigning KFC vehicle to Domino's driver
    const crossClientAssign = await request('PATCH', `/drivers/${createdDriver._id}/assign-vehicle`, {
      vehicleId: kfcVehicle._id,
    }, adminToken);
    assert(crossClientAssign.status === 400, 'Cross-client vehicle assignment correctly rejected with 400');

    // Maintenance protection: Put vehicle under maintenance and try assigning
    await request('PUT', `/vehicles/${createdVehicle._id}`, { status: 'maintenance' }, adminToken);
    const maintAssign = await request('PATCH', `/drivers/${createdDriver._id}/assign-vehicle`, {
      vehicleId: createdVehicle._id,
    }, adminToken);
    assert(maintAssign.status === 400, 'Maintenance vehicle assignment correctly rejected with 400');

    // Restore vehicle to available
    await request('PUT', `/vehicles/${createdVehicle._id}`, { status: 'available' }, adminToken);

    // Valid assignment
    const assignRes = await request('PATCH', `/drivers/${createdDriver._id}/assign-vehicle`, {
      vehicleId: createdVehicle._id,
    }, adminToken);
    assert(assignRes.status === 200, 'Vehicle assigned to driver successfully');
    assert(assignRes.data.data.driver.assignedVehicle._id === createdVehicle._id, 'Driver assignedVehicle populated');

    // Verify bidirectional link in Vehicle document
    const updatedVehicleCheck = await request('GET', `/vehicles/${createdVehicle._id}`, null, adminToken);
    assert(
      updatedVehicleCheck.data.data.vehicle.assignedDriver?._id === createdDriver._id,
      'Vehicle assignedDriver updated bidirectionally in MongoDB'
    );

    // Prevent duplicate assignment to a second driver
    const driver2Res = await request('POST', '/drivers', {
      firstName: 'Sameer',
      lastName: 'Patil',
      employeeId: `DRV-S${uniqueSuffix}`,
      licenseNumber: `DL14${uniqueSuffix}2222`,
      client: dominosClient._id,
      branch: domBranch._id,
    }, adminToken);
    const driver2 = driver2Res.data.data.driver;

    const dupAssign = await request('PATCH', `/drivers/${driver2._id}/assign-vehicle`, {
      vehicleId: createdVehicle._id,
    }, adminToken);
    assert(dupAssign.status === 409, 'Duplicate vehicle assignment rejected with 409 Conflict');

    // Unassign vehicle from driver
    const unassignRes = await request('PATCH', `/drivers/${createdDriver._id}/remove-vehicle`, null, adminToken);
    assert(unassignRes.status === 200, 'Vehicle unassigned from driver successfully');
    assert(unassignRes.data.data.driver.assignedVehicle === null, 'Driver assignedVehicle cleared');

    // Verify bidirectional clear in Vehicle document
    const vehicleAfterUnassign = await request('GET', `/vehicles/${createdVehicle._id}`, null, adminToken);
    assert(vehicleAfterUnassign.data.data.vehicle.assignedDriver === null, 'Vehicle assignedDriver cleared bidirectionally');

    // ── 5. Availability Queries ──────────────────────────────────
    console.log(`\n${colors.yellow}5. Testing Available Vehicles & Available Drivers APIs...${colors.reset}`);

    const availVehRes = await request('GET', '/vehicles/available', null, adminToken);
    assert(Array.isArray(availVehRes.data.data.vehicles), 'GET /vehicles/available returned array');
    const foundCreatedVeh = availVehRes.data.data.vehicles.some(v => v._id === createdVehicle._id);
    assert(foundCreatedVeh, 'Available vehicles includes created available vehicle');

    // Exclude maintenance vehicles from /vehicles/available
    await request('PUT', `/vehicles/${createdVehicle._id}`, { status: 'maintenance' }, adminToken);
    const availVehCheck2 = await request('GET', '/vehicles/available', null, adminToken);
    const foundMaintenanceVeh = availVehCheck2.data.data.vehicles.some(v => v._id === createdVehicle._id);
    assert(!foundMaintenanceVeh, 'Maintenance vehicle is excluded from /vehicles/available');
    await request('PUT', `/vehicles/${createdVehicle._id}`, { status: 'available' }, adminToken);

    // Available Drivers API
    const availDrvRes = await request('GET', '/drivers/available', null, adminToken);
    assert(Array.isArray(availDrvRes.data.data.drivers), 'GET /drivers/available returned array');
    const foundCreatedDrv = availDrvRes.data.data.drivers.some(d => d._id === createdDriver._id);
    assert(foundCreatedDrv, 'Available drivers includes created available driver');

    // Exclude busy/offline drivers from /drivers/available
    await request('PUT', `/drivers/${createdDriver._id}`, { availability: 'BUSY' }, adminToken);
    const availDrvCheck2 = await request('GET', '/drivers/available', null, adminToken);
    const foundBusyDrv = availDrvCheck2.data.data.drivers.some(d => d._id === createdDriver._id);
    assert(!foundBusyDrv, 'Busy / on-delivery driver is excluded from /drivers/available');
    await request('PUT', `/drivers/${createdDriver._id}`, { availability: 'AVAILABLE' }, adminToken);

    // ── 6. Deletion Guards ───────────────────────────────────────
    console.log(`\n${colors.yellow}6. Testing Deletion Protection Rules...${colors.reset}`);

    // Re-assign vehicle and test delete protection
    await request('PATCH', `/drivers/${createdDriver._id}/assign-vehicle`, {
      vehicleId: createdVehicle._id,
    }, adminToken);

    // Cannot delete assigned vehicle
    const delAssignedVeh = await request('DELETE', `/vehicles/${createdVehicle._id}`, null, adminToken);
    assert(delAssignedVeh.status === 400, 'Assigned vehicle deletion correctly blocked with 400');

    // Cannot delete assigned driver
    const delAssignedDrv = await request('DELETE', `/drivers/${createdDriver._id}`, null, adminToken);
    assert(delAssignedDrv.status === 400, 'Assigned driver deletion correctly blocked with 400');

    // Unassign then test delete
    await request('PATCH', `/drivers/${createdDriver._id}/remove-vehicle`, null, adminToken);

    // Cannot delete vehicle in maintenance
    await request('PUT', `/vehicles/${createdVehicle._id}`, { status: 'maintenance' }, adminToken);
    const delMaintVeh = await request('DELETE', `/vehicles/${createdVehicle._id}`, null, adminToken);
    assert(delMaintVeh.status === 400, 'Maintenance vehicle deletion correctly blocked with 400');
    await request('PUT', `/vehicles/${createdVehicle._id}`, { status: 'available' }, adminToken);

    // Free vehicle delete succeeds
    const deleteVehRes = await request('DELETE', `/vehicles/${createdVehicle._id}`, null, adminToken);
    assert(deleteVehRes.status === 200, 'Unassigned vehicle successfully deleted');

    // Free driver delete succeeds
    const deleteDrvRes = await request('DELETE', `/drivers/${createdDriver._id}`, null, adminToken);
    assert(deleteDrvRes.status === 200, 'Unassigned driver successfully deleted');

    // ── 7. Multi-Client Tenant Isolation ─────────────────────────
    console.log(`\n${colors.yellow}7. Testing Multi-Client Tenant Isolation & RBAC...${colors.reset}`);

    // Domino's client admin queries vehicles
    const domAdminVehicles = await request('GET', '/vehicles', null, clientAdminToken);
    const hasOnlyDominosVehicles = domAdminVehicles.data.data.vehicles.every(
      v => (v.client?._id || v.client)?.toString() === dominosClientId.toString()
    );
    assert(hasOnlyDominosVehicles, 'Domino\'s client admin only receives Domino\'s vehicles');

    // Domino's client admin cannot access KFC vehicle by ID
    const crossViewVeh = await request('GET', `/vehicles/${kfcVehicle._id}`, null, clientAdminToken);
    assert(crossViewVeh.status === 403, 'Cross-client vehicle access blocked with 403 Forbidden');

    // Domino's client admin cannot delete or update KFC vehicle
    const crossUpdateVeh = await request('PUT', `/vehicles/${kfcVehicle._id}`, { model: 'Hacked' }, clientAdminToken);
    assert(crossUpdateVeh.status === 403, 'Cross-client vehicle update blocked with 403 Forbidden');

    // Domino's client admin can create vehicle for own client
    const clientAdminCreateVehRes = await request('POST', '/vehicles', {
      vehicleNumber: `MH14CA${uniqueSuffix}`,
      vehicleType: 'ev_bike',
      branch: domBranch._id,
      availability: 'AVAILABLE',
    }, clientAdminToken);
    assert(clientAdminCreateVehRes.status === 201, 'Domino\'s client admin can create vehicle for own client');

    // Clean up
    await request('DELETE', `/vehicles/${clientAdminCreateVehRes.data.data.vehicle._id}`, null, adminToken);
    await request('DELETE', `/vehicles/${kfcVehicle._id}`, null, adminToken);
    await request('DELETE', `/drivers/${driver2._id}`, null, adminToken);

    // Summary
    console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}TEST RESULTS: ${colors.green}${passed} PASSED${colors.reset}, ${colors.red}${failed} FAILED${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n${colors.red}Unhandled Test Error:${colors.reset}`, err);
    process.exit(1);
  }
}

runTests();
