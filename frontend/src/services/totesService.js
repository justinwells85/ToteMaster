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
  const response = await apiClient.get('/totes', { params });
  return response.data;
};

/**
 * Get a single tote by ID
 * @param {String} id - Tote ID
 * @returns {Promise} - Tote data
 */
export const getToteById = async (id) => {
  const response = await apiClient.get(`/totes/${id}`);
  return response.data;
};

/**
 * Create a new tote
 * @param {Object} toteData - Tote data
 * @returns {Promise} - Created tote
 */
export const createTote = async (toteData) => {
  const response = await apiClient.post('/totes', toteData);
  return response.data;
};

/**
 * Update an existing tote
 * @param {String} id - Tote ID
 * @param {Object} toteData - Updated tote data
 * @returns {Promise} - Updated tote
 */
export const updateTote = async (id, toteData) => {
  const response = await apiClient.put(`/totes/${id}`, toteData);
  return response.data;
};

/**
 * Delete a tote
 * @param {String} id - Tote ID
 * @returns {Promise}
 */
export const deleteTote = async (id) => {
  const response = await apiClient.delete(`/totes/${id}`);
  return response.data;
};
