/**
 * Location Model
 * Represents a physical location where totes are stored
 */

class Location {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.room = data.room || null;
    this.position = data.position || null;
    this.specificReference = data.specificReference || data.specific_reference || null;
    this.description = data.description || null;
    this.userId = data.userId || data.user_id || null;
    this.createdAt = data.createdAt || data.created_at || null;
    this.updatedAt = data.updatedAt || data.updated_at || null;
  }

  /**
   * Validate location data
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
      room: this.room,
      position: this.position,
      specific_reference: this.specificReference,
      description: this.description,
      user_id: this.userId,
      created_at: this.createdAt,
      updated_at: this.updatedAt
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
      room: this.room,
      position: this.position,
      specificReference: this.specificReference,
      description: this.description,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Location;
