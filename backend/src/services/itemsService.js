import { readData, writeData } from '../utils/dataStore.js';
import { createItemModel } from '../models/Item.js';
import { getToteById } from './totesService.js';
import { sortItems, paginateItems, createPaginatedResponse } from '../utils/queryHelpers.js';

export const getAllItems = async (options = {}) => {
  const data = await readData();
  let items = data.items || [];

  // Apply sorting if requested
  if (options.sortBy) {
    items = sortItems(items, options.sortBy, options.sortOrder);
  }

  // Apply pagination if requested
  if (options.paginate) {
    const total = items.length;
    const paginatedItems = paginateItems(items, options.offset, options.limit);
    return createPaginatedResponse(paginatedItems, total, options.page, options.limit);
  }

  return items;
};

export const getItemById = async (id) => {
  const data = await readData();
  return data.items?.find(item => item.id === id);
};

export const createItem = async (itemData) => {
  const data = await readData();

  if (!data.items) {
    data.items = [];
  }

  // Business logic validation: if toteId is provided, ensure tote exists
  if (itemData.toteId) {
    const tote = await getToteById(itemData.toteId);
    if (!tote) {
      throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
    }
  }

  // Create item using model
  const itemModel = createItemModel(itemData);

  const newItem = {
    id: generateId(),
    ...itemModel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.items.push(newItem);
  await writeData(data);

  return newItem;
};

export const updateItem = async (id, itemData) => {
  const data = await readData();
  const index = data.items?.findIndex(item => item.id === id);

  if (index === -1 || index === undefined) {
    return null;
  }

  // Business logic validation: if toteId is being changed, ensure new tote exists
  if (itemData.toteId && itemData.toteId !== data.items[index].toteId) {
    const tote = await getToteById(itemData.toteId);
    if (!tote) {
      throw new Error(`Tote with ID '${itemData.toteId}' does not exist`);
    }
  }

  data.items[index] = {
    ...data.items[index],
    ...itemData,
    id, // Preserve the original ID
    createdAt: data.items[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  await writeData(data);
  return data.items[index];
};

export const deleteItem = async (id) => {
  const data = await readData();
  const index = data.items?.findIndex(item => item.id === id);

  if (index === -1 || index === undefined) {
    return false;
  }

  data.items.splice(index, 1);
  await writeData(data);
  return true;
};

export const getItemsByTote = async (toteId) => {
  const data = await readData();
  return data.items?.filter(item => item.toteId === toteId) || [];
};

export const searchItems = async (query, options = {}) => {
  const data = await readData();
  const lowerQuery = query.toLowerCase().trim();

  // Search across multiple fields
  let results = data.items?.filter(item =>
    item.name?.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery) ||
    item.category?.toLowerCase().includes(lowerQuery) ||
    item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  ) || [];

  // Apply sorting if requested
  if (options.sortBy) {
    results = sortItems(results, options.sortBy, options.sortOrder);
  }

  // Apply pagination if requested
  if (options.paginate) {
    const total = results.length;
    const paginatedResults = paginateItems(results, options.offset, options.limit);
    return createPaginatedResponse(paginatedResults, total, options.page, options.limit);
  }

  return results;
};

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
