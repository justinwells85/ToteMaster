import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateTote } from '../models/Tote.js';
import logger from '../utils/logger.js';
import { getStorageService } from '../storage/index.js';
import { generatePhotoKey } from '../middleware/upload.js';
import { isAIAvailable, analyzeMultiplePhotos } from './aiService.js';

export const getAllTotes = async (userId) => {
  const timer = logger.startTimer();
  logger.debug('getAllTotes called', { userId });
  try {
    const totes = await ToteRepository.findAll(userId);
    logger.debug('Totes retrieved', { userId, count: totes.length });
    timer.end('getAllTotes completed');
    return totes;
  } catch (error) {
    logger.logError('Error in getAllTotes', error, { userId });
    throw error;
  }
};

export const getToteById = async (id, userId) => {
  logger.debug('getToteById called', { toteId: id, userId });
  try {
    const tote = await ToteRepository.findById(id, userId);
    if (!tote) {
      logger.debug('Tote not found', { toteId: id, userId });
    }
    return tote;
  } catch (error) {
    logger.logError('Error in getToteById', error, { toteId: id, userId });
    throw error;
  }
};

export const createTote = async (toteData, userId) => {
  const timer = logger.startTimer();
  logger.info('Creating new tote', { userId, location: toteData.location });

  try {
    // Validate tote data
    const validation = validateTote(toteData);
    if (!validation.valid) {
      logger.logValidationError('createTote', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Add userId to tote data
    const toteWithUser = {
      ...toteData,
      userId,
    };

    // Create tote in database
    const newTote = await ToteRepository.create(toteWithUser);
    logger.info('Tote created successfully', { toteId: newTote.id, userId });
    timer.end('createTote completed');
    return newTote;
  } catch (error) {
    logger.logError('Error in createTote', error, { userId, toteData });
    throw error;
  }
};

export const updateTote = async (id, toteData, userId) => {
  const timer = logger.startTimer();
  logger.info('Updating tote', { toteId: id, userId });

  try {
    // Validate update data
    const validation = validateTote(toteData, true); // true = isUpdate
    if (!validation.valid) {
      logger.logValidationError('updateTote', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Check if tote exists and belongs to user
    const existingTote = await ToteRepository.findById(id, userId);
    if (!existingTote) {
      logger.warn('Tote not found for update', { toteId: id, userId });
      return null;
    }

    // Update tote in database (userId ensures only user's totes can be updated)
    const updatedTote = await ToteRepository.update(id, toteData, userId);
    logger.info('Tote updated successfully', { toteId: id, userId });
    timer.end('updateTote completed');
    return updatedTote;
  } catch (error) {
    logger.logError('Error in updateTote', error, { toteId: id, userId, toteData });
    throw error;
  }
};

export const deleteTote = async (id, userId) => {
  const timer = logger.startTimer();
  logger.info('Deleting tote', { toteId: id, userId });

  try {
    // Check if tote exists and belongs to user
    const existingTote = await ToteRepository.findById(id, userId);
    if (!existingTote) {
      logger.warn('Tote not found for deletion', { toteId: id, userId });
      return false;
    }

    // Business logic validation: check if tote has items (belonging to this user)
    const itemCount = await ToteRepository.countItems(id, userId);
    if (itemCount > 0) {
      logger.warn('Cannot delete tote with items', { toteId: id, userId, itemCount });
      throw new Error(
        `Cannot delete tote: it contains ${itemCount} item(s). ` +
        'Please remove or reassign items before deleting the tote.'
      );
    }

    // Delete tote from database (userId ensures only user's totes can be deleted)
    const deleted = await ToteRepository.delete(id, userId);
    logger.info('Tote deleted successfully', { toteId: id, userId });
    timer.end('deleteTote completed');
    return deleted;
  } catch (error) {
    logger.logError('Error in deleteTote', error, { toteId: id, userId });
    throw error;
  }
};

export const getToteItems = async (toteId, userId) => {
  logger.debug('Getting tote items', { toteId, userId });
  try {
    const items = await ToteRepository.getItemsInTote(toteId, userId);
    if (items === null) {
      logger.debug('Tote not found', { toteId, userId });
      return null;
    }
    logger.debug('Tote items retrieved', { toteId, userId, count: items.length });
    return items;
  } catch (error) {
    logger.logError('Error in getToteItems', error, { toteId, userId });
    throw error;
  }
};

/**
 * Upload photos to a tote
 * @param {number} toteId - The tote ID
 * @param {Array} files - Array of multer file objects
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Updated tote with new photos
 */
export const uploadTotePhotos = async (toteId, files, userId) => {
  const timer = logger.startTimer();
  logger.info('Uploading photos to tote', { toteId, userId, fileCount: files.length });

  try {
    // Check if tote exists and belongs to user
    const existingTote = await ToteRepository.findById(toteId, userId);
    if (!existingTote) {
      logger.warn('Tote not found for photo upload', { toteId, userId });
      return null;
    }

    const storage = getStorageService();
    const uploadedUrls = [];

    // Upload each file
    for (const file of files) {
      const key = generatePhotoKey(file, `totes/${toteId}`);

      logger.debug('Uploading photo', {
        toteId,
        userId,
        filename: file.originalname,
        size: file.size,
        key
      });

      const result = await storage.putObject({
        key,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          toteId: toteId.toString(),
          userId: userId.toString(),
          originalName: file.originalname
        }
      });

      uploadedUrls.push(result.url);
      logger.debug('Photo uploaded successfully', { url: result.url });
    }

    // Add new URLs to existing photos array
    const currentPhotos = existingTote.photos || [];
    const updatedPhotos = [...currentPhotos, ...uploadedUrls];

    // Update tote with new photos
    const updatedTote = await ToteRepository.update(toteId, { photos: updatedPhotos }, userId);

    logger.info('Photos uploaded and tote updated', {
      toteId,
      userId,
      newPhotoCount: uploadedUrls.length,
      totalPhotos: updatedPhotos.length
    });
    timer.end('uploadTotePhotos completed');

    return updatedTote;
  } catch (error) {
    logger.logError('Error in uploadTotePhotos', error, { toteId, userId });
    throw error;
  }
};

/**
 * Delete a photo from a tote
 * @param {number} toteId - The tote ID
 * @param {string} photoUrl - The photo URL to delete
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Updated tote with photo removed
 */
export const deleteTotePhoto = async (toteId, photoUrl, userId) => {
  const timer = logger.startTimer();
  logger.info('Deleting photo from tote', { toteId, userId, photoUrl });

  try {
    // Check if tote exists and belongs to user
    const existingTote = await ToteRepository.findById(toteId, userId);
    if (!existingTote) {
      logger.warn('Tote not found for photo deletion', { toteId, userId });
      return null;
    }

    // Check if photo exists in tote
    const currentPhotos = existingTote.photos || [];
    if (!currentPhotos.includes(photoUrl)) {
      logger.warn('Photo not found in tote', { toteId, userId, photoUrl });
      throw new Error('Photo not found in this tote');
    }

    const storage = getStorageService();

    // Delete from storage
    try {
      const key = storage.keyFromUrl(photoUrl);
      await storage.deleteObject({ key });
      logger.debug('Photo deleted from storage', { key });
    } catch (error) {
      logger.warn('Failed to delete photo from storage', { error: error.message, photoUrl });
      // Continue even if storage deletion fails - remove from database anyway
    }

    // Remove URL from photos array
    const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);

    // Update tote
    const updatedTote = await ToteRepository.update(toteId, { photos: updatedPhotos }, userId);

    logger.info('Photo deleted and tote updated', {
      toteId,
      userId,
      remainingPhotos: updatedPhotos.length
    });
    timer.end('deleteTotePhoto completed');

    return updatedTote;
  } catch (error) {
    logger.logError('Error in deleteTotePhoto', error, { toteId, userId, photoUrl });
    throw error;
  }
};

/**
 * Analyze tote photos using AI to identify items
 * @param {string} toteId - The tote ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Object containing AI availability status and identified items
 */
export const analyzeTotePhotos = async (toteId, userId) => {
  const timer = logger.startTimer();
  logger.info('Analyzing tote photos with AI', { toteId, userId });

  try {
    // Check if AI is available
    if (!isAIAvailable()) {
      logger.warn('AI analysis requested but not available', { toteId, userId });
      return {
        available: false,
        message: 'AI features are not enabled. Please start the YOLO service.',
        items: [],
      };
    }

    // Check if tote exists and belongs to user
    const tote = await ToteRepository.findById(toteId, userId);
    if (!tote) {
      logger.warn('Tote not found for AI analysis', { toteId, userId });
      return null;
    }

    // Check if tote has photos
    const photos = tote.photos || [];
    if (photos.length === 0) {
      logger.info('No photos to analyze for tote', { toteId, userId });
      return {
        available: true,
        message: 'No photos available to analyze. Upload photos first.',
        items: [],
      };
    }

    // Analyze photos with AI
    const identifiedItems = await analyzeMultiplePhotos(photos);

    logger.info('AI analysis completed for tote', {
      toteId,
      userId,
      photosAnalyzed: photos.length,
      itemsIdentified: identifiedItems.length,
    });

    timer.end('analyzeTotePhotos completed');

    return {
      available: true,
      message: `Found ${identifiedItems.length} items in ${photos.length} photo(s)`,
      items: identifiedItems,
      photosAnalyzed: photos.length,
    };
  } catch (error) {
    logger.logError('Error in analyzeTotePhotos', error, { toteId, userId });
    throw error;
  }
};
