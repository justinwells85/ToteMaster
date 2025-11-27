import express from 'express';
import * as totesController from '../controllers/totesController.js';
import {
  validateToteRequest,
  validateIdParam,
} from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadTotePhotos, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

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

// POST upload photos to tote
router.post(
  '/:id/photos',
  validateIdParam(),
  uploadTotePhotos,
  handleUploadError,
  totesController.uploadPhotos
);

// DELETE photo from tote
router.delete(
  '/:id/photos',
  validateIdParam(),
  totesController.deletePhoto
);

export default router;
