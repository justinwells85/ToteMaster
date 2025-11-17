import * as itemsService from '../services/itemsService.js';
import { parsePagination, parseSort } from '../utils/queryHelpers.js';

export const getAllItems = async (req, res) => {
  try {
    const allowedSortFields = ['name', 'category', 'quantity', 'condition', 'createdAt', 'updatedAt'];

    // Parse query parameters
    const pagination = parsePagination(req.query);
    const sort = parseSort(req.query, allowedSortFields, 'createdAt');

    // Build options
    const options = {
      ...sort,
      paginate: req.query.page !== undefined,
      ...pagination,
    };

    const items = await itemsService.getAllItems(options);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await itemsService.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createItem = async (req, res) => {
  try {
    // Use validatedData from middleware
    const newItem = await itemsService.createItem(req.validatedData);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    // Use validatedData from middleware
    const updatedItem = await itemsService.updateItem(req.params.id, req.validatedData);
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const deleted = await itemsService.deleteItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getItemsByTote = async (req, res) => {
  try {
    const items = await itemsService.getItemsByTote(req.params.toteId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchItems = async (req, res) => {
  try {
    const allowedSortFields = ['name', 'category', 'quantity', 'condition', 'createdAt', 'updatedAt'];

    // Parse query parameters
    const pagination = parsePagination(req.query);
    const sort = parseSort(req.query, allowedSortFields, 'name');

    // Build options
    const options = {
      ...sort,
      paginate: req.query.page !== undefined,
      ...pagination,
    };

    const items = await itemsService.searchItems(req.params.query, options);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
