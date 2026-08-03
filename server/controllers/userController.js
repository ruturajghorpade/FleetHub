// FleetHub – User Controller (Thin Layer)
import * as userService from '../services/userService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ════════════════════════════════════════
// POST /api/v1/users
// ════════════════════════════════════════
export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user);

  return ApiResponse.created(res, 'User created successfully', { user });
});

// ════════════════════════════════════════
// GET /api/v1/users
// ════════════════════════════════════════
export const getUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.getUsers(req.query, req.user);

  return ApiResponse.ok(res, 'Users retrieved successfully', { users }, meta);
});

// ════════════════════════════════════════
// GET /api/v1/users/:id
// ════════════════════════════════════════
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.user);

  return ApiResponse.ok(res, 'User retrieved successfully', { user });
});

// ════════════════════════════════════════
// PUT /api/v1/users/:id
// ════════════════════════════════════════
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);

  return ApiResponse.ok(res, 'User updated successfully', { user });
});

// ════════════════════════════════════════
// DELETE /api/v1/users/:id
// ════════════════════════════════════════
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user);

  return ApiResponse.ok(res, 'User deleted successfully');
});

// ════════════════════════════════════════
// PATCH /api/v1/users/:id/activate
// ════════════════════════════════════════
export const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.activateUser(req.params.id, req.user);

  return ApiResponse.ok(res, 'User activated successfully', { user });
});

// ════════════════════════════════════════
// PATCH /api/v1/users/:id/deactivate
// ════════════════════════════════════════
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id, req.user);

  return ApiResponse.ok(res, 'User deactivated successfully', { user });
});

// ════════════════════════════════════════
// PATCH /api/v1/users/:id/role
// ════════════════════════════════════════
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body, req.user);

  return ApiResponse.ok(res, 'User role updated successfully', { user });
});

// ════════════════════════════════════════
// PATCH /api/v1/users/:id/reset-password
// ════════════════════════════════════════
export const resetUserPassword = asyncHandler(async (req, res) => {
  await userService.resetUserPassword(req.params.id, req.body, req.user);

  return ApiResponse.ok(res, 'User password reset successfully');
});
