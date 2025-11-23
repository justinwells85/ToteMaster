import { jest } from '@jest/globals';

// Mock the repository before importing the service
const mockToteRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countItems: jest.fn(),
  getItemsInTote: jest.fn(),
};

// Mock the repository module
jest.unstable_mockModule('../../src/db/repositories/ToteRepository.js', () => ({
  default: mockToteRepository,
}));

// Import service after mocking
const { createTote, getAllTotes, getToteById, updateTote, deleteTote, getToteItems } =
  await import('../../src/services/totesService.js');

describe('Totes Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createTote', () => {
    it('should create a tote with valid data', async () => {
      const userId = 1;
      const toteData = {
        location: 'Garage',
        description: 'Test Description',
        color: 'blue',
        locationId: 1,
      };

      const mockCreatedTote = {
        id: 1,
        ...toteData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData, userId);

      expect(mockToteRepository.create).toHaveBeenCalledWith({ ...toteData, userId });
      expect(result).toEqual(mockCreatedTote);
    });

    it('should create tote with minimal data', async () => {
      const userId = 1;
      const toteData = {
        location: 'Garage',
      };

      const mockCreatedTote = {
        id: 1,
        ...toteData,
        userId,
        locationId: null,
        description: null,
        color: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData, userId);

      expect(mockToteRepository.create).toHaveBeenCalledWith({ ...toteData, userId });
      expect(result).toEqual(mockCreatedTote);
    });

    it('should throw validation error for invalid data', async () => {
      const userId = 1;
      const invalidToteData = {
        location: 'A'.repeat(201), // Too long location
      };

      await expect(createTote(invalidToteData, userId)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.create).not.toHaveBeenCalled();
    });

    it('should accept empty tote data (all fields optional)', async () => {
      const userId = 1;
      const toteData = {};

      const mockCreatedTote = {
        id: 1,
        userId,
        location: null,
        locationId: null,
        description: null,
        color: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData, userId);

      expect(mockToteRepository.create).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockCreatedTote);
    });
  });

  describe('getAllTotes', () => {
    it('should return all totes', async () => {
      const userId = 1;
      const mockTotes = [
        { id: 1, location: 'Garage', userId },
        { id: 2, location: 'Basement', userId },
      ];

      mockToteRepository.findAll.mockResolvedValue(mockTotes);

      const result = await getAllTotes(userId);

      expect(mockToteRepository.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTotes);
    });

    it('should return empty array when no totes exist', async () => {
      const userId = 1;
      mockToteRepository.findAll.mockResolvedValue([]);

      const result = await getAllTotes(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getToteById', () => {
    it('should return tote when found', async () => {
      const userId = 1;
      const mockTote = {
        id: 1,
        location: 'Garage',
        userId,
      };

      mockToteRepository.findById.mockResolvedValue(mockTote);

      const result = await getToteById(1, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(1, userId);
      expect(result).toEqual(mockTote);
    });

    it('should return null when tote not found', async () => {
      const userId = 1;
      mockToteRepository.findById.mockResolvedValue(null);

      const result = await getToteById(999, userId);

      expect(result).toBeNull();
    });
  });

  describe('updateTote', () => {
    it('should update tote with valid data', async () => {
      const userId = 1;
      const updates = {
        location: 'Basement',
        color: 'red',
      };

      const mockExistingTote = { id: 1, location: 'Garage', userId };
      const mockUpdatedTote = {
        id: 1,
        ...updates,
        userId,
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.findById.mockResolvedValue(mockExistingTote);
      mockToteRepository.update.mockResolvedValue(mockUpdatedTote);

      const result = await updateTote(1, updates, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(1, userId);
      expect(mockToteRepository.update).toHaveBeenCalledWith(1, updates, userId);
      expect(result).toEqual(mockUpdatedTote);
    });

    it('should allow partial updates', async () => {
      const userId = 1;
      const updates = {
        location: 'New Location',
      };

      const mockExistingTote = { id: 1, location: 'Garage', userId };
      const mockUpdatedTote = {
        id: 1,
        location: 'New Location',
        userId,
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.findById.mockResolvedValue(mockExistingTote);
      mockToteRepository.update.mockResolvedValue(mockUpdatedTote);

      const result = await updateTote(1, updates, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(1, userId);
      expect(mockToteRepository.update).toHaveBeenCalledWith(1, updates, userId);
      expect(result).toEqual(mockUpdatedTote);
    });

    it('should throw validation error for invalid update data', async () => {
      const userId = 1;
      const invalidUpdates = {
        location: 'A'.repeat(201), // Too long
      };

      await expect(updateTote(1, invalidUpdates, userId)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when updating non-existent tote', async () => {
      const userId = 1;
      const updates = { location: 'Updated' };

      mockToteRepository.findById.mockResolvedValue(null);

      const result = await updateTote(999, updates, userId);

      expect(result).toBeNull();
    });
  });

  describe('deleteTote', () => {
    it('should delete empty tote', async () => {
      const userId = 1;
      mockToteRepository.findById.mockResolvedValue({ id: 1, location: 'Garage', userId });
      mockToteRepository.countItems.mockResolvedValue(0);
      mockToteRepository.delete.mockResolvedValue(true);

      const result = await deleteTote(1, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(1, userId);
      expect(mockToteRepository.countItems).toHaveBeenCalledWith(1, userId);
      expect(mockToteRepository.delete).toHaveBeenCalledWith(1, userId);
      expect(result).toBe(true);
    });

    it('should throw error when deleting tote with items', async () => {
      const userId = 1;
      mockToteRepository.findById.mockResolvedValue({ id: 1, location: 'Garage', userId });
      mockToteRepository.countItems.mockResolvedValue(5);

      await expect(deleteTote(1, userId)).rejects.toThrow(
        'Cannot delete tote: it contains 5 item(s). Please remove or reassign items before deleting the tote.'
      );

      expect(mockToteRepository.findById).toHaveBeenCalledWith(1, userId);
      expect(mockToteRepository.countItems).toHaveBeenCalledWith(1, userId);
      expect(mockToteRepository.delete).not.toHaveBeenCalled();
    });

    it('should return false when deleting non-existent tote', async () => {
      const userId = 1;
      mockToteRepository.findById.mockResolvedValue(null);

      const result = await deleteTote(999, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(999, userId);
      expect(mockToteRepository.countItems).not.toHaveBeenCalled();
      expect(mockToteRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getToteItems', () => {
    it('should return items in tote', async () => {
      const userId = 1;
      const mockItems = [
        { id: 1, name: 'Item 1', toteId: 1, userId },
        { id: 2, name: 'Item 2', toteId: 1, userId },
      ];

      mockToteRepository.getItemsInTote.mockResolvedValue(mockItems);

      const result = await getToteItems(1, userId);

      expect(mockToteRepository.getItemsInTote).toHaveBeenCalledWith(1, userId);
      expect(result).toEqual(mockItems);
    });

    it('should return empty array for empty tote', async () => {
      const userId = 1;
      mockToteRepository.getItemsInTote.mockResolvedValue([]);

      const result = await getToteItems(1, userId);

      expect(result).toEqual([]);
    });

    it('should return null for non-existent tote', async () => {
      const userId = 1;
      mockToteRepository.getItemsInTote.mockResolvedValue(null);

      const result = await getToteItems(999, userId);

      expect(result).toBeNull();
    });
  });
});
