interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  baseDelay?: number;
}

/**
 * Fetch utility with retry logic
 * Retries up to 5 times with exponential backoff
 */
export const fetchWithRetry = async (
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> => {
  const { maxRetries = 5, baseDelay = 1000, ...fetchOptions } = options;
  const effectiveMaxRetries = Math.max(1, maxRetries);

  for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
    try {
      const response = await fetch(url, { ...fetchOptions });

      if (response.ok) return response;

      // Don't retry on client errors (except specific ones)
      if (response.status < 500 && ![408, 429].includes(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // If last attempt, throw error
      if (attempt === effectiveMaxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const err = error as Error;

      // Don't retry on non-network errors
      if (
        attempt === effectiveMaxRetries ||
        (err.name !== 'TypeError' &&
          !err.message.includes('fetch') &&
          !err.message.includes('network'))
      ) {
        throw err;
      }
    }

    // Wait before retry (except on last iteration)
    if (attempt < effectiveMaxRetries) {
      const delay =
        baseDelay * Math.pow(2, attempt) * (1 + Math.random() * 0.1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error();
};
