import express from 'express';
import * as testDataController from '../controllers/testDataController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All test data routes require authentication
router.use(requireAuth);

/**
 * POST /api/test-data/generate
 * Generate test data (10 totes with 1-4 items each)
 */
router.post('/generate', testDataController.generateTestData);

/**
 * DELETE /api/test-data/clear
 * Clear all user data (items, totes, locations, tags)
 */
router.delete('/clear', testDataController.clearAllData);

export default router;
