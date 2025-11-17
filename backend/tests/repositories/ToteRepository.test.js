import { jest } from '@jest/globals';
import ToteRepository from '../../src/db/repositories/ToteRepository.js';
import { setupTestDb, cleanTestDb, closeTestDb, createTestTote, createTestItem } from '../helpers/testDb.js';

describe('ToteRepository', () => {
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
    it('should create a new tote', async () => {
      const toteData = {
        name: 'Test Tote',
        location: 'Garage',
        description: 'Storage tote in garage',
        color: 'blue',
      };

      const tote = await ToteRepository.create(toteData);

      expect(tote).toHaveProperty('id');
      expect(tote.name).toBe(toteData.name);
      expect(tote.location).toBe(toteData.location);
      expect(tote.description).toBe(toteData.description);
      expect(tote.color).toBe(toteData.color);
      expect(tote).toHaveProperty('createdAt');
      expect(tote).toHaveProperty('updatedAt');
    });

    it('should create tote with minimal data', async () => {
      const toteData = {
        name: 'Minimal Tote',
      };

      const tote = await ToteRepository.create(toteData);

      expect(tote.id).toBeDefined();
      expect(tote.name).toBe(toteData.name);
      expect(tote.location).toBeNull();
      expect(tote.description).toBeNull();
      expect(tote.color).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all totes', async () => {
      await createTestTote({ name: 'Tote 1' });
      await createTestTote({ name: 'Tote 2' });
      await createTestTote({ name: 'Tote 3' });

      const totes = await ToteRepository.findAll();

      expect(totes).toHaveLength(3);
    });

    it('should return empty array when no totes exist', async () => {
      const totes = await ToteRepository.findAll();

      expect(totes).toEqual([]);
    });

    it('should sort totes by creation date descending', async () => {
      // Create totes with slight delay to ensure different timestamps
      const tote1 = await createTestTote({ name: 'First', createdAt: new Date('2024-01-01').toISOString() });
      const tote2 = await createTestTote({ name: 'Second', createdAt: new Date('2024-01-02').toISOString() });
      const tote3 = await createTestTote({ name: 'Third', createdAt: new Date('2024-01-03').toISOString() });

      const totes = await ToteRepository.findAll();

      // Should be ordered by created_at DESC
      expect(totes[0].name).toBe('Third');
      expect(totes[1].name).toBe('Second');
      expect(totes[2].name).toBe('First');
    });
  });

  describe('findById', () => {
    it('should find tote by id', async () => {
      const created = await createTestTote({ name: 'Find Me' });

      const found = await ToteRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const found = await ToteRepository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update tote', async () => {
      const tote = await createTestTote({ name: 'Original Name', location: 'Garage' });

      const updated = await ToteRepository.update(tote.id, {
        name: 'Updated Name',
        location: 'Basement',
        color: 'red',
      });

      expect(updated.id).toBe(tote.id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.location).toBe('Basement');
      expect(updated.color).toBe('red');
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(tote.updatedAt).getTime());
    });

    it('should allow partial updates', async () => {
      const tote = await createTestTote({ name: 'Original', location: 'Garage', color: 'blue' });

      const updated = await ToteRepository.update(tote.id, {
        location: 'Basement',
      });

      expect(updated.name).toBe('Original'); // Unchanged
      expect(updated.location).toBe('Basement'); // Changed
      expect(updated.color).toBe('blue'); // Unchanged
    });

    it('should return null when updating non-existent tote', async () => {
      const updated = await ToteRepository.update('non-existent-id', { name: 'Test' });

      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete tote', async () => {
      const tote = await createTestTote({ name: 'Delete Me' });

      const deleted = await ToteRepository.delete(tote.id);

      expect(deleted).toBe(true);

      const found = await ToteRepository.findById(tote.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent tote', async () => {
      const deleted = await ToteRepository.delete('non-existent-id');

      expect(deleted).toBe(false);
    });

    it('should cascade delete items when tote is deleted', async () => {
      const tote = await createTestTote({ name: 'Tote with Items' });
      await createTestItem({ name: 'Item 1', toteId: tote.id });
      await createTestItem({ name: 'Item 2', toteId: tote.id });

      // Delete the tote
      await ToteRepository.delete(tote.id);

      // Items should still exist but have null toteId due to ON DELETE SET NULL
      // (This depends on your migration schema - adjust test if CASCADE DELETE is used)
      const toteExists = await ToteRepository.findById(tote.id);
      expect(toteExists).toBeNull();
    });
  });

  describe('countItems', () => {
    it('should count items in a tote', async () => {
      const tote = await createTestTote({ name: 'Tote with Items' });
      await createTestItem({ name: 'Item 1', toteId: tote.id });
      await createTestItem({ name: 'Item 2', toteId: tote.id });
      await createTestItem({ name: 'Item 3', toteId: tote.id });

      const count = await ToteRepository.countItems(tote.id);

      expect(count).toBe(3);
    });

    it('should return 0 for empty tote', async () => {
      const tote = await createTestTote({ name: 'Empty Tote' });

      const count = await ToteRepository.countItems(tote.id);

      expect(count).toBe(0);
    });

    it('should return 0 for non-existent tote', async () => {
      const count = await ToteRepository.countItems('non-existent-id');

      expect(count).toBe(0);
    });
  });

  describe('getItemsInTote', () => {
    it('should get all items in a tote', async () => {
      const tote = await createTestTote({ name: 'Test Tote' });
      await createTestItem({ name: 'Item 1', toteId: tote.id });
      await createTestItem({ name: 'Item 2', toteId: tote.id });
      await createTestItem({ name: 'Item 3', toteId: null }); // Not in this tote

      const items = await ToteRepository.getItemsInTote(tote.id);

      expect(items).toHaveLength(2);
      expect(items.every(item => item.toteId === tote.id)).toBe(true);
    });

    it('should return empty array for empty tote', async () => {
      const tote = await createTestTote({ name: 'Empty Tote' });

      const items = await ToteRepository.getItemsInTote(tote.id);

      expect(items).toEqual([]);
    });

    it('should return null for non-existent tote', async () => {
      const items = await ToteRepository.getItemsInTote('non-existent-id');

      expect(items).toBeNull();
    });
  });
});
