// FleetHub – Role-Based Authorization Middleware
import ApiError from '../utils/apiError.js';

/**
 * Restrict access to specific roles.
 *
 * Usage:
 *   router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN), handler)
 *
 * Must be used AFTER the `protect` middleware (req.user must be set).
 *
 * @param  {...string} allowedRoles – One or more role strings
 * @returns {Function} Express middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authorized – authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role "${req.user.role}" is not authorized to access this resource`
      );
    }

    next();
  };
};
