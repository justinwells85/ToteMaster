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
    logger.debug('getAllLocations controller completed', { userId: req.user.userId, count: locations.length });
    res.json(locations);
  } catch (error) {
    logger.logError('Error in getAllLocations controller', error, { userId: req.user.userId });
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
      logger.debug('Location not found in controller', { locationId: id, userId: req.user.userId });
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    logger.logError('Error in getLocationById controller', error, { locationId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new location
 */
export const createLocation = async (req, res) => {
  try {
    const location = await locationsService.createLocation(req.body, req.user.userId);
    logger.info('Location created via controller', { locationId: location.id, userId: req.user.userId });
    res.status(201).json(location);
  } catch (error) {
    logger.logError('Error in createLocation controller', error, { userId: req.user.userId });
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
      logger.debug('Location not found for update in controller', { locationId: id, userId: req.user.userId });
      return res.status(404).json({ error: 'Location not found' });
    }

    logger.info('Location updated via controller', { locationId: id, userId: req.user.userId });
    res.json(location);
  } catch (error) {
    logger.logError('Error in updateLocation controller', error, { locationId: req.params.id, userId: req.user.userId });
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
      logger.debug('Location not found for deletion in controller', { locationId: id, userId: req.user.userId });
      return res.status(404).json({ error: 'Location not found' });
    }

    logger.info('Location deleted via controller', { locationId: id, userId: req.user.userId });
    res.status(204).send();
  } catch (error) {
    logger.logError('Error in deleteLocation controller', error, { locationId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};
