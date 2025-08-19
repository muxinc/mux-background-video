import { MediaRenderer } from './media-renderer.js';

type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
};

export function MuxBackgroundVideoMixin<T extends Constructor<any>>(Base: T) {
  return class MuxBackgroundVideoClass extends Base {
    #maxResolution?: string;

    get config(): any {
      return {
        ...super.config,
        muted: this.display?.muted,
      };
    }

    set config(config: any) {
      super.config = config;
    }

    get maxResolution() {
      return this.#maxResolution;
    }

    set maxResolution(resolution: string | undefined) {
      this.#maxResolution = resolution;
      this.config = {
        ...this.config,
        maxResolution: resolution,
      };
    }
  };
}

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(MediaRenderer);
