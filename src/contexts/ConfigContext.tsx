'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { configService } from '@/services/configService';

interface ConfigContextType {
  configs: Record<string, any> | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getValue: (key: string) => any;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configService.getPublicConfigs('flat', false);
      if ('data' in response) {
        setConfigs(response.data as Record<string, any>);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch configs')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();

    // Refresh every 5 minutes
    const interval = setInterval(fetchConfigs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getValue = (key: string): any => {
    return configs?.[key];
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
