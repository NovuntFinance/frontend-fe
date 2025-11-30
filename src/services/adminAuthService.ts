import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface AdminLoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  fname?: string;
  lname?: string;
  role: 'admin' | 'superAdmin';
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

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AdminAuthService] Login request:', {
        url,
        identifier: credentials.identifier,
        passwordLength: credentials.password?.length,
      });
    }

    try {
      const response = await axios.post<any>(url, credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Log full response for debugging (always log in development)
      console.log('[AdminAuthService] ===== RAW BACKEND RESPONSE =====');
      console.log('[AdminAuthService] Status:', response.status);
      console.log('[AdminAuthService] Full response.data:', response.data);
      console.log(
        '[AdminAuthService] Response data type:',
        typeof response.data
      );
      console.log(
        '[AdminAuthService] Response data keys:',
        Object.keys(response.data || {})
      );
      console.log('[AdminAuthService] ===== END RAW RESPONSE =====');

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

      // Extract user data
      if (responseData?.user) {
        user = responseData.user;
      } else if (responseData?.data?.user) {
        user = responseData.data.user;
      }

      // Extract refresh token
      if (responseData?.refreshToken) {
        refreshToken = responseData.refreshToken;
      } else if (responseData?.data?.refreshToken) {
        refreshToken = responseData.data.refreshToken;
      }

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

            // Use role and twoFAEnabled from backend response if available
            const backendRole = responseData.role;
            const backendTwoFA = responseData.twoFAEnabled;

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
              twoFAEnabled:
                backendTwoFA !== undefined
                  ? backendTwoFA
                  : payload.twoFAEnabled === true,
              twoFASecret: payload.twoFASecret || undefined,
              isActive: payload.isActive !== false,
              emailVerified: payload.emailVerified !== false,
            } as AdminUser;

            console.log('[AdminAuthService] Extracted user from token:', user);
          } catch (error) {
            console.error(
              '[AdminAuthService] Failed to extract user from token:',
              error
            );
            // Create minimal user object with backend data if available
            user = {
              _id: '',
              email: '',
              username: '',
              role: (responseData.role || 'admin') as 'admin' | 'superAdmin',
              twoFAEnabled: responseData.twoFAEnabled === true,
              isActive: true,
              emailVerified: false,
            } as AdminUser;
          }
        } else {
          // User data provided by backend - merge with response data if needed
          if (responseData.role) {
            user.role = responseData.role as 'admin' | 'superAdmin';
          }
          if (responseData.twoFAEnabled !== undefined) {
            user.twoFAEnabled = responseData.twoFAEnabled;
          }
        }

        // Store user data
        if (user) {
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
      // Enhanced error logging
      if (process.env.NODE_ENV === 'development') {
        console.error('[AdminAuthService] Login failed:', {
          url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorData: error.response?.data,
          message: error.message,
        });
      }

      // Re-throw the error so the component can handle it
      throw error;
    }
  }

  /**
   * Check if admin has 2FA enabled
   */
  has2FAEnabled(): boolean {
    const user = this.getCurrentAdmin();
    return user?.twoFAEnabled === true && !!user?.twoFASecret;
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
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear all admin-related storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('adminRefreshToken');

    // Clear admin cookie
    if (typeof document !== 'undefined') {
      document.cookie =
        'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
