/**
 * Playlist page logic
 */

// DOM elements
const unseenVideosContainer = document.getElementById('unseen-videos');
const seenVideosContainer = document.getElementById('seen-videos');
const unseenCountElement = document.getElementById('unseen-count');
const seenCountElement = document.getElementById('seen-count');

// Pagination state
const ITEMS_PER_PAGE = 5;
let unseenCurrentPage = 1;
let seenCurrentPage = 1;

/**
 * Initialize the playlist page
 */
async function init() {
  await loadAndRenderPlaylist();

  // Listen for storage changes
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.playlist) {
      loadAndRenderPlaylist();
    }
  });
}

/**
 * Load playlist from storage and render it
 */
async function loadAndRenderPlaylist() {
  const playlist = await getPlaylist();

  // Separate seen and unseen videos
  const unseenVideos = playlist.filter(video => !video.seenAt);
  const seenVideos = playlist.filter(video => video.seenAt);

  // Update counts
  unseenCountElement.textContent = `${unseenVideos.length} unseen`;
  seenCountElement.textContent = `${seenVideos.length} seen`;

  // Render videos with pagination
  renderVideos(unseenVideos, unseenVideosContainer, false, unseenCurrentPage);
  renderVideos(seenVideos, seenVideosContainer, true, seenCurrentPage);
}

/**
 * Render videos in a container
 * @param {Array} videos - Array of video objects
 * @param {HTMLElement} container - Container element
 * @param {boolean} isSeen - Whether these are seen videos
 * @param {number} currentPage - Current page number
 */
function renderVideos(videos, container, isSeen, currentPage) {
  // Clear container
  container.innerHTML = '';

  if (videos.length === 0) {
    // Show empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <p>${isSeen ? 'No seen videos yet' : 'No unseen videos yet'}</p>
      <small>${isSeen ? 'Click on videos to mark them as seen' : 'Add videos from Patreon messages to see them here'}</small>
    `;
    container.appendChild(emptyState);
    return;
  }

  // Sort videos by date (newest first)
  const sortedVideos = [...videos].sort((a, b) => {
    const dateA = new Date(isSeen ? a.seenAt : a.addedAt);
    const dateB = new Date(isSeen ? b.seenAt : b.addedAt);
    return dateB - dateA;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedVideos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVideos = sortedVideos.slice(startIndex, endIndex);

  // Create video list container
  const videoList = document.createElement('div');
  videoList.className = 'video-list-items';

  // Render each video for current page
  paginatedVideos.forEach(video => {
    const videoCard = createVideoCard(video, isSeen);
    videoList.appendChild(videoCard);
  });

  container.appendChild(videoList);

  // Render pagination controls if needed
  if (totalPages > 1) {
    const paginationControls = createPaginationControls(
      currentPage,
      totalPages,
      isSeen
    );
    container.appendChild(paginationControls);
  }
}

/**
 * Create a video card element
 * @param {Object} video - Video object
 * @param {boolean} isSeen - Whether this is a seen video
 * @returns {HTMLElement} Video card element
 */
function createVideoCard(video, isSeen) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.dataset.videoId = video.id;

  // Format dates
  const addedDate = formatDate(video.addedAt);
  const seenDate = video.seenAt ? formatDate(video.seenAt) : null;

  card.innerHTML = `
    <div class="video-thumbnail">
      ${video.thumbnail ? `<img src="${video.thumbnail}" alt="${video.title}">` : ''}
    </div>
    <div class="video-info">
      <div>
        <div class="video-title">${escapeHtml(video.title)}</div>
        <div class="video-channel">${escapeHtml(video.channel)}</div>
      </div>
      <div class="video-meta">
        <div class="video-date">
          <span>Added: ${addedDate}</span>
          ${seenDate ? `<span>Seen: ${seenDate}</span>` : ''}
        </div>
        <div class="video-actions">
          <button class="btn-mark-seen" data-video-id="${video.id}">
            ${isSeen ? 'Mark as unseen' : 'Mark as seen'}
          </button>
          <button class="btn-remove" data-video-id="${video.id}">Remove</button>
        </div>
      </div>
    </div>
  `;

  // Add click handler for the card (except on action buttons)
  card.addEventListener('click', async (e) => {
    // Ignore clicks on action buttons
    if (e.target.classList.contains('btn-remove')) {
      e.stopPropagation();
      await handleRemoveVideo(video.id);
      return;
    }

    if (e.target.classList.contains('btn-mark-seen')) {
      e.stopPropagation();
      await handleToggleSeen(video.id, isSeen);
      return;
    }

    // Open video and mark as seen
    await handleVideoClick(video);
  });

  return card;
}

/**
 * Handle video card click
 * @param {Object} video - Video object
 */
async function handleVideoClick(video) {
  // Open video in new tab
  browser.tabs.create({ url: video.url });

  // Mark as seen if not already
  if (!video.seenAt) {
    await markAsSeen(video.id);
  }
}

/**
 * Handle remove video button click
 * @param {string} videoId - Video ID to remove
 */
async function handleRemoveVideo(videoId) {
  const confirmed = confirm('Are you sure you want to remove this video from your playlist?');

  if (confirmed) {
    await removeVideo(videoId);
  }
}

/**
 * Handle toggle seen/unseen button click
 * @param {string} videoId - Video ID to toggle
 * @param {boolean} isSeen - Current seen status
 */
async function handleToggleSeen(videoId, isSeen) {
  if (isSeen) {
    await markAsUnseen(videoId);
  } else {
    await markAsSeen(videoId);
  }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create pagination controls
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {boolean} isSeen - Whether this is for seen videos
 * @returns {HTMLElement} Pagination controls element
 */
function createPaginationControls(currentPage, totalPages, isSeen) {
  const controls = document.createElement('div');
  controls.className = 'pagination-controls';

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn';
  prevButton.textContent = '← Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (isSeen) {
      seenCurrentPage--;
    } else {
      unseenCurrentPage--;
    }
    loadAndRenderPlaylist();
  });

  // Page info
  const pageInfo = document.createElement('span');
  pageInfo.className = 'pagination-info';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn';
  nextButton.textContent = 'Next →';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (isSeen) {
      seenCurrentPage++;
    } else {
      unseenCurrentPage++;
    }
    loadAndRenderPlaylist();
  });

  controls.appendChild(prevButton);
  controls.appendChild(pageInfo);
  controls.appendChild(nextButton);

  return controls;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
