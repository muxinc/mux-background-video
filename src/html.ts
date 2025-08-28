import { MuxBackgroundVideoMixin } from './mux-background-video.js';
import { IMediaDisplay } from './types.js';

type Preload = 'none' | 'metadata' | 'auto';

export class MuxBackgroundVideoElement extends MuxBackgroundVideoMixin(
  HTMLElement
) {
  static get observedAttributes() {
    return ['src', 'audio', 'max-resolution', 'preload'];
  }

  constructor() {
    super();
    super.display = this.querySelector('video') as IMediaDisplay;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'src') {
      super.src = newValue;
    } else {
      super.config = {
        audio: this.audio,
        maxResolution: this.maxResolution,
        preload: this.preload,
      };
    }
  }

  get src() {
    return this.getAttribute('src') ?? '';
  }

  set src(value: string) {
    this.setAttribute('src', value);
  }

  get audio() {
    return this.hasAttribute('audio');
  }

  set audio(value: boolean) {
    this.toggleAttribute('audio', !!value);
  }

  get maxResolution() {
    return this.getAttribute('max-resolution') ?? undefined;
  }

  set maxResolution(value: string | undefined) {
    if (value) {
      this.setAttribute('max-resolution', value);
    } else {
      this.removeAttribute('max-resolution');
    }
  }

  get preload() {
    return this.getAttribute('preload') as Preload | undefined;
  }

  set preload(value: Preload | undefined) {
    if (value) {
      this.setAttribute('preload', value);
    } else {
      this.removeAttribute('preload');
    }
  }
}

if (
  globalThis.customElements &&
  !globalThis.customElements.get('mux-background-video')
) {
  globalThis.customElements.define(
    'mux-background-video',
    MuxBackgroundVideoElement
  );
}
