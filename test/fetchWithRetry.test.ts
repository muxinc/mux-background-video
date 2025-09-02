import { assert } from '@open-wc/testing';
import { fetchWithRetry } from '../src/engines/hls-mini/utils.js';

// Store original global fetch
const originalFetch = window.fetch;

// Mock Response interface
interface MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
}

// Mock fetch function
let mockFetch: (url: string, options?: RequestInit) => Promise<MockResponse>;

// Setup and teardown
beforeEach(() => {
  // Reset mock
  mockFetch = async () => ({ ok: true, status: 200, statusText: 'OK' });
  
  // Mock global fetch
  window.fetch = mockFetch as any;
});

afterEach(() => {
  // Restore original fetch
  window.fetch = originalFetch;
});

describe('fetchWithRetry', () => {
  it('should return successful response immediately without retries', async () => {
    const mockResponse = { ok: true, status: 200, statusText: 'OK' };
    let callCount = 0;
    mockFetch = async () => {
      callCount++;
      return mockResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com');

    assert.equal(result, mockResponse);
    assert.equal(callCount, 1);
  });

  it('should retry on 5xx server errors', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        return errorResponse;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 2);
  });

  it('should retry on 408 Request Timeout', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 408, statusText: 'Request Timeout' };
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        return errorResponse;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 2);
  });

  it('should retry on 429 Too Many Requests', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 429, statusText: 'Too Many Requests' };
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        return errorResponse;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 2);
  });

  it('should not retry on 4xx client errors (except 408, 429)', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 404, statusText: 'Not Found' };
    
    mockFetch = async () => {
      callCount++;
      return errorResponse;
    };
    window.fetch = mockFetch as any;

    try {
      await fetchWithRetry('https://example.com');
      assert.fail('Should have thrown an error');
    } catch (error: any) {
      assert.include(error.message, 'HTTP 404');
      assert.equal(callCount, 1);
    }
  });

  it('should retry on network errors', async () => {
    let callCount = 0;
    const networkError = new TypeError('Network error');
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        throw networkError;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 2);
  });

  it('should retry on fetch API errors', async () => {
    let callCount = 0;
    const fetchError = new Error('fetch failed');
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        throw fetchError;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 2);
  });

  it('should not retry on non-network errors', async () => {
    let callCount = 0;
    const otherError = new Error('Some other error');
    
    mockFetch = async () => {
      callCount++;
      throw otherError;
    };
    window.fetch = mockFetch as any;

    try {
      await fetchWithRetry('https://example.com');
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.equal(error, otherError);
      assert.equal(callCount, 1);
    }
  });

  it('should respect maxRetries option', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
    
    mockFetch = async () => {
      callCount++;
      return errorResponse;
    };
    window.fetch = mockFetch as any;

    try {
      await fetchWithRetry('https://example.com', { maxRetries: 2, baseDelay: 10 });
      assert.fail('Should have thrown an error');
    } catch (error: any) {
      assert.include(error.message, 'HTTP 500');
      assert.equal(callCount, 3); // Initial + 2 retries
    }
  });

  it('should use custom baseDelay for exponential backoff', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        return errorResponse;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const startTime = Date.now();
    await fetchWithRetry('https://example.com', { baseDelay: 50 });
    const endTime = Date.now();

    // Should have waited at least 50ms (baseDelay)
    assert.isTrue(endTime - startTime >= 50);
    assert.equal(callCount, 2);
  });

  it('should pass through fetch options', async () => {
    let callCount = 0;
    const mockResponse = { ok: true, status: 200, statusText: 'OK' };
    let capturedOptions: RequestInit | undefined;
    
    mockFetch = async (url: string, options?: RequestInit) => {
      callCount++;
      capturedOptions = options;
      return mockResponse;
    };
    window.fetch = mockFetch as any;

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    };

    await fetchWithRetry('https://example.com', options);

    assert.equal(callCount, 1);
    assert.equal(capturedOptions?.method, 'POST');
    assert.equal(capturedOptions?.headers, options.headers);
    assert.equal(capturedOptions?.body, options.body);
  });

  it('should handle multiple consecutive failures and succeed on last attempt', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount <= 3) {
        return errorResponse;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { maxRetries: 3, baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 4);
  });

  it('should throw error after exhausting all retries', async () => {
    let callCount = 0;
    const errorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
    
    mockFetch = async () => {
      callCount++;
      return errorResponse;
    };
    window.fetch = mockFetch as any;

    try {
      await fetchWithRetry('https://example.com', { maxRetries: 2, baseDelay: 10 });
      assert.fail('Should have thrown an error');
    } catch (error: any) {
      assert.include(error.message, 'HTTP 500');
      assert.equal(callCount, 3); // Initial + 2 retries
    }
  });

  it('should handle mixed error types correctly', async () => {
    let callCount = 0;
    const networkError = new TypeError('Network error');
    const serverError = { ok: false, status: 500, statusText: 'Internal Server Error' };
    const successResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      if (callCount === 1) {
        throw networkError;
      } else if (callCount === 2) {
        return serverError;
      }
      return successResponse;
    };
    window.fetch = mockFetch as any;

    const result = await fetchWithRetry('https://example.com', { baseDelay: 10 });

    assert.equal(result, successResponse);
    assert.equal(callCount, 3);
  });

  it('should use default values when options are not provided', async () => {
    let callCount = 0;
    const mockResponse = { ok: true, status: 200, statusText: 'OK' };
    
    mockFetch = async () => {
      callCount++;
      return mockResponse;
    };
    window.fetch = mockFetch as any;

    await fetchWithRetry('https://example.com');

    // Should use default maxRetries (5) and baseDelay (1000)
    assert.equal(callCount, 1);
  });

  it('should handle abort signal', async () => {
    const abortController = new AbortController();
    
    // Mock fetch to throw AbortError when signal is aborted
    mockFetch = async (url: string, options?: RequestInit) => {
      if (options?.signal && (options.signal as any).aborted) {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      return { ok: true, status: 200, statusText: 'OK' };
    };
    window.fetch = mockFetch as any;
    
    // Abort immediately
    abortController.abort();

    try {
      await fetchWithRetry('https://example.com', { signal: abortController.signal });
      assert.fail('Should have thrown an error');
    } catch (error: any) {
      assert.equal(error.name, 'AbortError');
    }
  });
});
