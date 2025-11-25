/**
 * Logging Middleware
 * Logs HTTP requests and responses with correlation ID tracking
 */

import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Middleware to log HTTP requests with correlation IDs for request tracing
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Generate or extract correlation ID for request tracing
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;

  // Add correlation ID to response headers for client-side tracking
  res.setHeader('X-Correlation-ID', correlationId);

  // Create a child logger with correlation context that can be used throughout the request
  req.logger = logger.child({ correlationId });

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const requestLogger = logger.child({ correlationId, userId: req.user?.userId });
    requestLogger.http(req, res, duration);
  });

  next();
}
