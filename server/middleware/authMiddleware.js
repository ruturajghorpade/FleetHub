// FleetHub – JWT Authentication Middleware
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

/**
 * Protect routes – verifies JWT from the Authorization header.
 *
 * Expected format:  Authorization: Bearer <token>
 *
 * On success → attaches the authenticated user to `req.user`.
 * On failure → responds with 401 Unauthorized.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized – no token provided');
  }

  // Verify token
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // Load user from database (exclude password, include isActive check)
  const user = await User.findById(decoded.id).select('-password -refreshToken');

  if (!user) {
    throw ApiError.unauthorized('Not authorized – user no longer exists');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account has been deactivated. Contact support.');
  }

  // Attach authenticated user to request
  req.user = user;
  next();
});
