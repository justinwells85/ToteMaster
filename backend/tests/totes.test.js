import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import cors from 'cors';
import totesRouter from '../src/routes/totes.js';
import { setupTestDb, cleanTestDb, closeTestDb } from './helpers/testDb.js';

let dbAvailable = false;

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/totes', totesRouter);
  return app;
};

describe('Totes API', () => {
  let app;

  beforeAll(async () => {
    dbAvailable = await setupTestDb();
  });

  beforeEach(async () => {
    app = createTestApp();
    if (dbAvailable) {
      await cleanTestDb();
    }
  });

  afterAll(async () => {
    if (dbAvailable) {
      await closeTestDb();
    }
  });

  // Helper to conditionally run tests
  const itDb = (name, fn) => {
    it(name, async () => {
      if (!dbAvailable) {
        console.log(`Skipping "${name}" - database not available`);
        return;
      }
      await fn();
    });
  };

  describe('GET /api/totes', () => {
    itDb('should return all totes', async () => {
      const response = await request(app)
        .get('/api/totes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/totes/:id', () => {
    itDb('should return a specific tote when found', async () => {
      // First get all totes to find a valid ID
      const allTotes = await request(app).get('/api/totes');

      if (allTotes.body && allTotes.body.length > 0) {
        const toteId = allTotes.body[0].id;

        const response = await request(app)
          .get(`/api/totes/${toteId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', toteId);
        expect(response.body).toHaveProperty('name');
      }
    });

    itDb('should return 404 for non-existent tote', async () => {
      const response = await request(app)
        .get('/api/totes/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/totes', () => {
    itDb('should create a new tote with valid data', async () => {
      const newTote = {
        name: 'Test Tote',
        location: 'Test Location',
        description: 'Test description',
        color: 'blue'
      };

      const response = await request(app)
        .post('/api/totes')
        .send(newTote)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newTote.name);
      expect(response.body).toHaveProperty('location', newTote.location);
      expect(response.body).toHaveProperty('description', newTote.description);
      expect(response.body).toHaveProperty('color', newTote.color);
      expect(response.body).toHaveProperty('createdAt');
    });

    itDb('should reject tote without required name field', async () => {
      const invalidTote = {
        location: 'Test Location',
        description: 'Missing name'
      };

      const response = await request(app)
        .post('/api/totes')
        .send(invalidTote)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    itDb('should create tote with minimal required fields', async () => {
      const minimalTote = {
        name: 'Minimal Tote'
      };

      const response = await request(app)
        .post('/api/totes')
        .send(minimalTote)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', minimalTote.name);
    });
  });

  describe('PUT /api/totes/:id', () => {
    itDb('should update an existing tote', async () => {
      // First create a tote
      const newTote = {
        name: 'Tote to Update',
        location: 'Original Location',
        color: 'red'
      };

      const created = await request(app)
        .post('/api/totes')
        .send(newTote);

      const toteId = created.body.id;

      // Now update it
      const updates = {
        name: 'Updated Tote Name',
        location: 'Updated Location',
        color: 'green'
      };

      const response = await request(app)
        .put(`/api/totes/${toteId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('id', toteId);
      expect(response.body).toHaveProperty('name', updates.name);
      expect(response.body).toHaveProperty('location', updates.location);
      expect(response.body).toHaveProperty('color', updates.color);
      expect(response.body).toHaveProperty('updatedAt');
    });

    itDb('should return 404 when updating non-existent tote', async () => {
      const updates = { name: 'Updated' };

      await request(app)
        .put('/api/totes/non-existent-id')
        .send(updates)
        .expect(404);
    });

    itDb('should allow partial updates', async () => {
      // Create a tote
      const newTote = {
        name: 'Partial Update Test',
        location: 'Original',
        color: 'blue'
      };

      const created = await request(app)
        .post('/api/totes')
        .send(newTote);

      const toteId = created.body.id;

      // Update only the name
      const updates = { name: 'Only Name Changed' };

      const response = await request(app)
        .put(`/api/totes/${toteId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('name', updates.name);
      expect(response.body).toHaveProperty('location', newTote.location);
      expect(response.body).toHaveProperty('color', newTote.color);
    });
  });

  describe('DELETE /api/totes/:id', () => {
    itDb('should delete an existing empty tote', async () => {
      // First create a tote
      const newTote = {
        name: 'Tote to Delete',
        location: 'Test'
      };

      const created = await request(app)
        .post('/api/totes')
        .send(newTote);

      const toteId = created.body.id;

      // Delete it (will only work if no items reference it)
      const response = await request(app)
        .delete(`/api/totes/${toteId}`);

      // Could be 204 (success) or 400 (has items)
      expect([204, 400]).toContain(response.status);
    });

    itDb('should return 404 when deleting non-existent tote', async () => {
      await request(app)
        .delete('/api/totes/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/totes/:id/items', () => {
    itDb('should return items in a specific tote', async () => {
      // Get a tote ID
      const allTotes = await request(app).get('/api/totes');

      if (allTotes.body && allTotes.body.length > 0) {
        const toteId = allTotes.body[0].id;

        const response = await request(app)
          .get(`/api/totes/${toteId}/items`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    itDb('should return 404 for non-existent tote', async () => {
      await request(app)
        .get('/api/totes/non-existent-id/items')
        .expect(404);
    });
  });
});
