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

/**
 * Get API base URL from environment
 *
 * Development: http://localhost:5000/api/v1
 * Production: https://novunt-backend-uw3z.onrender.com/api/v1
 *
 * CRITICAL: Always use NEXT_PUBLIC_API_URL environment variable
 * DO NOT hardcode URLs - this causes CORS failures
 */
const getAPIBaseURL = (): string => {
  // Get from environment variable
  const envURL = process.env.NEXT_PUBLIC_API_URL;

  if (envURL) {
    return envURL.trim();
  }

  const fallback =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api/v1'
      : 'https://novunt-backend-uw3z.onrender.com/api/v1';

  if (process.env.NODE_ENV === 'development') {
    console.warn('NEXT_PUBLIC_API_URL not set; using fallback.');
  }

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
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[tokenManager] Migrated legacy authToken -> accessToken'
            );
          }
        } catch {}
      }
    }
    return token;
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
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

    if (!token && typeof window !== 'undefined') {
      try {
        const persistedAuth = localStorage.getItem('novunt-auth-storage');
        if (persistedAuth) {
          const parsed = JSON.parse(persistedAuth);
          token = parsed.state?.token || null;
        }
      } catch {
        // Ignore; request will go without auth
      }
    }

    if (!config.headers) {
      (config as any).headers = {};
    }

    if (token) {
      try {
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
      } catch {
        // Ignore
      }
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
      // Don't try to refresh if this IS the refresh endpoint
      if (originalRequest.url?.includes('/refresh-token')) {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
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

      if (!refreshToken) {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
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
          console.log(
            '[API] BetterAuth refresh failed, trying standard endpoint...'
          );
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
        processQueue(refreshError);

        // Clear all auth data
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/authStore');
          const store = useAuthStore.getState();
          store.clearAuth();

          // Redirect to login with error message
          const errorMessage =
            refreshError?.response?.data?.message || 'Session expired';
          window.location.href = `/login?error=session_expired&message=${encodeURIComponent(errorMessage)}`;
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

    // Minimal dev logging: no tokens, no request/response payloads (security: avoid leaking sensitive data)
    if (
      process.env.NODE_ENV === 'development' &&
      error.response?.status !== 404 &&
      !isNetworkError
    ) {
      const isLoginEndpoint =
        originalRequest.url?.includes('/better-auth/login') ||
        originalRequest.url?.includes('/admin/login') ||
        originalRequest.url?.includes('/auth/login');
      const isLogin401 = isLoginEndpoint && error.response?.status === 401;
      const logMethod = isLogin401 ? console.warn : console.error;
      logMethod(
        `[API] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} → ${error.response?.status ?? 'network error'}`
      );
    }

    // Log 404s as info instead of error
    if (
      process.env.NODE_ENV === 'development' &&
      error.response?.status === 404
    ) {
      console.log(
        `ℹ️ [API 404] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - ${error.response?.data?.message || 'Not found'} (This is normal for new users)`
      );
    }

    // Check for placeholder/unimplemented endpoint
    if (process.env.NODE_ENV === 'development') {
      const message = error.response?.data?.message || '';
      if (
        typeof message === 'string' &&
        message.includes('Novunt API is running')
      ) {
        console.warn(
          '⚠️ Backend endpoint not yet implemented:',
          originalRequest.url
        );
      }
    }

    // Handle CORS errors (network errors with no response)
    // Check for CORS/network errors - detect Failed to fetch specifically
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      console.error('🚫 CORS or network error detected:', error);
      console.error('🚫 Error type: TypeError');
      console.error('🚫 Error message:', error.message);
    }

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

        const endpoint = originalRequest.url || 'UNKNOWN';

        // Suppress verbose logging for endpoints that commonly have network issues
        // These are expected to fail when backend is unavailable
        const suppressVerboseLogging =
          endpoint.includes('/trading-signals/') ||
          endpoint.includes('/notifications/counts') ||
          endpoint.includes('/notifications/') ||
          endpoint.includes('/wallets/') ||
          endpoint.includes('/referral-info') ||
          endpoint.includes('/referral/my-tree') ||
          endpoint.includes('/referral/stats') ||
          endpoint.includes('/users/profile') ||
          endpoint.includes('/staking/dashboard') ||
          endpoint.includes('/dashboard/overview');

        // Only log detailed errors in development and for non-suppressed endpoints
        // Skip logging if error object is empty or just network errors
        const shouldLogDetailed =
          process.env.NODE_ENV === 'development' &&
          !suppressVerboseLogging &&
          error.message &&
          error.message !== 'Network Error';

        if (shouldLogDetailed) {
          const networkErrorDetails = {
            requestURL: String(requestURL),
            baseURL: String(API_BASE_URL),
            endpoint: String(endpoint),
            envVar: String(process.env.NEXT_PUBLIC_API_URL || 'NOT SET'),
            errorMessage: String(error.message || 'Unknown network error'),
            errorCode: String(error.code || 'UNKNOWN'),
            method: String(originalRequest.method || 'UNKNOWN'),
            errorType: error.constructor?.name || 'Unknown',
          };

          try {
            const errorDetailsStr = JSON.stringify(
              networkErrorDetails,
              null,
              2
            );
            console.error(
              '[API] ❌ Network/CORS Error Details:',
              errorDetailsStr
            );
          } catch {
            // Fallback logging
            console.error(
              '[API] ❌ Network/CORS Error Details:',
              networkErrorDetails
            );
          }
        } else if (
          process.env.NODE_ENV === 'development' &&
          suppressVerboseLogging
        ) {
          // Minimal logging for suppressed endpoints - only log once per session
          const logKey = `network_error_${endpoint}`;
          if (!sessionStorage.getItem(logKey)) {
            console.debug(
              `[API] Network error for ${endpoint} (backend may be unavailable)`
            );
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(logKey, 'true');
            }
          }
        }

        // Try to diagnose the issue
        let diagnosticMessage = `Unable to connect to the server at ${requestURL}.`;

        // Check if backend might be down
        if (API_BASE_URL.includes('onrender.com')) {
          diagnosticMessage += '\n\nPossible causes:\n';
          diagnosticMessage +=
            '1. Backend server might be sleeping (Render free tier - wait 30-60 seconds)\n';
          diagnosticMessage +=
            '2. Backend server might be down or restarting\n';
          diagnosticMessage += '3. CORS not configured on backend\n';
          diagnosticMessage += '4. Network connectivity issue\n\n';
          diagnosticMessage += 'Try:\n';
          diagnosticMessage +=
            '- Visit https://novunt-backend-uw3z.onrender.com in your browser to wake up the server\n';
          diagnosticMessage += '- Wait 30-60 seconds if backend was sleeping\n';
          diagnosticMessage +=
            '- Check browser DevTools Network tab for CORS errors\n';
          diagnosticMessage +=
            '- Verify NEXT_PUBLIC_API_URL in .env.local is set correctly\n';
          diagnosticMessage +=
            '- Check if backend CORS allows requests from your frontend origin';
        } else {
          diagnosticMessage += '\n\nPlease check:\n';
          diagnosticMessage +=
            '1. Backend server is running at ' + API_BASE_URL + '\n';
          diagnosticMessage += '2. CORS is configured correctly on backend\n';
          diagnosticMessage += '3. Network connectivity\n';
          diagnosticMessage +=
            '4. NEXT_PUBLIC_API_URL environment variable is set correctly';
        }

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
    const isPlaceholderResponse =
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

    // Handle 403 Forbidden - Security Compliance Required
    if (error.response?.status === 403) {
      const errorData = error.response.data as any;
      if (errorData?.code === 'SECURITY_COMPLIANCE_REQUIRED') {
        if (typeof window !== 'undefined') {
          console.warn(
            '[API] Security compliance required, redirecting to onboarding...'
          );
          window.location.href = '/dashboard/onboarding';
        }
        return Promise.reject(error);
      }
    }

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
  // (success, data, count, page, totalPages, hasMore)
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

/**
 * Get API base URL only (no secrets). For internal use; do not expose tokens or config to window.
 */
export function getAPIBaseURLExport(): string {
  return getAPIBaseURL();
}
