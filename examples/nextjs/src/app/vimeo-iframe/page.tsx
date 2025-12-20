'use client';

import { useEffect, useRef, useState } from 'react';

export default function VimeoIframePage() {
  const [playingTime, setPlayingTime] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);  const [sizeLoading, setSizeLoading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const iframeLoadedRef = useRef(false);
  const iframeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sizeFetchedRef = useRef(false);

  // Count up timer
  useEffect(() => {
    iframeIntervalRef.current = setInterval(() => {
      if (!iframeLoadedRef.current) {
        setPlayingTime(Date.now() - startTimeRef.current);
      }
    }, 10);

    return () => {
      if (iframeIntervalRef.current) {
        clearInterval(iframeIntervalRef.current);
      }
    };
  }, []);

  // Fetch total iframe size via API (triggered when playing event fires)
  const fetchSize = async () => {
    if (sizeFetchedRef.current) return;
    sizeFetchedRef.current = true;
    setSizeLoading(true);
    
    try {
      const iframeSrc = iframeRef.current?.src || 'https://player.vimeo.com/video/468763311?background=1&playsinline=1&responsive=0';

      const params = new URLSearchParams({
        url: iframeSrc,
        js: 'true',
      });
      
      const iframeResponse = await fetch(`/api/measure-size?${params.toString()}`);
      
      let totalSize = 0;
      
      if (iframeResponse.ok) {
        const iframeData = await iframeResponse.json();
        totalSize += iframeData.size || 0;
      }
      
      setTotalSize(totalSize);
      setSizeLoading(false);
    } catch (error) {
      console.error('Error fetching size:', error);
      setSizeLoading(false);
    }
  };

  // Track iframe play time via postMessage and trigger size fetch
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
        // Vimeo is ready, now we can send postMessage
        iframeRef.current?.contentWindow?.postMessage({ method: 'addEventListener', value: 'playing' }, event.origin);
        iframeRef.current?.contentWindow?.postMessage({ method: 'addEventListener', value: 'timeupdate' }, event.origin);
      }
      
      // Check if the message indicates the video is playing
      if (data && (data.event === 'playing' || data.event === 'timeupdate')) {
        if (!iframeLoadedRef.current) {
          iframeLoadedRef.current = true;
          setPlayingTime(Date.now() - startTimeRef.current);
          
          // Stop counting
          if (iframeIntervalRef.current) {
            clearInterval(iframeIntervalRef.current);
          }
          
          // Start fetching size when playing
          fetchSize();
        } 
      }
    };

    window.addEventListener('message', handleMessage);
    iframeRef.current?.contentWindow?.postMessage({ method: 'addEventListener', value: 'playing' }, '*');
    iframeRef.current?.contentWindow?.postMessage({ method: 'addEventListener', value: 'timeupdate' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
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
          
          .vimeo-background-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
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
      <div className="vimeo-background-container">
        <iframe
          ref={iframeRef}
          className="vimeo-background-iframe"
          src="https://player.vimeo.com/video/468763311?background=1&playsinline=1&responsive=0"
          title="Vimeo Background Video"
        />
      </div>
      <div className="player-info">
        <div className="player-title">Vimeo iFrame</div>
        <div className="player-timer">
          {formatTime(playingTime)}
        </div>
        <div className={`player-size ${sizeLoading ? 'loading' : ''}`}>
          {formatSize(totalSize)}
        </div>
      </div>
    </>
  );
}
