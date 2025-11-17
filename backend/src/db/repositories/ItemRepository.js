import db from '../index.js';
import { nanoid } from 'nanoid';

/**
 * Item Repository - Database operations for items
 */
class ItemRepository {
  /**
   * Get all items with optional filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Items and pagination info
   */
  async findAll(options = {}) {
    const {
      toteId,
      category,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];
    let paramCount = 1;

    // Build WHERE clause
    if (toteId) {
      filters.push(`tote_id = $${paramCount++}`);
      values.push(toteId);
    }
    if (category) {
      filters.push(`category = $${paramCount++}`);
      values.push(category);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Validate sort column
    const validSortColumns = ['name', 'category', 'quantity', 'condition', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM items ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const dataQuery = `
      SELECT * FROM items
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    const dataResult = await db.query(dataQuery, [...values, limit, offset]);

    const items = dataResult.rows.map(row => this.mapToCamelCase(row));

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object|null>} - Item object or null
   */
  async findById(id) {
    const result = await db.query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Search items by query
   * @param {string} query - Search query
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async search(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    const searchTerm = `%${query.toLowerCase()}%`;

    // Search in name, description, category, and tags
    const countQuery = `
      SELECT COUNT(*) as count
      FROM items
      WHERE LOWER(name) LIKE $1
         OR LOWER(description) LIKE $1
         OR LOWER(category) LIKE $1
         OR EXISTS (
           SELECT 1 FROM unnest(tags) AS tag
           WHERE LOWER(tag) LIKE $1
         )
    `;
    const countResult = await db.query(countQuery, [searchTerm]);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT *
      FROM items
      WHERE LOWER(name) LIKE $1
         OR LOWER(description) LIKE $1
         OR LOWER(category) LIKE $1
         OR EXISTS (
           SELECT 1 FROM unnest(tags) AS tag
           WHERE LOWER(tag) LIKE $1
         )
      ORDER BY
        CASE WHEN LOWER(name) LIKE $1 THEN 1
             WHEN LOWER(category) LIKE $1 THEN 2
             ELSE 3
        END,
        name
      LIMIT $2 OFFSET $3
    `;
    const dataResult = await db.query(dataQuery, [searchTerm, limit, offset]);

    const items = dataResult.rows.map(row => this.mapToCamelCase(row));

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Create a new item
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} - Created item
   */
  async create(itemData) {
    const id = itemData.id || `item-${nanoid(10)}`;
    const now = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO items (id, name, description, category, tote_id, quantity, condition, tags, photo_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        itemData.name,
        itemData.description || null,
        itemData.category || null,
        itemData.toteId || null,
        itemData.quantity || 1,
        itemData.condition || 'good',
        itemData.tags || [],
        itemData.photoUrl || null,
        itemData.createdAt || now,
        itemData.updatedAt || now,
      ]
    );

    return this.mapToCamelCase(result.rows[0]);
  }

  /**
   * Update an item
   * @param {string} id - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} - Updated item or null
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
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }
    if (updates.toteId !== undefined) {
      fields.push(`tote_id = $${paramCount++}`);
      values.push(updates.toteId);
    }
    if (updates.quantity !== undefined) {
      fields.push(`quantity = $${paramCount++}`);
      values.push(updates.quantity);
    }
    if (updates.condition !== undefined) {
      fields.push(`condition = $${paramCount++}`);
      values.push(updates.condition);
    }
    if (updates.tags !== undefined) {
      fields.push(`tags = $${paramCount++}`);
      values.push(updates.tags);
    }
    if (updates.photoUrl !== undefined) {
      fields.push(`photo_url = $${paramCount++}`);
      values.push(updates.photoUrl);
    }

    if (fields.length === 0) {
      // No updates provided
      return await this.findById(id);
    }

    // Add ID as last parameter
    values.push(id);

    const result = await db.query(
      `UPDATE items
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Delete an item
   * @param {string} id - Item ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.query(
      'DELETE FROM items WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Get items by tote ID
   * @param {string} toteId - Tote ID
   * @returns {Promise<Array>} - Array of items
   */
  async findByToteId(toteId) {
    const result = await db.query(
      'SELECT * FROM items WHERE tote_id = $1 ORDER BY name',
      [toteId]
    );
    return result.rows.map(row => this.mapToCamelCase(row));
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
      description: row.description,
      category: row.category,
      toteId: row.tote_id,
      quantity: row.quantity,
      condition: row.condition,
      tags: row.tags || [],
      photoUrl: row.photo_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ItemRepository();
