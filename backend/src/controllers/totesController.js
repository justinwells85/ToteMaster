import * as totesService from '../services/totesService.js';
import { parsePagination, parseSort } from '../utils/queryHelpers.js';
import logger from '../utils/logger.js';

export const getAllTotes = async (req, res) => {
  try {
    const totes = await totesService.getAllTotes(req.user.userId);
    logger.debug('getAllTotes controller completed', { userId: req.user.userId, count: totes.length });
    res.json(totes);
  } catch (error) {
    logger.logError('Error in getAllTotes controller', error, { userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

export const getToteById = async (req, res) => {
  try {
    const tote = await totesService.getToteById(req.params.id, req.user.userId);
    if (!tote) {
      logger.debug('Tote not found in controller', { toteId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tote not found' });
    }
    res.json(tote);
  } catch (error) {
    logger.logError('Error in getToteById controller', error, { toteId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

export const createTote = async (req, res) => {
  try {
    // Use validatedData from middleware and userId from auth
    const newTote = await totesService.createTote(req.validatedData, req.user.userId);
    logger.info('Tote created via controller', { toteId: newTote.id, userId: req.user.userId });
    res.status(201).json(newTote);
  } catch (error) {
    logger.logError('Error in createTote controller', error, { userId: req.user.userId });
    res.status(400).json({ error: error.message });
  }
};

export const updateTote = async (req, res) => {
  try {
    // Use validatedData from middleware and userId from auth
    const updatedTote = await totesService.updateTote(req.params.id, req.validatedData, req.user.userId);
    if (!updatedTote) {
      logger.debug('Tote not found for update in controller', { toteId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tote not found' });
    }
    logger.info('Tote updated via controller', { toteId: req.params.id, userId: req.user.userId });
    res.json(updatedTote);
  } catch (error) {
    logger.logError('Error in updateTote controller', error, { toteId: req.params.id, userId: req.user.userId });
    res.status(400).json({ error: error.message });
  }
};

export const deleteTote = async (req, res) => {
  try {
    const deleted = await totesService.deleteTote(req.params.id, req.user.userId);
    if (!deleted) {
      logger.debug('Tote not found for deletion in controller', { toteId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tote not found' });
    }
    logger.info('Tote deleted via controller', { toteId: req.params.id, userId: req.user.userId });
    res.status(204).send();
  } catch (error) {
    logger.logError('Error in deleteTote controller', error, { toteId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

export const uploadPhotos = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      logger.debug('No files uploaded', { toteId: req.params.id, userId: req.user.userId });
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const updatedTote = await totesService.uploadTotePhotos(
      req.params.id,
      req.files,
      req.user.userId
    );

    if (!updatedTote) {
      logger.debug('Tote not found for photo upload in controller', { toteId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tote not found' });
    }

    logger.info('Photos uploaded via controller', {
      toteId: req.params.id,
      userId: req.user.userId,
      fileCount: req.files.length
    });

    res.json(updatedTote);
  } catch (error) {
    logger.logError('Error in uploadPhotos controller', error, {
      toteId: req.params.id,
      userId: req.user.userId
    });
    res.status(500).json({ error: error.message });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      logger.debug('No photo URL provided', { toteId: req.params.id, userId: req.user.userId });
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    const updatedTote = await totesService.deleteTotePhoto(
      req.params.id,
      photoUrl,
      req.user.userId
    );

    if (!updatedTote) {
      logger.debug('Tote not found for photo deletion in controller', { toteId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tote not found' });
    }

    logger.info('Photo deleted via controller', {
      toteId: req.params.id,
      userId: req.user.userId,
      photoUrl
    });

    res.json(updatedTote);
  } catch (error) {
    logger.logError('Error in deletePhoto controller', error, {
      toteId: req.params.id,
      userId: req.user.userId
    });
    res.status(400).json({ error: error.message });
  }
};

export const analyzePhotos = async (req, res) => {
  try {
    const result = await totesService.analyzeTotePhotos(
      req.params.id,
      req.user.userId
    );

    if (result === null) {
      logger.debug('Tote not found for photo analysis in controller', { toteId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Tote not found' });
    }

    logger.info('Photos analyzed via controller', {
      toteId: req.params.id,
      userId: req.user.userId,
      itemsFound: result.items.length
    });

    res.json(result);
  } catch (error) {
    logger.logError('Error in analyzePhotos controller', error, {
      toteId: req.params.id,
      userId: req.user.userId
    });

    // Provide user-friendly error messages
    if (error.message.includes('not running')) {
      return res.status(503).json({ error: 'YOLO service is not running. Please start the AI service.' });
    } else if (error.message.includes('timeout')) {
      return res.status(408).json({ error: 'Analysis timeout. Try analyzing fewer photos or smaller images.' });
    } else if (error.message.includes('image')) {
      return res.status(400).json({ error: 'Unable to process image. Please ensure photos are accessible.' });
    }

    res.status(500).json({ error: 'Failed to analyze photos. Please try again.' });
  }
};
