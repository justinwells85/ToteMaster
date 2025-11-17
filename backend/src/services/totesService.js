import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateTote } from '../models/Tote.js';

export const getAllTotes = async (options = {}) => {
  return await ToteRepository.findAll();
};

export const getToteById = async (id) => {
  return await ToteRepository.findById(id);
};

export const createTote = async (toteData) => {
  // Validate tote data
  const validation = validateTote(toteData);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Create tote in database
  return await ToteRepository.create(toteData);
};

export const updateTote = async (id, toteData) => {
  // Validate update data
  const validation = validateTote(toteData, true); // true = isUpdate
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Check if tote exists
  const existingTote = await ToteRepository.findById(id);
  if (!existingTote) {
    return null;
  }

  // Update tote in database
  return await ToteRepository.update(id, toteData);
};

export const deleteTote = async (id) => {
  // Check if tote exists
  const existingTote = await ToteRepository.findById(id);
  if (!existingTote) {
    return false;
  }

  // Business logic validation: check if tote has items
  const itemCount = await ToteRepository.countItems(id);
  if (itemCount > 0) {
    throw new Error(
      `Cannot delete tote: it contains ${itemCount} item(s). ` +
      'Please remove or reassign items before deleting the tote.'
    );
  }

  // Delete tote from database
  return await ToteRepository.delete(id);
};
