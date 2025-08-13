import type { IMediaDisplay, IMediaEngine } from './types.js';
// Use the HlsMini engine by default.
import { HlsMini, HlsMiniConfig } from './engines/hls-mini/index.js';

export class MediaRenderer<T extends Record<string, any> = HlsMiniConfig> extends EventTarget {
  #display: IMediaDisplay;
  #engine: IMediaEngine<T>;

  constructor(display: IMediaDisplay, engine?: IMediaEngine<T>) {
    super();
    this.#display = display;
    this.#engine = engine ?? new HlsMini() as unknown as IMediaEngine<T>;
    this.#engine.attachMedia(this.#display);
  }

  set src(uri: string) {
    this.#engine.src = uri;
  }

  get src() {
    return this.#engine.src;
  }

  get config(): T {
    return this.#engine.config;
  }

  set config(config: T) {
    this.#engine.config = config;
  }

  play() {
    this.#display.play();
  }

  pause() {
    this.#display.pause();
  }
}
