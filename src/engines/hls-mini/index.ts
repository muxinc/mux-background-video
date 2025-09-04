import { IMediaDisplay, IMediaEngine } from '../../types.js';
import { MIN_BUFFER_AHEAD, loadMedia } from './mediasource.js';
import { HlsMiniConfig } from './types.js';
export * from './types.js';

const defaultConfig: HlsMiniConfig = {
  // Maximum buffer length in seconds. If buffer length is/becomes less than this value, a new fragment will be loaded.
  maxBufferLength: MIN_BUFFER_AHEAD,
  // Whether to load audio tracks.
  audio: true,
};

export class HlsMini implements IMediaEngine<HlsMiniConfig> {
  static DefaultConfig = defaultConfig;

  #mediaDisplay: IMediaDisplay | null = null;
  #src: string | null = null;
  #config: HlsMiniConfig = { ...HlsMini.DefaultConfig };
  #unloadMedia?: () => void;

  get config() {
    return this.#config;
  }

  set config(config: HlsMiniConfig) {
    this.#config = { ...HlsMini.DefaultConfig, ...config };
  }

  attachMedia(mediaDisplay: IMediaDisplay) {
    this.#mediaDisplay = mediaDisplay;
  }

  loadSource(src: string) {
    this.#src = src;

    if (this.#mediaDisplay) {
      if (this.#config.debug) {
        console.info('load', this.#src, this.config);
      }

      this.#unloadMedia?.();
      this.#unloadMedia = loadMedia(this.#src, this.#mediaDisplay, this.config);
    }
  }
}
