import { IMediaDisplay, IMediaEngine } from '../../types';
import { HlsMiniState } from './types';
import { loadMedia } from './mediasource';
import { createStore } from './utils';

export class HlsMini implements IMediaEngine {
  #store = createStore<HlsMiniState>({
    src: '',
  });

  constructor() {
    this.#store.listenKeys(
      ['src', 'mediaDisplay'],
      async (_, { src, mediaDisplay }) => {
        if (mediaDisplay && src) {
          const playlists = await loadMedia(src, mediaDisplay, {
            maxResolution: '270p',
          });
          console.log(JSON.stringify(playlists, null, 2));
        }
      }
    );
  }

  get src() {
    return this.#store.get().src;
  }

  set src(src: string) {
    this.#store.put({ src });
  }

  attachMedia(mediaDisplay: IMediaDisplay) {
    this.#store.put({ mediaDisplay });
  }
}
