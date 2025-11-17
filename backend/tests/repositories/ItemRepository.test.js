import { jest } from '@jest/globals';
import ItemRepository from '../../src/db/repositories/ItemRepository.js';
import { setupTestDb, cleanTestDb, closeTestDb, createTestTote, createTestItem } from '../helpers/testDb.js';

describe('ItemRepository', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const itemData = {
        name: 'Test Item',
        description: 'Test Description',
        category: 'Test Category',
        quantity: 5,
        condition: 'good',
        tags: ['test', 'item'],
      };

      const item = await ItemRepository.create(itemData);

      expect(item).toHaveProperty('id');
      expect(item.name).toBe(itemData.name);
      expect(item.description).toBe(itemData.description);
      expect(item.category).toBe(itemData.category);
      expect(item.quantity).toBe(itemData.quantity);
      expect(item.condition).toBe(itemData.condition);
      expect(item.tags).toEqual(itemData.tags);
      expect(item).toHaveProperty('createdAt');
      expect(item).toHaveProperty('updatedAt');
    });

    it('should create item with tote reference', async () => {
      const tote = await createTestTote({ name: 'Test Tote' });

      const itemData = {
        name: 'Item in Tote',
        toteId: tote.id,
      };

      const item = await ItemRepository.create(itemData);

      expect(item.toteId).toBe(tote.id);
    });

    it('should create item with minimal data', async () => {
      const itemData = {
        name: 'Minimal Item',
      };

      const item = await ItemRepository.create(itemData);

      expect(item.id).toBeDefined();
      expect(item.name).toBe(itemData.name);
      expect(item.quantity).toBe(1); // Default
      expect(item.tags).toEqual([]); // Default
    });
  });

  describe('findAll', () => {
    it('should return all items with pagination', async () => {
      // Create test items
      await createTestItem({ name: 'Item 1' });
      await createTestItem({ name: 'Item 2' });
      await createTestItem({ name: 'Item 3' });

      const result = await ItemRepository.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should paginate results correctly', async () => {
      // Create 5 items
      for (let i = 1; i <= 5; i++) {
        await createTestItem({ name: `Item ${i}` });
      }

      const page1 = await ItemRepository.findAll({ page: 1, limit: 2 });
      const page2 = await ItemRepository.findAll({ page: 2, limit: 2 });

      expect(page1.items).toHaveLength(2);
      expect(page2.items).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page2.total).toBe(5);
      expect(page1.totalPages).toBe(3);
    });

    it('should filter by toteId', async () => {
      const tote1 = await createTestTote({ name: 'Tote 1' });
      const tote2 = await createTestTote({ name: 'Tote 2' });

      await createTestItem({ name: 'Item 1', toteId: tote1.id });
      await createTestItem({ name: 'Item 2', toteId: tote1.id });
      await createTestItem({ name: 'Item 3', toteId: tote2.id });

      const result = await ItemRepository.findAll({ toteId: tote1.id });

      expect(result.items).toHaveLength(2);
      expect(result.items.every(item => item.toteId === tote1.id)).toBe(true);
    });

    it('should sort items', async () => {
      await createTestItem({ name: 'Charlie' });
      await createTestItem({ name: 'Alice' });
      await createTestItem({ name: 'Bob' });

      const ascResult = await ItemRepository.findAll({ sortBy: 'name', sortOrder: 'asc' });
      expect(ascResult.items[0].name).toBe('Alice');
      expect(ascResult.items[1].name).toBe('Bob');
      expect(ascResult.items[2].name).toBe('Charlie');

      const descResult = await ItemRepository.findAll({ sortBy: 'name', sortOrder: 'desc' });
      expect(descResult.items[0].name).toBe('Charlie');
      expect(descResult.items[1].name).toBe('Bob');
      expect(descResult.items[2].name).toBe('Alice');
    });
  });

  describe('findById', () => {
    it('should find item by id', async () => {
      const created = await createTestItem({ name: 'Find Me' });

      const found = await ItemRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const found = await ItemRepository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      const item = await createTestItem({ name: 'Original Name', quantity: 1 });

      const updated = await ItemRepository.update(item.id, {
        name: 'Updated Name',
        quantity: 10,
      });

      expect(updated.id).toBe(item.id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.quantity).toBe(10);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(item.updatedAt).getTime());
    });

    it('should return null when updating non-existent item', async () => {
      const updated = await ItemRepository.update('non-existent-id', { name: 'Test' });

      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete item', async () => {
      const item = await createTestItem({ name: 'Delete Me' });

      const deleted = await ItemRepository.delete(item.id);

      expect(deleted).toBe(true);

      const found = await ItemRepository.findById(item.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent item', async () => {
      const deleted = await ItemRepository.delete('non-existent-id');

      expect(deleted).toBe(false);
    });
  });

  describe('search', () => {
    it('should search items by name', async () => {
      await createTestItem({ name: 'Red Ball' });
      await createTestItem({ name: 'Blue Ball' });
      await createTestItem({ name: 'Green Car' });

      const results = await ItemRepository.search('Ball');

      expect(results).toHaveLength(2);
      expect(results.every(item => item.name.includes('Ball'))).toBe(true);
    });

    it('should search items by description', async () => {
      await createTestItem({ name: 'Item 1', description: 'Contains keyword' });
      await createTestItem({ name: 'Item 2', description: 'No match' });

      const results = await ItemRepository.search('keyword');

      expect(results).toHaveLength(1);
      expect(results[0].description).toContain('keyword');
    });

    it('should search items by category', async () => {
      await createTestItem({ name: 'Item 1', category: 'Electronics' });
      await createTestItem({ name: 'Item 2', category: 'Tools' });

      const results = await ItemRepository.search('Electronics');

      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Electronics');
    });

    it('should search items by tags', async () => {
      await createTestItem({ name: 'Item 1', tags: ['vintage', 'collectible'] });
      await createTestItem({ name: 'Item 2', tags: ['modern', 'new'] });

      const results = await ItemRepository.search('vintage');

      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('vintage');
    });

    it('should be case-insensitive', async () => {
      await createTestItem({ name: 'UPPERCASE NAME' });

      const results = await ItemRepository.search('uppercase');

      expect(results).toHaveLength(1);
    });
  });

  describe('findByToteId', () => {
    it('should find all items in a tote', async () => {
      const tote = await createTestTote({ name: 'Test Tote' });
      await createTestItem({ name: 'Item 1', toteId: tote.id });
      await createTestItem({ name: 'Item 2', toteId: tote.id });
      await createTestItem({ name: 'Item 3', toteId: null });

      const items = await ItemRepository.findByToteId(tote.id);

      expect(items).toHaveLength(2);
      expect(items.every(item => item.toteId === tote.id)).toBe(true);
    });

    it('should return empty array for tote with no items', async () => {
      const tote = await createTestTote({ name: 'Empty Tote' });

      const items = await ItemRepository.findByToteId(tote.id);

      expect(items).toEqual([]);
    });
  });
});
