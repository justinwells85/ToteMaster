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
      const userId = 1;
      const itemData = {
        name: 'Test Item',
        description: 'Test Description',
        category: 'Test Category',
      };

      const mockCreatedItem = {
        id: 'item-123',
        ...itemData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockItemRepository.create.mockResolvedValue(mockCreatedItem);

      const result = await createItem(itemData, userId);

      expect(mockItemRepository.create).toHaveBeenCalledWith({ ...itemData, userId });
      expect(result).toEqual(mockCreatedItem);
    });

    it('should validate tote exists when toteId is provided', async () => {
      const userId = 1;
      const itemData = {
        name: 'Test Item',
        toteId: 123,
      };

      const mockTote = {
        id: 123,
        name: 'Test Tote',
      };

      mockToteRepository.findById.mockResolvedValue(mockTote);
      mockItemRepository.create.mockResolvedValue({ id: 'item-123', ...itemData, userId });

      await createItem(itemData, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(123, userId);
      expect(mockItemRepository.create).toHaveBeenCalled();
    });

    it('should throw error when tote does not exist', async () => {
      const userId = 1;
      const itemData = {
        name: 'Test Item',
        toteId: 999,
      };

      mockToteRepository.findById.mockResolvedValue(null);

      await expect(createItem(itemData, userId)).rejects.toThrow("Tote with ID '999' does not exist");
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid data', async () => {
      const userId = 1;
      const invalidItemData = {
        name: '', // Empty name should fail validation
      };

      await expect(createItem(invalidItemData, userId)).rejects.toThrow('Validation failed');
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid condition', async () => {
      const userId = 1;
      const invalidItemData = {
        name: 'Test Item',
        condition: 'invalid-condition',
      };

      await expect(createItem(invalidItemData, userId)).rejects.toThrow('Validation failed');
      expect(mockItemRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllItems', () => {
    it('should return all items with pagination', async () => {
      const userId = 1;
      const mockResult = {
        data: [
          { id: 'item-1', name: 'Item 1' },
          { id: 'item-2', name: 'Item 2' },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockItemRepository.findAll.mockResolvedValue(mockResult);

      const result = await getAllItems(userId, { paginate: true, page: 1, limit: 10 });

      expect(mockItemRepository.findAll).toHaveBeenCalledWith({
        userId,
        page: 1,
        limit: 10,
        sortBy: undefined,
        sortOrder: undefined,
        toteId: undefined,
        category: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it('should pass filter options to repository', async () => {
      const userId = 1;
      const options = {
        paginate: true,
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        toteId: 'tote-123',
      };

      mockItemRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 2, limit: 5, totalPages: 0 });

      await getAllItems(userId, options);

      expect(mockItemRepository.findAll).toHaveBeenCalledWith({
        userId,
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
        toteId: 'tote-123',
        category: undefined,
      });
    });
  });

  describe('getItemById', () => {
    it('should return item when found', async () => {
      const userId = 1;
      const mockItem = {
        id: 'item-123',
        name: 'Test Item',
      };

      mockItemRepository.findById.mockResolvedValue(mockItem);

      const result = await getItemById('item-123', userId);

      expect(mockItemRepository.findById).toHaveBeenCalledWith('item-123', userId);
      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      const userId = 1;
      mockItemRepository.findById.mockResolvedValue(null);

      const result = await getItemById('non-existent-id', userId);

      expect(result).toBeNull();
    });
  });

  describe('updateItem', () => {
    it('should update item with valid data', async () => {
      const userId = 1;
      const updates = {
        name: 'Updated Name',
        quantity: 10,
      };

      const existingItem = {
        id: 'item-123',
        name: 'Old Name',
        quantity: 5,
        userId,
      };

      const mockUpdatedItem = {
        ...existingItem,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      mockItemRepository.findById.mockResolvedValue(existingItem);
      mockItemRepository.update.mockResolvedValue(mockUpdatedItem);

      const result = await updateItem('item-123', updates, userId);

      expect(mockItemRepository.findById).toHaveBeenCalledWith('item-123', userId);
      expect(mockItemRepository.update).toHaveBeenCalledWith('item-123', updates, userId);
      expect(result).toEqual(mockUpdatedItem);
    });

    it('should validate tote exists when updating toteId', async () => {
      const userId = 1;
      const updates = {
        toteId: 123,
      };

      const existingItem = {
        id: 'item-123',
        name: 'Test Item',
        toteId: 456,
        userId,
      };

      const mockTote = {
        id: 123,
        name: 'Test Tote',
      };

      mockItemRepository.findById.mockResolvedValue(existingItem);
      mockToteRepository.findById.mockResolvedValue(mockTote);
      mockItemRepository.update.mockResolvedValue({ ...existingItem, ...updates });

      await updateItem('item-123', updates, userId);

      expect(mockItemRepository.findById).toHaveBeenCalledWith('item-123', userId);
      expect(mockToteRepository.findById).toHaveBeenCalledWith(123, userId);
      expect(mockItemRepository.update).toHaveBeenCalled();
    });

    it('should throw error when updating to non-existent tote', async () => {
      const userId = 1;
      const updates = {
        toteId: 999,
      };

      const existingItem = {
        id: 'item-123',
        name: 'Test Item',
        toteId: 456,
        userId,
      };

      mockItemRepository.findById.mockResolvedValue(existingItem);
      mockToteRepository.findById.mockResolvedValue(null);

      await expect(updateItem('item-123', updates, userId)).rejects.toThrow("Tote with ID '999' does not exist");
      expect(mockItemRepository.update).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid update data', async () => {
      const userId = 1;
      const invalidUpdates = {
        condition: 'invalid-condition',
      };

      await expect(updateItem('item-123', invalidUpdates, userId)).rejects.toThrow('Validation failed');
      expect(mockItemRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('should delete item when it exists', async () => {
      const userId = 1;
      mockItemRepository.delete.mockResolvedValue(true);

      const result = await deleteItem('item-123', userId);

      expect(mockItemRepository.delete).toHaveBeenCalledWith('item-123', userId);
      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      const userId = 1;
      mockItemRepository.delete.mockResolvedValue(false);

      const result = await deleteItem('non-existent-id', userId);

      expect(result).toBe(false);
    });
  });

  describe('searchItems', () => {
    it('should search items with query', async () => {
      const userId = 1;
      const mockResults = {
        data: [
          { id: 'item-1', name: 'Test Item 1' },
          { id: 'item-2', name: 'Test Item 2' },
        ],
        total: 2,
        page: 1,
        limit: 1000,
        totalPages: 1,
      };

      mockItemRepository.search.mockResolvedValue(mockResults);

      const result = await searchItems('test', userId);

      expect(mockItemRepository.search).toHaveBeenCalledWith('test', { userId, page: 1, limit: 1000 });
      expect(result).toEqual(mockResults.data);
    });

    it('should return empty array for no matches', async () => {
      const userId = 1;
      const mockResults = {
        data: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
      };

      mockItemRepository.search.mockResolvedValue(mockResults);

      const result = await searchItems('nonexistent', userId);

      expect(result).toEqual([]);
    });
  });

  describe('getItemsByToteId', () => {
    it('should return items in tote', async () => {
      const userId = 1;
      const mockItems = [
        { id: 'item-1', name: 'Item 1', toteId: 'tote-123' },
        { id: 'item-2', name: 'Item 2', toteId: 'tote-123' },
      ];

      mockItemRepository.findByToteId.mockResolvedValue(mockItems);

      const result = await getItemsByToteId('tote-123', userId);

      expect(mockItemRepository.findByToteId).toHaveBeenCalledWith('tote-123', userId);
      expect(result).toEqual(mockItems);
    });
  });
});
