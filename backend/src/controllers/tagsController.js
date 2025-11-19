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
    res.json(tags);
  } catch (error) {
    logger.error('Error in getAllTags:', error);
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
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    logger.error('Error in getTagById:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new tag
 */
export const createTag = async (req, res) => {
  try {
    const tag = await tagsService.createTag(req.body, req.user.userId);
    res.status(201).json(tag);
  } catch (error) {
    logger.error('Error in createTag:', error);
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
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    logger.error('Error in updateTag:', error);
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
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error in deleteTag:', error);
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
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in addTagToTote:', error);
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
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in removeTagFromTote:', error);
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
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in addTagToItem:', error);
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
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in removeTagFromItem:', error);
    res.status(400).json({ error: error.message });
  }
};
