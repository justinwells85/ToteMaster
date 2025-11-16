/**
 * Tote Model
 * Defines the schema and validation for storage totes/containers
 */

export const ToteSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    trim: true,
  },
  location: {
    type: 'string',
    required: false,
    maxLength: 200,
    trim: true,
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
    trim: true,
  },
  color: {
    type: 'string',
    required: false,
    maxLength: 50,
    trim: true,
  },
  label: {
    type: 'string',
    required: false,
    maxLength: 100,
    trim: true,
  },
  size: {
    type: 'string',
    required: false,
    enum: ['small', 'medium', 'large', 'extra-large'],
  },
};

/**
 * Validates a tote object against the schema
 * @param {Object} tote - The tote to validate
 * @param {boolean} isUpdate - Whether this is an update operation (allows partial data)
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export function validateTote(tote, isUpdate = false) {
  const errors = [];

  // Check for null or undefined
  if (!tote || typeof tote !== 'object') {
    return { valid: false, errors: ['Tote must be an object'] };
  }

  // Validate each field
  for (const [field, rules] of Object.entries(ToteSchema)) {
    const value = tote[field];

    // Required field check (skip for updates unless field is present)
    if (rules.required && !isUpdate && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not present in update
    if (isUpdate && value === undefined) {
      continue;
    }

    // Type validation
    if (value !== undefined && value !== null) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }

      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
        continue;
      }

      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }

      // String validations
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} has invalid format`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }

      // Number validations
      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must not exceed ${rules.max}`);
        }
        if (rules.integer && !Number.isInteger(value)) {
          errors.push(`${field} must be an integer`);
        }
      }
    }
  }

  // Check for unknown fields
  const allowedFields = Object.keys(ToteSchema);
  const extraFields = Object.keys(tote).filter(
    key => !allowedFields.includes(key) && !['id', 'createdAt', 'updatedAt'].includes(key)
  );

  if (extraFields.length > 0) {
    errors.push(`Unknown fields: ${extraFields.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes tote data by trimming strings and applying defaults
 * @param {Object} tote - The tote to sanitize
 * @returns {Object} - Sanitized tote
 */
export function sanitizeTote(tote) {
  const sanitized = { ...tote };

  for (const [field, rules] of Object.entries(ToteSchema)) {
    const value = sanitized[field];

    // Apply defaults
    if ((value === undefined || value === null) && rules.default !== undefined) {
      sanitized[field] = rules.default;
    }

    // Trim strings
    if (rules.trim && typeof value === 'string') {
      sanitized[field] = value.trim();
    }
  }

  return sanitized;
}

/**
 * Creates a new tote object with defaults
 * @param {Object} data - Tote data
 * @returns {Object} - Tote with all fields
 */
export function createToteModel(data) {
  const sanitized = sanitizeTote(data);

  return {
    name: sanitized.name,
    location: sanitized.location || '',
    description: sanitized.description || '',
    color: sanitized.color || '',
    label: sanitized.label || '',
    size: sanitized.size || '',
  };
}
