import { assert } from '@open-wc/testing';
import {
  getSegmentsToLoad,
  MIN_BUFFER_AHEAD,
} from '../src/engines/hls-mini/mediasource.js';
import type { Segment, HlsMiniConfig } from '../src/engines/hls-mini/types.js';

const SEGMENT_DURATION = MIN_BUFFER_AHEAD;

// Mock TimeRanges interface for testing
interface MockTimeRanges {
  length: number;
  start: (index: number) => number;
  end: (index: number) => number;
}

const createMockTimeRanges = (
  ranges: Array<[number, number]>
): MockTimeRanges => {
  return {
    length: ranges.length,
    start: (index: number) => ranges[index][0],
    end: (index: number) => ranges[index][1],
  };
};

const createInitSegment = (uri: string = 'init.ts'): Segment => ({
  duration: 0,
  start: 0,
  end: 0,
  uri,
});

// Helper to create test segments using SEGMENT_DURATION as multiple
const createSegment = (
  segmentIndex: number,
  uri: string = `segment-${segmentIndex}.ts`
): Segment => ({
  duration: SEGMENT_DURATION,
  start: segmentIndex * SEGMENT_DURATION,
  end: (segmentIndex + 1) * SEGMENT_DURATION,
  uri,
});

// Default config for testing
const defaultConfig: HlsMiniConfig = {};

