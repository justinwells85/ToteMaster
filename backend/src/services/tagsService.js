/**
 * Tags Service
 * Business logic for tags
 */

import TagRepository from '../db/repositories/TagRepository.js';

/**
 * Get all tags for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getAllTags = async (userId) => {
  return await TagRepository.findAll(userId);
};

/**
 * Get a single tag by ID
 * @param {string} id - Tag ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getTagById = async (id, userId) => {
  return await TagRepository.findById(id, userId);
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const createTag = async (tagData, userId) => {
  return await TagRepository.create(tagData, userId);
};

/**
 * Update a tag
 * @param {string} id - Tag ID
 * @param {Object} tagData - Updated tag data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const updateTag = async (id, tagData, userId) => {
  return await TagRepository.update(id, tagData, userId);
};

/**
 * Delete a tag
 * @param {string} id - Tag ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteTag = async (id, userId) => {
  return await TagRepository.delete(id, userId);
};

/**
 * Get tags for a tote
 * @param {string} toteId - Tote ID
 * @returns {Promise<Array>}
 */
export const getTagsByToteId = async (toteId) => {
  return await TagRepository.findByToteId(toteId);
};

/**
 * Get tags for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<Array>}
 */
export const getTagsByItemId = async (itemId) => {
  return await TagRepository.findByItemId(itemId);
};

/**
 * Add tag to tote
 * @param {string} toteId - Tote ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const addTagToTote = async (toteId, tagId) => {
  return await TagRepository.addToTote(toteId, tagId);
};

/**
 * Remove tag from tote
 * @param {string} toteId - Tote ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const removeTagFromTote = async (toteId, tagId) => {
  return await TagRepository.removeFromTote(toteId, tagId);
};

/**
 * Add tag to item
 * @param {string} itemId - Item ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const addTagToItem = async (itemId, tagId) => {
  return await TagRepository.addToItem(itemId, tagId);
};

/**
 * Remove tag from item
 * @param {string} itemId - Item ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const removeTagFromItem = async (itemId, tagId) => {
  return await TagRepository.removeFromItem(itemId, tagId);
};
