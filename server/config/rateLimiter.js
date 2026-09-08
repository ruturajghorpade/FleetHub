// FleetHub – Rate Limiter Configuration
import rateLimit from 'express-rate-limit';
import { env } from './env.js';

/**
 * General API rate limiter.
 * Applied globally to all `/api` routes.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 5000 : env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,  // Return `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  // Use the default in-memory store; swap for redis-store in production at scale
});

/**
 * Stricter rate limiter for authentication endpoints (login, register, etc.).
 * Will be mounted on auth routes in a later phase.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
