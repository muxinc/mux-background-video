import { MediaRendererMixin } from './media-renderer.js';
import { HlsMini, HlsMiniConfig } from './engines/hls-mini/index.js';
import type { Constructor } from './types.js';

export function MuxBackgroundVideoMixin<T extends Constructor<EventTarget>>(Base: T) {
  return class MuxBackgroundVideoClass extends MediaRendererMixin(Base, HlsMini) {
    get config(): HlsMiniConfig {
      return {
        // Default to audio off for background video,
        // the standalone HLS engine defaults to audio on.
        audio: false,
        ...super.config,
      };
    }

    set config(config) {
      super.config = config;
    }
  };
}

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(EventTarget);
export type MuxBackgroundVideo = InstanceType<typeof MuxBackgroundVideo>;
