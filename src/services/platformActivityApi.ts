/**
 * Platform Activity API Service
 * Fetches live platform activities from backend
 */

import { api } from '@/lib/api';
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

      const response = await api.get<PlatformActivityResponse>(
        `${this.ENDPOINT}?${params.toString()}`
      );

      console.log('[PlatformActivityService] DEBUG_V2 Raw response:', response);
      console.log(
        '[PlatformActivityService] DEBUG_V2 Response data type:',
        typeof response.data
      );
      console.log(
        '[PlatformActivityService] DEBUG_V2 Response keys:',
        response.data ? Object.keys(response.data) : 'null'
      );

      // Handle both wrapped and unwrapped responses
      let data: PlatformActivityResponse;

      // Check if response data exists and has success property (standard API wrapper)
      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        data = response.data as unknown as PlatformActivityResponse;
      } else {
        // If response is unwrapped or doesn't match standard format, wrap it optimistically
        data = {
          success: true,
          data: (Array.isArray(response.data)
            ? response.data
            : []) as PlatformActivity[],
          count: Array.isArray(response.data) ? response.data.length : 0,
        };
      }

      // Check specifically for failure response from backend
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

      if (data.data) {
        return data.data;
      }

      console.error(
        '[PlatformActivityService] DEBUG_V2 success check failed. Data:',
        data
      );
      throw new Error('Invalid response format: missing data field (DEBUG_V2)');
    } catch (error: any) {
      console.error('[Platform Activity] Error fetching activities:', error);

      // Return empty array on error (frontend will handle fallback)
      // Don't throw - let the component handle fallback gracefully
      return [];
    }
  }
}
