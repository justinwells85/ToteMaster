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
    // Use getClient() instead of db.query() to work around hanging issue
    const client = await db.getClient();
    try {
      const {
        userId,
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

      // Build WHERE clause - always filter by userId if provided
      if (userId) {
        filters.push(`user_id = $${paramCount++}`);
        values.push(userId);
      }
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
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated results
      const dataQuery = `
        SELECT * FROM items
        ${whereClause}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `;
      const dataResult = await client.query(dataQuery, [...values, limit, offset]);

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
    } finally {
      client.release();
    }
  }

  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @param {string} userId - User ID (optional, for access control)
   * @returns {Promise<Object|null>} - Item object or null
   */
  async findById(id, userId = null) {
    let query = 'SELECT * FROM items WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Search items by query
   * @param {string} query - Search query
   * @param {Object} options - Pagination options (page, limit, userId)
   * @returns {Promise<Object>} - Search results with pagination
   */
  async search(query, options = {}) {
    const { page = 1, limit = 10, userId } = options;
    const offset = (page - 1) * limit;
    const searchTerm = `%${query.toLowerCase()}%`;

    // Build user filter
    const userFilter = userId ? 'AND user_id = $4' : '';
    const params = [searchTerm];

    if (userId) {
      params.push(userId);
    }

    // Search in name, description, category, and tags
    const countQuery = `
      SELECT COUNT(*) as count
      FROM items
      WHERE (LOWER(name) LIKE $1
         OR LOWER(description) LIKE $1
         OR LOWER(category) LIKE $1
         OR EXISTS (
           SELECT 1 FROM unnest(tags) AS tag
           WHERE LOWER(tag) LIKE $1
         ))
      ${userFilter}
    `;
    const countResult = await db.query(countQuery, userId ? [searchTerm, userId] : [searchTerm]);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT *
      FROM items
      WHERE (LOWER(name) LIKE $1
         OR LOWER(description) LIKE $1
         OR LOWER(category) LIKE $1
         OR EXISTS (
           SELECT 1 FROM unnest(tags) AS tag
           WHERE LOWER(tag) LIKE $1
         ))
      ${userFilter}
      ORDER BY
        CASE WHEN LOWER(name) LIKE $1 THEN 1
             WHEN LOWER(category) LIKE $1 THEN 2
             ELSE 3
        END,
        name
      LIMIT $2 OFFSET $3
    `;
    const dataParams = userId ? [searchTerm, limit, offset, userId] : [searchTerm, limit, offset];
    const dataResult = await db.query(dataQuery, dataParams);

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
   * @param {Object} itemData - Item data (must include userId)
   * @returns {Promise<Object>} - Created item
   */
  async create(itemData) {
    const id = itemData.id || `item-${nanoid(10)}`;
    const now = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO items (id, name, description, category, tote_id, quantity, condition, tags, photo_url, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
        itemData.userId || null,
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
   * @param {string} userId - User ID (for access control)
   * @returns {Promise<Object|null>} - Updated item or null
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
      `UPDATE items
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       ${whereClause}
       RETURNING *`,
      values
    );

    return result.rows[0] ? this.mapToCamelCase(result.rows[0]) : null;
  }

  /**
   * Delete an item
   * @param {string} id - Item ID
   * @param {string} userId - User ID (for access control)
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(id, userId = null) {
    let query = 'DELETE FROM items WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return result.rowCount > 0;
  }

  /**
   * Get items by tote ID
   * @param {string} toteId - Tote ID
   * @param {string} userId - User ID (optional, for access control)
   * @returns {Promise<Array>} - Array of items
   */
  async findByToteId(toteId, userId = null) {
    let query = 'SELECT * FROM items WHERE tote_id = $1';
    const params = [toteId];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    query += ' ORDER BY name';

    const result = await db.query(query, params);
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
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ItemRepository();
