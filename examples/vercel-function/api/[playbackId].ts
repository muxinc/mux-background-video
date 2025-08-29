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
      <script defer src="https://cdn.jsdelivr.net/npm/mux-embed"></script>
      <script type="module" src="./dist/mux-background-video.js"></script>
    </head>
    <body>
      <mux-background-video ${getBackgroundVideoAttributes(req)}>
        <video id="video" ${getVideoAttributes(req)}></video>
      </mux-background-video>

      <script type="module">
        if (typeof mux !== 'undefined') {
          const player_init_time =
            performance.timeOrigin ??
            performance.timing?.navigationStart ??
            performance.now();

          mux.monitor('#video', {
            debug: ${getParam(req, 'debug')},
            data: {
              video_id: '${getPlaybackId(req)}',
              video_title: 'Mux Background Video Demo',
              video_stream_type: 'on-demand',
              player_name: 'mux-background-video',
              player_version: '0.0.1',
              player_init_time,
            },
          });
          // Add Mux video source url to state data so env_key can be inferred.
          mux.setStateDataTranslator('#video', (state) => {
            return {
              ...state,
              video_source_url: '${getSourceUrl(req)}',
            };
          });
        }

        const video = document.querySelector('#video');
        video.addEventListener('error', () => {
          console.log(video.error);
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
  return getAttributes(req, ['src', 'audio', 'max-resolution', 'preload'], {
    src: getSourceUrl(req),
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

function getAttributes(
  req: Request,
  allowedAttributes: string[],
  defaultAttributes: Record<string, any> = {}
) {
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

function getParam(req: Request, param: string) {
  const searchParams = new URL(req.url).searchParams;
  return searchParams.get(param) === 'true' || searchParams.get(param) === '1';
}
