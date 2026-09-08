// FleetHub – Vehicle Service (Business Logic)
import Vehicle from '../models/Vehicle.js';
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import ApiError from '../utils/apiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { cleanObject } from '../utils/helpers.js';
import { ROLES, VEHICLE_STATUSES } from '../utils/constants.js';

// ════════════════════════════════════════
// Populate options (reusable)
// ════════════════════════════════════════
const VEHICLE_POPULATES = [
  { path: 'client', select: 'companyName companyCode' },
  { path: 'branch', select: 'branchName branchCode' },
  { path: 'assignedDriver', select: 'firstName lastName employeeId phone availability status' },
  { path: 'createdBy', select: 'name email' },
  { path: 'updatedBy', select: 'name email' },
];

// ════════════════════════════════════════
// Internal Helpers
// ════════════════════════════════════════

/**
 * Build a scope-based filter based on the requesting user's role.
 * Restricts query results to what the user is permitted to see.
 */
const buildScopeFilter = (requestingUser) => {
  const filter = {};
  const role = requestingUser.role;

  if (role === ROLES.SUPER_ADMIN) {
    // No scope restriction
    return filter;
  }

  if (role === ROLES.CLIENT_ADMIN || role === ROLES.DISPATCHER) {
    // Scoped to own client
    filter.client = requestingUser.client;
    return filter;
  }

  if (role === ROLES.BRANCH_MANAGER) {
    // Scoped to own branch
    filter.branch = requestingUser.branch;
    return filter;
  }

  if (role === ROLES.DRIVER) {
    // Only vehicles assigned to this driver
    filter.assignedDriver = requestingUser._id;
    return filter;
  }

  return filter;
};

/**
 * Enforce scope-based access for single-vehicle operations.
 * Ensures the requesting user has visibility over the target vehicle.
 */
const enforceScopeAccess = (requestingUser, vehicle, action = 'manage') => {
  const role = requestingUser.role;

  // SUPER_ADMIN → unrestricted
  if (role === ROLES.SUPER_ADMIN) return;

  // CLIENT_ADMIN → vehicle must belong to the same client
  if (role === ROLES.CLIENT_ADMIN) {
    const reqClient = requestingUser.client?.toString();
    const vehicleClient = vehicle.client?._id?.toString() || vehicle.client?.toString();
    if (!reqClient || reqClient !== vehicleClient) {
      throw ApiError.forbidden('You can only manage vehicles within your own client');
    }
    return;
  }

  // BRANCH_MANAGER → vehicle must belong to the same branch
  if (role === ROLES.BRANCH_MANAGER) {
    const reqBranch = requestingUser.branch?.toString();
    const vehicleBranch = vehicle.branch?._id?.toString() || vehicle.branch?.toString();
    if (!reqBranch || reqBranch !== vehicleBranch) {
      throw ApiError.forbidden('You can only manage vehicles within your own branch');
    }
    return;
  }

  // DISPATCHER → read-only access; block write actions
  if (role === ROLES.DISPATCHER) {
    if (action !== 'read') {
      throw ApiError.forbidden('Dispatchers have read-only access to vehicles');
    }
    const reqClient = requestingUser.client?.toString();
    const vehicleClient = vehicle.client?._id?.toString() || vehicle.client?.toString();
    if (!reqClient || reqClient !== vehicleClient) {
      throw ApiError.forbidden('You can only view vehicles within your own client');
    }
    return;
  }

  // DRIVER → can only view their assigned vehicle
  if (role === ROLES.DRIVER) {
    if (action !== 'read') {
      throw ApiError.forbidden('Drivers have read-only access to vehicles');
    }
    const driverId = requestingUser._id.toString();
    const assignedId = vehicle.assignedDriver?._id?.toString() || vehicle.assignedDriver?.toString();
    if (driverId !== assignedId) {
      throw ApiError.forbidden('Drivers can only view their assigned vehicle');
    }
    return;
  }

  throw ApiError.forbidden('Insufficient permissions');
};

