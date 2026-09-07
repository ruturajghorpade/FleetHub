// FleetHub – Dashboard Controller
import * as dashboardService from '../services/dashboardService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user);
  return ApiResponse.ok(res, 'Dashboard statistics retrieved successfully', stats);
});
