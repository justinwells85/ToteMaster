import db from '../index.js';
import { nanoid } from 'nanoid';

/**
 * UserRepository
 * Handles all database operations for users
 */
class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data (email, password_hash, name)
   * @returns {Promise<Object>} Created user object (without password_hash)
   */
  async create(userData) {
    const client = await db.pool.connect();
    try {
      const id = `user-${nanoid()}`;
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, name, created_at, updated_at`,
        [
          id,
          userData.email.toLowerCase().trim(),
          userData.password_hash,
          userData.name || null,
          now,
          now,
        ]
      );

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findById(id) {
    const client = await db.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, email, password_hash, name, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByEmail(email) {
    const client = await db.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, email, password_hash, name, created_at, updated_at
         FROM users
         WHERE email = $1`,
        [email.toLowerCase().trim()]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  async update(id, updates) {
    const client = await db.pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(updates.email.toLowerCase().trim());
      }

      if (updates.password_hash !== undefined) {
        fields.push(`password_hash = $${paramCount++}`);
        values.push(updates.password_hash);
      }

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }

      if (fields.length === 0) {
        // No fields to update, just return the existing user
        return this.findById(id);
      }

      // Always update updated_at
      fields.push(`updated_at = $${paramCount++}`);
      values.push(new Date().toISOString());

      // Add id as final parameter
      values.push(id);

      const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, name, created_at, updated_at
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const client = await db.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    const client = await db.pool.connect();
    try {
      const result = await client.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Get all users (admin function)
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} Paginated users list
   */
  async findAll(options = {}) {
    const client = await db.pool.connect();
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      const total = parseInt(countResult.rows[0].count);

      // Get paginated users
      const result = await client.query(
        `SELECT id, email, name, created_at, updated_at
         FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const users = result.rows.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } finally {
      client.release();
    }
  }
}

export default new UserRepository();
