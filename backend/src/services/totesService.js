import ToteRepository from '../db/repositories/ToteRepository.js';
import { validateTote } from '../models/Tote.js';

export const getAllTotes = async (userId) => {
  return await ToteRepository.findAll(userId);
};

export const getToteById = async (id, userId) => {
  return await ToteRepository.findById(id, userId);
};

export const createTote = async (toteData, userId) => {
  // Validate tote data
  const validation = validateTote(toteData);
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Add userId to tote data
  const toteWithUser = {
    ...toteData,
    userId,
  };

  // Create tote in database
  return await ToteRepository.create(toteWithUser);
};

export const updateTote = async (id, toteData, userId) => {
  // Validate update data
  const validation = validateTote(toteData, true); // true = isUpdate
  if (!validation.valid) {
    const error = new Error('Validation failed');
    error.details = validation.errors;
    throw error;
  }

  // Check if tote exists and belongs to user
  const existingTote = await ToteRepository.findById(id, userId);
  if (!existingTote) {
    return null;
  }

  // Update tote in database (userId ensures only user's totes can be updated)
  return await ToteRepository.update(id, toteData, userId);
};

export const deleteTote = async (id, userId) => {
  // Check if tote exists and belongs to user
  const existingTote = await ToteRepository.findById(id, userId);
  if (!existingTote) {
    return false;
  }

  // Business logic validation: check if tote has items (belonging to this user)
  const itemCount = await ToteRepository.countItems(id, userId);
  if (itemCount > 0) {
    throw new Error(
      `Cannot delete tote: it contains ${itemCount} item(s). ` +
      'Please remove or reassign items before deleting the tote.'
    );
  }

  // Delete tote from database (userId ensures only user's totes can be deleted)
  return await ToteRepository.delete(id, userId);
};

export const getToteItems = async (toteId, userId) => {
  return await ToteRepository.getItemsInTote(toteId, userId);
};
