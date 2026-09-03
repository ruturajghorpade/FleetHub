// FleetHub – Delivery Controller
import * as deliveryService from '../services/deliveryService.js';
import * as assignmentService from '../services/assignmentService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/deliveries
export const getDeliveries = asyncHandler(async (req, res) => {
  const result = await deliveryService.getDeliveries(req.query, req.user);
  return ApiResponse.ok(res, 'Deliveries retrieved successfully', { deliveries: result.deliveries }, result.pagination);
});

// GET /api/v1/deliveries/:id
export const getDelivery = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.getDeliveryById(req.params.id, req.user);
  return ApiResponse.ok(res, 'Delivery retrieved successfully', { delivery });
});

// POST /api/v1/deliveries
export const createDelivery = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.createDelivery(req.body, req.user);
  return ApiResponse.created(res, 'Delivery request created successfully', { delivery });
});

// POST /api/v1/deliveries/:id/assign
export const manualAssignDelivery = asyncHandler(async (req, res) => {
  const delivery = await assignmentService.manualAssignDelivery(
    req.params.id,
    { driverId: req.body.driverId, vehicleId: req.body.vehicleId },
    req.user
  );
  return ApiResponse.ok(res, 'Driver and vehicle assigned successfully', { delivery });
});

// POST /api/v1/deliveries/:id/auto-assign
export const autoAssignDelivery = asyncHandler(async (req, res) => {
  const delivery = await assignmentService.autoAssignDelivery(req.params.id, req.user);
  return ApiResponse.ok(res, 'Delivery auto-assigned successfully', { delivery });
});

// PATCH /api/v1/deliveries/:id/status
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.updateDeliveryStatus(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, 'Delivery status updated successfully', { delivery });
});

// POST /api/v1/deliveries/:id/cancel
export const cancelDelivery = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.cancelDelivery(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, 'Delivery cancelled successfully', { delivery });
});
