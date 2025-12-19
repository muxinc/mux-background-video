'use client';

import { useEffect, useRef, useState } from 'react';
import { MuxBackgroundVideo } from '@mux/mux-background-video/react';

interface VimeoComparisonClientProps {
  m3u8Url: string;
}

export default function VimeoComparisonClient({ m3u8Url }: VimeoComparisonClientProps) {
  const [iframeTime, setIframeTime] = useState<number | null>(null);
  const [m3u8Time, setM3u8Time] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const m3u8WrapperRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const iframeLoadedRef = useRef(false);
  const m3u8LoadedRef = useRef(false);

  // Track iframe play time via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Vimeo
      if (!event.origin.includes('vimeo.com')) return;

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        data = event.data;
      }

      if (data && data.event === 'ready') {
        iframeRef.current?.contentWindow?.postMessage({ method: 'ping' }, event.origin);
        iframeRef.current?.contentWindow?.postMessage({ method: 'addEventListener', value: 'playing' }, event.origin);
      }
      
      // Check if the message indicates the video is playing
      if (data && data.event === 'playing') {
        if (!iframeLoadedRef.current) {
          iframeLoadedRef.current = true;
          setIframeTime(Date.now() - startTimeRef.current);
        } 
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Track m3u8 video load time
  useEffect(() => {
    const wrapper = m3u8WrapperRef.current;
    if (!wrapper) return;

    let cleanup: (() => void) | null = null;

    // Find the video element inside the MuxBackgroundVideo wrapper
    const findVideo = () => {
      return wrapper.querySelector('video') as HTMLVideoElement | null;
    };

    const setupVideoListeners = (video: HTMLVideoElement) => {
      const handlePlaying = () => {
        if (!m3u8LoadedRef.current) {
          m3u8LoadedRef.current = true;
          setM3u8Time(Date.now() - startTimeRef.current);
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
    };

    // Try to find video immediately
    const video = findVideo();
    if (video) {
      cleanup = setupVideoListeners(video);
    } else {
      // Use MutationObserver to watch for when video is added
      const observer = new MutationObserver(() => {
        const foundVideo = findVideo();
        if (foundVideo && !m3u8LoadedRef.current && !cleanup) {
          cleanup = setupVideoListeners(foundVideo);
        }
      });

      observer.observe(wrapper, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        if (cleanup) cleanup();
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const formatTime = (ms: number | null) => {
    if (ms === null) return '--';
    return `${(ms / 1000).toFixed(2)}s`;
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
          
          .comparison-container {
            display: flex;
            width: 100%;
            height: 100vh;
            position: relative;
          }
          
          .player-section {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          
          .player-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            flex: 1;
          }
          
          .vimeo-background-iframe {
            box-sizing: border-box;
            height: 56.25vw;
            left: 50%;
            min-height: 100%;
            min-width: 100%;
            transform: translate(-50%, -50%);
            position: absolute;
            top: 50%;
            width: 177.77777778vh;
            pointer-events: none;
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
          
          .timer-label {
            font-size: 0.875rem;
            opacity: 0.8;
            margin-top: 0.25rem;
          }
        `,
        }}
      />
      <div className="comparison-container">
        {/* Iframe Player */}
        <div className="player-section">
          <div className="player-wrapper">
            <iframe
              ref={iframeRef}
              className="vimeo-background-iframe"
              src="https://player.vimeo.com/video/468763311?background=1&playsinline=1&responsive=0"
              title="Vimeo Background Video - Iframe"
            />
          </div>
          <div className="player-info">
            <div className="player-title">Vimeo iFrame</div>
            <div className="player-timer">
              {formatTime(iframeTime)}
            </div>
          </div>
        </div>

        {/* M3U8 Player */}
        <div className="player-section">
          <div className="player-wrapper" ref={m3u8WrapperRef}>
            <MuxBackgroundVideo src={m3u8Url}></MuxBackgroundVideo>
          </div>
          <div className="player-info">
            <div className="player-title">Mux BGV w/ Vimeo m3u8</div>
            <div className="player-timer">
              {formatTime(m3u8Time)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