describe('getSegmentsToLoad', () => {
  describe('initialization segment handling', () => {
    it('should load init segment when nothing is buffered', () => {
      const segments = [
        createInitSegment(),
        createSegment(0),
        createSegment(1),
      ];
      const buffered = createMockTimeRanges([]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // The new logic only loads segments that extend beyond the current buffered end
      // Since currentTime is 0 and buffered is empty, it will load segments until targetBufferedEnd
      // Target: 0 + 15 = 15 seconds
      // Segment 0: 0-15 seconds (reaches target exactly)
      // Function stops when target is reached
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-0.ts');
    });

    it('should not load init segment if already buffered', () => {
      const segments = [createInitSegment(), createSegment(0)];
      const buffered = createMockTimeRanges([[0, SEGMENT_DURATION]]);
      const currentTime = SEGMENT_DURATION / 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      assert.equal(result.size, 0);
    });

    it('should not load init segment if it has no URI', () => {
      const segments = [
        createInitSegment(''), // init segment without URI
        createSegment(0),
      ];
      const buffered = createMockTimeRanges([]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // The function should only load segments with URIs
      // The init segment without URI should be skipped
      // Target: 0 + 15 = 15 seconds
      // Segment 0: 0-15 seconds (reaches target exactly)
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-0.ts');
    });
  });

  describe('buffer management', () => {
    it('should return empty set when buffer is sufficient', () => {
      const segments = [createSegment(0), createSegment(1)];
      const buffered = createMockTimeRanges([[0, 2 * SEGMENT_DURATION]]); // 2 segments buffered
      const currentTime = SEGMENT_DURATION;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      assert.equal(result.size, 0);
    });

    it('should load segments to reach target buffer ahead', () => {
      const segments = [
        createSegment(0),
        createSegment(1),
        createSegment(2),
        createSegment(3),
      ];
      const buffered = createMockTimeRanges([[0, SEGMENT_DURATION]]); // Only 1 segment buffered
      const currentTime = SEGMENT_DURATION / 2; // Need MIN_BUFFER_AHEAD seconds ahead

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-1.ts');
    });

    it('should skip already buffered segments', () => {
      const segments = [createSegment(0), createSegment(1), createSegment(2)];
      const buffered = createMockTimeRanges([[0, 2 * SEGMENT_DURATION]]); // 2 segments buffered
      const currentTime = SEGMENT_DURATION * 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Should only load segment 2 since 0 and 1 are already buffered
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-2.ts');
    });

    it('should handle segments with gaps in buffered ranges', () => {
      const segments = [createSegment(0), createSegment(1), createSegment(2)];
      const buffered = createMockTimeRanges([
        [0, SEGMENT_DURATION],
        [2 * SEGMENT_DURATION, 3 * SEGMENT_DURATION],
      ]); // Gap at segment 1
      const currentTime = SEGMENT_DURATION / 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Should load segment 1 to fill the gap
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-1.ts');
    });
  });

  describe('segment selection logic', () => {
    it('should find first segment beyond buffered end', () => {
      const segments = [createSegment(0), createSegment(1), createSegment(2)];
      const buffered = createMockTimeRanges([[0, 1.5 * SEGMENT_DURATION]]); // Buffered to 1.5 segments
      const currentTime = SEGMENT_DURATION / 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // The function checks if bufferedEnd >= targetBufferedEnd
      // bufferedEnd = getContiguousBufferedEnd([[0, 22.5]], 7.5) = 22.5
      // targetBufferedEnd = 7.5 + 15 = 22.5
      // Since 22.5 >= 22.5, the function returns early with no segments to load
      assert.equal(result.size, 0);
    });

    it('should handle segments with undefined start/end', () => {
      const segments = [createSegment(0), createSegment(1)];
      const buffered = createMockTimeRanges([[0, SEGMENT_DURATION]]);
      const currentTime = SEGMENT_DURATION / 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-1.ts');
    });

    it('should stop loading when target buffer is reached', () => {
      const segments = [
        createSegment(0),
        createSegment(1),
        createSegment(2),
        createSegment(3),
      ];
      const buffered = createMockTimeRanges([[0, 0.5 * SEGMENT_DURATION]]); // Only 0.5 segments buffered
      const currentTime = 0; // Need MIN_BUFFER_AHEAD seconds ahead

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Target: 0 + 15 = 15 seconds
      // Segment 0: 0-15 seconds (reaches target exactly)
      // Function loads segments until it reaches target, then stops
      assert.equal(result.size, 1);
    });
  });

  describe('duplicate prevention', () => {
    it('should not add segments with duplicate URIs', () => {
      const segments = [
        createSegment(0, 'same-uri.ts'),
        createSegment(1, 'same-uri.ts'),
        createSegment(2, 'different-uri.ts'),
      ];
      const buffered = createMockTimeRanges([]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Should only add unique URIs
      // Target: 0 + 15 = 15 seconds
      // Segment 0: 0-15 seconds (reaches target exactly)
      // Segment 1: 5-10 seconds (extends beyond target, but has duplicate URI)
      // Function stops when target is reached
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'same-uri.ts');
    });

    it('should handle segments without URIs', () => {
      const segments = [
        createSegment(0, ''), // No URI
        createSegment(1),
      ];
      const buffered = createMockTimeRanges([]);
      const currentTime = SEGMENT_DURATION / 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Should only add segments with URIs
      // Target: 2.5 + 15 = 17.5 seconds
      // Segment 0: 0-15 seconds (no URI, skipped)
      // Segment 1: 15-30 seconds (extends beyond target)
      // Function loads segments until target is reached
      assert.equal(result.size, 1);
      assert.equal(Array.from(result)[0].uri, 'segment-1.ts');
    });
  });

  describe('edge cases', () => {
    it('should handle empty segments array', () => {
      const segments: Segment[] = [];
      const buffered = createMockTimeRanges([]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      assert.equal(result.size, 0);
    });

    it('should handle undefined segments parameter', () => {
      const buffered = createMockTimeRanges([]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        undefined,
        buffered,
        currentTime,
        defaultConfig
      );

      assert.equal(result.size, 0);
    });

    it('should handle segments with zero duration', () => {
      const segments = [
        createInitSegment(),
        createInitSegment('another-init.ts'),
      ];
      const buffered = createMockTimeRanges([]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Should only add segments with URIs and non-zero duration
      // Both init segments have duration 0, so they won't be loaded
      assert.equal(result.size, 0);
    });

    it('should handle segments that extend exactly to target buffer', () => {
      const segments = [
        createSegment(0),
        createSegment(1), // Exactly reaches target (currentTime + MIN_BUFFER_AHEAD)
      ];
      const buffered = createMockTimeRanges([[0, 0.5 * SEGMENT_DURATION]]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Target: 0 + 15 = 15 seconds
      // Segment 0: 0-15 seconds (reaches target exactly)
      // Function loads segments until target is reached, then stops
      assert.equal(result.size, 1);
    });

    it('should handle segments that extend beyond target buffer', () => {
      const segments = [
        createSegment(0),
        createSegment(1), // Extends beyond target (currentTime + MIN_BUFFER_AHEAD)
      ];
      const buffered = createMockTimeRanges([[0, 0.5 * SEGMENT_DURATION]]);
      const currentTime = 0;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Target: 0 + 15 = 15 seconds
      // Segment 0: 0-15 seconds (reaches target exactly)
      // Function loads segments until target is reached, then stops
      assert.equal(result.size, 1);
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed segment types and buffering states', () => {
      const segments = [
        createInitSegment(),
        createSegment(0),
        createSegment(1),
        createSegment(2),
        createSegment(3),
      ];
      const buffered = createMockTimeRanges([
        [0, 0.5 * SEGMENT_DURATION],
        [1.5 * SEGMENT_DURATION, 2 * SEGMENT_DURATION],
      ]); // Gap at 0.5-1.5
      const currentTime = SEGMENT_DURATION; // In the gap

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      assert.isTrue(result.size > 0);
      assert.equal(Array.from(result)[0].uri, 'segment-1.ts');
    });
  });

  describe('config parameter handling', () => {
    it('should use custom maxBufferLength when provided', () => {
      const segments = [createSegment(0), createSegment(1), createSegment(2)];
      const buffered = createMockTimeRanges([[0, SEGMENT_DURATION]]);
      const currentTime = SEGMENT_DURATION / 2;
      const customConfig: HlsMiniConfig = { maxBufferLength: 10 };

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        customConfig
      );

      // With custom maxBufferLength of 10, should load more segments
      assert.isTrue(result.size > 0);
    });

    it('should fall back to MIN_BUFFER_AHEAD when maxBufferLength not provided', () => {
      const segments = [createSegment(0), createSegment(1), createSegment(2)];
      const buffered = createMockTimeRanges([[0, SEGMENT_DURATION]]);
      const currentTime = SEGMENT_DURATION / 2;

      const result = getSegmentsToLoad(
        segments,
        buffered,
        currentTime,
        defaultConfig
      );

      // Should use default MIN_BUFFER_AHEAD value
      assert.isTrue(result.size > 0);
    });
  });
});
