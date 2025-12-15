import axios, { AxiosInstance } from 'axios';
import { adminAuthService } from './adminAuthService';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Permission {
  _id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isSystemPermission: boolean;
}

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: Permission[];
  isSystemRole: boolean;
  isDefault: boolean;
}

export interface UserPermissionsResponse {
  success: boolean;
  data: {
    permissions: string[]; // Array of permission keys
    role: Role;
  };
}

export interface AllRolesResponse {
  success: boolean;
  data: Role[];
}

export interface AllPermissionsResponse {
  success: boolean;
  data: Permission[];
}

// 2FA Code Cache (valid for 85 seconds to match backend's ±2 time steps ~90-second window)
interface Cached2FA {
  code: string;
  expiresAt: number;
}

let cached2FA: Cached2FA | null = null;

// Create axios instance with 2FA interceptor
const createRBACApi = (
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

      // Add 2FA code for RBAC endpoints (admin endpoints)
      if (config.url?.includes('/rbac/')) {
        // Check cache first
        let twoFACode: string | null = null;

        if (cached2FA && Date.now() < cached2FA.expiresAt) {
          twoFACode = cached2FA.code;
          console.log('[RBACService] Using cached 2FA code');
        } else {
          // Get fresh 2FA code
          twoFACode = await get2FACode();
          if (twoFACode) {
            // Cache for 85 seconds (matches backend's ±2 time steps ~90-second window)
            // Backend accepts codes within ±2 time steps, so we cache for most of that window
            cached2FA = {
              code: twoFACode,
              expiresAt: Date.now() + 85 * 1000,
            };
            console.log(
              '[RBACService] Cached new 2FA code (valid for 85 seconds)'
            );
          }
        }

        if (twoFACode) {
          const method = config.method?.toUpperCase();

          if (method === 'GET') {
            // For GET requests, add to query parameters (CORS-safe)
            config.params = config.params || {};
            config.params.twoFACode = twoFACode;
            console.log(
              '[RBACService] Added 2FA code to query params for GET request'
            );
          } else if (['POST', 'PUT', 'PATCH'].includes(method || '')) {
            // For POST/PUT/PATCH, add to request body
            if (config.data && typeof config.data === 'object') {
              config.data.twoFACode = twoFACode;
              console.log(
                '[RBACService] Added 2FA code to request body for',
                method
              );
            } else {
              // If no body, create one
              config.data = { twoFACode };
              console.log(
                '[RBACService] Created request body with 2FA code for',
                method
              );
            }
          }
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 2FA errors and clear cache
  api.interceptors.response.use(
    (response) => {
      // Keep cache on successful response
      return response;
    },
    async (error: any) => {
      if (error.response?.status === 403) {
        const errorCode = error.response.data?.error?.code;
        if (
          errorCode === '2FA_CODE_INVALID' ||
          errorCode === '2FA_CODE_REQUIRED'
        ) {
          // Clear cache on invalid/missing code
          cached2FA = null;
          console.log('[RBACService] Cleared 2FA cache due to error');
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

class RBACService {
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
   * Clear cached 2FA code (useful for logout or when code is invalid)
   */
  clearCached2FA(): void {
    cached2FA = null;
    console.log('[RBACService] Cleared cached 2FA code');
  }

  /**
   * Get current user's permissions
   * GET /api/v1/rbac/my-permissions
   */
  async getUserPermissions(): Promise<UserPermissionsResponse> {
    const api = createRBACApi(this.get2FACode);
    const response = await api.get<UserPermissionsResponse>(
      '/rbac/my-permissions'
    );
    return response.data;
  }

  /**
   * Get all roles
   * GET /api/v1/rbac/roles
   */
  async getAllRoles(): Promise<AllRolesResponse> {
    const api = createRBACApi(this.get2FACode);
    const response = await api.get<AllRolesResponse>('/rbac/roles');
    return response.data;
  }

  /**
   * Get all permissions
   * GET /api/v1/rbac/permissions
   */
  async getAllPermissions(): Promise<AllPermissionsResponse> {
    const api = createRBACApi(this.get2FACode);
    const response = await api.get<AllPermissionsResponse>('/rbac/permissions');
    return response.data;
  }

  /**
   * Update role permissions (Super Admin only)
   * PUT /api/v1/rbac/roles/:roleName/permissions
   */
  async updateRolePermissions(
    roleName: string,
    permissionKeys: string[]
  ): Promise<{ success: boolean; data: Role }> {
    const api = createRBACApi(this.get2FACode);
    const response = await api.put<{ success: boolean; data: Role }>(
      `/rbac/roles/${roleName}/permissions`,
      { permissionKeys }
    );
    return response.data;
  }

  /**
   * Initialize RBAC system (Super Admin only)
   * POST /api/v1/rbac/initialize
   */
  async initializeRBAC(): Promise<{ success: boolean; message: string }> {
    const api = createRBACApi(this.get2FACode);
    const response = await api.post<{ success: boolean; message: string }>(
      '/rbac/initialize',
      {}
    );
    return response.data;
  }
}

export const rbacService = new RBACService();
export default rbacService;
