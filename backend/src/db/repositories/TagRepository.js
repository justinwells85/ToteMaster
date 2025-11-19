import db from '../index.js';
import { nanoid } from 'nanoid';
import Tag from '../../models/Tag.js';

/**
 * Tag Repository - Database operations for tags
 */
class TagRepository {
  /**
   * Get all tags for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of tags
   */
  async findAll(userId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT * FROM tags
        WHERE user_id = $1
        ORDER BY name ASC
      `;
      const result = await client.query(query, [userId]);
      return result.rows.map(row => this.mapToCamelCase(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get a tag by ID
   * @param {string} id - Tag ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Tag or null
   */
  async findById(id, userId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT * FROM tags
        WHERE id = $1 AND user_id = $2
      `;
      const result = await client.query(query, [id, userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToCamelCase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Get a tag by name (for uniqueness check)
   * @param {string} name - Tag name
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Tag or null
   */
  async findByName(name, userId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT * FROM tags
        WHERE LOWER(name) = LOWER($1) AND user_id = $2
      `;
      const result = await client.query(query, [name, userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToCamelCase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Create a new tag
   * @param {Object} tagData - Tag data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created tag
   */
  async create(tagData, userId) {
    const client = await db.getClient();
    try {
      // Check if tag name already exists for this user
      const existing = await this.findByName(tagData.name, userId);
      if (existing) {
        throw new Error(`Tag "${tagData.name}" already exists`);
      }

      const tag = new Tag({
        ...tagData,
        id: nanoid(),
        userId
      });

      const validation = tag.validate();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const query = `
        INSERT INTO tags (id, name, color, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [
        tag.id,
        tag.name,
        tag.color,
        tag.userId
      ];

      const result = await client.query(query, values);
      return this.mapToCamelCase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Update a tag
   * @param {string} id - Tag ID
   * @param {Object} tagData - Updated tag data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Updated tag or null
   */
  async update(id, tagData, userId) {
    const client = await db.getClient();
    try {
      // Check if tag exists
      const existing = await this.findById(id, userId);
      if (!existing) {
        return null;
      }

      // Check if new name conflicts with another tag
      if (tagData.name && tagData.name.toLowerCase() !== existing.name.toLowerCase()) {
        const conflict = await this.findByName(tagData.name, userId);
        if (conflict && conflict.id !== id) {
          throw new Error(`Tag "${tagData.name}" already exists`);
        }
      }

      const tag = new Tag({
        ...existing,
        ...tagData,
        id,
        userId
      });

      const validation = tag.validate();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const query = `
        UPDATE tags
        SET name = $1, color = $2
        WHERE id = $3 AND user_id = $4
        RETURNING *
      `;

      const values = [
        tag.name,
        tag.color,
        id,
        userId
      ];

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToCamelCase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Delete a tag
   * @param {string} id - Tag ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  async delete(id, userId) {
    const client = await db.getClient();
    try {
      const query = `
        DELETE FROM tags
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;

      const result = await client.query(query, [id, userId]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Get tags for a tote
   * @param {string} toteId - Tote ID
   * @returns {Promise<Array>} - Array of tags
   */
  async findByToteId(toteId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT t.* FROM tags t
        INNER JOIN tote_tags tt ON tt.tag_id = t.id
        WHERE tt.tote_id = $1
        ORDER BY t.name ASC
      `;
      const result = await client.query(query, [toteId]);
      return result.rows.map(row => this.mapToCamelCase(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get tags for an item
   * @param {string} itemId - Item ID
   * @returns {Promise<Array>} - Array of tags
   */
  async findByItemId(itemId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT t.* FROM tags t
        INNER JOIN item_tags it ON it.tag_id = t.id
        WHERE it.item_id = $1
        ORDER BY t.name ASC
      `;
      const result = await client.query(query, [itemId]);
      return result.rows.map(row => this.mapToCamelCase(row));
    } finally {
      client.release();
    }
  }

  /**
   * Add tag to tote
   * @param {string} toteId - Tote ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<boolean>}
   */
  async addToTote(toteId, tagId) {
    const client = await db.getClient();
    try {
      const query = `
        INSERT INTO tote_tags (tote_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `;
      await client.query(query, [toteId, tagId]);
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Remove tag from tote
   * @param {string} toteId - Tote ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<boolean>}
   */
  async removeFromTote(toteId, tagId) {
    const client = await db.getClient();
    try {
      const query = `
        DELETE FROM tote_tags
        WHERE tote_id = $1 AND tag_id = $2
      `;
      const result = await client.query(query, [toteId, tagId]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Add tag to item
   * @param {string} itemId - Item ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<boolean>}
   */
  async addToItem(itemId, tagId) {
    const client = await db.getClient();
    try {
      const query = `
        INSERT INTO item_tags (item_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `;
      await client.query(query, [itemId, tagId]);
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Remove tag from item
   * @param {string} itemId - Item ID
   * @param {string} tagId - Tag ID
   * @returns {Promise<boolean>}
   */
  async removeFromItem(itemId, tagId) {
    const client = await db.getClient();
    try {
      const query = `
        DELETE FROM item_tags
        WHERE item_id = $1 AND tag_id = $2
      `;
      const result = await client.query(query, [itemId, tagId]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
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
      color: row.color,
      userId: row.user_id,
      createdAt: row.created_at
    };
  }
}

export default new TagRepository();
