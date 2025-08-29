import { html, attrs, safeJsVar } from '../api-src/tags.js';

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
      <script defer src="https://cdn.jsdelivr.net/npm/mux-embed"></script>
      <script type="module" src="./dist/mux-background-video.js"></script>
    </head>
    <body>
      <mux-background-video
        ${getBackgroundVideoAttributes(req)}
      ></mux-background-video>

      <script type="module">
        const { video } = document.querySelector('mux-background-video');
        video.addEventListener('error', () => {
          console.log(video.error);
        });
        video.addEventListener('loadstart', () => {
          console.log('loadstart', video.currentSrc);
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
    </body>
  </html>`;
}

function getPlaybackId(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const defaultPlaybackId = 'crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg';
  return searchParams.get('playbackId') || defaultPlaybackId;
}

function getSourceUrl(req: Request) {
  return `https://stream.mux.com/${getPlaybackId(req)}.m3u8`;
}

function getBackgroundVideoAttributes(req: Request) {
  const allowedAttributes = [
    'audio',
    'max-resolution',
    'debug',
    'src',
    'preload',
    'controls',
    'nomuted',
    'noloop',
    'noautoplay',
  ];

  const attributes: Record<string, any> = {
    src: getSourceUrl(req),
  };

  return getAttributes(req, allowedAttributes, attributes);
}

function getAttributes(
  req: Request,
  allowedAttributes: string[],
  defaultAttributes: Record<string, any> = {}
) {
  const searchParams = new URL(req.url).searchParams;
  const attributes: Record<string, any> = { ...defaultAttributes };

  for (const attr of allowedAttributes) {
    const value = searchParams.get(attr);
    if (value === '' || value === 'true' || value === '1') {
      attributes[attr] = '';
    } else if (value === 'false' || value === '0') {
      delete attributes[attr];
    } else if (value) {
      attributes[attr] = value;
    }
  }

  return attrs(attributes);
}

function getBooleanParam(req: Request, param: string) {
  const searchParams = new URL(req.url).searchParams;
  const value = searchParams.get(param);
  return value === '' || value === 'true' || value === '1';
}
