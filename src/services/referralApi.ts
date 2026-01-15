/**
 * Referral API Service
 * Handles all API calls for referral system
 * Based on FRONTEND_REFERRAL_TEAM_BONUS_INTEGRATION.md
 */

import { api } from '@/lib/api';

// ============================================
// Type Definitions
// ============================================

export interface ReferralInfoResponse {
  success: boolean;
  message?: string;
  data?: {
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    referralBonusBalance: number;
    recentReferrals?: Array<{
      fname: string;
      lname: string;
      username: string;
      createdAt: string;
    }>;
  };
}

export interface ReferralTreeResponse {
  success: boolean;
  message?: string;
  data?: {
    tree: ReferralTreeEntry[];
    stats: {
      totalReferrals: number;
      activeReferrals: number;
      totalEarned: number;
      currentBalance: number;
      canWithdraw: boolean;
    };
    maxLevels: number;
    note?: string;
  };
}

export interface ReferralTreeEntry {
  level: number; // 1-5 (bonuses), 6+ (no bonuses)
  referrer: string; // User ID of parent
  referral: string; // User ID of referral
  username: string;
  email: string;
  hasQualifyingStake: boolean;
  joinedAt: string; // ISO date
}

export interface ValidateReferralCodeResponse {
  success: boolean;
  message?: string;
  data?: {
    isValid: boolean;
    referrerName?: string;
  };
}

// ============================================
// API Service
// ============================================

