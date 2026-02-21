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
    // Handle 401/403 gracefully - public endpoint may require auth on some backends
    // or return FORBIDDEN when user lacks permission; use default and don't throw
    const status = error?.response?.status || error?.statusCode;

    if (status === 401 || status === 403) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[platformSettingsService]',
          status === 403 ? '403 Forbidden' : '401 Unauthorized',
          '- Using default platform day start (00:00:00).'
        );
      }
      return '00:00:00';
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[platformSettingsService] Failed to fetch platform day start:',
        error?.message ?? error
      );
    }
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
    const status = error?.response?.status || error?.statusCode;

    // 401/403: use default without setting error state (expected for public endpoint when backend restricts access)
    if (status === 401 || status === 403) {
      const defaultValue = '00:00:00';
      store.setPlatformDayStart(defaultValue);
      return defaultValue;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    store.setError(errorMessage);

    if (store.platformDayStart) {
      return store.platformDayStart;
    }

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
  try {
    const dayStart = await getPlatformDayStart(true); // Force refresh on init
    return dayStart;
  } catch {
    // getPlatformDayStart already falls back to 00:00:00 for 401/403; any other error use default
    return '00:00:00';
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
