import { MediaRenderer } from './media-renderer.js';

type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
};

export function MuxBackgroundVideoMixin<T extends Constructor<any>>(Base: T) {
  return class MuxBackgroundVideoClass extends Base {
    #audio = false;
    #maxResolution?: string;

    get config() {
      return {
        audio: this.audio,
        maxResolution: this.maxResolution,
        ...super.config,
      };
    }

    set config(config: any) {
      super.config = config;
    }

    get audio() {
      return this.#audio;
    }

    set audio(audio: boolean) {
      this.#audio = audio;
    }

    get maxResolution() {
      return this.#maxResolution;
    }

    set maxResolution(maxResolution: string | undefined) {
      this.#maxResolution = maxResolution;
    }
  };
}

export const MuxBackgroundVideo = MuxBackgroundVideoMixin(MediaRenderer);
