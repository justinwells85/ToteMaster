import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../db/repositories/UserRepository.js';
import { validateRegistration, validateLogin, sanitizeUser } from '../models/User.js';

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
  // Validate input
  const validation = validateRegistration(userData);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Check if email already exists
  const emailExists = await UserRepository.emailExists(userData.email);
  if (emailExists) {
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

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Login a user
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise<Object>} User and token
 */
export const login = async (credentials) => {
  // Validate input
  const validation = validateLogin(credentials);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Find user by email
  const user = await UserRepository.findByEmail(credentials.email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Verify password
  const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Generate token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object (without password) or null
 */
export const getUserById = async (userId) => {
  const user = await UserRepository.findById(userId);
  return sanitizeUser(user);
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user object
 */
export const updateProfile = async (userId, updates) => {
  // Don't allow updating password through this method
  const { password, ...allowedUpdates } = updates;

  const user = await UserRepository.update(userId, allowedUpdates);
  return sanitizeUser(user);
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user object
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Get user with password hash
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    const error = new Error('Current password is incorrect');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  // Validate new password
  const validation = validateRegistration({ email: user.email, password: newPassword });
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password
  const updatedUser = await UserRepository.update(userId, { password_hash });
  return sanitizeUser(updatedUser);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token payload
 */
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.code = 'INVALID_TOKEN';
      throw err;
    }
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
  // Get user with password hash
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Password is incorrect');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  // Delete user (will cascade delete items and totes)
  return await UserRepository.delete(userId);
};
