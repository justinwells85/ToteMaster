/**
 * Locations Service
 * Business logic for locations
 */

import LocationRepository from '../db/repositories/LocationRepository.js';

/**
 * Get all locations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getAllLocations = async (userId) => {
  return await LocationRepository.findAll(userId);
};

/**
 * Get a single location by ID
 * @param {string} id - Location ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getLocationById = async (id, userId) => {
  return await LocationRepository.findById(id, userId);
};

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const createLocation = async (locationData, userId) => {
  return await LocationRepository.create(locationData, userId);
};

/**
 * Update a location
 * @param {string} id - Location ID
 * @param {Object} locationData - Updated location data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const updateLocation = async (id, locationData, userId) => {
  return await LocationRepository.update(id, locationData, userId);
};

/**
 * Delete a location
 * @param {string} id - Location ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteLocation = async (id, userId) => {
  return await LocationRepository.delete(id, userId);
};
