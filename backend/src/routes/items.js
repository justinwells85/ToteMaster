import express from 'express';
import * as itemsController from '../controllers/itemsController.js';

const router = express.Router();

// GET all items
router.get('/', itemsController.getAllItems);

// GET single item by ID
router.get('/:id', itemsController.getItemById);

// POST create new item
router.post('/', itemsController.createItem);

// PUT update item
router.put('/:id', itemsController.updateItem);

// DELETE item
router.delete('/:id', itemsController.deleteItem);

// GET items by tote ID
router.get('/tote/:toteId', itemsController.getItemsByTote);

// GET search items
router.get('/search/:query', itemsController.searchItems);

export default router;
