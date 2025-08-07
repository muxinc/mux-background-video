import { getMultivariantPlaylist, getMediaPlaylist } from './playlists';
import type { IMediaDisplay } from '../../types';
import type { Rendition } from './types';

// Takes an event dispatcher and event type yields
// a promise that resolves to the event dispatched.
type EventDispatcher = Pick<EventTarget, 'addEventListener'>;
type MinimalSourceBuffer = EventDispatcher & Pick<SourceBuffer, 'appendBuffer'>;
type SourceBufferData = Parameters<MinimalSourceBuffer['appendBuffer']>[0];

type LoadMediaOptions = {
  maxResolution?: string;
};

const MIN_BUFFER_AHEAD = 5;

export const loadMedia = async (
  uri: string,
  mediaEl: IMediaDisplay,
  options: LoadMediaOptions = {}
) => {
  const { playlists } = await getMultivariantPlaylist(uri);
  const selected = selectPlaylists(playlists, options);
  const mediaPlaylists = await Promise.all(selected.map(getMediaPlaylist));
  const mediaSource = await initMediaSource(mediaPlaylists, mediaEl);

  Promise.all(mediaPlaylists.map((playlist, index) => {
    const sourceBuffer = mediaSource.sourceBuffers[index];
    return loadSegments(playlist, sourceBuffer, mediaEl);
  })).then(() => {
    mediaSource.endOfStream();
  });

  console.log(mediaSource);
  console.log(mediaPlaylists);

  return mediaPlaylists;
};

const selectPlaylists = (
  playlists: Rendition[],
  { maxResolution }: LoadMediaOptions = {}
) => {
  const videoRenditions = playlists.filter((playlist) => !playlist.type);

  const selectedVideo = maxResolution
    ? videoRenditions
        .filter(({ height }) => !height || height <= parseInt(maxResolution))
        .sort((a, b) => (b.height || 0) - (a.height || 0))[0]
    : videoRenditions[0];

  const selectedAudio =
    selectedVideo.audio &&
    playlists
      .filter(({ groupId }) => groupId === selectedVideo.audio)
      .find((audio) => audio.default === 'YES');

  return selectedAudio ? [selectedVideo, selectedAudio] : [selectedVideo];
};

const initMediaSource = async (
  mediaPlaylists: Rendition[],
  mediaEl: IMediaDisplay
) => {
  const mediaSource = new MediaSource();
  mediaEl.src = URL.createObjectURL(mediaSource);
  await eventToPromise(mediaSource, 'sourceopen');

  const duration = getMediaDuration(mediaPlaylists);
  if (duration > 0) mediaSource.duration = duration;

  mediaPlaylists.forEach(({ mimeType, codec }) => {
    try {
      const sourceBuffer = mediaSource.addSourceBuffer(
        `${mimeType}; codecs="${codec}"`
      );
      if (duration > 0) {
        // Prevents a segment from being added beyond a certain time.
        sourceBuffer.appendWindowEnd = duration;
      }
    } catch (error) {
      console.error(
        `Failed to add source buffer for ${mimeType} with codec ${codec}`
      );
      throw error;
    }
  });

  return mediaSource;
};

const getMediaDuration = (mediaPlaylists: Rendition[]) => {
  const [{ segments: vids = [] }, { segments: auds = [] }] = mediaPlaylists;

  const videoDuration = vids.reduce((acc, { duration }) => acc + duration, 0);
  const audioDuration = auds.reduce((acc, { duration }) => acc + duration, 0);

  return Math.max(videoDuration, audioDuration);
};

const loadSegments = async (
  playlist: Rendition,
  sourceBuffer: SourceBuffer,
  mediaEl: IMediaDisplay
): Promise<void> => {
  const { segments = [] } = playlist;
  let segmentIndex = 0;
  let isLoading = false;

  const shouldLoadMoreSegments = () => {
    const { currentTime } = mediaEl;
    const { buffered } = sourceBuffer;
    
    if (buffered.length === 0) return true;
    if (segmentIndex >= segments.length) return false;
    
    const bufferEnd = buffered.end(buffered.length - 1);
    const bufferAhead = bufferEnd - currentTime;
    
    return bufferAhead < MIN_BUFFER_AHEAD;
  };

  const loadNextSegments = async () => {
    if (isLoading || segmentIndex >= segments.length) return;
    
    isLoading = true;
    
    try {
      // Load segments until we have sufficient buffer
      while (segmentIndex < segments.length && shouldLoadMoreSegments()) {
        const segment = segments[segmentIndex];
        
        if (sourceBuffer.updating) {
          await eventToPromise(sourceBuffer, 'updateend');
        }
        
        try {
          const segmentData = await fetchSegment(segment.uri!);
          await appendSegmentAsPromise(sourceBuffer, segmentData);
          segmentIndex++;
          
          console.log(`Loaded segment ${segmentIndex}/${segments.length}`);
        } catch (error) {
          console.error(`Failed to load segment ${segmentIndex}:`, error);
          // Continue with next segment instead of stopping completely
          segmentIndex++;
        }
      }
    } finally {
      isLoading = false;
    }
  };

  return new Promise(async (resolve) => {
    await loadNextSegments();

    const checkInterval = setInterval(async () => {
      if (!isLoading && shouldLoadMoreSegments()) {
        await loadNextSegments();
      }
      // Clear interval when all segments are loaded
      if (segmentIndex >= segments.length) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 500);
  });
};

const fetchSegment = async (uri: string) => {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch segment: ${response.status}`);
  }
  return response.arrayBuffer();
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
