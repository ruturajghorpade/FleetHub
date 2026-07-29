// FleetHub – Custom API Error Class

/**
 * Operational error class for predictable, client-facing errors.
 * Extends the native Error with HTTP semantics and convenience factories.
 */
class ApiError extends Error {
  /**
   * @param {string}  message    – Human-readable error description
   * @param {number}  statusCode – HTTP status code (default 500)
   * @param {Array}   errors     – Optional array of granular validation errors
   * @param {string}  stack      – Optional pre-built stack trace
   */
  constructor(message, statusCode = 500, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ────────────────────────────────────────
  // Static factory methods
  // ────────────────────────────────────────

  /** 400 – Bad Request */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(message, 400, errors);
  }

  /** 401 – Unauthorized */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  /** 403 – Forbidden */
  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  /** 404 – Not Found */
  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  /** 409 – Conflict */
  static conflict(message = 'Conflict') {
    return new ApiError(message, 409);
  }

  /** 422 – Unprocessable Entity */
  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(message, 422, errors);
  }

  /** 429 – Too Many Requests */
  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new ApiError(message, 429);
  }

  /** 500 – Internal Server Error */
  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500);
  }
}

export default ApiError;
