/**
 * Tag Model
 * Represents a tag for categorizing totes and items
 */

class Tag {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.color = data.color || null;
    this.userId = data.userId || data.user_id || null;
    this.createdAt = data.createdAt || data.created_at || null;
  }

  /**
   * Validate tag data
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to database format (snake_case)
   * @returns {Object}
   */
  toDatabase() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      user_id: this.userId,
      created_at: this.createdAt
    };
  }

  /**
   * Convert to API format (camelCase)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      userId: this.userId,
      createdAt: this.createdAt
    };
  }
}

export default Tag;
