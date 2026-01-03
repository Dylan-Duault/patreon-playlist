/**
 * YouTube utility functions for URL parsing and metadata fetching
 */

/**
 * Extract video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if not found
 */
function extractVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&?\s]+)/,
    /(?:youtu\.be\/)([^&?\s]+)/,
    /(?:youtube\.com\/embed\/)([^&?\s]+)/,
    /(?:m\.youtube\.com\/watch\?v=)([^&?\s]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a URL is a YouTube link
 * @param {string} url - URL to check
 * @returns {boolean} True if YouTube URL
 */
function isYouTubeUrl(url) {
  if (!url) return false;

  return /(?:youtube\.com|youtu\.be)/.test(url);
}

/**
 * Fetch video metadata from YouTube oEmbed API
 * @param {string} videoUrl - Full YouTube video URL
 * @returns {Promise<Object>} Video metadata object
 */
async function fetchVideoMetadata(videoUrl) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const data = await response.json();

    return {
      title: data.title || 'Unknown Title',
      channel: data.author_name || 'Unknown Channel',
      thumbnail: data.thumbnail_url || ''
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return {
      title: 'Unknown Title',
      channel: 'Unknown Channel',
      thumbnail: ''
    };
  }
}

/**
 * Generate a unique ID based on timestamp and random number
 * @returns {string} Unique ID
 */
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
