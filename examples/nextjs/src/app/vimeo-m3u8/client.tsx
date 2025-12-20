'use client';

import { useEffect, useRef, useState } from 'react';
import { MuxBackgroundVideo } from '@mux/mux-background-video/react';

interface VimeoM3U8ClientProps {
  m3u8Url: string;
}

export default function VimeoM3U8Client({ m3u8Url }: VimeoM3U8ClientProps) {
  const [playingTime, setPlayingTime] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [sizeLoading, setSizeLoading] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const m3u8LoadedRef = useRef(false);
  const m3u8IntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Count up timer
  useEffect(() => {
    m3u8IntervalRef.current = setInterval(() => {
      if (!m3u8LoadedRef.current) {
        setPlayingTime(Date.now() - startTimeRef.current);
      }
    }, 10);

    return () => {
      if (m3u8IntervalRef.current) {
        clearInterval(m3u8IntervalRef.current);
      }
    };
  }, []);

  // Fetch JS import size directly from CDN
  useEffect(() => {
    const fetchSize = async () => {
      try {
        const modulePath = '@mux/mux-background-video/react';
        // Resolve module path to CDN URL
        // For @mux/mux-background-video/react, the package exports "./react" -> "./dist/react.js"
        const packageName = modulePath.split('/').slice(0, -1).join('/'); // '@mux/mux-background-video'
        const subPath = modulePath.split('/').pop(); // 'react'
        
        // Try different CDN URL formats
        const urls = [
          `https://cdn.jsdelivr.net/npm/${packageName}/dist/${subPath}.js`,
          `https://unpkg.com/${packageName}/dist/${subPath}.js`,
          `https://cdn.jsdelivr.net/npm/${packageName}@latest/dist/${subPath}.js`,
          `https://unpkg.com/${packageName}@latest/dist/${subPath}.js`,
        ];
        
        let size = 0;
        
        for (const moduleUrl of urls) {
          try {
            const response = await fetch(moduleUrl, {
              method: 'HEAD',
              redirect: 'follow',
            });
            
            if (response.ok) {
              const contentLength = response.headers.get('content-length');
              if (contentLength) {
                size = parseInt(contentLength, 10);
                if (!isNaN(size) && size > 0) {
                  setTotalSize(size);
                  setSizeLoading(false);
                  return;
                }
              }
            }
          } catch (err) {
            // Try next URL
            continue;
          }
        }
        
        // If all URLs failed, set size to 0
        setTotalSize(0);
        setSizeLoading(false);
      } catch (error) {
        console.error('Error fetching module size:', error);
        setSizeLoading(false);
      }
    };

    // Wait a bit for page to load, then fetch
    const timeout = setTimeout(fetchSize, 2000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // Track m3u8 video playing time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handlePlaying = () => {
      if (!m3u8LoadedRef.current) {
        m3u8LoadedRef.current = true;
        setPlayingTime(Date.now() - startTimeRef.current);
        
        // Stop counting
        if (m3u8IntervalRef.current) {
          clearInterval(m3u8IntervalRef.current);
        }
      }
    };

    video.addEventListener('playing', handlePlaying);
    
    // Also check if already playing
    if (!video.paused && video.readyState >= 3) {
      handlePlaying();
    }

    return () => {
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0B';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: /*css*/ `
          html,
          body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          .mux-background-video {
            width: 100%;
            height: 100%;
          }

          .player-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10;
          }
          
          .player-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          
          .player-timer {
            font-size: 1.25rem;
            font-family: monospace;
          }
          
          .player-size {
            font-size: 1rem;
            font-family: monospace;
            opacity: 0.9;
            margin-top: 0.5rem;
          }
          
          .player-size.loading {
            animation: fadeInOut 1.5s ease-in-out infinite;
          }
          
          @keyframes fadeInOut {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.9;
            }
          }
        `,
        }}
      />
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <MuxBackgroundVideo ref={videoRef} src={m3u8Url}></MuxBackgroundVideo>
        </div>
        <div className="player-info">
          <div className="player-title">Mux BGV w/ Vimeo m3u8</div>
          <div className="player-timer">
            {formatTime(playingTime)}
          </div>
          <div className={`player-size ${sizeLoading ? 'loading' : ''}`}>
            {formatSize(totalSize)}
          </div>
        </div>
      </div>
    </>
  );
}
