import express from 'express';
import {
  register,
  login,
  getUserById,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const result = await register({ email, password, name });

    logger.info(`User registered: ${result.user.email}`);

    res.status(201).json({
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    logger.error('Registration error:', error.message);
    logger.error('Stack trace:', error.stack);
    console.error('FULL ERROR:', error);

    if (error.message === 'Validation failed') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details,
      });
    }

    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS',
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
      details: error.stack,
    });
  }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login({ email, password });

    logger.info(`User logged in: ${result.user.email}`);

    res.status(200).json({
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    logger.error('Stack trace:', error.stack);
    console.error('FULL ERROR:', error);

    if (error.message === 'Validation failed') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details,
      });
    }

    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    res.status(500).json({
      error: 'Login failed',
      message: error.message,
      details: error.stack,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error('Get user error:', error);

    res.status(500).json({
      error: 'Failed to get user',
    });
  }
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await updateProfile(req.user.userId, { name, email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json(user);
  } catch (error) {
    logger.error('Update profile error:', error);

    res.status(500).json({
      error: 'Failed to update profile',
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
      });
    }

    const user = await changePassword(req.user.userId, currentPassword, newPassword);

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      message: 'Password changed successfully',
      user,
    });
  } catch (error) {
    logger.error('Change password error:', error);

    if (error.code === 'INVALID_PASSWORD') {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD',
      });
    }

    if (error.message === 'Validation failed') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details,
      });
    }

    res.status(500).json({
      error: 'Failed to change password',
    });
  }
});

/**
 * DELETE /api/auth/me
 * Delete user account
 */
router.delete('/me', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Password is required to delete account',
      });
    }

    await deleteAccount(req.user.userId, password);

    logger.info(`User account deleted: ${req.user.email}`);

    res.status(204).send();
  } catch (error) {
    logger.error('Delete account error:', error);

    if (error.code === 'INVALID_PASSWORD') {
      return res.status(401).json({
        error: 'Password is incorrect',
        code: 'INVALID_PASSWORD',
      });
    }

    res.status(500).json({
      error: 'Failed to delete account',
    });
  }
});

export default router;
