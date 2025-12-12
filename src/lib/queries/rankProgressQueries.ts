/**
 * Rank Progress React Query Hooks
 * Provides hooks for fetching and caching rank progress data
 *
 * Updated to support two endpoints:
 * - Lightweight: Fast loading for dashboard (< 100ms)
 * - Detailed: Full information for pool page (1-3s)
 *
 * No polling needed - ranks update instantly on backend.
 * Refresh after user actions (stake creation, referral addition, etc.)
 */

import { useQuery } from '@tanstack/react-query';
import {
  getRankProgressLightweight,
  getRankProgressDetailed,
  getRankProgress,
} from '@/services/rankProgressApi';
import type { RankProgressData } from '@/types/rankProgress';

/**
 * Hook to fetch user's rank progress (lightweight - for dashboard)
 * Response time: < 100ms
 * Use for: Dashboard display, quick rank updates
 *
 * No polling - ranks update instantly on backend. Refresh after user actions.
 */
export function useRankProgressLightweight() {
  return useQuery<RankProgressData, Error>({
    queryKey: ['rankProgress', 'lightweight'],
    queryFn: getRankProgressLightweight,
    staleTime: 5 * 60 * 1000, // 5 minutes - ranks update after actions, not on schedule
    gcTime: 10 * 60 * 1000, // 10 minutes
    // No refetchInterval - ranks update instantly on backend, refresh after actions
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch user's rank progress (detailed - for pool page)
 * Response time: 1-3 seconds
 * Use for: Pool page, "Show Details" button, full rank information
 *
 * No polling - ranks update instantly on backend. Refresh after user actions.
 */
export function useRankProgressDetailed() {
  return useQuery<RankProgressData, Error>({
    queryKey: ['rankProgress', 'detailed'],
    queryFn: getRankProgressDetailed,
    staleTime: 5 * 60 * 1000, // 5 minutes - ranks update after actions, not on schedule
    gcTime: 10 * 60 * 1000, // 10 minutes
    // No refetchInterval - ranks update instantly on backend, refresh after actions
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch user's rank progress (lightweight by default)
 *
 * @deprecated Use useRankProgressLightweight() for dashboard or useRankProgressDetailed() for pool page
 * This hook is kept for backward compatibility but uses the lightweight endpoint
 */
export function useRankProgress() {
  return useQuery<RankProgressData, Error>({
    queryKey: ['rankProgress'],
    queryFn: getRankProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes - ranks update after actions, not on schedule
    gcTime: 10 * 60 * 1000, // 10 minutes
    // No refetchInterval - ranks update instantly on backend, refresh after actions
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
