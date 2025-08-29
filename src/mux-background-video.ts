/// <reference path="../node_modules/mux-embed/dist/types/mux-embed.d.ts"/>
import { MediaRendererConfig, MediaRendererMixin } from './media-renderer.js';
import { HlsMini, HlsMiniConfig } from './engines/hls-mini/index.js';
import type { Constructor } from './types.js';

declare global {
  var mux: typeof import('mux-embed').default;
}

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

    load() {
      const mux = globalThis.mux;
      const display = this.display as HTMLMediaElement;

      if (mux && display && !display.mux && this.src) {
        const player_init_time =
          performance.timeOrigin ??
          performance.timing?.navigationStart;

        mux.monitor(display, {
          debug: this.config.debug,
          data: {
            player_name: 'mux-background-video',
            player_version: '0.0.1',
            player_init_time,
            video_stream_type: 'on-demand',
          },
        });

        // Add Mux video source url to state data so env_key can be inferred.
        display.mux!.setStateDataTranslator((state) => {
          return {
            ...state,
            video_source_url: this.src,
          };
        });
      }

      super.load();
    }
  };
}

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(EventTarget);
export type MuxBackgroundVideo = InstanceType<typeof MuxBackgroundVideo>;
