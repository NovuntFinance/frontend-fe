import axios, { AxiosInstance, AxiosError } from 'axios';
import { adminAuthService } from './adminAuthService';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// 2FA Code Cache (valid for 85 seconds to match backend's ±2 time steps ~90-second window)
interface Cached2FA {
  code: string;
  expiresAt: number;
}

let cached2FA: Cached2FA | null = null;

// Create axios instance with interceptors
// Exported so other services (like adminSettingsService) can use it
export const createAdminApi = (
  get2FACode: () => Promise<string | null>
): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Request interceptor: Add auth token and 2FA code
  api.interceptors.request.use(
    async (config) => {
      const token = adminAuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[AdminService] Added admin token to Authorization header');
      } else {
        console.warn('[AdminService] No admin token found!');
      }

      // For admin endpoints (except login), add 2FA code
      // BUT ONLY if 2FA is actually enabled AND token doesn't have is2FAVerified flag
      if (config.url?.includes('/admin/') && !config.url.includes('/login')) {
        const token = adminAuthService.getToken();

        // Check if token has is2FAVerified flag (from new backend behavior)
        let is2FAVerified = false;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            is2FAVerified = payload.is2FAVerified === true;
            console.log('[AdminService] Token is2FAVerified:', is2FAVerified);

            // If token doesn't have is2FAVerified flag, show warning
            if (!is2FAVerified) {
              console.warn('[AdminService] ⚠️ OLD TOKEN DETECTED!');
              console.warn(
                '[AdminService] Your token was issued before the 2FA update.'
              );
              console.warn(
                '[AdminService] Please LOG OUT and LOG BACK IN with your 2FA code to get a new token.'
              );
              console.warn(
                "[AdminService] With the new token, you won't need 2FA for viewing pages, only for editing."
              );
            }
          } catch (error) {
            console.error('[AdminService] Failed to decode token:', error);
          }
        }

        // If token has is2FAVerified flag, skip 2FA requirement for GET requests
        if (is2FAVerified && config.method?.toUpperCase() === 'GET') {
          console.log(
            '[AdminService] ✅ Token has is2FAVerified flag, skipping 2FA for GET request'
          );
          return config;
        }

        // Check if 2FA is enabled for the current admin
        const admin = adminAuthService.getCurrentAdmin();
        const is2FAEnabled = admin?.twoFAEnabled === true;

        if (!is2FAEnabled) {
          // 2FA is not enabled - clear any cached code and skip 2FA requirement
          cached2FA = null;
          console.log(
            '[AdminService] 2FA is not enabled, skipping 2FA requirement'
          );
          return config;
        }

        // 2FA is enabled - proceed with 2FA code handling
        // Check cache first
        let twoFACode: string | null = null;

        if (cached2FA && Date.now() < cached2FA.expiresAt) {
          twoFACode = cached2FA.code;
          console.log(
            '[AdminService] Using cached 2FA code:',
            twoFACode.substring(0, 2) + '****'
          );
        } else {
          // Get fresh 2FA code
          console.log('[AdminService] Checking if 2FA code is needed...');
          try {
            // Call the getter - if it returns null, don't prompt (for GET requests)
            const code = await get2FACode();

            // Only proceed if a code was actually provided (not null)
            if (code && code.trim().length > 0) {
              twoFACode = code.trim();
              // Cache for 85 seconds (matches backend's ±2 time steps ~90-second window)
              cached2FA = {
                code: twoFACode,
                expiresAt: Date.now() + 85 * 1000,
              };
              console.log(
                '[AdminService] Cached new 2FA code (valid for 85 seconds)'
              );
            } else if (code === null) {
              // Getter returned null intentionally (GET request, no 2FA needed)
              console.log(
                '[AdminService] 2FA code not required for this request (GET operation)'
              );
              twoFACode = null;
            } else {
              // Empty string or undefined - user cancelled
              console.warn(
                '[AdminService] No 2FA code provided by user (user cancelled or empty code)'
              );
              twoFACode = null;
            }
          } catch (error) {
            console.error('[AdminService] Error getting 2FA code:', error);
            twoFACode = null;
            // Don't throw - let the request proceed and backend will return 403 if needed
          }
        }

        if (twoFACode) {
          const method = config.method?.toUpperCase();

          if (method === 'GET') {
            // For GET requests, add to query parameters
            config.params = config.params || {};
            config.params.twoFACode = twoFACode;
            const fullUrl = `${config.baseURL}${config.url}?${new URLSearchParams(config.params as Record<string, string>).toString()}`;
            console.log(
              '[AdminService] GET request with 2FA code in query params:',
              {
                url: config.url,
                hasToken: !!token,
                has2FACode: true,
                fullUrl: fullUrl.substring(0, 100) + '...',
              }
            );
          } else if (['POST', 'PUT', 'PATCH'].includes(method || '')) {
            // For POST/PUT/PATCH, add to request body
            if (config.data && typeof config.data === 'object') {
              config.data.twoFACode = twoFACode;
              console.log(
                '[AdminService] Added 2FA code to request body for',
                method,
                {
                  url: config.url,
                  hasToken: !!token,
                  has2FACode: true,
                }
              );
            } else {
              // If no body, create one
              config.data = { twoFACode };
              console.log(
                '[AdminService] Created request body with 2FA code for',
                method
              );
            }
          }
        } else {
          // 2FA is required but code is not available
          // This will cause the request to fail with 403, which is handled by the response interceptor
          console.warn(
            '[AdminService] ⚠️ 2FA code required but not available for:',
            config.url
          );
          console.warn(
            '[AdminService] The request will proceed, but backend will return 403 if 2FA is required'
          );
          // Don't block the request - let it proceed and backend will return appropriate error
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 2FA errors
  api.interceptors.response.use(
    (response) => {
      // Keep cache on successful response (code was valid)
      if (cached2FA) {
        console.log('[AdminService] ✅ Request successful, 2FA code was valid');
      }
      return response;
    },
    async (error: AxiosError) => {
      const status = error.response?.status;
      const errorData = error.response?.data as any;
      const errorCode = errorData?.error?.code;
      const errorMessage = errorData?.error?.message || errorData?.message;

      console.error('[AdminService] ❌ Request failed:', {
        status,
        url: error.config?.url,
        errorCode,
        errorMessage,
        hasToken: !!adminAuthService.getToken(),
        hasCached2FA: !!cached2FA,
      });

      if (status === 403) {
        if (
          errorCode === '2FA_MANDATORY' ||
          errorCode === '2FA_SETUP_INCOMPLETE'
        ) {
          // Clear cache and redirect to 2FA setup
          console.log('[AdminService] 2FA not enabled, redirecting to setup');
          cached2FA = null;
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/setup-2fa';
          }
        } else if (errorCode === '2FA_CODE_INVALID') {
          // Clear cache on invalid code - user needs to enter new code
          console.error(
            '[AdminService] ❌ 2FA code invalid, clearing cache. Please enter a fresh code.'
          );
          cached2FA = null;
          // The error will be thrown and handled by the component
        } else if (errorCode === '2FA_CODE_REQUIRED') {
          // Clear cache and let component handle retry
          console.error(
            '[AdminService] ❌ 2FA code required but not provided, clearing cache'
          );
          console.error(
            '[AdminService] This usually means the 2FA modal was cancelled or not shown'
          );
          console.error(
            '[AdminService] The request will need to be retried manually by the user'
          );
          cached2FA = null;
          // Note: We can't automatically retry here because we don't have access to get2FACode
          // The component should handle retry by calling the mutation again
        } else {
          // Other 403 errors
          console.error('[AdminService] ❌ 403 Forbidden:', {
            errorCode,
            errorMessage,
            url: error.config?.url,
          });
        }
      } else if (status === 401) {
        // Unauthorized - clear cache
        console.error(
          '[AdminService] ❌ 401 Unauthorized - admin token may be invalid or expired'
        );
        cached2FA = null;
      }

      return Promise.reject(error);
    }
  );

  return api;
};

