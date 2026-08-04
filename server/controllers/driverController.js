// FleetHub – Driver Controller (Thin Layer)
import * as driverService from '../services/driverService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ════════════════════════════════════════
// POST /api/v1/drivers
// ════════════════════════════════════════
export const createDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.createDriver(req.body, req.user);

  return ApiResponse.created(res, 'Driver created successfully', { driver });
});

// ════════════════════════════════════════
// GET /api/v1/drivers
// ════════════════════════════════════════
export const getDrivers = asyncHandler(async (req, res) => {
  const { drivers, meta } = await driverService.getDrivers(req.query, req.user);

  return ApiResponse.ok(res, 'Drivers retrieved successfully', { drivers }, meta);
});

// ════════════════════════════════════════
// GET /api/v1/drivers/:id
// ════════════════════════════════════════
export const getDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.getDriverById(req.params.id, req.user);

  return ApiResponse.ok(res, 'Driver retrieved successfully', { driver });
});

// ════════════════════════════════════════
// PUT /api/v1/drivers/:id
// ════════════════════════════════════════
export const updateDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.updateDriver(req.params.id, req.body, req.user);

  return ApiResponse.ok(res, 'Driver updated successfully', { driver });
});

// ════════════════════════════════════════
// DELETE /api/v1/drivers/:id
// ════════════════════════════════════════
export const deleteDriver = asyncHandler(async (req, res) => {
  await driverService.deleteDriver(req.params.id, req.user);

  return ApiResponse.ok(res, 'Driver deleted successfully');
});

// ════════════════════════════════════════
// PATCH /api/v1/drivers/:id/assign-vehicle
// ════════════════════════════════════════
export const assignVehicle = asyncHandler(async (req, res) => {
  const driver = await driverService.assignVehicle(req.params.id, req.body.vehicleId, req.user);

  return ApiResponse.ok(res, 'Vehicle assigned to driver successfully', { driver });
});

// ════════════════════════════════════════
// PATCH /api/v1/drivers/:id/remove-vehicle
// ════════════════════════════════════════
export const removeAssignedVehicle = asyncHandler(async (req, res) => {
  const driver = await driverService.removeAssignedVehicle(req.params.id, req.user);

  return ApiResponse.ok(res, 'Vehicle removed from driver successfully', { driver });
});
