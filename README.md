# Mux Background Video

A super lightweight component and HLS engine for creating background videos using Mux HLS streams.

## Features

- **Background Video**: Perfect for hero sections, landing pages, and immersive experiences
- **HLS Video Support**: Built-in HLS video engine for smooth streaming
- **React**: React component for easy integration
- **Web Components**: Custom element for easy integration
- **TypeScript Support**: Full TypeScript definitions included
- **Lightweight**: Minimal bundle size with no dependencies
- **Preload Control**: Control video preloading behavior
- **Audio Control**: Optionally enable audio tracks for background videos
- **Resolution Control**: Set maximum resolution for optimal performance


## Installation

```bash
npm install @mux/mux-background-video
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
    html, 
    body {
      height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
    }
    
    mux-background-video,
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
  <script type="module" src="http://cdn.jsdelivr.net/npm/@mux/mux-background-video/html/+esm"></script>
</head>
<body>
  <mux-background-video src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8">
    <img src="https://image.mux.com/YOUR_PLAYBACK_ID/thumbnail.webp?time=0" alt="Mux Background Video" />
  </mux-background-video>
</body>
</html>
```

### JavaScript Import

You can also import the custom element directly:

```ts
import '@mux/mux-background-video/html';

// The custom element is automatically registered
// You can now use <mux-background-video> in your HTML
```

### React Component

For React applications, use the React component:

```tsx
import { MuxBackgroundVideo } from '@mux/mux-background-video/react';

function HeroSection() {
  return (
    <MuxBackgroundVideo src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8">
      <img src="https://image.mux.com/YOUR_PLAYBACK_ID/thumbnail.webp?time=0" alt="Mux Background Video" />
    </MuxBackgroundVideo>
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
<mux-background-video audio max-resolution="720p" src="YOUR_STREAM_URL">
  <img src="https://image.mux.com/YOUR_PLAYBACK_ID/thumbnail.webp?time=0" alt="Mux Background Video" />
</mux-background-video>
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

```tsx
<MuxBackgroundVideo
  src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"
  maxResolution="720p"
  audio={true}
>
  <img src="https://image.mux.com/YOUR_PLAYBACK_ID/thumbnail.webp?time=0" alt="Mux Background Video" />
</MuxBackgroundVideo>
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
- **`npm run test:browserstack`**: Run integration tests on BrowserStack
- **`npm run setup:browserstack`**: Interactive setup for BrowserStack credentials

### Testing

#### Local Testing

Run tests locally:
```bash
npm test
```


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

For issues and questions, please [open an issue](https://github.com/muxinc/mux-background-video/issues/new) on GitHub.
