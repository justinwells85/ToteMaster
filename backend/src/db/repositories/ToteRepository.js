import db from '../index.js';
import { nanoid } from 'nanoid';
import logger from '../utils/logger.js';

/**
 * Tote Repository - Database operations for totes
 */
class ToteRepository {
  /**
   * Get all totes
   * @param {string} userId - User ID (optional, for filtering)
   * @returns {Promise<Array>} - Array of totes
   */
  async findAll(userId = null) {
    logger.info('[ToteRepository] findAll called', { userId });
    let query = 'SELECT * FROM totes';
    const params = [];

    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    logger.info('[ToteRepository] Executing query:', { query, params });
    const result = await db.query(query, params);
    logger.info('[ToteRepository] Query completed', { rowCount: result.rows.length });
    return result.rows.map(row => this.mapToCamelCase(row));
  }

  /**
   * Get tote by ID
   * @param {string} id - Tote ID
   * @param {string} userId - User ID (optional, for access control)
   * @returns {Promise<Object|null>} - Tote object or null
   */
  async findById(id, userId = null) {
    let query = 'SELECT * FROM totes WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Create a new tote
   * @param {Object} toteData - Tote data (must include userId)
   * @returns {Promise<Object>} - Created tote
   */
  async create(toteData) {
    const id = toteData.id || `tote-${nanoid(10)}`;
    const now = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO totes (id, name, location, description, color, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        toteData.name,
        toteData.location || null,
        toteData.description || null,
        toteData.color || null,
        toteData.userId || null,
        toteData.createdAt || now,
        toteData.updatedAt || now,
      ]
    );

    return this.mapToCamelCase(result.rows[0]);
  }

  /**
   * Update a tote
   * @param {string} id - Tote ID
   * @param {Object} updates - Fields to update
   * @param {string} userId - User ID (for access control)
   * @returns {Promise<Object|null>} - Updated tote or null
   */
  async update(id, updates, userId = null) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic UPDATE query
    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(updates.location);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.color !== undefined) {
      fields.push(`color = $${paramCount++}`);
      values.push(updates.color);
    }

    if (fields.length === 0) {
      // No updates provided
      return await this.findById(id, userId);
    }

    // Add ID as parameter
    values.push(id);
    const idParam = paramCount++;

    // Build WHERE clause with optional user check
    let whereClause = `WHERE id = $${idParam}`;
    if (userId) {
      whereClause += ` AND user_id = $${paramCount++}`;
      values.push(userId);
    }

    const result = await db.query(
      `UPDATE totes
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       ${whereClause}
       RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Delete a tote
   * @param {string} id - Tote ID
   * @param {string} userId - User ID (for access control)
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(id, userId = null) {
    let query = 'DELETE FROM totes WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return result.rowCount > 0;
  }

  /**
   * Get items in a tote
   * @param {string} toteId - Tote ID
   * @param {string} userId - User ID (optional, for access control)
   * @returns {Promise<Array|null>} - Array of items or null if tote not found
   */
  async getItemsInTote(toteId, userId = null) {
    // First check if tote exists and belongs to user
    const tote = await this.findById(toteId, userId);
    if (!tote) {
      return null;
    }

    // Get items in this tote
    let query = 'SELECT * FROM items WHERE tote_id = $1';
    const params = [toteId];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    query += ' ORDER BY name';

    const result = await db.query(query, params);
    return result.rows.map(row => this.mapItemToCamelCase(row));
  }

  /**
   * Count items in a tote
   * @param {string} toteId - Tote ID
   * @param {string} userId - User ID (optional, for access control)
   * @returns {Promise<number>} - Count of items
   */
  async countItems(toteId, userId = null) {
    let query = 'SELECT COUNT(*) as count FROM items WHERE tote_id = $1';
    const params = [toteId];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Map database row to camelCase object (for totes)
   * @param {Object} row - Database row
   * @returns {Object} - Camel case object
   */
  mapToCamelCase(row) {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      description: row.description,
      color: row.color,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map database row to camelCase object (for items)
   * @param {Object} row - Database row
   * @returns {Object} - Camel case object
   */
  mapItemToCamelCase(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      toteId: row.tote_id,
      quantity: row.quantity,
      condition: row.condition,
      tags: row.tags || [],
      photoUrl: row.photo_url,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ToteRepository();
