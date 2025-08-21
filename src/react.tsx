'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MuxBackgroundVideo as MuxBackgroundVideoCore } from './mux-background-video.js';

export interface MuxBackgroundVideoProps {
  src: string;
  muted?: boolean;
  maxResolution?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface MuxBackgroundVideoRef {
  play: () => void;
  pause: () => void;
}

export const MuxBackgroundVideo = forwardRef<MuxBackgroundVideoRef, MuxBackgroundVideoProps>(
  ({ src, muted = true, maxResolution, className, style, ...props }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const muxRef = useRef<InstanceType<typeof MuxBackgroundVideoCore> | null>(null);

    useEffect(() => {
      if (!videoRef.current) return;

      muxRef.current ??= new MuxBackgroundVideoCore();
      
      const videoElement = videoRef.current;
      muxRef.current.display = videoElement;
      muxRef.current.src = src;
      muxRef.current.config = {
        muted,
        ...(maxResolution && { maxResolution })
      };

      return () => {
        if (muxRef.current) {
          muxRef.current.display = undefined;
          muxRef.current = null;
        }
      };
    }, [src, muted, maxResolution]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: () => muxRef.current?.play(),
      pause: () => muxRef.current?.pause(),
    }), []);

    return (
      <video
        ref={videoRef}
        className={className}
        style={style}
        muted={muted}
        playsInline
        autoPlay
        loop
        {...props}
      />
    );
  }
);

MuxBackgroundVideo.displayName = 'MuxBackgroundVideo';
