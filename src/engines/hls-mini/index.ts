import { IMediaDisplay, IMediaEngine } from '../../types';
import { loadMedia } from './mediasource';
import { HlsMiniConfig } from './types';
export * from './types';

export class HlsMini implements IMediaEngine<HlsMiniConfig> {
  #mediaDisplay: IMediaDisplay | null = null;
  #src = '';
  #config: HlsMiniConfig = {};

  get src() {
    return this.#src;
  }

  set src(src: string) {
    this.#src = src;
    this.update();
  }

  get config() {
    return this.#config;
  }

  set config(config: HlsMiniConfig) {
    this.#config = config;
    this.update();
  }

  attachMedia(mediaDisplay: IMediaDisplay) {
    this.#mediaDisplay = mediaDisplay;
  }

  update() {
    if (this.#mediaDisplay) {
      console.log('update', this.#src, this.#config);
      loadMedia(this.#src, this.#mediaDisplay, this.#config);
    }
  }
}
