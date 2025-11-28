import db from '../../src/db/index.js';
import { runMigrations } from '../../src/db/migrate.js';

/**
 * Test Database Helper
 * Provides utilities for setting up and tearing down test database
 */

let initialized = false;

/**
 * Initialize test database
 * Runs migrations to set up schema
 * @returns {Promise<boolean>} true if database is available, false otherwise
 */
export async function setupTestDb() {
  if (!initialized) {
    // Test database connection
    const connected = await db.testConnection();
    if (!connected) {
      console.warn('Database not available - skipping database-dependent tests');
      return false;
    }

    // Run migrations to ensure schema is up to date
    await runMigrations();
    initialized = true;
  }
  return true;
}

/**
 * Clean all data from test database tables
 * Preserves schema but removes all records
 */
export async function cleanTestDb() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Delete in correct order due to foreign key constraints
    await client.query('DELETE FROM items');
    await client.query('DELETE FROM totes');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 * Call this in afterAll() hooks
 */
export async function closeTestDb() {
  await db.closePool();
  initialized = false;
}

/**
 * Create test tote
 */
export async function createTestTote(data = {}) {
  const client = await db.pool.connect();
  try {
    const tote = {
      id: data.id || `test-tote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || 'Test Tote',
      location: data.location || 'Test Location',
      description: data.description || 'Test Description',
      color: data.color || 'blue',
      created_at: data.createdAt || new Date().toISOString(),
      updated_at: data.updatedAt || new Date().toISOString(),
    };

    const result = await client.query(
      `INSERT INTO totes (id, name, location, description, color, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tote.id, tote.name, tote.location, tote.description, tote.color, tote.created_at, tote.updated_at]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      description: result.rows[0].description,
      color: result.rows[0].color,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  } finally {
    client.release();
  }
}

/**
 * Create test item
 */
export async function createTestItem(data = {}) {
  const client = await db.pool.connect();
  try {
    const item = {
      id: data.id || `test-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || 'Test Item',
      description: data.description || 'Test Description',
      category: data.category || 'Test Category',
      tote_id: data.toteId || null,
      quantity: data.quantity !== undefined ? data.quantity : 1,
      condition: data.condition || 'good',
      tags: data.tags || [],
      photo_url: data.photoUrl || null,
      created_at: data.createdAt || new Date().toISOString(),
      updated_at: data.updatedAt || new Date().toISOString(),
    };

    const result = await client.query(
      `INSERT INTO items (id, name, description, category, tote_id, quantity, condition, tags, photo_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        item.id,
        item.name,
        item.description,
        item.category,
        item.tote_id,
        item.quantity,
        item.condition,
        item.tags,
        item.photo_url,
        item.created_at,
        item.updated_at,
      ]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      category: result.rows[0].category,
      toteId: result.rows[0].tote_id,
      quantity: result.rows[0].quantity,
      condition: result.rows[0].condition,
      tags: result.rows[0].tags,
      photoUrl: result.rows[0].photo_url,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  } finally {
    client.release();
  }
}
