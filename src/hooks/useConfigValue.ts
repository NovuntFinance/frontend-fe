/**
 * Type-safe config value hook
 * Use this for type-safe config access with autocomplete
 */

import { useConfig } from '@/contexts/ConfigContext';
import { ConfigKey, ConfigValues } from '@/types/configKeys';

/**
 * Hook to get a single config value with type safety
 * @param key - Configuration key (type-safe with autocomplete)
 * @param fallback - Fallback value if config is not available
 * @returns Config value or fallback
 */
export function useConfigValue<K extends ConfigKey>(
  key: K,
  fallback?: ConfigValues[K]
): ConfigValues[K] | undefined {
  const { getValue } = useConfig();
  return getValue(key, fallback);
}
