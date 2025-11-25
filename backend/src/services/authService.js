import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../db/repositories/UserRepository.js';
import { validateRegistration, validateLogin, sanitizeUser } from '../models/User.js';
import logger from '../utils/logger.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * AuthService
 * Handles user authentication operations
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user and token
 */
export const register = async (userData) => {
  const timer = logger.startTimer();
  logger.info('User registration attempt', { email: userData.email });

  try {
    // Validate input
    const validation = validateRegistration(userData);
    if (!validation.valid) {
      logger.logValidationError('register', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Check if email already exists
    const emailExists = await UserRepository.emailExists(userData.email);
    if (emailExists) {
      logger.warn('Registration failed - email already exists', { email: userData.email });
      const error = new Error('Email already registered');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // Hash password
    const password_hash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user
    const user = await UserRepository.create({
      email: userData.email,
      password_hash,
      name: userData.name,
    });

    // Generate token
    const token = generateToken(user);

    logger.info('User registered successfully', { userId: user.id, email: user.email });
    timer.end('register completed');

    return {
      user: sanitizeUser(user),
      token,
    };
  } catch (error) {
    logger.logError('Error in register', error, { email: userData.email });
    throw error;
  }
};

/**
 * Login a user
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise<Object>} User and token
 */
export const login = async (credentials) => {
  const timer = logger.startTimer();
  logger.info('Login attempt', { email: credentials.email });

  try {
    // Validate input
    const validation = validateLogin(credentials);
    if (!validation.valid) {
      logger.logValidationError('login', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Find user by email
    const user = await UserRepository.findByEmail(credentials.email);
    if (!user) {
      logger.warn('Login failed - user not found', { email: credentials.email });
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Verify password
    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValid) {
      logger.warn('Login failed - invalid password', { userId: user.id, email: credentials.email });
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate token
    const token = generateToken(user);

    logger.info('Login successful', { userId: user.id, email: user.email });
    timer.end('login completed');

    return {
      user: sanitizeUser(user),
      token,
    };
  } catch (error) {
    logger.logError('Error in login', error, { email: credentials.email });
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object (without password) or null
 */
export const getUserById = async (userId) => {
  logger.debug('getUserById called', { userId });
  try {
    const user = await UserRepository.findById(userId);
    return sanitizeUser(user);
  } catch (error) {
    logger.logError('Error in getUserById', error, { userId });
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user object
 */
export const updateProfile = async (userId, updates) => {
  logger.info('Updating user profile', { userId, fields: Object.keys(updates) });
  try {
    // Don't allow updating password through this method
    const { password, ...allowedUpdates } = updates;

    const user = await UserRepository.update(userId, allowedUpdates);
    logger.info('Profile updated successfully', { userId });
    return sanitizeUser(user);
  } catch (error) {
    logger.logError('Error in updateProfile', error, { userId });
    throw error;
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user object
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  logger.info('Password change attempt', { userId });
  try {
    // Get user with password hash
    const user = await UserRepository.findById(userId);
    if (!user) {
      logger.warn('Password change failed - user not found', { userId });
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      logger.warn('Password change failed - incorrect current password', { userId });
      const error = new Error('Current password is incorrect');
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Validate new password
    const validation = validateRegistration({ email: user.email, password: newPassword });
    if (!validation.valid) {
      logger.logValidationError('changePassword', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    const updatedUser = await UserRepository.update(userId, { password_hash });
    logger.info('Password changed successfully', { userId });
    return sanitizeUser(updatedUser);
  } catch (error) {
    logger.logError('Error in changePassword', error, { userId });
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token payload
 */
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    logger.debug('Token verified successfully', { userId: decoded.userId });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token verification failed - expired token');
      const err = new Error('Token expired');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Token verification failed - invalid token');
      const err = new Error('Invalid token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }
    logger.logError('Error in verifyToken', error);
    throw error;
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Delete user account
 * @param {string} userId - User ID
 * @param {string} password - User password for confirmation
 * @returns {Promise<boolean>} True if deleted
 */
export const deleteAccount = async (userId, password) => {
  logger.warn('Account deletion attempt', { userId });
  try {
    // Get user with password hash
    const user = await UserRepository.findById(userId);
    if (!user) {
      logger.warn('Account deletion failed - user not found', { userId });
      throw new Error('User not found');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      logger.warn('Account deletion failed - incorrect password', { userId });
      const error = new Error('Password is incorrect');
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Delete user (will cascade delete items and totes)
    const deleted = await UserRepository.delete(userId);
    logger.warn('Account deleted successfully', { userId, email: user.email });
    return deleted;
  } catch (error) {
    logger.logError('Error in deleteAccount', error, { userId });
    throw error;
  }
};
