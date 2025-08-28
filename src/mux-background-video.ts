import { MediaRendererConfig, MediaRendererMixin } from './media-renderer.js';
import { HlsMini, HlsMiniConfig } from './engines/hls-mini/index.js';
import type { Constructor } from './types.js';

type MuxBackgroundVideoConfig = HlsMiniConfig & MediaRendererConfig;

const defaultConfig: MuxBackgroundVideoConfig = {
  // Default to audio off for background video,
  // the standalone HLS engine defaults to audio on.
  audio: false,
};

export function MuxBackgroundVideoMixin<T extends Constructor<EventTarget>>(Base: T) {
  return class MuxBackgroundVideoClass extends MediaRendererMixin(Base, HlsMini) {

    get config() {
      return super.config as MuxBackgroundVideoConfig;
    }

    set config(config) {
      super.config = {
        ...defaultConfig,
        ...config,
      };
    }
  };
}

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(EventTarget);
export type MuxBackgroundVideo = InstanceType<typeof MuxBackgroundVideo>;
