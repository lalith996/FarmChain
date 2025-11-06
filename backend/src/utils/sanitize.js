/**
 * Sanitization utilities for input validation and security
 * Prevents ReDoS, NoSQL injection, and other input-based attacks
 */

/**
 * Escape special regex characters to prevent ReDoS attacks
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for regex
 */
const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize user input for MongoDB regex queries
 * Prevents both ReDoS and NoSQL injection
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeForRegex = (input) => {
  if (!input || typeof input !== 'string') return '';

  // Remove MongoDB operators
  const withoutOperators = input.replace(/\$/g, '');

  // Escape regex special characters
  return escapeRegex(withoutOperators);
};

/**
 * Sanitize object to remove MongoDB operators
 * Prevents NoSQL injection attacks
 * @param {*} obj - Object to sanitize
 * @returns {*} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith('$')) {
      continue;
    }

    // Recursively sanitize nested objects
    sanitized[key] = typeof value === 'object' ? sanitizeObject(value) : value;
  }

  return sanitized;
};

/**
 * Validate and sanitize pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} - Validated pagination params
 */
const sanitizePagination = (query) => {
  const page = Math.max(1, Math.min(10000, parseInt(query.page) || 1));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Sanitize sort parameters to prevent injection
 * @param {string} sortParam - Sort parameter from query
 * @param {Array<string>} allowedFields - Allowed field names
 * @param {string} defaultSort - Default sort if invalid
 * @returns {string} - Safe sort string
 */
const sanitizeSort = (sortParam, allowedFields, defaultSort = '-createdAt') => {
  if (!sortParam || typeof sortParam !== 'string') return defaultSort;

  const sortField = sortParam.startsWith('-') ? sortParam.slice(1) : sortParam;

  if (!allowedFields.includes(sortField)) {
    return defaultSort;
  }

  return sortParam;
};

module.exports = {
  escapeRegex,
  sanitizeForRegex,
  sanitizeObject,
  sanitizePagination,
  sanitizeSort,
};
