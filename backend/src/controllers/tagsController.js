/**
 * Tags Controller
 * Handles HTTP requests for tags
 */

import * as tagsService from '../services/tagsService.js';
import logger from '../utils/logger.js';

/**
 * Get all tags for authenticated user
 */
export const getAllTags = async (req, res) => {
  try {
    const tags = await tagsService.getAllTags(req.user.userId);
    logger.debug('getAllTags controller completed', { userId: req.user.userId, count: tags.length });
    res.json(tags);
  } catch (error) {
    logger.logError('Error in getAllTags controller', error, { userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a single tag by ID
 */
export const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await tagsService.getTagById(id, req.user.userId);

    if (!tag) {
      logger.debug('Tag not found in controller', { tagId: id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    logger.logError('Error in getTagById controller', error, { tagId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new tag
 */
export const createTag = async (req, res) => {
  try {
    const tag = await tagsService.createTag(req.body, req.user.userId);
    logger.info('Tag created via controller', { tagId: tag.id, userId: req.user.userId });
    res.status(201).json(tag);
  } catch (error) {
    logger.logError('Error in createTag controller', error, { userId: req.user.userId });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update a tag
 */
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await tagsService.updateTag(id, req.body, req.user.userId);

    if (!tag) {
      logger.debug('Tag not found for update in controller', { tagId: id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tag not found' });
    }

    logger.info('Tag updated via controller', { tagId: id, userId: req.user.userId });
    res.json(tag);
  } catch (error) {
    logger.logError('Error in updateTag controller', error, { tagId: req.params.id, userId: req.user.userId });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await tagsService.deleteTag(id, req.user.userId);

    if (!deleted) {
      logger.debug('Tag not found for deletion in controller', { tagId: id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tag not found' });
    }

    logger.info('Tag deleted via controller', { tagId: id, userId: req.user.userId });
    res.status(204).send();
  } catch (error) {
    logger.logError('Error in deleteTag controller', error, { tagId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add tag to tote
 */
export const addTagToTote = async (req, res) => {
  try {
    const { toteId, tagId } = req.body;
    await tagsService.addTagToTote(toteId, tagId);
    logger.info('Tag added to tote via controller', { toteId, tagId, userId: req.user.userId });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.logError('Error in addTagToTote controller', error, { toteId: req.body.toteId, tagId: req.body.tagId });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Remove tag from tote
 */
export const removeTagFromTote = async (req, res) => {
  try {
    const { toteId, tagId } = req.body;
    await tagsService.removeTagFromTote(toteId, tagId);
    logger.info('Tag removed from tote via controller', { toteId, tagId, userId: req.user.userId });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.logError('Error in removeTagFromTote controller', error, { toteId: req.body.toteId, tagId: req.body.tagId });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Add tag to item
 */
export const addTagToItem = async (req, res) => {
  try {
    const { itemId, tagId } = req.body;
    await tagsService.addTagToItem(itemId, tagId);
    logger.info('Tag added to item via controller', { itemId, tagId, userId: req.user.userId });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.logError('Error in addTagToItem controller', error, { itemId: req.body.itemId, tagId: req.body.tagId });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Remove tag from item
 */
export const removeTagFromItem = async (req, res) => {
  try {
    const { itemId, tagId } = req.body;
    await tagsService.removeTagFromItem(itemId, tagId);
    logger.info('Tag removed from item via controller', { itemId, tagId, userId: req.user.userId });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.logError('Error in removeTagFromItem controller', error, { itemId: req.body.itemId, tagId: req.body.tagId });
    res.status(400).json({ error: error.message });
  }
};
