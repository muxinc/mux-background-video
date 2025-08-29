import { MediaRendererConfig, MediaRendererMixin } from './media-renderer.js';
import { HlsMini, HlsMiniConfig } from './engines/hls-mini/index.js';
import type { Constructor } from './types.js';

type MuxBackgroundVideoConfig = HlsMiniConfig & MediaRendererConfig;

const defaultConfig: MuxBackgroundVideoConfig = {
  // Default to audio off for background video,
  // the standalone HLS engine defaults to audio on.
  audio: false,
};

export function MuxBackgroundVideoMixin<T extends Constructor<EventTarget>>(
  Base: T
) {
  return class MuxBackgroundVideoClass extends MediaRendererMixin(
    Base,
    HlsMini
  ) {
    get config() {
      // This might look strange but we want to return the same object so
      // it's mutable and the set values should override the default values.
      return Object.assign(super.config, { ...defaultConfig, ...super.config });
    }

    set config(config) {
      super.config = config;
    }
  };
}

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(EventTarget);
export type MuxBackgroundVideo = InstanceType<typeof MuxBackgroundVideo>;
