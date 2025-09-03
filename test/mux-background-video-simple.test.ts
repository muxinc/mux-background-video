import { assert, fixture, html } from '@open-wc/testing';
import { MuxBackgroundVideoElement } from '../src/html.js';

describe('MuxBackgroundVideoElement - Simple Tests', () => {
  let element: MuxBackgroundVideoElement;

  afterEach(() => {
    if (element) {
      element.remove();
    }
  });

  describe('Element Registration', () => {
    it('should be registered as a custom element', () => {
      assert.isTrue(customElements.get('mux-background-video') === MuxBackgroundVideoElement);
    });

    it('should extend HTMLElement', () => {
      assert.isTrue(MuxBackgroundVideoElement.prototype instanceof HTMLElement);
    });
  });

  describe('Basic Playback', () => {
    it('should autoplay looping muted video', async function() {
      this.timeout(10000);

      element = await fixture(html`<mux-background-video src="https://stream.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg.m3u8"></mux-background-video>`);
      assert.isTrue(element.video.autoplay, 'Video should be autoplaying');
      assert.isTrue(element.video.loop, 'Video should be looping');
      assert.isTrue(element.video.muted, 'Video should be muted');

      await new Promise(resolve => element.video.addEventListener('playing', resolve));
      assert.isFalse(element.video.paused, 'Video should not be paused');
    });
  });

  describe('Basic Rendering', () => {
    it('should create a shadow root with video element', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      assert.isNotNull(element.shadowRoot);
      assert.isNotNull(element.shadowRoot!.querySelector('video'));
    });

    it('should have default video attributes', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      const video = element.video;
      
      assert.isTrue(video.muted);
      assert.isTrue(video.loop);
      assert.isTrue(video.autoplay);
      assert.isTrue(video.playsInline);
      assert.isTrue(video.disablePictureInPicture);
      assert.isTrue(video.disableRemotePlayback);
    });
  });

  describe('src attribute', () => {
    it('should set src on element', async () => {
      const testSrc = 'https://example.com/video.m3u8';
      element = await fixture(html`<mux-background-video src="${testSrc}"></mux-background-video>`);
      
      assert.equal(element.src, testSrc);
    });

    it('should update src when attribute changes', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      const newSrc = 'https://example.com/new-video.m3u8';
      
      element.setAttribute('src', newSrc);
      
      assert.equal(element.src, newSrc);
    });
  });

  describe('audio attribute', () => {
    it('should enable audio when audio attribute is present', async () => {
      element = await fixture(html`<mux-background-video audio></mux-background-video>`);
      
      // The audio should be enabled in the config
      assert.isTrue(element.config.audio);
    });

    it('should disable audio by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      assert.isFalse(element.config.audio);
    });

    it('should update audio config when attribute changes', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      element.setAttribute('audio', '');
      assert.isTrue(element.config.audio);
      
      element.removeAttribute('audio');
      assert.isFalse(element.config.audio);
    });
  });

  describe('debug attribute', () => {
    it('should enable debug when debug attribute is present', async () => {
      element = await fixture(html`<mux-background-video debug></mux-background-video>`);
      
      assert.isTrue(element.config.debug);
    });

    it('should be undefined by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      assert.isUndefined(element.config.debug);
    });

    it('should update debug config when attribute changes', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      element.setAttribute('debug', '');
      assert.isTrue(element.config.debug);
      
      element.removeAttribute('debug');
      assert.isFalse(element.config.debug);
    });
  });

  describe('max-resolution attribute', () => {
    it('should set max resolution when attribute is present', async () => {
      element = await fixture(html`<mux-background-video max-resolution="720p"></mux-background-video>`);
      
      assert.equal(element.config.maxResolution, '720p');
    });

    it('should be undefined by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      assert.isUndefined(element.config.maxResolution);
    });

    it('should update max resolution when attribute changes', async () => {
      element = await fixture(html`<mux-background-video max-resolution="480p"></mux-background-video>`);
      
      element.setAttribute('max-resolution', '1080p');
      assert.equal(element.config.maxResolution, '1080p');
    });
  });

  describe('preload attribute', () => {
    it('should set preload when attribute is present', async () => {
      element = await fixture(html`<mux-background-video preload="metadata"></mux-background-video>`);
      
      assert.equal(element.config.preload, 'metadata');
    });

    it('should be undefined by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      assert.isUndefined(element.config.preload);
    });

    it('should accept valid preload values', async () => {
      const validValues = ['none', 'metadata', 'auto'] as const;
      
      for (const value of validValues) {
        element = await fixture(html`<mux-background-video preload="${value}"></mux-background-video>`);
        assert.equal(element.config.preload, value);
      }
    });

    it('should update preload when attribute changes', async () => {
      element = await fixture(html`<mux-background-video preload="none"></mux-background-video>`);
      
      element.setAttribute('preload', 'auto');
      assert.equal(element.config.preload, 'auto');
    });
  });

  describe('nomuted attribute', () => {
    it('should disable muted when nomuted attribute is present', async () => {
      element = await fixture(html`<mux-background-video nomuted></mux-background-video>`);
      const video = element.video;
      
      assert.isFalse(video.muted);
    });

    it('should enable muted by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      const video = element.video;
      
      assert.isTrue(video.muted);
    });
  });

  describe('noloop attribute', () => {
    it('should disable loop when noloop attribute is present', async () => {
      element = await fixture(html`<mux-background-video noloop></mux-background-video>`);
      const video = element.video;
      
      assert.isFalse(video.loop);
    });

    it('should enable loop by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      const video = element.video;
      
      assert.isTrue(video.loop);
    });
  });

  describe('noautoplay attribute', () => {
    it('should disable autoplay when noautoplay attribute is present', async () => {
      element = await fixture(html`<mux-background-video noautoplay></mux-background-video>`);
      const video = element.video;
      
      assert.isFalse(video.autoplay);
    });

    it('should enable autoplay by default', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      const video = element.video;
      
      assert.isTrue(video.autoplay);
    });
  });

  describe('Combined attributes', () => {
    it('should handle multiple attributes together', async () => {
      element = await fixture(html`
        <mux-background-video 
          src="https://example.com/video.m3u8"
          audio 
          debug 
          max-resolution="720p"
          preload="metadata"
          nomuted
          noloop
          noautoplay
        ></mux-background-video>
      `);
      
      const video = element.video;
      
      // Check element src
      assert.equal(element.src, 'https://example.com/video.m3u8');
      
      // Check video attributes
      assert.isFalse(video.muted);
      assert.isFalse(video.loop);
      assert.isFalse(video.autoplay);
      assert.isTrue(video.playsInline);
      assert.isTrue(video.disablePictureInPicture);
      assert.isTrue(video.disableRemotePlayback);
      
      // Check config
      assert.isTrue(element.config.audio);
      assert.isTrue(element.config.debug);
      assert.equal(element.config.maxResolution, '720p');
      assert.equal(element.config.preload, 'metadata');
    });

    it('should handle all default attributes', async () => {
      element = await fixture(html`<mux-background-video src="https://example.com/video.m3u8"></mux-background-video>`);
      
      const video = element.video;
      
      // Check element src
      assert.equal(element.src, 'https://example.com/video.m3u8');
      
      // Check default video attributes
      assert.isTrue(video.muted);
      assert.isTrue(video.loop);
      assert.isTrue(video.autoplay);
      assert.isTrue(video.playsInline);
      assert.isTrue(video.disablePictureInPicture);
      assert.isTrue(video.disableRemotePlayback);
      
      // Check default config
      assert.isFalse(element.config.audio);
      assert.isUndefined(element.config.debug);
      assert.isUndefined(element.config.maxResolution);
      assert.isUndefined(element.config.preload);
    });
  });

  describe('Video element access', () => {
    it('should provide access to the video element', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      assert.isNotNull(element.video);
      assert.isTrue(element.video instanceof HTMLVideoElement);
    });

    it('should return null if shadow root is not available', async () => {
      element = await fixture(html`<mux-background-video></mux-background-video>`);
      
      // Manually remove shadow root
      element.shadowRoot!.innerHTML = '';
      
      assert.isNull(element.video);
    });
  });

  describe('Template generation', () => {
    it('should generate correct HTML template', async () => {
      const attrs = {
        src: 'https://example.com/video.m3u8',
        muted: '',
        loop: '',
        autoplay: '',
        playsinline: '',
        disableremoteplayback: '',
        disablepictureinpicture: '',
      };
      
      const template = MuxBackgroundVideoElement.getTemplateHTML(attrs);
      
      assert.include(template, '<video');
      assert.include(template, 'muted');
      assert.include(template, 'loop');
      assert.include(template, 'autoplay');
      assert.include(template, 'playsinline');
      assert.include(template, 'disableremoteplayback');
      assert.include(template, 'disablepictureinpicture');
      assert.include(template, 'object-fit: cover');
    });

    it('should serialize attributes correctly', async () => {
      const attrs = {
        muted: '',
        loop: '',
        autoplay: '',
        preload: 'metadata',
        controls: 'true',
        src: 'https://example.com/video.m3u8', // Should be ignored as it's not a video attribute
      };
      
      const template = MuxBackgroundVideoElement.getTemplateHTML(attrs);
      
      assert.include(template, ' muted');
      assert.include(template, ' loop');
      assert.include(template, ' autoplay');
      assert.include(template, ' preload="metadata"');
      assert.include(template, ' controls="true"');
      assert.notInclude(template, 'src='); // src should not be in video attributes
    });
  });

  describe('Observed attributes', () => {
    it('should observe the correct attributes', () => {
      const observedAttributes = MuxBackgroundVideoElement.observedAttributes;
      
      assert.include(observedAttributes, 'src');
      assert.include(observedAttributes, 'audio');
      assert.include(observedAttributes, 'debug');
      assert.include(observedAttributes, 'max-resolution');
      assert.include(observedAttributes, 'preload');
    });
  });

  describe('Shadow root configuration', () => {
    it('should have open shadow root mode', () => {
      assert.equal(MuxBackgroundVideoElement.shadowRootOptions.mode, 'open');
    });
  });
});
