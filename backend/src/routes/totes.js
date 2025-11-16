import express from 'express';
import * as totesController from '../controllers/totesController.js';
import {
  validateToteRequest,
  validateIdParam,
} from '../middleware/validation.js';

const router = express.Router();

// GET all totes
router.get('/', totesController.getAllTotes);

// GET single tote by ID
router.get('/:id', validateIdParam(), totesController.getToteById);

// POST create new tote
router.post('/', validateToteRequest(false), totesController.createTote);

// PUT update tote
router.put('/:id', validateIdParam(), validateToteRequest(true), totesController.updateTote);

// DELETE tote
router.delete('/:id', validateIdParam(), totesController.deleteTote);

export default router;
