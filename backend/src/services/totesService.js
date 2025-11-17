import { readData, writeData } from '../utils/dataStore.js';
import { createToteModel } from '../models/Tote.js';
import { sortItems, paginateItems, createPaginatedResponse } from '../utils/queryHelpers.js';

export const getAllTotes = async (options = {}) => {
  const data = await readData();
  let totes = data.totes || [];

  // Apply sorting if requested
  if (options.sortBy) {
    totes = sortItems(totes, options.sortBy, options.sortOrder);
  }

  // Apply pagination if requested
  if (options.paginate) {
    const total = totes.length;
    const paginatedTotes = paginateItems(totes, options.offset, options.limit);
    return createPaginatedResponse(paginatedTotes, total, options.page, options.limit);
  }

  return totes;
};

export const getToteById = async (id) => {
  const data = await readData();
  return data.totes?.find(tote => tote.id === id);
};

export const createTote = async (toteData) => {
  const data = await readData();

  if (!data.totes) {
    data.totes = [];
  }

  // Create tote using model
  const toteModel = createToteModel(toteData);

  const newTote = {
    id: generateId(),
    ...toteModel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.totes.push(newTote);
  await writeData(data);

  return newTote;
};

export const updateTote = async (id, toteData) => {
  const data = await readData();
  const index = data.totes?.findIndex(tote => tote.id === id);

  if (index === -1 || index === undefined) {
    return null;
  }

  data.totes[index] = {
    ...data.totes[index],
    ...toteData,
    id, // Preserve the original ID
    createdAt: data.totes[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  await writeData(data);
  return data.totes[index];
};

export const deleteTote = async (id) => {
  const data = await readData();
  const index = data.totes?.findIndex(tote => tote.id === id);

  if (index === -1 || index === undefined) {
    return false;
  }

  // Business logic validation: check if tote has items
  const itemsInTote = data.items?.filter(item => item.toteId === id) || [];
  if (itemsInTote.length > 0) {
    throw new Error(
      `Cannot delete tote: it contains ${itemsInTote.length} item(s). ` +
      'Please remove or reassign items before deleting the tote.'
    );
  }

  data.totes.splice(index, 1);
  await writeData(data);
  return true;
};

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
