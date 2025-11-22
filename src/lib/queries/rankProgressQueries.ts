/**
 * Rank Progress React Query Hooks
 * Provides hooks for fetching and caching rank progress data
 */

import { useQuery } from '@tanstack/react-query';
import { getRankProgress } from '@/services/rankProgressApi';
import type { RankProgressData } from '@/types/rankProgress';

/**
 * Hook to fetch user's rank progress
 * Includes automatic caching and refetching
 */
export function useRankProgress() {
    return useQuery<RankProgressData, Error>({
        queryKey: ['rankProgress'],
        queryFn: getRankProgress,
        staleTime: 30 * 1000, // 30 seconds (as recommended by backend)
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 30 * 1000, // Poll every 30 seconds
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
