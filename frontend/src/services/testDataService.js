/**
 * Test Data Service
 * Handles API calls for test data generation and clearing
 */

import apiClient from './api';

/**
 * Generate test data
 * Creates 10 totes with 2-8 random items each
 * @returns {Promise} - Result with summary
 */
export const generateTestData = async () => {
  return await apiClient.post('/test-data/generate');
};

/**
 * Clear all user data
 * Deletes all items, totes, locations, and tags
 * @returns {Promise} - Result with summary
 */
export const clearAllData = async () => {
  return await apiClient.delete('/test-data/clear');
};
