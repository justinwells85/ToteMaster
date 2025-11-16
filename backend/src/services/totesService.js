import { readData, writeData } from '../utils/dataStore.js';

export const getAllTotes = async () => {
  const data = await readData();
  return data.totes || [];
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

  const newTote = {
    id: generateId(),
    ...toteData,
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

  data.totes.splice(index, 1);
  await writeData(data);
  return true;
};

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
