/**
 * Achievement and NXP React Query Hooks
 * Provides hooks for fetching and caching achievement and NXP data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEarnedBadges,
  getBadgeProgress,
  getBadgeCatalog,
  toggleBadgeDisplay,
} from '@/services/achievementApi';
import {
  getNXPBalance,
  getNXPHistory,
  getNXPStats,
  getNXPLeaderboard,
} from '@/services/nxpApi';
import type {
  EarnedBadgesResponse,
  BadgeProgressResponse,
  BadgeCatalogResponse,
  NXPBalanceResponse,
  NXPHistoryResponse,
  NXPStatsResponse,
  NXPLeaderboardResponse,
} from '@/types/achievements';

/**
 * Query Keys
 */
export const achievementQueryKeys = {
  earnedBadges: ['achievements', 'earned'] as const,
  badgeProgress: ['achievements', 'progress'] as const,
  badgeCatalog: ['achievements', 'catalog'] as const,
  nxpBalance: ['nxp', 'balance'] as const,
  nxpHistory: (page: number, limit: number) =>
    ['nxp', 'history', page, limit] as const,
  nxpStats: ['nxp', 'stats'] as const,
  nxpLeaderboard: (limit: number) => ['nxp', 'leaderboard', limit] as const,
};

/**
 * Get user's earned badges
 */
export function useEarnedBadges() {
  return useQuery<EarnedBadgesResponse, Error>({
    queryKey: achievementQueryKeys.earnedBadges,
    queryFn: getEarnedBadges,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get badge progress for unearned badges
 */
export function useBadgeProgress() {
  return useQuery<BadgeProgressResponse, Error>({
    queryKey: achievementQueryKeys.badgeProgress,
    queryFn: getBadgeProgress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get all available badges (catalog)
 */
export function useBadgeCatalog() {
  return useQuery<BadgeCatalogResponse, Error>({
    queryKey: achievementQueryKeys.badgeCatalog,
    queryFn: getBadgeCatalog,
    staleTime: 10 * 60 * 1000, // 10 minutes (catalog doesn't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Get user's NXP balance
 */
export function useNXPBalance() {
  return useQuery<NXPBalanceResponse, Error>({
    queryKey: achievementQueryKeys.nxpBalance,
    queryFn: getNXPBalance,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get NXP transaction history
 */
export function useNXPHistory(page: number = 1, limit: number = 20) {
  return useQuery<NXPHistoryResponse, Error>({
    queryKey: achievementQueryKeys.nxpHistory(page, limit),
    queryFn: () => getNXPHistory(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get NXP statistics
 */
export function useNXPStats() {
  return useQuery<NXPStatsResponse, Error>({
    queryKey: achievementQueryKeys.nxpStats,
    queryFn: getNXPStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get NXP leaderboard
 */
export function useNXPLeaderboard(limit: number = 50) {
  return useQuery<NXPLeaderboardResponse, Error>({
    queryKey: achievementQueryKeys.nxpLeaderboard(limit),
    queryFn: () => getNXPLeaderboard(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Toggle badge display on profile
 */
export function useToggleBadgeDisplay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleBadgeDisplay,
    onSuccess: () => {
      // Invalidate earned badges to refresh the list
      queryClient.invalidateQueries({
        queryKey: achievementQueryKeys.earnedBadges,
      });
    },
  });
}
