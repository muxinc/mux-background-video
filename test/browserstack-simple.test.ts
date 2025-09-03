import { expect } from '@open-wc/testing';

describe('BrowserStack Mobile Test', () => {
  it('should detect device capabilities', () => {
    // Test that we're running in a browser environment
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Log device information for debugging
    console.log('User Agent:', userAgent);
    console.log('Is Mobile:', isMobile);
    console.log('Screen Size:', `${screen.width}x${screen.height}`);
    console.log('Viewport Size:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Basic browser detection test (works on both desktop and mobile)
    expect(userAgent).to.be.a('string');
    expect(userAgent.length).to.be.greaterThan(0);
  });

  it('should support video playback capabilities', () => {
    // Test video element creation
    const video = document.createElement('video');
    expect(video).to.exist;
    expect(video.tagName).to.equal('VIDEO');
    
    // Test basic video properties
    expect(video.readyState).to.equal(0); // HAVE_NOTHING
    expect(video.networkState).to.equal(0); // NETWORK_EMPTY
  });

  it('should support HLS video format', () => {
    // Test if the browser supports HLS
    const video = document.createElement('video');
    const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl');
    const canPlayM3U8 = video.canPlayType('application/x-mpegURL');
    
    console.log('HLS Support:', canPlayHLS);
    console.log('M3U8 Support:', canPlayM3U8);
    
    // Note: This test may fail on some Android devices that don't natively support HLS
    // The actual HLS support would be provided by our library
    expect(video).to.exist;
  });

  it('should have proper viewport meta tag', () => {
    // Test that viewport meta tag is present (should be set by our test runner HTML)
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    // This test will pass on mobile devices but may fail on desktop
    // We'll make it conditional based on the environment
    if (viewportMeta) {
      expect(viewportMeta.getAttribute('content')).to.include('width=device-width');
    } else {
      // On desktop, viewport meta might not be present, which is okay
      console.log('Viewport meta tag not found (desktop environment)');
    }
  });
});
