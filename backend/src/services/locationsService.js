/**
 * Locations Service
 * Business logic for locations
 */

import LocationRepository from '../db/repositories/LocationRepository.js';
import logger from '../utils/logger.js';

/**
 * Get all locations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getAllLocations = async (userId) => {
  logger.debug('getAllLocations called', { userId });
  try {
    const locations = await LocationRepository.findAll(userId);
    logger.debug('Locations retrieved', { userId, count: locations.length });
    return locations;
  } catch (error) {
    logger.logError('Error in getAllLocations', error, { userId });
    throw error;
  }
};

/**
 * Get a single location by ID
 * @param {string} id - Location ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getLocationById = async (id, userId) => {
  logger.debug('getLocationById called', { locationId: id, userId });
  try {
    const location = await LocationRepository.findById(id, userId);
    if (!location) {
      logger.debug('Location not found', { locationId: id, userId });
    }
    return location;
  } catch (error) {
    logger.logError('Error in getLocationById', error, { locationId: id, userId });
    throw error;
  }
};

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const createLocation = async (locationData, userId) => {
  logger.info('Creating new location', { userId, name: locationData.name });
  try {
    const location = await LocationRepository.create(locationData, userId);
    logger.info('Location created successfully', { locationId: location.id, userId });
    return location;
  } catch (error) {
    logger.logError('Error in createLocation', error, { userId, locationData });
    throw error;
  }
};

/**
 * Update a location
 * @param {string} id - Location ID
 * @param {Object} locationData - Updated location data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const updateLocation = async (id, locationData, userId) => {
  logger.info('Updating location', { locationId: id, userId });
  try {
    const location = await LocationRepository.update(id, locationData, userId);
    if (location) {
      logger.info('Location updated successfully', { locationId: id, userId });
    } else {
      logger.warn('Location not found for update', { locationId: id, userId });
    }
    return location;
  } catch (error) {
    logger.logError('Error in updateLocation', error, { locationId: id, userId });
    throw error;
  }
};

/**
 * Delete a location
 * @param {string} id - Location ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteLocation = async (id, userId) => {
  logger.info('Deleting location', { locationId: id, userId });
  try {
    const deleted = await LocationRepository.delete(id, userId);
    if (deleted) {
      logger.info('Location deleted successfully', { locationId: id, userId });
    } else {
      logger.warn('Location not found for deletion', { locationId: id, userId });
    }
    return deleted;
  } catch (error) {
    logger.logError('Error in deleteLocation', error, { locationId: id, userId });
    throw error;
  }
};
