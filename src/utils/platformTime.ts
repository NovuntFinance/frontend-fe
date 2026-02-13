/**
 * Platform Time Utilities for Frontend
 *
 * Provides functions to work with the unified UTC-based platform time system.
 * All date/time calculations must use UTC methods (not local browser time).
 *
 * @see FRONTEND_QUICK_START.md
 * @see FRONTEND_PLATFORM_TIME_INTEGRATION_GUIDE.md
 */

let cachedPlatformDayStart: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch platform day start from backend
 * @returns Promise resolving to platform day start time in "HH:MM:SS" format
 */
async function fetchPlatformDayStart(): Promise<string> {
  const apiBaseURL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Remove /api/v1 suffix if present to construct the public endpoint URL
  const baseURL = apiBaseURL.replace(/\/api\/v1$/, '');
  const endpoint = `${baseURL}/api/v1/settings/public/platform_day_start_utc`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch platform day start: ${response.status}`);
  }

  const data = await response.json();
  return data.data.value; // Expected format: "00:00:00"
}

/**
 * Get cached platform day start (auto-refreshes every 5 minutes)
 * @returns Promise resolving to platform day start time in "HH:MM:SS" format
 */
export async function getCachedPlatformDayStart(): Promise<string> {
  const now = Date.now();

  if (!cachedPlatformDayStart || now - cacheTimestamp >= CACHE_TTL) {
    try {
      cachedPlatformDayStart = await fetchPlatformDayStart();
      cacheTimestamp = now;
    } catch (error) {
      console.error(
        '[platformTime] Failed to fetch platform day start:',
        error
      );

      // Fallback to default if fetch fails and no cache exists
      if (!cachedPlatformDayStart) {
        cachedPlatformDayStart = '00:00:00';
      }
    }
  }

  return cachedPlatformDayStart;
}

/**
 * Invalidate cache (call when admin changes setting)
 */
export function invalidatePlatformDayStartCache(): void {
  cachedPlatformDayStart = null;
  cacheTimestamp = 0;
}

/**
 * Parse platform day start string to seconds since midnight
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Number of seconds since midnight UTC
 */
export function parsePlatformDayStartSeconds(
  platformDayStartUTC: string
): number {
  const [hours, minutes, seconds] = platformDayStartUTC.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Get current platform day start
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Date object representing the current platform day start in UTC
 */
export function getCurrentPlatformDayStart(platformDayStartUTC: string): Date {
  const now = new Date();
  const [hours, minutes, seconds] = platformDayStartUTC.split(':').map(Number);

  const dayStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      seconds,
      0
    )
  );

  // If current time is before today's day start, use yesterday's day start
  if (now < dayStart) {
    dayStart.setUTCDate(dayStart.getUTCDate() - 1);
  }

  return dayStart;
}

/**
 * Get platform day start for a specific date
 * @param date - The date to get platform day start for
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Date object representing the platform day start for the given date
 */
export function getPlatformDayStartForDate(
  date: Date,
  platformDayStartUTC: string
): Date {
  const [hours, minutes, seconds] = platformDayStartUTC.split(':').map(Number);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      seconds,
      0
    )
  );
}

/**
 * Get current platform day range (start + end)
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Object with start and end Date objects for current platform day
 */
export function getCurrentPlatformDayRange(platformDayStartUTC: string): {
  start: Date;
  end: Date;
} {
  const start = getCurrentPlatformDayStart(platformDayStartUTC);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  end.setUTCMilliseconds(-1); // 23:59:59.999

  return { start, end };
}

/**
 * Get platform day range for a specific date
 * @param date - The date to get platform day range for
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Object with start and end Date objects for the platform day
 */
export function getPlatformDayRangeForDate(
  date: Date,
  platformDayStartUTC: string
): { start: Date; end: Date } {
  const start = getPlatformDayStartForDate(date, platformDayStartUTC);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  end.setUTCMilliseconds(-1); // 23:59:59.999

  return { start, end };
}

/**
 * Get next platform day reset time
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Date object representing when the next platform day starts
 */
export function getNextPlatformDayReset(platformDayStartUTC: string): Date {
  const { end } = getCurrentPlatformDayRange(platformDayStartUTC);
  const nextReset = new Date(end);
  nextReset.setUTCMilliseconds(1);
  return nextReset;
}

/**
 * Get milliseconds until next platform day reset
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Number of milliseconds until next reset
 */
export function getTimeUntilReset(platformDayStartUTC: string): number {
  const nextReset = getNextPlatformDayReset(platformDayStartUTC);
  return nextReset.getTime() - Date.now();
}

/**
 * Format time duration in human-readable format
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted string like "5h 23m" or "30m" or "45s"
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

/**
 * Check if a date is within the current platform day
 * @param date - Date to check
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Boolean indicating if the date is within current platform day
 */
export function isWithinCurrentPlatformDay(
  date: Date,
  platformDayStartUTC: string
): boolean {
  const { start, end } = getCurrentPlatformDayRange(platformDayStartUTC);
  return date >= start && date <= end;
}

/**
 * Get ISO string for platform day start (for API queries)
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns ISO 8601 string in UTC format
 */
export function getCurrentPlatformDayStartISO(
  platformDayStartUTC: string
): string {
  return getCurrentPlatformDayStart(platformDayStartUTC).toISOString();
}

/**
 * Get ISO string for platform day end (for API queries)
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns ISO 8601 string in UTC format
 */
export function getCurrentPlatformDayEndISO(
  platformDayStartUTC: string
): string {
  return getCurrentPlatformDayRange(platformDayStartUTC).end.toISOString();
}

/**
 * Apply platform day start offset to a date
 * @param date - Date to apply offset to
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns New Date object with platform day start applied
 */
export function applyPlatformDayStartToDate(
  date: Date,
  platformDayStartUTC: string
): Date {
  const offsetSeconds = parsePlatformDayStartSeconds(platformDayStartUTC);
  const result = new Date(date);
  result.setUTCSeconds(result.getUTCSeconds() - offsetSeconds);
  return result;
}

/**
 * Format a date as platform day string (YYYY-MM-DD based on platform day)
 * @param date - Date to format
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Date string in "YYYY-MM-DD" format
 */
export function formatPlatformDay(
  date: Date,
  platformDayStartUTC: string
): string {
  const dayStart = getPlatformDayStartForDate(date, platformDayStartUTC);
  const year = dayStart.getUTCFullYear();
  const month = String(dayStart.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dayStart.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the platform day for a given timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Date string in "YYYY-MM-DD" format representing the platform day
 */
export function getPlatformDayFromTimestamp(
  timestamp: number,
  platformDayStartUTC: string
): string {
  const date = new Date(timestamp);
  return formatPlatformDay(date, platformDayStartUTC);
}

/**
 * Get week start and end dates based on platform day
 * @param platformDayStartUTC - Time string in "HH:MM:SS" format
 * @returns Object with start and end Date objects for current platform week
 */
export function getCurrentPlatformWeekRange(platformDayStartUTC: string): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate Monday of current week
  const daysSinceMonday = (dayOfWeek + 6) % 7; // Convert to Monday-based week
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - daysSinceMonday);

  // Apply platform day start to week start
  const [hours, minutes, seconds] = platformDayStartUTC.split(':').map(Number);
  weekStart.setUTCHours(hours, minutes, seconds, 0);

  // Calculate Sunday of current week
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
}
