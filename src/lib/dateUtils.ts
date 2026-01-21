/**
 * Date utilities for daily profit system
 *
 * Backend treats dates as UTC day strings "YYYY-MM-DD" and compares using UTC day.
 * Never use timezone-aware Date parsing for business logic comparisons.
 */

/**
 * Get today's date as UTC day string (YYYY-MM-DD)
 * Matches backend's interpretation of "today"
 */
export function utcDayString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Format a date string (YYYY-MM-DD) for display
 * Uses UTC to avoid timezone shifts
 */
export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return dateStr; // Return as-is if invalid
  }

  // Create UTC date for stable formatting
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * Format a date string (YYYY-MM-DD) for display with weekday
 */
export function formatDateWithWeekday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return dateStr;
  }

  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * Format a date string (YYYY-MM-DD) as "MMM d, yyyy"
 */
export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return dateStr;
  }

  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * Format a date string (YYYY-MM-DD) as weekday name only
 */
export function formatWeekday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return dateStr;
  }

  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * Format a date string (YYYY-MM-DD) as short weekday (EEE)
 */
export function formatWeekdayShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return dateStr;
  }

  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * Compare two date strings (YYYY-MM-DD) lexicographically
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Check if a date string (YYYY-MM-DD) is in the past (before today UTC)
 */
export function isPastDate(dateStr: string, todayUtc?: string): boolean {
  const today = todayUtc || utcDayString();
  return dateStr < today;
}

/**
 * Check if a date string (YYYY-MM-DD) is today (UTC)
 */
export function isTodayDate(dateStr: string, todayUtc?: string): boolean {
  const today = todayUtc || utcDayString();
  return dateStr === today;
}

/**
 * Check if a date string (YYYY-MM-DD) is in the future (after today UTC)
 */
export function isFutureDate(dateStr: string, todayUtc?: string): boolean {
  const today = todayUtc || utcDayString();
  return dateStr > today;
}
