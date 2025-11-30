import axios, { AxiosInstance, AxiosError } from 'axios';
import { adminAuthService } from './adminAuthService';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with interceptors
const createAdminApi = (
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
      }

      // For admin endpoints (except login), add 2FA code
      if (config.url?.includes('/admin/') && !config.url.includes('/login')) {
        const twoFACode = await get2FACode();
        if (twoFACode) {
          config.headers['X-2FA-Code'] = twoFACode;
          // Also add to body if it's a POST/PATCH/PUT
          if (config.data && typeof config.data === 'object') {
            config.data.twoFACode = twoFACode;
          }
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 2FA errors
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 403) {
        const errorData = error.response.data as any;
        const errorCode = errorData?.error?.code;

        if (
          errorCode === '2FA_MANDATORY' ||
          errorCode === '2FA_SETUP_INCOMPLETE'
        ) {
          // Redirect to 2FA setup
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/setup-2fa';
          }
        } else if (
          errorCode === '2FA_CODE_REQUIRED' ||
          errorCode === '2FA_CODE_INVALID'
        ) {
          // Show 2FA input modal (handled by context)
          // The error will be thrown and handled by the component
        }
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
   * Get admin profile
   * GET /api/v1/admin/profile
   */
  async getProfile() {
    const api = createAdminApi(this.get2FACode);
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
   */
  async getUsersWithBalances() {
    const api = createAdminApi(this.get2FACode);
    const response = await api.get('/admin/users-balances');
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
   */
  async getTransactions(page = 1, limit = 20) {
    const api = createAdminApi(this.get2FACode);
    const response = await api.get('/admin/transactions', {
      params: { page, limit },
    });
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
