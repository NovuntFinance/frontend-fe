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
  async validateReferralCode(referralCode: string): Promise<ValidateReferralCodeResponse> {
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
      const response = await api.get<ReferralInfoResponse | ReferralInfoResponse['data']>('/better-auth/referral-info');
      
      console.log('[referralApi] Raw API response:', response);
      
      // Check if response is already unwrapped (has referralCode directly)
      if (response && typeof response === 'object' && 'referralCode' in response) {
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
      console.warn('[referralApi] Unexpected response structure, treating as data:', response);
      return {
        success: true,
        data: response as ReferralInfoResponse['data'],
      };
    } catch (error: any) {
      console.error('[referralApi] Failed to get referral info:', error);
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
      
      const response = await api.get<ReferralTreeResponse>(
        `/referral/my-tree?maxLevels=${levels}`
      );
      
      console.log('[referralApi] Referral tree response:', response);
      return response;
    } catch (error: any) {
      console.error('[referralApi] Failed to get referral tree:', error);
      throw error;
    }
  },
};

