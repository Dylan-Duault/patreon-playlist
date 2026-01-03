/**
 * Settings page logic
 */

// DOM elements
const paginationSizeInput = document.getElementById('pagination-size');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const saveStatus = document.getElementById('save-status');

/**
 * Initialize the settings page
 */
async function init() {
  await loadSettings();
  attachEventListeners();
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  const settings = await getSettings();
  paginationSizeInput.value = settings.paginationSize || 5;
}

/**
 * Attach event listeners to buttons
 */
function attachEventListeners() {
  saveBtn.addEventListener('click', handleSave);
  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', handleImport);
  clearBtn.addEventListener('click', handleClear);
}

/**
 * Handle save settings button click
 */
async function handleSave() {
  const paginationSize = parseInt(paginationSizeInput.value, 10);

  // Validate pagination size
  if (isNaN(paginationSize) || paginationSize < 1 || paginationSize > 50) {
    showStatus('Please enter a valid number between 1 and 50', 'error');
    return;
  }

  // Save settings
  const success = await saveSettings({
    paginationSize: paginationSize
  });

  if (success) {
    showStatus('Settings saved successfully!', 'success');
  } else {
    showStatus('Failed to save settings', 'error');
  }
}

/**
 * Handle export playlist button click
 */
async function handleExport() {
  const playlist = await getPlaylist();

  if (playlist.length === 0) {
    showStatus('No videos to export', 'error');
    return;
  }

  // Create export data with metadata
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalVideos: playlist.length,
    playlist: playlist
  };

  // Convert to JSON
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patreon-playlist-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus(`Exported ${playlist.length} videos successfully!`, 'success');
}

/**
 * Handle import playlist file selection
 */
async function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Reset file input
  importFileInput.value = '';

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Validate import data
    if (!importData.playlist || !Array.isArray(importData.playlist)) {
      showStatus('Invalid playlist file format', 'error');
      return;
    }

    // Confirm import
    const confirmed = confirm(
      `This will import ${importData.playlist.length} videos and merge them with your existing playlist. Continue?`
    );

    if (!confirmed) return;

    // Get existing playlist
    const existingPlaylist = await getPlaylist();

    // Merge playlists (avoid duplicates by videoId + addedAt)
    const mergedPlaylist = [...existingPlaylist];
    let addedCount = 0;

    for (const video of importData.playlist) {
      // Check if video already exists (same videoId and addedAt)
      const exists = existingPlaylist.some(
        v => v.videoId === video.videoId && v.addedAt === video.addedAt
      );

      if (!exists) {
        mergedPlaylist.push(video);
        addedCount++;
      }
    }

    // Save merged playlist
    await browser.storage.local.set({ playlist: mergedPlaylist });

    showStatus(
      `Imported ${addedCount} new videos (${importData.playlist.length - addedCount} duplicates skipped)`,
      'success'
    );
  } catch (error) {
    console.error('Import error:', error);
    showStatus('Failed to import playlist: ' + error.message, 'error');
  }
}

/**
 * Handle clear playlist button click
 */
async function handleClear() {
  const playlist = await getPlaylist();

  if (playlist.length === 0) {
    showStatus('Playlist is already empty', 'error');
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete all ${playlist.length} videos from your playlist? This cannot be undone!`
  );

  if (!confirmed) return;

  // Clear playlist
  await browser.storage.local.set({ playlist: [] });
  showStatus('Playlist cleared successfully', 'success');
}

/**
 * Show status message
 * @param {string} message - Status message
 * @param {string} type - Message type ('success' or 'error')
 */
function showStatus(message, type) {
  saveStatus.textContent = message;
  saveStatus.className = `save-status ${type}`;

  // Clear status after 3 seconds
  setTimeout(() => {
    saveStatus.textContent = '';
    saveStatus.className = 'save-status';
  }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
