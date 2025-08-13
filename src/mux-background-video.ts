import type { IMediaDisplay, IMediaEngine } from './types.js';
import { MediaRenderer } from './media-renderer.js';

export class MuxBackgroundVideo<T extends Record<string, any>> extends MediaRenderer<T> {
  #maxResolution?: number;
  #display: IMediaDisplay;

  constructor(display: IMediaDisplay, engine?: IMediaEngine<T>) {
    super(display, engine);
    this.#display = display;
  }

  get config(): T {
    return {
      ...super.config,
      muted: this.#display.muted,
    };
  }

  set config(config: T) {
    super.config = config;
  }

  get maxResolution() {
    return this.#maxResolution;
  }

  set maxResolution(resolution: number | undefined) {
    this.#maxResolution = resolution;
    this.config = {
      ...this.config,
      maxResolution: resolution,
    };
  }
}
