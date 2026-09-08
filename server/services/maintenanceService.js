// FleetHub – Maintenance Service (Food Delivery Fleet Logistics)
import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import Delivery from '../models/Delivery.js';
import ApiError from '../utils/apiError.js';
import { ROLES, VEHICLE_STATUSES, VEHICLE_AVAILABILITY } from '../utils/constants.js';
import { notifyOnMaintenance } from './notificationService.js';
import { createAuditLog, getAuditLogsForEntity } from './auditService.js';

const ACTIVE_DELIVERY_STATUSES = ['assigned', 'picked_up', 'out_for_delivery'];

/**
 * Verify tenant access to a maintenance record
 */
const verifyTenantAccess = (record, user) => {
  if (!user || user.role === ROLES.SUPER_ADMIN || user.role === 'admin' || user.role === ROLES.DISPATCHER) {
    return;
  }
  if (user.role === ROLES.CLIENT_ADMIN && user.client) {
    const recordClient = record.client?._id || record.client;
    if (recordClient && recordClient.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to access maintenance records for another restaurant client.');
    }
  }
};

/**
 * Get paginated maintenance records with multi-tenant scoping, search & status filters
 */
export const getMaintenanceRecords = async (query = {}, user) => {
  const {
    vehicle,
    status,
    type,
    branch,
    client,
    search,
    page = 1,
    limit = 20,
    startDate,
    endDate,
  } = query;

  const filter = {};

  // 1. Multi-Tenant Scoping
  if (user?.role === ROLES.CLIENT_ADMIN && user.client) {
    filter.client = user.client;
  } else if (client) {
    filter.client = client;
  }

  if (branch) {
    filter.branch = branch;
  }

  if (vehicle) {
    filter.vehicle = vehicle;
  }

  if (type && type !== 'all') {
    filter.maintenanceType = type.toLowerCase();
  }

  // 2. Status & Overdue Filtering
  const now = new Date();
  if (status && status !== 'all') {
    const s = status.toLowerCase();
    if (s === 'overdue') {
      filter.status = 'scheduled';
      filter.$or = [
        { scheduledDate: { $lt: now } },
        { maintenanceDate: { $lt: now } },
      ];
    } else {
      filter.status = s;
    }
  }

  // 3. Date Range Filter
  if (startDate || endDate) {
    filter.scheduledDate = {};
    if (startDate) filter.scheduledDate.$gte = new Date(startDate);
    if (endDate) filter.scheduledDate.$lte = new Date(endDate);
  }

  // 4. Text Search
  if (search && search.trim()) {
    const q = search.trim();
    // Find matching vehicle IDs
    const matchingVehicles = await Vehicle.find({
      vehicleNumber: { $regex: q, $options: 'i' },
      ...(filter.client && { client: filter.client }),
    }).select('_id');

    const vehicleIds = matchingVehicles.map((v) => v._id);

    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { serviceCenter: { $regex: q, $options: 'i' } },
      { serviceProvider: { $regex: q, $options: 'i' } },
      { vehicle: { $in: vehicleIds } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  // Query records and summary counts in parallel
  const [total, records, baseSummary] = await Promise.all([
    Maintenance.countDocuments(filter),
    Maintenance.find(filter)
      .sort({ scheduledDate: -1, maintenanceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('vehicle', 'vehicleNumber model brand vehicleType status availability')
      .populate('client', 'companyName businessType')
      .populate('branch', 'branchName branchCode')
      .populate('createdBy', 'name email role'),
    Maintenance.aggregate([
      { $match: { ...(filter.client && { client: filter.client }), isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' },
        },
      },
    ]),
  ]);

  // Aggregate KPI summary for the tenant
  let scheduledCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let totalCost = 0;

  for (const item of baseSummary) {
    const s = (item._id || '').toLowerCase();
    totalCost += item.totalCost || 0;
    if (s === 'scheduled') scheduledCount += item.count;
    else if (s === 'in_progress') inProgressCount += item.count;
    else if (s === 'completed') completedCount += item.count;
    else if (s === 'cancelled') cancelledCount += item.count;
  }

  // Count overdue scheduled items
  const overdueCount = await Maintenance.countDocuments({
    ...(filter.client && { client: filter.client }),
    status: 'scheduled',
    $or: [
      { scheduledDate: { $lt: now } },
      { maintenanceDate: { $lt: now } },
    ],
  });

  return {
    records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
    summary: {
      totalRecords: scheduledCount + inProgressCount + completedCount + cancelledCount,
      scheduled: scheduledCount,
      inProgress: inProgressCount,
      completed: completedCount,
      cancelled: cancelledCount,
      overdue: overdueCount,
      totalCost,
    },
  };
};

/**
 * Get single maintenance record by ID with tenant security check
 */
export const getMaintenanceRecordById = async (id, user) => {
  const record = await Maintenance.findById(id)
    .populate('vehicle', 'vehicleNumber model brand vehicleType status availability fuelType registrationDate insuranceExpiry')
    .populate('client', 'companyName email phone businessType address')
    .populate('branch', 'branchName branchCode address phone')
    .populate('createdBy', 'name email role');

  if (!record || record.isDeleted) {
    throw ApiError.notFound('Maintenance record not found');
  }

  verifyTenantAccess(record, user);

  // Fetch recent audit logs for this record
  const auditLogs = await getAuditLogsForEntity('Maintenance', record._id);

  const recordObj = record.toJSON();
  recordObj.auditLogs = auditLogs;
  return recordObj;
};

/**
 * Create a new maintenance record
 */
export const createMaintenance = async (data, user) => {
  const {
    vehicle: vehicleId,
    title,
    description,
    maintenanceType = 'routine',
    serviceType,
    cost = 0,
    estimatedCost,
    actualCost,
    status = 'scheduled',
    odometer = 0,
    serviceCenter,
    serviceProvider,
    performedBy,
    scheduledDate,
    maintenanceDate,
    nextMaintenanceDate,
    notes,
  } = data;

  if (!vehicleId) {
    throw ApiError.badRequest('Vehicle is required to schedule maintenance.');
  }

  const finalTitle = (title || description || `${(serviceType || maintenanceType || 'Routine').replace(/_/g, ' ')} Service`).trim();
  const finalType = (serviceType || maintenanceType || 'routine').toLowerCase();
  const finalCost = Number(actualCost ?? cost ?? estimatedCost) || 0;

  const vehicleDoc = await Vehicle.findById(vehicleId);
  if (!vehicleDoc || vehicleDoc.isDeleted) {
    throw ApiError.notFound('Vehicle not found or has been deactivated.');
  }

  // Tenant security: Client Admin can only create for their own client's vehicle
  if (user?.role === ROLES.CLIENT_ADMIN && user.client) {
    if (vehicleDoc.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to schedule maintenance for vehicles belonging to another client.');
    }
  }

  const initialStatus = (status || 'scheduled').toLowerCase();

  // If created immediately with in_progress status, check active delivery protection
  if (initialStatus === 'in_progress') {
    const activeDelivery = await Delivery.findOne({
      assignedVehicle: vehicleDoc._id,
      status: { $in: ACTIVE_DELIVERY_STATUSES },
    });
    if (activeDelivery) {
      throw ApiError.badRequest(
        `Vehicle cannot enter maintenance while it has an active delivery (#${activeDelivery.orderId}).`
      );
    }
    // Set vehicle under maintenance
    vehicleDoc.status = VEHICLE_STATUSES.MAINTENANCE;
    vehicleDoc.availability = VEHICLE_AVAILABILITY.MAINTENANCE;
    await vehicleDoc.save();
  }

  const record = await Maintenance.create({
    vehicle: vehicleDoc._id,
    client: vehicleDoc.client,
    branch: vehicleDoc.branch || data.branch || null,
    maintenanceType: finalType,
    title: finalTitle,
    description: description ? description.trim() : null,
    cost: finalCost,
    status: initialStatus,
    odometer: Number(odometer) || vehicleDoc.odometer || 0,
    serviceCenter: serviceCenter || serviceProvider || null,
    serviceProvider: serviceProvider || serviceCenter || null,
    performedBy: performedBy || null,
    maintenanceDate: maintenanceDate || scheduledDate || new Date(),
    scheduledDate: scheduledDate || maintenanceDate || new Date(),
    startedDate: initialStatus === 'in_progress' ? new Date() : null,
    nextMaintenanceDate: nextMaintenanceDate || null,
    notes: notes || description || null,
    createdBy: user?._id || null,
  });

  const populated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model brand vehicleType status availability')
    .populate('client', 'companyName')
    .populate('branch', 'branchName branchCode');

  // Trigger notification
  notifyOnMaintenance(populated, initialStatus === 'in_progress' ? 'STARTED' : 'SCHEDULED').catch(() => {});

  // Record audit log
  createAuditLog({
    user,
    action: 'MAINTENANCE_CREATED',
    entity: 'Maintenance',
    entityId: record._id,
    description: `Scheduled ${maintenanceType} maintenance "${title}" for vehicle ${vehicleDoc.vehicleNumber}.`,
    details: {
      status: initialStatus,
      cost,
      vehicleNumber: vehicleDoc.vehicleNumber,
      scheduledDate: record.scheduledDate,
    },
    client: vehicleDoc.client,
    branch: vehicleDoc.branch,
  });

  return populated;
};

/**
 * Update an existing maintenance record
 */
export const updateMaintenance = async (id, data, user) => {
  const record = await Maintenance.findById(id);
  if (!record || record.isDeleted) {
    throw ApiError.notFound('Maintenance record not found');
  }

  verifyTenantAccess(record, user);

  // Prevent changing to an unauthorized vehicle
  if (data.vehicle && data.vehicle.toString() !== record.vehicle.toString()) {
    const targetVehicle = await Vehicle.findById(data.vehicle);
    if (!targetVehicle || targetVehicle.isDeleted) {
      throw ApiError.notFound('Target vehicle not found');
    }
    if (user?.role === ROLES.CLIENT_ADMIN && user.client) {
      if (targetVehicle.client.toString() !== user.client.toString()) {
        throw ApiError.forbidden('Cannot reassign maintenance to another restaurant client vehicle.');
      }
    }
    record.vehicle = targetVehicle._id;
    record.client = targetVehicle.client;
    record.branch = targetVehicle.branch || null;
  }

  if (data.title) record.title = data.title.trim();
  if (data.description !== undefined) record.description = data.description;
  if (data.maintenanceType) record.maintenanceType = data.maintenanceType.toLowerCase();
  if (data.cost !== undefined) record.cost = Number(data.cost) || 0;
  if (data.odometer !== undefined) record.odometer = Number(data.odometer) || 0;
  if (data.serviceCenter !== undefined) record.serviceCenter = data.serviceCenter;
  if (data.serviceProvider !== undefined) record.serviceProvider = data.serviceProvider;
  if (data.performedBy !== undefined) record.performedBy = data.performedBy;
  if (data.scheduledDate) record.scheduledDate = new Date(data.scheduledDate);
  if (data.maintenanceDate) record.maintenanceDate = new Date(data.maintenanceDate);
  if (data.nextMaintenanceDate !== undefined) record.nextMaintenanceDate = data.nextMaintenanceDate;
  if (data.notes !== undefined) record.notes = data.notes;

  await record.save();

  const updated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model brand vehicleType status availability')
    .populate('client', 'companyName')
    .populate('branch', 'branchName branchCode');

  createAuditLog({
    user,
    action: 'MAINTENANCE_UPDATED',
    entity: 'Maintenance',
    entityId: record._id,
    description: `Updated maintenance record for vehicle ${updated.vehicle?.vehicleNumber || 'vehicle'}.`,
    details: data,
    client: record.client,
    branch: record.branch,
  });

  return updated;
};

/**
 * Start maintenance (transitions status to in_progress & marks vehicle unavailable)
 */
export const startMaintenance = async (id, user) => {
  const record = await Maintenance.findById(id).populate('vehicle');
  if (!record || record.isDeleted) {
    throw ApiError.notFound('Maintenance record not found');
  }

  verifyTenantAccess(record, user);

  if (record.status === 'in_progress') {
    return record; // Already in progress
  }

  if (record.status === 'completed' || record.status === 'cancelled') {
    throw ApiError.badRequest(`Cannot start maintenance that has already been ${record.status}.`);
  }

  const vehicleDoc = await Vehicle.findById(record.vehicle._id || record.vehicle);
  if (!vehicleDoc || vehicleDoc.isDeleted) {
    throw ApiError.notFound('Associated vehicle not found.');
  }

  // Active Delivery Protection Check
  const activeDelivery = await Delivery.findOne({
    assignedVehicle: vehicleDoc._id,
    status: { $in: ACTIVE_DELIVERY_STATUSES },
  });

  if (activeDelivery) {
    throw ApiError.badRequest(
      `Vehicle cannot enter maintenance while it has an active delivery (#${activeDelivery.orderId}).`
    );
  }

  // Mark vehicle under maintenance
  vehicleDoc.status = VEHICLE_STATUSES.MAINTENANCE;
  vehicleDoc.availability = VEHICLE_AVAILABILITY.MAINTENANCE;
  await vehicleDoc.save();

  record.status = 'in_progress';
  record.startedDate = new Date();
  await record.save();

  const populated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model brand vehicleType status availability')
    .populate('client', 'companyName')
    .populate('branch', 'branchName branchCode');

  // Trigger notifications
  notifyOnMaintenance(populated, 'STARTED').catch(() => {});

  // Record audit log
  createAuditLog({
    user,
    action: 'MAINTENANCE_STARTED',
    entity: 'Maintenance',
    entityId: record._id,
    description: `Started maintenance for vehicle ${vehicleDoc.vehicleNumber}. Vehicle set to MAINTENANCE.`,
    details: {
      startedDate: record.startedDate,
      vehicleNumber: vehicleDoc.vehicleNumber,
    },
    client: record.client,
    branch: record.branch,
  });

  return populated;
};

/**
 * Complete maintenance (transitions status to completed & restores vehicle to available)
 */
export const completeMaintenance = async (id, data = {}, user) => {
  const record = await Maintenance.findById(id).populate('vehicle');
  if (!record || record.isDeleted) {
    throw ApiError.notFound('Maintenance record not found');
  }

  verifyTenantAccess(record, user);

  if (record.status === 'completed') {
    return record; // Already completed
  }

  const vehicleDoc = await Vehicle.findById(record.vehicle._id || record.vehicle);
  if (vehicleDoc && !vehicleDoc.isDeleted) {
    // Restore vehicle to available
    vehicleDoc.status = VEHICLE_STATUSES.AVAILABLE;
    vehicleDoc.availability = VEHICLE_AVAILABILITY.AVAILABLE;
    if (data.odometer && Number(data.odometer) > (vehicleDoc.odometer || 0)) {
      vehicleDoc.odometer = Number(data.odometer);
    }
    await vehicleDoc.save();
  }

  record.status = 'completed';
  record.completedDate = data.completedDate ? new Date(data.completedDate) : new Date();
  if (data.actualCost !== undefined || data.cost !== undefined) {
    record.cost = Number(data.actualCost ?? data.cost) || record.cost;
  }
  if (data.odometer !== undefined) record.odometer = Number(data.odometer) || record.odometer;
  if (data.notes) record.notes = data.notes;
  if (data.performedBy) record.performedBy = data.performedBy;
  if (data.nextMaintenanceDate) record.nextMaintenanceDate = new Date(data.nextMaintenanceDate);

  await record.save();

  const populated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model brand vehicleType status availability')
    .populate('client', 'companyName')
    .populate('branch', 'branchName branchCode');

  // Trigger notifications
  notifyOnMaintenance(populated, 'COMPLETED').catch(() => {});

  // Record audit log
  createAuditLog({
    user,
    action: 'MAINTENANCE_COMPLETED',
    entity: 'Maintenance',
    entityId: record._id,
    description: `Completed maintenance for vehicle ${vehicleDoc?.vehicleNumber || 'vehicle'}. Vehicle restored to AVAILABLE.`,
    details: {
      completedDate: record.completedDate,
      finalCost: record.cost,
      notes: record.notes,
    },
    client: record.client,
    branch: record.branch,
  });

  return populated;
};

/**
 * Cancel maintenance
 */
export const cancelMaintenance = async (id, data = {}, user) => {
  const record = await Maintenance.findById(id).populate('vehicle');
  if (!record || record.isDeleted) {
    throw ApiError.notFound('Maintenance record not found');
  }

  verifyTenantAccess(record, user);

  if (record.status === 'completed') {
    throw ApiError.badRequest('Cannot cancel maintenance that has already been completed.');
  }

  // If vehicle was put into maintenance, restore to available
  if (record.status === 'in_progress') {
    const vehicleDoc = await Vehicle.findById(record.vehicle._id || record.vehicle);
    if (vehicleDoc && !vehicleDoc.isDeleted) {
      vehicleDoc.status = VEHICLE_STATUSES.AVAILABLE;
      vehicleDoc.availability = VEHICLE_AVAILABILITY.AVAILABLE;
      await vehicleDoc.save();
    }
  }

  record.status = 'cancelled';
  record.cancellationReason = data.cancellationReason || data.reason || data.notes || 'Cancelled by user';
  await record.save();

  const populated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model brand vehicleType status availability')
    .populate('client', 'companyName')
    .populate('branch', 'branchName branchCode');

  notifyOnMaintenance(populated, 'CANCELLED').catch(() => {});

  createAuditLog({
    user,
    action: 'MAINTENANCE_CANCELLED',
    entity: 'Maintenance',
    entityId: record._id,
    description: `Cancelled maintenance for vehicle ${populated.vehicle?.vehicleNumber || 'vehicle'}. Reason: ${record.cancellationReason}`,
    details: { reason: record.cancellationReason },
    client: record.client,
    branch: record.branch,
  });

  return populated;
};

/**
 * Soft-delete a maintenance record
 */
export const deleteMaintenance = async (id, user) => {
  const record = await Maintenance.findById(id);
  if (!record || record.isDeleted) {
    throw ApiError.notFound('Maintenance record not found');
  }

  verifyTenantAccess(record, user);

  // If currently in progress, restore vehicle
  if (record.status === 'in_progress') {
    const vehicleDoc = await Vehicle.findById(record.vehicle);
    if (vehicleDoc && !vehicleDoc.isDeleted) {
      vehicleDoc.status = VEHICLE_STATUSES.AVAILABLE;
      vehicleDoc.availability = VEHICLE_AVAILABILITY.AVAILABLE;
      await vehicleDoc.save();
    }
  }

  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  createAuditLog({
    user,
    action: 'MAINTENANCE_DELETED',
    entity: 'Maintenance',
    entityId: record._id,
    description: `Deleted maintenance record #${record._id}`,
    client: record.client,
    branch: record.branch,
  });

  return { message: 'Maintenance record deleted successfully' };
};

export default {
  getMaintenanceRecords,
  getMaintenanceRecordById,
  createMaintenance,
  updateMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  deleteMaintenance,
};
