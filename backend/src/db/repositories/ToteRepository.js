import db from '../index.js';
import { nanoid } from 'nanoid';

/**
 * Tote Repository - Database operations for totes
 */
class ToteRepository {
  /**
   * Get all totes
   * @returns {Promise<Array>} - Array of totes
   */
  async findAll() {
    const result = await db.query(
      'SELECT * FROM totes ORDER BY created_at DESC'
    );
    return result.rows;
  }

  /**
   * Get tote by ID
   * @param {string} id - Tote ID
   * @returns {Promise<Object|null>} - Tote object or null
   */
  async findById(id) {
    const result = await db.query(
      'SELECT * FROM totes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new tote
   * @param {Object} toteData - Tote data
   * @returns {Promise<Object>} - Created tote
   */
  async create(toteData) {
    const id = toteData.id || `tote-${nanoid(10)}`;
    const now = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO totes (id, name, location, description, color, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        toteData.name,
        toteData.location || null,
        toteData.description || null,
        toteData.color || null,
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
   * @returns {Promise<Object|null>} - Updated tote or null
   */
  async update(id, updates) {
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
      return await this.findById(id);
    }

    // Add ID as last parameter
    values.push(id);

    const result = await db.query(
      `UPDATE totes
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Delete a tote
   * @param {string} id - Tote ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.query(
      'DELETE FROM totes WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Get items in a tote
   * @param {string} toteId - Tote ID
   * @returns {Promise<Array>} - Array of items
   */
  async getItems(toteId) {
    const result = await db.query(
      'SELECT * FROM items WHERE tote_id = $1 ORDER BY name',
      [toteId]
    );
    return result.rows.map(row => this.mapToCamelCase(row));
  }

  /**
   * Count items in a tote
   * @param {string} toteId - Tote ID
   * @returns {Promise<number>} - Count of items
   */
  async countItems(toteId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM items WHERE tote_id = $1',
      [toteId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Map database row to camelCase object
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ToteRepository();
