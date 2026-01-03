# Patreon Playlist - Firefox Extension

## Project Overview

A Firefox extension that enhances the Patreon messaging experience by allowing users to collect and manage YouTube video links shared in their messages.

## Scope

- **Target Platform**: Firefox
- **Target Website**: patreon.com (specifically `https://www.patreon.com/messages/*`)
- **Purpose**: Detect YouTube links in Patreon messages and allow users to build a personal playlist

## Features

### 1. YouTube Link Detection
- Automatically detect `<a>` tags containing YouTube links in Patreon messages
- Support various YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://www.youtube.com/watch?v=VIDEO_ID&list=...&index=...`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - `https://m.youtube.com/watch?v=VIDEO_ID`
- Use MutationObserver to detect dynamically loaded messages

### 2. Add to Playlist
- Display inline button next to each detected YouTube link
- Button states:
  - "Add to Playlist" - video not in playlist
  - "In Playlist" - video already added
- Check playlist status on page load and update button accordingly
- Allow duplicate videos with confirmation modal

### 3. Playlist Management Page
- Dedicated "See my playlist" page accessible from extension popup/icon
- Two separate sections:
  - **Unseen Videos** - videos not yet watched
  - **Seen Videos** - videos that have been clicked from the playlist
- Display video metadata:
  - Thumbnail
  - Title
  - Channel name
  - Date added
- Features:
  - Click video to open in new tab and mark as "seen"
  - Remove button for each video
  - Timestamp tracking (addedAt, seenAt)

### 4. Data Storage
- Use Firefox `storage.local` API for persistence
- Store video metadata fetched from YouTube

## Technical Architecture

### Project Structure

```
patreon-playlist/
├── manifest.json              # Extension configuration
├── content/
│   └── detector.js            # Content script for Patreon messages
├── popup/
│   ├── playlist.html          # Playlist page UI
│   ├── playlist.js            # Playlist logic
│   └── playlist.css           # Styling
├── background/
│   └── background.js          # Background script (optional)
└── utils/
    ├── storage.js             # Storage helper functions
    └── youtube.js             # YouTube URL parsing utilities
```

### Components

#### 1. manifest.json
- Define extension metadata
- Permissions: `storage`, `activeTab`, host permissions for `patreon.com`
- Content scripts configuration for `https://www.patreon.com/messages/*`
- Browser action/popup configuration

#### 2. Content Script (detector.js)
- Scan DOM for YouTube links in `<a>` tags
- Extract video ID from URLs
- Check if video already exists in playlist
- Inject inline "Add to Playlist" / "In Playlist" button
- Handle button clicks and show confirmation modal for duplicates
- Listen for DOM changes using MutationObserver

#### 3. Playlist Page (popup/)
- Display videos grouped by seen/unseen status
- Fetch and display video metadata (title, thumbnail, channel)
- Handle video clicks (open in new tab, mark as seen, update seenAt timestamp)
- Implement remove functionality
- Auto-refresh when data changes

#### 4. Storage Structure

```json
{
  "playlist": [
    {
      "id": "unique_id_timestamp_based",
      "url": "https://www.youtube.com/watch?v=VIDEO_ID&list=...",
      "videoId": "VIDEO_ID",
      "title": "Video Title",
      "thumbnail": "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg",
      "channel": "Channel Name",
      "addedAt": "2026-01-03T10:30:00Z",
      "seenAt": null
    }
  ]
}
```

#### 5. YouTube Metadata Fetching
- Use YouTube oEmbed API: `https://www.youtube.com/oembed?url=VIDEO_URL&format=json`
- No API key required
- Provides: title, author_name (channel), thumbnail_url

#### 6. Utilities

**youtube.js**
- `extractVideoId(url)` - Extract video ID from various YouTube URL formats
- `isYouTubeUrl(url)` - Validate if URL is a YouTube link

**storage.js**
- `getPlaylist()` - Retrieve playlist from storage
- `addVideo(videoData)` - Add video to playlist
- `removeVideo(id)` - Remove video from playlist
- `markAsSeen(id)` - Update seenAt timestamp
- `isVideoInPlaylist(videoId)` - Check if video exists

## Implementation Plan

1. **Setup**: Create manifest.json with basic configuration
2. **Content Script**: Implement link detection and button injection
3. **Storage Layer**: Create storage utilities
4. **YouTube Utils**: Implement URL parsing and metadata fetching
5. **Playlist UI**: Build the playlist page with seen/unseen sections
6. **Integration**: Connect all components and test end-to-end
7. **Polish**: Add styling, error handling, and edge cases

## Technical Decisions

### Duplicate Handling
- Duplicates detected by `videoId` (not full URL with parameters)
- Original URL stored to preserve user context (e.g., playlist links)
- Confirmation modal required before adding duplicate

### Seen Status
- Video marked as "seen" when clicked from playlist page
- Not based on actual YouTube watch status
- Timestamp recorded in `seenAt` field

### URL Normalization
- Store original URL as provided
- Use extracted `videoId` for duplicate detection
- Preserve query parameters for user reference

## Future Enhancements (Out of Scope)

- Export/import playlist
- Sort and filter options
- Watch progress tracking
- Tags/categories
- Search functionality
- Statistics (total videos, watch time estimates)
