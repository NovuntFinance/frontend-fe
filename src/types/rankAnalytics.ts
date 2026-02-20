/**
 * Rank Analytics Types
 * Based on GET /api/v1/rank-management/analytics endpoint
 */

export interface RankRequirements {
  personalStake: number;
  teamStake: number;
  directDownlines: number;
  lowerRankRequirement: number;
  lowerRankType: string;
}

export interface PoolAllocation {
  allocationPercent: number;
  description: string;
}

export interface RankPoolAllocations {
  performancePool: PoolAllocation;
  premiumPool: PoolAllocation;
}

export interface RankCurrentStats {
  totalUsers: number;
  performancePoolQualified: number;
  premiumPoolQualified: number;
  totalPersonalStake: number;
  totalTeamStake: number;
}

export interface RankInfo {
  name: string;
  level: number;
  isHighestRank: boolean;
  requirements: RankRequirements;
  poolAllocations: RankPoolAllocations;
  currentStats: RankCurrentStats;
}

export interface RankSystem {
  defaultRank: string;
  totalRanks: number;
  highestRank: string;
}

export interface EligibleRank {
  rank: string;
  allocationPercent: number;
  requiresDownlines?: string;
}

export interface PoolDistributionInfo {
  performancePool: {
    description: string;
    allocationMethod: string;
    eligibleRanks: EligibleRank[];
  };
  premiumPool: {
    description: string;
    allocationMethod: string;
    eligibleRanks: EligibleRank[];
  };
}

// Legacy types (for backward compatibility)
export interface RankDistribution {
  _id: string;
  count: number;
  totalPersonalStake?: number;
  totalTeamStake?: number;
}

export interface RankAnalyticsResponse {
  success: boolean;
  data: {
    rankSystem: RankSystem;
    ranks: RankInfo[];
    poolDistributionInfo: PoolDistributionInfo;
    // Legacy fields (still available for backward compatibility)
    rankDistribution?: RankDistribution[];
    qualifiedUsers?: Record<string, any>;
    recentDistributions?: any[];
    totalPoolsDistributed?: Record<string, any>;
  };
}
