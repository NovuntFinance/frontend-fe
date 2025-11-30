import { useState, useEffect, useCallback } from 'react';
import { configService, PublicConfigItem } from '@/services/configService';

interface UsePublicConfigOptions {
  format?: 'grouped' | 'flat';
  includeTooltips?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function usePublicConfig(options: UsePublicConfigOptions = {}) {
  const {
    format = 'flat',
    includeTooltips = false,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [configs, setConfigs] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configService.getPublicConfigs(
        format,
        includeTooltips
      );

      if (format === 'flat' && 'data' in response) {
        setConfigs(response.data as Record<string, any>);
      } else if (format === 'grouped' && 'data' in response) {
        // Flatten grouped format for easier access
        const flat: Record<string, any> = {};
        const grouped = response.data as Record<
          string,
          Record<string, PublicConfigItem>
        >;
        for (const category in grouped) {
          for (const key in grouped[category]) {
            flat[key] = grouped[category][key].value;
          }
        }
        setConfigs(flat);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch configs')
      );
      console.error('Error fetching public configs:', err);
    } finally {
      setLoading(false);
    }
  }, [format, includeTooltips]);

  useEffect(() => {
    fetchConfigs();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchConfigs, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchConfigs, autoRefresh, refreshInterval]);

  const refresh = () => {
    configService.clearCache();
    fetchConfigs();
  };

  const getValue = (key: string): any => {
    return configs?.[key];
  };

  return {
    configs,
    loading,
    error,
    refresh,
    getValue,
  };
}

/**
 * Hook to get a single config value
 */
export function useConfigValue(key: string) {
  const { configs, loading, error, refresh } = usePublicConfig({
    format: 'flat',
  });

  return {
    value: configs?.[key],
    loading,
    error,
    refresh,
  };
}
