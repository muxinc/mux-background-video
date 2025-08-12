import { IMediaDisplay, IMediaEngine } from '../../types';
import { HlsMiniState } from './types';
import { loadMedia } from './mediasource';

export class HlsMini implements IMediaEngine {
  #src = '';
  #mediaDisplay: IMediaDisplay | null = null;

  get src() {
    return this.#src;
  }

  set src(src: string) {
    this.#src = src;

    if (this.#mediaDisplay) {
      loadMedia(src, this.#mediaDisplay, {
        // maxResolution: '270p',
      });
    }
  }

  attachMedia(mediaDisplay: IMediaDisplay) {
    this.#mediaDisplay = mediaDisplay;
  }
}
