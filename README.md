# Patreon Playlist

A Firefox extension that helps you collect and manage YouTube videos shared in Patreon messages.

## Features

- **Automatic Detection**: Detects YouTube links in Patreon messages (`https://www.patreon.com/messages/*`)
- **Easy Adding**: Click the inline button to add videos to your playlist
- **Duplicate Handling**: Warns when adding duplicate videos (allows with confirmation)
- **Rich Metadata**: Automatically fetches video titles, thumbnails, and channel names
- **Organized Viewing**: Separate sections for seen and unseen videos
- **Track Progress**: Mark videos as "seen" when clicked from the playlist
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
2. YouTube links will automatically have an "Add to Playlist" button next to them
3. Click the button to add the video to your playlist
4. If the video is already in the playlist, you'll see "✓ In Playlist"
5. Adding duplicates will prompt for confirmation

### Viewing Your Playlist

1. Click the extension icon in your browser toolbar
2. The playlist page will open showing:
   - **Unseen Videos**: Videos you haven't clicked yet
   - **Seen Videos**: Videos you've already watched
3. Click any video to open it in a new tab and mark it as "seen"
4. Use the "Remove" button to delete videos from the playlist

### Managing Videos

- **Mark as Seen**: Click on any unseen video from the playlist page
- **Remove Videos**: Click the "Remove" button on any video card
- **View Stats**: See total unseen and seen video counts in the header

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
├── utils/
│   ├── storage.js         # Storage helper functions
│   └── youtube.js         # YouTube URL parsing utilities
└── icons/                 # Extension icons (add your own)
```

## Technical Details

### Storage

Videos are stored using Firefox's `browser.storage.local` API with the following structure:

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
  ]
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
- Export/import playlist as JSON or CSV
- Sort and filter options (by date, channel, title)
- Search functionality
- Tags/categories for videos
- Watch progress tracking
- Statistics dashboard
- Dark mode theme

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

[Add your license here]

## Author

Dylan Duault
