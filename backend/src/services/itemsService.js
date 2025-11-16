import { readData, writeData } from '../utils/dataStore.js';

export const getAllItems = async () => {
  const data = await readData();
  return data.items || [];
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

  const newItem = {
    id: generateId(),
    ...itemData,
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

  data.items[index] = {
    ...data.items[index],
    ...itemData,
    id, // Preserve the original ID
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

export const searchItems = async (query) => {
  const data = await readData();
  const lowerQuery = query.toLowerCase();

  return data.items?.filter(item =>
    item.name?.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery) ||
    item.category?.toLowerCase().includes(lowerQuery) ||
    item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  ) || [];
};

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
