import db from '../index.js';
import { nanoid } from 'nanoid';
import Location from '../../models/Location.js';

/**
 * Location Repository - Database operations for locations
 */
class LocationRepository {
  /**
   * Get all locations for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of locations
   */
  async findAll(userId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT * FROM locations
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
   * Get a location by ID
   * @param {string} id - Location ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Location or null
   */
  async findById(id, userId) {
    const client = await db.getClient();
    try {
      const query = `
        SELECT * FROM locations
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
   * Create a new location
   * @param {Object} locationData - Location data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created location
   */
  async create(locationData, userId) {
    const client = await db.getClient();
    try {
      const location = new Location({
        ...locationData,
        id: nanoid(),
        userId
      });

      const validation = location.validate();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const query = `
        INSERT INTO locations (id, name, room, position, specific_reference, description, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [
        location.id,
        location.name,
        location.room,
        location.position,
        location.specificReference,
        location.description,
        location.userId
      ];

      const result = await client.query(query, values);
      return this.mapToCamelCase(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Update a location
   * @param {string} id - Location ID
   * @param {Object} locationData - Updated location data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Updated location or null
   */
  async update(id, locationData, userId) {
    const client = await db.getClient();
    try {
      // First check if location exists and belongs to user
      const existing = await this.findById(id, userId);
      if (!existing) {
        return null;
      }

      const location = new Location({
        ...existing,
        ...locationData,
        id,
        userId
      });

      const validation = location.validate();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const query = `
        UPDATE locations
        SET name = $1, room = $2, position = $3, specific_reference = $4, description = $5
        WHERE id = $6 AND user_id = $7
        RETURNING *
      `;

      const values = [
        location.name,
        location.room,
        location.position,
        location.specificReference,
        location.description,
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
   * Delete a location
   * @param {string} id - Location ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if deleted, false otherwise
   */
  async delete(id, userId) {
    const client = await db.getClient();
    try {
      const query = `
        DELETE FROM locations
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
   * Map database row to camelCase object
   * @param {Object} row - Database row
   * @returns {Object} - Camel case object
   */
  mapToCamelCase(row) {
    return {
      id: row.id,
      name: row.name,
      room: row.room,
      position: row.position,
      specificReference: row.specific_reference,
      description: row.description,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default new LocationRepository();
