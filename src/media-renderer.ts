import type { IMediaDisplay, IMediaEngine } from './types';
// Use the HlsMini engine by default.
import { HlsMini } from './engines/hls-mini';

class MediaRenderer extends EventTarget {
  #display: IMediaDisplay;
  #engine: IMediaEngine;

  constructor(display: IMediaDisplay, engine?: IMediaEngine) {
    super();
    this.#display = display;
    this.#engine = engine ?? new HlsMini();
    this.#engine.attachMedia(this.#display);
  }

  set src(uri: string) {
    this.#engine.src = uri;
  }

  get src() {
    return this.#engine.src;
  }

  play() {
    this.#display.play();
  }

  pause() {
    this.#display.pause();
  }
}

export default MediaRenderer;
