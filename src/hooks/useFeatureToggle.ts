/**
 * Feature toggle hooks for checking if features are enabled
 */

import { useConfig } from '@/contexts/ConfigContext';
import { ConfigKey } from '@/types/configKeys';

/**
 * Hook to check if a feature is enabled
 * @param featureKey - Configuration key for the feature toggle
 * @returns boolean indicating if feature is enabled
 */
export function useFeatureToggle(featureKey: ConfigKey): boolean {
  const { getValue } = useConfig();
  const value = getValue(featureKey);

  // Handle boolean features
  if (typeof value === 'boolean') {
    return value;
  }

  // Handle string-based toggles (e.g., 'enabled' | 'disabled')
  if (typeof value === 'string') {
    return value.toLowerCase() === 'enabled' || value.toLowerCase() === 'true';
  }

  return false;
}

/**
 * Hook to check multiple features at once
 * @param featureKeys - Array of configuration keys
 * @returns Record of feature keys to boolean values
 */
export function useFeatureToggles(
  featureKeys: ConfigKey[]
): Record<string, boolean> {
  const { getValue } = useConfig();

  return featureKeys.reduce(
    (acc, key) => {
      const value = getValue(key);
      acc[key] = typeof value === 'boolean' ? value : false;
      return acc;
    },
    {} as Record<string, boolean>
  );
}
