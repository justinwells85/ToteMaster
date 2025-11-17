import * as totesService from '../services/totesService.js';
import { parsePagination, parseSort } from '../utils/queryHelpers.js';

export const getAllTotes = async (req, res) => {
  try {
    const allowedSortFields = ['name', 'location', 'size', 'createdAt', 'updatedAt'];

    // Parse query parameters
    const pagination = parsePagination(req.query);
    const sort = parseSort(req.query, allowedSortFields, 'createdAt');

    // Build options
    const options = {
      ...sort,
      paginate: req.query.page !== undefined,
      ...pagination,
    };

    const totes = await totesService.getAllTotes(options);
    res.json(totes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getToteById = async (req, res) => {
  try {
    const tote = await totesService.getToteById(req.params.id);
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
    // Use validatedData from middleware
    const newTote = await totesService.createTote(req.validatedData);
    res.status(201).json(newTote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTote = async (req, res) => {
  try {
    // Use validatedData from middleware
    const updatedTote = await totesService.updateTote(req.params.id, req.validatedData);
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
    const deleted = await totesService.deleteTote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tote not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
