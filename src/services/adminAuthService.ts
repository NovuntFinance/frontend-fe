import axios from 'axios';
import { getApiV1BaseUrl } from '@/lib/admin-api-base';

const API_BASE_URL = getApiV1BaseUrl();

export interface AdminLoginRequest {
  identifier: string; // email or username
  password: string;
  twoFACode: string; // 6-digit code from authenticator app
}

export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  fname?: string;
  lname?: string;
  role:
    | 'support_agent'
    | 'support_lead'
    | 'finance'
    | 'risk'
    | 'operations'
    | 'admin'
    | 'superAdmin';
  twoFAEnabled: boolean;
  twoFASecret?: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface AdminLoginResponse {
  success: boolean;
  data: {
    user: AdminUser;
    token: string;
    refreshToken?: string;
  };
  message?: string;
}

class AdminAuthService {
  private readonly TOKEN_KEY = 'adminToken';
  private readonly USER_KEY = 'adminUser';

  /**
   * Admin Login
   * POST /api/v1/admin/login
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const url = `${API_BASE_URL}/admin/login`;

    try {
      const response = await axios.post<any>(url, credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle different possible response structures from backend
      let responseData = response.data;

      // Check if response is nested (e.g., { data: { ... } })
      if (responseData?.data && typeof responseData.data === 'object') {
        responseData = responseData.data;
      }

      // Extract token from various possible locations
      let token = null;
      let user = null;
      let refreshToken = null;

      // Try different response structures
      if (responseData?.token) {
        token = responseData.token;
      } else if (responseData?.data?.token) {
        token = responseData.data.token;
      } else if (responseData?.accessToken) {
        token = responseData.accessToken;
      }

      // Extract user data - handle both old and new backend formats
      if (responseData?.user) {
        user = responseData.user;
        // Handle backend format where user has 'id' instead of '_id'
        if (user && !user._id && (user as any).id) {
          user = { ...user, _id: (user as any).id } as AdminUser;
        }
      } else if (responseData?.data?.user) {
        user = responseData.data.user;
        // Handle backend format where user has 'id' instead of '_id'
        if (user && !user._id && (user as any).id) {
          user = { ...user, _id: (user as any).id } as AdminUser;
        }
      }

      // Extract refresh token
      if (responseData?.refreshToken) {
        refreshToken = responseData.refreshToken;
      } else if (responseData?.data?.refreshToken) {
        refreshToken = responseData.data.refreshToken;
      }

      // Extract role and twoFAEnabled from responseData (they might be at the same level as user/token)
      // Check multiple possible locations for role
      const backendRole =
        responseData?.role ||
        responseData?.user?.role ||
        (response.data as any)?.data?.role ||
        (response.data as any)?.data?.user?.role ||
        (response.data as any)?.role ||
        (response.data as any)?.user?.role;

      const backendTwoFA =
        responseData?.twoFAEnabled !== undefined
          ? responseData.twoFAEnabled
          : responseData?.user?.twoFAEnabled !== undefined
            ? responseData.user.twoFAEnabled
            : (response.data as any)?.data?.twoFAEnabled !== undefined
              ? (response.data as any).data.twoFAEnabled
              : (response.data as any)?.data?.user?.twoFAEnabled !== undefined
                ? (response.data as any).data.user.twoFAEnabled
                : undefined;

      // If we have a token, store it and return success
      if (token) {
        this.setToken(token);

        // Also set cookie for middleware compatibility
        if (typeof document !== 'undefined') {
          const expires = new Date();
          expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
          document.cookie = `adminToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        }

        // If backend didn't provide user data, try to extract from token
        if (!user) {
          try {
            // Decode JWT token to extract user info
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Create admin user object from token payload
            user = {
              _id: payload.userId || payload._id || payload.sub || '',
              email: payload.email || '',
              username: payload.username || payload.email?.split('@')[0] || '',
              fname: payload.fname || payload.firstName || payload.name || '',
              lname: payload.lname || payload.lastName || '',
              // Use role from backend response if available, otherwise from token
              role: (backendRole || payload.role || 'admin') as
                | 'admin'
                | 'superAdmin',
              // Use twoFAEnabled from backend response if available
              // Backend response takes precedence over JWT token
              twoFAEnabled:
                backendTwoFA !== undefined
                  ? backendTwoFA
                  : payload.twoFAEnabled === true || false,
              twoFASecret: payload.twoFASecret || undefined,
              isActive: payload.isActive !== false,
              emailVerified: payload.emailVerified !== false,
            } as AdminUser;
          } catch {
            // Create minimal user object with backend data if available
            user = {
              _id: '',
              email: '',
              username: '',
              role: (backendRole || 'admin') as 'admin' | 'superAdmin',
              twoFAEnabled: backendTwoFA === true,
              isActive: true,
              emailVerified: false,
            } as AdminUser;
          }
        } else {
          // User data provided by backend - merge with response data if needed
          // Use the extracted backendRole and backendTwoFA from above
          if (backendRole) {
            user.role = backendRole as 'admin' | 'superAdmin';
          }
          if (backendTwoFA !== undefined) {
            user.twoFAEnabled = backendTwoFA;
          }
        }

        // Store user data
        if (user) {
          if (backendRole) {
            user.role = backendRole as 'admin' | 'superAdmin';
          }
          this.setUser(user);
        }

        if (refreshToken) {
          localStorage.setItem('adminRefreshToken', refreshToken);
        }

        // Return normalized response structure
        return {
          success: true,
          data: {
            token,
            user: user || ({} as AdminUser),
            refreshToken,
          },
          message: responseData.message || 'Login successful',
        } as AdminLoginResponse;
      }

      // No token found - return error response
      return {
        success: false,
        data: {
          token: '',
          user: {} as AdminUser,
        },
        message: responseData.message || 'Login failed. No token received.',
      } as AdminLoginResponse;
    } catch (error: any) {
      // Re-throw; component handles display. No sensitive data logged.
      throw error;
    }
  }

  /**
   * Check if admin has 2FA enabled
   * Note: Only checks twoFAEnabled status, not twoFASecret (which isn't needed after setup)
   */
  has2FAEnabled(): boolean {
    const user = this.getCurrentAdmin();
    return user?.twoFAEnabled === true;
  }

