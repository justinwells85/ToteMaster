import * as totesService from '../services/totesService.js';

export const getAllTotes = async (req, res) => {
  try {
    const totes = await totesService.getAllTotes();
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
    const newTote = await totesService.createTote(req.body);
    res.status(201).json(newTote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTote = async (req, res) => {
  try {
    const updatedTote = await totesService.updateTote(req.params.id, req.body);
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
