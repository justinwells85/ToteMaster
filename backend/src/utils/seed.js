/**
 * Seed Data Script
 * Populates the database with sample data for testing and development
 */

import { writeData } from './dataStore.js';
import logger from './logger.js';

const seedData = {
  totes: [
    {
      id: 'tote-001',
      name: 'Kitchen Essentials',
      location: 'Garage - Shelf A',
      description: 'Seasonal kitchen items and extra cookware',
      color: 'blue',
      label: 'KITCHEN-01',
      size: 'large',
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: 'tote-002',
      name: 'Holiday Decorations',
      location: 'Attic - North Corner',
      description: 'Christmas and winter holiday decorations',
      color: 'red',
      label: 'HOLIDAY-XMAS',
      size: 'extra-large',
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: 'tote-003',
      name: 'Summer Sports',
      location: 'Garage - Floor',
      description: 'Beach toys, swimming gear, and outdoor games',
      color: 'yellow',
      label: 'SPORTS-SUMMER',
      size: 'medium',
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: 'tote-004',
      name: 'Craft Supplies',
      location: 'Basement - Storage Room',
      description: 'Arts and crafts materials',
      color: 'purple',
      label: 'CRAFT-01',
      size: 'medium',
      createdAt: new Date('2024-02-10').toISOString(),
      updatedAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: 'tote-005',
      name: 'Winter Clothing',
      location: 'Bedroom Closet - Top Shelf',
      description: 'Winter coats, scarves, and gloves',
      color: 'gray',
      label: 'CLOTHES-WINTER',
      size: 'large',
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date('2024-03-01').toISOString(),
    },
  ],
  items: [
    // Kitchen items
    {
      id: 'item-001',
      name: 'Blender',
      description: 'Vitamix professional blender, rarely used',
      category: 'Appliances',
      toteId: 'tote-001',
      quantity: 1,
      condition: 'excellent',
      photoUrl: '',
      tags: ['kitchen', 'appliance', 'blender'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: 'item-002',
      name: 'Extra Mixing Bowls',
      description: 'Set of 3 stainless steel mixing bowls',
      category: 'Kitchenware',
      toteId: 'tote-001',
      quantity: 3,
      condition: 'good',
      photoUrl: '',
      tags: ['kitchen', 'bowls', 'cooking'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: 'item-003',
      name: 'Cake Pans',
      description: '9-inch round cake pans',
      category: 'Bakeware',
      toteId: 'tote-001',
      quantity: 2,
      condition: 'good',
      photoUrl: '',
      tags: ['kitchen', 'baking', 'pans'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
    },
    // Holiday items
    {
      id: 'item-004',
      name: 'Christmas Tree Lights',
      description: 'Multi-color LED string lights, 200 count',
      category: 'Decorations',
      toteId: 'tote-002',
      quantity: 4,
      condition: 'good',
      photoUrl: '',
      tags: ['christmas', 'lights', 'decorations'],
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: 'item-005',
      name: 'Ornament Sets',
      description: 'Glass ornaments, various colors',
      category: 'Decorations',
      toteId: 'tote-002',
      quantity: 50,
      condition: 'excellent',
      photoUrl: '',
      tags: ['christmas', 'ornaments', 'decorations'],
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: 'item-006',
      name: 'Artificial Wreath',
      description: 'Pine wreath with red berries',
      category: 'Decorations',
      toteId: 'tote-002',
      quantity: 1,
      condition: 'good',
      photoUrl: '',
      tags: ['christmas', 'wreath', 'decorations'],
      createdAt: new Date('2024-01-20').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
    },
    // Sports items
    {
      id: 'item-007',
      name: 'Beach Umbrella',
      description: 'Large striped beach umbrella with sand anchor',
      category: 'Outdoor',
      toteId: 'tote-003',
      quantity: 1,
      condition: 'fair',
      photoUrl: '',
      tags: ['beach', 'summer', 'outdoor'],
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: 'item-008',
      name: 'Snorkel Set',
      description: 'Adult snorkel mask and fins',
      category: 'Water Sports',
      toteId: 'tote-003',
      quantity: 2,
      condition: 'good',
      photoUrl: '',
      tags: ['beach', 'summer', 'swimming', 'snorkeling'],
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: 'item-009',
      name: 'Frisbee',
      description: 'Professional frisbee disc',
      category: 'Games',
      toteId: 'tote-003',
      quantity: 1,
      condition: 'excellent',
      photoUrl: '',
      tags: ['outdoor', 'games', 'summer'],
      createdAt: new Date('2024-02-01').toISOString(),
      updatedAt: new Date('2024-02-01').toISOString(),
    },
    // Craft items
    {
      id: 'item-010',
      name: 'Acrylic Paint Set',
      description: '24 color acrylic paint set',
      category: 'Art Supplies',
      toteId: 'tote-004',
      quantity: 1,
      condition: 'new',
      photoUrl: '',
      tags: ['art', 'paint', 'crafts'],
      createdAt: new Date('2024-02-10').toISOString(),
      updatedAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: 'item-011',
      name: 'Scrapbook Paper',
      description: 'Assorted scrapbook paper, 100 sheets',
      category: 'Paper Crafts',
      toteId: 'tote-004',
      quantity: 1,
      condition: 'good',
      photoUrl: '',
      tags: ['scrapbooking', 'paper', 'crafts'],
      createdAt: new Date('2024-02-10').toISOString(),
      updatedAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: 'item-012',
      name: 'Glue Gun',
      description: 'Hot glue gun with glue sticks',
      category: 'Tools',
      toteId: 'tote-004',
      quantity: 1,
      condition: 'good',
      photoUrl: '',
      tags: ['tools', 'crafts', 'glue'],
      createdAt: new Date('2024-02-10').toISOString(),
      updatedAt: new Date('2024-02-10').toISOString(),
    },
    // Winter clothing
    {
      id: 'item-013',
      name: 'Down Jacket',
      description: 'Black down winter jacket, size L',
      category: 'Outerwear',
      toteId: 'tote-005',
      quantity: 1,
      condition: 'excellent',
      photoUrl: '',
      tags: ['clothing', 'winter', 'jacket'],
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date('2024-03-01').toISOString(),
    },
    {
      id: 'item-014',
      name: 'Wool Scarves',
      description: 'Assorted wool scarves',
      category: 'Accessories',
      toteId: 'tote-005',
      quantity: 5,
      condition: 'good',
      photoUrl: '',
      tags: ['clothing', 'winter', 'accessories'],
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date('2024-03-01').toISOString(),
    },
    {
      id: 'item-015',
      name: 'Leather Gloves',
      description: 'Insulated leather gloves, size M',
      category: 'Accessories',
      toteId: 'tote-005',
      quantity: 2,
      condition: 'fair',
      photoUrl: '',
      tags: ['clothing', 'winter', 'accessories', 'gloves'],
      createdAt: new Date('2024-03-01').toISOString(),
      updatedAt: new Date('2024-03-01').toISOString(),
    },
  ],
};

/**
 * Seeds the database with sample data
 */
export async function seedDatabase() {
  try {
    logger.info('Starting database seed...');

    await writeData(seedData);

    logger.info('Database seeded successfully!', {
      totes: seedData.totes.length,
      items: seedData.items.length,
    });

    return true;
  } catch (error) {
    logger.error('Failed to seed database', { error: error.message });
    throw error;
  }
}

/**
 * Clears all data from the database
 */
export async function clearDatabase() {
  try {
    logger.info('Clearing database...');

    await writeData({ totes: [], items: [] });

    logger.info('Database cleared successfully!');

    return true;
  } catch (error) {
    logger.error('Failed to clear database', { error: error.message });
    throw error;
  }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === 'clear') {
    await clearDatabase();
  } else {
    await seedDatabase();
  }

  process.exit(0);
}
