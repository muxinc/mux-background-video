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
  const { maxRetries = 5, baseDelay = 1000, signal, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { ...fetchOptions, signal });

      // If the response is successful, return it immediately
      if (response.ok) {
        return response;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if we should retry based on status code
      if (!shouldRetry(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Calculate delay with exponential backoff
      const delay = calculateDelay(attempt, baseDelay);

      // Wait before retrying
      await sleep(delay);
    } catch (error) {
      lastError = error as Error;

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // If it's a network error or abort, retry
      if (shouldRetryError(error as Error)) {
        const delay = calculateDelay(attempt, baseDelay);
        await sleep(delay);
        continue;
      }

      // For other errors, don't retry
      throw lastError;
    }
  }

  throw lastError || new Error('Unknown error occurred');
};

/**
 * Determine if a status code should trigger a retry
 */
const shouldRetry = (status: number): boolean => {
  // Retry on 5xx server errors and some 4xx client errors
  return (
    status >= 500 || // Server errors
    status === 408 || // Request timeout
    status === 429 // Too many requests
  );
};

/**
 * Determine if an error should trigger a retry
 */
const shouldRetryError = (error: Error): boolean => {
  // Retry on network errors, timeouts
  return (
    error.name === 'TypeError' || // Network errors
    error.message.includes('fetch') || // Fetch API errors
    error.message.includes('network') // Network-related errors
  );
};

/**
 * Calculate delay for next retry attempt
 */
const calculateDelay = (attempt: number, baseDelay: number): number => {
  // Exponential backoff: baseDelay * 2^attempt
  // Add some jitter to prevent thundering herd
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return exponentialDelay + jitter;
};

/**
 * Sleep utility function
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
