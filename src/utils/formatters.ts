/**
 * Formatting Utilities for 4-Decimal Precision
 * Backend now returns all values with 4 decimals
 * Frontend should consistently display with 4 decimals
 *
 * Date: February 13, 2026
 * Status: Production Ready
 */

/**
 * Format number to exactly 4 decimal places
 * @param n - Number to format (handles null/undefined safely)
 * @returns String with 4 decimal places (e.g., "1000.0000")
 * @example fmt4(1000) → "1000.0000"
 * @example fmt4(25.5) → "25.5000"
 * @example fmt4(null) → "0.0000"
 */
export const fmt4 = (n: number | null | undefined): string => {
  return Number(n || 0).toFixed(4);
};

/**
 * Format number as percentage with 4 decimal places
 * @param n - Number to format (handles null/undefined safely)
 * @returns String with 4 decimals + '%' (e.g., "1.2000%")
 * @example pct4(1.2) → "1.2000%"
 * @example pct4(45.6789) → "45.6789%"
 * @example pct4(null) → "0.0000%"
 */
export const pct4 = (n: number | null | undefined): string => {
  return `${Number(n || 0).toFixed(4)}%`;
};

/**
 * Format currency with 4 decimals + currency symbol
 * @param n - Number to format
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted currency string
 * @example currency4(1000) → "$1000.0000"
 * @example currency4(25.5, '₦') → "₦25.5000"
 */
export const currency4 = (
  n: number | null | undefined,
  currency: string = '$'
): string => {
  return `${currency}${fmt4(n)}`;
};

/**
 * Format number with thousand separators + 4 decimals
 * @param n - Number to format
 * @returns String with commas and 4 decimals
 * @example fmt4WithCommas(1000000) → "1,000,000.0000"
 * @example fmt4WithCommas(1234.56) → "1,234.5600"
 */
export const fmt4WithCommas = (n: number | null | undefined): string => {
  const num = Number(n || 0);
  const fixed = num.toFixed(4);
  const parts = fixed.split('.');

  // Add thousand separators to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

/**
 * Format as NXP currency (platform native currency)
 * @param n - Number to format
 * @returns Formatted NXP value with commas
 * @example nxp4(1000) → "1,000.0000 NXP"
 * @example nxp4(25.5) → "25.5000 NXP"
 */
export const nxp4 = (n: number | null | undefined): string => {
  return `${fmt4WithCommas(n)} NXP`;
};

/**
 * Format as USD currency
 * @param n - Number to format
 * @returns Formatted USD value with commas
 * @example usd4(1000) → "$1,000.0000"
 */
export const usd4 = (n: number | null | undefined): string => {
  return `$${fmt4WithCommas(n)}`;
};

/**
 * Parse backend value (string or number) to number
 * Handles cases where backend might send formatted strings
 * @param s - String or number from backend
 * @returns Number value
 * @example parseBackendNumber("1,000.5000") → 1000.5
 * @example parseBackendNumber(1000.5) → 1000.5
 */
export const parseBackendNumber = (
  s: string | number | null | undefined
): number => {
  if (typeof s === 'number') return s;
  if (!s) return 0;

  // Remove commas and convert to number
  return parseFloat(String(s).replace(/,/g, ''));
};

/**
 * Format ROS (Return on Stake) percentage
 * Alias for pct4 for semantic clarity
 * @param ros - ROS percentage value
 * @returns Formatted ROS string
 * @example formatROS(1.2) → "1.2000%"
 */
export const formatROS = (ros: number | null | undefined): string => {
  return pct4(ros);
};

/**
 * Format progress percentage (0-100 range)
 * @param progress - Progress value (0-100)
 * @returns Formatted progress string
 * @example formatProgress(45.6789) → "45.6789%"
 */
export const formatProgress = (progress: number | null | undefined): string => {
  return pct4(progress);
};

/**
 * Format stake amount with proper currency
 * @param amount - Stake amount
 * @returns Formatted stake amount
 * @example formatStakeAmount(1000) → "1,000.0000 NXP"
 */
export const formatStakeAmount = (
  amount: number | null | undefined
): string => {
  return nxp4(amount);
};

/**
 * Format earnings/profit with proper currency
 * @param earnings - Earnings amount
 * @returns Formatted earnings
 * @example formatEarnings(25.5) → "25.5000 NXP"
 */
export const formatEarnings = (earnings: number | null | undefined): string => {
  return nxp4(earnings);
};

/**
 * Check if value is zero or negligible (< 0.0001)
 * Useful for conditional rendering
 * @param n - Number to check
 * @returns True if effectively zero
 * @example isEffectivelyZero(0.00001) → true
 * @example isEffectivelyZero(0.0001) → false
 */
export const isEffectivelyZero = (n: number | null | undefined): boolean => {
  return Math.abs(Number(n || 0)) < 0.0001;
};

/**
 * Format compact number (for large values in limited space)
 * @param n - Number to format
 * @returns Compact string (e.g., "1.2000K", "3.4567M")
 * @example formatCompact(1234) → "1.2340K"
 * @example formatCompact(1234567) → "1.2346M"
 */
export const formatCompact = (n: number | null | undefined): string => {
  const num = Number(n || 0);

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(4)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(4)}K`;
  }

  return fmt4(num);
};

/**
 * Format for API display (admin debugging)
 * Shows raw value with high precision
 * @param n - Number to format
 * @returns String with up to 8 decimals (for debugging)
 */
export const formatRaw = (n: number | null | undefined): string => {
  return Number(n || 0).toFixed(8);
};

// Type definitions for better TypeScript support
export type NumberLike = number | null | undefined | string;

/**
 * Safe number conversion from any value
 * @param value - Value to convert
 * @returns Number or 0 if conversion fails
 */
export const toNumber = (value: NumberLike): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const parsed = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

// Export all formatters as a namespace for convenience
export const Formatters = {
  fmt4,
  pct4,
  currency4,
  fmt4WithCommas,
  nxp4,
  usd4,
  parseBackendNumber,
  formatROS,
  formatProgress,
  formatStakeAmount,
  formatEarnings,
  isEffectivelyZero,
  formatCompact,
  formatRaw,
  toNumber,
};

// Default export for convenience
export default Formatters;
