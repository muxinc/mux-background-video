import { assert } from '@open-wc/testing';
import { getContiguousBufferedEnd } from '../../src/engines/hls-mini/mediasource.js';

// Mock TimeRanges interface for testing
interface MockTimeRanges {
  length: number;
  start: (index: number) => number;
  end: (index: number) => number;
}

const createMockTimeRanges = (ranges: Array<[number, number]>): MockTimeRanges => {
  return {
    length: ranges.length,
    start: (index: number) => ranges[index][0],
    end: (index: number) => ranges[index][1]
  };
};

describe('getContiguousBufferedEnd', () => {
  it('should return current time when no ranges exist', () => {
    const ranges = createMockTimeRanges([]);
    const currentTime = 5.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, currentTime);
  });

  it('should return current time when no range contains the current time', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [4, 6]
    ]);
    const currentTime = 3.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, currentTime);
  });

  it('should return range end when current time is within a single range', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [4, 6]
    ]);
    const currentTime = 1.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 2);
  });

  it('should merge contiguous ranges within gap tolerance', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.1, 4], // Gap of 0.1, within tolerance of 0.25
      [4.2, 6]  // Gap of 0.2, within tolerance of 0.25
    ]);
    const currentTime = 1.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 6);
  });

  it('should not merge ranges with gaps larger than tolerance', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.5, 4], // Gap of 0.5, exceeds tolerance of 0.25
      [4.5, 6]  // Gap of 0.5, exceeds tolerance of 0.25
    ]);
    const currentTime = 1.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 2);
  });

  it('should handle current time at range boundary with tolerance', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.2, 4]
    ]);
    const currentTime = 2.0; // At the end of first range
    const result = getContiguousBufferedEnd(ranges, currentTime);
    // Should merge ranges since 2.0 is within tolerance of [0,2] and gaps are within tolerance
    assert.equal(result, 4);
  });

  it('should handle current time just before range start with tolerance', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.2, 4]
    ]);
    const currentTime = 2.0; // Just before second range start (2.2)
    const result = getContiguousBufferedEnd(ranges, currentTime);
    // Should merge ranges since 2.0 is within tolerance of [0,2] and gaps are within tolerance
    assert.equal(result, 4);
  });

  it('should merge multiple contiguous ranges', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.1, 4],   // Gap of 0.1
      [4.1, 6],   // Gap of 0.1
      [6.1, 8],   // Gap of 0.1
      [8.5, 10]   // Gap of 0.4 (exceeds tolerance)
    ]);
    const currentTime = 1.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 8);
  });

  it('should handle current time in middle of merged ranges', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.1, 4],
      [4.1, 6]
    ]);
    const currentTime = 3.0; // In the middle of the second range
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 6);
  });

  it('should handle edge case with very small gaps', () => {
    const ranges = createMockTimeRanges([
      [0, 1],
      [1.001, 2], // Gap of 0.001, well within tolerance
      [2.001, 3]  // Gap of 0.001, well within tolerance
    ]);
    const currentTime = 0.5;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 3);
  });

  it('should handle edge case with gaps exactly at tolerance', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.25, 4] // Gap of exactly 0.25 (tolerance)
    ]);
    const currentTime = 1.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 4);
  });

  it('should handle current time exactly at range start', () => {
    const ranges = createMockTimeRanges([
      [1, 3],
      [3.1, 5]
    ]);
    const currentTime = 1.0; // Exactly at start of first range
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 5);
  });

  it('should handle current time exactly at range end', () => {
    const ranges = createMockTimeRanges([
      [1, 3],
      [3.1, 5]
    ]);
    const currentTime = 3.0; // Exactly at end of first range
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 5);
  });

  it('should handle current time just outside tolerance', () => {
    const ranges = createMockTimeRanges([
      [0, 2],
      [2.3, 4] // Gap of 0.3, exceeds tolerance of 0.25
    ]);
    const currentTime = 1.0;
    const result = getContiguousBufferedEnd(ranges, currentTime);
    assert.equal(result, 2); // Should not merge ranges
  });
});
