/**
 * Locations Service
 * Handles all API calls related to locations
 */

import apiClient from './api';

/**
 * Get all locations
 * @returns {Promise} - Locations data
 */
export const getAllLocations = async () => {
  return await apiClient.get('/locations');
};

/**
 * Get a single location by ID
 * @param {String} id - Location ID
 * @returns {Promise} - Location data
 */
export const getLocationById = async (id) => {
  return await apiClient.get(`/locations/${id}`);
};

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @returns {Promise} - Created location
 */
export const createLocation = async (locationData) => {
  return await apiClient.post('/locations', locationData);
};

/**
 * Update an existing location
 * @param {String} id - Location ID
 * @param {Object} locationData - Updated location data
 * @returns {Promise} - Updated location
 */
export const updateLocation = async (id, locationData) => {
  return await apiClient.put(`/locations/${id}`, locationData);
};

/**
 * Delete a location
 * @param {String} id - Location ID
 * @returns {Promise}
 */
export const deleteLocation = async (id) => {
  return await apiClient.delete(`/locations/${id}`);
};
