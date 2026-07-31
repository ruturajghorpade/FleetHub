// FleetHub – Validation Middleware (express-validator runner)
import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

/**
 * Runs after express-validator chains.
 * Collects any validation errors and throws a structured 400 response.
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw ApiError.badRequest('Validation failed', extractedErrors);
  }

  next();
};
