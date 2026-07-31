// FleetHub – Authentication Service (Business Logic)
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { env } from '../config/env.js';

/**
 * Build the token pair and persist the refresh token on the user document.
 * @param {object} user – Mongoose user document
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const issueTokens = async (user) => {
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Persist refresh token (hashed storage could be added in production hardening)
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * Sanitise user document for API responses (strip sensitive fields).
 * @param {object} user – Mongoose user document
 * @returns {object} Safe user object
 */
const sanitiseUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// ════════════════════════════════════════
// Register
// ════════════════════════════════════════
export const register = async ({ name, email, phone, password, role }) => {
  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists');
  }

  // Create user (password is hashed by the pre-save hook)
  const user = await User.create({ name, email, phone, password, role });

  // Issue token pair
  const { accessToken, refreshToken } = await issueTokens(user);

  return {
    user: sanitiseUser(user),
    accessToken,
    refreshToken,
  };
};

// ════════════════════════════════════════
// Login
// ════════════════════════════════════════
export const login = async ({ email, password }) => {
  // Explicitly select password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account has been deactivated. Contact support.');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login timestamp
  user.lastLogin = new Date();

  // Issue token pair (also saves the refreshToken & lastLogin)
  const { accessToken, refreshToken } = await issueTokens(user);

  return {
    user: sanitiseUser(user),
    accessToken,
    refreshToken,
  };
};

// ════════════════════════════════════════
// Logout
// ════════════════════════════════════════
export const logout = async (userId) => {
  // Clear the stored refresh token
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// ════════════════════════════════════════
// Refresh Token
// ════════════════════════════════════════
export const refreshAccessToken = async (token) => {
  if (!token) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  // Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Find user and validate stored token matches
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account has been deactivated');
  }

  if (user.refreshToken !== token) {
    // Token reuse detected – invalidate all sessions for safety
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
    throw ApiError.unauthorized('Refresh token has been revoked. Please log in again.');
  }

  // Rotate: issue a fresh pair
  const { accessToken, refreshToken } = await issueTokens(user);

  return { accessToken, refreshToken };
};

// ════════════════════════════════════════
// Get Current User
// ════════════════════════════════════════
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -refreshToken')
    .populate('client', 'name')
    .populate('branch', 'name');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};
