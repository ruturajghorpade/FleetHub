// FleetHub – Maintenance Controller
import Maintenance from '../models/Maintenance.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/maintenance
export const getMaintenanceRecords = asyncHandler(async (req, res) => {
  const { vehicle, status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (vehicle) filter.vehicle = vehicle;
  if (status) filter.status = status.toLowerCase();

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Maintenance.countDocuments(filter);

  const records = await Maintenance.find(filter)
    .sort({ maintenanceDate: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('vehicle', 'vehicleNumber model vehicleType')
    .populate('client', 'companyName');

  return ApiResponse.ok(res, 'Maintenance records retrieved successfully', { records }, {
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/v1/maintenance/:id
export const getMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id)
    .populate('vehicle', 'vehicleNumber model vehicleType')
    .populate('client', 'companyName');

  if (!record) {
    throw ApiError.notFound('Maintenance record not found');
  }

  return ApiResponse.ok(res, 'Maintenance record retrieved successfully', { record });
});

// POST /api/v1/maintenance
export const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const {
    vehicle,
    client,
    maintenanceType,
    title,
    description,
    cost,
    status,
    odometer,
    serviceCenter,
    performedBy,
    maintenanceDate,
    nextMaintenanceDate,
  } = req.body;

  if (!vehicle || !title) {
    throw ApiError.badRequest('Vehicle and title are required');
  }

  const record = await Maintenance.create({
    vehicle,
    client: client || null,
    maintenanceType: maintenanceType || 'routine',
    title,
    description,
    cost: cost || 0,
    status: status || 'scheduled',
    odometer: odometer || 0,
    serviceCenter,
    performedBy,
    maintenanceDate: maintenanceDate || Date.now(),
    nextMaintenanceDate,
    createdBy: req.user._id,
  });

  const populated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model vehicleType')
    .populate('client', 'companyName');

  return ApiResponse.created(res, 'Maintenance record created successfully', { record: populated });
});

// PUT /api/v1/maintenance/:id
export const updateMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id);

  if (!record) {
    throw ApiError.notFound('Maintenance record not found');
  }

  Object.assign(record, req.body);

  if (req.body.status === 'completed' && !record.completedDate) {
    record.completedDate = new Date();
  }

  await record.save();

  const updated = await Maintenance.findById(record._id)
    .populate('vehicle', 'vehicleNumber model vehicleType')
    .populate('client', 'companyName');

  return ApiResponse.ok(res, 'Maintenance record updated successfully', { record: updated });
});

// DELETE /api/v1/maintenance/:id
export const deleteMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id);

  if (!record) {
    throw ApiError.notFound('Maintenance record not found');
  }

  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  return ApiResponse.ok(res, 'Maintenance record deleted successfully');
});
