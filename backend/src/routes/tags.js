/**
 * Tags Routes
 * API endpoints for tags
 */

import express from 'express';
import * as tagsController from '../controllers/tagsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/tags
 * @desc    Get all tags for authenticated user
 * @access  Private
 */
router.get('/', tagsController.getAllTags);

/**
 * @route   GET /api/tags/:id
 * @desc    Get a single tag by ID
 * @access  Private
 */
router.get('/:id', tagsController.getTagById);

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
router.post('/', tagsController.createTag);

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private
 */
router.put('/:id', tagsController.updateTag);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag
 * @access  Private
 */
router.delete('/:id', tagsController.deleteTag);

/**
 * @route   POST /api/tags/tote/add
 * @desc    Add tag to tote
 * @access  Private
 */
router.post('/tote/add', tagsController.addTagToTote);

/**
 * @route   POST /api/tags/tote/remove
 * @desc    Remove tag from tote
 * @access  Private
 */
router.post('/tote/remove', tagsController.removeTagFromTote);

/**
 * @route   POST /api/tags/item/add
 * @desc    Add tag to item
 * @access  Private
 */
router.post('/item/add', tagsController.addTagToItem);

/**
 * @route   POST /api/tags/item/remove
 * @desc    Remove tag from item
 * @access  Private
 */
router.post('/item/remove', tagsController.removeTagFromItem);

export default router;
