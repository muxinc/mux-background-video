import { html, safeJsVar } from '../api-src/tags';

export async function GET(req: Request) {
  return new Response(getHtml(getParams(req)), {
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

function getHtml(params: Record<string, string | null | undefined>) {
  const { playbackId, maxResolution } = params;
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
        let renderer = new MuxBackgroundVideo(video);
        renderer.maxResolution = ${maxResolution};
        renderer.src = 'https://stream.mux.com/${playbackId}.m3u8';
      </script>
    </head>
    <body>
      <video id="video" autoplay muted loop playsinline></video>
    </body>
  </html>`;
}
