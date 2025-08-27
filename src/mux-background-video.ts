import { MediaRenderer } from './media-renderer.js';

type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
};

export function MuxBackgroundVideoMixin<T extends Constructor<any>>(Base: T) {
  return class MuxBackgroundVideoClass extends Base {
    get config(): MediaRenderer['config'] {
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

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(MediaRenderer);
export type MuxBackgroundVideo = InstanceType<typeof MuxBackgroundVideo>;
