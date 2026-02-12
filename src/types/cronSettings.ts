/**
 * Cron Settings - TypeScript Types
 *
 * Types for Multi-Slot Distribution Cron Configuration
 * Aligned with backend API v1.0 (February 2026)
 */

/**
 * Single distribution slot with time and optional label
 */
export interface DistributionSlot {
  time: string; // HH:MM:SS format (24-hour)
  label?: string; // Optional label like "Morning Distribution"
}

/**
 * Complete distribution schedule configuration
 */
export interface DistributionSchedule {
  isEnabled: boolean;
  mode: 'SINGLE_SLOT' | 'MULTI_SLOT';
  timezone: string; // IANA timezone name
  timezoneOffset: string; // "+01:00" format
  slots: DistributionSlot[];
  cronExpressions?: string[]; // Generated cron expressions
  createdAt: string;
  updatedAt: string;
}

/**
 * Timezone option for selection
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
  slotTime: string; // HH:MM:SS format
  label: string;
  nextRun: string; // ISO 8601 timestamp (UTC)
  localTime: string; // ISO 8601 timestamp with timezone
  timeUntil: string; // Human-readable duration "29 minutes"
}

/**
 * Schedule execution preview
 */
export interface SchedulePreview {
  currentTime: string; // ISO 8601 timestamp
  timezone: string;
  nextExecutions: NextExecution[];
}

/**
 * Update distribution schedule request
 */
export interface UpdateScheduleRequest {
  timezone: string;
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
