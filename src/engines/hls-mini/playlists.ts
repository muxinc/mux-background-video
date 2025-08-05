type Context = {
  baseURI: string;
};

type RenditionModel = {
  uri?: string;
  mimeType: string;
  codec?: string;
  duration?: number;
  groupId?: string;
}

type SegmentModel = { duration: number; uri?: string };

type MediaPlaylistModel<T extends SegmentModel = SegmentModel> = T[];
type MultivariantPlaylistModel<T extends RenditionModel = RenditionModel> = T[];

type Reducer<T> = (playlist: T, line: string, ctx: Context) => T;
type ReducerTuple<T> = [
  string | RegExp | ((line: string) => boolean),
  Reducer<T>,
];

// Takes an event dispatcher and event type yields
// a promise that resolves to the event dispatched.
type EventDispatcher = Pick<EventTarget, 'addEventListener'>;

const eventToPromise = async (
  eventDispatcher: EventDispatcher,
  type: string
) => {
  return new Promise((resolve) => {
    eventDispatcher.addEventListener(type, resolve, { once: true });
  });
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

type MinimalSourceBuffer = EventDispatcher & Pick<SourceBuffer, 'appendBuffer'>;
type SourceBufferData = Parameters<MinimalSourceBuffer['appendBuffer']>[0];

const appendSegmentAsPromise = async (
  sourceBuffer: MinimalSourceBuffer,
  segmentData: SourceBufferData
) => {
  const promise = eventToPromise(sourceBuffer, 'updateend');
  sourceBuffer.appendBuffer(segmentData);
  return promise;
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

// A data structure that defines how to update a media playlist model
// based on the supported tag lines a media string contains.
// The structure is an array of tuples of:
// 1. a predicate that accepts a line string from a playlist.
//   - If true, the reducer (below) should be used to updated the model.
// 2. a reducer (that also accepts an optional "context") that takes the lineStr
//   plus the current state of the model and yields the updated model.
const MediaPlaylistReducerTuples: ReducerTuple<MediaPlaylistModel>[] = [
  [
    (lineStr: string) => lineStr.startsWith('#EXT-X-MAP'),
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
    (lineStr) => lineStr.startsWith('#EXTINF'),
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
const MultivariantPlaylistReducerTuples: ReducerTuple<MultivariantPlaylistModel>[] = [
  [
    (lineStr) => lineStr.startsWith('#EXT-X-MEDIA'),
    (model, lineStr, { baseURI }) => {
      const { uri: segUri, ...restProps } = propsFromLineStr(lineStr);
      model.push({
        ...restProps,
        uri: uriToAbsoluteURI(segUri, baseURI),
        duration: undefined,
        mimeType: 'audio/mp4',
        codec: undefined,
      });
      return model;
    },
  ],
  [
    (lineStr) => lineStr.startsWith('#EXT-X-STREAM-INF'),
    (model, lineStr) => {
      const { audio, codecs, ...restProps } = propsFromLineStr(lineStr);
      model.push({
        ...restProps,
        mimeType: 'video/mp4',
        codec: codecs
          .split(',')
          .find((codec) => !codec.toLowerCase().startsWith('mp4a')),
      });
      const audioPlaylist = model.find(
        ({ groupId, mimeType }) => mimeType === 'audio/mp4' && groupId === audio
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

// Given a URI for a particular playlist and a data structure that defines how to
// translate it into a JS model (see above), fetch the playlist and yield the JS model
// representation of it.
const getPlaylistFromURI = async <T extends SegmentModel | RenditionModel>(uri: string, PlaylistReducerTuples: ReducerTuple<T>[]) => {
  const baseURI = uriToBaseURI(uri);
  const context = { baseURI };
  return fetch(uri)
    .then((resp) => resp.text())
    .then((playlistStr) =>
      playlistStr.split('\n').reduce((playlist, lineStr) => {
        const [, reducer] =
          PlaylistReducerTuples.find(([pred]) => pred(lineStr)) ?? [];
        if (reducer) return reducer(playlist, lineStr, context);
        return playlist;
      }, [])
    );
};

// Takes a media playlist data model (typically derived from a multivariant playlist)
// and asynchronously yields an updated model with the media playlist data.
const getMediaPlaylistFromMediaPlaylistData = async <T extends SegmentModel>(mediaPlaylistData: T) => {
  const playlist = await getPlaylistFromURI(
    mediaPlaylistData.uri,
    MediaPlaylistReducerTuples
  );
  return { ...mediaPlaylistData, playlist };
};

// Takes a URI for a multivariant playlist and asynchronously yields a model of
// the playlist with the URI
const getMultivariantPlaylistFromMediaPlaylistData = async <T extends RenditionModel>(uri: string) => {
  const playlists = await getPlaylistFromURI(
    uri,
    MultivariantPlaylistReducerTuples
  );
  return { uri, playlists };
};

const getMediaSourceFromMediaPlaylistDataAndElement = async (
  playlists,
  mediaEl
) => {
  if (
    !(
      'MediaSource' in globalThis &&
      playlists.every(({ mimeType, codec }) =>
        MediaSource.isTypeSupported(`${mimeType}; codecs="${codec}"`)
      )
    )
  ) {
    return Promise.reject();
  }

  const mediaSource = new MediaSource();
  mediaEl.src = URL.createObjectURL(mediaSource);
  return eventToPromise(mediaSource, 'sourceopen').then(() => {
    // NOTE: This is a hacky POC version of "selected playlists" for demo purposes only (CJP)
    const selectedMediaPlaylists = playlists.filter(({ mimeType }, i, list) =>
      list
        .slice(0, i)
        .every((prevPlaylist) => prevPlaylist.mimeType !== mimeType)
    );
    selectedMediaPlaylists.forEach(({ mimeType, codec }) =>
      mediaSource.addSourceBuffer(`${mimeType}; codecs="${codec}"`)
    );
    return mediaSource;
  });
};

export const loadMedia = async (uri, mediaEl) => {
  const mediaPlaylistsData =
    await getMultivariantPlaylistFromMediaPlaylistData(uri);
  Promise.all([
    getMediaSourceFromMediaPlaylistDataAndElement(
      mediaPlaylistsData.playlists,
      mediaEl
    ),
    Promise.all(
      mediaPlaylistsData.playlists.map(getMediaPlaylistFromMediaPlaylistData)
    ),
  ]).then(async ([mediaSource, playlists]) => {
    const selectedMediaPlaylists = playlists.filter(({ mimeType }, i, list) =>
      list
        .slice(0, i)
        .every((prevPlaylist) => prevPlaylist.mimeType !== mimeType)
    );
    for (let i = 0; i < selectedMediaPlaylists[0].playlist.length; i++) {
      const segments = selectedMediaPlaylists.map(
        ({ playlist }) => playlist[i]
      );
      const segmentResponses = await Promise.all(
        segments.map(({ uri }) => fetch(uri))
      );
      const segmentDataList = await Promise.all(
        segmentResponses.map((segmentResponse) => segmentResponse.arrayBuffer())
      );
      await Promise.all(
        segmentDataList.map((segmentData, i) => {
          const sourceBuffer = mediaSource.sourceBuffers[i];
          return appendSegmentAsPromise(sourceBuffer, segmentData);
        })
      );
    }
    mediaSource.endOfStream();
    return playlists;
  });
};
