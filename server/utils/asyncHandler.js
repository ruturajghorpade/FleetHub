// FleetHub – Async Handler Wrapper
// Eliminates try/catch blocks in async route handlers

/**
 * Wraps an async function and passes errors to next()
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
