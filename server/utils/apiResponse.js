// FleetHub – Standardized API Response Helper

/**
 * Uniform JSON response envelope used across all endpoints.
 *
 * Success shape  → { success: true,  statusCode, message, data?, meta? }
 * Error shape    → { success: false, statusCode, message, errors? }
 */
class ApiResponse {
  /**
   * @param {number}  statusCode – HTTP status code
   * @param {string}  message    – Human-readable message
   * @param {object}  data       – Payload (omitted when null)
   * @param {object}  meta       – Pagination / extra metadata (omitted when null)
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;

    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  // ────────────────────────────────────────
  // Static helper: send a success response
  // ────────────────────────────────────────

  /**
   * @param {object}  res        – Express response object
   * @param {number}  statusCode – HTTP status code (default 200)
   * @param {string}  message    – Success message
   * @param {object}  data       – Response payload
   * @param {object}  meta       – Pagination / meta info
   */
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const response = new ApiResponse(statusCode, message, data, meta);
    return res.status(statusCode).json(response);
  }

  // ────────────────────────────────────────
  // Static helper: send an error response
  // ────────────────────────────────────────

  /**
   * @param {object}  res        – Express response object
   * @param {number}  statusCode – HTTP status code (default 500)
   * @param {string}  message    – Error message
   * @param {Array}   errors     – Granular validation errors
   */
  static error(res, statusCode = 500, message = 'Internal Server Error', errors = []) {
    const response = {
      success: false,
      statusCode,
      message,
    };

    if (errors.length > 0) response.errors = errors;

    return res.status(statusCode).json(response);
  }

  // ────────────────────────────────────────
  // Convenience shortcuts
  // ────────────────────────────────────────

  /** 200 OK */
  static ok(res, message = 'Success', data = null, meta = null) {
    return ApiResponse.success(res, 200, message, data, meta);
  }

  /** 201 Created */
  static created(res, message = 'Resource created', data = null) {
    return ApiResponse.success(res, 201, message, data);
  }

  /** 204 No Content */
  static noContent(res) {
    return res.status(204).end();
  }
}

export default ApiResponse;
