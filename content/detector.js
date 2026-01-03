/**
 * Content script for detecting YouTube links in Patreon messages
 * and adding "Add to Playlist" buttons
 */

// Track processed links to avoid duplicate button injection
const processedLinks = new WeakSet();

/**
 * Initialize the detector
 */
function init() {
  console.log('[Patreon Playlist] Extension loaded');

  // Process existing links on page load
  processYouTubeLinks();

  // Watch for dynamically loaded content
  observePageChanges();
}

/**
 * Find and process all YouTube links on the page
 */
async function processYouTubeLinks() {
  const links = document.querySelectorAll('a[href]');

  for (const link of links) {
    // Skip if already processed
    if (processedLinks.has(link)) continue;

    const href = link.getAttribute('href');

    if (isYouTubeUrl(href)) {
      processedLinks.add(link);
      await addPlaylistButton(link, href);
    }
  }
}

/**
 * Add a playlist button next to a YouTube link
 * @param {HTMLElement} linkElement - The anchor element
 * @param {string} url - YouTube URL
 */
async function addPlaylistButton(linkElement, url) {
  const videoId = extractVideoId(url);
  if (!videoId) return;

  // Check if video is already in playlist and if it's been watched
  const playlist = await getPlaylist();
  const existingVideos = playlist.filter(video => video.videoId === videoId);
  const inPlaylist = existingVideos.length > 0;
  const isWatched = existingVideos.some(video => video.seenAt !== null);

  // Determine button text and color
  let buttonText, bgColor, hoverColor;
  if (isWatched) {
    buttonText = 'Already watched';
    bgColor = '#6c757d';
    hoverColor = '#5a6268';
  } else if (inPlaylist) {
    buttonText = '✓ In Playlist';
    bgColor = '#28a745';
    hoverColor = '#218838';
  } else {
    buttonText = '+ Add to Playlist';
    bgColor = '#007bff';
    hoverColor = '#0056b3';
  }

  // Create button
  const button = document.createElement('button');
  button.className = 'patreon-playlist-btn';
  button.dataset.videoId = videoId;
  button.dataset.url = url;
  button.textContent = buttonText;
  button.style.cssText = `
    display: inline-block;
    margin: 12px 0 12px 0px;
    padding: 6px 12px;
    font-size: 12px;
    background-color: ${bgColor};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    vertical-align: middle;
  `;

  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = hoverColor;
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = bgColor;
  });

  // Add click handler
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleButtonClick(button, url, videoId);
  });

  // Insert button after the link
  linkElement.parentNode.insertBefore(button, linkElement.nextSibling);
}

/**
 * Handle playlist button click
 * @param {HTMLElement} button - The button element
 * @param {string} url - YouTube URL
 * @param {string} videoId - YouTube video ID
 */
async function handleButtonClick(button, url, videoId) {
  const inPlaylist = await isVideoInPlaylist(videoId);

  if (inPlaylist) {
    // Show confirmation for duplicate
    const confirmed = await showConfirmationModal(videoId);
    if (!confirmed) return;
  }

  // Disable button while processing
  button.disabled = true;
  button.textContent = 'Adding...';

  try {
    // Fetch metadata
    const metadata = await fetchVideoMetadata(url);

    // Create video object
    const videoData = {
      id: generateUniqueId(),
      url: url,
      videoId: videoId,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      channel: metadata.channel,
      addedAt: new Date().toISOString(),
      seenAt: null
    };

    // Add to playlist
    const success = await addVideo(videoData);

    if (success) {
      button.textContent = '✓ In Playlist';
      button.style.backgroundColor = '#28a745';
      showNotification('Video added to playlist!');
    } else {
      throw new Error('Failed to add video');
    }
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    button.textContent = '✗ Error';
    button.style.backgroundColor = '#dc3545';
    showNotification('Failed to add video', 'error');

    // Reset button after 2 seconds
    setTimeout(() => {
      button.textContent = '+ Add to Playlist';
      button.style.backgroundColor = '#007bff';
      button.disabled = false;
    }, 2000);
  }
}

/**
 * Show confirmation modal for duplicate videos
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>} True if confirmed
 */
async function showConfirmationModal(videoId) {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    modal.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #333;">Video Already in Playlist</h3>
      <p style="margin: 0 0 24px 0; color: #666;">This video is already in your playlist. Do you want to add it again?</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-btn" style="
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">Cancel</button>
        <button id="confirm-btn" style="
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">Add Anyway</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Handle buttons
    const cancelBtn = modal.querySelector('#cancel-btn');
    const confirmBtn = modal.querySelector('#confirm-btn');

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false);
    });

    confirmBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        resolve(false);
      }
    });
  });
}

/**
 * Show a notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success' or 'error')
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10001;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * Observe page changes for dynamically loaded content
 */
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
        break;
      }
    }

    if (shouldProcess) {
      processYouTubeLinks();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
