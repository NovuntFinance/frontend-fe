/**
 * Platform Settings Service
 *
 * Handles fetching public platform settings like platform_day_start_utc
 * This service uses the public API endpoint that doesn't require authentication.
 */

import { api } from '@/lib/api';
import {
  usePlatformConfigStore,
  isCacheValid,
} from '@/store/platformConfigStore';
import { invalidatePlatformDayStartCache } from '@/utils/platformTime';

interface PlatformDayStartResponse {
  success: boolean;
  data: {
    key: string;
    value: string;
  };
}

/**
 * Fetch platform day start from backend
 * @returns Promise resolving to platform day start time in "HH:MM:SS" format
 */
async function fetchPlatformDayStartFromAPI(): Promise<string> {
  try {
    const response = await api.get<PlatformDayStartResponse>(
      '/settings/public/platform_day_start_utc'
    );

    return response.data.value;
  } catch (error: any) {
    // Handle 401 errors gracefully - this is a public endpoint that might fail
    // if backend requires auth or if user is not authenticated
    const status = error?.response?.status || error?.statusCode;

    if (status === 401) {
      console.warn(
        '[platformSettingsService] 401 Unauthorized - Using default platform day start. This is normal if user is not authenticated.'
      );
      // Return default value instead of throwing
      return '00:00:00';
    }

    console.error(
      '[platformSettingsService] Failed to fetch platform day start:',
      error
    );
    throw error;
  }
}

/**
 * Get platform day start with automatic caching
 * Uses Zustand store for state management and automatic cache invalidation
 *
 * @param force - Force refresh even if cache is valid
 * @returns Promise resolving to platform day start time in "HH:MM:SS" format
 */
export async function getPlatformDayStart(force = false): Promise<string> {
  const store = usePlatformConfigStore.getState();

  // Return cached value if valid and not forcing refresh
  if (!force && isCacheValid() && store.platformDayStart) {
    return store.platformDayStart;
  }

  // Fetch new value
  try {
    store.setLoading(true);
    const dayStart = await fetchPlatformDayStartFromAPI();

    // Update store
    store.setPlatformDayStart(dayStart);

    // Also invalidate the utility function cache to keep them in sync
    invalidatePlatformDayStartCache();

    return dayStart;
  } catch (error: any) {
    // Handle 401 errors gracefully - don't set error state for auth issues
    const status = error?.response?.status || error?.statusCode;

    if (status === 401) {
      // 401 is handled in fetchPlatformDayStartFromAPI, but just in case
      console.warn(
        '[platformSettingsService] 401 Unauthorized - Using default value'
      );
      const defaultValue = '00:00:00';
      store.setPlatformDayStart(defaultValue);
      return defaultValue;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    store.setError(errorMessage);

    // Return cached value if available, otherwise default
    if (store.platformDayStart) {
      console.warn(
        '[platformSettingsService] Using cached value after fetch error'
      );
      return store.platformDayStart;
    }

    // Fallback to default
    console.warn('[platformSettingsService] Using default value: 00:00:00');
    return '00:00:00';
  } finally {
    store.setLoading(false);
  }
}

/**
 * Initialize platform settings by fetching platform day start
 * Should be called on app initialization
 *
 * @returns Promise resolving to platform day start time
 */
export async function initializePlatformSettings(): Promise<string> {
  console.log('[platformSettingsService] Initializing platform settings...');

  try {
    const dayStart = await getPlatformDayStart(true); // Force refresh on init
    console.log(
      '[platformSettingsService] Platform day start initialized:',
      dayStart
    );
    return dayStart;
  } catch (error) {
    console.error(
      '[platformSettingsService] Failed to initialize platform settings:',
      error
    );
    return '00:00:00'; // Fallback default
  }
}

/**
 * Invalidate platform day start cache
 * Call this when admin changes the setting or you want to force refresh
 */
export function invalidatePlatformDayStart(): void {
  const store = usePlatformConfigStore.getState();
  store.reset();
  invalidatePlatformDayStartCache();
}

export const platformSettingsService = {
  getPlatformDayStart,
  initializePlatformSettings,
  invalidatePlatformDayStart,
};