class AdminService {
  private get2FACode: () => Promise<string | null>;

  constructor() {
    // Default: prompt for 2FA code
    this.get2FACode = async () => {
      return new Promise((resolve) => {
        const code = prompt('Enter 2FA code from your authenticator app:');
        resolve(code || null);
      });
    };
  }

  /**
   * Set custom 2FA code getter (e.g., from React context)
   */
  set2FACodeGetter(getter: () => Promise<string | null>): void {
    this.get2FACode = getter;
  }

  /**
   * Get the current 2FA code getter (for use by other services)
   */
  get2FACodeGetter(): (() => Promise<string | null>) | undefined {
    return this.get2FACode;
  }

  /**
   * Clear cached 2FA code (useful for logout or when code is invalid)
   */
  clearCached2FA(): void {
    cached2FA = null;
    console.log('[AdminService] Cleared cached 2FA code');
  }

  /**
   * Check if 2FA is enabled for current admin
   * This is used to conditionally require 2FA codes
   */
  is2FAEnabled(): boolean {
    const admin = adminAuthService.getCurrentAdmin();
    return admin?.twoFAEnabled === true;
  }

  /**
   * Get admin profile
   * GET /api/v1/admin/profile
   * Note: No 2FA required for read-only operations (after backend update)
   */
  async getProfile() {
    // For GET requests, don't prompt for 2FA - let backend handle it
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get('/admin/profile');
    return response.data;
  }

