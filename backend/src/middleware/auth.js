import { verifyToken } from '../services/authService.js';
import logger from '../utils/logger.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

/**
 * Require authentication
 * Middleware that ensures the user is authenticated
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = await verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Optional authentication
 * Middleware that checks for authentication but doesn't require it
 * Attaches user to request if token is present and valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without user
      return next();
    }

    const token = authHeader.substring(7);

    // Try to verify token
    const decoded = await verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // Token is invalid, but we don't reject the request
    logger.warn('Optional auth failed:', error.message);
    next();
  }
};
