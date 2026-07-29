// FleetHub – Pagination Utility

/**
 * Build pagination from query parameters
 * @param {object} query - Express req.query
 * @returns {{ skip: number, limit: number, page: number, sort: object }}
 */
export const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  // Sort: e.g., "createdAt" or "-createdAt" for descending
  let sort = { createdAt: -1 }; // Default: newest first
  if (query.sort) {
    const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
    const sortOrder = query.sort.startsWith('-') ? -1 : 1;
    sort = { [sortField]: sortOrder };
  }

  return { page, limit, skip, sort };
};

/**
 * Build pagination meta for API response
 * @param {number} total - Total documents count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
