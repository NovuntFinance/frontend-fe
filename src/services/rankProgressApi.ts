/**
 * Rank Progress API Service
 * Handles API calls for rank progress data
 *
 * Updated to support two endpoints:
 * - Lightweight endpoint: Fast loading for dashboard (< 100ms)
 * - Detailed endpoint: Full information for pool page (1-3s)
 */

import { api } from '@/lib/api';
import type {
  RankProgressResponse,
  RankProgressData,
} from '@/types/rankProgress';

/**
 * Get user's rank progress (lightweight - for dashboard)
 * Response time: < 100ms
 * Use for: Dashboard display, quick rank updates
 *
 * @returns Promise resolving to lightweight rank progress data
 */
export async function getRankProgressLightweight(): Promise<RankProgressData> {
  try {
    console.log('[rankProgressApi] 🔄 Fetching lightweight rank progress...');

    // Use the lightweight endpoint
    const response = await api.get<RankProgressResponse | RankProgressData>(
      '/user-rank/rank-progress-lightweight'
    );

    // Handle two possible response formats:
    // 1. Wrapped: { success: true, data: {...}, meta: {...} }
    // 2. Unwrapped: { current_rank, next_rank, ... } (api.get may unwrap it)

    let data: RankProgressData;

    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      'success' in response
    ) {
      // Format 1: Wrapped response
      data = (response as RankProgressResponse).data;
    } else if (
      response &&
      typeof response === 'object' &&
      'current_rank' in response
    ) {
      // Format 2: Unwrapped (api.get unwrapped it)
      data = response as RankProgressData;
    } else {
      throw new Error('Unexpected response format');
    }

    console.log('[rankProgressApi] ✅ Lightweight rank progress fetched:', {
      currentRank: data.current_rank,
      nextRank: data.next_rank,
      progress: data.progress_percent ?? data.overall_progress_percent,
    });

    return data;
  } catch (error: any) {
    console.error(
      '[rankProgressApi] ❌ Error fetching lightweight rank progress:',
      {
        error,
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      }
    );

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('[rankProgressApi] User not authenticated');
      throw new Error('Authentication required');
    }

    if (error.response?.status === 404) {
      console.error(
        '[rankProgressApi] Endpoint not found - backend may not have deployed this yet'
      );
      throw new Error('Rank progress feature not available yet');
    }

    if (error.response?.status === 500) {
      console.error('[rankProgressApi] Server error');
      throw new Error('Server error - please try again later');
    }

    // Network or other errors
    if (!error.response) {
      console.error(
        '[rankProgressApi] Network error or endpoint not available'
      );
      throw new Error('Unable to connect to rank progress service');
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch rank progress'
    );
  }
}

/**
 * Get user's rank progress (detailed - for pool page)
 * Response time: 1-3 seconds
 * Use for: Pool page, "Show Details" button, full rank information
 *
 * @returns Promise resolving to detailed rank progress data
 */
export async function getRankProgressDetailed(): Promise<RankProgressData> {
  try {
    console.log('[rankProgressApi] 🔄 Fetching detailed rank progress...');

    // Use the detailed endpoint
    const response = await api.get<RankProgressResponse | RankProgressData>(
      '/user-rank/rank-progress'
    );

    // Handle two possible response formats:
    // 1. Wrapped: { success: true, data: {...}, meta: {...} }
    // 2. Unwrapped: { current_rank, next_rank, ... } (api.get may unwrap it)

    let data: RankProgressData;

    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      'success' in response
    ) {
      // Format 1: Wrapped response
      data = (response as RankProgressResponse).data;
    } else if (
      response &&
      typeof response === 'object' &&
      'current_rank' in response
    ) {
      // Format 2: Unwrapped (api.get unwrapped it)
      data = response as RankProgressData;
    } else {
      throw new Error('Unexpected response format');
    }

    console.log('[rankProgressApi] ✅ Detailed rank progress fetched:', {
      currentRank: data.current_rank,
      nextRank: data.next_rank,
      progress: data.overall_progress_percent ?? data.progress_percent,
      hasPoolQualification: !!data.pool_qualification,
    });

    return data;
  } catch (error: any) {
    console.error(
      '[rankProgressApi] ❌ Error fetching detailed rank progress:',
      {
        error,
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      }
    );

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('[rankProgressApi] User not authenticated');
      throw new Error('Authentication required');
    }

    if (error.response?.status === 404) {
      console.error(
        '[rankProgressApi] Endpoint not found - backend may not have deployed this yet'
      );
      throw new Error('Rank progress feature not available yet');
    }

    if (error.response?.status === 500) {
      console.error('[rankProgressApi] Server error');
      throw new Error('Server error - please try again later');
    }

    // Network or other errors
    if (!error.response) {
      console.error(
        '[rankProgressApi] Network error or endpoint not available'
      );
      throw new Error('Unable to connect to rank progress service');
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch rank progress'
    );
  }
}

/**
 * Get user's rank progress (lightweight by default for backward compatibility)
 * @deprecated Use getRankProgressLightweight() for dashboard or getRankProgressDetailed() for pool page
 * @returns Promise resolving to rank progress data
 */
export async function getRankProgress(): Promise<RankProgressData> {
  try {
    console.log(
      '[rankProgressApi] ⚠️ getRankProgress() is deprecated. Use getRankProgressLightweight() or getRankProgressDetailed() instead.'
    );
    console.log(
      '[rankProgressApi] 🔄 Fetching rank progress (using lightweight endpoint)...'
    );

    // Use lightweight endpoint for backward compatibility
    const response = await api.get<RankProgressResponse | RankProgressData>(
      '/user-rank/rank-progress-lightweight'
    );

    // Handle two possible response formats:
    // 1. Wrapped: { success: true, data: {...}, meta: {...} }
    // 2. Unwrapped: { current_rank, next_rank, ... } (api.get may unwrap it)

    let data: RankProgressData;

    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      'success' in response
    ) {
      // Format 1: Wrapped response
      data = (response as RankProgressResponse).data;
    } else if (
      response &&
      typeof response === 'object' &&
      'current_rank' in response
    ) {
      // Format 2: Unwrapped (api.get unwrapped it)
      data = response as RankProgressData;
    } else {
      throw new Error('Unexpected response format');
    }

    console.log('[rankProgressApi] ✅ Rank progress fetched:', {
      currentRank: data.current_rank,
      nextRank: data.next_rank,
      progress: data.overall_progress_percent,
    });

    return data;
  } catch (error: any) {
    console.error('[rankProgressApi] ❌ Error fetching rank progress:', {
      error,
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('[rankProgressApi] User not authenticated');
      throw new Error('Authentication required');
    }

    if (error.response?.status === 404) {
      console.error(
        '[rankProgressApi] Endpoint not found - backend may not have deployed this yet'
      );
      throw new Error('Rank progress feature not available yet');
    }

    if (error.response?.status === 500) {
      console.error('[rankProgressApi] Server error');
      throw new Error('Server error - please try again later');
    }

    // Network or other errors
    if (!error.response) {
      console.error(
        '[rankProgressApi] Network error or endpoint not available'
      );
      throw new Error('Unable to connect to rank progress service');
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch rank progress'
    );
  }
}
