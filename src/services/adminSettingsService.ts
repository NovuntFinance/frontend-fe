import { createAdminApi } from './adminService';
import { adminService } from './adminService';

// Note: adminSettingsService now uses adminService's createAdminApi() for consistency
// This provides:
// - Automatic 2FA code handling (query params for GET, body for POST/PUT/PATCH)
// - 2FA code caching (85 seconds) - shared with adminService
// - Consistent error handling
// - Admin token management

export interface AdminTooltip {
  title: string;
  content: string;
  description: string;
  content_details?: {
    shortDescription: string;
    detailedExplanation: string;
    examples?: string[];
    warnings?: string[];
    bestPractices?: string[];
    relatedSettings?: string[];
    businessImpact?: string;
    technicalNotes?: string;
  };
  styling?: {
    theme: 'default' | 'warning' | 'success' | 'info' | 'danger';
    icon?: string;
  };
}

export interface AdminSetting {
  key: string;
  value: any;
  type: string;
  displayName: string;
  description: string;
  tooltip?: AdminTooltip;
  helperTitle: string;
  helperText: string;
  helperIcon?: string;
  isEditable: boolean;
  minValue?: number;
  maxValue?: number;
  validOptions?: any[];
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface AdminSettingsResponse {
  status: 'success' | 'error';
  message: string;
  data: Record<string, AdminSetting[]>;
}

class AdminSettingsService {
  /**
   * Get all settings (grouped by category)
   * Tooltips are included by default
   * Requires 2FA code for admin endpoints (handled automatically by adminService)
   */
  async getAllSettings(
    includeTooltips: boolean = true,
    twoFACode?: string // Optional - if provided, will be used; otherwise no 2FA code sent
  ): Promise<AdminSettingsResponse> {
    try {
      // For GET requests, 2FA should not be required (after backend fix)
      // Only use 2FA code if explicitly provided
      const get2FACode = async () => {
        if (twoFACode) return twoFACode;
        // Don't prompt for 2FA on GET requests - let backend handle it
        return null;
      };

      const api = createAdminApi(get2FACode);
      const response = await api.get('/admin/settings', {
        params: {
          includeTooltips: includeTooltips ? 'true' : 'false',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      throw error;
    }
  }

  /**
   * Get settings by category
   * Requires 2FA code for admin endpoints (handled automatically by adminService)
   */
  async getSettingsByCategory(
    category: string,
    includeTooltips: boolean = true,
    twoFACode?: string
  ): Promise<AdminSetting[]> {
    try {
      // For GET requests, 2FA should not be required (after backend fix)
      // Only use 2FA code if explicitly provided
      const get2FACode = async () => {
        if (twoFACode) return twoFACode;
        // Don't prompt for 2FA on GET requests - let backend handle it
        return null;
      };

      const api = createAdminApi(get2FACode);
      const response = await api.get(`/admin/settings/category/${category}`, {
        params: {
          includeTooltips: includeTooltips ? 'true' : 'false',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(
        `Error fetching settings for category '${category}':`,
        error
      );
      throw error;
    }
  }

  /**
   * Get single setting
   * Requires 2FA code for admin endpoints (handled automatically by adminService)
   */
  async getSetting(
    key: string,
    includeTooltip: boolean = true,
    twoFACode?: string
  ): Promise<AdminSetting> {
    try {
      // For GET requests, 2FA should not be required (after backend fix)
      // Only use 2FA code if explicitly provided
      const get2FACode = async () => {
        if (twoFACode) return twoFACode;
        // Don't prompt for 2FA on GET requests - let backend handle it
        return null;
      };

      const api = createAdminApi(get2FACode);
      const response = await api.get(`/admin/settings/${key}`, {
        params: {
          includeTooltip: includeTooltip ? 'true' : 'false',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching setting '${key}':`, error);
      throw error;
    }
  }

  /**
   * Update a single setting
   * Requires 2FA code for admin endpoints (handled automatically by adminService)
   */
  async updateSetting(
    key: string,
    value: any,
    reason?: string,
    twoFACode?: string
  ): Promise<{
    status: string;
    message: string;
    data: { key: string; value: any };
  }> {
    try {
      const get2FACode = async () => {
        if (twoFACode) return twoFACode;
        const admin2FAGetter = adminService.get2FACodeGetter();
        if (admin2FAGetter) {
          return await admin2FAGetter();
        }
        return null;
      };

      const api = createAdminApi(get2FACode);
      const response = await api.put(`/admin/settings/${key}`, {
        value,
        reason: reason || `Updated ${key} via admin panel`,
      });

      // Clear public config cache since setting changed
      const { configService } = await import('./configService');
      configService.clearCache();

      return response.data;
    } catch (error: any) {
      console.error(`Error updating setting '${key}':`, error);
      throw error;
    }
  }

  /**
   * Update multiple settings at once
   * Requires 2FA code for admin endpoints (handled automatically by adminService)
   */
  async updateMultipleSettings(
    settings: Record<string, any>,
    reason?: string,
    twoFACode?: string
  ): Promise<{ status: string; message: string; results: any[] }> {
    try {
      const get2FACode = async () => {
        if (twoFACode) return twoFACode;
        const admin2FAGetter = adminService.get2FACodeGetter();
        if (admin2FAGetter) {
          return await admin2FAGetter();
        }
        return null;
      };

      const api = createAdminApi(get2FACode);
      const response = await api.put('/admin/settings', {
        settings,
        reason: reason || 'Bulk update via admin panel',
      });

      // Clear public config cache
      const { configService } = await import('./configService');
      configService.clearCache();

      return response.data;
    } catch (error: any) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  }
}

export const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;
