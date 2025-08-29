# Mux Background Video

A lightweight library for creating background videos using Mux HLS streams with customizable resolution controls and audio option.

## Features

- **HLS Video Support**: Built-in HLS video engine for smooth streaming
- **Resolution Control**: Set maximum resolution for optimal performance
- **Audio Control**: Enable or disable audio tracks for background videos
- **Background Video**: Perfect for hero sections, landing pages, and immersive experiences
- **TypeScript Support**: Full TypeScript definitions included
- **Lightweight**: Minimal bundle size with no heavy dependencies
- **React**: React component for easy integration
- **Web Components**: Custom HTML element for easy integration

## Installation

```bash
npm install mux-background-video
```

## Usage

### HTML Custom Element

The easiest way to use Mux Background Video is with the custom HTML element:

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
    
    mux-background-video, 
    video {
      display: block;
      width: 100vw;
      height: 100vh;
      object-fit: cover;
    }
  </style>
  <script type="module" src="http://cdn.jsdelivr.net/npm/mux-background-video/html/+esm"></script>
</head>
<body>
  <mux-background-video 
    src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8" 
    max-resolution="720p"
    preload="metadata"
  >
    <video autoplay muted loop playsinline></video>
  </mux-background-video>
</body>
</html>
```

### JavaScript Import

You can also import the custom element class directly:

```typescript
import { MuxBackgroundVideoElement } from 'mux-background-video/html';

// The custom element is automatically registered
// You can now use <mux-background-video> in your HTML
```

### React Component

For React applications, use the React component:

```typescript
import { MuxBackgroundVideo } from 'mux-background-video/react';

function HeroSection() {
  return (
    <MuxBackgroundVideo
      src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"
      maxResolution="720p"
      autoPlay 
      muted 
      loop 
      playsInline
    />
  );
}
```

## API Reference

### HTML Custom Element: `<mux-background-video>`

The `<mux-background-video>` element wraps a `<video>` element and automatically handles HLS streaming.

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
  <video autoplay muted loop playsinline></video>
</mux-background-video>
```

#### JavaScript Properties

You can also set properties programmatically:

```typescript
const element = document.querySelector('mux-background-video');

// Set maximum resolution
element.maxResolution = '1080p';

// Enable audio track
element.audio = true;

// Set the stream URL
element.src = 'https://stream.mux.com/NEW_PLAYBACK_ID.m3u8';

// Set preload behavior
element.preload = 'metadata';

// Get current values
console.log(element.src);
console.log(element.maxResolution);
console.log(element.audio);
console.log(element.preload);
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
  preload="metadata"
  autoPlay
  muted
  loop
  playsInline
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

### Development Server

When running the dev server, you can use the following URL parameters:

- **`playbackId`**: Set a custom Mux playback ID (defaults to demo video)
- **`maxResolution`**: Set maximum resolution for the background video
- **`audio`**: Enable or disable audio track (default: false)
- **`preload`**: Set preload behavior ("none", "metadata", or "auto")

Example:
```
http://localhost:3000/YOUR_PLAYBACK_ID?maxResolution=720p&audio=1&preload=metadata
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
