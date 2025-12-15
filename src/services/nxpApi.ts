/**
 * NXP (Novunt Experience Points) API Service
 * Handles API calls for NXP system
 */

import { api } from '@/lib/api';
import type {
  NXPBalanceResponse,
  NXPHistoryResponse,
  NXPStatsResponse,
  NXPLeaderboardResponse,
} from '@/types/achievements';

/**
 * Get user's NXP balance and level
 * GET /api/v1/nxp/me
 */
export async function getNXPBalance(): Promise<NXPBalanceResponse> {
  try {
    const response = await api.get<NXPBalanceResponse>('/nxp/me');
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[nxpApi] Error fetching NXP balance:', error);
    throw error;
  }
}

/**
 * Get NXP transaction history
 * GET /api/v1/nxp/me/history?page=1&limit=20
 */
export async function getNXPHistory(
  page: number = 1,
  limit: number = 20
): Promise<NXPHistoryResponse> {
  try {
    const response = await api.get<NXPHistoryResponse>(
      `/nxp/me/history?page=${page}&limit=${limit}`
    );
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[nxpApi] Error fetching NXP history:', error);
    throw error;
  }
}

/**
 * Get NXP statistics
 * GET /api/v1/nxp/me/stats
 */
export async function getNXPStats(): Promise<NXPStatsResponse> {
  try {
    const response = await api.get<NXPStatsResponse>('/nxp/me/stats');
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[nxpApi] Error fetching NXP stats:', error);
    throw error;
  }
}

/**
 * Get NXP leaderboard
 * GET /api/v1/nxp/leaderboard?limit=50
 */
export async function getNXPLeaderboard(
  limit: number = 50
): Promise<NXPLeaderboardResponse> {
  try {
    const response = await api.get<NXPLeaderboardResponse>(
      `/nxp/leaderboard?limit=${limit}`
    );
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[nxpApi] Error fetching NXP leaderboard:', error);
    throw error;
  }
}