// ════════════════════════════════════════
// Create Vehicle
// ════════════════════════════════════════
export const createVehicle = async (data, requestingUser) => {
  const reqRole = requestingUser.role;

  // ── Role-based scoping ───────────────
  if (reqRole === ROLES.CLIENT_ADMIN) {
    // Auto-scope to own client
    data.client = requestingUser.client;
  }

  if (reqRole === ROLES.BRANCH_MANAGER) {
    // Auto-scope to own client and branch
    data.client = requestingUser.client;
    data.branch = requestingUser.branch;
  }

  // ── Validate parent client exists ────
  const client = await Client.findById(data.client);
  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // ── Validate parent branch exists and belongs to client ──
  const branch = await Branch.findById(data.branch);
  if (!branch) {
    throw ApiError.notFound('Branch not found');
  }
  if (branch.client.toString() !== data.client.toString()) {
    throw ApiError.badRequest('Branch does not belong to the specified client');
  }

  // ── Check client's vehicle limit ─────
  const vehicleCount = await Vehicle.countDocuments({ client: data.client });
  if (vehicleCount >= client.maxVehicles) {
    throw ApiError.badRequest(
      `Vehicle limit reached. Client "${client.companyName}" allows a maximum of ${client.maxVehicles} vehicles.`
    );
  }

  // ── Check duplicate vehicleNumber ────
  const existingNumber = await Vehicle.findOne({ vehicleNumber: data.vehicleNumber.toUpperCase() });
  if (existingNumber) {
    throw ApiError.conflict(`Vehicle number "${data.vehicleNumber}" is already in use`);
  }

  // ── Check duplicate engineNumber (if provided) ──
  if (data.engineNumber) {
    const existingEngine = await Vehicle.findOne({
      engineNumber: data.engineNumber.toUpperCase(),
    });
    if (existingEngine) {
      throw ApiError.conflict(`Engine number "${data.engineNumber}" is already in use`);
    }
  }

  // ── Check duplicate chassisNumber (if provided) ──
  if (data.chassisNumber) {
    const existingChassis = await Vehicle.findOne({
      chassisNumber: data.chassisNumber.toUpperCase(),
    });
    if (existingChassis) {
      throw ApiError.conflict(`Chassis number "${data.chassisNumber}" is already in use`);
    }
  }

  const vehicle = await Vehicle.create({
    ...data,
    createdBy: requestingUser._id,
    updatedBy: requestingUser._id,
  });

  // Populate references before returning
  await vehicle.populate(VEHICLE_POPULATES);

  return vehicle;
};

// ════════════════════════════════════════
// Get All Vehicles (search, filter, sort, pagination)
// ════════════════════════════════════════
export const getVehicles = async (query, requestingUser) => {
  const { page, limit, skip, sort } = getPagination(query);

  // Start with scope-based filter
  const filter = buildScopeFilter(requestingUser);

  // ── Text Search ──────────────────────
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { vehicleNumber: searchRegex },
      { brand: searchRegex },
      { model: searchRegex },
      { engineNumber: searchRegex },
      { chassisNumber: searchRegex },
    ];
  }

  // ── Field Filters ────────────────────
  if (query.client && requestingUser.role === ROLES.SUPER_ADMIN) {
    filter.client = query.client;
  }
  if (query.branch) filter.branch = query.branch;
  if (query.vehicleType) filter.vehicleType = query.vehicleType;
  if (query.fuelType) filter.fuelType = query.fuelType;
  if (query.status) filter.status = query.status;
  if (query.availability) filter.availability = query.availability.toUpperCase();

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(VEHICLE_POPULATES)
      .lean(),
    Vehicle.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { vehicles, meta };
};

// ════════════════════════════════════════
// Get Vehicle by ID
// ════════════════════════════════════════
export const getVehicleById = async (id, requestingUser) => {
  const vehicle = await Vehicle.findById(id).populate(VEHICLE_POPULATES);

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, vehicle, 'read');

  return vehicle;
};