  /**
   * Update admin password
   * PATCH /api/v1/admin/password
   */
  async updatePassword(currentPassword: string, newPassword: string) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch('/admin/password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    });
    return response.data;
  }

  /**
   * Change user password
   * PATCH /api/v1/admin/users/:userId/password
   */
  async changeUserPassword(
    userId: string,
    newPassword: string,
    reason?: string
  ) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch(`/admin/users/${userId}/password`, {
      newPassword,
      reason,
    });
    return response.data;
  }

  /**
   * Get all users with balances
   * GET /api/v1/admin/users-balances
   * Note: No 2FA required for read-only operations (after backend update)
   */
  async getUsersWithBalances() {
    // For GET requests, don't prompt for 2FA - let backend handle it
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get('/admin/users-balances');
    return response.data;
  }

  /**
   * Get paginated list of users with filters
   * GET /api/v1/admin/users
   * Note: No 2FA required for read-only operations (after backend update)
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    rank?: string;
    hasActiveStakes?: boolean;
  }) {
    // For GET requests, don't prompt for 2FA - let backend handle it
    // After backend update, this endpoint won't require 2FA for viewing
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get('/admin/users', { params });
    return response.data;
  }

  /**
   * Create a new user
   * POST /api/v1/admin/users
   */
  async createUser(userData: {
    email: string;
    username: string;
    password: string;
    fname: string;
    lname: string;
    phoneNumber?: string;
    countryCode?: string;
    referralCode?: string;
  }) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  /**
   * Create a new admin (super admin only)
   * POST /api/v1/admin/admins
   */
  async createAdmin(adminData: {
    email: string;
    username: string;
    password: string;
    fname: string;
    lname: string;
    role: 'admin' | 'superAdmin';
    phoneNumber?: string;
    permissions?: string[]; // Optional array of permission keys
  }) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post('/admin/admins', adminData);
    return response.data;
  }

  /**
   * Update user status (suspend/activate)
   * PATCH /api/v1/admin/users/:userId/status
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'inactive'
  ) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data;
  }

  /**
   * Get user by ID
   * GET /api/v1/admin/users/:userId
   * Note: No 2FA required for read-only operations (after backend update)
   */
  async getUserById(userId: string) {
    // For GET requests, don't prompt for 2FA - let backend handle it
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  /**
   * Approve withdrawal
   * PATCH /api/v1/admin/withdrawal/:transactionId
   */
  async approveWithdrawal(
    transactionId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch(`/admin/withdrawal/${transactionId}`, {
      status,
      reason,
    });
    return response.data;
  }

  /**
   * Get all transactions
   * GET /api/v1/admin/transactions
   * Note: No 2FA required for read-only operations (after backend update)
   */
  async getTransactions(page = 1, limit = 20) {
    // For GET requests, don't prompt for 2FA - let backend handle it
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get('/admin/transactions', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get admin dashboard metrics
   * GET /api/v1/admin/ui/dashboard
   * Note: No 2FA required for read-only operations (after backend update)
   *
   * Backend Fix: Endpoint is now implemented and returns correct structure
   * Response includes: metrics, charts, recentActivity, timeframe, lastUpdated
   */
  async getDashboardMetrics(timeframe: string = '30d') {
    // For GET requests, don't prompt for 2FA - let backend handle it
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);

    // Backend has fixed the endpoint - use /admin/ui/dashboard directly
    const response = await api.get('/admin/ui/dashboard', {
      params: { timeframe },
    });
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
