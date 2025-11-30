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

      // Add 2FA code for admin endpoints
      if (config.url?.includes('/rbac/')) {
        const twoFACode = await get2FACode();
        if (twoFACode) {
          config.headers['X-2FA-Code'] = twoFACode;
          if (config.data && typeof config.data === 'object') {
            config.data.twoFACode = twoFACode;
          }
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
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
