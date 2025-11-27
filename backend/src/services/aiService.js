import OpenAI from 'openai';
import logger from '../utils/logger.js';

// Check if AI features are enabled
const AI_ENABLED = process.env.AI_ENABLED === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
let openai = null;
if (AI_ENABLED && OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
  logger.info('OpenAI client initialized');
} else {
  logger.warn('AI features disabled: Missing or invalid OpenAI API key');
}

/**
 * Check if AI features are available
 * @returns {boolean} True if AI features are enabled and configured
 */
export const isAIAvailable = () => {
  return AI_ENABLED && openai !== null;
};

/**
 * Analyze a single photo to identify items
 * @param {string} photoUrl - URL of the photo to analyze
 * @returns {Promise<Array>} Array of identified items with structured data
 */
export const analyzeTotePhoto = async (photoUrl) => {
  if (!isAIAvailable()) {
    throw new Error('AI features are not enabled or configured');
  }

  const timer = logger.startTimer();
  logger.info('Analyzing tote photo with AI', { photoUrl });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying items in storage containers.
Analyze the image and identify all visible items in the tote/container.
For each item, provide:
- name: descriptive name of the item
- description: brief description including color, size, brand if visible
- category: appropriate category (electronics, clothing, toys, tools, kitchen, sports, books, decorations, etc.)
- quantity: estimated number of this item (if multiple identical items)
- condition: estimated condition (new, excellent, good, fair, poor)
- confidence: your confidence level (high, medium, low)

Return a JSON array of items. Only include clearly visible items.
If you cannot identify items clearly, return an empty array.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: photoUrl,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: 'Identify all items in this storage container. Return only valid JSON.',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    logger.debug('OpenAI response received', { photoUrl, contentLength: content.length });

    // Parse the response
    const result = JSON.parse(content);

    // Handle different possible response formats
    let items = [];
    if (Array.isArray(result)) {
      items = result;
    } else if (result.items && Array.isArray(result.items)) {
      items = result.items;
    } else if (result.identified_items && Array.isArray(result.identified_items)) {
      items = result.identified_items;
    }

    // Validate and normalize items
    const normalizedItems = items.map((item, index) => ({
      name: item.name || `Item ${index + 1}`,
      description: item.description || '',
      category: item.category || 'uncategorized',
      quantity: parseInt(item.quantity) || 1,
      condition: ['new', 'excellent', 'good', 'fair', 'poor', 'damaged'].includes(item.condition?.toLowerCase())
        ? item.condition.toLowerCase()
        : 'good',
      confidence: ['high', 'medium', 'low'].includes(item.confidence?.toLowerCase())
        ? item.confidence.toLowerCase()
        : 'medium',
      aiGenerated: true,
      sourcePhoto: photoUrl,
    }));

    logger.info('Photo analysis completed', {
      photoUrl,
      itemsIdentified: normalizedItems.length,
      tokensUsed: response.usage.total_tokens,
    });

    timer.end('analyzeTotePhoto completed');
    return normalizedItems;
  } catch (error) {
    logger.logError('Error analyzing tote photo', error, { photoUrl });

    // Check for specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing settings.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.status === 400) {
      throw new Error('Invalid image URL or format. Please ensure the image is accessible.');
    }

    throw error;
  }
};

/**
 * Analyze multiple photos and consolidate results
 * @param {Array<string>} photoUrls - Array of photo URLs to analyze
 * @returns {Promise<Array>} Consolidated array of identified items
 */
export const analyzeMultiplePhotos = async (photoUrls) => {
  if (!isAIAvailable()) {
    throw new Error('AI features are not enabled or configured');
  }

  if (!photoUrls || photoUrls.length === 0) {
    return [];
  }

  const timer = logger.startTimer();
  logger.info('Analyzing multiple photos', { photoCount: photoUrls.length });

  try {
    // Analyze each photo in parallel
    const analysisPromises = photoUrls.map((url) => analyzeTotePhoto(url));
    const results = await Promise.all(analysisPromises);

    // Flatten and consolidate results
    const allItems = results.flat();

    // Group similar items (same name and category)
    const consolidatedItems = [];
    const itemMap = new Map();

    allItems.forEach((item) => {
      const key = `${item.name.toLowerCase()}-${item.category.toLowerCase()}`;
      if (itemMap.has(key)) {
        // Merge with existing item
        const existing = itemMap.get(key);
        existing.quantity += item.quantity;

        // Combine descriptions if different
        if (item.description && !existing.description.includes(item.description)) {
          existing.description += ` | ${item.description}`;
        }

        // Use the higher confidence level
        const confidenceLevels = { high: 3, medium: 2, low: 1 };
        if (confidenceLevels[item.confidence] > confidenceLevels[existing.confidence]) {
          existing.confidence = item.confidence;
        }
      } else {
        // Add new item
        itemMap.set(key, { ...item });
      }
    });

    // Convert map back to array
    itemMap.forEach((item) => consolidatedItems.push(item));

    logger.info('Multiple photos analysis completed', {
      photoCount: photoUrls.length,
      totalItemsFound: allItems.length,
      consolidatedItems: consolidatedItems.length,
    });

    timer.end('analyzeMultiplePhotos completed');
    return consolidatedItems;
  } catch (error) {
    logger.logError('Error analyzing multiple photos', error, { photoCount: photoUrls.length });
    throw error;
  }
};

export default {
  isAIAvailable,
  analyzeTotePhoto,
  analyzeMultiplePhotos,
};
