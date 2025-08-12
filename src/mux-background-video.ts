import type { IMediaDisplay, IMediaEngine } from './types';
import { MediaRenderer } from './media-renderer';

export class MuxBackgroundVideo<T extends Record<string, any>> extends MediaRenderer<T> {
  #maxResolution?: number;

  constructor(display: IMediaDisplay, engine?: IMediaEngine<T>) {
    super(display, engine);
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
