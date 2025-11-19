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
  
  // Validate and return
  if (envURL) {
    // Ensure it doesn't end with /api/v1 if it's already included
    const baseURL = envURL.trim();
    
    // Log at initialization
    if (typeof window !== 'undefined') {
      console.log('🔧 API Base URL:', baseURL);
      console.log('🔧 Environment:', process.env.NODE_ENV);
      console.log('🔧 NEXT_PUBLIC_API_URL:', envURL || 'NOT SET');
      
      // Make it accessible globally for debugging
      (window as any).__NOVUNT_API_URL__ = baseURL;
      (window as any).__NOVUNT_ENV_VAR__ = envURL;
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[API Client] Backend URL:', baseURL);
      console.log('[API Client] Environment Variable:', envURL);
    }
    
    return baseURL;
  }
  
  // Fallback based on environment (should not be needed if .env.local is set)
  const fallback = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/v1'
    : 'https://novunt-backend-uw3z.onrender.com/api/v1';
  
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set! Using fallback:', fallback);
  console.warn('⚠️ Please set NEXT_PUBLIC_API_URL in .env.local');
  
  if (typeof window !== 'undefined') {
    (window as any).__NOVUNT_API_URL__ = fallback;
    (window as any).__NOVUNT_ENV_VAR__ = 'NOT SET (using fallback)';
  }
  
  return fallback;
};

const API_BASE_URL = getAPIBaseURL();

