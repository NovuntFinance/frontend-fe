/**
 * Enhanced API Client with Axios
 * Handles authentication, error handling, retries, and request/response interceptors
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from 'axios';
import { ApiError, ApiResponse } from '@/types/api';
import { useAuthStore } from '@/store/authStore';

/**
 * Get API base URL from environment
 *
 * Development: http://localhost:5000/api/v1
 * Production: https://api.novunt.com/api/v1 (AWS)
 *
 * CRITICAL: Always use NEXT_PUBLIC_API_URL environment variable
 * DO NOT hardcode URLs - this causes CORS failures
 */
const getAPIBaseURL = (): string => {
  // Get from environment variable
  const envURL = process.env.NEXT_PUBLIC_API_URL;

  // Validate and return
  if (envURL) {
    // Ensure it doesn't end with /api/v1 if it's already included
    const baseURL = envURL.trim();

    return baseURL;
  }

  // Fallback based on environment (should not be needed if env vars are set)
  const fallback =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api/v1'
      : 'https://api.novunt.com/api/v1';

  console.warn('⚠️ NEXT_PUBLIC_API_URL not set! Using fallback:', fallback);
  console.warn(
    '⚠️ Set NEXT_PUBLIC_API_URL in .env.local (local) or hosting dashboard (production)'
  );

  return fallback;
};

const API_BASE_URL = getAPIBaseURL();

// Create axios instance with default config aligned with BetterAuth specification
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds (increased for slow referral tree queries)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Required for BetterAuth cookie-based authentication
});

// Token management utilities - align with backend: use accessToken
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Track last token set time - used to avoid redirect loop right after login
let lastTokenSetTime = 0;

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const legacy = localStorage.getItem('authToken');
      if (legacy) {
        try {
          localStorage.setItem(TOKEN_KEY, legacy);
          token = legacy;
        } catch {}
      }
    }
    return token;
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    lastTokenSetTime = Date.now();
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('authToken');
  },
};

