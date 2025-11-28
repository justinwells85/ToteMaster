import axios from 'axios';
import logger from '../utils/logger.js';

// Check if AI features are enabled
const AI_ENABLED = process.env.AI_ENABLED === 'true';
const YOLO_SERVICE_URL = process.env.YOLO_SERVICE_URL || 'http://localhost:8001';

// Check YOLO service health on startup
let yoloServiceAvailable = false;

async function checkYoloService() {
  if (!AI_ENABLED) {
    logger.info('AI features disabled via AI_ENABLED=false');
    return false;
  }

  try {
    const response = await axios.get(`${YOLO_SERVICE_URL}/`, { timeout: 5000 });
    if (response.data.status === 'healthy') {
      yoloServiceAvailable = true;
      logger.info('YOLO service is available', { url: YOLO_SERVICE_URL, model: response.data.model });
      return true;
    }
  } catch (error) {
    yoloServiceAvailable = false;
    logger.warn('YOLO service not available', {
      url: YOLO_SERVICE_URL,
      error: error.message,
      hint: 'Start the Python YOLO service: cd backend/python-yolo-service && python main.py'
    });
    return false;
  }
}

// Check on startup
checkYoloService();

// Re-check every 30 seconds
setInterval(checkYoloService, 30000);

/**
 * Check if AI features are available
 * @returns {boolean} True if AI features are enabled and YOLO service is running
 */
export const isAIAvailable = () => {
  return AI_ENABLED && yoloServiceAvailable;
};

/**
 * Analyze a single photo to identify items using YOLOv8
 * @param {string} photoUrl - URL of the photo to analyze
 * @returns {Promise<Array>} Array of identified items with structured data
 */
export const analyzeTotePhoto = async (photoUrl) => {
  if (!isAIAvailable()) {
    throw new Error('AI features are not enabled or YOLO service is not running');
  }

  const timer = logger.startTimer();
  logger.info('Analyzing tote photo with YOLO', { photoUrl });

  try {
    const response = await axios.post(
      `${YOLO_SERVICE_URL}/analyze`,
      { photoUrl },
      {
        timeout: 30000, // 30 second timeout
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const items = response.data.items || [];

    logger.info('Photo analysis completed', {
      photoUrl,
      itemsIdentified: items.length,
      photosAnalyzed: response.data.photosAnalyzed
    });

    timer.end('analyzeTotePhoto completed');
    return items;
  } catch (error) {
    logger.logError('Error analyzing tote photo', error, { photoUrl });

    // Check for specific errors
    if (error.code === 'ECONNREFUSED') {
      throw new Error('YOLO service is not running. Please start the Python service.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('YOLO service timeout. The image may be too large or service is overloaded.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid image URL or format. Please ensure the image is accessible.');
    }

    throw error;
  }
};

/**
 * Analyze multiple photos and consolidate results using YOLOv8
 * @param {Array<string>} photoUrls - Array of photo URLs to analyze
 * @returns {Promise<Array>} Consolidated array of identified items
 */
export const analyzeMultiplePhotos = async (photoUrls) => {
  if (!isAIAvailable()) {
    throw new Error('AI features are not enabled or YOLO service is not running');
  }

  if (!photoUrls || photoUrls.length === 0) {
    return [];
  }

  const timer = logger.startTimer();
  logger.info('Analyzing multiple photos with YOLO', { photoCount: photoUrls.length });

  try {
    const response = await axios.post(
      `${YOLO_SERVICE_URL}/analyze-multiple`,
      { photoUrls },
      {
        timeout: 60000, // 60 second timeout for multiple photos
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const items = response.data.items || [];

    logger.info('Multiple photos analysis completed', {
      photoCount: photoUrls.length,
      itemsFound: items.length,
      photosAnalyzed: response.data.photosAnalyzed
    });

    timer.end('analyzeMultiplePhotos completed');
    return items;
  } catch (error) {
    logger.logError('Error analyzing multiple photos', error, { photoCount: photoUrls.length });

    // Check for specific errors
    if (error.code === 'ECONNREFUSED') {
      throw new Error('YOLO service is not running. Please start the Python service.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('YOLO service timeout. Try analyzing fewer photos at once.');
    }

    throw error;
  }
};

export default {
  isAIAvailable,
  analyzeTotePhoto,
  analyzeMultiplePhotos,
};