// Create axios instance with default config aligned with BetterAuth specification
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
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
            console.log('[tokenManager] Migrated legacy authToken -> accessToken');
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
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Interceptor] === TOKEN RETRIEVAL DEBUG ===');
      console.log('[API Interceptor] Request URL:', config.url);
      
      // Debug: Check ALL auth-related items in localStorage
      if (typeof window !== 'undefined') {
        const lsToken = localStorage.getItem('accessToken');
        const lsRefresh = localStorage.getItem('refreshToken');
        const zustandData = localStorage.getItem('novunt-auth-storage');
        console.log('[API Interceptor] localStorage.accessToken:', lsToken ? lsToken.substring(0, 30) + '...' : 'NULL');
        console.log('[API Interceptor] localStorage.refreshToken:', lsRefresh ? 'EXISTS' : 'NULL');
        console.log('[API Interceptor] localStorage.novunt-auth-storage:', zustandData ? 'EXISTS' : 'NULL');
        if (zustandData) {
          try {
            const parsed = JSON.parse(zustandData);
            console.log('[API Interceptor] Zustand state.token:', parsed.state?.token ? parsed.state.token.substring(0, 30) + '...' : 'NULL');
          } catch {
            console.error('[API Interceptor] Failed to parse Zustand data');
          }
        }
      }
    }
    
    // Try tokenManager first (direct localStorage keys)
    let token = tokenManager.getToken();
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Interceptor] tokenManager.getToken() returned:', token ? token.substring(0, 30) + '...' : 'NULL');
    }
    
    // If not found, try reading from Zustand persist storage
    if (!token && typeof window !== 'undefined') {
      try {
        const persistedAuth = localStorage.getItem('novunt-auth-storage');
        if (persistedAuth) {
          const parsed = JSON.parse(persistedAuth);
          token = parsed.state?.token || null;
          if (process.env.NODE_ENV === 'development') {
            console.log('[API Interceptor] Zustand persist token:', token ? token.substring(0, 20) + '...' : 'NULL');
          }
        }
      } catch (readError) {
        console.warn('[API] Failed to read token from persisted store', readError);
      }
    }

    // Ensure headers object exists
    if (!config.headers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any).headers = {};
    }

    // Attach Authorization header when token is available
    if (token) {
      try {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        // Always log auth status for profile updates (critical for debugging)
        if (config.url?.includes('/users/profile')) {
          const header = (config.headers as Record<string, string>).Authorization;
          console.log('[API Interceptor] ✅ Auth token attached for profile update:', header?.substring(0, 30) + '...');
        } else if (process.env.NODE_ENV === 'development') {
          const header = (config.headers as Record<string, string>).Authorization;
          console.log('[API Interceptor] Authorization header:', header?.substring(0, 30) + '...');
        }
      } catch (attachErr) {
          console.warn('[API] Failed to attach Authorization header', attachErr);
      }
    } else {
      // Always warn for profile updates if no token
      if (config.url?.includes('/users/profile')) {
        console.error('[API Interceptor] ❌ NO TOKEN FOUND for profile update! Request will fail.');
        console.error('[API Interceptor] Check localStorage for accessToken or novunt-auth-storage');
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('[API Interceptor] ⚠️ NO TOKEN FOUND - Request will be sent without auth!');
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        hasAuth: !!token,
      });
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
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        statusText: response.statusText,
        success: response.data?.success,
        hasData: 'data' in (response.data || {}),
        hasWallet: 'wallet' in (response.data || {}),
        dataKeys: response.data ? Object.keys(response.data) : [],
        fullData: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - Invalid/expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[API] 401 Unauthorized - Token invalid or expired');
      
      // Don't try to refresh if this IS the refresh endpoint
      if (originalRequest.url?.includes('/refresh-token')) {
        console.log('[API] Refresh token failed, clearing all auth data');
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
          response = await axios.post(`${getAPIBaseURL()}/better-auth/refresh-token`, {
            refreshToken,
          }, {
            withCredentials: true,
          });
          
          const responseData = response.data.data || response.data;
          newToken = responseData.accessToken || responseData.token;
          newRefreshToken = responseData.refreshToken || refreshToken;
        } catch (betterAuthError) {
          // Fallback: try standard auth refresh endpoint
          console.log('[API] BetterAuth refresh failed, trying standard endpoint...');
          try {
            response = await axios.post(`${getAPIBaseURL()}/auth/refresh`, {
          refreshToken,
        }, {
              withCredentials: true,
            });
            
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
        
        // Clear all auth data
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/authStore');
          const store = useAuthStore.getState();
          store.clearAuth();
          
          // Redirect to login with error message
          const errorMessage = refreshError?.response?.data?.message || 'Session expired';
          window.location.href = `/login?error=session_expired&message=${encodeURIComponent(errorMessage)}`;
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other errors
    // Log raw error for debugging (skip 404s as they're normal for new users)
    if (process.env.NODE_ENV === 'development' && error.response?.status !== 404) {
      // Better error serialization with proper JSON stringification
      const errorInfo: Record<string, unknown> = {
        status: error.response?.status ?? null,
        statusText: error.response?.statusText ?? null,
        statusCode: error.response?.status ?? null,
        errorMessage: error.message ?? 'Unknown error',
        hasResponse: !!error.response,
        isAxiosError: error.isAxiosError ?? false,
        code: error.code ?? null,
      };

      // Safely extract response data
      if (error.response?.data) {
        try {
          // Try to serialize response data
          const responseDataStr = JSON.stringify(error.response.data, null, 2);
          errorInfo.responseData = responseDataStr;
          errorInfo.responseMessage = typeof error.response.data === 'object' && error.response.data !== null
            ? (error.response.data as any).message || (error.response.data as any).error || 'No message'
            : String(error.response.data);
        } catch (e) {
          errorInfo.responseDataError = 'Failed to serialize response data';
          errorInfo.responseDataType = typeof error.response.data;
        }
      }

      // Log request details
      errorInfo.requestMethod = originalRequest.method ?? 'UNKNOWN';
      errorInfo.requestUrl = originalRequest.url ?? 'UNKNOWN';
      if (originalRequest.data) {
        try {
          const requestData = originalRequest.data;
          // Handle different data types
          if (typeof requestData === 'string') {
            // If it's already a string, try to parse it first
            try {
              const parsed = JSON.parse(requestData);
              errorInfo.requestPayload = JSON.stringify({
                ...parsed,
                password: parsed.password ? '***' : undefined,
                confirmPassword: parsed.confirmPassword ? '***' : undefined,
              }, null, 2);
            } catch {
              // If parsing fails, it's already a string - just mask passwords
              errorInfo.requestPayload = requestData.replace(/"password"\s*:\s*"[^"]*"/gi, '"password":"***"')
                .replace(/"confirmPassword"\s*:\s*"[^"]*"/gi, '"confirmPassword":"***"');
            }
          } else if (typeof requestData === 'object' && requestData !== null) {
            // If it's an object, stringify it properly
            errorInfo.requestPayload = JSON.stringify({
              ...(requestData as any),
              password: (requestData as any).password ? '***' : undefined,
              confirmPassword: (requestData as any).confirmPassword ? '***' : undefined,
            }, null, 2);
          } else {
            errorInfo.requestPayload = String(requestData);
          }
        } catch (e) {
          errorInfo.requestPayloadError = `Failed to serialize request data: ${e instanceof Error ? e.message : 'Unknown error'}`;
          errorInfo.requestPayloadRaw = String(originalRequest.data).substring(0, 200);
        }
      }

      // Log error with proper serialization
      try {
        const errorInfoStr = JSON.stringify(errorInfo, null, 2);
        console.error(`❌ [API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, errorInfoStr);
      } catch (e) {
        // Fallback if JSON.stringify fails
        console.error(`❌ [API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
          status: error.response?.status,
          message: error.message,
          code: error.code,
        });
      }
      
      // Special logging for 400 validation errors
      if (error.response?.status === 400) {
        console.error('🔴 [400 VALIDATION ERROR]', {
          url: originalRequest.url,
          method: originalRequest.method,
          requestPayload: originalRequest.data,
          responseData: error.response?.data,
          validationErrors: error.response?.data?.errors || error.response?.data?.validationErrors,
          message: error.response?.data?.message || error.response?.data?.error?.message,
          fullResponse: JSON.stringify(error.response?.data, null, 2),
        });
      }
      
      // Special logging for 401/404 errors (common for profile updates)
      if (error.response?.status === 401 || error.response?.status === 404) {
        const authHeader = originalRequest.headers?.Authorization;
        const isProfileUpdate = originalRequest.url?.includes('/users/profile');
        
        console.error(`🔐 [${error.response.status} ${error.response.status === 401 ? 'UNAUTHORIZED' : 'NOT FOUND'}]`, {
          url: originalRequest.url,
          isProfileUpdate,
          tokenSent: !!authHeader,
          authHeader: authHeader && typeof authHeader === 'string' ? 
            authHeader.substring(0, 30) + '...' : 'NONE',
          responseData: error.response?.data,
          responseText: error.response?.statusText,
          message: error.response?.data?.message || 'No error message',
        });
        
        // Check token in localStorage and decode it to see user ID
        if (typeof window !== 'undefined' && isProfileUpdate) {
          const lsToken = localStorage.getItem('accessToken');
          const zustandData = localStorage.getItem('novunt-auth-storage');
          
          // Try to decode token to see user ID (if it's a JWT)
          let userIdFromToken = null;
          if (lsToken) {
            try {
              const parts = lsToken.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                userIdFromToken = payload.userId || payload._id || payload.id || payload.sub;
              }
            } catch (e) {
              // Not a JWT or can't decode
            }
          }
          
          console.error('[API] Token check:', {
            localStorage_accessToken: lsToken ? 'EXISTS' : 'MISSING',
            localStorage_novunt_auth_storage: zustandData ? 'EXISTS' : 'MISSING',
            userIdFromToken: userIdFromToken || 'NOT FOUND IN TOKEN',
            tokenPreview: lsToken ? lsToken.substring(0, 50) + '...' : 'NONE',
          });
        }
      }
      
      // Special logging for empty responses
      if (error.response?.status && !error.response?.data) {
        console.warn(`⚠️ [API] Empty response body with status ${error.response.status}`);
      }
      
      // Log the actual error from backend if available
      if (error.response?.data) {
        const backendError = error.response.data;
        const errorKeys = typeof backendError === 'object' && backendError !== null
          ? Object.keys(backendError)
          : [];
        
        // Extract all key-value pairs from error object
        const errorDetails: Record<string, unknown> = {
          message: typeof backendError === 'object' && backendError !== null
            ? (backendError as any).message
            : String(backendError),
          type: typeof backendError,
          keys: errorKeys,
        };
        
        // Extract all properties from the error object
        if (typeof backendError === 'object' && backendError !== null) {
          errorKeys.forEach(key => {
            try {
              errorDetails[key] = (backendError as any)[key];
            } catch (e) {
              errorDetails[key] = '[Unable to serialize]';
            }
          });
        }
        
        console.error('Backend error details:', errorDetails);
        console.error('Backend error raw object:', JSON.stringify(backendError, null, 2));
      }
    }
    
    // Log 404s as info instead of error
    if (process.env.NODE_ENV === 'development' && error.response?.status === 404) {
      console.log(`ℹ️ [API 404] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - ${error.response?.data?.message || 'Not found'} (This is normal for new users)`);
    }
    
    // Check for placeholder/unimplemented endpoint
    if (process.env.NODE_ENV === 'development') {
      const message = error.response?.data?.message || '';
      if (typeof message === 'string' && message.includes('Novunt API is running')) {
        console.warn('⚠️ Backend endpoint not yet implemented:', originalRequest.url);
      }
    }
    
      // Handle CORS errors (network errors with no response)
    // Check for CORS/network errors - detect Failed to fetch specifically
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('🚫 CORS or network error detected:', error);
      console.error('🚫 Error type: TypeError');
      console.error('🚫 Error message:', error.message);
    }
    
    if (!error.response && error.message) {
      const isCorsError = error.message.includes('Network Error') || 
                          error.code === 'ERR_NETWORK' ||
                          error.message.includes('CORS') ||
                          (error instanceof TypeError && error.message.includes('Failed to fetch'));
      
      if (isCorsError) {
        const requestURL = originalRequest.url 
          ? `${API_BASE_URL}${originalRequest.url}` 
          : 'Unknown URL';
        
        // Serialize network error details properly
        const networkErrorDetails = {
          requestURL: String(requestURL),
          baseURL: String(API_BASE_URL),
          endpoint: String(originalRequest.url || 'UNKNOWN'),
          envVar: String(process.env.NEXT_PUBLIC_API_URL || 'NOT SET'),
          errorMessage: String(error.message || 'Unknown network error'),
          errorCode: String(error.code || 'UNKNOWN'),
          method: String(originalRequest.method || 'UNKNOWN'),
          errorType: error.constructor?.name || 'Unknown',
          errorStack: error.stack ? error.stack.substring(0, 200) : 'No stack trace',
        };
        
        try {
          const errorDetailsStr = JSON.stringify(networkErrorDetails, null, 2);
          console.error('[API] ❌ Network/CORS Error Details:', errorDetailsStr);
        } catch (e) {
          // Fallback logging
          console.error('[API] ❌ Network/CORS Error Details:', networkErrorDetails);
        }
        
        // Log diagnostic information
        console.error('🔍 [API] CORS/Network Error Diagnostic:');
        console.error('🔍 Base URL:', API_BASE_URL);
        console.error('🔍 Endpoint:', originalRequest.url);
        console.error('🔍 Full URL:', requestURL);
        console.error('🔍 Environment Variable:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET');
        console.error('🔍 Error Code:', error.code);
        console.error('🔍 Error Message:', error.message);
        
        // Try to diagnose the issue
        let diagnosticMessage = `Unable to connect to the server at ${requestURL}.`;
        
        // Check if backend might be down
        if (API_BASE_URL.includes('onrender.com')) {
          diagnosticMessage += '\n\nPossible causes:\n';
          diagnosticMessage += '1. Backend server might be sleeping (Render free tier - wait 30-60 seconds)\n';
          diagnosticMessage += '2. Backend server might be down or restarting\n';
          diagnosticMessage += '3. CORS not configured on backend\n';
          diagnosticMessage += '4. Network connectivity issue\n\n';
          diagnosticMessage += 'Try:\n';
          diagnosticMessage += '- Visit https://novunt-backend-uw3z.onrender.com in your browser to wake up the server\n';
          diagnosticMessage += '- Wait 30-60 seconds if backend was sleeping\n';
          diagnosticMessage += '- Check browser DevTools Network tab for CORS errors\n';
          diagnosticMessage += '- Verify NEXT_PUBLIC_API_URL in .env.local is set correctly\n';
          diagnosticMessage += '- Check if backend CORS allows requests from your frontend origin';
        } else {
          diagnosticMessage += '\n\nPlease check:\n';
          diagnosticMessage += '1. Backend server is running at ' + API_BASE_URL + '\n';
          diagnosticMessage += '2. CORS is configured correctly on backend\n';
          diagnosticMessage += '3. Network connectivity\n';
          diagnosticMessage += '4. NEXT_PUBLIC_API_URL environment variable is set correctly';
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
    const isPlaceholderResponse = typeof backendMessage === 'string' && backendMessage.includes('Novunt API is running');
    
    // Preserve backend error response fields for better error handling
    const backendData = error.response?.data as Record<string, unknown> | undefined;
    const errorResponse: ApiError = {
      success: false,
      message: isPlaceholderResponse 
        ? 'This feature is currently under development. Please try again later.' 
        : ((backendData?.message as string) || error.message || 'An unexpected error occurred'),
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

  // Debug logging for registration requests (always log in browser for debugging)
  const fullURL = `${API_BASE_URL}${url}`;
  if (url.includes('/better-auth/register') || url.includes('/better-auth/complete-registration')) {
    console.log('[apiRequest] === REGISTRATION REQUEST DEBUG ===');
    console.log('[apiRequest] Full URL:', fullURL);
    console.log('[apiRequest] Base URL:', API_BASE_URL);
    console.log('[apiRequest] Endpoint:', url);
    console.log('[apiRequest] Method:', method);
    console.log('[apiRequest] Environment Variable:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using fallback)');
    console.log('[apiRequest] Request payload:', {
      ...(data as any),
      password: data && typeof data === 'object' && 'password' in data ? '***' : undefined,
      confirmPassword: data && typeof data === 'object' && 'confirmPassword' in data ? '***' : undefined,
    });
    if (data && typeof data === 'object') {
      const payload = data as Record<string, unknown>;
      console.log('[apiRequest] Payload fields check:', {
        hasFirstName: !!(payload.firstName || (payload as any).fname) && ((payload.firstName || (payload as any).fname) as string).length > 0,
        hasLastName: !!(payload.lastName || (payload as any).lname) && ((payload.lastName || (payload as any).lname) as string).length > 0,
        hasEmail: !!payload.email,
        hasUsername: !!payload.username,
        hasPassword: !!payload.password,
        hasConfirmPassword: !!payload.confirmPassword,
        hasPhoneNumber: !!payload.phoneNumber,
        hasCountryCode: !!payload.countryCode,
        firstNameValue: payload.firstName || (payload as any).fname,
        lastNameValue: payload.lastName || (payload as any).lname,
        emailValue: payload.email,
        usernameValue: payload.username,
        phoneNumberValue: payload.phoneNumber,
        countryCodeValue: payload.countryCode,
      });
    }
  }

  const response = await apiClient.request<ApiResponse<T> | T>(requestConfig);

  const responseData = response.data as ApiResponse<T> | T;

  // CRITICAL DEBUG: Log the exact response structure for login endpoint
  if (url.includes('/login') || url.includes('/verify-mfa')) {
    console.log('[apiRequest] === AUTH RESPONSE DEBUG ===');
    console.log('[apiRequest] URL:', url);
    console.log('[apiRequest] Full axios response.data:', responseData);
    console.log('[apiRequest] Response type:', typeof responseData);
    console.log('[apiRequest] Has "data" property?', responseData && typeof responseData === 'object' && 'data' in responseData);
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      console.log('[apiRequest] Nested data value:', (responseData as ApiResponse<T>).data);
    }
  }

  if (
    typeof responseData === 'object' &&
    responseData !== null &&
    'data' in responseData &&
    (responseData as ApiResponse<T>).data !== undefined
  ) {
    const unwrappedData = (responseData as ApiResponse<T>).data;
    if (url.includes('/login') || url.includes('/verify-mfa')) {
      console.log('[apiRequest] Unwrapping data, returning:', unwrappedData);
    }
    return unwrappedData;
  }

  if (url.includes('/login') || url.includes('/verify-mfa')) {
    console.log('[apiRequest] NOT unwrapping, returning responseData as-is');
  }
  return responseData as T;
}

// Convenience methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => apiRequest<T>('get', url, undefined, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiRequest<T>('post', url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiRequest<T>('put', url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiRequest<T>('patch', url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => apiRequest<T>('delete', url, undefined, config),
};

export default apiClient;

// ============================================
// DEBUGGING UTILITIES
// ============================================

/**
 * Get current API configuration for debugging
 * Can be called from browser console: window.checkApiConfig()
 */
export const getApiConfig = () => {
  return {
    baseURL: API_BASE_URL,
    envVar: process.env.NEXT_PUBLIC_API_URL || 'NOT SET (using fallback)',
    isUsingFallback: !process.env.NEXT_PUBLIC_API_URL,
    fullRegisterURL: `${API_BASE_URL}/better-auth/register`,
  };
};

// Make it globally accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).checkApiConfig = getApiConfig;
  (window as any).getApiConfig = getApiConfig;
}
