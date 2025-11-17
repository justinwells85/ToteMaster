import { describe, it, expect, beforeEach, vi } from 'vitest';
import { itemsApi, containersApi, locationsApi } from './api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('itemsApi', () => {
    describe('getAll', () => {
      it('should fetch all items successfully', async () => {
        const mockItems = {
          data: [
            { id: '1', name: 'Item 1' },
            { id: '2', name: 'Item 2' },
          ],
          pagination: { total: 2, page: 1, limit: 10 },
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockItems,
        });

        const result = await itemsApi.getAll();

        expect(global.fetch).toHaveBeenCalledWith('/api/items');
        expect(result).toEqual(mockItems);
      });

      it('should throw error when fetch fails', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(itemsApi.getAll()).rejects.toThrow('Failed to fetch items');
      });
    });

    describe('getById', () => {
      it('should fetch item by id successfully', async () => {
        const mockItem = { id: '1', name: 'Test Item' };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockItem,
        });

        const result = await itemsApi.getById('1');

        expect(global.fetch).toHaveBeenCalledWith('/api/items/1');
        expect(result).toEqual(mockItem);
      });

      it('should throw error when item not found', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(itemsApi.getById('999')).rejects.toThrow('Failed to fetch item');
      });
    });

    describe('create', () => {
      it('should create item successfully', async () => {
        const newItem = {
          name: 'New Item',
          description: 'Test Description',
        };

        const createdItem = {
          id: '1',
          ...newItem,
          createdAt: new Date().toISOString(),
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => createdItem,
        });

        const result = await itemsApi.create(newItem);

        expect(global.fetch).toHaveBeenCalledWith('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
        expect(result).toEqual(createdItem);
      });

      it('should throw error when create fails', async () => {
        const newItem = { name: 'New Item' };

        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(itemsApi.create(newItem)).rejects.toThrow('Failed to create item');
      });
    });

    describe('update', () => {
      it('should update item successfully', async () => {
        const itemId = '1';
        const updates = { name: 'Updated Item' };
        const updatedItem = {
          id: itemId,
          name: 'Updated Item',
          updatedAt: new Date().toISOString(),
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => updatedItem,
        });

        const result = await itemsApi.update(itemId, updates);

        expect(global.fetch).toHaveBeenCalledWith(`/api/items/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updates, id: itemId }),
        });
        expect(result).toEqual(updatedItem);
      });

      it('should handle 204 No Content response', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        const result = await itemsApi.update('1', { name: 'Updated' });

        expect(result).toBeNull();
      });

      it('should throw error when update fails', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(itemsApi.update('1', { name: 'Updated' })).rejects.toThrow('Failed to update item');
      });
    });

    describe('delete', () => {
      it('should delete item successfully', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        const result = await itemsApi.delete('1');

        expect(global.fetch).toHaveBeenCalledWith('/api/items/1', {
          method: 'DELETE',
        });
        expect(result).toBeNull();
      });

      it('should throw error when delete fails', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(itemsApi.delete('1')).rejects.toThrow('Failed to delete item');
      });
    });

    describe('search', () => {
      it('should search items successfully', async () => {
        const mockResults = {
          data: [
            { id: '1', name: 'Test Item' },
          ],
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResults,
        });

        const result = await itemsApi.search('test');

        expect(global.fetch).toHaveBeenCalledWith('/api/items/search/test');
        expect(result).toEqual(mockResults);
      });

      it('should throw error when search fails', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(itemsApi.search('test')).rejects.toThrow('Failed to search items');
      });
    });
  });

  describe('containersApi', () => {
    describe('getAll', () => {
      it('should fetch all containers successfully', async () => {
        const mockContainers = [
          { id: '1', name: 'Container 1' },
          { id: '2', name: 'Container 2' },
        ];

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockContainers,
        });

        const result = await containersApi.getAll();

        expect(global.fetch).toHaveBeenCalledWith('/api/containers');
        expect(result).toEqual(mockContainers);
      });

      it('should throw error when fetch fails', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(containersApi.getAll()).rejects.toThrow('Failed to fetch containers');
      });
    });

    describe('create', () => {
      it('should create container successfully', async () => {
        const newContainer = {
          name: 'New Container',
          location: 'Garage',
        };

        const createdContainer = {
          id: '1',
          ...newContainer,
          createdAt: new Date().toISOString(),
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => createdContainer,
        });

        const result = await containersApi.create(newContainer);

        expect(global.fetch).toHaveBeenCalledWith('/api/containers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newContainer),
        });
        expect(result).toEqual(createdContainer);
      });
    });

    describe('delete', () => {
      it('should delete container successfully', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        const result = await containersApi.delete('1');

        expect(global.fetch).toHaveBeenCalledWith('/api/containers/1', {
          method: 'DELETE',
        });
        expect(result).toBeNull();
      });
    });
  });

  describe('locationsApi', () => {
    describe('getAll', () => {
      it('should fetch all locations successfully', async () => {
        const mockLocations = [
          { id: '1', name: 'Garage' },
          { id: '2', name: 'Basement' },
        ];

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockLocations,
        });

        const result = await locationsApi.getAll();

        expect(global.fetch).toHaveBeenCalledWith('/api/locations');
        expect(result).toEqual(mockLocations);
      });

      it('should throw error when fetch fails', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
        });

        await expect(locationsApi.getAll()).rejects.toThrow('Failed to fetch locations');
      });
    });
  });
});
