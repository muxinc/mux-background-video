import { IMediaDisplay, IMediaEngine } from '../../types.js';
import { loadMedia } from './mediasource.js';
import { HlsMiniConfig } from './types.js';
export * from './types.js';

export class HlsMini implements IMediaEngine<HlsMiniConfig> {
  #mediaDisplay: IMediaDisplay | null = null;
  #src = '';
  #config: HlsMiniConfig = {};
  #unloadMedia?: () => void;

  get src() {
    return this.#src;
  }

  set src(src: string) {
    this.#src = src;
    this.load();
  }

  get config() {
    return this.#config;
  }

  set config(config: HlsMiniConfig) {
    this.#config = config;
  }

  attachMedia(mediaDisplay: IMediaDisplay) {
    this.#mediaDisplay = mediaDisplay;
  }

  load() {
    if (this.#mediaDisplay) {
      console.log('load', this.#src, this.config);
      this.#unloadMedia?.();
      this.#unloadMedia = loadMedia(this.src, this.#mediaDisplay, this.config);
    }
  }
}
