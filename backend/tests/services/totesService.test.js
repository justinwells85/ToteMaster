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
      const toteData = {
        name: 'Test Tote',
        location: 'Garage',
        description: 'Test Description',
        color: 'blue',
      };

      const mockCreatedTote = {
        id: 'tote-123',
        ...toteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData);

      expect(mockToteRepository.create).toHaveBeenCalledWith(toteData);
      expect(result).toEqual(mockCreatedTote);
    });

    it('should create tote with minimal data', async () => {
      const toteData = {
        name: 'Minimal Tote',
      };

      const mockCreatedTote = {
        id: 'tote-123',
        ...toteData,
        location: null,
        description: null,
        color: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData);

      expect(mockToteRepository.create).toHaveBeenCalledWith(toteData);
      expect(result).toEqual(mockCreatedTote);
    });

    it('should throw validation error for invalid data', async () => {
      const invalidToteData = {
        name: '', // Empty name should fail validation
      };

      await expect(createTote(invalidToteData)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for missing name', async () => {
      const invalidToteData = {
        location: 'Garage',
      };

      await expect(createTote(invalidToteData)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllTotes', () => {
    it('should return all totes', async () => {
      const mockTotes = [
        { id: 'tote-1', name: 'Tote 1' },
        { id: 'tote-2', name: 'Tote 2' },
      ];

      mockToteRepository.findAll.mockResolvedValue(mockTotes);

      const result = await getAllTotes();

      expect(mockToteRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTotes);
    });

    it('should return empty array when no totes exist', async () => {
      mockToteRepository.findAll.mockResolvedValue([]);

      const result = await getAllTotes();

      expect(result).toEqual([]);
    });
  });

  describe('getToteById', () => {
    it('should return tote when found', async () => {
      const mockTote = {
        id: 'tote-123',
        name: 'Test Tote',
      };

      mockToteRepository.findById.mockResolvedValue(mockTote);

      const result = await getToteById('tote-123');

      expect(mockToteRepository.findById).toHaveBeenCalledWith('tote-123');
      expect(result).toEqual(mockTote);
    });

    it('should return null when tote not found', async () => {
      mockToteRepository.findById.mockResolvedValue(null);

      const result = await getToteById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateTote', () => {
    it('should update tote with valid data', async () => {
      const updates = {
        name: 'Updated Name',
        location: 'Basement',
      };

      const mockUpdatedTote = {
        id: 'tote-123',
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.update.mockResolvedValue(mockUpdatedTote);

      const result = await updateTote('tote-123', updates);

      expect(mockToteRepository.update).toHaveBeenCalledWith('tote-123', updates);
      expect(result).toEqual(mockUpdatedTote);
    });

    it('should allow partial updates', async () => {
      const updates = {
        location: 'New Location',
      };

      const mockUpdatedTote = {
        id: 'tote-123',
        name: 'Original Name',
        location: 'New Location',
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.update.mockResolvedValue(mockUpdatedTote);

      const result = await updateTote('tote-123', updates);

      expect(mockToteRepository.update).toHaveBeenCalledWith('tote-123', updates);
      expect(result).toEqual(mockUpdatedTote);
    });

    it('should throw validation error for invalid update data', async () => {
      const invalidUpdates = {
        name: '', // Empty name should fail
      };

      await expect(updateTote('tote-123', invalidUpdates)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when updating non-existent tote', async () => {
      const updates = { name: 'Updated' };

      mockToteRepository.update.mockResolvedValue(null);

      const result = await updateTote('non-existent-id', updates);

      expect(result).toBeNull();
    });
  });

  describe('deleteTote', () => {
    it('should delete empty tote', async () => {
      mockToteRepository.findById.mockResolvedValue({ id: 'tote-123', name: 'Test Tote' });
      mockToteRepository.countItems.mockResolvedValue(0);
      mockToteRepository.delete.mockResolvedValue(true);

      const result = await deleteTote('tote-123');

      expect(mockToteRepository.findById).toHaveBeenCalledWith('tote-123');
      expect(mockToteRepository.countItems).toHaveBeenCalledWith('tote-123');
      expect(mockToteRepository.delete).toHaveBeenCalledWith('tote-123');
      expect(result).toBe(true);
    });

    it('should throw error when deleting tote with items', async () => {
      mockToteRepository.findById.mockResolvedValue({ id: 'tote-123', name: 'Test Tote' });
      mockToteRepository.countItems.mockResolvedValue(5);

      await expect(deleteTote('tote-123')).rejects.toThrow(
        'Cannot delete tote: it contains 5 item(s). Please remove or reassign items before deleting the tote.'
      );

      expect(mockToteRepository.findById).toHaveBeenCalledWith('tote-123');
      expect(mockToteRepository.countItems).toHaveBeenCalledWith('tote-123');
      expect(mockToteRepository.delete).not.toHaveBeenCalled();
    });

    it('should return false when deleting non-existent tote', async () => {
      mockToteRepository.findById.mockResolvedValue(null);

      const result = await deleteTote('non-existent-id');

      expect(mockToteRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockToteRepository.countItems).not.toHaveBeenCalled();
      expect(mockToteRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getToteItems', () => {
    it('should return items in tote', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Item 1', toteId: 'tote-123' },
        { id: 'item-2', name: 'Item 2', toteId: 'tote-123' },
      ];

      mockToteRepository.getItemsInTote.mockResolvedValue(mockItems);

      const result = await getToteItems('tote-123');

      expect(mockToteRepository.getItemsInTote).toHaveBeenCalledWith('tote-123');
      expect(result).toEqual(mockItems);
    });

    it('should return empty array for empty tote', async () => {
      mockToteRepository.getItemsInTote.mockResolvedValue([]);

      const result = await getToteItems('tote-123');

      expect(result).toEqual([]);
    });

    it('should return null for non-existent tote', async () => {
      mockToteRepository.getItemsInTote.mockResolvedValue(null);

      const result = await getToteItems('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
