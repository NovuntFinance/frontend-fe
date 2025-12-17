/**
 * API Request Utilities
 * Utilities for request deduplication and cancellation
 */

import { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axios from 'axios';

/**
 * Request deduplication map
 * Prevents duplicate simultaneous requests
 */
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Active request cancel tokens
 * Allows cancelling requests on component unmount
 */
const cancelTokens = new Map<string, CancelTokenSource>();

/**
 * Generate a unique key for a request
 */
function getRequestKey(config: AxiosRequestConfig): string {
  const { method = 'get', url = '', params, data } = config;
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}:${url}:${paramsStr}:${dataStr}`;
}

/**
 * Deduplicate requests
 * If the same request is already pending, return the existing promise
 */
export function deduplicateRequest<T>(
  config: AxiosRequestConfig,
  executor: () => Promise<T>
): Promise<T> {
  const key = getRequestKey(config);

  // If request is already pending, return existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Execute new request
  const promise = executor().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Create a cancellable request
 * Returns a cancel token and cleanup function
 */
export function createCancellableRequest(requestId: string) {
  // Cancel any existing request with this ID
  if (cancelTokens.has(requestId)) {
    cancelTokens.get(requestId)!.cancel('Cancelled due to new request');
    cancelTokens.delete(requestId);
  }

  // Create new cancel token
  const source = axios.CancelToken.source();
  cancelTokens.set(requestId, source);

  return {
    cancelToken: source.token,
    cancel: (reason?: string) => {
      source.cancel(reason);
      cancelTokens.delete(requestId);
    },
  };
}

/**
 * Cancel all pending requests
 * Useful for cleanup on app unmount or route changes
 */
export function cancelAllRequests(reason = 'Requests cancelled') {
  cancelTokens.forEach((source, key) => {
    source.cancel(reason);
  });
  cancelTokens.clear();
  pendingRequests.clear();
}

/**
 * Cancel requests by prefix
 * Example: cancel all '/users' requests
 */
export function cancelRequestsByPrefix(
  prefix: string,
  reason = 'Requests cancelled'
) {
  const keysToCancel: string[] = [];

  cancelTokens.forEach((source, key) => {
    if (key.startsWith(prefix)) {
      source.cancel(reason);
      keysToCancel.push(key);
    }
  });

  keysToCancel.forEach((key) => {
    cancelTokens.delete(key);
  });
}

/**
 * Hook for automatic request cancellation on unmount
 *
 * Usage:
 * ```ts
 * const { cancelToken, cancel } = useCancellableRequest('user-profile');
 *
 * useEffect(() => {
 *   return cancel; // Cleanup on unmount
 * }, [cancel]);
 * ```
 */
export function useCancellableRequest(requestId: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require('react');
  const requestData = createCancellableRequest(requestId);

  useEffect(() => {
    return () => requestData.cancel('Component unmounted');
  }, [requestData]);

  return requestData;
}

/**
 * Request rate limiter
 * Limits the number of requests per time window
 */
class RequestRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 1000
  ) {}

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Filter out old timestamps outside the window
    const recentTimestamps = timestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    if (recentTimestamps.length >= this.maxRequests) {
      return false;
    }

    recentTimestamps.push(now);
    this.requests.set(key, recentTimestamps);
    return true;
  }

  clear(key?: string) {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

export const rateLimiter = new RequestRateLimiter();

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
