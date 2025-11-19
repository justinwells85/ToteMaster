import db from '../db/index.js';
import ToteRepository from '../db/repositories/ToteRepository.js';
import ItemRepository from '../db/repositories/ItemRepository.js';
import LocationRepository from '../db/repositories/LocationRepository.js';
import TagRepository from '../db/repositories/TagRepository.js';
import logger from '../utils/logger.js';

// Sample data for test generation
const SAMPLE_LOCATIONS = [
  { name: 'Garage Shelf #1', room: 'Garage', position: 'Shelf 1', specificReference: 'Top shelf, left side' },
  { name: 'Basement Corner', room: 'Basement', position: 'Northeast corner', specificReference: 'Behind the water heater' },
  { name: 'Attic Storage', room: 'Attic', position: 'Center', specificReference: 'Near the window' },
  { name: 'Closet Upper Shelf', room: 'Master Bedroom', position: 'Closet', specificReference: 'Upper shelf, right' },
  { name: 'Shed Back Wall', room: 'Shed', position: 'Back wall', specificReference: 'Left of the door' },
];

const SAMPLE_TAGS = [
  { name: 'Christmas', color: '#c41e3a' },
  { name: 'Halloween', color: '#ff6f00' },
  { name: 'Tools', color: '#1976d2' },
  { name: 'Kitchen', color: '#388e3c' },
  { name: 'Decorations', color: '#7b1fa2' },
  { name: 'Electronics', color: '#0097a7' },
  { name: 'Toys', color: '#f57c00' },
  { name: 'Books', color: '#5d4037' },
];

const SAMPLE_ITEMS = [
  { name: 'String Lights', category: 'Decorations' },
  { name: 'Ornaments Box', category: 'Decorations' },
  { name: 'Wreath', category: 'Decorations' },
  { name: 'Power Drill', category: 'Tools' },
  { name: 'Hammer Set', category: 'Tools' },
  { name: 'Screwdriver Set', category: 'Tools' },
  { name: 'Extension Cords', category: 'Electronics' },
  { name: 'Blender', category: 'Kitchen' },
  { name: 'Mixing Bowls', category: 'Kitchen' },
  { name: 'Board Games', category: 'Toys' },
  { name: 'LEGO Sets', category: 'Toys' },
  { name: 'Old Textbooks', category: 'Books' },
  { name: 'Photo Albums', category: 'Books' },
  { name: 'Paint Supplies', category: 'Tools' },
  { name: 'Garden Hose', category: 'Tools' },
  { name: 'Camping Gear', category: 'Sports' },
  { name: 'Sleeping Bags', category: 'Sports' },
  { name: 'Winter Coats', category: 'Clothing' },
  { name: 'Baby Clothes', category: 'Clothing' },
  { name: 'Old Laptops', category: 'Electronics' },
];

const SAMPLE_DESCRIPTIONS = [
  'In good condition',
  'Needs cleaning',
  'Like new',
  'Slightly damaged',
  'Complete set',
  'Missing some pieces',
  'Vintage item',
  'Recently purchased',
];

/**
 * Generate test data for a user
 * Creates 10 totes with 2-8 random items each
 */
