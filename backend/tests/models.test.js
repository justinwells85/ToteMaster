import { jest } from '@jest/globals';
import { validateItem } from '../src/models/Item.js';
import { validateTote } from '../src/models/Tote.js';

describe('Item Model Validation', () => {
  describe('validateItem', () => {
    it('should validate a complete valid item', () => {
      const validItem = {
        name: 'Test Item',
        description: 'A test description',
        category: 'Electronics',
        toteId: 123,
        quantity: 5,
        condition: 'good',
        tags: ['test', 'electronics']
      };

      const result = validateItem(validItem);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
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

    it('should accept valid tags array', () => {
      const validItem = {
        name: 'Test Item',
        tags: ['tag1', 'tag2', 'tag3']
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
});

describe('Tote Model Validation', () => {
  describe('validateTote', () => {
    it('should validate a complete valid tote', () => {
      const validTote = {
        location: 'Garage',
        description: 'Storage tote in garage',
        color: 'blue',
        locationId: 1
      };

      const result = validateTote(validTote);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept tote with minimal fields', () => {
      const minimalTote = {
        location: 'Garage'
      };

      const result = validateTote(minimalTote);
      expect(result.valid).toBe(true);
    });

    it('should accept tote with empty object (all fields optional)', () => {
      const emptyTote = {};

      const result = validateTote(emptyTote);
      expect(result.valid).toBe(true);
    });

    it('should reject tote with location too long', () => {
      const invalidTote = {
        location: 'A'.repeat(201)
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('location') && e.includes('200'))).toBe(true);
    });

    it('should trim whitespace from location', () => {
      const tote = {
        location: '  Test Location  '
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
        photos: ['photo1.jpg', 'photo2.jpg'],
        tags: ['storage', 'garage']
      };

      const result = validateTote(tote);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid locationId type', () => {
      const invalidTote = {
        location: 'Garage',
        locationId: 'not-a-number'
      };

      const result = validateTote(invalidTote);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('locationId'))).toBe(true);
    });
  });
});