// Request interceptor: Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = tokenManager.getToken();

    // If not found, try reading from Zustand persist storage
    if (!token && typeof window !== 'undefined') {
      try {
        const persistedAuth = localStorage.getItem('novunt-auth-storage');
        if (persistedAuth) {
          const parsed = JSON.parse(persistedAuth);
          token = parsed.state?.token || null;
        }
      } catch (readError) {}
    }

    // Ensure headers object exists
    if (!config.headers) {
      (config as any).headers = {};
    }

    // These endpoints don't use Bearer token auth
    const isUnauthenticatedEndpoint =
      config.url?.includes('/better-auth/request-password-reset') ||
      config.url?.includes('/better-auth/verify-reset-otp') ||
      config.url?.includes('/better-auth/reset-password') ||
      config.url?.includes('/better-auth/verify-email') ||
      config.url?.includes('/better-auth/resend-verification') ||
      config.url?.includes('/better-auth/complete-registration') ||
      config.url?.includes('/better-auth/register');

    if (isUnauthenticatedEndpoint) {
      // Strip Bearer token only - credentials (cookies) are excluded for cross-origin reset endpoints
      config.withCredentials = false;
      if (config.headers) {
        delete (config.headers as Record<string, string>).Authorization;
        delete (config.headers as Record<string, string>).authorization;
      }
    }

    // Attach Authorization header when token is available (skip for public endpoints)
    if (token && !isUnauthenticatedEndpoint) {
      try {
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
      } catch (attachErr) {}
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and token refresh
let isRefreshing = false;
type FailedQueueItem = {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Invalid/expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh for public/unauthenticated endpoints
      const isPublicAuthEndpoint =
        originalRequest.url?.includes('/better-auth/request-password-reset') ||
        originalRequest.url?.includes('/better-auth/verify-reset-otp') ||
        originalRequest.url?.includes('/better-auth/reset-password') ||
        originalRequest.url?.includes('/better-auth/verify-email') ||
        originalRequest.url?.includes('/better-auth/resend-verification') ||
        originalRequest.url?.includes('/better-auth/complete-registration') ||
        originalRequest.url?.includes('/better-auth/register');

      if (isPublicAuthEndpoint) {
        return Promise.reject(error);
      }

      // Don't try to refresh if this IS the refresh endpoint
      if (originalRequest.url?.includes('/refresh-token')) {
        console.error('[API] Refresh token failed, clearing all auth data');
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          useAuthStore.getState().clearAuth();
          window.dispatchEvent(new Event('auth:session-lost'));
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();
      const hadToken = tokenManager.getToken();

      if (!refreshToken) {
        // Grace period: if we just set tokens (e.g. right after login), don't redirect
        const msSinceTokenSet = Date.now() - lastTokenSetTime;
        if (msSinceTokenSet < 3000) {
          return Promise.reject(error);
        }
        // Only redirect when we HAD a session that was lost - not on first visit
        // Visiting / (home) with no token should not force redirect to login
        if (!hadToken) {
          return Promise.reject(error);
        }
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          useAuthStore.getState().clearAuth();
          window.dispatchEvent(new Event('auth:session-lost'));
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token - try multiple endpoints
        let response;
        let newToken: string;
        let newRefreshToken: string;

        try {
          // Try BetterAuth endpoint first
          response = await axios.post(
            `${getAPIBaseURL()}/better-auth/refresh-token`,
            {
              refreshToken,
            },
            {
              withCredentials: true,
            }
          );

          const responseData = response.data.data || response.data;
          newToken = responseData.accessToken || responseData.token;
          newRefreshToken = responseData.refreshToken || refreshToken;
        } catch (betterAuthError) {
          // Fallback: try standard auth refresh endpoint
          try {
            response = await axios.post(
              `${getAPIBaseURL()}/auth/refresh`,
              {
                refreshToken,
              },
              {
                withCredentials: true,
              }
            );

            const responseData = response.data.data || response.data;
            newToken = responseData.accessToken || responseData.token;
            newRefreshToken = responseData.refreshToken || refreshToken;
          } catch (standardError) {
            // Both endpoints failed - token is invalid
            console.error('[API] All refresh endpoints failed:', {
              betterAuth: betterAuthError,
              standard: standardError,
            });
            throw standardError;
          }
        }

        if (!newToken) {
          throw new Error('No token returned from refresh endpoint');
        }

        // Update tokens in all storage locations
        tokenManager.setToken(newToken);
        tokenManager.setRefreshToken(newRefreshToken);

        // Also update auth store if available
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/authStore');
          const store = useAuthStore.getState();
          if (store.setTokens) {
            store.setTokens(newToken, newRefreshToken);
          }
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);

        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error('[API] Token refresh failed:', {
          message: refreshError?.message,
          status: refreshError?.response?.status,
          data: refreshError?.response?.data,
        });

        processQueue(refreshError);

        // Grace period: if we just logged in, don't redirect - prevents loop
        const msSinceTokenSet = Date.now() - lastTokenSetTime;
        if (msSinceTokenSet < 3000) {
          return Promise.reject(refreshError);
        }

        // Clear auth and dispatch event - AuthSessionHandler uses router.replace (handoff doc)
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/authStore');
          useAuthStore.getState().clearAuth();
          window.dispatchEvent(new Event('auth:session-lost'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    // Skip logging for network errors (CORS, backend down, etc.) to avoid console spam
    const isNetworkError =
      error.code === 'ERR_NETWORK' ||
      error.message?.toLowerCase().includes('network error') ||
      !error.response; // No response means network error

    // 403 on public settings is expected when backend restricts by role; frontend uses default
    const isPublicSettingsForbidden =
      error.response?.status === 403 &&
      originalRequest.url?.includes('/settings/public/');

    // Handle CORS errors (network errors with no response)
    // Check for CORS/network errors - detect Failed to fetch specifically
    if (!error.response && error.message) {
      const isCorsError =
        error.message.includes('Network Error') ||
        error.code === 'ERR_NETWORK' ||
        error.message.includes('CORS') ||
        (error instanceof TypeError &&
          error.message.includes('Failed to fetch'));

      if (isCorsError) {
        const requestURL = originalRequest.url
          ? `${API_BASE_URL}${originalRequest.url}`
          : 'Unknown URL';

        // Diagnose the issue
        let diagnosticMessage = `Unable to connect to the server at ${requestURL}.`;
        diagnosticMessage += '\n\nPlease check:\n';
        diagnosticMessage +=
          '1. Backend server is running at ' + API_BASE_URL + '\n';
        diagnosticMessage += '2. CORS is configured correctly on backend\n';
        diagnosticMessage += '3. Network connectivity\n';
        diagnosticMessage +=
          '4. NEXT_PUBLIC_API_URL environment variable is set correctly';

        const corsError: ApiError = {
          success: false,
          message: diagnosticMessage,
          statusCode: 0, // Network error
          code: 'CORS_ERROR',
        };
        return Promise.reject(corsError);
      }
    }

    // Check if backend returned placeholder message (endpoint not implemented)
    const backendMessage = error.response?.data?.message || '';
    const requestUrl = originalRequest?.url || '';
    // Never show "under development" for transfer — backend returns specific errors (2FA, insufficient funds, etc.)
    const isTransferRequest = requestUrl.includes('/transfer');
    const isPlaceholderResponse =
      !isTransferRequest &&
      typeof backendMessage === 'string' &&
      backendMessage.includes('Novunt API is running');

    // Preserve backend error response fields for better error handling
    const backendData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const errorResponse: ApiError = {
      success: false,
      message: isPlaceholderResponse
        ? 'This feature is currently under development. Please try again later.'
        : (backendData?.message as string) ||
          error.message ||
          'An unexpected error occurred',
      errors: backendData?.errors as Record<string, string[]> | undefined,
      statusCode: isPlaceholderResponse ? 501 : error.response?.status,
      code: error.code,
      // Preserve new backend fields (field, action, canResetPassword)
      field: backendData?.field as string | undefined,
      action: backendData?.action as string | undefined,
      canResetPassword: backendData?.canResetPassword as boolean | undefined,
      // Preserve original response for compatibility
      response: {
        data: backendData as {
          message?: string;
          field?: string;
          action?: string;
          canResetPassword?: boolean;
          [key: string]: unknown;
        },
      },
    };

    return Promise.reject(errorResponse);
  }
);

// Typed API response wrapper
export async function apiRequest<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const requestConfig: AxiosRequestConfig = {
    url,
    method,
    ...(data !== undefined ? { data } : {}),
    ...(config ?? {}),
  };

  const response = await apiClient.request<ApiResponse<T> | T>(requestConfig);
  const responseData = response.data as ApiResponse<T> | T;

  // Don't unwrap trading signals history responses - they need the full response structure
  if (
    !url.includes('/trading-signals/history') &&
    typeof responseData === 'object' &&
    responseData !== null &&
    'data' in responseData &&
    (responseData as ApiResponse<T>).data !== undefined
  ) {
    return (responseData as ApiResponse<T>).data;
  }

  return responseData as T;
}

// Convenience methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>('get', url, undefined, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>('post', url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>('put', url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>('patch', url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>('delete', url, undefined, config),
};

export default apiClient;

export const getApiConfig = () => ({
  baseURL: API_BASE_URL,
  envVar: process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using fallback)',
  isUsingFallback: !process.env.NEXT_PUBLIC_API_URL,
});
