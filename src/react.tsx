'use client';

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ComponentProps,
} from 'react';
import { MuxBackgroundVideo as MuxBackgroundVideoCore } from './mux-background-video.js';

export type MuxBackgroundVideoProps = ComponentProps<'video'> &
  MuxBackgroundVideoCore['config'];

export type MuxBackgroundVideoRef = Partial<MuxBackgroundVideoCore['display']>;

export const MuxBackgroundVideo = forwardRef<
  MuxBackgroundVideoRef,
  MuxBackgroundVideoProps
>(
  (
    {
      className,
      style,
      children,
      src,
      audio,
      debug,
      maxResolution,
      preload,
      ...props
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const muxRef = useRef<MuxBackgroundVideoCore | null>(null);

    useEffect(() => {
      if (!videoRef.current) return;

      muxRef.current ??= new MuxBackgroundVideoCore();
      muxRef.current.display = videoRef.current;
      muxRef.current.config = {
        audio,
        debug,
        maxResolution,
        preload,
      };
      muxRef.current.src = src ?? '';

      return () => {
        if (muxRef.current) {
          muxRef.current = null;
        }
      };
    }, [src, audio, debug, maxResolution, preload]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: () => videoRef.current!.play(),
        pause: () => videoRef.current!.pause(),
      }),
      []
    );

    return (
      <div
        className={`${className ? `${className} ` : ''}mux-background-video`}
        style={style}
      >
        <style>{
          /*css*/ `
          .mux-background-video {
            position: relative;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .mux-background-video > video {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: inherit;
          }

          .mux-background-video > :where(img, picture) {
            width: 100%;
            height: 100%;
            object-fit: inherit;
          }
        `
        }</style>
        {children}
        <video
          ref={videoRef}
          muted
          autoPlay
          loop
          playsInline
          disableRemotePlayback
          disablePictureInPicture
          {...props}
        />
      </div>
    );
  }
);

MuxBackgroundVideo.displayName = 'MuxBackgroundVideo';
