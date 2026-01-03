# Patreon Playlist

A Firefox extension that helps you collect and manage YouTube videos shared in Patreon messages.

## Features

- **Automatic Detection**: Detects YouTube links in Patreon messages (`https://www.patreon.com/messages/*`)
- **Smart Button States**: Inline buttons show video status (Add to Playlist / In Playlist / Already watched)
- **Duplicate Handling**: Warns when adding duplicate videos (allows with confirmation)
- **Rich Metadata**: Automatically fetches video titles, thumbnails, and channel names
- **Organized Viewing**: Separate sections for seen and unseen videos with pagination
- **Flexible Pagination**: Configurable videos per page (1-50) via settings
- **Track Progress**: Mark videos as seen/unseen with dedicated buttons or by clicking
- **Export/Import**: Backup and restore your playlist as JSON files
- **Settings Page**: Easily accessible gear icon in playlist header
- **Clean Interface**: Modern, intuitive design with gradient header and card-based layout

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&list=...&index=...`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

## Installation

### Firefox

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the extension directory and select `manifest.json`
5. The extension is now loaded!

For permanent installation:
- Package the extension and submit to Firefox Add-ons (AMO)
- Or sign the extension yourself for distribution

### Icons (Optional)

The extension will work without custom icons (Firefox will use a default). To add custom icons:

1. Create PNG files in the `icons/` directory:
   - `icon-16.png` (16x16 pixels)
   - `icon-48.png` (48x48 pixels)
   - `icon-128.png` (128x128 pixels)

## Usage

### Adding Videos to Playlist

1. Visit any Patreon messages page (`https://www.patreon.com/messages/*`)
2. YouTube links will automatically have a button next to them with one of three states:
   - **"+ Add to Playlist"** (Blue) - Video not in playlist
   - **"✓ In Playlist"** (Green) - Video added but not watched
   - **"Already watched"** (Gray) - Video has been watched
3. Click the button to add videos to your playlist
4. Adding duplicates will prompt for confirmation

### Viewing Your Playlist

1. Click the extension icon in your browser toolbar
2. The playlist page will open showing:
   - **Unseen Videos**: Videos you haven't watched yet (paginated)
   - **Seen Videos**: Videos you've already watched (paginated)
3. Click any video card to open it in a new tab and mark it as "seen"
4. Use pagination controls to navigate between pages (Previous/Next)
5. Click the ⚙ gear icon in the header to access settings

### Managing Videos

- **Mark as Seen/Unseen**: Use the "Mark as seen" or "Mark as unseen" button on each video card
- **Remove Videos**: Click the "Remove" button on any video card
- **View Stats**: See total unseen and seen video counts in the header
- **Export Playlist**: Settings → Export Playlist (JSON) to backup your collection
- **Import Playlist**: Settings → Import to restore or merge playlists
- **Configure Pagination**: Settings → Change videos per page (1-50)
- **Clear Playlist**: Settings → Clear All Videos (with confirmation)

## Project Structure

```
patreon-playlist/
├── manifest.json          # Extension configuration
├── content/
│   └── detector.js        # Detects YouTube links and adds buttons
├── popup/
│   ├── playlist.html      # Playlist page UI
│   ├── playlist.js        # Playlist logic
│   └── playlist.css       # Styling
├── settings/
│   ├── settings.html      # Settings page UI
│   ├── settings.js        # Settings logic
│   └── settings.css       # Settings styling
├── utils/
│   ├── storage.js         # Storage helper functions
│   └── youtube.js         # YouTube URL parsing utilities
└── icons/                 # Extension icons
```

## Technical Details

### Storage

Data is stored using Firefox's `browser.storage.local` API with the following structure:

```json
{
  "playlist": [
    {
      "id": "unique_id",
      "url": "https://www.youtube.com/watch?v=...",
      "videoId": "VIDEO_ID",
      "title": "Video Title",
      "thumbnail": "thumbnail_url",
      "channel": "Channel Name",
      "addedAt": "2026-01-03T10:30:00Z",
      "seenAt": null
    }
  ],
  "settings": {
    "paginationSize": 5
  }
}
```

### YouTube Metadata

The extension uses YouTube's oEmbed API to fetch video metadata:
- **Endpoint**: `https://www.youtube.com/oembed?url=VIDEO_URL&format=json`
- **No API key required**
- **Data retrieved**: title, author_name (channel), thumbnail_url

### Content Script

The content script (`detector.js`) runs on Patreon message pages and:
- Scans for YouTube links using regex patterns
- Injects inline buttons next to detected links
- Uses `MutationObserver` to detect dynamically loaded content
- Shows confirmation modals for duplicate videos
- Displays notifications for user actions

## Development

### Requirements

- Firefox Browser (Developer Edition recommended)
- Git (for version control)

### Setup

```bash
git clone git@github.com:Dylan-Duault/patreon-playlist.git
cd patreon-playlist
```

### Testing

1. Load the extension in Firefox (see Installation above)
2. Visit `https://www.patreon.com/messages/*` (requires Patreon account)
3. Test adding videos with various YouTube URL formats
4. Check the playlist page for proper rendering
5. Test marking videos as seen and removing them

### Debugging

- Use Firefox Browser Console (`Ctrl+Shift+J`) for background/popup errors
- Use Firefox Web Console (`F12`) on Patreon pages for content script errors
- Check storage: `about:debugging` → Extension → Inspect → Console → `browser.storage.local.get('playlist')`

## Future Enhancements

Potential features for future versions:
- Sort and filter options (by date, channel, title)
- Search functionality
- Tags/categories for videos
- Watch progress tracking
- Statistics dashboard
- Dark mode theme
- Bulk operations (mark all as seen, remove all seen videos)
- Video notes/comments

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

[Add your license here]

## Author

Dylan Duault
