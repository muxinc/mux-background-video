# Mux Background Video - Next.js Examples

This Next.js application demonstrates various ways to integrate the [mux-background-video](../../README.md) library into your React/Next.js projects.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the examples.

## 📋 Examples Overview

### 🎯 [Basic Example](/basic-example)
A simple hero section demonstrating the core functionality of mux-background-video:
- Single background video with overlay
- Basic configuration options
- Simple hero layout

### 🏢 [Hero Section](/hero-section)
A comprehensive landing page with:
- Full-screen hero with background video
- Multiple content sections
- Professional design patterns
- Scroll indicators and smooth transitions

### 🎮 [Interactive Controls](/interactive)
Real-time video controls showcasing:
- Dynamic playback ID switching
- Resolution adjustment controls
- Play/pause functionality
- Live configuration preview
- Performance monitoring

### 📱 [Responsive Design](/responsive)
Mobile-optimized implementation featuring:
- Device detection and adaptive behavior
- Mobile fallback backgrounds
- Performance optimizations for mobile devices
- Touch-friendly interactions

### 🔄 [Multiple Videos](/multiple-videos) *(Coming Soon)*
Advanced example with multiple video sections

### ⚡ [Performance Example](/performance) *(Coming Soon)*
Optimized implementation for maximum performance

## 🛠 Usage

### Basic Implementation

```tsx
import BackgroundVideo from '@/components/BackgroundVideo';

export default function MyPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        <BackgroundVideo
          playbackId="YOUR_MUX_PLAYBACK_ID"
          maxResolution="720p"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      
      <div className="relative z-10">
        {/* Your content here */}
      </div>
    </div>
  );
}
```

### Component Props

The `BackgroundVideo` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `playbackId` | `string` | **Required** | Your Mux playback ID |
| `maxResolution` | `'360p' \| '480p' \| '720p' \| '1080p' \| '1440p' \| '2160p'` | `'720p'` | Maximum video resolution |
| `className` | `string` | `''` | Additional CSS classes |
| `autoplay` | `boolean` | `true` | Auto-play the video |
| `muted` | `boolean` | `true` | Mute the video |
| `loop` | `boolean` | `true` | Loop the video |
| `playsInline` | `boolean` | `true` | Play inline on mobile |

## 🎬 Getting Your Mux Playback ID

To use these examples with your own videos:

1. **Sign up for Mux:** Visit [mux.com](https://mux.com) and create an account
2. **Upload a video:** Upload your video to Mux Video
3. **Get the playback ID:** Copy the playback ID from your video's details
4. **Replace in examples:** Update the `DEMO_PLAYBACK_ID` constant in any example

```tsx
// Replace this line in the examples
const DEMO_PLAYBACK_ID = 'DEMO_PLAYBACK_ID';

// With your actual playback ID
const DEMO_PLAYBACK_ID = 'your-actual-playback-id-here';
```

## 🏗 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── basic-example/           # Basic implementation
│   ├── hero-section/            # Full hero page
│   ├── interactive/             # Interactive controls
│   ├── responsive/              # Mobile-optimized
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page with navigation
├── components/
│   └── BackgroundVideo.tsx      # Reusable component
└── ...
```

## 🔧 Configuration

### Next.js Configuration

The project uses:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Turbopack** for fast development builds

### Development Scripts

```json
{
  "dev": "next dev --turbopack",    // Development server with Turbopack
  "build": "next build --turbopack", // Production build
  "start": "next start"             // Production server
}
```

## 🎨 Styling

The examples use Tailwind CSS for styling with a custom configuration optimized for video backgrounds:

- **Responsive design patterns**
- **Glass-morphism effects**
- **Smooth transitions and animations**
- **Mobile-first approach**

## 📱 Mobile Considerations

The responsive example demonstrates several mobile optimization techniques:

### Performance Optimizations
- **Lower resolution on mobile** (480p vs 720p/1080p)
- **Optional video disabling** on mobile devices
- **Fallback backgrounds** for unsupported devices
- **Battery-conscious implementations**

### User Experience
- **Touch-friendly controls**
- **Appropriate sizing and spacing**
- **Readable text over video**
- **Loading states and error handling**

## 🚀 Performance Tips

1. **Choose appropriate resolutions:**
   - Use 480p-720p for most applications
   - Reserve 1080p+ for high-end displays only

2. **Implement mobile fallbacks:**
   - Consider disabling video on mobile for battery life
   - Provide attractive static backgrounds

3. **Optimize video content:**
   - Keep videos under 30 seconds when possible
   - Use videos optimized for web (MP4 with H.264)

4. **Preload strategically:**
   - Only preload critical above-the-fold videos
   - Lazy load videos in lower sections

## 🐛 Troubleshooting

### Common Issues

**Video not playing:**
- Ensure your playback ID is correct
- Check that the video is public in your Mux dashboard
- Verify network connectivity

**Poor performance on mobile:**
- Lower the `maxResolution` prop
- Consider disabling video on mobile devices
- Check for JavaScript errors in the console

**Styling issues:**
- Ensure Tailwind CSS is properly installed
- Check for conflicting CSS rules
- Verify responsive breakpoints

## 📖 Additional Resources

- [Mux Documentation](https://docs.mux.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [mux-background-video Library](../../README.md)

## 🤝 Contributing

This is part of the mux-background-video project. For contributing guidelines, please see the main [README](../../README.md).

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Need help?** Open an issue in the main repository or check out the other examples for different implementation patterns.
