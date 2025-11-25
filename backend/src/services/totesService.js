import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateTote } from '../models/Tote.js';
import logger from '../utils/logger.js';

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
    logger.debug('Tote items retrieved', { toteId, userId, count: items.length });
    return items;
  } catch (error) {
    logger.logError('Error in getToteItems', error, { toteId, userId });
    throw error;
  }
};
