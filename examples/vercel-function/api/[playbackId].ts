import { html, attrs } from '../api-src/tags.js';

export async function GET(req: Request) {
  return new Response(getHtml(req), {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

function getHtml(req: Request) {
  return html` <html>
    <head>
      <title>Mux Background Video Demo</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #000;
        }

        mux-background-video, 
        video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      </style>
    </head>
    <body>
      <script type="module">
        import { MuxBackgroundVideoElement } from './dist/mux-background-video.js';

        const video = document.querySelector('#video');
        video.addEventListener('error', () => {
          console.log(video.error)
        });
        video.addEventListener('loadedmetadata', () => {
          console.log('loadedmetadata', video.duration);
        });
        video.addEventListener('loadeddata', () => {
          console.log('loadeddata');
        });
        video.addEventListener('canplay', () => {
          console.log('canplay');
        });
        video.addEventListener('canplaythrough', () => {
          console.log('canplaythrough');
        });
      </script>
      <mux-background-video ${getBackgroundVideoAttributes(req)}>
        <video id="video" ${getVideoAttributes(req)}></video>
      </mux-background-video>
    </body>
  </html>`;
}

function getBackgroundVideoAttributes(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const defaultPlaybackId = 'crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg';
  const playbackId = searchParams.get('playbackId') || defaultPlaybackId;

  return getAttributes(req, ['src', 'max-resolution'], {
    src: `https://stream.mux.com/${playbackId}.m3u8`,
  });
}

function getVideoAttributes(req: Request) {
  const allowedAttributes = [
    'autopictureinpicture',
    'disablepictureinpicture',
    'disableremoteplayback',
    'autoplay',
    'controls',
    'controlslist',
    'crossorigin',
    'loop',
    'muted',
    'playsinline',
    'poster',
    'preload',
  ];

  const attributes: Record<string, any> = {
    autoplay: '',
    muted: '',
    loop: '',
    playsinline: '',
  };

  return getAttributes(req, allowedAttributes, attributes);
}

function getAttributes(req: Request, allowedAttributes: string[], defaultAttributes: Record<string, any>) {
  const searchParams = new URL(req.url).searchParams;
  const attributes: Record<string, any> = { ...defaultAttributes };

  for (const attr of allowedAttributes) {
    const value = searchParams.get(attr);
    if (value === 'true' || value === '1') {
      attributes[attr] = '';
    } else if (value === 'false' || value === '0') {
      delete attributes[attr];
    } else if (value) {
      attributes[attr] = value;
    }
  }

  return attrs(attributes);
}
