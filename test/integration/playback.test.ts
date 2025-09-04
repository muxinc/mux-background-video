import {
  assert,
  fixture,
  html,
  oneEvent,
  aTimeout,
  waitUntil,
} from '@open-wc/testing';
import { MuxBackgroundVideoElement } from '../../src/html.js';

if (!globalThis.customElements.get('mux-background-video')) {
  globalThis.customElements.define(
    'mux-background-video',
    MuxBackgroundVideoElement
  );
}

describe('Playback', () => {
  let element: MuxBackgroundVideoElement;

  afterEach(() => {
    if (element) {
      element.remove();
    }
  });

  it('should autoplay looping muted video', async function () {
    this.timeout(15000);

    element = await fixture(
      html`<mux-background-video
        style="display: block; width: 100vw; height: 100vh;"
        max-resolution="270p"
        src="https://stream.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg.m3u8"
      ></mux-background-video>`
    );
    assert.isTrue(element.video.autoplay, 'Video should be autoplaying');
    assert.isTrue(element.video.loop, 'Video should be looping');
    assert.isTrue(element.video.muted, 'Video should be muted');

    await oneEvent(element.video, 'playing');
    assert.isFalse(element.video.paused, 'Video should not be paused');
  });

  it('should set duration when src is set', async function () {
    this.timeout(15000);

    element = await fixture(
      html`<mux-background-video
        style="display: block; width: 100vw; height: 100vh;"
        max-resolution="270p"
        src="https://stream.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg.m3u8"
      ></mux-background-video>`
    );
    await oneEvent(element.video, 'durationchange');
    await aTimeout(100);

    assert.isNumber(element.video.duration, 'Video duration should be set');
    assert.isAbove(
      element.video.duration,
      0,
      'Video duration should be greater than 0'
    );
  });

  it('should have at least 15s of buffer loaded after some time by default', async function () {
    this.timeout(15000);

    element = await fixture(
      html`<mux-background-video
        style="display: block; width: 100vw; height: 100vh;"
        max-resolution="270p"
        src="https://stream.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg.m3u8"
      ></mux-background-video>`
    );

    let totalBuffered = 0;
    // Wait until at least 15 seconds of content is buffered
    await waitUntil(
      () => {
        const buffered = element.video.buffered;
        totalBuffered = 0;

        for (let i = 0; i < buffered.length; i++) {
          totalBuffered += buffered.end(i) - buffered.start(i);
        }

        return totalBuffered >= 15;
      },
      'At least 15 seconds should be buffered',
      {
        timeout: 15000,
      }
    );

    assert.isAbove(totalBuffered, 15, 'At least 15 seconds should be buffered');
  });

  it('should have current time pass 6s after some time', async function () {
    this.timeout(15000);

    element = await fixture(
      html`<mux-background-video
        style="display: block; width: 100vw; height: 100vh;"
        max-resolution="270p"
        src="https://stream.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg.m3u8"
      ></mux-background-video>`
    );
    await oneEvent(element.video, 'playing');

    element.video.currentTime = 4.8;

    // Wait until current time passes 6 seconds. A Mux segment is 5s long.
    await waitUntil(
      () => {
        return element.video.currentTime >= 6;
      },
      'Current time should pass 6 seconds',
      {
        timeout: 15000,
      }
    );

    assert.isAbove(
      element.video.currentTime,
      6,
      'Current time should be greater than 6 seconds'
    );
  });
});
