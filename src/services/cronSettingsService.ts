import { createAdminApi } from './adminService';
import type {
  DistributionScheduleResponse,
  TimezonesResponse,
  UpdateScheduleRequest,
  ToggleScheduleRequest,
  SchedulePreviewResponse,
  CronStatus,
  // Legacy types for backward compatibility
  ICronSettingsResponse,
  ITimezonesResponse,
  IUpdateCronSettingsRequest,
  IToggleCronSettingsRequest,
  ICronStatus,
} from '@/types/cronSettings';

/**
 * Cron Settings Service
 *
 * Handles multi-slot distribution cron configuration
 * API Version: v1.0 (February 2026)
 * Base URL: /api/v1/admin/cron-settings
 */
class CronSettingsService {
  private get2FACode: () => Promise<string | null>;

  constructor() {
    // Default: prompt for 2FA code (will be set by admin layout)
    this.get2FACode = async () => {
      return new Promise((resolve) => {
        const code = prompt('Enter 2FA code from your authenticator app:');
        resolve(code || null);
      });
    };
  }

  /**
   * Set custom 2FA code getter (e.g., from React context)
   */
  set2FACodeGetter(getter: () => Promise<string | null>): void {
    this.get2FACode = getter;
  }

  /**
   * Get available timezones
   * GET /api/v1/admin/cron-settings/timezones
   * No 2FA required for GET requests
   */
  async getTimezones(): Promise<TimezonesResponse> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get<TimezonesResponse>(
      '/admin/cron-settings/timezones'
    );
    return response.data;
  }

  /**
   * Get current distribution schedule
   * GET /api/v1/admin/cron-settings/distribution-schedule
   * No 2FA required for GET requests
   *
   * NOTE: Includes backward compatibility for old API format
   */
  async getDistributionSchedule(): Promise<DistributionScheduleResponse> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get<any>(
      '/admin/cron-settings/distribution-schedule'
    );

    // Transform old API format to new format if needed
    const rawData = response.data?.data || response.data;

    // Check if this is the old format (has numberOfSlots and schedules)
    if (rawData.schedules && rawData.numberOfSlots !== undefined) {
      // Old format - transform to new format
      const transformedData = {
        isEnabled: rawData.isEnabled ?? true,
        mode: (rawData.numberOfSlots === 1 ? 'SINGLE_SLOT' : 'MULTI_SLOT') as
          | 'SINGLE_SLOT'
          | 'MULTI_SLOT',
        timezone: rawData.timezone || 'Africa/Lagos',
        timezoneOffset: rawData.timezoneOffset || '+01:00',
        slots: (rawData.schedules || []).map((slot: any) => ({
          time: `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:${String(slot.second).padStart(2, '0')}`,
          label: slot.label || '',
        })),
        createdAt: rawData.createdAt || new Date().toISOString(),
        updatedAt: rawData.updatedAt || new Date().toISOString(),
      };

      return {
        success: response.data.success ?? true,
        message: response.data.message,
        data: transformedData,
      };
    }

    // New format or already transformed
    return response.data;
  }

  /**
   * Update distribution schedule
   * PUT /api/v1/admin/cron-settings/distribution-schedule
   * Requires 2FA if admin has it enabled
   * 🔄 Automatically restarts cron jobs without server restart!
   *
   * NOTE: Transforms new format to old backend format
   */
  async updateDistributionSchedule(
    data: UpdateScheduleRequest
  ): Promise<DistributionScheduleResponse> {
    const api = createAdminApi(this.get2FACode);

    // Transform new format (slots) to old backend format (schedules, numberOfSlots)
    const transformedData = {
      timezone: data.timezone,
      numberOfSlots: data.slots.length,
      schedules: data.slots.map((slot, index) => {
        // Parse time string "HH:MM:SS" back to hour, minute, second
        if (!slot.time || typeof slot.time !== 'string') {
          throw new Error(`Invalid time format for slot ${index + 1}`);
        }

        const parts = slot.time.split(':');
        if (parts.length !== 3) {
          throw new Error(
            `Time must be in HH:MM:SS format for slot ${index + 1}`
          );
        }

        const [hourStr, minuteStr, secondStr] = parts;
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const second = parseInt(secondStr, 10);

        // Validate parsed values
        if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
          throw new Error(
            `Invalid time values for slot ${index + 1}: ${slot.time}`
          );
        }

        if (
          hour < 0 ||
          hour > 23 ||
          minute < 0 ||
          minute > 59 ||
          second < 0 ||
          second > 59
        ) {
          throw new Error(
            `Time out of range for slot ${index + 1}: ${slot.time}`
          );
        }

        return {
          slotNumber: index + 1,
          hour,
          minute,
          second,
          label: slot.label || '',
        };
      }),
    };

    // Debug: log the transformed data
    console.log(
      '🔄 Sending to backend:',
      JSON.stringify(transformedData, null, 2)
    );

    const response = await api.put<any>(
      '/admin/cron-settings/distribution-schedule',
      transformedData
    );

    // Transform response back to new format if needed
    return this.getDistributionSchedule();
  }

  /**
   * Toggle distribution schedule enable/disable
   * PATCH /api/v1/admin/cron-settings/distribution-schedule/toggle
   * Requires 2FA if admin has it enabled
   */
  async toggleDistributionSchedule(
    data: ToggleScheduleRequest
  ): Promise<DistributionScheduleResponse> {
    const api = createAdminApi(this.get2FACode);
    await api.patch<any>(
      '/admin/cron-settings/distribution-schedule/toggle',
      data
    );

    // Refetch to get updated data in correct format
    return this.getDistributionSchedule();
  }

  /**
   * Preview schedule execution times
   * GET /api/v1/admin/cron-settings/distribution-schedule/preview
   * No 2FA required for GET requests
   *
   * @param timezone - Optional timezone override for preview
   * @param slots - Optional slots to preview
   */
  async getPreviewSchedule(
    timezone?: string,
    slots?: Array<{ time: string; label?: string }>
  ): Promise<SchedulePreviewResponse> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);

    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    if (slots) params.append('slots', JSON.stringify(slots));

    const queryString = params.toString();
    const url = queryString
      ? `/admin/cron-settings/distribution-schedule/preview?${queryString}`
      : '/admin/cron-settings/distribution-schedule/preview';

    const response = await api.get<SchedulePreviewResponse>(url);
    return response.data;
  }

  /**
   * Get public cron status (no auth required)
   * GET /cron-status
   */
  async getCronStatus(): Promise<CronStatus> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://api.novunt.com'}/cron-status`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch cron status');
    }
    return response.json();
  }
}

// Export singleton instance
export const cronSettingsService = new CronSettingsService();
