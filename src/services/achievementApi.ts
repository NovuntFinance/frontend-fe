/**
 * Achievement API Service
 * Handles API calls for achievement badges
 */

import { api } from '@/lib/api';
import type {
  EarnedBadgesResponse,
  BadgeProgressResponse,
  BadgeCatalogResponse,
  ToggleBadgeResponse,
} from '@/types/achievements';

/**
 * Get user's earned badges
 * GET /api/v1/achievements/me
 */
export async function getEarnedBadges(): Promise<EarnedBadgesResponse> {
  try {
    const response = await api.get<EarnedBadgesResponse>('/achievements/me');
    // API client may unwrap the response, so handle both cases
    if (response && 'success' in response) {
      return response;
    }
    // If unwrapped, wrap it back
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[achievementApi] Error fetching earned badges:', error);
    throw error;
  }
}

/**
 * Get badge progress for unearned badges
 * GET /api/v1/achievements/me/progress
 */
export async function getBadgeProgress(): Promise<BadgeProgressResponse> {
  try {
    const response = await api.get<BadgeProgressResponse>(
      '/achievements/me/progress'
    );
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[achievementApi] Error fetching badge progress:', error);
    throw error;
  }
}

/**
 * Get all available badges (catalog)
 * GET /api/v1/achievements/catalog
 */
export async function getBadgeCatalog(): Promise<BadgeCatalogResponse> {
  try {
    const response = await api.get<BadgeCatalogResponse>(
      '/achievements/catalog'
    );
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[achievementApi] Error fetching badge catalog:', error);
    throw error;
  }
}

/**
 * Toggle badge display on profile
 * PATCH /api/v1/achievements/me/toggle/:badgeId
 */
export async function toggleBadgeDisplay(
  badgeId: string
): Promise<ToggleBadgeResponse> {
  try {
    const response = await api.patch<ToggleBadgeResponse>(
      `/achievements/me/toggle/${badgeId}`
    );
    if (response && 'success' in response) {
      return response;
    }
    return { success: true, data: response as any };
  } catch (error: any) {
    console.error('[achievementApi] Error toggling badge display:', error);
    throw error;
  }
}
