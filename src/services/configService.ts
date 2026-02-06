import apiClient from '@/lib/api';

export interface PublicConfigItem {
  key: string;
  value: any;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  displayName: string;
  description: string;
  tooltip?: {
    title: string;
    content: string;
    shortDescription: string;
  };
}

export interface PublicConfigResponse {
  success: boolean;
  data: Record<string, Record<string, PublicConfigItem>>;
  timestamp: string;
}

export interface PublicConfigFlatResponse {
  success: boolean;
  data: Record<string, any>;
  timestamp: string;
}

export interface SingleConfigResponse {
  success: boolean;
  data: PublicConfigItem;
  timestamp: string;
}

class ConfigService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all public configuration values
   * @param format - 'grouped' (default) or 'flat'
   * @param includeTooltips - Include tooltip data
   */
  async getPublicConfigs(
    format: 'grouped' | 'flat' = 'grouped',
    includeTooltips: boolean = false
  ): Promise<PublicConfigResponse | PublicConfigFlatResponse> {
    const cacheKey = `configs_${format}_${includeTooltips}`;
    const cached = this.cache.get(cacheKey);

    // Check cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await apiClient.get('/config', {
        params: {
          format,
          includeTooltips: includeTooltips ? 'true' : 'false',
        },
      });

      const data = response.data as
        | PublicConfigResponse
        | PublicConfigFlatResponse;

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single public configuration value
   * @param key - Configuration key
   * @param includeTooltip - Include tooltip data
   */
  async getPublicConfig(
    key: string,
    includeTooltip: boolean = false
  ): Promise<PublicConfigItem> {
    try {
      const response = await apiClient.get(`/config/${key}`, {
        params: {
          includeTooltip: includeTooltip ? 'true' : 'false',
        },
      });
      return response.data.data as PublicConfigItem;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a configuration value quickly (flat format, cached)
   * Returns just the value for quick access
   */
  async getConfigValue(key: string): Promise<any> {
    const configs = await this.getPublicConfigs('flat', false);
    if ('data' in configs && typeof configs.data === 'object') {
      return (configs.data as Record<string, any>)[key];
    }
    return undefined;
  }

  /**
   * Get multiple config values at once
   */
  async getConfigValues(keys: string[]): Promise<Record<string, any>> {
    const configs = await this.getPublicConfigs('flat', false);
    if ('data' in configs && typeof configs.data === 'object') {
      const values: Record<string, any> = {};
      keys.forEach((key) => {
        values[key] = (configs.data as Record<string, any>)[key];
      });
      return values;
    }
    return {};
  }

  /**
   * Clear config cache (call after admin updates settings)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific format
   */
  clearCacheForFormat(format: 'grouped' | 'flat'): void {
    this.cache.forEach((value, key) => {
      if (key.startsWith(`configs_${format}_`)) {
        this.cache.delete(key);
      }
    });
  }
}

export const configService = new ConfigService();
export default configService;
