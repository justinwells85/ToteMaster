/**
 * Query Helper Utilities
 * Provides utilities for pagination, sorting, and filtering
 */

/**
 * Parses pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} - Pagination parameters
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Parses sort parameters from request query
 * @param {Object} query - Request query object
 * @param {Array} allowedFields - Fields that can be sorted
 * @param {String} defaultSort - Default sort field
 * @returns {Object} - Sort parameters
 */
export function parseSort(query, allowedFields = [], defaultSort = 'createdAt') {
  let sortBy = query.sortBy || defaultSort;
  let sortOrder = (query.sortOrder || 'desc').toLowerCase();

  // Validate sort field
  if (!allowedFields.includes(sortBy)) {
    sortBy = defaultSort;
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(sortOrder)) {
    sortOrder = 'desc';
  }

  return { sortBy, sortOrder };
}

/**
 * Sorts an array of objects by a field
 * @param {Array} items - Array to sort
 * @param {String} sortBy - Field to sort by
 * @param {String} sortOrder - Sort order (asc/desc)
 * @returns {Array} - Sorted array
 */
export function sortItems(items, sortBy, sortOrder = 'asc') {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // String comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal);
    }

    // Number comparison
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Paginates an array
 * @param {Array} items - Array to paginate
 * @param {Number} offset - Number of items to skip
 * @param {Number} limit - Number of items to return
 * @returns {Array} - Paginated array
 */
export function paginateItems(items, offset, limit) {
  return items.slice(offset, offset + limit);
}

/**
 * Creates pagination metadata
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export function createPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Creates a paginated response
 * @param {Array} items - Items to return
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - Paginated response object
 */
export function createPaginatedResponse(items, total, page, limit) {
  return {
    data: items,
    pagination: createPaginationMeta(total, page, limit),
  };
}
