// FleetHub – Driver Service (Business Logic)
import Driver from '../models/Driver.js';
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import Vehicle from '../models/Vehicle.js';
import ApiError from '../utils/apiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { cleanObject } from '../utils/helpers.js';
import { ROLES, DRIVER_STATUSES } from '../utils/constants.js';

// ════════════════════════════════════════
// Populate options (reusable)
// ════════════════════════════════════════
const DRIVER_POPULATES = [
  { path: 'client', select: 'companyName companyCode' },
  { path: 'branch', select: 'branchName branchCode' },
  { path: 'user', select: 'name email role' },
  { path: 'assignedVehicle', select: 'vehicleNumber vehicleType brand model status' },
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
    // Only own driver profile (linked via user field)
    filter.user = requestingUser._id;
    return filter;
  }

  return filter;
};

/**
 * Enforce scope-based access for single-driver operations.
 * Ensures the requesting user has visibility over the target driver.
 */
const enforceScopeAccess = (requestingUser, driver, action = 'manage') => {
  const role = requestingUser.role;

  // SUPER_ADMIN → unrestricted
  if (role === ROLES.SUPER_ADMIN) return;

  // CLIENT_ADMIN → driver must belong to the same client
  if (role === ROLES.CLIENT_ADMIN) {
    const reqClient = requestingUser.client?.toString();
    const driverClient = driver.client?._id?.toString() || driver.client?.toString();
    if (!reqClient || reqClient !== driverClient) {
      throw ApiError.forbidden('You can only manage drivers within your own client');
    }
    return;
  }

  // BRANCH_MANAGER → driver must belong to the same branch
  if (role === ROLES.BRANCH_MANAGER) {
    const reqBranch = requestingUser.branch?.toString();
    const driverBranch = driver.branch?._id?.toString() || driver.branch?.toString();
    if (!reqBranch || reqBranch !== driverBranch) {
      throw ApiError.forbidden('You can only manage drivers within your own branch');
    }
    return;
  }

  // DISPATCHER → read-only access; block write actions
  if (role === ROLES.DISPATCHER) {
    if (action !== 'read') {
      throw ApiError.forbidden('Dispatchers have read-only access to drivers');
    }
    const reqClient = requestingUser.client?.toString();
    const driverClient = driver.client?._id?.toString() || driver.client?.toString();
    if (!reqClient || reqClient !== driverClient) {
      throw ApiError.forbidden('You can only view drivers within your own client');
    }
    return;
  }

  // DRIVER → can only view own profile
  if (role === ROLES.DRIVER) {
    if (action !== 'read') {
      throw ApiError.forbidden('Drivers have read-only access');
    }
    const userId = requestingUser._id.toString();
    const linkedUser = driver.user?._id?.toString() || driver.user?.toString();
    if (userId !== linkedUser) {
      throw ApiError.forbidden('Drivers can only view their own profile');
    }
    return;
  }

  throw ApiError.forbidden('Insufficient permissions');
};

