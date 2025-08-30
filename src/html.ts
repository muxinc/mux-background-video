import { MuxBackgroundVideoMixin } from './mux-background-video.js';
import { IMediaDisplay } from './types.js';

type Preload = 'none' | 'metadata' | 'auto';

function getTemplateHTML(attrs: Record<string, string>) {
  return /*html*/ `
    <style>
      video {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    </style>
    <video ${serializeAttributes(attrs)}></video>
  `;
}

export class MuxBackgroundVideoElement extends MuxBackgroundVideoMixin(
  HTMLElement
) {
  static shadowRootOptions = { mode: 'open' as ShadowRootMode };
  static getTemplateHTML = getTemplateHTML;

  static get observedAttributes() {
    return ['src', 'audio', 'debug', 'max-resolution', 'preload'];
  }

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow(
        (this.constructor as typeof MuxBackgroundVideoElement).shadowRootOptions
      );

      const attrs = {
        ...namedNodeMapToObject(this.attributes),
        ...(!this.hasAttribute('nomuted') && { muted: '' }),
        ...(!this.hasAttribute('noloop') && { loop: '' }),
        ...(!this.hasAttribute('noautoplay') && { autoplay: '' }),
        playsinline: '',
        disableremoteplayback: '',
        disablepictureinpicture: '',
      };

      this.shadowRoot!.innerHTML = getTemplateHTML(attrs);
    }

    super.display = this.video as IMediaDisplay;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'src') {
      super.src = newValue;
    } else {
      super.config = {
        audio: this.hasAttribute('audio'),
        debug: this.hasAttribute('debug'),
        maxResolution: this.getAttribute('max-resolution') ?? undefined,
        preload: (this.getAttribute('preload') as Preload) ?? undefined,
      };
    }
  }

  get video() {
    return this.shadowRoot?.querySelector('video') as HTMLVideoElement;
  }
}

function namedNodeMapToObject(namedNodeMap: NamedNodeMap) {
  const obj: Record<string, string> = {};
  for (const attr of namedNodeMap) {
    obj[attr.name] = attr.value;
  }
  return obj;
}

const VideoAttributes = [
  'autoplay',
  'controls',
  'controlslist',
  'crossorigin',
  'disablepictureinpicture',
  'disableremoteplayback',
  'loop',
  'muted',
  'playsinline',
  'preload',
] as const;

function serializeAttributes(attrs: Record<string, string>): string {
  let html = '';
  for (const key in attrs) {
    // Skip forwarding non native video attributes.
    if (!VideoAttributes.includes(key as any)) continue;

    const value = attrs[key];
    if (value === '') html += ` ${key}`;
    else html += ` ${key}="${value}"`;
  }
  return html;
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
