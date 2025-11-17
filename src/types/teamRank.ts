/**
 * Team & Rank Types
 * Based on FRONTEND_REFERRAL_TEAM_BONUS_INTEGRATION.md
 */

// ============================================
// Team Types
// ============================================

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

export interface TeamInfo {
  directDownlines: DirectDownline[];
  teamStats: TeamStats;
}

// ============================================
// Rank Types
// ============================================

export type RankName = 
  | 'Stakeholder'
  | 'Associate Stakeholder'
  | 'Principal Strategist'
  | 'Elite Capitalist'
  | 'Wealth Architect'
  | 'Finance Titan';

export interface RankRequirements {
  name: string;
  personalStake: number;
  teamStake: number;
  directDownlines: number;
  lowerRankRequirement?: number;
  lowerRankType?: string;
  rankBonusPercent: number;
}

export interface RankShortfalls {
  personalStake: number;
  teamStake: number;
  directDownlines: number;
  lowerRankCount?: number;
}

export interface NextRank {
  name: string;
  personalStake: number;
  teamStake: number;
  directDownlines: number;
}

export interface RankInfo {
  currentRank: string;
  qualifiedRank: string;
  isUpgradeAvailable: boolean;
  requirements: RankRequirements | null;
  shortfalls: RankShortfalls;
  nextRank: NextRank | null;
  performancePoolQualified: boolean; // Blue Tick
  premiumPoolQualified: boolean; // Green Tick
}

export interface NextRankRequirements {
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
}

// ============================================
// Pool Distribution Types
// ============================================

export type DistributionType = 'rank_pool' | 'redistribution_pool';
export type VerificationIcon = 'blue' | 'green' | 'red';

export interface PoolDistribution {
  _id: string;
  rankName: string;
  distributionType: DistributionType;
  totalPoolAmount: number;
  userShare: number; // 0-1 (percentage of pool)
  bonusAmount: number;
  verificationIcon: VerificationIcon;
  isQualified: boolean;
  distributionPeriod: string; // ISO date
  createdAt: string; // ISO date
}

export interface PoolDistributionsData {
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
}

export interface QualificationStatus {
  performancePoolQualified: boolean; // Blue Tick
  premiumPoolQualified: boolean; // Green Tick
  rankPoolQualified: boolean;
  redistributionPoolQualified: boolean;
}

export interface IncentiveWallet {
  totalEarnings: number;
  rankPoolEarnings: number;
  redistributionPoolEarnings: number;
  currentBalance: number;
  qualificationStatus: QualificationStatus;
  recentDistributions: Array<{
    type: DistributionType;
    amount: number;
    date: string;
  }>;
}

// ============================================
// Rank Constants
// ============================================

export const RANK_REQUIREMENTS: Record<RankName, RankRequirements> = {
  'Stakeholder': {
    name: 'Stakeholder',
    personalStake: 20,
    teamStake: 0,
    directDownlines: 0,
    rankBonusPercent: 0,
  },
  'Associate Stakeholder': {
    name: 'Associate Stakeholder',
    personalStake: 50,
    teamStake: 5000,
    directDownlines: 5,
    rankBonusPercent: 12.5,
  },
  'Principal Strategist': {
    name: 'Principal Strategist',
    personalStake: 100,
    teamStake: 10000,
    directDownlines: 10,
    lowerRankRequirement: 2,
    lowerRankType: 'Associate Stakeholder',
    rankBonusPercent: 17.5,
  },
  'Elite Capitalist': {
    name: 'Elite Capitalist',
    personalStake: 250,
    teamStake: 25000,
    directDownlines: 15,
    lowerRankRequirement: 2,
    lowerRankType: 'Principal Strategist',
    rankBonusPercent: 22.5,
  },
  'Wealth Architect': {
    name: 'Wealth Architect',
    personalStake: 500,
    teamStake: 50000,
    directDownlines: 20,
    lowerRankRequirement: 2,
    lowerRankType: 'Elite Capitalist',
    rankBonusPercent: 27.5,
  },
  'Finance Titan': {
    name: 'Finance Titan',
    personalStake: 1000,
    teamStake: 100000,
    directDownlines: 25,
    lowerRankRequirement: 2,
    lowerRankType: 'Wealth Architect',
    rankBonusPercent: 32.5,
  },
};

