// FleetHub – Vehicle Controller (Thin Layer)
import * as vehicleService from '../services/vehicleService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ════════════════════════════════════════
// POST /api/v1/vehicles
// ════════════════════════════════════════
export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body, req.user);

  return ApiResponse.created(res, 'Vehicle created successfully', { vehicle });
});

// ════════════════════════════════════════
// GET /api/v1/vehicles
// ════════════════════════════════════════
export const getVehicles = asyncHandler(async (req, res) => {
  const { vehicles, meta } = await vehicleService.getVehicles(req.query, req.user);

  return ApiResponse.ok(res, 'Vehicles retrieved successfully', { vehicles }, meta);
});

// ════════════════════════════════════════
// GET /api/v1/vehicles/:id
// ════════════════════════════════════════
export const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id, req.user);

  return ApiResponse.ok(res, 'Vehicle retrieved successfully', { vehicle });
});

// ════════════════════════════════════════
// PUT /api/v1/vehicles/:id
// ════════════════════════════════════════
export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user);

  return ApiResponse.ok(res, 'Vehicle updated successfully', { vehicle });
});

// ════════════════════════════════════════
// DELETE /api/v1/vehicles/:id
// ════════════════════════════════════════
export const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id, req.user);

  return ApiResponse.ok(res, 'Vehicle deleted successfully');
});
