/**
 * Tags Service
 * Handles all API calls related to tags
 */

import apiClient from './api';

/**
 * Get all tags
 * @returns {Promise} - Tags data
 */
export const getAllTags = async () => {
  return await apiClient.get('/tags');
};

/**
 * Get a single tag by ID
 * @param {String} id - Tag ID
 * @returns {Promise} - Tag data
 */
export const getTagById = async (id) => {
  return await apiClient.get(`/tags/${id}`);
};

/**
 * Get tags for a tote
 * @param {String} toteId - Tote ID
 * @returns {Promise} - Array of tags
 */
export const getTagsByToteId = async (toteId) => {
  return await apiClient.get(`/tags/tote/${toteId}`);
};

/**
 * Get tags for an item
 * @param {String} itemId - Item ID
 * @returns {Promise} - Array of tags
 */
export const getTagsByItemId = async (itemId) => {
  return await apiClient.get(`/tags/item/${itemId}`);
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Promise} - Created tag
 */
export const createTag = async (tagData) => {
  return await apiClient.post('/tags', tagData);
};

/**
 * Update an existing tag
 * @param {String} id - Tag ID
 * @param {Object} tagData - Updated tag data
 * @returns {Promise} - Updated tag
 */
export const updateTag = async (id, tagData) => {
  return await apiClient.put(`/tags/${id}`, tagData);
};

/**
 * Delete a tag
 * @param {String} id - Tag ID
 * @returns {Promise}
 */
export const deleteTag = async (id) => {
  return await apiClient.delete(`/tags/${id}`);
};

/**
 * Add a tag to a tote
 * @param {String} toteId - Tote ID
 * @param {String} tagId - Tag ID
 * @returns {Promise}
 */
export const addTagToTote = async (toteId, tagId) => {
  return await apiClient.post('/tags/tote/add', { toteId, tagId });
};

/**
 * Remove a tag from a tote
 * @param {String} toteId - Tote ID
 * @param {String} tagId - Tag ID
 * @returns {Promise}
 */
export const removeTagFromTote = async (toteId, tagId) => {
  return await apiClient.post('/tags/tote/remove', { toteId, tagId });
};

/**
 * Add a tag to an item
 * @param {String} itemId - Item ID
 * @param {String} tagId - Tag ID
 * @returns {Promise}
 */
export const addTagToItem = async (itemId, tagId) => {
  return await apiClient.post('/tags/item/add', { itemId, tagId });
};

/**
 * Remove a tag from an item
 * @param {String} itemId - Item ID
 * @param {String} tagId - Tag ID
 * @returns {Promise}
 */
export const removeTagFromItem = async (itemId, tagId) => {
  return await apiClient.post('/tags/item/remove', { itemId, tagId });
};
