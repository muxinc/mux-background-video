import type { IMediaDisplay, IMediaEngine } from './types.js';
// Use the HlsMini engine by default.
import { HlsMini } from './engines/hls-mini/index.js';

type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
};

export function MediaRendererMixin<T extends Constructor<EventTarget>>(
  Base: T
) {
  return class MediaRendererClass extends Base {
    #display?: IMediaDisplay;
    #engine?: IMediaEngine<Record<string, any>>;
    #src = '';
    #config?: Record<string, any>;
    #loadRequested?: Promise<void> | null;

    get display() {
      return this.#display;
    }

    set display(display: IMediaDisplay | undefined) {
      this.#display = display;
      this.#requestLoad();
    }

    set src(uri: string) {
      this.#src = uri;
      this.#requestLoad();
    }

    get src() {
      return this.#src;
    }

    get config(): Record<string, any> | undefined {
      return this.#config;
    }

    set config(config: Record<string, any>) {
      this.#config = config;
      this.#requestLoad();
    }

    async #requestLoad() {
      if (this.#loadRequested) return;
      await (this.#loadRequested = Promise.resolve());
      this.#loadRequested = null;
      this.load();
    }

    load() {
      if (!this.#engine) {
        this.#engine = new HlsMini() as unknown as IMediaEngine<
          Record<string, any>
        >;
      }
      if (this.display) {
        this.#engine.attachMedia(this.display);
      }
      if (this.config) {
        this.#engine.config = this.config;
      }
      if (this.src) {
        this.#engine.src = this.src;
      }
    }

    play() {
      this.#display?.play();
    }

    pause() {
      this.#display?.pause();
    }
  };
}

export const MediaRenderer = MediaRendererMixin(EventTarget);
