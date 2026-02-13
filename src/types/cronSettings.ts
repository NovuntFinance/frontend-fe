/**
 * Cron Settings - TypeScript Types
 *
 * Types for Multi-Slot Distribution Cron Configuration
 * Aligned with backend API v1.0 (February 2026)
 *
 * ============================================================
 * PLATFORM TIME SYSTEM - SINGLE SOURCE OF TRUTH
 * ============================================================
 *
 * The platform uses a unified UTC-based time system controlled by
 * the `platform_day_start_utc` backend setting. This is the ONLY
 * time system used across the entire platform.
 *
 * Key Principles:
 * - All slot times are in UTC (HH:MM:SS format)
 * - No timezone conversions or local time logic
 * - Platform day boundaries defined by `platform_day_start_utc`
 * - Single source of truth for all timing operations
 *
 * Legacy timezone fields are kept for backward compatibility only.
 * ============================================================
 */

/**
 * Single distribution slot with time and optional label
 *
 * @property time - Slot execution time in UTC (HH:MM:SS format, 24-hour)
 * @property label - Optional human-readable label for the slot
 */
export interface DistributionSlot {
  time: string; // HH:MM:SS format in UTC (e.g., "12:00:00" = noon UTC)
  label?: string; // Optional label like "Morning Distribution"
}

/**
 * Complete distribution schedule configuration
 *
 * @property timezone - @deprecated Legacy field. Always "UTC" in platform time system.
 * @property timezoneOffset - @deprecated Legacy field. Always "+00:00" in platform time system.
 */
export interface DistributionSchedule {
  isEnabled: boolean;
  mode: 'SINGLE_SLOT' | 'MULTI_SLOT';
  timezone: string; // @deprecated Always "UTC" - kept for backward compatibility
  timezoneOffset: string; // @deprecated Always "+00:00" - kept for backward compatibility
  slots: DistributionSlot[];
  cronExpressions?: string[]; // Generated cron expressions
  createdAt: string;
  updatedAt: string;
}

/**
 * Timezone option for selection
 * @deprecated The platform time system uses UTC exclusively.
 * This type is kept for legacy API compatibility only.
 */
export interface Timezone {
  name: string; // IANA timezone name "Africa/Lagos"
  offset: string; // "+01:00" format
  displayName: string; // "West Africa Time (WAT)"
}

/**
 * Next execution preview item
 */
export interface NextExecution {
  slotNumber: number;
  slotTime: string; // HH:MM:SS format in UTC
  label: string;
  nextRun: string; // ISO 8601 timestamp (UTC)
  localTime: string; // ISO 8601 timestamp (for display purposes)
  timeUntil: string; // Human-readable duration "29 minutes"
}

/**
 * Schedule execution preview
 *
 * @property timezone - Should always be "UTC" in platform time system
 */
export interface SchedulePreview {
  currentTime: string; // ISO 8601 timestamp (UTC)
  timezone: string; // Always "UTC" in platform time system
  nextExecutions: NextExecution[];
}

/**
 * Update distribution schedule request
 *
 * @property timezone - Should always be "UTC". Legacy field kept for API compatibility.
 */
export interface UpdateScheduleRequest {
  timezone: string; // Always "UTC" - platform time system
  slots: DistributionSlot[];
}

/**
 * Toggle schedule request
 */
export interface ToggleScheduleRequest {
  isEnabled: boolean;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Timezones list response
 */
export interface TimezonesResponse {
  success: boolean;
  data: {
    timezones: Timezone[];
    total: number;
  };
}

/**
 * Distribution schedule response
 */
export interface DistributionScheduleResponse {
  success: boolean;
  message?: string;
  data: DistributionSchedule;
}

/**
 * Schedule preview response
 */
export interface SchedulePreviewResponse {
  success: boolean;
  data: SchedulePreview;
}

/**
 * Public cron status (from /cron-status endpoint)
 */
export interface CronStatus {
  status: 'active' | 'inactive';
  mode: 'fixed' | 'dynamic';
  numberOfSlots: number;
  nextExecution?: {
    slot: number;
    time: string;
    label?: string;
  };
  timezone?: string;
  schedules?: {
    slotNumber: number;
    scheduledTime: string;
    label?: string;
  }[];
  isEnabled: boolean;
  lastUpdate?: string;
  message?: string;
}

// ============================================
// Legacy types for backward compatibility
// TODO: Remove after full migration
// ============================================

/**
 * @deprecated Use DistributionSlot instead
 */
export interface IScheduleSlot {
  slotNumber: number;
  hour: number;
  minute: number;
  second: number;
  label?: string;
}

/**
 * @deprecated Use DistributionSchedule instead
 */
export interface ICronSettings {
  settingType: 'daily_distribution';
  timezone: string;
  timezoneOffset: string;
  numberOfSlots: number;
  schedules: IScheduleSlot[];
  isEnabled: boolean;
  nextExecutions?: {
    slotNumber: number;
    scheduledFor: string;
    label?: string;
  }[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @deprecated Use Timezone instead
 */
export interface ITimezone {
  value: string;
  label: string;
  offset: string;
  region: string;
}

/**
 * @deprecated No longer used (timezones not grouped)
 */
export interface ITimezoneGroup {
  region: string;
  timezones: ITimezone[];
}

/**
 * @deprecated Use UpdateScheduleRequest instead
 */
export interface IUpdateCronSettingsRequest {
  timezone: string;
  numberOfSlots: number;
  schedules: IScheduleSlot[];
}

/**
 * @deprecated Use ToggleScheduleRequest instead
 */
export interface IToggleCronSettingsRequest {
  isEnabled: boolean;
}

/**
 * @deprecated Use DistributionScheduleResponse instead
 */
export interface ICronSettingsResponse {
  success: boolean;
  message?: string;
  data: ICronSettings;
}

/**
 * @deprecated Use TimezonesResponse instead
 */
export interface ITimezonesResponse {
  success: boolean;
  data: {
    timezones: ITimezone[];
    grouped: ITimezoneGroup[];
  };
}

/**
 * @deprecated Use CronStatus instead
 */
export interface ICronStatus {
  status: 'active' | 'inactive';
  mode: 'fixed' | 'dynamic';
  numberOfSlots: number;
  nextExecution?: {
    slot: number;
    time: string;
    label?: string;
  };
  timezone?: string;
  schedules?: {
    slotNumber: number;
    scheduledTime: string;
    label?: string;
  }[];
  isEnabled: boolean;
  lastUpdate?: string;
  message?: string;
}
