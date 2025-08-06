import {
  getMultivariantPlaylistFromMediaPlaylistData,
  getMediaPlaylistFromMediaPlaylistData,
} from './playlists';
import type { IMediaDisplay } from '../../types';
import type { Rendition } from './types';

// Takes an event dispatcher and event type yields
// a promise that resolves to the event dispatched.
type EventDispatcher = Pick<EventTarget, 'addEventListener'>;
type MinimalSourceBuffer = EventDispatcher & Pick<SourceBuffer, 'appendBuffer'>;
type SourceBufferData = Parameters<MinimalSourceBuffer['appendBuffer']>[0];

export const loadMedia = async (
  uri: string,
  mediaEl: IMediaDisplay
): Promise<any> => {
  const mediaPlaylistsData =
    await getMultivariantPlaylistFromMediaPlaylistData(uri);
  console.log(mediaPlaylistsData);
  Promise.all([
    getMediaSourceFromMediaPlaylistDataAndElement(
      mediaPlaylistsData.playlists as Rendition[],
      mediaEl
    ),
    Promise.all(
      (mediaPlaylistsData.playlists as Rendition[]).map(
        getMediaPlaylistFromMediaPlaylistData
      )
    ),
  ]).then(async ([mediaSource, playlists]) => {
    const selectedMediaPlaylists = playlists.filter(
      ({ mimeType }: any, i: number, list: any[]) =>
        list
          .slice(0, i)
          .every((prevPlaylist: any) => prevPlaylist.mimeType !== mimeType)
    );
    for (
      let i = 0;
      i < (selectedMediaPlaylists[0] as any).playlist.length;
      i++
    ) {
      const segments = selectedMediaPlaylists.map(
        ({ playlist }: any) => playlist[i]
      );
      const segmentResponses = await Promise.all(
        segments.map(({ uri }: any) => fetch(uri))
      );
      const segmentDataList = await Promise.all(
        segmentResponses.map((segmentResponse: Response) =>
          segmentResponse.arrayBuffer()
        )
      );
      await Promise.all(
        segmentDataList.map((segmentData: ArrayBuffer, i: number) => {
          const sourceBuffer = mediaSource.sourceBuffers[i];
          return appendSegmentAsPromise(sourceBuffer, segmentData);
        })
      );
    }
    mediaSource.endOfStream();
    return playlists;
  });
};

const getMediaSourceFromMediaPlaylistDataAndElement = async (
  playlists: Rendition[],
  mediaEl: IMediaDisplay
): Promise<MediaSource> => {
  if (
    !(
      'MediaSource' in globalThis &&
      playlists.every(({ mimeType, codec }: Rendition) =>
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
    const selectedMediaPlaylists = playlists.filter(
      ({ mimeType }: Rendition, i: number, list: Rendition[]) =>
        list
          .slice(0, i)
          .every(
            (prevPlaylist: Rendition) => prevPlaylist.mimeType !== mimeType
          )
    );
    console.log(selectedMediaPlaylists);
    selectedMediaPlaylists.forEach(({ mimeType, codec }: Rendition) =>
      mediaSource.addSourceBuffer(`${mimeType}; codecs="${codec}"`)
    );
    return mediaSource;
  });
};

const appendSegmentAsPromise = async (
  sourceBuffer: MinimalSourceBuffer,
  segmentData: SourceBufferData
) => {
  const promise = eventToPromise(sourceBuffer, 'updateend');
  sourceBuffer.appendBuffer(segmentData);
  return promise;
};

export const eventToPromise = async (
  eventDispatcher: EventDispatcher,
  type: string
) => {
  return new Promise((resolve) => {
    eventDispatcher.addEventListener(type, resolve, { once: true });
  });
};
