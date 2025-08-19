import { getMultivariantPlaylist, getMediaPlaylist } from './playlists.js';
import type { IMediaDisplay } from '../../types.js';
import type { Rendition, Segment } from './types.js';
import { ChunkedStreamIterable } from './chunked-stream-iterable.js';

type SourceBufferData = Parameters<SourceBuffer['appendBuffer']>[0];

type LoadMediaOptions = {
  maxResolution?: string;
  muted?: boolean;
};

export const MIN_BUFFER_AHEAD = 5; // seconds: minimum buffer ahead to keep
export const BACK_BUFFER_TARGET = 10; // seconds of back buffer to keep when evicting
export const GAP_TOLERANCE = 0.25; // seconds: treat tiny gaps between ranges as contiguous

export const loadMedia = (
  uri: string,
  mediaEl: IMediaDisplay,
  options: LoadMediaOptions = {}
) => {
  if (!uri) return;

  const abortController = new AbortController();
  const signal = abortController.signal;

  const unload = () => {
    if (mediaEl.src) {
      mediaEl.src = '';
      mediaEl.load();
    }
    abortController.abort('unload');
  };

  getMultivariantPlaylist(uri, signal).then(async ({ renditions }) => {
    const selected = selectRenditions(renditions, options);
    const mediaPlaylists = await Promise.all(
      selected.map((playlist) => getMediaPlaylist(playlist, signal))
    );

    if (signal.aborted) return;

    const mediaSource = await initMediaSource(mediaPlaylists, mediaEl);
    initLoadSegments(mediaPlaylists, mediaSource, mediaEl, signal);
  }).catch((error) => {
    if (error === 'unload') return;
    throw error;
  });

  return unload;
};

