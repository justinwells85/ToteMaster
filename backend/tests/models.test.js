import { jest } from '@jest/globals';
import { validateItem, sanitizeItem, createItemModel } from '../src/models/Item.js';
import { validateTote, sanitizeTote, createToteModel } from '../src/models/Tote.js';

describe('Item Model Validation', () => {
  describe('validateItem', () => {
    it('should validate a complete valid item', () => {
      const validItem = {
        name: 'Test Item',
        description: 'A test description',
        category: 'Electronics',
        toteId: 123, // Changed to integer
        quantity: 5,
        condition: 'good',
        tags: ['test', 'electronics']
      };

      const result = validateItem(validItem);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject null item', () => {
      const result = validateItem(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item must be an object');
    });

    it('should reject undefined item', () => {
      const result = validateItem(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item must be an object');
    });

    it('should reject non-object item', () => {
      const result = validateItem('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item must be an object');
    });

    it('should reject item without name', () => {
      const invalidItem = {
        description: 'Missing name',
        category: 'Test'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should reject item with empty name', () => {
      const invalidItem = {
        name: '',
        category: 'Test'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should reject item with name too long', () => {
      const invalidItem = {
        name: 'A'.repeat(201),
        category: 'Test'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name') && e.includes('200'))).toBe(true);
    });

    it('should reject item with description too long', () => {
      const invalidItem = {
        name: 'Test Item',
        description: 'A'.repeat(1001)
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('description') && e.includes('1000'))).toBe(true);
    });

    it('should reject item with category too long', () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'A'.repeat(101)
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('category') && e.includes('100'))).toBe(true);
    });

    it('should reject item with wrong type for name', () => {
      const invalidItem = {
        name: 123,
        description: 'Test'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name must be a string');
    });

    it('should reject item with wrong type for toteId', () => {
      const invalidItem = {
        name: 'Test Item',
        toteId: 'not-a-number'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('toteId must be a number');
    });

    it('should reject item with non-integer toteId', () => {
      const invalidItem = {
        name: 'Test Item',
        toteId: 123.45
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('toteId') && e.includes('integer'))).toBe(true);
    });

    it('should reject item with invalid condition', () => {
      const invalidItem = {
        name: 'Test Item',
        condition: 'invalid-condition'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('condition'))).toBe(true);
    });

    it('should accept valid condition values', () => {
      const conditions = ['new', 'excellent', 'good', 'fair', 'poor', 'damaged'];

      conditions.forEach(condition => {
        const item = {
          name: 'Test Item',
          condition
        };

        const result = validateItem(item);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject negative quantity', () => {
      const invalidItem = {
        name: 'Test Item',
        quantity: -5
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('quantity'))).toBe(true);
    });

    it('should reject non-integer quantity', () => {
      const invalidItem = {
        name: 'Test Item',
        quantity: 3.5
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('quantity'))).toBe(true);
    });

    it('should trim whitespace from name', () => {
      const item = {
        name: '  Test Item  ',
        category: 'Test'
      };

      const result = validateItem(item);
      expect(result.valid).toBe(true);
    });

    it('should accept item with minimal fields', () => {
      const minimalItem = {
        name: 'Minimal Item'
      };

      const result = validateItem(minimalItem);
      expect(result.valid).toBe(true);
    });

    it('should validate tags as array', () => {
      const invalidItem = {
        name: 'Test Item',
        tags: 'not-an-array'
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags'))).toBe(true);
    });

    it('should reject tags array with too many items', () => {
      const invalidItem = {
        name: 'Test Item',
        tags: Array(51).fill('tag')
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags') && e.includes('50'))).toBe(true);
    });

    it('should reject tags array with non-string items', () => {
      const invalidItem = {
        name: 'Test Item',
        tags: ['valid', 123, 'another']
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags[1]') && e.includes('string'))).toBe(true);
    });

    it('should reject photos array with non-string items', () => {
      const invalidItem = {
        name: 'Test Item',
        photos: ['photo1.jpg', 456, 'photo3.jpg']
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('photos[1]') && e.includes('string'))).toBe(true);
    });

    it('should accept valid tags array', () => {
      const validItem = {
        name: 'Test Item',
        tags: ['tag1', 'tag2', 'tag3']
      };

      const result = validateItem(validItem);
      expect(result.valid).toBe(true);
    });

    it('should reject unknown fields', () => {
      const invalidItem = {
        name: 'Test Item',
        unknownField: 'value',
        anotherUnknown: 123
      };

      const result = validateItem(invalidItem);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Unknown fields'))).toBe(true);
    });

    it('should allow id, createdAt, updatedAt fields', () => {
      const validItem = {
        id: 1,
        name: 'Test Item',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      const result = validateItem(validItem);
      expect(result.valid).toBe(true);
    });

    it('should handle update validation', () => {
      const updates = {
        name: 'Updated Name'
      };

      const result = validateItem(updates, true);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid field in updates', () => {
      const updates = {
        condition: 'invalid-condition'
      };

      const result = validateItem(updates, true);
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeItem', () => {
    it('should apply default values', () => {
      const item = {
        name: 'Test Item'
      };

      const sanitized = sanitizeItem(item);
      expect(sanitized.quantity).toBe(1);
      expect(sanitized.condition).toBe('good');
      expect(sanitized.photos).toEqual([]);
      expect(sanitized.tags).toEqual([]);
    });

    it('should trim string fields', () => {
      const item = {
        name: '  Test Item  ',
        description: '  Description  ',
        category: '  Category  '
      };

      const sanitized = sanitizeItem(item);
      expect(sanitized.name).toBe('Test Item');
      expect(sanitized.description).toBe('Description');
      expect(sanitized.category).toBe('Category');
    });

    it('should convert invalid arrays to empty arrays', () => {
      const item = {
        name: 'Test Item',
        tags: 'not-an-array',
        photos: 123
      };

      const sanitized = sanitizeItem(item);
      expect(sanitized.tags).toEqual([]);
      expect(sanitized.photos).toEqual([]);
    });
  });

  describe('createItemModel', () => {
    it('should create item with all fields', () => {
      const data = {
        name: 'Test Item',
        description: 'Test Description',
        category: 'Test Category',
        toteId: 123,
        quantity: 5,
        condition: 'excellent',
        photos: ['photo1.jpg'],
        tags: ['tag1', 'tag2']
      };

      const model = createItemModel(data);
      expect(model.name).toBe('Test Item');
      expect(model.description).toBe('Test Description');
      expect(model.category).toBe('Test Category');
      expect(model.toteId).toBe(123);
      expect(model.quantity).toBe(5);
      expect(model.condition).toBe('excellent');
      expect(model.photos).toEqual(['photo1.jpg']);
      expect(model.tags).toEqual(['tag1', 'tag2']);
    });

    it('should apply defaults for missing fields', () => {
      const data = {
        name: 'Test Item'
      };

      const model = createItemModel(data);
      expect(model.name).toBe('Test Item');
      expect(model.description).toBe('');
      expect(model.category).toBe('');
      expect(model.toteId).toBeNull();
      expect(model.quantity).toBe(1);
      expect(model.condition).toBe('good');
      expect(model.photos).toEqual([]);
      expect(model.tags).toEqual([]);
    });
  });
});

describe('Tote Model Validation', () => {
  describe('validateTote', () => {
    it('should validate a complete valid tote', () => {
      const validTote = {
        location: 'Garage',
        locationId: 123,
        description: 'Storage tote in garage',
        color: 'blue',
        photos: ['photo1.jpg', 'photo2.jpg'],
        tags: ['storage', 'garage']
      };

      const result = validateTote(validTote);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept tote with no fields (all optional)', () => {
      const emptyTote = {};

      const result = validateTote(emptyTote);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept tote with minimal fields', () => {
      const minimalTote = {
        description: 'A minimal tote'
      };

      const result = validateTote(minimalTote);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject tags array with too many items', () => {
      const invalidTote = {
        location: 'Garage',
        tags: Array(51).fill('tag')
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags') && e.includes('50'))).toBe(true);
    });

    it('should reject tags array with non-string items', () => {
      const invalidTote = {
        location: 'Garage',
        tags: ['valid', 123, 'another']
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags[1]') && e.includes('string'))).toBe(true);
    });

    it('should reject photos array with non-string items', () => {
      const invalidTote = {
        location: 'Garage',
        photos: ['photo1.jpg', 456, 'photo3.jpg']
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('photos[1]') && e.includes('string'))).toBe(true);
    });

    it('should reject unknown fields', () => {
      const invalidTote = {
        location: 'Garage',
        unknownField: 'value',
        anotherUnknown: 123
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Unknown fields'))).toBe(true);
    });

    it('should allow id, createdAt, updatedAt fields', () => {
      const validTote = {
        id: 1,
        location: 'Garage',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      const result = validateTote(validTote);
      expect(result.valid).toBe(true);
    });

    it('should trim whitespace from description', () => {
      const tote = {
        description: '  Test Description  ',
        location: 'Garage'
      };

      const result = validateTote(tote);
      expect(result.valid).toBe(true);
    });

    it('should handle update validation', () => {
      const updates = {
        location: 'Updated Location'
      };

      const result = validateTote(updates, true);
      expect(result.valid).toBe(true);
    });

    it('should validate optional fields', () => {
      const tote = {
        location: 'Garage',
        description: 'A test description',
        color: 'red',
        photos: [],
        tags: []
      };

      const result = validateTote(tote);
      expect(result.valid).toBe(true);
    });

    it('should reject tote with description too long', () => {
      const invalidTote = {
        description: 'A'.repeat(1001)
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('description') && e.includes('1000'))).toBe(true);
    });

    it('should validate photos as array', () => {
      const invalidTote = {
        photos: 'not-an-array'
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('photos'))).toBe(true);
    });

    it('should validate tags as array', () => {
      const invalidTote = {
        tags: 'not-an-array'
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags'))).toBe(true);
    });

    it('should accept valid photos array', () => {
      const validTote = {
        photos: ['photo1.jpg', 'photo2.jpg']
      };

      const result = validateTote(validTote);
      expect(result.valid).toBe(true);
    });

    it('should accept valid tags array', () => {
      const validTote = {
        tags: ['tag1', 'tag2', 'tag3']
      };

      const result = validateTote(validTote);
      expect(result.valid).toBe(true);
    });
  });
});
