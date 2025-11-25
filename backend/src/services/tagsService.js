/**
 * Tags Service
 * Business logic for tags
 */

import TagRepository from '../db/repositories/TagRepository.js';
import logger from '../utils/logger.js';

/**
 * Get all tags for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getAllTags = async (userId) => {
  logger.debug('getAllTags called', { userId });
  try {
    const tags = await TagRepository.findAll(userId);
    logger.debug('Tags retrieved', { userId, count: tags.length });
    return tags;
  } catch (error) {
    logger.logError('Error in getAllTags', error, { userId });
    throw error;
  }
};

/**
 * Get a single tag by ID
 * @param {string} id - Tag ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getTagById = async (id, userId) => {
  logger.debug('getTagById called', { tagId: id, userId });
  try {
    return await TagRepository.findById(id, userId);
  } catch (error) {
    logger.logError('Error in getTagById', error, { tagId: id, userId });
    throw error;
  }
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const createTag = async (tagData, userId) => {
  logger.info('Creating new tag', { userId, name: tagData.name });
  try {
    const tag = await TagRepository.create(tagData, userId);
    logger.info('Tag created successfully', { tagId: tag.id, userId });
    return tag;
  } catch (error) {
    logger.logError('Error in createTag', error, { userId, tagData });
    throw error;
  }
};

/**
 * Update a tag
 * @param {string} id - Tag ID
 * @param {Object} tagData - Updated tag data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const updateTag = async (id, tagData, userId) => {
  logger.info('Updating tag', { tagId: id, userId });
  try {
    const tag = await TagRepository.update(id, tagData, userId);
    if (tag) {
      logger.info('Tag updated successfully', { tagId: id, userId });
    }
    return tag;
  } catch (error) {
    logger.logError('Error in updateTag', error, { tagId: id, userId });
    throw error;
  }
};

/**
 * Delete a tag
 * @param {string} id - Tag ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteTag = async (id, userId) => {
  logger.info('Deleting tag', { tagId: id, userId });
  try {
    const deleted = await TagRepository.delete(id, userId);
    if (deleted) {
      logger.info('Tag deleted successfully', { tagId: id, userId });
    }
    return deleted;
  } catch (error) {
    logger.logError('Error in deleteTag', error, { tagId: id, userId });
    throw error;
  }
};

/**
 * Get tags for a tote
 * @param {string} toteId - Tote ID
 * @returns {Promise<Array>}
 */
export const getTagsByToteId = async (toteId) => {
  logger.debug('Getting tags for tote', { toteId });
  try {
    const tags = await TagRepository.findByToteId(toteId);
    logger.debug('Tags retrieved for tote', { toteId, count: tags.length });
    return tags;
  } catch (error) {
    logger.logError('Error in getTagsByToteId', error, { toteId });
    throw error;
  }
};

/**
 * Get tags for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<Array>}
 */
export const getTagsByItemId = async (itemId) => {
  logger.debug('Getting tags for item', { itemId });
  try {
    const tags = await TagRepository.findByItemId(itemId);
    logger.debug('Tags retrieved for item', { itemId, count: tags.length });
    return tags;
  } catch (error) {
    logger.logError('Error in getTagsByItemId', error, { itemId });
    throw error;
  }
};

/**
 * Add tag to tote
 * @param {string} toteId - Tote ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const addTagToTote = async (toteId, tagId) => {
  logger.info('Adding tag to tote', { toteId, tagId });
  try {
    const result = await TagRepository.addToTote(toteId, tagId);
    logger.info('Tag added to tote successfully', { toteId, tagId });
    return result;
  } catch (error) {
    logger.logError('Error in addTagToTote', error, { toteId, tagId });
    throw error;
  }
};

/**
 * Remove tag from tote
 * @param {string} toteId - Tote ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const removeTagFromTote = async (toteId, tagId) => {
  logger.info('Removing tag from tote', { toteId, tagId });
  try {
    const result = await TagRepository.removeFromTote(toteId, tagId);
    logger.info('Tag removed from tote successfully', { toteId, tagId });
    return result;
  } catch (error) {
    logger.logError('Error in removeTagFromTote', error, { toteId, tagId });
    throw error;
  }
};

/**
 * Add tag to item
 * @param {string} itemId - Item ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const addTagToItem = async (itemId, tagId) => {
  logger.info('Adding tag to item', { itemId, tagId });
  try {
    const result = await TagRepository.addToItem(itemId, tagId);
    logger.info('Tag added to item successfully', { itemId, tagId });
    return result;
  } catch (error) {
    logger.logError('Error in addTagToItem', error, { itemId, tagId });
    throw error;
  }
};

/**
 * Remove tag from item
 * @param {string} itemId - Item ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>}
 */
export const removeTagFromItem = async (itemId, tagId) => {
  logger.info('Removing tag from item', { itemId, tagId });
  try {
    const result = await TagRepository.removeFromItem(itemId, tagId);
    logger.info('Tag removed from item successfully', { itemId, tagId });
    return result;
  } catch (error) {
    logger.logError('Error in removeTagFromItem', error, { itemId, tagId });
    throw error;
  }
};
