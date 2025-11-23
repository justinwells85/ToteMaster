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
