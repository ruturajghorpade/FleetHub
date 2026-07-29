// FleetHub – Centralized Error Handling Middleware
import ApiError from '../utils/apiError.js';
import { env } from '../config/env.js';

/**
 * 404 handler — catches requests that don't match any route.
 */
export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Not Found – ${req.originalUrl}`));
};

/**
 * Global error handler.
 *
 * Normalises different error types (Mongoose, JWT, Multer, custom ApiError)
 * into a uniform JSON response.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // ── Mongoose: bad ObjectId ─────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found (invalid ID)';
  }

  // ── Mongoose: duplicate key ────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field(s): ${fields}`;
  }

  // ── Mongoose: validation error ─────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
  }

  // ── JWT errors ─────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // ── Multer: file-size error ────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 5 MB.';
  }

  // ── Build response ────────────────────────
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors.length > 0) response.errors = errors;

  // Expose stack trace only in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log server errors for observability
  if (statusCode >= 500) {
    console.error(`[ERROR] ${message}`, err.stack);
  }

  res.status(statusCode).json(response);
};
