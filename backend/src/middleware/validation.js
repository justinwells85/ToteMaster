/**
 * Validation Middleware
 * Provides middleware functions for validating request data
 */

import { validateItem, sanitizeItem } from '../models/Item.js';
import { validateTote, sanitizeTote } from '../models/Tote.js';

/**
 * Middleware to validate item creation/update requests
 * @param {boolean} isUpdate - Whether this is an update operation
 */
export function validateItemRequest(isUpdate = false) {
  return (req, res, next) => {
    // Sanitize the input first
    const sanitized = sanitizeItem(req.body);

    // Validate the sanitized input
    const validation = validateItem(sanitized, isUpdate);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Attach sanitized data to request for use in controller
    req.validatedData = sanitized;
    next();
  };
}

/**
 * Middleware to validate tote creation/update requests
 * @param {boolean} isUpdate - Whether this is an update operation
 */
export function validateToteRequest(isUpdate = false) {
  return (req, res, next) => {
    // Sanitize the input first
    const sanitized = sanitizeTote(req.body);

    // Validate the sanitized input
    const validation = validateTote(sanitized, isUpdate);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Attach sanitized data to request for use in controller
    req.validatedData = sanitized;
    next();
  };
}

/**
 * Middleware to validate ID parameters
 */
export function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed',
        errors: [`${paramName} must be a valid string`],
      });
    }

    next();
  };
}

/**
 * Middleware to validate search query
 */
export function validateSearchQuery() {
  return (req, res, next) => {
    const query = req.params.query;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed',
        errors: ['Search query must be a non-empty string'],
      });
    }

    if (query.length > 200) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: ['Search query must not exceed 200 characters'],
      });
    }

    next();
  };
}

/**
 * General error handling middleware
 * Should be added at the end of middleware chain
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
