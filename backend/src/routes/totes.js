import express from 'express';
import * as totesController from '../controllers/totesController.js';

const router = express.Router();

// GET all totes
router.get('/', totesController.getAllTotes);

// GET single tote by ID
router.get('/:id', totesController.getToteById);

// POST create new tote
router.post('/', totesController.createTote);

// PUT update tote
router.put('/:id', totesController.updateTote);

// DELETE tote
router.delete('/:id', totesController.deleteTote);

export default router;