// ════════════════════════════════════════
// Update Vehicle
// ════════════════════════════════════════
export const updateVehicle = async (id, data, requestingUser) => {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, vehicle, 'manage');

  // ── If changing client, verify new client exists ──
  if (data.client && data.client.toString() !== vehicle.client.toString()) {
    const newClient = await Client.findById(data.client);
    if (!newClient) {
      throw ApiError.notFound('Target client not found');
    }
  }

  // ── If changing branch, verify it exists and belongs to client ──
  if (data.branch && data.branch.toString() !== vehicle.branch.toString()) {
    const newBranch = await Branch.findById(data.branch);
    if (!newBranch) {
      throw ApiError.notFound('Target branch not found');
    }
    const effectiveClient = data.client || vehicle.client;
    if (newBranch.client.toString() !== effectiveClient.toString()) {
      throw ApiError.badRequest('Branch does not belong to the specified client');
    }
  }

  // ── Check duplicate vehicleNumber (if being changed) ──
  if (data.vehicleNumber && data.vehicleNumber.toUpperCase() !== vehicle.vehicleNumber) {
    const existingNumber = await Vehicle.findOne({
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingNumber) {
      throw ApiError.conflict(`Vehicle number "${data.vehicleNumber}" is already in use`);
    }
  }

  // ── Check duplicate engineNumber (if being changed) ──
  if (data.engineNumber) {
    const normalised = data.engineNumber.toUpperCase();
    if (normalised !== vehicle.engineNumber) {
      const existingEngine = await Vehicle.findOne({
        engineNumber: normalised,
        _id: { $ne: id },
      });
      if (existingEngine) {
        throw ApiError.conflict(`Engine number "${data.engineNumber}" is already in use`);
      }
    }
  }

  // ── Check duplicate chassisNumber (if being changed) ──
  if (data.chassisNumber) {
    const normalised = data.chassisNumber.toUpperCase();
    if (normalised !== vehicle.chassisNumber) {
      const existingChassis = await Vehicle.findOne({
        chassisNumber: normalised,
        _id: { $ne: id },
      });
      if (existingChassis) {
        throw ApiError.conflict(`Chassis number "${data.chassisNumber}" is already in use`);
      }
    }
  }

  // Strip undefined/null fields and apply audit trail
  const updatePayload = cleanObject({
    ...data,
    updatedBy: requestingUser._id,
  });

  const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate(VEHICLE_POPULATES);

  return updatedVehicle;
};

// ════════════════════════════════════════
// Delete Vehicle (Soft Delete)
// ════════════════════════════════════════
export const deleteVehicle = async (id, requestingUser) => {
  const vehicle = await Vehicle.findById(id).select('+isDeleted');

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  if (vehicle.isDeleted) {
    throw ApiError.notFound('Vehicle not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, vehicle, 'manage');

  // ── Business Rule: Cannot delete if vehicle is currently In Transit / On Delivery ──
  if (vehicle.status === VEHICLE_STATUSES.IN_TRANSIT || vehicle.availability === 'ON_DELIVERY') {
    throw ApiError.badRequest(
      'Cannot delete a vehicle that is currently on delivery. Please wait until the delivery is completed.'
    );
  }

  // ── Business Rule: Cannot delete if assigned to a driver ──
  if (vehicle.assignedDriver) {
    throw ApiError.badRequest(
      'Cannot delete a vehicle that is currently assigned to a driver. Please unassign the vehicle first.'
    );
  }

  // ── Business Rule: Cannot delete if under maintenance ──
  if (vehicle.status === VEHICLE_STATUSES.MAINTENANCE || vehicle.availability === 'MAINTENANCE') {
    throw ApiError.badRequest(
      'Cannot delete a vehicle that is currently under maintenance. Please update its status first.'
    );
  }

  // Soft delete
  vehicle.isDeleted = true;
  vehicle.deletedAt = new Date();
  vehicle.updatedBy = requestingUser._id;
  await vehicle.save({ validateBeforeSave: false });

  return null;
};

// ════════════════════════════════════════
// Get Available Vehicles (For Assignment)
// ════════════════════════════════════════
export const getAvailableVehicles = async (query = {}, requestingUser) => {
  const filter = buildScopeFilter(requestingUser);

  // If super admin passes client filter
  if (query.client && requestingUser.role === ROLES.SUPER_ADMIN) {
    filter.client = query.client;
  }

  // Optional branch filter
  if (query.branch) {
    filter.branch = query.branch;
  }

  // Optional vehicle type filter
  if (query.vehicleType) {
    filter.vehicleType = query.vehicleType;
  }

  // Active status and available state
  filter.status = VEHICLE_STATUSES.AVAILABLE;
  filter.availability = { $in: ['AVAILABLE', 'available'] };

  // If looking for unassigned vehicles only (e.g. for driver assignment)
  if (query.unassigned === 'true' || query.unassignedOnly === 'true') {
    filter.assignedDriver = null;
  }

  const vehicles = await Vehicle.find(filter)
    .sort({ vehicleNumber: 1 })
    .populate(VEHICLE_POPULATES)
    .lean();

  return vehicles;
};
