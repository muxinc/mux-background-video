import type { Constructor, IMediaDisplay, IMediaEngine } from './types.js';

export function MediaRendererMixin<B extends Constructor<EventTarget>, C>(
  Base: B,
  Engine: new () => IMediaEngine<C>
) {
  return class MediaRendererClass extends Base {
    #display?: IMediaDisplay;
    #engine?: IMediaEngine<C>;
    #src = '';
    #config?: C;
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

    get config(): C | undefined {
      return this.#config;
    }

    set config(config: C) {
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
        this.#engine = new Engine() as IMediaEngine<C>;
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
  };
}
