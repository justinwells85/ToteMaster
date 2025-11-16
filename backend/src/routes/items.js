import express from 'express';
import * as itemsController from '../controllers/itemsController.js';
import {
  validateItemRequest,
  validateIdParam,
  validateSearchQuery,
} from '../middleware/validation.js';

const router = express.Router();

// GET all items
router.get('/', itemsController.getAllItems);

// GET search items (must come before /:id to avoid conflict)
router.get('/search/:query', validateSearchQuery(), itemsController.searchItems);

// GET items by tote ID (must come before /:id to avoid conflict)
router.get('/tote/:toteId', validateIdParam('toteId'), itemsController.getItemsByTote);

// GET single item by ID
router.get('/:id', validateIdParam(), itemsController.getItemById);

// POST create new item
router.post('/', validateItemRequest(false), itemsController.createItem);

// PUT update item
router.put('/:id', validateIdParam(), validateItemRequest(true), itemsController.updateItem);

// DELETE item
router.delete('/:id', validateIdParam(), itemsController.deleteItem);

export default router;
