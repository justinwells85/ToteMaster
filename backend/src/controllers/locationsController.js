/**
 * Locations Controller
 * Handles HTTP requests for locations
 */

import * as locationsService from '../services/locationsService.js';
import logger from '../utils/logger.js';

/**
 * Get all locations for authenticated user
 */
export const getAllLocations = async (req, res) => {
  try {
    const locations = await locationsService.getAllLocations(req.user.userId);
    res.json(locations);
  } catch (error) {
    logger.error('Error in getAllLocations:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a single location by ID
 */
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationsService.getLocationById(id, req.user.userId);

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    logger.error('Error in getLocationById:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new location
 */
export const createLocation = async (req, res) => {
  try {
    const location = await locationsService.createLocation(req.body, req.user.userId);
    res.status(201).json(location);
  } catch (error) {
    logger.error('Error in createLocation:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update a location
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationsService.updateLocation(id, req.body, req.user.userId);

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    logger.error('Error in updateLocation:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a location
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await locationsService.deleteLocation(id, req.user.userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error in deleteLocation:', error);
    res.status(500).json({ error: error.message });
  }
};
