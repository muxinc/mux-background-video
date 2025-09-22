import { html, attrs } from '../api-src/tags.js';

export async function GET(req: Request) {
  return new Response(getHtml(req), {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

function getHtml(req: Request) {
  return html`<!DOCTYPE html>
    <html>
      <head>
        <title>Mux Background Video Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html,
          body {
            height: 100%;
          }

          body {
            margin: 0;
            padding: 0;
          }

          mux-background-video,
          img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .content {
            --gradient-steps:
              hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
              hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
              hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
              hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
            background: linear-gradient(to bottom, var(--gradient-steps));
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 15% 10%;
            box-sizing: border-box;
            color: white;
            z-index: 1;
            font-family: 
              /* use the sans-serif font that the operating system 
                classifies as a sans-serif font for native apps */
              ui-sans-serif,
              /* use the font the operating system uses for native
                applications, may be serif, may be sans-serif, may be 
                something else (there are, as you can see, a couple 
                different ways to specify this) */
              system-ui, 
              -system-ui, 
              -apple-system,
              BlinkMacSystemFont,
              /* use one of these specific font families if present */
              Roboto, Helvetica, Arial, 
              /* use a sans-serif family as determined by the browser
                which may or may not be a configurable option for
                the user to override */
              sans-serif, 
              /* use emojis */
              "Apple Color Emoji";
          }

          h1, p {
            max-width: 60%;
          }

          h1 {
            font-size: 3rem;
            font-weight: 700;
            margin: .75rem 0;
          }

          p {
            font-size: 1.5rem;
            font-weight: 400;
            margin: 0;
          }
        </style>
        <script defer src="https://cdn.jsdelivr.net/npm/mux-embed"></script>
        <script type="module" src="./dist/mux-background-video.js"></script>
      </head>
      <body>
        <mux-background-video ${getBackgroundVideoAttributes(req)}>
          <img src="${getImageUrl(req)}" alt="Mux Background Video" />
          <div class="content">
            <h1>Mux Background Video</h1>
            <p>A super lightweight component and HLS engine for creating background videos using Mux HLS streams.</p>
          </div>
        </mux-background-video>
      </body>
    </html>`;
}

function getPlaybackId(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const defaultPlaybackId = 'UYCEiPPan1C4W9qlM2ir3r00o5qm3A6u2xZJ00oqPtDPw';
  return searchParams.get('playbackId') || defaultPlaybackId;
}

function getSourceUrl(req: Request) {
  return `https://stream.mux.com/${getPlaybackId(req)}.m3u8`;
}

function getImageUrl(req: Request) {
  return `https://image.mux.com/${getPlaybackId(req)}/thumbnail.webp?time=0`;
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
