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

// --- Settings bundle (GET /admin/ui/settings/bundle) - single source of truth for admin settings form ---

export interface SettingValidations {
  min?: number;
  max?: number;
  options?: (string | number)[];
}

export interface SettingAuditTrail {
  lastUpdatedAt: string | null;
  lastUpdatedBy: string | null;
}

export interface SettingUI {
  controlType: 'toggle' | 'number' | 'text' | 'select' | 'multiselect' | 'json';
  recommendedUnit?: string;
  isSensitive?: boolean;
  tags?: string[];
}

export interface SettingInsights {
  warnings?: string[];
  bestPractices?: string[];
  businessImpact?: string | null;
}

export interface BundleSetting {
  key: string;
  label: string;
  description?: string;
  value: unknown;
  type: string;
  category: string;
  isEditable: boolean;
  validations?: SettingValidations;
  auditTrail?: SettingAuditTrail;
  ui: SettingUI;
  insights?: SettingInsights;
}

export interface BundleCategoryStats {
  totalSettings: number;
  editableSettings: number;
  helperCoverage: number;
  warnings: number;
  lastUpdatedAt: string | null;
  lastUpdatedKeys: string[];
}

export interface BundleCategory {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  priority: number;
  tags?: string[];
  stats: BundleCategoryStats;
  settings: BundleSetting[];
}

export interface SettingsBundleTotals {
  categories: number;
  settings: number;
  editableSettings: number;
  helperCoverage: number;
  warnings: number;
}

export interface SettingsBundleData {
  generatedAt: string;
  totals: SettingsBundleTotals;
  categories: BundleCategory[];
}

export interface SettingsBundleResponse {
  success: boolean;
  data: SettingsBundleData;
  message?: string;
}

export interface SettingsOverviewCategory {
  key: string;
  title: string;
  totalSettings: number;
  editableSettings: number;
  helperCoverage: number;
  lastUpdatedAt: string | null;
  lastUpdatedKeys: string[];
  priority: number;
}

export interface SettingsOverviewResponse {
  success: boolean;
  data: {
    generatedAt: string;
    totals: SettingsBundleTotals;
    categories: SettingsOverviewCategory[];
  };
  message?: string;
}

// Response types for PUT (backend returns success/message/data)
export interface UpdateSettingResponse {
  success: boolean;
  status: string;
  message: string;
  data?: { key: string; value: unknown };
}

export interface BulkUpdateResultItem {
  key: string;
  value?: unknown;
  status?: string;
  error?: string;
}

export interface BulkUpdateResponse {
  success: boolean;
  status: 'success' | 'partial' | 'error';
  message: string;
  data?: {
    successful: BulkUpdateResultItem[];
    failed: BulkUpdateResultItem[];
  };
}

class AdminSettingsService {
  /**
   * Get settings bundle (single source of truth for admin settings form).
   * GET /api/v1/admin/ui/settings/bundle
   * No 2FA required for read.
   */
  async getSettingsBundle(): Promise<SettingsBundleData> {
    try {
      const get2FACode = async () => null;
      const api = createAdminApi(get2FACode);
      const response = await api.get<SettingsBundleResponse>(
        '/admin/ui/settings/bundle'
      );
      const body = response.data;
      if (!body?.success || !body.data) {
        throw new Error(body?.message || 'Failed to load settings bundle');
      }
      return body.data;
    } catch (error) {
      console.error('Error fetching settings bundle:', error);
      throw error;
    }
  }

  /**
   * Get settings overview (category summaries only).
   * GET /api/v1/admin/ui/settings/overview
   */
  async getSettingsOverview(): Promise<SettingsOverviewResponse['data']> {
    try {
      const get2FACode = async () => null;
      const api = createAdminApi(get2FACode);
      const response = await api.get<SettingsOverviewResponse>(
        '/admin/ui/settings/overview'
      );
      const body = response.data;
      if (!body?.success || !body.data) {
        throw new Error(body?.message || 'Failed to load settings overview');
      }
      return body.data;
    } catch (error) {
      console.error('Error fetching settings overview:', error);
      throw error;
    }
  }

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
      const body = response.data as {
        success?: boolean;
        data?: AdminSetting;
        message?: string;
      };
      if (body?.success === false) {
        throw new Error(body?.message || `Failed to load setting '${key}'`);
      }
      return body?.data as AdminSetting;
    } catch (error) {
      console.error(`Error fetching setting '${key}':`, error);
      throw error;
    }
  }

  /**
   * Update a single setting.
   * PUT /api/v1/admin/settings/:key with body { value, reason? }.
   * Requires admin 2FA. Backend returns success/message; use response.success for outcome.
   */
  async updateSetting(
    key: string,
    value: unknown,
    reason?: string,
    twoFACode?: string
  ): Promise<UpdateSettingResponse> {
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
      const response = await api.put<UpdateSettingResponse>(
        `/admin/settings/${key}`,
        {
          value,
          reason: reason || `Updated ${key} via admin panel`,
        }
      );

      const body = response.data;
      const isSuccess =
        body.success === true ||
        (response.status >= 200 &&
          response.status < 300 &&
          (body as any).status === 'success');
      if (!isSuccess) {
        const err = new Error(
          (body as any).message || (body as any).error || 'Update failed'
        ) as Error & { response?: { status: number; data?: unknown } };
        err.response = {
          status: response.status,
          data: response.data,
        };
        throw err;
      }

      // Clear public config cache since setting changed
      const { configService } = await import('./configService');
      configService.clearCache();

      return body;
    } catch (error: any) {
      console.error(`Error updating setting '${key}':`, error);
      throw error;
    }
  }

  /**
   * Update multiple settings at once.
   * PUT /api/v1/admin/settings with body { settings: [ { key, value }, ... ] }.
   * Requires admin 2FA. Response may have success: true with data.successful/data.failed for partial success.
   */
  async updateMultipleSettings(
    settings: Array<{ key: string; value: unknown }>,
    reason?: string,
    twoFACode?: string
  ): Promise<BulkUpdateResponse> {
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
      const response = await api.put<BulkUpdateResponse>('/admin/settings', {
        settings,
        ...(reason && { reason }),
      });

      const body = response.data;

      // Clear public config cache when any update succeeded
      if (body?.data?.successful?.length) {
        const { configService } = await import('./configService');
        configService.clearCache();
      }

      return body;
    } catch (error: any) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  }
}

export const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;
