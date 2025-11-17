import ItemRepository from '../db/repositories/ItemRepository.js';
import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateItem } from '../models/Item.js';

export const getAllItems = async (options = {}) => {
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
    page: 1,
    limit: 1000, // Large limit for "all" items
    sortBy,
    sortOrder,
    toteId,
    category,
  });

  return result.data;
};

export const getItemById = async (id) => {
  return await ItemRepository.findById(id);
};

export const createItem = async (itemData) => {
  // Validate item data
  const validation = validateItem(itemData);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Business logic validation: if toteId is provided, ensure tote exists
  if (itemData.toteId) {
    const tote = await ToteRepository.findById(itemData.toteId);
    if (!tote) {
      throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
    }
  }

  // Create item in database
  return await ItemRepository.create(itemData);
};

export const updateItem = async (id, itemData) => {
  // Validate update data
  const validation = validateItem(itemData, true); // true = isUpdate
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Check if item exists
  const existingItem = await ItemRepository.findById(id);
  if (!existingItem) {
    return null;
  }

  // Business logic validation: if toteId is being changed, ensure new tote exists
  if (itemData.toteId && itemData.toteId !== existingItem.toteId) {
    const tote = await ToteRepository.findById(itemData.toteId);
    if (!tote) {
      throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
    }
  }

  // Update item in database
  return await ItemRepository.update(id, itemData);
};

export const deleteItem = async (id) => {
  return await ItemRepository.delete(id);
};

export const getItemsByTote = async (toteId) => {
  return await ItemRepository.findByToteId(toteId);
};

export const searchItems = async (query, options = {}) => {
  const {
    sortBy,
    sortOrder,
    paginate = false,
    page = 1,
    limit = 10,
  } = options;

  // Use repository's search method with pagination
  if (paginate) {
    return await ItemRepository.search(query, { page, limit });
  }

  // Otherwise, get all search results
  const result = await ItemRepository.search(query, { page: 1, limit: 1000 });
  return result.data;
};
