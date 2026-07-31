// FleetHub – Branch Controller (Thin Layer)
import * as branchService from '../services/branchService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ════════════════════════════════════════
// POST /api/v1/branches
// ════════════════════════════════════════
export const createBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.createBranch(req.body, req.user._id);

  return ApiResponse.created(res, 'Branch created successfully', { branch });
});

// ════════════════════════════════════════
// GET /api/v1/branches
// ════════════════════════════════════════
export const getBranches = asyncHandler(async (req, res) => {
  const { branches, meta } = await branchService.getBranches(req.query);

  return ApiResponse.ok(res, 'Branches retrieved successfully', { branches }, meta);
});

// ════════════════════════════════════════
// GET /api/v1/branches/:id
// ════════════════════════════════════════
export const getBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.id);

  return ApiResponse.ok(res, 'Branch retrieved successfully', { branch });
});

// ════════════════════════════════════════
// PUT /api/v1/branches/:id
// ════════════════════════════════════════
export const updateBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.updateBranch(req.params.id, req.body, req.user._id);

  return ApiResponse.ok(res, 'Branch updated successfully', { branch });
});

// ════════════════════════════════════════
// DELETE /api/v1/branches/:id
// ════════════════════════════════════════
export const deleteBranch = asyncHandler(async (req, res) => {
  await branchService.deleteBranch(req.params.id, req.user._id);

  return ApiResponse.ok(res, 'Branch deleted successfully');
});
