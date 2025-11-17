/**
 * Team & Rank API Service
 * Handles all API calls for team structure and rank system
 * Based on FRONTEND_REFERRAL_TEAM_BONUS_INTEGRATION.md
 */

import { api } from '@/lib/api';

// ============================================
// Type Definitions
// ============================================

export interface TeamInfoResponse {
  success: boolean;
  data?: {
    directDownlines: DirectDownline[];
    teamStats: TeamStats;
  };
}

export interface DirectDownline {
  _id: string;
  username: string;
  rank: string;
  personalStake: number;
  teamStake: number;
  directDownlines: DirectDownline[]; // Recursive structure
  isActive: boolean;
  createdAt: string;
}

export interface TeamStats {
  totalDirectDownlines: number;
  activeDownlines: number;
  rankDistribution: Record<string, number>;
  totalTeamStake: number;
  totalTeamMembers: number;
}

export interface RankInfoResponse {
  success: boolean;
  data?: {
    currentRank: string;
    qualifiedRank: string;
    isUpgradeAvailable: boolean;
    requirements?: {
      name: string;
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      lowerRankRequirement?: number;
      lowerRankType?: string;
      rankBonusPercent: number;
    } | null;
    shortfalls: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      lowerRankCount?: number;
    };
    nextRank?: {
      name: string;
      personalStake: number;
      teamStake: number;
      directDownlines: number;
    } | null;
    performancePoolQualified: boolean; // Blue Tick
    premiumPoolQualified: boolean; // Green Tick
  };
}

export interface NextRankRequirementsResponse {
  success: boolean;
  data?: {
    nextRank: string;
    requirements: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      lowerRankRequirement?: number;
      lowerRankType?: string;
    };
    currentProgress: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      lowerRankCount?: number;
    };
    shortfalls: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      lowerRankCount?: number;
    };
    progressPercentages: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      lowerRankCount?: number;
    };
  };
}

export interface PoolDistributionResponse {
  success: boolean;
  data?: {
    distributions: PoolDistribution[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    totalEarnings: {
      rankPool: number;
      redistributionPool: number;
      total: number;
    };
  };
}

export interface PoolDistribution {
  _id: string;
  rankName: string;
  distributionType: 'rank_pool' | 'redistribution_pool';
  totalPoolAmount: number;
  userShare: number; // 0-1 (percentage of pool)
  bonusAmount: number;
  verificationIcon: 'blue' | 'green' | 'red';
  isQualified: boolean;
  distributionPeriod: string; // ISO date
  createdAt: string; // ISO date
}

export interface IncentiveWalletResponse {
  success: boolean;
  data?: {
    totalEarnings: number;
    rankPoolEarnings: number;
    redistributionPoolEarnings: number;
    currentBalance: number;
    qualificationStatus: {
      performancePoolQualified: boolean;
      premiumPoolQualified: boolean;
      rankPoolQualified: boolean;
      redistributionPoolQualified: boolean;
    };
    recentDistributions: Array<{
      type: 'rank_pool' | 'redistribution_pool';
      amount: number;
      date: string;
    }>;
  };
}

// ============================================
// API Service
// ============================================

export const teamRankApi = {
  /**
   * Get team information
   * GET /api/v1/user-rank/my-team
   * @returns Team structure with downlines and their ranks
   */
  async getTeamInfo(): Promise<TeamInfoResponse> {
    try {
      const response = await api.get<TeamInfoResponse>('/user-rank/my-team');
      
      console.log('[teamRankApi] Team info response:', response);
      return response;
    } catch (error: any) {
      console.error('[teamRankApi] Failed to get team info:', error);
      throw error;
    }
  },

  /**
   * Get rank information
   * GET /api/v1/user-rank/my-rank
   * @returns Current rank, qualification status, and requirements
   */
  async getRankInfo(): Promise<RankInfoResponse> {
    try {
      const response = await api.get<RankInfoResponse>('/user-rank/my-rank');
      
      console.log('[teamRankApi] Rank info response:', response);
      return response;
    } catch (error: any) {
      // The API client transforms errors into ApiError objects
      // Use getOwnPropertyNames to get ALL properties (including non-enumerable)
      const allProps = error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [];
      const allDescriptors = error && typeof error === 'object' ? Object.getOwnPropertyDescriptors(error) : {};
      
      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach(key => {
        try {
          const descriptor = allDescriptors[key];
          if (descriptor.value !== undefined) {
            extractedProps[key] = descriptor.value;
          } else if (descriptor.get) {
            try {
              extractedProps[key] = descriptor.get();
            } catch (e) {
              extractedProps[key] = '[Getter error]';
            }
          }
        } catch (e) {
          // Skip
        }
      });
      
      const statusCode = extractedProps.statusCode as number ?? error?.statusCode ?? error?.response?.status ?? error?.status ?? null;
      const message = extractedProps.message as string ?? error?.message ?? error?.response?.data?.message ?? 'Unknown error';
      const code = extractedProps.code as string ?? error?.code ?? null;
      
      const errorDetails: Record<string, unknown> = {
        message,
        statusCode,
        code,
        url: '/user-rank/my-rank',
        errorType: typeof error,
        isApiError: error?.success === false,
        allPropertyNames: allProps,
        extractedProperties: extractedProps,
      };
      
      console.error('[teamRankApi] Failed to get rank info:', errorDetails);
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error('[teamRankApi] Direct access - statusCode:', error?.statusCode, 'message:', error?.message, 'code:', error?.code);
      
      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log('[teamRankApi] Rank info not found (404) - returning default structure');
        return {
          success: false,
          data: {
            currentRank: 'Stakeholder',
            qualifiedRank: 'Stakeholder',
            isUpgradeAvailable: false,
            requirements: null,
            shortfalls: {
              personalStake: 0,
              teamStake: 0,
              directDownlines: 0,
            },
            performancePoolQualified: false,
            premiumPoolQualified: false,
          },
        };
      }
      
      throw error;
    }
  },

