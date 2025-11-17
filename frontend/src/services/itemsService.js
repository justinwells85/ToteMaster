/**
 * Items Service
 * Handles all API calls related to items
 */

import apiClient from './api';

/**
 * Get all items with optional pagination and sorting
 * @param {Object} params - Query parameters {page, limit, sortBy, sortOrder}
 * @returns {Promise} - Items data
 */
export const getAllItems = async (params = {}) => {
  const response = await apiClient.get('/items', { params });
  return response.data;
};

/**
 * Get a single item by ID
 * @param {String} id - Item ID
 * @returns {Promise} - Item data
 */
export const getItemById = async (id) => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

/**
 * Create a new item
 * @param {Object} itemData - Item data
 * @returns {Promise} - Created item
 */
export const createItem = async (itemData) => {
  const response = await apiClient.post('/items', itemData);
  return response.data;
};

/**
 * Update an existing item
 * @param {String} id - Item ID
 * @param {Object} itemData - Updated item data
 * @returns {Promise} - Updated item
 */
export const updateItem = async (id, itemData) => {
  const response = await apiClient.put(`/items/${id}`, itemData);
  return response.data;
};

/**
 * Delete an item
 * @param {String} id - Item ID
 * @returns {Promise}
 */
export const deleteItem = async (id) => {
  const response = await apiClient.delete(`/items/${id}`);
  return response.data;
};

/**
 * Get items by tote ID
 * @param {String} toteId - Tote ID
 * @returns {Promise} - Items in the tote
 */
export const getItemsByTote = async (toteId) => {
  const response = await apiClient.get(`/items/tote/${toteId}`);
  return response.data;
};

/**
 * Search items
 * @param {String} query - Search query
 * @param {Object} params - Query parameters {page, limit, sortBy, sortOrder}
 * @returns {Promise} - Search results
 */
export const searchItems = async (query, params = {}) => {
  const response = await apiClient.get(`/items/search/${query}`, { params });
  return response.data;
};
