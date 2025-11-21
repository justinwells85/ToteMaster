import * as testDataService from '../services/testDataService.js';
import logger from '../utils/logger.js';

/**
 * Generate test data for the authenticated user
 * Creates 10 totes with 1-4 random items each
 */
export const generateTestData = async (req, res) => {
  try {
    logger.info(`Test data generation requested by user ${req.user.userId}`);

    const result = await testDataService.generateTestData(req.user.userId);

    res.status(201).json({
      message: 'Test data generated successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Error generating test data:', error);
    res.status(500).json({
      error: 'Failed to generate test data',
      message: error.message,
    });
  }
};

/**
 * Clear all data for the authenticated user
 * Deletes all items, totes, locations, and tags
 */
export const clearAllData = async (req, res) => {
  try {
    logger.info(`Clear all data requested by user ${req.user.userId}`);

    const result = await testDataService.clearAllData(req.user.userId);

    res.json({
      message: 'All data cleared successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Error clearing data:', error);
    res.status(500).json({
      error: 'Failed to clear data',
      message: error.message,
    });
  }
};
