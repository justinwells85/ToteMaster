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
  return await apiClient.get('/items', { params });
};

/**
 * Get a single item by ID
 * @param {String} id - Item ID
 * @returns {Promise} - Item data
 */
export const getItemById = async (id) => {
  return await apiClient.get(`/items/${id}`);
};

/**
 * Create a new item
 * @param {Object} itemData - Item data
 * @returns {Promise} - Created item
 */
export const createItem = async (itemData) => {
  return await apiClient.post('/items', itemData);
};

/**
 * Update an existing item
 * @param {String} id - Item ID
 * @param {Object} itemData - Updated item data
 * @returns {Promise} - Updated item
 */
export const updateItem = async (id, itemData) => {
  return await apiClient.put(`/items/${id}`, itemData);
};

/**
 * Delete an item
 * @param {String} id - Item ID
 * @returns {Promise}
 */
export const deleteItem = async (id) => {
  return await apiClient.delete(`/items/${id}`);
};

/**
 * Get items by tote ID
 * @param {String} toteId - Tote ID
 * @returns {Promise} - Items in the tote
 */
export const getItemsByTote = async (toteId) => {
  return await apiClient.get(`/items/tote/${toteId}`);
};

/**
 * Search items
 * @param {String} query - Search query
 * @param {Object} params - Query parameters {page, limit, sortBy, sortOrder}
 * @returns {Promise} - Search results
 */
export const searchItems = async (query, params = {}) => {
  return await apiClient.get(`/items/search/${query}`, { params });
};
