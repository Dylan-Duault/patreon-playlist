/**
 * Storage utility functions for managing playlist data
 */

/**
 * Get the entire playlist from storage
 * @returns {Promise<Array>} Array of video objects
 */
async function getPlaylist() {
  try {
    const result = await browser.storage.local.get('playlist');
    return result.playlist || [];
  } catch (error) {
    console.error('Error getting playlist:', error);
    return [];
  }
}

/**
 * Add a video to the playlist
 * @param {Object} videoData - Video data object
 * @returns {Promise<boolean>} Success status
 */
async function addVideo(videoData) {
  try {
    const playlist = await getPlaylist();
    playlist.push(videoData);
    await browser.storage.local.set({ playlist });
    return true;
  } catch (error) {
    console.error('Error adding video:', error);
    return false;
  }
}

/**
 * Remove a video from the playlist by ID
 * @param {string} id - Video ID to remove
 * @returns {Promise<boolean>} Success status
 */
async function removeVideo(id) {
  try {
    const playlist = await getPlaylist();
    const filteredPlaylist = playlist.filter(video => video.id !== id);
    await browser.storage.local.set({ playlist: filteredPlaylist });
    return true;
  } catch (error) {
    console.error('Error removing video:', error);
    return false;
  }
}

/**
 * Mark a video as seen
 * @param {string} id - Video ID to mark as seen
 * @returns {Promise<boolean>} Success status
 */
async function markAsSeen(id) {
  try {
    const playlist = await getPlaylist();
    const video = playlist.find(v => v.id === id);

    if (video) {
      video.seenAt = new Date().toISOString();
      await browser.storage.local.set({ playlist });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error marking video as seen:', error);
    return false;
  }
}

/**
 * Mark a video as unseen
 * @param {string} id - Video ID to mark as unseen
 * @returns {Promise<boolean>} Success status
 */
async function markAsUnseen(id) {
  try {
    const playlist = await getPlaylist();
    const video = playlist.find(v => v.id === id);

    if (video) {
      video.seenAt = null;
      await browser.storage.local.set({ playlist });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error marking video as unseen:', error);
    return false;
  }
}

/**
 * Check if a video is already in the playlist by video ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>} True if video exists
 */
async function isVideoInPlaylist(videoId) {
  try {
    const playlist = await getPlaylist();
    return playlist.some(video => video.videoId === videoId);
  } catch (error) {
    console.error('Error checking if video in playlist:', error);
    return false;
  }
}
