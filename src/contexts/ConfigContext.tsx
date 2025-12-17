'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { configService } from '@/services/configService';
import {
  ConfigKey,
  ConfigValues,
  DEFAULT_CONFIG_VALUES,
  getConfigValue,
} from '@/types/configKeys';
import { toast } from 'sonner';

interface ConfigContextType {
  configs: Record<string, any> | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getValue: <K extends ConfigKey>(
    key: K,
    fallback?: ConfigValues[K]
  ) => ConfigValues[K] | undefined;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({
  children,
  initialConfigs,
}: {
  children: ReactNode;
  initialConfigs?: Record<string, any>;
}) {
  const [configs, setConfigs] = useState<Record<string, any> | null>(
    initialConfigs || null
  );
  const [loading, setLoading] = useState(!initialConfigs);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configService.getPublicConfigs('flat', false);
      if ('data' in response && response.data) {
        setConfigs(response.data as Record<string, any>);
      } else {
        // Use fallbacks if API returns empty
        console.warn('Config API returned empty data, using fallbacks');
        setConfigs(DEFAULT_CONFIG_VALUES as Record<string, any>);
      }
    } catch (err) {
      const error = err as any;
      const statusCode = error?.response?.status;
      const is404 = statusCode === 404;
      const isNetworkError =
        error?.code === 'ERR_NETWORK' ||
        error?.message?.includes('Network Error') ||
        error?.message?.includes('Failed to fetch');

      // Log error details for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to fetch configs:', {
          statusCode,
          is404,
          isNetworkError,
          message: error?.message,
        });
      }

      setError(
        err instanceof Error ? err : new Error('Failed to fetch configs')
      );

      // Use fallbacks on error
      setConfigs(DEFAULT_CONFIG_VALUES as Record<string, any>);

      // Only show toast for non-404 errors (404 means endpoint doesn't exist, which is fine)
      // And only show once on initial load, not on every retry
      if (!configs && !is404) {
        // For network errors, use a less intrusive warning
        if (isNetworkError) {
          console.warn(
            'Configuration endpoint unavailable. Using default values.'
          );
        } else {
          // Only show toast in development for debugging
          if (process.env.NODE_ENV === 'development') {
            toast.warning(
              'Failed to load configuration. Using default values.',
              {
                description: `Status: ${statusCode || 'Unknown'}`,
              }
            );
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialConfigs) {
      fetchConfigs();
    }

    // Refresh every 5 minutes
    const interval = setInterval(fetchConfigs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [initialConfigs]);

  const getValue = <K extends ConfigKey>(
    key: K,
    fallback?: ConfigValues[K]
  ): ConfigValues[K] | undefined => {
    return getConfigValue(configs, key, fallback);
  };

  return (
    <ConfigContext.Provider
      value={{
        configs,
        loading,
        error,
        refresh: fetchConfigs,
        getValue,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
}