  /**
   * Calculate rank (triggers recalculation)
   * GET /api/v1/user-rank/calculate-rank
   * @returns Updated rank information
   */
  async calculateRank(): Promise<RankInfoResponse> {
    try {
      const response = await api.get<RankInfoResponse>('/user-rank/calculate-rank');
      
      console.log('[teamRankApi] Calculate rank response:', response);
      return response;
    } catch (error: any) {
      console.error('[teamRankApi] Failed to calculate rank:', error);
      throw error;
    }
  },

  /**
   * Get next rank requirements
   * GET /api/v1/user-rank/next-rank-requirements
   * @returns Requirements for the next rank upgrade
   */
  async getNextRankRequirements(): Promise<NextRankRequirementsResponse> {
    try {
      const response = await api.get<NextRankRequirementsResponse>('/user-rank/next-rank-requirements');
      
      console.log('[teamRankApi] Next rank requirements response:', response);
      return response;
    } catch (error: any) {
      // The API client transforms errors into ApiError objects
      // Use getOwnPropertyNames to get ALL properties (including non-enumerable)
      const allProps = error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [];
      const allDescriptors = error && typeof error === 'object' ? Object.getOwnPropertyDescriptors(error) : {};
      
      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach(key => {
        try {
          const descriptor = allDescriptors[key];
          if (descriptor.value !== undefined) {
            extractedProps[key] = descriptor.value;
          } else if (descriptor.get) {
            try {
              extractedProps[key] = descriptor.get();
            } catch (e) {
              extractedProps[key] = '[Getter error]';
            }
          }
        } catch (e) {
          // Skip
        }
      });
      
      const statusCode = extractedProps.statusCode as number ?? error?.statusCode ?? error?.response?.status ?? error?.status ?? null;
      const message = extractedProps.message as string ?? error?.message ?? error?.response?.data?.message ?? 'Unknown error';
      const code = extractedProps.code as string ?? error?.code ?? null;
      
      const errorDetails: Record<string, unknown> = {
        message,
        statusCode,
        code,
        url: '/user-rank/next-rank-requirements',
        errorType: typeof error,
        isApiError: error?.success === false,
        allPropertyNames: allProps,
        extractedProperties: extractedProps,
      };
      
      console.error('[teamRankApi] Failed to get next rank requirements:', errorDetails);
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error('[teamRankApi] Direct access - statusCode:', error?.statusCode, 'message:', error?.message, 'code:', error?.code);
      
      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log('[teamRankApi] Next rank requirements not found (404) - returning null');
        return {
          success: false,
          data: undefined,
        };
      }
      
      throw error;
    }
  },

  /**
   * Get pool distribution history
   * GET /api/v1/user-rank/my-pool-distributions
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param distributionType - Filter by type: 'rank_pool' | 'redistribution_pool'
   * @returns Pool distribution history
   */
  async getPoolDistributions(
    page: number = 1,
    limit: number = 20,
    distributionType?: 'rank_pool' | 'redistribution_pool'
  ): Promise<PoolDistributionResponse> {
    try {
      let url = `/user-rank/my-pool-distributions?page=${page}&limit=${limit}`;
      if (distributionType) {
        url += `&distributionType=${distributionType}`;
      }
      
      const response = await api.get<PoolDistributionResponse>(url);
      
      console.log('[teamRankApi] Pool distributions response:', response);
      return response;
    } catch (error: any) {
      // The API client transforms errors into ApiError objects
      // Use getOwnPropertyNames to get ALL properties (including non-enumerable)
      const allProps = error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [];
      const allDescriptors = error && typeof error === 'object' ? Object.getOwnPropertyDescriptors(error) : {};
      
      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach(key => {
        try {
          const descriptor = allDescriptors[key];
          if (descriptor.value !== undefined) {
            extractedProps[key] = descriptor.value;
          } else if (descriptor.get) {
            try {
              extractedProps[key] = descriptor.get();
            } catch (e) {
              extractedProps[key] = '[Getter error]';
            }
          }
        } catch (e) {
          // Skip
        }
      });
      
      const statusCode = extractedProps.statusCode as number ?? error?.statusCode ?? error?.response?.status ?? error?.status ?? null;
      const message = extractedProps.message as string ?? error?.message ?? error?.response?.data?.message ?? 'Unknown error';
      const code = extractedProps.code as string ?? error?.code ?? null;
      
      const errorDetails: Record<string, unknown> = {
        message,
        statusCode,
        code,
        url: `/user-rank/my-pool-distributions`,
        errorType: typeof error,
        isApiError: error?.success === false,
        allPropertyNames: allProps,
        extractedProperties: extractedProps,
      };
      
      console.error('[teamRankApi] Failed to get pool distributions:', errorDetails);
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error('[teamRankApi] Direct access - statusCode:', error?.statusCode, 'message:', error?.message, 'code:', error?.code);
      
      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log('[teamRankApi] Pool distributions not found (404) - returning empty structure');
        return {
          success: false,
          data: {
            distributions: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
            totalEarnings: {
              rankPool: 0,
              redistributionPool: 0,
              total: 0,
            },
          },
        };
      }
      
      throw error;
    }
  },

  /**
   * Get incentive wallet summary
   * GET /api/v1/user-rank/my-incentive-wallet
   * @returns Summary of rank and redistribution pool earnings
   */
  async getIncentiveWallet(): Promise<IncentiveWalletResponse> {
    try {
      const response = await api.get<IncentiveWalletResponse>('/user-rank/my-incentive-wallet');
      
      console.log('[teamRankApi] Incentive wallet response:', response);
      return response;
    } catch (error: any) {
      // The API client transforms errors into ApiError objects
      // Use getOwnPropertyNames to get ALL properties (including non-enumerable)
      const allProps = error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [];
      const allDescriptors = error && typeof error === 'object' ? Object.getOwnPropertyDescriptors(error) : {};
      
      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach(key => {
        try {
          const descriptor = allDescriptors[key];
          if (descriptor.value !== undefined) {
            extractedProps[key] = descriptor.value;
          } else if (descriptor.get) {
            try {
              extractedProps[key] = descriptor.get();
            } catch (e) {
              extractedProps[key] = '[Getter error]';
            }
          }
        } catch (e) {
          // Skip
        }
      });
      
      const statusCode = extractedProps.statusCode as number ?? error?.statusCode ?? error?.response?.status ?? error?.status ?? null;
      const message = extractedProps.message as string ?? error?.message ?? error?.response?.data?.message ?? 'Unknown error';
      const code = extractedProps.code as string ?? error?.code ?? null;
      
      const errorDetails: Record<string, unknown> = {
        message,
        statusCode,
        code,
        url: '/user-rank/my-incentive-wallet',
        errorType: typeof error,
        isApiError: error?.success === false,
        allPropertyNames: allProps,
        extractedProperties: extractedProps,
      };
      
      console.error('[teamRankApi] Failed to get incentive wallet:', errorDetails);
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error('[teamRankApi] Direct access - statusCode:', error?.statusCode, 'message:', error?.message, 'code:', error?.code);
      
      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log('[teamRankApi] Incentive wallet not found (404) - returning default structure');
        return {
          success: false,
          data: {
            totalEarnings: 0,
            rankPoolEarnings: 0,
            redistributionPoolEarnings: 0,
            currentBalance: 0,
            qualificationStatus: {
              performancePoolQualified: false,
              premiumPoolQualified: false,
              rankPoolQualified: false,
              redistributionPoolQualified: false,
            },
            recentDistributions: [],
          },
        };
      }
      
      throw error;
    }
  },
};

