import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeader = () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
   */
  async getAllSettings(
    includeTooltips: boolean = true
  ): Promise<AdminSettingsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`, {
        headers: getAuthHeader(),
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
   */
  async getSettingsByCategory(
    category: string,
    includeTooltips: boolean = true
  ): Promise<AdminSetting[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/settings/category/${category}`,
        {
          headers: getAuthHeader(),
          params: {
            includeTooltips: includeTooltips ? 'true' : 'false',
          },
        }
      );
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
   */
  async getSetting(
    key: string,
    includeTooltip: boolean = true
  ): Promise<AdminSetting> {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/${key}`, {
        headers: getAuthHeader(),
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
   */
  async updateSetting(
    key: string,
    value: any,
    reason?: string
  ): Promise<{
    status: string;
    message: string;
    data: { key: string; value: any };
  }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/settings/${key}`,
        {
          value,
          reason: reason || `Updated ${key} via admin panel`,
        },
        {
          headers: getAuthHeader(),
        }
      );

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
   */
  async updateMultipleSettings(
    settings: Record<string, any>,
    reason?: string
  ): Promise<{ status: string; message: string; results: any[] }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/settings`,
        {
          settings,
          reason: reason || 'Bulk update via admin panel',
        },
        {
          headers: getAuthHeader(),
        }
      );

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
