/**
 * Rank Progress API Service
 * Handles API calls for rank progress data
 */

import { api } from '@/lib/api';
import type { RankProgressResponse, RankProgressData } from '@/types/rankProgress';

/**
 * Get user's rank progress
 * @returns Promise resolving to rank progress data
 */
export async function getRankProgress(): Promise<RankProgressData> {
    try {
        console.log('[rankProgressApi] 🔄 Fetching rank progress...');

        // api.get returns the unwrapped response data directly
        const response = await api.get<RankProgressResponse | RankProgressData>('/user/rank-progress');

        // Handle two possible response formats:
        // 1. Wrapped: { success: true, data: {...}, meta: {...} }
        // 2. Unwrapped: { current_rank, next_rank, ... } (api.get may unwrap it)

        let data: RankProgressData;

        if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
            // Format 1: Wrapped response
            data = (response as RankProgressResponse).data;
        } else if (response && typeof response === 'object' && 'current_rank' in response) {
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
            console.error('[rankProgressApi] Endpoint not found - backend may not have deployed this yet');
            throw new Error('Rank progress feature not available yet');
        }

        if (error.response?.status === 500) {
            console.error('[rankProgressApi] Server error');
            throw new Error('Server error - please try again later');
        }

        // Network or other errors
        if (!error.response) {
            console.error('[rankProgressApi] Network error or endpoint not available');
            throw new Error('Unable to connect to rank progress service');
        }

        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch rank progress');
    }
}
