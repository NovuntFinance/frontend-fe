/**
 * Token Refresh Module
 * Handles JWT token refresh logic with automatic retry and expiry detection
 */

import { api } from './api';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Subscribe to token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers when refresh completes
 */
function onRefreshSuccess(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Check if token is expired or about to expire
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();

    // Consider token expired if it expires in next 5 minutes
    return exp - now < 5 * 60 * 1000;
  } catch {
    return true;
  }
}

/**
 * Get stored tokens from localStorage
 */
export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens: RefreshResponse) {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
}

/**
 * Clear stored tokens
 */
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getStoredTokens();

  if (!refreshToken) {
    console.warn('[Token Refresh] No refresh token available');
    return null;
  }

  // If already refreshing, wait for it to complete
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await api.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response;

    // Store new tokens
    storeTokens({
      accessToken,
      refreshToken: newRefreshToken || refreshToken,
    });

    // Notify subscribers
    onRefreshSuccess(accessToken);
    isRefreshing = false;

    return accessToken;
  } catch (error) {
    console.error('[Token Refresh] Failed to refresh token:', error);
    isRefreshing = false;
    refreshSubscribers = [];

    // Clear tokens on refresh failure
    clearTokens();

    // Redirect to login if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return null;
  }
}

/**
 * Get valid access token (refreshes if needed)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const { accessToken } = getStoredTokens();

  if (!accessToken) {
    return null;
  }

  // Check if token is expired or about to expire
  if (isTokenExpired(accessToken)) {
    console.log('[Token Refresh] Access token expired, refreshing...');
    return await refreshAccessToken();
  }

  return accessToken;
}

/**
 * Setup automatic token refresh interval
 * Checks and refreshes token every 4 minutes
 */
export function setupTokenRefreshInterval(): NodeJS.Timeout | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return setInterval(
    async () => {
      const { accessToken } = getStoredTokens();

      if (accessToken && isTokenExpired(accessToken)) {
        console.log('[Token Refresh] Auto-refreshing expired token...');
        await refreshAccessToken();
      }
    },
    4 * 60 * 1000
  ); // Every 4 minutes
}

/**
 * React hook for token refresh
 */
import { useEffect } from 'react';

export function useTokenRefresh() {
  useEffect(() => {
    const interval = setupTokenRefreshInterval();

    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);
}
