import type {
  Constructor,
  IMediaDisplay,
  IMediaEngine,
  IMediaEngineStatic,
} from './types.js';

type Preload = 'none' | 'metadata' | 'auto';

export type MediaRendererConfig = {
  audio?: boolean;
  maxResolution?: string;
  preload?: Preload;
  debug?: boolean;
};

export type MediaRendererEngineConfig = {
  audio?: boolean;
  maxResolution?: string;
  maxBufferLength?: number;
};

export function MediaRendererMixin<
  B extends Constructor<EventTarget>,
  C extends MediaRendererConfig,
>(Base: B, Engine: IMediaEngineStatic<MediaRendererEngineConfig>) {
  return class MediaRendererClass extends Base {
    #display?: IMediaDisplay;
    #engine?: IMediaEngine<MediaRendererEngineConfig>;
    #src = '';
    #config: C = {} as C;
    #loadRequested?: Promise<void> | null;

    get display() {
      return this.#display;
    }

    set display(display: IMediaDisplay | undefined) {
      this.#display = display;
      this.#requestLoad();
    }

    set src(src: string) {
      this.#src = src;
      this.#requestLoad();
    }

    get src() {
      return this.#src;
    }

    get config(): C {
      return this.#config;
    }

    set config(config: C) {
      this.#config = config ?? {};
      this.#requestLoad();
    }

    async #requestLoad() {
      if (this.#loadRequested) return;
      await (this.#loadRequested = Promise.resolve());
      this.#loadRequested = null;
      this.load();
    }

    destroy() {
      this.display?.removeEventListener('play', this.#loadSource);
      this.display?.removeEventListener('play', this.#setMaxBufferLength);
      this.#display = undefined;
      this.#engine = undefined;
      this.#src = '';
      this.#config = {} as C;
      this.#loadRequested = undefined;
    }

    load() {
      if (!this.display) {
        return;
      }

      if (typeof MediaSource === 'undefined') {
        this.display.src = this.src;
        return;
      }

      if (!this.#engine) {
        this.#engine = new Engine();
      }

      this.#engine.attachMedia(this.display);

      const isPaused = this.display.paused;

      if (this.config) {
        this.#engine.config = this.config;

        if (this.config?.preload === 'metadata' && isPaused) {
          this.#engine.config.maxBufferLength = 0;
          this.display.addEventListener('play', this.#setMaxBufferLength, {
            once: true,
          });
        }
      }

      if (this.config?.preload === 'none' && isPaused) {
        this.display.addEventListener('play', this.#loadSource, { once: true });
        return;
      }

      this.#loadSource();
    }

    #loadSource = () => {
      if (this.#engine && this.src) {
        this.#engine.loadSource(this.src);
      }
    };

    #setMaxBufferLength = () => {
      if (this.#engine) {
        this.#engine.config.maxBufferLength =
          Engine.DefaultConfig.maxBufferLength;
      }
    };
  };
}