// ════════════════════════════════════════
// Create Driver
// ════════════════════════════════════════
export const createDriver = async (data, requestingUser) => {
  const reqRole = requestingUser.role;

  // ── Role-based scoping ───────────────
  if (reqRole === ROLES.CLIENT_ADMIN) {
    data.client = requestingUser.client;
  }

  if (reqRole === ROLES.BRANCH_MANAGER) {
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

  // ── Check branch's driver limit ──────
  const driverCount = await Driver.countDocuments({ branch: data.branch });
  if (driverCount >= branch.maxDrivers) {
    throw ApiError.badRequest(
      `Driver limit reached. Branch "${branch.branchName}" allows a maximum of ${branch.maxDrivers} drivers.`
    );
  }

  // ── Check duplicate employeeId ───────
  const existingEmpId = await Driver.findOne({ employeeId: data.employeeId.toUpperCase() });
  if (existingEmpId) {
    throw ApiError.conflict(`Employee ID "${data.employeeId}" is already in use`);
  }

  // ── Check duplicate licenseNumber ────
  const existingLicense = await Driver.findOne({ licenseNumber: data.licenseNumber.toUpperCase() });
  if (existingLicense) {
    throw ApiError.conflict(`License number "${data.licenseNumber}" is already in use`);
  }

  // ── Business Rule: License expiry must be after issue date ──
  if (data.licenseIssueDate && data.licenseExpiryDate) {
    const issueDate = new Date(data.licenseIssueDate);
    const expiryDate = new Date(data.licenseExpiryDate);
    if (expiryDate <= issueDate) {
      throw ApiError.badRequest('License expiry date must be after the issue date');
    }
  }

  // ── Validate assigned vehicle (if provided) ──
  if (data.assignedVehicle) {
    await validateVehicleAssignment(data.assignedVehicle, null);
  }

  const driver = await Driver.create({
    ...data,
    createdBy: requestingUser._id,
    updatedBy: requestingUser._id,
  });

  // Populate references before returning
  await driver.populate(DRIVER_POPULATES);

  return driver;
};

// ════════════════════════════════════════
// Get All Drivers (search, filter, sort, pagination)
// ════════════════════════════════════════
export const getDrivers = async (query, requestingUser) => {
  const { page, limit, skip, sort } = getPagination(query);

  // Start with scope-based filter
  const filter = buildScopeFilter(requestingUser);

  // ── Text Search ──────────────────────
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { employeeId: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { phone: searchRegex },
      { licenseNumber: searchRegex },
      { email: searchRegex },
    ];
  }

  // ── Field Filters ────────────────────
  if (query.client) filter.client = query.client;
  if (query.branch) filter.branch = query.branch;
  if (query.status) filter.status = query.status;
  if (query.assignedVehicle) filter.assignedVehicle = query.assignedVehicle;

  const [drivers, total] = await Promise.all([
    Driver.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(DRIVER_POPULATES)
      .lean({ virtuals: true }),
    Driver.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { drivers, meta };
};

// ════════════════════════════════════════
// Get Driver by ID
// ════════════════════════════════════════
export const getDriverById = async (id, requestingUser) => {
  const driver = await Driver.findById(id).populate(DRIVER_POPULATES);

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, driver, 'read');

  return driver;
};

// ════════════════════════════════════════
// Update Driver
// ════════════════════════════════════════
export const updateDriver = async (id, data, requestingUser) => {
  const driver = await Driver.findById(id);

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, driver, 'manage');

  // ── If changing client, verify new client exists ──
  if (data.client && data.client.toString() !== driver.client.toString()) {
    const newClient = await Client.findById(data.client);
    if (!newClient) {
      throw ApiError.notFound('Target client not found');
    }
  }

  // ── If changing branch, verify it exists and belongs to client ──
  if (data.branch && data.branch.toString() !== driver.branch.toString()) {
    const newBranch = await Branch.findById(data.branch);
    if (!newBranch) {
      throw ApiError.notFound('Target branch not found');
    }
    const effectiveClient = data.client || driver.client;
    if (newBranch.client.toString() !== effectiveClient.toString()) {
      throw ApiError.badRequest('Branch does not belong to the specified client');
    }
  }

  // ── Check duplicate employeeId (if being changed) ──
  if (data.employeeId && data.employeeId.toUpperCase() !== driver.employeeId) {
    const existingEmpId = await Driver.findOne({
      employeeId: data.employeeId.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingEmpId) {
      throw ApiError.conflict(`Employee ID "${data.employeeId}" is already in use`);
    }
  }

  // ── Check duplicate licenseNumber (if being changed) ──
  if (data.licenseNumber && data.licenseNumber.toUpperCase() !== driver.licenseNumber) {
    const existingLicense = await Driver.findOne({
      licenseNumber: data.licenseNumber.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingLicense) {
      throw ApiError.conflict(`License number "${data.licenseNumber}" is already in use`);
    }
  }

  // ── Business Rule: License expiry must be after issue date ──
  const effectiveIssue = data.licenseIssueDate || driver.licenseIssueDate;
  const effectiveExpiry = data.licenseExpiryDate || driver.licenseExpiryDate;
  if (effectiveIssue && effectiveExpiry) {
    const issueDate = new Date(effectiveIssue);
    const expiryDate = new Date(effectiveExpiry);
    if (expiryDate <= issueDate) {
      throw ApiError.badRequest('License expiry date must be after the issue date');
    }
  }

  // ── Validate assigned vehicle change ──
  if (data.assignedVehicle !== undefined) {
    if (data.assignedVehicle) {
      await validateVehicleAssignment(data.assignedVehicle, id);
    }
    // If clearing assignment (null), allow it
  }

  // Strip undefined/null fields and apply audit trail
  const updatePayload = cleanObject({
    ...data,
    updatedBy: requestingUser._id,
  });

  const updatedDriver = await Driver.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate(DRIVER_POPULATES);

  return updatedDriver;
};

// ════════════════════════════════════════
// Delete Driver (Soft Delete)
// ════════════════════════════════════════
export const deleteDriver = async (id, requestingUser) => {
  const driver = await Driver.findById(id).select('+isDeleted');

  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  if (driver.isDeleted) {
    throw ApiError.notFound('Driver not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, driver, 'manage');

  // ── Business Rule: Cannot delete if driver is currently On Duty ──
  if (driver.status === DRIVER_STATUSES.ON_DUTY) {
    throw ApiError.badRequest(
      'Cannot delete a driver who is currently on duty. Please wait until the active delivery is completed.'
    );
  }

  // Soft delete
  driver.isDeleted = true;
  driver.deletedAt = new Date();
  driver.updatedBy = requestingUser._id;
  await driver.save({ validateBeforeSave: false });

  return null;
};

// ════════════════════════════════════════
// Assign Vehicle to Driver
// ════════════════════════════════════════
export const assignVehicle = async (driverId, vehicleId, requestingUser) => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, driver, 'manage');

  // Validate vehicle assignment
  await validateVehicleAssignment(vehicleId, driverId);

  driver.assignedVehicle = vehicleId;
  driver.updatedBy = requestingUser._id;
  await driver.save({ validateBeforeSave: false });

  await driver.populate(DRIVER_POPULATES);

  return driver;
};

// ════════════════════════════════════════
// Remove Assigned Vehicle from Driver
// ════════════════════════════════════════
export const removeAssignedVehicle = async (driverId, requestingUser) => {
  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, driver, 'manage');

  if (!driver.assignedVehicle) {
    throw ApiError.badRequest('This driver does not have an assigned vehicle');
  }

  driver.assignedVehicle = null;
  driver.updatedBy = requestingUser._id;
  await driver.save({ validateBeforeSave: false });

  await driver.populate(DRIVER_POPULATES);

  return driver;
};

// ════════════════════════════════════════
// Internal: Validate Vehicle Assignment
// ════════════════════════════════════════

/**
 * Ensures the target vehicle exists and is not already assigned
 * to another active driver.
 *
 * @param {string} vehicleId  – Vehicle ObjectId to assign
 * @param {string|null} currentDriverId – Current driver ID (excluded from duplicate check)
 */
const validateVehicleAssignment = async (vehicleId, currentDriverId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  // Check if vehicle is already assigned to another active driver
  const assignedDriverFilter = {
    assignedVehicle: vehicleId,
    status: { $nin: [DRIVER_STATUSES.INACTIVE, DRIVER_STATUSES.SUSPENDED] },
  };

  // Exclude current driver from the check (for updates)
  if (currentDriverId) {
    assignedDriverFilter._id = { $ne: currentDriverId };
  }

  const existingAssignment = await Driver.findOne(assignedDriverFilter);
  if (existingAssignment) {
    throw ApiError.conflict(
      `Vehicle "${vehicle.vehicleNumber}" is already assigned to driver "${existingAssignment.employeeId}"`
    );
  }
};
