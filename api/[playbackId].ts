import { html, attrs, safeJsVar } from '../api-src/tags';

export async function GET(req: Request) {
  return new Response(getHtml(req), {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

function getParams(req: Request) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const defaultPlaybackId = 'crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg';
  return {
    playbackId: safeJsVar(searchParams.get('playbackId')) || defaultPlaybackId,
    maxResolution: safeJsVar(searchParams.get('maxResolution')),
  };
}

function getHtml(req: Request) {
  const { playbackId, maxResolution } = getParams(req);
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

        #video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      </style>
      <script type="module">
        import { MuxBackgroundVideo } from './dist/index.js';
        
        const video = document.querySelector('#video');
        video.addEventListener('error', () => console.log(video.error));

        let renderer = new MuxBackgroundVideo(video);
        renderer.maxResolution = ${maxResolution};
        renderer.src = 'https://stream.mux.com/${playbackId}.m3u8';
      </script>
    </head>
    <body>
      <video id="video" ${getVideoAttributes(req)}></video>
    </body>
  </html>`;
}

function getVideoAttributes(req: Request) {
  const searchParams = new URL(req.url).searchParams;
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
