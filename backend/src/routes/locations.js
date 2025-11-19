/**
 * Locations Routes
 * API endpoints for locations
 */

import express from 'express';
import * as locationsController from '../controllers/locationsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/locations
 * @desc    Get all locations for authenticated user
 * @access  Private
 */
router.get('/', locationsController.getAllLocations);

/**
 * @route   GET /api/locations/:id
 * @desc    Get a single location by ID
 * @access  Private
 */
router.get('/:id', locationsController.getLocationById);

/**
 * @route   POST /api/locations
 * @desc    Create a new location
 * @access  Private
 */
router.post('/', locationsController.createLocation);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location
 * @access  Private
 */
router.put('/:id', locationsController.updateLocation);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location
 * @access  Private
 */
router.delete('/:id', locationsController.deleteLocation);

export default router;
