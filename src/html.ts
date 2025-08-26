import { MediaRendererMixin } from './media-renderer.js';
import { MuxBackgroundVideoMixin } from './mux-background-video.js';
import { IMediaDisplay } from './types.js';

export class MuxBackgroundVideoElement extends MuxBackgroundVideoMixin(
  MediaRendererMixin(HTMLElement)
) {
  static get observedAttributes() {
    return ['src', 'max-resolution', 'audio'];
  }

  constructor() {
    super();
    super.display = this.querySelector('video') as IMediaDisplay;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'src') {
      super.src = newValue;
    } else if (name === 'audio') {
      super.audio = !!newValue;
    } else if (name === 'max-resolution') {
      super.maxResolution = newValue;
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
