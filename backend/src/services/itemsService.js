import ItemRepository from '../db/repositories/ItemRepository.js';
import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateItem } from '../models/Item.js';

export const getAllItems = async (userId, options = {}) => {
  const {
    sortBy,
    sortOrder,
    paginate = false,
    page = 1,
    limit = 10,
    toteId,
    category,
  } = options;

  // If pagination is requested, use repository's pagination support
  if (paginate) {
    return await ItemRepository.findAll({
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
      toteId,
      category,
    });
  }

  // Otherwise, get all items (still uses pagination internally but returns just data)
  const result = await ItemRepository.findAll({
    userId,
    page: 1,
    limit: 1000, // Large limit for "all" items
    sortBy,
    sortOrder,
    toteId,
    category,
  });

  return result.data;
};

export const getItemById = async (id, userId) => {
  return await ItemRepository.findById(id, userId);
};

export const createItem = async (itemData, userId) => {
  // Validate item data
  const validation = validateItem(itemData);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Business logic validation: if toteId is provided, ensure tote exists and belongs to user
  if (itemData.toteId) {
    const tote = await ToteRepository.findById(itemData.toteId, userId);
    if (!tote) {
      throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
    }
  }

  // Add userId to item data
  const itemWithUser = {
    ...itemData,
    userId,
  };

  // Create item in database
  return await ItemRepository.create(itemWithUser);
};

export const updateItem = async (id, itemData, userId) => {
  // Validate update data
  const validation = validateItem(itemData, true); // true = isUpdate
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Check if item exists and belongs to user
  const existingItem = await ItemRepository.findById(id, userId);
  if (!existingItem) {
    return null;
  }

  // Business logic validation: if toteId is being changed, ensure new tote exists and belongs to user
  if (itemData.toteId && itemData.toteId !== existingItem.toteId) {
    const tote = await ToteRepository.findById(itemData.toteId, userId);
    if (!tote) {
      throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
    }
  }

  // Update item in database (userId ensures only user's items can be updated)
  return await ItemRepository.update(id, itemData, userId);
};

export const deleteItem = async (id, userId) => {
  return await ItemRepository.delete(id, userId);
};

export const getItemsByToteId = async (toteId, userId) => {
  return await ItemRepository.findByToteId(toteId, userId);
};

export const searchItems = async (query, userId, options = {}) => {
  const {
    sortBy,
    sortOrder,
    paginate = false,
    page = 1,
    limit = 10,
  } = options;

  // Use repository's search method with pagination
  if (paginate) {
    return await ItemRepository.search(query, { userId, page, limit });
  }

  // Otherwise, get all search results
  const result = await ItemRepository.search(query, { userId, page: 1, limit: 1000 });
  return result.data;
};