export const referralApi = {
  /**
   * Validate referral code (public endpoint)
   * GET /api/v1/referral/validate?referralCode=ABC123
   * @param referralCode - The referral code to validate
   * @returns Validation result with referrer name if valid
   */
  async validateReferralCode(
    referralCode: string
  ): Promise<ValidateReferralCodeResponse> {
    try {
      const response = await api.get<ValidateReferralCodeResponse>(
        `/referral/validate?referralCode=${encodeURIComponent(referralCode)}`
      );

      console.log('[referralApi] Validate referral code response:', response);
      return response;
    } catch (error: any) {
      console.error('[referralApi] Failed to validate referral code:', error);
      throw error;
    }
  },

  /**
   * Get referral information
   * GET /api/v1/better-auth/referral-info
   * @returns User's referral code, link, and basic stats
   *
   * NOTE: Backend uses better-auth routes, not auth routes
   */
  async getReferralInfo(): Promise<ReferralInfoResponse> {
    try {
      // Call the API - api.get may or may not unwrap the response
      const response = await api.get<
        ReferralInfoResponse | ReferralInfoResponse['data']
      >('/better-auth/referral-info');

      console.log('[referralApi] Raw API response:', response);

      // Check if response is already unwrapped (has referralCode directly)
      if (
        response &&
        typeof response === 'object' &&
        'referralCode' in response
      ) {
        console.log('[referralApi] Response is already unwrapped:', response);
        // Response is already the data object { referralCode, referralLink, ... }
        return {
          success: true,
          data: response as ReferralInfoResponse['data'],
        };
      }

      // Check if response has the wrapped structure { success, data }
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('[referralApi] Response has wrapped structure:', response);
        return response as ReferralInfoResponse;
      }

      // Fallback: assume it's the data object
      console.warn(
        '[referralApi] Unexpected response structure, treating as data:',
        response
      );
      return {
        success: true,
        data: response as ReferralInfoResponse['data'],
      };
    } catch (error: any) {
      // Only log meaningful errors (not empty objects or network errors)
      const isNetworkError =
        error?.code === 'ERR_NETWORK' ||
        error?.message?.includes('Network Error') ||
        !error?.response;

      if (isNetworkError) {
        // Suppress network error logs (expected when backend is unavailable)
        if (process.env.NODE_ENV === 'development') {
          const logKey = 'referral_info_network_error_logged';
          if (
            typeof window !== 'undefined' &&
            !sessionStorage.getItem(logKey)
          ) {
            console.debug(
              '[referralApi] Network error (backend may be unavailable)'
            );
            sessionStorage.setItem(logKey, 'true');
          }
        }
      } else if (error && (error.response || error.message)) {
        // Log actual API errors (4xx, 5xx)
        console.error('[referralApi] Failed to get referral info:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * Get referral tree
   * GET /api/v1/referral/my-tree?maxLevels={n}
   * @param maxLevels - Number of levels to show (1-20, default: 5)
   * @returns Referral tree with configurable depth
   */
  async getReferralTree(maxLevels: number = 5): Promise<ReferralTreeResponse> {
    try {
      // Validate maxLevels
      const levels = Math.max(1, Math.min(20, maxLevels));

      console.log(
        `[referralApi] 🔄 Fetching referral tree (maxLevels=${levels})...`
      );
      const startTime = Date.now();

      const response = await api.get<
        ReferralTreeResponse | ReferralTreeResponse['data']
      >(`/referral/my-tree?maxLevels=${levels}`);

      const duration = Date.now() - startTime;

      // Handle both unwrapped (data object) and wrapped (full response) formats
      // api.get() unwraps responses, so response is likely already the data object
      const treeData = (response as any)?.data || response;

      // Log successful fetch with details
      console.log(`[referralApi] ✅ Referral tree fetched in ${duration}ms:`, {
        totalReferrals: treeData?.tree?.length || 0,
        activeReferrals: treeData?.stats?.activeReferrals || 0,
        totalEarned: treeData?.stats?.totalEarned || 0,
        hasData: !!treeData,
        hasTree: !!treeData?.tree,
        hasStats: !!treeData?.stats,
      });

      // Detailed logging for debugging
      if (treeData?.tree) {
        console.log('[referralApi] Tree entries details:', {
          totalEntries: treeData.tree.length,
          entries: treeData.tree.map((e: any) => ({
            email: e.email,
            username: e.username,
            level: e.level,
            referrer: e.referrer,
            referral: e.referral,
            hasQualifyingStake: e.hasQualifyingStake,
          })),
          entriesByLevel: treeData.tree.reduce(
            (acc: any, e: any) => {
              acc[e.level] = (acc[e.level] || 0) + 1;
              return acc;
            },
            {} as Record<number, number>
          ),
          stats: treeData.stats,
        });
      } else {
        console.warn('[referralApi] No tree data found in response:', {
          response,
          hasData: !!(response as any)?.data,
          hasTree: !!treeData?.tree,
          responseKeys: response ? Object.keys(response) : [],
        });
      }

      // Ensure response has proper structure
      if (!treeData || !treeData.tree) {
        console.warn(
          '[referralApi] Invalid response structure, returning empty tree'
        );
        return {
          success: false,
          data: {
            tree: [],
            stats: {
              totalReferrals: 0,
              activeReferrals: 0,
              totalEarned: 0,
              currentBalance: 0,
              canWithdraw: false,
            },
            maxLevels: levels,
          },
        };
      }

      // Return in expected format (wrapped)
      return {
        success: true,
        data: treeData as ReferralTreeResponse['data'],
      };
    } catch (error: any) {
      // Log timeout errors specifically
      if (
        error?.code === 'ECONNABORTED' &&
        error?.message?.includes('timeout')
      ) {
        console.warn(
          '⚠️ [referralApi] Referral tree request timed out. Backend query is too slow (>60s).',
          'This indicates the backend needs database optimization (indexes, caching).'
        );
      } else {
        // Log other errors
        console.error('[referralApi] Failed to get referral tree:', {
          message: error?.message,
          code: error?.code,
          status: error?.response?.status,
        });
      }

      // Return a structured error response instead of throwing
      return {
        success: false,
        data: {
          tree: [],
          stats: {
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarned: 0,
            currentBalance: 0,
            canWithdraw: false,
          },
          maxLevels: Math.max(1, Math.min(20, maxLevels)),
        },
      };
    }
  },

  /**
   * Get referral and team metrics
   * GET /api/v1/referral/metrics
   * @returns Metrics with total/active counts for direct referrals and team members
   */
  async getReferralMetrics(): Promise<{
    success: boolean;
    message?: string;
    data?: {
      referrals: {
        total_direct: number;
        active_direct: number;
      };
      team: {
        total_members: number;
        active_members: number;
      };
    };
  }> {
    try {
      const response = await api.get('/referral/metrics');

      console.log('[referralApi] Get referral metrics response:', response);
      return response as any;
    } catch (error: any) {
      console.error('[referralApi] Failed to get referral metrics:', error);

      // Return empty state on error
      return {
        success: false,
        message: error?.message || 'Failed to fetch metrics',
        data: {
          referrals: {
            total_direct: 0,
            active_direct: 0,
          },
          team: {
            total_members: 0,
            active_members: 0,
          },
        },
      };
    }
  },
};
