// FleetHub – Maintenance Controller (Food Delivery Fleet Logistics)
import * as maintenanceService from '../services/maintenanceService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/maintenance
export const getMaintenanceRecords = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getMaintenanceRecords(req.query, req.user);
  return ApiResponse.ok(
    res,
    'Maintenance records retrieved successfully',
    {
      records: result.records,
      summary: result.summary,
    },
    result.pagination
  );
});

// GET /api/v1/maintenance/:id
export const getMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await maintenanceService.getMaintenanceRecordById(req.params.id, req.user);
  return ApiResponse.ok(res, 'Maintenance record retrieved successfully', { record });
});

// POST /api/v1/maintenance
export const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await maintenanceService.createMaintenance(req.body, req.user);
  return ApiResponse.created(res, 'Maintenance record created successfully', { record });
});

// PUT /api/v1/maintenance/:id
export const updateMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await maintenanceService.updateMaintenance(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, 'Maintenance record updated successfully', { record });
});

// PATCH /api/v1/maintenance/:id/start
export const startMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await maintenanceService.startMaintenance(req.params.id, req.user);
  return ApiResponse.ok(
    res,
    'Maintenance started successfully. Vehicle is now marked under maintenance.',
    { record }
  );
});

// PATCH /api/v1/maintenance/:id/complete
export const completeMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await maintenanceService.completeMaintenance(req.params.id, req.body, req.user);
  return ApiResponse.ok(
    res,
    'Maintenance completed successfully. Vehicle is restored to available fleet.',
    { record }
  );
});

// PATCH /api/v1/maintenance/:id/cancel
export const cancelMaintenanceRecord = asyncHandler(async (req, res) => {
  const record = await maintenanceService.cancelMaintenance(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, 'Maintenance record cancelled successfully', { record });
});

// DELETE /api/v1/maintenance/:id
export const deleteMaintenanceRecord = asyncHandler(async (req, res) => {
  const result = await maintenanceService.deleteMaintenance(req.params.id, req.user);
  return ApiResponse.ok(res, 'Maintenance record deleted successfully', result);
});
