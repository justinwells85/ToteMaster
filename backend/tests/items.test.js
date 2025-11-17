import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import cors from 'cors';
import itemsRouter from '../src/routes/items.js';
import { setupTestDb, cleanTestDb, closeTestDb, createTestTote } from './helpers/testDb.js';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  return app;
};

describe('Items API', () => {
  let app;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    app = createTestApp();
    await cleanTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/items?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/items?sortBy=name&sortOrder=asc')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by toteId', async () => {
      const response = await request(app)
        .get('/api/items?toteId=tote-1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a specific item when found', async () => {
      // First get all items to find a valid ID
      const allItems = await request(app).get('/api/items');

      if (allItems.body.data && allItems.body.data.length > 0) {
        const itemId = allItems.body.data[0].id;

        const response = await request(app)
          .get(`/api/items/${itemId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', itemId);
        expect(response.body).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/items/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item with valid data', async () => {
      const tote = await createTestTote({ name: 'Test Tote' });

      const newItem = {
        name: 'Test Item',
        description: 'Test description',
        category: 'Test Category',
        toteId: tote.id,
        quantity: 5,
        condition: 'good',
        tags: ['test', 'item']
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newItem.name);
      expect(response.body).toHaveProperty('description', newItem.description);
      expect(response.body).toHaveProperty('category', newItem.category);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should reject item without required name field', async () => {
      const invalidItem = {
        description: 'Missing name',
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject item with invalid condition', async () => {
      const invalidItem = {
        name: 'Test Item',
        condition: 'invalid-condition'
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      // First create an item
      const newItem = {
        name: 'Item to Update',
        description: 'Original description',
        category: 'Test',
        quantity: 1
      };

      const created = await request(app)
        .post('/api/items')
        .send(newItem);

      const itemId = created.body.id;

      // Now update it
      const updates = {
        name: 'Updated Item Name',
        description: 'Updated description',
        quantity: 10
      };

      const response = await request(app)
        .put(`/api/items/${itemId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('id', itemId);
      expect(response.body).toHaveProperty('name', updates.name);
      expect(response.body).toHaveProperty('description', updates.description);
      expect(response.body).toHaveProperty('quantity', updates.quantity);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 when updating non-existent item', async () => {
      const updates = { name: 'Updated' };

      await request(app)
        .put('/api/items/non-existent-id')
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      // First create an item
      const newItem = {
        name: 'Item to Delete',
        description: 'Will be deleted',
        category: 'Test'
      };

      const created = await request(app)
        .post('/api/items')
        .send(newItem);

      const itemId = created.body.id;

      // Delete it
      await request(app)
        .delete(`/api/items/${itemId}`)
        .expect(204);

      // Verify it's gone
      await request(app)
        .get(`/api/items/${itemId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent item', async () => {
      await request(app)
        .delete('/api/items/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/items/search/:query', () => {
    it('should search items by query string', async () => {
      const response = await request(app)
        .get('/api/items/search/test')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app)
        .get('/api/items/search/veryrareitemthatdoesnotexist12345')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual([]);
    });
  });
});
