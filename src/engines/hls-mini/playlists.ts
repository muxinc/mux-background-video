import { Segment, Rendition } from './types.js';

type MediaPlaylistModel<T extends Segment = Segment> = T[];
type MultivariantPlaylistModel<T extends Rendition = Rendition> = T[];
type Context = { baseURI: string };
type Reducer<T> = (playlist: T, line: string, ctx: Context) => T;
type ReducerTuple<T> = [
  string | RegExp | ((line: string) => boolean),
  Reducer<T>,
];

// A data structure that defines how to update a media playlist model
// based on the supported tag lines a media string contains.
// The structure is an array of tuples of:
// 1. a predicate that accepts a line string from a playlist.
//   - If true, the reducer (below) should be used to updated the model.
// 2. a reducer (that also accepts an optional "context") that takes the lineStr
//   plus the current state of the model and yields the updated model.
const MediaPlaylistReducerTuples: ReducerTuple<MediaPlaylistModel>[] = [
  [
    '#EXT-X-MAP',
    (model, lineStr, { baseURI }) => {
      const { uri: segUri, ...restProps } = propsFromLineStr(lineStr);
      model.push({
        ...restProps,
        uri: uriToAbsoluteURI(segUri as string, baseURI),
        duration: 0,
      });
      return model;
    },
  ],
  [
    '#EXTINF',
    (model, lineStr) => {
      model.push({
        uri: undefined,
        duration: +lineStr.split(':')[1].split(',')[0].trim(),
      });
      return model;
    },
  ],
  [
    (lineStr) => !!lineStr.trim() && !lineStr.startsWith('#'),
    (model, lineStr, { baseURI }) => {
      model[model.length - 1].uri = uriToAbsoluteURI(lineStr, baseURI);
      return model;
    },
  ],
];

// Same as above, only for multivariant playlists
const MultivariantPlaylistReducerTuples: ReducerTuple<MultivariantPlaylistModel>[] =
  [
    [
      '#EXT-X-MEDIA',
      (model, lineStr, { baseURI }) => {
        const { uri: segUri, ...restProps } = propsFromLineStr(lineStr);
        if (!segUri) return model;
        model.push({
          ...restProps,
          uri: uriToAbsoluteURI(segUri, baseURI),
          mimeType: 'audio/mp4',
          codec: undefined,
        });
        return model;
      },
    ],
    [
      '#EXT-X-STREAM-INF',
      (model, lineStr) => {
        const { audio, codecs, resolution, ...restProps } =
          propsFromLineStr(lineStr);
        model.push({
          ...restProps,
          audio,
          mimeType: 'video/mp4',
          codecs,
          codec: codecs
            .split(',')
            .find((codec) => !codec.toLowerCase().startsWith('mp4a')),
          width: +resolution.split('x')[0],
          height: +resolution.split('x')[1],
        });
        const audioPlaylist = model.find(
          ({ groupId, mimeType }) =>
            mimeType === 'audio/mp4' && groupId === audio
        );
        if (audioPlaylist) {
          audioPlaylist.codec = codecs
            .split(',')
            .find((codec) => codec.toLowerCase().startsWith('mp4a'));
        }
        return model;
      },
    ],
    [
      (lineStr) => !!lineStr.trim() && !lineStr.startsWith('#'),
      (model, lineStr, { baseURI }) => {
        model[model.length - 1].uri = uriToAbsoluteURI(lineStr, baseURI);
        return model;
      },
    ],
  ];

// Takes a URI for a multivariant playlist and asynchronously yields a model of
// the playlist with the URI
export const getMultivariantPlaylist = async (uri: string, signal: AbortSignal) => {
  const renditions = await getPlaylistFromURI(
    uri,
    MultivariantPlaylistReducerTuples,
    signal
  );
  return { uri, renditions };
};

// Takes a media playlist data model (typically derived from a multivariant playlist)
// and asynchronously yields an updated model with the media playlist data.
export const getMediaPlaylist = async <T extends Rendition>(
  mediaPlaylistData: T,
  signal: AbortSignal
) => {
  if (!mediaPlaylistData.uri) {
    throw new Error('Media playlist data must have a URI');
  }
  const segments = addSegmentStartAndEndTimes(
    await getPlaylistFromURI(mediaPlaylistData.uri, MediaPlaylistReducerTuples, signal)
  );
  return { ...mediaPlaylistData, segments };
};

const addSegmentStartAndEndTimes = (segments: Segment[]) => {
  let currentStart = 0;
  return segments.map((segment) => {
    const start = currentStart;
    const end = start + (segment.duration || 0);
    currentStart = end;
    return { ...segment, start, end };
  });
};

// Given a URI for a particular playlist and a data structure that defines how to
// translate it into a JS model (see above), fetch the playlist and yield the JS model
// representation of it.
const getPlaylistFromURI = async <T>(
  uri: string,
  PlaylistReducerTuples: ReducerTuple<T>[],
  signal: AbortSignal
): Promise<T> => {
  const baseURI = uriToBaseURI(uri);
  const context = { baseURI };
  return fetch(uri, { signal })
    .then((resp) => resp.text())
    .then((playlistStr) =>
      reducedParse(playlistStr, PlaylistReducerTuples, context)
    );
};

const reducedParse = <T>(
  playlistStr: string,
  reducerTuples: ReducerTuple<T>[],
  ctx: Context
): T => {
  return playlistStr.split('\n').reduce((playlist, line) => {
    const [, reducer] =
      reducerTuples.find(([pred]) => {
        if (typeof pred === 'string') return line.startsWith(pred);
        if (typeof pred === 'function') return pred(line);
        if (pred instanceof RegExp) return pred.test(line);
        return false;
      }) ?? [];
    if (reducer) return reducer(playlist, line, ctx);
    return playlist;
  }, [] as T);
};

// Takes a potentially relative URI + a base URI and yields an absolute URI.
// Used for relative URIs in playlists.
const uriToAbsoluteURI = (uri: string, baseURI: string = '') => {
  const trimmedURI = uri.trim();
  if (trimmedURI.startsWith('http')) return trimmedURI;
  return `${baseURI}/${trimmedURI}`;
};

// Takes a URI and yields its base URI.
// Used to get the base URI of a playlist for relative URIs in it.
const uriToBaseURI = (uriStr: string) => {
  const uri = new URL(uriStr);
  uri.pathname = uri.pathname.endsWith('/')
    ? uri.pathname
    : uri.pathname.split('/').slice(0, -1).join('/');
  uri.search = '';
  return uri.href;
};

const propsFromLineStr = (lineStr: string) => {
  return Object.fromEntries(
    [...lineStr.matchAll(/([A-Z0-9-]+)=(?:"([^"]+)"|([^,]+))/g)].map((m) => [
      toCamelCase(m[1]),
      m[2] || m[3],
    ])
  );
};

const toCamelCase = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[-_]([a-z])/g, (_$0, $1) => $1.toUpperCase());
};
