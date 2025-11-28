import ItemRepository from '../db/repositories/ItemRepository.js';
import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateItem } from '../models/Item.js';
import logger from '../utils/logger.js';

export const getAllItems = async (userId, options = {}) => {
  const timer = logger.startTimer();
  logger.debug('getAllItems called', { userId, options });

  const {
    sortBy,
    sortOrder,
    paginate = false,
    page = 1,
    limit = 10,
    toteId,
    category,
  } = options;

  try {
    // If pagination is requested, use repository's pagination support
    if (paginate) {
      logger.debug('Fetching items with pagination', { userId, page, limit });
      const result = await ItemRepository.findAll({
        userId,
        page,
        limit,
        sortBy,
        sortOrder,
        toteId,
        category,
      });
      timer.end('getAllItems completed (paginated)');
      return result;
    }

    // Otherwise, get all items (still uses pagination internally but returns just data)
    logger.debug('Fetching all items without pagination', { userId });
    const result = await ItemRepository.findAll({
      userId,
      page: 1,
      limit: 1000, // Large limit for "all" items
      sortBy,
      sortOrder,
      toteId,
      category,
    });

    timer.end('getAllItems completed');
    return result.data;
  } catch (error) {
    logger.logError('Error in getAllItems', error, { userId, options });
    throw error;
  }
};

export const getItemById = async (id, userId) => {
  logger.debug('getItemById called', { id, userId });
  try {
    const item = await ItemRepository.findById(id, userId);
    if (!item) {
      logger.debug('Item not found', { id, userId });
    }
    return item;
  } catch (error) {
    logger.logError('Error in getItemById', error, { id, userId });
    throw error;
  }
};

export const createItem = async (itemData, userId) => {
  const timer = logger.startTimer();
  logger.info('Creating new item', { userId, itemName: itemData.name });

  try {
    // Validate item data
    const validation = validateItem(itemData);
    if (!validation.valid) {
      logger.logValidationError('createItem', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Business logic validation: if toteId is provided, ensure tote exists and belongs to user
    if (itemData.toteId) {
      logger.debug('Validating tote existence', { toteId: itemData.toteId, userId });
      const tote = await ToteRepository.findById(itemData.toteId, userId);
      if (!tote) {
        logger.warn('Tote not found for item creation', { toteId: itemData.toteId, userId });
        throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
      }
    }

    // Add userId to item data
    const itemWithUser = {
      ...itemData,
      userId,
    };

    // Create item in database
    const newItem = await ItemRepository.create(itemWithUser);
    logger.info('Item created successfully', { itemId: newItem.id, userId });
    timer.end('createItem completed');
    return newItem;
  } catch (error) {
    logger.logError('Error in createItem', error, { userId, itemData });
    throw error;
  }
};

export const updateItem = async (id, itemData, userId) => {
  const timer = logger.startTimer();
  logger.info('Updating item', { itemId: id, userId });

  try {
    // Validate update data
    const validation = validateItem(itemData, true); // true = isUpdate
    if (!validation.valid) {
      logger.logValidationError('updateItem', validation.errors);
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Check if item exists and belongs to user
    const existingItem = await ItemRepository.findById(id, userId);
    if (!existingItem) {
      logger.warn('Item not found for update', { itemId: id, userId });
      return null;
    }

    // Business logic validation: if toteId is being changed, ensure new tote exists and belongs to user
    if (itemData.toteId && itemData.toteId !== existingItem.toteId) {
      logger.debug('Validating new tote for item update', {
        itemId: id,
        oldToteId: existingItem.toteId,
        newToteId: itemData.toteId,
        userId
      });
      const tote = await ToteRepository.findById(itemData.toteId, userId);
      if (!tote) {
        logger.warn('New tote not found for item update', { toteId: itemData.toteId, userId });
        throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
      }
    }

    // Update item in database (userId ensures only user's items can be updated)
    const updatedItem = await ItemRepository.update(id, itemData, userId);
    logger.info('Item updated successfully', { itemId: id, userId });
    timer.end('updateItem completed');
    return updatedItem;
  } catch (error) {
    logger.logError('Error in updateItem', error, { itemId: id, userId, itemData });
    throw error;
  }
};

export const deleteItem = async (id, userId) => {
  logger.info('Deleting item', { itemId: id, userId });
  try {
    const deleted = await ItemRepository.delete(id, userId);
    if (deleted) {
      logger.info('Item deleted successfully', { itemId: id, userId });
    } else {
      logger.warn('Item not found for deletion', { itemId: id, userId });
    }
    return deleted;
  } catch (error) {
    logger.logError('Error in deleteItem', error, { itemId: id, userId });
    throw error;
  }
};

export const getItemsByToteId = async (toteId, userId) => {
  logger.debug('Getting items by tote ID', { toteId, userId });
  try {
    const items = await ItemRepository.findByToteId(toteId, userId);
    logger.debug('Items retrieved by tote ID', { toteId, userId, count: items.length });
    return items;
  } catch (error) {
    logger.logError('Error in getItemsByToteId', error, { toteId, userId });
    throw error;
  }
};

export const searchItems = async (query, userId, options = {}) => {
  const timer = logger.startTimer();
  logger.info('Searching items', { query, userId, options });

  const {
    sortBy,
    sortOrder,
    paginate = false,
    page = 1,
    limit = 10,
  } = options;

  try {
    // Use repository's search method with pagination
    if (paginate) {
      const result = await ItemRepository.search(query, { userId, page, limit });
      logger.info('Item search completed (paginated)', {
        query,
        userId,
        resultCount: result.data.length,
        total: result.total
      });
      timer.end('searchItems completed (paginated)');
      return result;
    }

    // Otherwise, get all search results
    const result = await ItemRepository.search(query, { userId, page: 1, limit: 1000 });
    logger.info('Item search completed', { query, userId, resultCount: result.data.length });
    timer.end('searchItems completed');
    return result.data;
  } catch (error) {
    logger.logError('Error in searchItems', error, { query, userId, options });
    throw error;
  }
};
