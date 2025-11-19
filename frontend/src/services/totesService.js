/**
 * Totes Service
 * Handles all API calls related to totes
 */

import apiClient from './api';

/**
 * Get all totes with optional pagination and sorting
 * @param {Object} params - Query parameters {page, limit, sortBy, sortOrder}
 * @returns {Promise} - Totes data
 */
export const getAllTotes = async (params = {}) => {
  return await apiClient.get('/totes', { params });
};

/**
 * Get a single tote by ID
 * @param {String} id - Tote ID
 * @returns {Promise} - Tote data
 */
export const getToteById = async (id) => {
  return await apiClient.get(`/totes/${id}`);
};

/**
 * Create a new tote
 * @param {Object} toteData - Tote data
 * @returns {Promise} - Created tote
 */
export const createTote = async (toteData) => {
  return await apiClient.post('/totes', toteData);
};

/**
 * Update an existing tote
 * @param {String} id - Tote ID
 * @param {Object} toteData - Updated tote data
 * @returns {Promise} - Updated tote
 */
export const updateTote = async (id, toteData) => {
  return await apiClient.put(`/totes/${id}`, toteData);
};

/**
 * Delete a tote
 * @param {String} id - Tote ID
 * @returns {Promise}
 */
export const deleteTote = async (id) => {
  return await apiClient.delete(`/totes/${id}`);
};