  /**
   * Get current admin user
   */
  getCurrentAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set auth token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Set user data
   */
  setUser(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Refresh admin user data from backend
   * GET /api/v1/admin/profile
   * NOTE: This requires 2FA, so it should only be called when 2FA is available
   * Use adminService.getProfile() instead for proper 2FA handling
   */
  async refreshAdminData(): Promise<AdminUser | null> {
    // This method is deprecated - use adminService.getProfile() instead
    // It requires 2FA which causes chicken-and-egg problems
    console.warn(
      '[AdminAuthService] refreshAdminData is deprecated - use adminService.getProfile() instead'
    );
    return this.getCurrentAdmin();
  }

  /**
   * Update user data (e.g., after 2FA setup)
   */
  updateUser(updates: Partial<AdminUser>): void {
    const user = this.getCurrentAdmin();
    if (user) {
      this.setUser({ ...user, ...updates });
    }
  }

  /**
   * Logout
   * POST /api/v1/admin/logout
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await axios.post(
          `${API_BASE_URL}/admin/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      } catch (error: any) {
        // Suppress 401 errors as they're expected during logout (token might be expired)
        // Only log unexpected errors
        if (error?.response?.status !== 401) {
          console.error(
            '[AdminAuthService] Logout error:',
            error?.message || error
          );
        }
        // Continue with logout even if API call fails
      }
    }

    // Clear all admin-related storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('adminRefreshToken');

    // Clear admin cookie - ensure it's cleared with proper attributes
    if (typeof document !== 'undefined') {
      // Clear cookie with all possible paths and attributes
      document.cookie =
        'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie =
        'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;';
      document.cookie =
        'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;';
      document.cookie =
        'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin; SameSite=Lax;';

      if (process.env.NODE_ENV === 'development') {
        console.log('[AdminAuthService] Admin auth data cleared');
      }
    }
  }

  /**
   * Check if admin is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentAdmin();
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    const user = this.getCurrentAdmin();
    return user?.role === 'superAdmin';
  }
}

export const adminAuthService = new AdminAuthService();
export default adminAuthService;
