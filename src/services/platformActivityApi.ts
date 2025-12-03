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

      // Handle both wrapped and unwrapped responses
      let data: PlatformActivityResponse;
      if (response.data && 'success' in response.data) {
        data = response.data as PlatformActivityResponse;
      } else {
        // If response is unwrapped, wrap it
        data = {
          success: true,
          data: response.data as PlatformActivity[],
          count: Array.isArray(response.data) ? response.data.length : 0,
        };
      }

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('[Platform Activity] Error fetching activities:', error);

      // Return empty array on error (frontend will handle fallback)
      // Don't throw - let the component handle fallback gracefully
      return [];
    }
  }
}
