// FleetHub – Report Controller
import * as reportService from '../services/reportService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDailyDeliveries = asyncHandler(async (_req, res) => {
  const data = await reportService.getDailyDeliveriesReport();
  return ApiResponse.ok(res, 'Daily deliveries report retrieved', { report: data });
});

export const getRestaurantReport = asyncHandler(async (_req, res) => {
  const data = await reportService.getRestaurantReport();
  return ApiResponse.ok(res, 'Restaurant report retrieved', { report: data });
});

export const getDriverReport = asyncHandler(async (_req, res) => {
  const data = await reportService.getDriverReport();
  return ApiResponse.ok(res, 'Driver report retrieved', { report: data });
});

export const getVehicleUsageReport = asyncHandler(async (_req, res) => {
  const data = await reportService.getVehicleUsageReport();
  return ApiResponse.ok(res, 'Vehicle usage report retrieved', { report: data });
});

export const getCancelledDeliveries = asyncHandler(async (_req, res) => {
  const data = await reportService.getCancelledDeliveriesReport();
  return ApiResponse.ok(res, 'Cancelled deliveries report retrieved', { report: data });
});
