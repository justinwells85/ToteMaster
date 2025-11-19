import * as totesService from '../services/totesService.js';
import { parsePagination, parseSort } from '../utils/queryHelpers.js';
import logger from '../utils/logger.js';

export const getAllTotes = async (req, res) => {
  try {
    const totes = await totesService.getAllTotes(req.user.userId);
    res.json(totes);
  } catch (error) {
    logger.error('Error in getAllTotes:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getToteById = async (req, res) => {
  try {
    const tote = await totesService.getToteById(req.params.id, req.user.userId);
    if (!tote) {
      return res.status(404).json({ error: 'Tote not found' });
    }
    res.json(tote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTote = async (req, res) => {
  try {
    // Use validatedData from middleware and userId from auth
    const newTote = await totesService.createTote(req.validatedData, req.user.userId);
    res.status(201).json(newTote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTote = async (req, res) => {
  try {
    // Use validatedData from middleware and userId from auth
    const updatedTote = await totesService.updateTote(req.params.id, req.validatedData, req.user.userId);
    if (!updatedTote) {
      return res.status(404).json({ error: 'Tote not found' });
    }
    res.json(updatedTote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTote = async (req, res) => {
  try {
    const deleted = await totesService.deleteTote(req.params.id, req.user.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Tote not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
