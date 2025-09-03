# Mux Background Video

A super lightweight component and HLS engine for creating background videos using Mux HLS streams.

## Features

- **Background Video**: Perfect for hero sections, landing pages, and immersive experiences
- **HLS Video Support**: Built-in HLS video engine for smooth streaming
- **React**: React component for easy integration
- **Web Components**: Custom element for easy integration
- **TypeScript Support**: Full TypeScript definitions included
- **Lightweight**: Minimal bundle size with no heavy dependencies
- **Preload Control**: Control video preloading behavior
- **Audio Control**: Enable or disable audio tracks for background videos
- **Resolution Control**: Set maximum resolution for optimal performance


## Installation

```bash
npm install mux-background-video
```

## Usage

### HTMLCustom Element

The easiest way to use Mux Background Video is with the custom element:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Background Video</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000;
    }
    
    mux-background-video {
      display: block;
      width: 100vw;
      height: 100vh;
    }
  </style>
  <script type="module" src="http://cdn.jsdelivr.net/npm/mux-background-video/html/+esm"></script>
</head>
<body>
  <mux-background-video src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"></mux-background-video>
</body>
</html>
```

### JavaScript Import

You can also import the custom element directly:

```typescript
import 'mux-background-video/html';

// The custom element is automatically registered
// You can now use <mux-background-video> in your HTML
```

### React Component

For React applications, use the React component:

```typescript
import { MuxBackgroundVideo } from 'mux-background-video/react';

function HeroSection() {
  return (
    <MuxBackgroundVideo src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8" />
  );
}
```

## Mux Data Integration

To enable [Mux data](https://www.mux.com/data) collection for your background videos, include the Mux embed script in your HTML page before the Mux Background Video script:

```html
<script defer src="https://cdn.jsdelivr.net/npm/mux-embed"></script>
```

Once this script is included, Mux data will automatically be enabled for all background videos on the page, providing you with detailed analytics and insights about video performance.


## API Reference

### HTML Custom Element: `<mux-background-video>`

The `<mux-background-video>` element automatically handles HLS streaming.

#### Attributes

- **`src`**: The Mux HLS stream URL (required)
- **`max-resolution`**: Maximum resolution for the video (e.g., "720p", "1080p")
- **`audio`**: Enable audio track (default: false)
- **`preload`**: Controls video preloading behavior (default: auto)
  - `"none"`: No preloading
  - `"metadata"`: Preload only metadata
  - `"auto"`: Preload video data

#### HTML Structure

```html
<mux-background-video audio max-resolution="720p" src="YOUR_STREAM_URL"></mux-background-video>
```

#### JavaScript Attributes

You can also set attributes programmatically:

```typescript
const element = document.querySelector('mux-background-video');

// Set maximum resolution
element.setAttribute('max-resolution', '1080p');

// Enable audio track
element.toggleAttribute('audio', true);

// Set preload behavior
element.setAttribute('preload', 'metadata');

// Set the stream URL
element.setAttribute('src', 'https://stream.mux.com/NEW_PLAYBACK_ID.m3u8');

// Get current values
console.log(element.getAttribute('src'));
console.log(element.getAttribute('max-resolution'));
console.log(element.hasAttribute('audio'));
console.log(element.getAttribute('preload'));
```

### React Component: `MuxBackgroundVideo`

#### Props

- **`src`**: The Mux HLS stream URL (required)
- **`maxResolution`**: Maximum resolution for the video (e.g., "720p", "1080p")
- **`audio`**: Enable audio track (default: false)
- **`preload`**: Controls video preloading behavior (default: auto)
  - `"none"`: No preloading
  - `"metadata"`: Preload only metadata
  - `"auto"`: Preload video data


#### Example

```typescript
<MuxBackgroundVideo
  src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"
  maxResolution="720p"
  audio={true}
/>
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd mux-background-video
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Development Commands

- **`npm start`**: Start development server with watch mode
- **`npm run build`**: Build the project
- **`npm run watch`**: Watch for changes and rebuild
- **`npm test`**: Run tests locally
- **`npm run test:browserstack`**: Run tests on BrowserStack mobile devices
- **`npm run setup:browserstack`**: Interactive setup for BrowserStack credentials

### Testing

#### Local Testing

Run tests locally:
```bash
npm test
```

#### BrowserStack Mobile Testing

To run tests on real mobile devices via BrowserStack:

1. **Get BrowserStack Credentials**: Sign up at [BrowserStack](https://www.browserstack.com/) and get your username and access key from your account settings.

2. **Set Environment Variables**: You can either:

   **Option A: Use the setup script (recommended):**
   ```bash
   npm run setup:browserstack
   ```

   **Option B: Create a `.env` file manually:**
   ```bash
   BROWSERSTACK_USERNAME=your_browserstack_username
   BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
   ```

3. **Install Dependencies**: Install the BrowserStack test runner:
```bash
npm install
```

4. **Run Mobile Tests**: Execute the BrowserStack test suite:
```bash
npm run test:browserstack
```

The BrowserStack configuration includes testing on:
- **iOS Devices**: iPhone 15 Pro (iOS 17), iPhone 14 (iOS 16), iPhone 12 (iOS 15)
- **iPad Devices**: iPad Pro 12.9 2022 (iOS 17), iPad Air 2022 (iOS 16)
- **Android Devices**: Samsung Galaxy S23 (Android 13), Google Pixel 7 (Android 13), OnePlus 9 (Android 12), Samsung Galaxy Tab S8 (Android 12)

#### Test Configuration

The BrowserStack tests are configured with:
- Video recording enabled
- Screenshot capture on test completion
- Network logs for debugging
- Console logs for detailed output
- 30-second timeout per test
- 2 retry attempts on failure

### Development Server

When running the dev server, you can use the following URL parameters:

- **`PLAYBACK_ID`**: Set a custom Mux playback ID (defaults to demo video)
- **`max-resolution`**: Set maximum resolution for the background video
- **`audio`**: Enable or disable audio track (default: false)
- **`preload`**: Set preload behavior ("none", "metadata", or "auto")
- **`debug`**: Enable debug mode
- **`nomuted`**: Disable muted attribute
- **`noloop`**: Disable loop attribute
- **`noautoplay`**: Disable autoplay attribute

Example:
```
http://localhost:3000/PLAYBACK_ID?max-resolution=720p&audio=1&preload=metadata
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
