/**
 * Logging Middleware
 * Logs HTTP requests and responses
 */

import logger from '../utils/logger.js';

/**
 * Middleware to log HTTP requests
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });

  next();
}
