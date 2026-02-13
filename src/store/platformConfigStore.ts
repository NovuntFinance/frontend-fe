/**
 * Platform Configuration Store
 *
 * Manages platform-wide configuration including the platform day start time.
 * This is a global store using Zustand for consistent state management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlatformConfigState {
  platformDayStart: string | null;
  lastFetchTime: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPlatformDayStart: (dayStart: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePlatformConfigStore = create<PlatformConfigState>()(
  persist(
    (set) => ({
      platformDayStart: null,
      lastFetchTime: null,
      isLoading: false,
      error: null,

      setPlatformDayStart: (dayStart: string) =>
        set({
          platformDayStart: dayStart,
          lastFetchTime: Date.now(),
          error: null,
        }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error, isLoading: false }),

      reset: () =>
        set({
          platformDayStart: null,
          lastFetchTime: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'platform-config-storage',
      // Only persist the platform day start and fetch time
      partialize: (state) => ({
        platformDayStart: state.platformDayStart,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);

/**
 * Check if the cached platform day start is still valid
 */
export function isCacheValid(): boolean {
  const { lastFetchTime } = usePlatformConfigStore.getState();
  if (!lastFetchTime) return false;
  return Date.now() - lastFetchTime < CACHE_TTL;
}

/**
 * Get platform day start from store or null if not available
 */
export function getPlatformDayStartFromStore(): string | null {
  const { platformDayStart } = usePlatformConfigStore.getState();
  return platformDayStart;
}
