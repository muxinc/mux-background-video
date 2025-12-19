'use client';

import { useEffect, useRef } from 'react';

export default function VimeoIframePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ensure the iframe is properly loaded
    if (iframeRef.current) {
      // Vimeo iframe API can be used here if needed
    }
  }, []);

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
        `,
        }}
      />
      <div className="vimeo-background-container">
        <iframe
          ref={iframeRef}
          className="vimeo-background-iframe"
          src="https://player.vimeo.com/video/606618627?background=1&playsinline=1&responsive=0"
          title="Vimeo Background Video"
        />
      </div>
    </>
  );
}
