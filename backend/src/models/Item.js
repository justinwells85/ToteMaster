/**
 * Item Model
 * Defines the schema and validation for inventory items
 */

export const ItemSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    trim: true,
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
    trim: true,
  },
  category: {
    type: 'string',
    required: false,
    maxLength: 100,
    trim: true,
  },
  toteId: {
    type: 'number',
    required: false, // Items can exist without being assigned to a tote
    integer: true,
  },
  quantity: {
    type: 'number',
    required: false,
    default: 1,
    min: 0,
    integer: true,
  },
  condition: {
    type: 'string',
    required: false,
    enum: ['new', 'excellent', 'good', 'fair', 'poor', 'damaged'],
    default: 'good',
  },
  photos: {
    type: 'array',
    required: false,
    default: [],
    itemType: 'string',
  },
  tags: {
    type: 'array',
    required: false,
    default: [],
    itemType: 'string',
    maxLength: 50, // Max 50 tags
  },
};

/**
 * Validates an item object against the schema
 * @param {Object} item - The item to validate
 * @param {boolean} isUpdate - Whether this is an update operation (allows partial data)
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export function validateItem(item, isUpdate = false) {
  const errors = [];

  // Check for null or undefined
  if (!item || typeof item !== 'object') {
    return { valid: false, errors: ['Item must be an object'] };
  }

  // Validate each field
  for (const [field, rules] of Object.entries(ItemSchema)) {
    const value = item[field];

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

      // Array validations
      if (rules.type === 'array' && Array.isArray(value)) {
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} items`);
        }
        if (rules.itemType) {
          value.forEach((item, index) => {
            if (typeof item !== rules.itemType) {
              errors.push(`${field}[${index}] must be a ${rules.itemType}`);
            }
          });
        }
      }
    }
  }

  // Check for unknown fields
  const allowedFields = Object.keys(ItemSchema);
  const extraFields = Object.keys(item).filter(
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
 * Sanitizes item data by trimming strings and applying defaults
 * @param {Object} item - The item to sanitize
 * @returns {Object} - Sanitized item
 */
export function sanitizeItem(item) {
  const sanitized = { ...item };

  for (const [field, rules] of Object.entries(ItemSchema)) {
    const value = sanitized[field];

    // Apply defaults
    if ((value === undefined || value === null) && rules.default !== undefined) {
      sanitized[field] = rules.default;
    }

    // Trim strings
    if (rules.trim && typeof value === 'string') {
      sanitized[field] = value.trim();
    }

    // Ensure arrays are arrays
    if (rules.type === 'array' && !Array.isArray(value) && value !== undefined) {
      sanitized[field] = [];
    }
  }

  return sanitized;
}

/**
 * Creates a new item object with defaults
 * @param {Object} data - Item data
 * @returns {Object} - Item with all fields
 */
export function createItemModel(data) {
  const sanitized = sanitizeItem(data);

  return {
    name: sanitized.name,
    description: sanitized.description || '',
    category: sanitized.category || '',
    toteId: sanitized.toteId || null,
    quantity: sanitized.quantity || 1,
    condition: sanitized.condition || 'good',
    photos: sanitized.photos || [],
    tags: sanitized.tags || [],
  };
}