export const generateTestData = async (userId) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    logger.info(`Generating test data for user ${userId}`);

    // Create sample locations
    const createdLocations = [];
    for (const locationData of SAMPLE_LOCATIONS) {
      const location = await LocationRepository.create(locationData, userId);
      createdLocations.push(location);
    }
    logger.info(`Created ${createdLocations.length} locations`);

    // Create sample tags
    const createdTags = [];
    for (const tagData of SAMPLE_TAGS) {
      try {
        const tag = await TagRepository.create(tagData, userId);
        createdTags.push(tag);
      } catch (error) {
        // Tag might already exist, try to find it
        const existing = await TagRepository.findByName(tagData.name, userId);
        if (existing) {
          createdTags.push(existing);
        }
      }
    }
    logger.info(`Created ${createdTags.length} tags`);

    // Create 10 totes
    const createdTotes = [];
    for (let i = 0; i < 10; i++) {
      const randomLocation = createdLocations[Math.floor(Math.random() * createdLocations.length)];

      const toteData = {
        name: i % 2 === 0 ? `Storage Tote ${i + 1}` : null, // Some totes have names, some don't
        description: SAMPLE_DESCRIPTIONS[Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length)],
        locationId: randomLocation.id,
        color: ['red', 'blue', 'green', 'yellow', 'clear'][Math.floor(Math.random() * 5)],
        photos: [],
        userId,
      };

      const tote = await ToteRepository.create(toteData);
      createdTotes.push(tote);

      // Add 1-2 random tags to the tote
      const numTags = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numTags; j++) {
        const randomTag = createdTags[Math.floor(Math.random() * createdTags.length)];
        try {
          await TagRepository.addToTote(tote.id, randomTag.id);
        } catch (error) {
          // Tag might already be added, ignore
        }
      }
    }
    logger.info(`Created ${createdTotes.length} totes`);

    // Create 2-8 items per tote
    let totalItems = 0;
    for (const tote of createdTotes) {
      const itemCount = Math.floor(Math.random() * 7) + 2; // 2-8 items

      for (let i = 0; i < itemCount; i++) {
        const randomItem = SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)];

        const itemData = {
          name: randomItem.name,
          description: SAMPLE_DESCRIPTIONS[Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length)],
          category: randomItem.category,
          toteId: tote.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          condition: ['new', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
          tags: [],
          photos: [],
          userId,
        };

        const item = await ItemRepository.create(itemData);
        totalItems++;

        // Add 0-2 random tags to the item
        const numTags = Math.floor(Math.random() * 3);
        for (let j = 0; j < numTags; j++) {
          const randomTag = createdTags[Math.floor(Math.random() * createdTags.length)];
          try {
            await TagRepository.addToItem(item.id, randomTag.id);
          } catch (error) {
            // Tag might already be added, ignore
          }
        }
      }
    }
    logger.info(`Created ${totalItems} items`);

    await client.query('COMMIT');

    return {
      success: true,
      summary: {
        locations: createdLocations.length,
        tags: createdTags.length,
        totes: createdTotes.length,
        items: totalItems,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error generating test data:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Clear all user data
 * Deletes all items, totes, locations, and tags for a user
 */
export const clearAllData = async (userId) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    logger.info(`Clearing all data for user ${userId}`);

    // Delete all junction table entries first (foreign keys)
    const itemTagsResult = await client.query(
      `DELETE FROM item_tags WHERE item_id IN (SELECT id FROM items WHERE user_id = $1)`,
      [userId]
    );

    const toteTagsResult = await client.query(
      `DELETE FROM tote_tags WHERE tote_id IN (SELECT id FROM totes WHERE user_id = $1)`,
      [userId]
    );

    // Delete all items
    const itemsResult = await client.query(
      `DELETE FROM items WHERE user_id = $1`,
      [userId]
    );

    // Delete all totes
    const totesResult = await client.query(
      `DELETE FROM totes WHERE user_id = $1`,
      [userId]
    );

    // Delete all locations
    const locationsResult = await client.query(
      `DELETE FROM locations WHERE user_id = $1`,
      [userId]
    );

    // Delete all tags
    const tagsResult = await client.query(
      `DELETE FROM tags WHERE user_id = $1`,
      [userId]
    );

    await client.query('COMMIT');

    const summary = {
      itemTags: itemTagsResult.rowCount,
      toteTags: toteTagsResult.rowCount,
      items: itemsResult.rowCount,
      totes: totesResult.rowCount,
      locations: locationsResult.rowCount,
      tags: tagsResult.rowCount,
    };

    logger.info(`Cleared data for user ${userId}:`, summary);

    return {
      success: true,
      summary,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error clearing data:', error);
    throw error;
  } finally {
    client.release();
  }
};
