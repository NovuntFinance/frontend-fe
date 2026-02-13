/**
 * Platform Time Hooks
 *
 * React hooks for working with the unified platform time system.
 * These hooks integrate with the Zustand store and provide easy access
 * to platform day boundaries and reset timers.
 */

import { useEffect, useState } from 'react';
import { usePlatformConfigStore } from '@/store/platformConfigStore';
import { getPlatformDayStart } from '@/services/platformSettingsService';
import {
  getTimeUntilReset,
  formatDuration,
  getCurrentPlatformDayStartISO,
  getCurrentPlatformDayEndISO,
} from '@/utils/platformTime';

/**
 * Hook to get the platform day start time
 * Automatically fetches from backend if not cached
 *
 * @returns Platform day start time in "HH:MM:SS" format
 */
export function usePlatformDayStart(): string {
  const platformDayStart = usePlatformConfigStore(
    (state) => state.platformDayStart
  );
  const isLoading = usePlatformConfigStore((state) => state.isLoading);

  useEffect(() => {
    if (!platformDayStart && !isLoading) {
      getPlatformDayStart().catch(console.error);
    }
  }, [platformDayStart, isLoading]);

  return platformDayStart || '00:00:00';
}

/**
 * Hook to get the current platform day boundaries
 *
 * @returns Object with start and end ISO strings for current platform day
 */
export function usePlatformDayRange() {
  const platformDayStart = usePlatformDayStart();

  return {
    start: getCurrentPlatformDayStartISO(platformDayStart),
    end: getCurrentPlatformDayEndISO(platformDayStart),
    startDate: new Date(getCurrentPlatformDayStartISO(platformDayStart)),
    endDate: new Date(getCurrentPlatformDayEndISO(platformDayStart)),
  };
}

/**
 * Hook to get time until next platform day reset
 * Updates every second
 *
 * @returns Object with milliseconds until reset and formatted string
 */
export function useTimeUntilReset() {
  const platformDayStart = usePlatformDayStart();
  const [timeUntilReset, setTimeUntilReset] = useState(() =>
    getTimeUntilReset(platformDayStart)
  );

  useEffect(() => {
    // Update immediately
    setTimeUntilReset(getTimeUntilReset(platformDayStart));

    // Update every second
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilReset(platformDayStart));
    }, 1000);

    return () => clearInterval(interval);
  }, [platformDayStart]);

  return {
    milliseconds: timeUntilReset,
    formatted: formatDuration(timeUntilReset),
  };
}

/**
 * Hook to trigger a callback when the platform day resets
 * Useful for refetching data that's day-specific
 *
 * @param callback - Function to call when day resets
 */
export function useOnPlatformDayReset(callback: () => void) {
  const platformDayStart = usePlatformDayStart();

  useEffect(() => {
    const timeUntilResetMs = getTimeUntilReset(platformDayStart);

    const timer = setTimeout(() => {
      callback();

      // Set up next day's reset
      // This will be cleaned up and recreated by the effect
      const nextReset = 24 * 60 * 60 * 1000; // 24 hours
      setTimeout(callback, nextReset);
    }, timeUntilResetMs);

    return () => clearTimeout(timer);
  }, [platformDayStart, callback]);
}

/**
 * Hook to get platform day information
 *
 * @returns Complete platform day information including boundaries and countdown
 */
export function usePlatformDay() {
  const platformDayStart = usePlatformDayStart();
  const dayRange = usePlatformDayRange();
  const resetInfo = useTimeUntilReset();

  return {
    platformDayStart,
    ...dayRange,
    ...resetInfo,
  };
}
