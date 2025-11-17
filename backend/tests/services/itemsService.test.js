import { jest } from '@jest/globals';

// Mock the repositories before importing the service
const mockItemRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  findByToteId: jest.fn(),
};

const mockToteRepository = {
  findById: jest.fn(),
};

// Mock the repository modules
jest.unstable_mockModule('../../src/db/repositories/ItemRepository.js', () => ({
  default: mockItemRepository,
}));

jest.unstable_mockModule('../../src/db/repositories/ToteRepository.js', () => ({
  default: mockToteRepository,
}));

// Import service after mocking
const { createItem, getAllItems, getItemById, updateItem, deleteItem, searchItems, getItemsByToteId } =
  await import('../../src/services/itemsService.js');

describe('Items Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an item with valid data', async () => {
      const itemData = {
        name: 'Test Item',
        description: 'Test Description',
        category: 'Test Category',
      };

      const mockCreatedItem = {
        id: 'item-123',
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockItemRepository.create.mockResolvedValue(mockCreatedItem);

      const result = await createItem(itemData);

      expect(mockItemRepository.create).toHaveBeenCalledWith(itemData);
      expect(result).toEqual(mockCreatedItem);
    });

    it('should validate tote exists when toteId is provided', async () => {
      const itemData = {
        name: 'Test Item',
        toteId: 'tote-123',
      };

      const mockTote = {
        id: 'tote-123',
        name: 'Test Tote',
      };

      mockToteRepository.findById.mockResolvedValue(mockTote);
      mockItemRepository.create.mockResolvedValue({ id: 'item-123', ...itemData });

      await createItem(itemData);

      expect(mockToteRepository.findById).toHaveBeenCalledWith('tote-123');
      expect(mockItemRepository.create).toHaveBeenCalled();
    });

    it('should throw error when tote does not exist', async () => {
      const itemData = {
        name: 'Test Item',
        toteId: 'non-existent-tote',
      };

      mockToteRepository.findById.mockResolvedValue(null);

      await expect(createItem(itemData)).rejects.toThrow("Tote with ID 'non-existent-tote' does not exist");
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid data', async () => {
      const invalidItemData = {
        name: '', // Empty name should fail validation
      };

      await expect(createItem(invalidItemData)).rejects.toThrow('Validation failed');
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid condition', async () => {
      const invalidItemData = {
        name: 'Test Item',
        condition: 'invalid-condition',
      };

      await expect(createItem(invalidItemData)).rejects.toThrow('Validation failed');
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllItems', () => {
    it('should return all items with pagination', async () => {
      const mockResult = {
        items: [
          { id: 'item-1', name: 'Item 1' },
          { id: 'item-2', name: 'Item 2' },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockItemRepository.findAll.mockResolvedValue(mockResult);

      const result = await getAllItems({ page: 1, limit: 10 });

      expect(mockItemRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockResult);
    });

    it('should pass filter options to repository', async () => {
      const options = {
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        toteId: 'tote-123',
      };

      mockItemRepository.findAll.mockResolvedValue({ items: [], total: 0, page: 2, limit: 5, totalPages: 0 });

      await getAllItems(options);

      expect(mockItemRepository.findAll).toHaveBeenCalledWith(options);
    });
  });

  describe('getItemById', () => {
    it('should return item when found', async () => {
      const mockItem = {
        id: 'item-123',
        name: 'Test Item',
      };

      mockItemRepository.findById.mockResolvedValue(mockItem);

      const result = await getItemById('item-123');

      expect(mockItemRepository.findById).toHaveBeenCalledWith('item-123');
      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      const result = await getItemById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateItem', () => {
    it('should update item with valid data', async () => {
      const updates = {
        name: 'Updated Name',
        quantity: 10,
      };

      const mockUpdatedItem = {
        id: 'item-123',
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      mockItemRepository.update.mockResolvedValue(mockUpdatedItem);

      const result = await updateItem('item-123', updates);

      expect(mockItemRepository.update).toHaveBeenCalledWith('item-123', updates);
      expect(result).toEqual(mockUpdatedItem);
    });

    it('should validate tote exists when updating toteId', async () => {
      const updates = {
        toteId: 'tote-123',
      };

      const mockTote = {
        id: 'tote-123',
        name: 'Test Tote',
      };

      mockToteRepository.findById.mockResolvedValue(mockTote);
      mockItemRepository.update.mockResolvedValue({ id: 'item-123', ...updates });

      await updateItem('item-123', updates);

      expect(mockToteRepository.findById).toHaveBeenCalledWith('tote-123');
      expect(mockItemRepository.update).toHaveBeenCalled();
    });

    it('should throw error when updating to non-existent tote', async () => {
      const updates = {
        toteId: 'non-existent-tote',
      };

      mockToteRepository.findById.mockResolvedValue(null);

      await expect(updateItem('item-123', updates)).rejects.toThrow("Tote with ID 'non-existent-tote' does not exist");
      expect(mockItemRepository.update).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid update data', async () => {
      const invalidUpdates = {
        condition: 'invalid-condition',
      };

      await expect(updateItem('item-123', invalidUpdates)).rejects.toThrow('Validation failed');
      expect(mockItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('should delete item when it exists', async () => {
      mockItemRepository.delete.mockResolvedValue(true);

      const result = await deleteItem('item-123');

      expect(mockItemRepository.delete).toHaveBeenCalledWith('item-123');
      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      mockItemRepository.delete.mockResolvedValue(false);

      const result = await deleteItem('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('searchItems', () => {
    it('should search items with query', async () => {
      const mockResults = [
        { id: 'item-1', name: 'Test Item 1' },
        { id: 'item-2', name: 'Test Item 2' },
      ];

      mockItemRepository.search.mockResolvedValue(mockResults);

      const result = await searchItems('test');

      expect(mockItemRepository.search).toHaveBeenCalledWith('test');
      expect(result).toEqual(mockResults);
    });

    it('should return empty array for no matches', async () => {
      mockItemRepository.search.mockResolvedValue([]);

      const result = await searchItems('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getItemsByToteId', () => {
    it('should return items in tote', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Item 1', toteId: 'tote-123' },
        { id: 'item-2', name: 'Item 2', toteId: 'tote-123' },
      ];

      mockItemRepository.findByToteId.mockResolvedValue(mockItems);

      const result = await getItemsByToteId('tote-123');

      expect(mockItemRepository.findByToteId).toHaveBeenCalledWith('tote-123');
      expect(result).toEqual(mockItems);
    });
  });
});
