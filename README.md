# Mux Background Video

A lightweight library for creating background videos using Mux HLS streams with customizable resolution controls.

## Features

- **HLS Video Support**: Built-in HLS video engine for smooth streaming
- **Resolution Control**: Set maximum resolution for optimal performance
- **Background Video**: Perfect for hero sections, landing pages, and immersive experiences
- **TypeScript Support**: Full TypeScript definitions included
- **Lightweight**: Minimal bundle size with no heavy dependencies

## Installation

```bash
npm install mux-background-video
```

## Usage

### Basic Implementation

```typescript
import { MuxBackgroundVideo } from 'mux-background-video';

// Get your video element
const videoElement = document.querySelector('#background-video');

// Create the background video instance
const backgroundVideo = new MuxBackgroundVideo(videoElement);

// Set the Mux HLS stream URL
backgroundVideo.src = 'https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8';

// Optional: Set maximum resolution for performance
backgroundVideo.maxResolution = '720p'; // 720p max
```

### HTML Example

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
        
        #video {
            width: 100%;
            height: 100vh;
            object-fit: cover;
            position: fixed;
            top: 0;
            left: 0;
            z-index: -1;
        }
    </style>
</head>
<body>
    <video id="video" autoplay muted loop playsinline></video>
    
    <script type="module">
        import { MuxBackgroundVideo } from 'mux-background-video';
        
        const video = document.querySelector('#video');
        const backgroundVideo = new MuxBackgroundVideo(video);
        
        // Set your Mux playback ID
        backgroundVideo.src = 'https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8';
        
        // Optional: Limit resolution for better performance
        backgroundVideo.maxResolution = '720p';
    </script>
</body>
</html>
```

## API Reference

### MuxBackgroundVideo Class

#### Constructor
```typescript
new MuxBackgroundVideo(display: IMediaDisplay, engine?: IMediaEngine)
```

#### Properties

- **`src`**: Set the HLS stream URL
- **`maxResolution`**: Set maximum resolution (e.g., 720p, 1080p)

#### Methods

- **`play()`**: Start playback
- **`pause()`**: Pause playback

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
- **`npm run serve`**: Start Vercel dev server

### Development Server

When running the dev server, you can use the following URL parameters:

- **`playbackId`**: Set a custom Mux playback ID (defaults to demo video)
- **`maxResolution`**: Set maximum resolution for the background video

Example:
```
http://localhost:3000/YOUR_ID?maxResolution=720p
```

## Project Structure

```
src/
├── engines/          # Video engine implementations
│   └── hls-mini/     # HLS video engine
├── index.ts          # Main exports
├── media-renderer.ts # Base media renderer
├── mux-background-video.ts # Main class
└── types.ts          # TypeScript definitions
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
