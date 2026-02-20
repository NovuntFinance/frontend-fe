import axios, { AxiosInstance, AxiosError } from 'axios';
import { adminAuthService } from './adminAuthService';
import { getIs2FAVerifiedFromToken, shouldRequire2FA } from '@/lib/twofa';
import { getApiV1BaseUrl } from '@/lib/admin-api-base';

const API_BASE_URL = getApiV1BaseUrl();

// 2FA Code Cache (valid for 85 seconds to match backend's ±2 time steps ~90-second window)
interface Cached2FA {
  code: string;
  expiresAt: number;
}

let cached2FA: Cached2FA | null = null;

type RetriableAxiosConfig = any & { _retry2FA?: boolean };

function attach2FACodeToConfig(config: any, twoFACode: string) {
  const method = config.method?.toUpperCase?.() || '';

  if (method === 'GET') {
    // For GET requests, add to query parameters (CORS-safe)
    config.params = config.params || {};
    config.params.twoFACode = twoFACode;
    return;
  }

  // For write operations, add to request body
  if (config.data && typeof config.data === 'object') {
    config.data.twoFACode = twoFACode;
  } else if (config.data == null) {
    config.data = { twoFACode };
  } else {
    // Fallback: wrap primitive/string payload
    config.data = { value: config.data, twoFACode };
  }
}

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

      // For admin endpoints (except login), add 2FA code ONLY when required
      // (write operations, sensitive GETs, or when backend explicitly demands it).
      if (config.url?.includes('/admin/') && !config.url.includes('/login')) {
        const is2FAVerified = getIs2FAVerifiedFromToken(token);

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

        const requires2FA = shouldRequire2FA({
          method: config.method,
          url: config.url,
          is2FAVerified,
        });

        // Never prompt / prefetch for normal GET navigation pages
        if (!requires2FA) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[AdminService] 2FA not required for this request:',
              config.method?.toUpperCase(),
              config.url
            );
          }
          return config;
        }

        // 2FA is required - proceed with code handling
        // First check if twoFACode is already in the request (body or params)
        const method = config.method?.toUpperCase?.() || '';
        const existingCodeInBody =
          method !== 'GET' &&
          config.data &&
          typeof config.data === 'object' &&
          config.data.twoFACode &&
          typeof config.data.twoFACode === 'string' &&
          config.data.twoFACode.trim().length > 0;
        const existingCodeInParams =
          method === 'GET' &&
          config.params &&
          config.params.twoFACode &&
          typeof config.params.twoFACode === 'string' &&
          config.params.twoFACode.trim().length > 0;
        const existingCodeInHeader =
          config.headers &&
          (config.headers['X-2FA-Code'] || config.headers['x-2fa-code']);

        // If 2FA code is already provided in the request, use it (don't prompt again)
        if (
          existingCodeInBody ||
          existingCodeInParams ||
          existingCodeInHeader
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[AdminService] 2FA code already provided in request, using it'
            );
          }
          return config; // Use the existing code, don't overwrite
        }

        // No code in request - check cache first
        let twoFACode: string | null = null;

        if (cached2FA && Date.now() < cached2FA.expiresAt) {
          twoFACode = cached2FA.code;
          console.log(
            '[AdminService] Using cached 2FA code:',
            twoFACode.substring(0, 2) + '****'
          );
        } else {
          // Get fresh 2FA code (this is the ONLY place we should ever trigger the modal proactively)
          // and it should only happen for write operations or sensitive GET endpoints.
          console.log('[AdminService] 2FA required, requesting code...');
          try {
            const code = await get2FACode();

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
            } else {
              console.warn(
                '[AdminService] No 2FA code provided by user (user cancelled or empty code)'
              );
              twoFACode = null;
            }
          } catch (error) {
            console.error('[AdminService] Error getting 2FA code:', error);
            twoFACode = null;
          }
        }

        if (!twoFACode) {
          // Operation requires 2FA and user didn't provide it; do not send request
          return Promise.reject(new Error('2FA_CODE_REQUIRED'));
        }

        attach2FACodeToConfig(config, twoFACode);
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
      const originalRequest = error.config as RetriableAxiosConfig;

      // Avoid triggering the Next.js dev overlay with console.error spam.
      // Keep detailed logs in production (where they matter most).
      const logPayload = {
        status,
        url: error.config?.url,
        errorCode,
        errorMessage,
        hasToken: !!adminAuthService.getToken(),
        hasCached2FA: !!cached2FA,
      };
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AdminService] Request failed:', logPayload);
      } else {
        console.error('[AdminService] ❌ Request failed:', logPayload);
      }

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
          // Clear cache and retry once after prompting (only after backend explicitly demands it)
          cached2FA = null;

          if (originalRequest && !originalRequest._retry2FA) {
            originalRequest._retry2FA = true;
            try {
              const code = await get2FACode();
              if (!code || !code.trim()) {
                return Promise.reject(error);
              }

              const twoFACode = code.trim();
              cached2FA = {
                code: twoFACode,
                expiresAt: Date.now() + 85 * 1000,
              };

              attach2FACodeToConfig(originalRequest, twoFACode);
              return api(originalRequest);
            } catch {
              return Promise.reject(error);
            }
          }
        } else {
          // Other 403 errors
          console.error('[AdminService] ❌ 403 Forbidden:', {
            errorCode,
            errorMessage,
            url: error.config?.url,
          });
        }
      } else if (status === 401) {
        // Unauthorized - session expired or invalid token
        console.error(
          '[AdminService] ❌ 401 Unauthorized - redirecting to login'
        );
        cached2FA = null;

        // Clear auth data and redirect if in browser
        adminAuthService.logout().then(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login?expired=true';
          }
        });
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
    status?: 'active' | 'suspended' | 'inactive';
    role?: string;
    rank?: string;
    hasActiveStakes?: boolean;
    createdFrom?: string;
    createdTo?: string;
    sortBy?:
      | 'createdAt'
      | 'lastLoginAt'
      | 'totalStaked'
      | 'walletFundedBalance'
      | 'walletEarningsBalance'
      | 'totalDeposited'
      | 'totalWithdrawn';
    sortOrder?: 'asc' | 'desc';
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
    status: 'active' | 'suspended' | 'inactive',
    reason: string
  ) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch(`/admin/users/${userId}/status`, {
      status,
      reason,
    });
    return response.data;
  }

  /**
   * Force logout a user (revoke sessions)
   * POST /api/v1/admin/users/:userId/force-logout
   */
  async forceLogoutUser(userId: string, reason: string) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post(`/admin/users/${userId}/force-logout`, {
      reason,
    });
    return response.data;
  }

  /**
   * Change a user's role
   * PATCH /api/v1/admin/users/:userId/role
   */
  async changeUserRole(userId: string, role: string, reason: string) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch(`/admin/users/${userId}/role`, {
      role,
      reason,
    });
    return response.data;
  }

  /**
   * Safe delete (anonymize) or hard delete a user
   * DELETE /api/v1/admin/users/:userId
   *
   * Note: axios DELETE body must be passed via config.data
   */
  async deleteUser(
    userId: string,
    opts: { reason: string; mode: 'anonymize' | 'hard' }
  ) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.delete(`/admin/users/${userId}`, {
      data: {
        reason: opts.reason,
        mode: opts.mode,
      },
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
   * Get transactions list (rich table)
   * GET /api/v1/admin/transactions
   * Note: Read-only, NO 2FA
   */
  async getTransactions(params?: Record<string, unknown>) {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  }

  /**
   * Get transaction detail (drawer)
   * GET /api/v1/admin/transactions/:transactionId
   * Note: Read-only, NO 2FA
   */
  async getTransactionById(transactionId: string) {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get(`/admin/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Export transactions CSV (sensitive GET, requires 2FA)
   * GET /api/v1/admin/transactions/export
   *
   * If backend returns 403 2FA_CODE_REQUIRED, the interceptor will prompt and retry.
   */
  async exportTransactionsCsv(params?: Record<string, unknown>) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.get('/admin/transactions/export', {
      params,
      responseType: 'blob',
    });
    return response;
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

  /**
   * Admin Analytics Dashboard (all tabs in one call)
   * GET /api/v1/admin/analytics/dashboard
   * Note: Read-only, NO 2FA
   */
  async getAnalyticsDashboard(params: {
    timeframe: '24h' | '7d' | '30d' | '90d' | 'custom';
    from?: string;
    to?: string;
  }) {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    // Some backend deployments may mount this endpoint under `/admin/ui/*`.
    // Try the documented route first; fall back to the `/admin/ui` variant on 404 only.
    const candidates = [
      '/admin/analytics/dashboard',
      '/admin/ui/analytics/dashboard',
      // Common alternates (some backends omit the "dashboard" suffix)
      '/admin/analytics',
      '/admin/ui/analytics',
    ];
    let lastErr: any = null;

    for (let i = 0; i < candidates.length; i++) {
      const url = candidates[i];
      try {
        const response = await api.get(url, { params });
        // Some servers respond 200 with a "route not found" payload.
        // Detect that and keep falling back.
        const payload = response?.data as any;
        const msg = payload?.message || payload?.error?.message || '';
        const looksLikeRouteNotFound =
          payload?.success === false &&
          typeof msg === 'string' &&
          msg.includes('The route ') &&
          msg.includes('Novunt API is running');
        if (looksLikeRouteNotFound) {
          lastErr = new Error(msg);
          continue;
        }

        if (process.env.NODE_ENV === 'development' && i > 0) {
          console.warn(
            '[AdminService] Analytics dashboard route fallback used:',
            url
          );
        }
        return response.data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          lastErr = err;
          continue;
        }
        throw err;
      }
    }

    throw lastErr;
  }

  /**
   * Get Rank Analytics (includes Finance Titan pool allocations)
   * GET /api/v1/rank-management/analytics
   * Note: Admin only, read-only, NO 2FA
   */
  async getRankAnalytics() {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get('/rank-management/analytics');
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
