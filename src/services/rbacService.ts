import axios, { AxiosInstance } from 'axios';
import { adminAuthService } from './adminAuthService';
import { shouldRequire2FA } from '@/lib/twofa';
import { getApiV1BaseUrl } from '@/lib/admin-api-base';

const API_BASE_URL = getApiV1BaseUrl();

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
    role: Role | string;
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

type RetriableAxiosConfig = any & { _retry2FA?: boolean };

function attach2FACodeToConfig(config: any, twoFACode: string) {
  const method = config.method?.toUpperCase?.() || '';
  if (method === 'GET') {
    // For GET requests, add to query parameters (CORS-safe)
    config.params = config.params || {};
    config.params.twoFACode = twoFACode;
  } else {
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
}

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

      // Add 2FA code only when required (never prefetch for normal GET navigation)
      if (config.url?.includes('/rbac/')) {
        const requires2FA = shouldRequire2FA({
          method: config.method,
          url: config.url,
          // RBAC endpoints shouldn't depend on is2FAVerified; for GET we only require if "sensitive"
        });

        if (!requires2FA) {
          return config;
        }

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

        if (!twoFACode) {
          // User cancelled / no code entered for an operation that requires 2FA
          return Promise.reject(new Error('2FA_CODE_REQUIRED'));
        }

        attach2FACodeToConfig(config, twoFACode);
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
      const status = error.response?.status;
      const errorCode = error.response?.data?.error?.code;
      const originalRequest = error.config as RetriableAxiosConfig;

      if (status === 403) {
        if (
          errorCode === '2FA_CODE_INVALID' ||
          errorCode === '2FA_CODE_REQUIRED'
        ) {
          // Clear cache on invalid/missing code
          cached2FA = null;
          console.log('[RBACService] Cleared 2FA cache due to error');
        }

        // Only prompt and retry when backend explicitly demands 2FA
        if (
          errorCode === '2FA_CODE_REQUIRED' &&
          originalRequest &&
          !originalRequest._retry2FA
        ) {
          originalRequest._retry2FA = true;
          try {
            const twoFACode = await get2FACode();
            if (!twoFACode) {
              return Promise.reject(error);
            }
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
