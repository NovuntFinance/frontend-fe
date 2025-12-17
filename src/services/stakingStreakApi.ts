/**
 * Staking Streak API Service
 * Handles API calls for staking streak data
 */

import { api } from '@/lib/api';

export interface StakingStreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  streakStartDate: string | null;
  isActiveToday: boolean;
  daysUntilNextMilestone: number;
  nextMilestone: number | null;
  weeklyProgress: Array<{
    date: string;
    hasActiveStake: boolean;
  }>;
}

export interface StakingStreakResponse {
  success: boolean;
  data: StakingStreakData;
  meta?: {
    response_time_ms: number;
    cached?: boolean;
  };
}

/**
 * Get user's staking streak information
 * GET /api/v1/staking/streak
 */
export async function getStakingStreak(): Promise<StakingStreakResponse> {
  try {
    const response = await api.get<StakingStreakResponse>('/staking/streak');
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[stakingStreakApi] Error fetching staking streak:', error);
    throw error;
  }
}
