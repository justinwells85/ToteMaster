import * as itemsService from '../services/itemsService.js';
import { parsePagination, parseSort } from '../utils/queryHelpers.js';
import logger from '../utils/logger.js';

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

    const items = await itemsService.getAllItems(req.user.userId, options);
    logger.debug('getAllItems controller completed', { userId: req.user.userId, count: Array.isArray(items) ? items.length : items.data?.length });
    res.json(items);
  } catch (error) {
    logger.logError('Error in getAllItems controller', error, { userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await itemsService.getItemById(req.params.id, req.user.userId);
    if (!item) {
      logger.debug('Item not found in controller', { itemId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    logger.logError('Error in getItemById controller', error, { itemId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

export const createItem = async (req, res) => {
  try {
    // Use validatedData from middleware and userId from auth
    const newItem = await itemsService.createItem(req.validatedData, req.user.userId);
    logger.info('Item created via controller', { itemId: newItem.id, userId: req.user.userId });
    res.status(201).json(newItem);
  } catch (error) {
    logger.logError('Error in createItem controller', error, { userId: req.user.userId });
    res.status(400).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    // Use validatedData from middleware and userId from auth
    const updatedItem = await itemsService.updateItem(req.params.id, req.validatedData, req.user.userId);
    if (!updatedItem) {
      logger.debug('Item not found for update in controller', { itemId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Item not found' });
    }
    logger.info('Item updated via controller', { itemId: req.params.id, userId: req.user.userId });
    res.json(updatedItem);
  } catch (error) {
    logger.logError('Error in updateItem controller', error, { itemId: req.params.id, userId: req.user.userId });
    res.status(400).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const deleted = await itemsService.deleteItem(req.params.id, req.user.userId);
    if (!deleted) {
      logger.debug('Item not found for deletion in controller', { itemId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ error: 'Item not found' });
    }
    logger.info('Item deleted via controller', { itemId: req.params.id, userId: req.user.userId });
    res.status(204).send();
  } catch (error) {
    logger.logError('Error in deleteItem controller', error, { itemId: req.params.id, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};

export const getItemsByTote = async (req, res) => {
  try {
    const items = await itemsService.getItemsByToteId(req.params.toteId, req.user.userId);
    logger.debug('Items by tote retrieved in controller', { toteId: req.params.toteId, userId: req.user.userId, count: items.length });
    res.json(items);
  } catch (error) {
    logger.logError('Error in getItemsByTote controller', error, { toteId: req.params.toteId, userId: req.user.userId });
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

    const items = await itemsService.searchItems(req.params.query, req.user.userId, options);
    logger.info('Item search completed in controller', { query: req.params.query, userId: req.user.userId, count: Array.isArray(items) ? items.length : items.data?.length });
    res.json(items);
  } catch (error) {
    logger.logError('Error in searchItems controller', error, { query: req.params.query, userId: req.user.userId });
    res.status(500).json({ error: error.message });
  }
};
