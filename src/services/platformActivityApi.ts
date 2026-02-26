/**
 * Platform Activity API Service
 * Fetches live platform activities from backend
 */

import { api } from '@/lib/api';
import { getErrorMessage, isNetworkError } from '@/lib/error-utils';
import type {
  PlatformActivity,
  PlatformActivityResponse,
  PlatformActivityType,
} from '@/types/platformActivity';

export class PlatformActivityService {
  private static readonly ENDPOINT = '/platform/activity';

  /**
   * Fetch platform activities
   * @param limit - Number of activities (default: 1, max: 10)
   * @param types - Optional array of activity types to filter
   * @returns Array of platform activities
   */
  static async getActivities(
    limit: number = 1,
    types?: PlatformActivityType[]
  ): Promise<PlatformActivity[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', Math.min(limit, 10).toString()); // Max 10

      if (types && types.length > 0) {
        params.append('types', types.join(','));
      }

      const response = await api.get<
        PlatformActivityResponse | PlatformActivity[]
      >(`${this.ENDPOINT}?${params.toString()}`);

      // API client may return unwrapped array or full wrapper
      if (Array.isArray(response)) {
        return response;
      }

      // Handle wrapped response { success, data, count }
      const data = response as PlatformActivityResponse;
      if (data.success === false) {
        const errorMsg =
          (data as any).error?.message ||
          (data as any).message ||
          'Failed to fetch platform activities';
        const errorCode =
          (data as any).error?.code || (data as any).code || 'UNKNOWN_ERROR';
        console.error(
          `[PlatformActivityService] Backend error: ${errorCode} - ${errorMsg}`
        );
        throw new Error(errorMsg);
      }

      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error: any) {
      const msg = getErrorMessage(error, 'Request failed');
      if (isNetworkError(error)) {
        console.warn('[Platform Activity] Activities unavailable:', msg);
      } else {
        console.error('[Platform Activity] Error fetching activities:', msg);
      }

      // Return empty array on error (frontend will handle fallback)
      // Don't throw - let the component handle fallback gracefully
      return [];
    }
  }
}