const selectRenditions = (
  renditions: Rendition[],
  { maxResolution, muted }: LoadMediaOptions = {}
) => {
  const videoRenditions = renditions.filter((rendition) => !rendition.type);

  const selectedVideo = maxResolution
    ? videoRenditions
        .filter(({ height }) => !height || height <= parseInt(maxResolution))
        .sort((a, b) => (b.height || 0) - (a.height || 0))[0]
    : videoRenditions[0];

  const selectedAudio =
    selectedVideo.audio &&
    renditions
      .filter(({ groupId }) => groupId === selectedVideo.audio)
      .find((audio) => audio.default === 'YES');

  return selectedAudio && !muted
    ? [selectedVideo, selectedAudio]
    : [selectedVideo];
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

const getMediaDuration = (playlists: Rendition[]) => {
  const [{ segments: vids = [] }, { segments: auds = [] } = {}] = playlists;
  const videoDuration = vids.reduce((acc, { duration }) => acc + duration, 0);
  const audioDuration = auds.reduce((acc, { duration }) => acc + duration, 0);
  return Math.max(videoDuration, audioDuration);
};

const initLoadSegments = (
  mediaPlaylists: Rendition[],
  mediaSource: MediaSource,
  mediaEl: IMediaDisplay,
  signal: AbortSignal
) => {
  let isLoading = false;
  let checkInterval: NodeJS.Timeout;

  const loadNextSegments = async () => {
    if (signal.aborted) {
      mediaEl.removeEventListener('timeupdate', loadNextSegments);
      clearInterval(checkInterval);
      return;
    }

    if (isLoading) return;
    isLoading = true;

    try {
      await Promise.all(
        mediaPlaylists.map(async (playlist, index) => {
          const sourceBuffer = mediaSource.sourceBuffers[index];
          const segments = playlist.segments;

          const segmentsToLoad = getSegmentsToLoad(
            segments,
            sourceBuffer.buffered,
            mediaEl.currentTime
          );

          for (const segment of segmentsToLoad) {
            const segUrl = new URL(segment.uri!);
            try {
              console.log(
                `${index ? 'audio' : 'video'}`,
                `${segment.start} -> ${segment.end}`,
                segUrl.hostname,
                segUrl.pathname
              );

              const segmentChunks = await fetchSegmentChunks(segment.uri!);
              for await (const chunk of segmentChunks) {
                try {
                  // The buffer eviction algorithm auto runs when appending a segment.
                  await appendSegment(mediaSource, sourceBuffer, chunk);
                } catch (error: any) {
                  // If it was unable to evict enough data to accommodate the append
                  // or the append is too big, we need to manually evict the buffer.
                  // https://w3c.github.io/media-source/#sourcebuffer-coded-frame-eviction
                  if (error?.name === 'QuotaExceededError') {
                    await evictBuffer(sourceBuffer, mediaEl.currentTime);
                    // Retry once after eviction
                    await appendSegment(mediaSource, sourceBuffer, chunk);
                  } else {
                    throw error;
                  }
                }
              }
            } catch (error) {
              console.error(`Failed to load segment ${segment.uri}:`, error);
            }
          }
        })
      );
    } finally {
      isLoading = false;
    }

    // Every time we load segments, check if we can end the stream.
    // It's possible endOfStream needs to be called more than once.
    checkEndOfStream(mediaSource, getMediaDuration(mediaPlaylists));
  };

  loadNextSegments();

  // timeupdate events are unreliable, also use an interval
  checkInterval = setInterval(loadNextSegments, 500);

  mediaEl.addEventListener('timeupdate', loadNextSegments);
};

const checkEndOfStream = (mediaSource: MediaSource, mediaDuration: number) => {
  if (
    mediaDuration > 0 &&
    mediaSource.readyState === 'open' &&
    areFinalSegmentsBuffered(mediaSource, mediaDuration)
  ) {
    try {
      mediaSource.endOfStream();
    } catch (err) {
      // Ignore if already ended/closed
    }
  }
};

// Decide which segments to load next to ensure at least MIN_BUFFER_AHEAD seconds
// are available ahead of the current playback position.
export const getSegmentsToLoad = (
  segments: Segment[] = [],
  buffered: TimeRanges,
  currentTime: number
) => {
  const toLoad: Segment[] = [];
  const addedUris = new Set<string>();

  // If nothing buffered yet and there is an init segment (duration 0), enqueue it first
  if (buffered.length === 0) {
    const initSeg = segments.find((s) => (s.duration || 0) === 0 && !!s.uri);
    if (initSeg && initSeg.uri && !addedUris.has(initSeg.uri)) {
      toLoad.push(initSeg);
      addedUris.add(initSeg.uri);
    }
  }

  const bufferedEnd = getContiguousBufferedEnd(buffered, currentTime);
  const targetBufferedEnd = currentTime + MIN_BUFFER_AHEAD;

  if (bufferedEnd >= targetBufferedEnd) {
    return toLoad;
  }

  // Find the first segment that extends beyond the current buffered end
  let startIndex = segments.findIndex((s) => (s.end || 0) > bufferedEnd);
  if (startIndex < 0) return toLoad; // Nothing more to load

  // Add segments until we reach the targetBufferedEnd, skipping fully buffered ones
  for (let i = startIndex; i < segments.length; i += 1) {
    const seg = segments[i];
    const segStart = seg.start ?? 0;
    const segEnd = seg.end ?? segStart + (seg.duration || 0);

    if (segEnd <= bufferedEnd) continue; // already behind our starting point
    if (isRangeInBuffered(segStart, segEnd, buffered)) continue;

    if (seg.uri && !addedUris.has(seg.uri)) {
      toLoad.push(seg);
      addedUris.add(seg.uri);
    }

    if (segEnd >= targetBufferedEnd) break;
  }

  return toLoad;
};

// Helper: end of the buffered range chain that contains currentTime, merging small gaps
export const getContiguousBufferedEnd = (ranges: TimeRanges, time: number) => {
  if (ranges.length === 0) return time;

  for (let i = 0; i < ranges.length; i += 1) {
    const rangeStart = ranges.start(i);
    const rangeEnd = ranges.end(i);

    // Consider small gaps around the current time as contiguous
    if (rangeStart - GAP_TOLERANCE <= time && time < rangeEnd + GAP_TOLERANCE) {
      let contiguousEnd = rangeEnd;

      // Merge forward while gaps are within tolerance
      for (let j = i + 1; j < ranges.length; j += 1) {
        const nextStart = ranges.start(j);
        const nextEnd = ranges.end(j);
        if (nextStart - contiguousEnd <= GAP_TOLERANCE) {
          contiguousEnd = Math.max(contiguousEnd, nextEnd);
        } else {
          break;
        }
      }

      return contiguousEnd;
    }
  }

  return time;
};

// Helper: is [start, end] fully within any buffered range?
const isRangeInBuffered = (
  start: number | undefined,
  end: number | undefined,
  ranges: TimeRanges
) => {
  if (start == null || end == null) return false;

  for (let i = 0; i < ranges.length; i++) {
    const rStart = ranges.start(i);
    const rEnd = ranges.end(i);

    if (rStart <= start + GAP_TOLERANCE && end - GAP_TOLERANCE <= rEnd)
      return true;
  }

  return false;
};

const fetchSegmentChunks = async (uri: string) => {
  const response = await fetch(uri);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch segment: ${response.status}`);
  }
  return new ChunkedStreamIterable(response.body);
};

const appendSegment = async (
  mediaSource: MediaSource,
  sourceBuffer: SourceBuffer,
  segmentData: SourceBufferData
) => {
  if (sourceBuffer.updating) await eventToPromise(sourceBuffer, 'updateend');

  // If the media source is closed, we can't append segments.
  // https://www.w3.org/TR/media-source/#sourcebuffer-prepare-append
  if (mediaSource.readyState === 'closed') return;

  const promise = eventToPromise(sourceBuffer, 'updateend');
  sourceBuffer.appendBuffer(segmentData);
  return promise;
};

const evictBuffer = async (sourceBuffer: SourceBuffer, currentTime: number) => {
  try {
    if (sourceBuffer.updating) {
      await eventToPromise(sourceBuffer, 'updateend');
    }

    const buffered = sourceBuffer.buffered;
    if (buffered.length === 0) return;

    const safeKeepTime = Math.max(0, currentTime - BACK_BUFFER_TARGET);
    const removeStart = buffered.start(0);
    const removeEnd = Math.min(safeKeepTime, buffered.end(buffered.length - 1));

    if (removeEnd > removeStart) {
      const removePromise = eventToPromise(sourceBuffer, 'updateend');
      sourceBuffer.remove(removeStart, removeEnd);
      await removePromise;
    }
  } catch (error) {
    console.warn('Buffer eviction failed:', error);
  }
};

export const eventToPromise = async (
  eventDispatcher: EventTarget,
  type: string
) => {
  return new Promise((resolve) => {
    eventDispatcher.addEventListener(type, resolve, { once: true });
  });
};

const areFinalSegmentsBuffered = (
  mediaSource: MediaSource,
  duration: number
) => {
  return Array.from(mediaSource.sourceBuffers).every((sb) =>
    isRangeInBuffered(duration, duration, sb.buffered)
  );
};
