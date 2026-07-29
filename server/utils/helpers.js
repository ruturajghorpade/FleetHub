// FleetHub – Server-Side Helper Utilities

/**
 * Remove undefined/null fields from an object
 * Useful for building update payloads
 */
export const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
};

/**
 * Generate a random alphanumeric string
 * @param {number} length
 */
export const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Build a MongoDB filter from query string search fields
 * @param {object} query - Express req.query
 * @param {string[]} searchFields - Fields to search in
 */
export const buildSearchFilter = (query, searchFields = []) => {
  const filter = {};

  if (query.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: 'i' },
    }));
  }

  if (query.status) filter.status = query.status;
  if (query.client) filter.client = query.client;

  return filter;
};
