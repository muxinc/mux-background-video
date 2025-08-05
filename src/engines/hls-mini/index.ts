import { IMediaDisplay, IMediaEngine } from '../../types';
import { HlsMiniState } from './types';
import { loadMedia } from './playlists';
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
          console.log('loading media');
          await loadMedia(src, mediaDisplay);
        }
      }
    );
  }

  get src() {
    return this.#store.get().src;
  }

  set src(src: string) {
    this.#store.put({ src });
    this.load();
  }

  async load() {
    console.log(this.#store.get());
  }

  attachMedia(mediaDisplay: IMediaDisplay) {
    this.#store.put({ mediaDisplay });
  }
}
