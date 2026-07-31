// FleetHub – JWT Token Generation Utilities
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate a short-lived access token.
 * @param {object} payload – Data to encode (typically { id, role })
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

/**
 * Generate a long-lived refresh token.
 * @param {object} payload – Data to encode (typically { id })
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE,
  });
};
