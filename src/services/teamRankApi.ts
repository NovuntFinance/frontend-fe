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

export interface TeamMemberReferrer {
  account: string; // Masked email (e.g., "ref***com")
  username: string;
}

export interface AllTeamMember {
  account: string; // Masked email (e.g., "cry***com")
  username: string;
  level: string; // "Direct", "Level 2", "Level 3", etc. (referral depth)
  rank: string; // "Stakeholder", "Associate Stakeholder", etc. (user achievement rank)
  personalStake: number;
  teamStake: number;
  joined: string; // Date string (e.g., "25/11/2025")
  referrer: TeamMemberReferrer | null; // null if no referrer
}

export interface AllTeamMembersResponse {
  success: boolean;
  data?: {
    teamMembers: AllTeamMember[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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

      // Ensure response has proper structure
      if (!response) {
        console.warn('[teamRankApi] Empty response received');
        return {
          success: false,
          data: {
            teamStats: {
              totalTeamMembers: 0,
              totalDirectDownlines: 0,
              rankDistribution: {},
              totalTeamStake: 0,
              activeDownlines: 0,
            },
            directDownlines: [],
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[teamRankApi] Failed to get team info:', {
        message: error?.message || 'Unknown error',
        response: error?.response?.data,
        status: error?.response?.status,
        error: error,
      });

      // Return a structured error response instead of throwing
      return {
        success: false,
        data: {
          teamStats: {
            totalTeamMembers: 0,
            totalDirectDownlines: 0,
            rankDistribution: {},
            totalTeamStake: 0,
            activeDownlines: 0,
          },
          directDownlines: [],
        },
      };
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
      const allProps =
        error && typeof error === 'object'
          ? Object.getOwnPropertyNames(error)
          : [];
      const allDescriptors =
        error && typeof error === 'object'
          ? Object.getOwnPropertyDescriptors(error)
          : {};

      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach((key) => {
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

      const statusCode =
        (extractedProps.statusCode as number) ??
        error?.statusCode ??
        error?.response?.status ??
        error?.status ??
        null;
      const message =
        (extractedProps.message as string) ??
        error?.message ??
        error?.response?.data?.message ??
        'Unknown error';
      const code = (extractedProps.code as string) ?? error?.code ?? null;

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
      console.error(
        '[teamRankApi] Direct access - statusCode:',
        error?.statusCode,
        'message:',
        error?.message,
        'code:',
        error?.code
      );

      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log(
          '[teamRankApi] Rank info not found (404) - returning default structure'
        );
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
      const response = await api.get<RankInfoResponse>(
        '/user-rank/calculate-rank'
      );

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
      const response = await api.get<NextRankRequirementsResponse>(
        '/user-rank/next-rank-requirements'
      );

      console.log('[teamRankApi] Next rank requirements response:', response);
      return response;
    } catch (error: any) {
      // The API client transforms errors into ApiError objects
      // Use getOwnPropertyNames to get ALL properties (including non-enumerable)
      const allProps =
        error && typeof error === 'object'
          ? Object.getOwnPropertyNames(error)
          : [];
      const allDescriptors =
        error && typeof error === 'object'
          ? Object.getOwnPropertyDescriptors(error)
          : {};

      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach((key) => {
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

      const statusCode =
        (extractedProps.statusCode as number) ??
        error?.statusCode ??
        error?.response?.status ??
        error?.status ??
        null;
      const message =
        (extractedProps.message as string) ??
        error?.message ??
        error?.response?.data?.message ??
        'Unknown error';
      const code = (extractedProps.code as string) ?? error?.code ?? null;

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

      console.error(
        '[teamRankApi] Failed to get next rank requirements:',
        errorDetails
      );
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error(
        '[teamRankApi] Direct access - statusCode:',
        error?.statusCode,
        'message:',
        error?.message,
        'code:',
        error?.code
      );

      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log(
          '[teamRankApi] Next rank requirements not found (404) - returning null'
        );
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
      const allProps =
        error && typeof error === 'object'
          ? Object.getOwnPropertyNames(error)
          : [];
      const allDescriptors =
        error && typeof error === 'object'
          ? Object.getOwnPropertyDescriptors(error)
          : {};

      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach((key) => {
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

      const statusCode =
        (extractedProps.statusCode as number) ??
        error?.statusCode ??
        error?.response?.status ??
        error?.status ??
        null;
      const message =
        (extractedProps.message as string) ??
        error?.message ??
        error?.response?.data?.message ??
        'Unknown error';
      const code = (extractedProps.code as string) ?? error?.code ?? null;

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

      console.error(
        '[teamRankApi] Failed to get pool distributions:',
        errorDetails
      );
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error(
        '[teamRankApi] Direct access - statusCode:',
        error?.statusCode,
        'message:',
        error?.message,
        'code:',
        error?.code
      );

      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log(
          '[teamRankApi] Pool distributions not found (404) - returning empty structure'
        );
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
      const response = await api.get<IncentiveWalletResponse>(
        '/user-rank/my-incentive-wallet'
      );

      console.log('[teamRankApi] Incentive wallet response:', response);
      return response;
    } catch (error: any) {
      // The API client transforms errors into ApiError objects
      // Use getOwnPropertyNames to get ALL properties (including non-enumerable)
      const allProps =
        error && typeof error === 'object'
          ? Object.getOwnPropertyNames(error)
          : [];
      const allDescriptors =
        error && typeof error === 'object'
          ? Object.getOwnPropertyDescriptors(error)
          : {};

      // Extract values from descriptors
      const extractedProps: Record<string, unknown> = {};
      Object.keys(allDescriptors).forEach((key) => {
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

      const statusCode =
        (extractedProps.statusCode as number) ??
        error?.statusCode ??
        error?.response?.status ??
        error?.status ??
        null;
      const message =
        (extractedProps.message as string) ??
        error?.message ??
        error?.response?.data?.message ??
        'Unknown error';
      const code = (extractedProps.code as string) ?? error?.code ?? null;

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

      console.error(
        '[teamRankApi] Failed to get incentive wallet:',
        errorDetails
      );
      console.error('[teamRankApi] Error property names:', allProps);
      console.error('[teamRankApi] Extracted properties:', extractedProps);
      console.error(
        '[teamRankApi] Direct access - statusCode:',
        error?.statusCode,
        'message:',
        error?.message,
        'code:',
        error?.code
      );

      // Handle 404 gracefully
      if (statusCode === 404) {
        console.log(
          '[teamRankApi] Incentive wallet not found (404) - returning default structure'
        );
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

  /**
   * Get all team members with referrer information
   * GET /api/v1/user-rank/all-team-members
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 30)
   * @param search - Search by email or username (optional)
   * @returns All team members across all levels with referrer info
   */
  async getAllTeamMembers(
    page: number = 1,
    limit: number = 30,
    search?: string
  ): Promise<AllTeamMembersResponse> {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search) {
        params.search = search;
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await api.get<AllTeamMembersResponse>(
        `/user-rank/all-team-members?${queryString}`
      );

      // Log detailed response for debugging level/rank issues
      console.log('[teamRankApi] All team members response:', response);

      // Ensure response structure matches expected format: { success: true, data: { teamMembers, pagination } }
      let responseData = response;

      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        // If response has 'data' property, use it
        if ('data' in response && response.data) {
          responseData = response;
        }
        // If response has 'teamMembers' directly (unwrapped), wrap it
        else if ('teamMembers' in response && !('success' in response)) {
          responseData = {
            success: true,
            data: {
              teamMembers: (response as any).teamMembers || [],
              pagination: (response as any).pagination || {
                page: 1,
                limit: 30,
                total: 0,
                totalPages: 0,
              },
            },
          };
        }

        // Validate and log team members data
        const teamMembers =
          (responseData as any)?.data?.teamMembers ||
          (responseData as any)?.teamMembers ||
          [];

        console.log('[teamRankApi] Team members count:', teamMembers.length);

        if (teamMembers.length > 0) {
          // Validate first member has required fields
          const firstMember = teamMembers[0];
          console.log('[teamRankApi] Sample team member:', {
            account: firstMember.account,
            username: firstMember.username,
            level: firstMember.level,
            rank: firstMember.rank,
            hasLevel: !!firstMember.level,
            hasRank: !!firstMember.rank,
            hasReferrer: !!firstMember.referrer,
            referrer: firstMember.referrer,
          });

          // Check for "Unknown" levels
          const unknownLevels = teamMembers.filter(
            (m: any) =>
              !m.level || m.level === 'Unknown' || m.level === 'unknown'
          );
          if (unknownLevels.length > 0) {
            console.warn(
              `[teamRankApi] ⚠️ Found ${unknownLevels.length} team members with Unknown level:`,
              unknownLevels.map((m: any) => ({
                account: m.account,
                username: m.username,
                level: m.level,
                rank: m.rank,
                referrer: m.referrer,
              }))
            );
          }

          // Check for missing rank fields
          const missingRanks = teamMembers.filter((m: any) => !m.rank);
          if (missingRanks.length > 0) {
            console.warn(
              `[teamRankApi] ⚠️ Found ${missingRanks.length} team members with missing rank field:`,
              missingRanks.map((m: any) => ({
                account: m.account,
                username: m.username,
                level: m.level,
              }))
            );
          }

          // Log level and rank distributions
          const levelDist = teamMembers.reduce(
            (acc: Record<string, number>, m: any) => {
              acc[m.level || 'Missing'] = (acc[m.level || 'Missing'] || 0) + 1;
              return acc;
            },
            {}
          );
          const rankDist = teamMembers.reduce(
            (acc: Record<string, number>, m: any) => {
              acc[m.rank || 'Missing'] = (acc[m.rank || 'Missing'] || 0) + 1;
              return acc;
            },
            {}
          );

          console.log('[teamRankApi] Level distribution:', levelDist);
          console.log('[teamRankApi] Rank distribution:', rankDist);
        }
      }

      return responseData as AllTeamMembersResponse;
    } catch (error: any) {
      // Extract meaningful error information
      const isNetworkError =
        error?.code === 'ERR_NETWORK' ||
        error?.message?.includes('Network Error') ||
        !error?.response;

      if (isNetworkError) {
        // Suppress verbose network error logs (expected when backend is unavailable)
        if (process.env.NODE_ENV === 'development') {
          const logKey = 'team_members_network_error_logged';
          if (
            typeof window !== 'undefined' &&
            !sessionStorage.getItem(logKey)
          ) {
            console.debug(
              '[teamRankApi] Network error (backend may be unavailable)'
            );
            sessionStorage.setItem(logKey, 'true');
          }
        }
      } else {
        // Log actual API errors (4xx, 5xx)
        console.error('[teamRankApi] Failed to get all team members:', {
          message: error?.message || 'Unknown error',
          code: error?.code,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
        });
      }

      // Return a structured error response instead of throwing
      return {
        success: false,
        data: {
          teamMembers: [],
          pagination: {
            page: 1,
            limit: 30,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }
  },
};
