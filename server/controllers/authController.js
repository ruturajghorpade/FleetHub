// FleetHub – Auth Controller (Thin Layer)
import * as authService from '../services/authService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';

// ════════════════════════════════════════
// POST /api/v1/auth/register
// ════════════════════════════════════════
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Enforce safe default role for public registration (prevent privilege escalation)
  const role = ROLES.CLIENT_ADMIN;

  const result = await authService.register({ name, email, phone, password, role });

  return ApiResponse.created(res, 'User registered successfully', {
    user: result.user,
  });
});

// ════════════════════════════════════════
// POST /api/v1/auth/login
// ════════════════════════════════════════
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  return ApiResponse.ok(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// ════════════════════════════════════════
// POST /api/v1/auth/logout
// ════════════════════════════════════════
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  return ApiResponse.ok(res, 'Logged out successfully');
});

// ════════════════════════════════════════
// POST /api/v1/auth/refresh
// ════════════════════════════════════════
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  const result = await authService.refreshAccessToken(token);

  return ApiResponse.ok(res, 'Token refreshed successfully', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// ════════════════════════════════════════
// GET /api/v1/auth/me
// ════════════════════════════════════════
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return ApiResponse.ok(res, 'User profile retrieved', { user });
});
