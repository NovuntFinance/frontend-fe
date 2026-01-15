/**
 * Referral Types
 */

export type ReferralStatus = 'active' | 'inactive' | 'blocked';

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUser: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    status: string;
    createdAt: string;
  };
  level: 1 | 2 | 3 | 4 | 5;
  commissionPercentage: number;
  totalEarned: number;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  currentBalance: number;
  canWithdraw: boolean;
  earningsByLevel?: {
    level1: { count: number; earned: number; percentage: 5 };
    level2: { count: number; earned: number; percentage: 2 };
    level3: { count: number; earned: number; percentage: 1.5 };
    level4: { count: number; earned: number; percentage: 1 };
    level5: { count: number; earned: number; percentage: 0.5 };
  };
  recentEarnings?: ReferralEarning[];
}

export interface ReferralEarning {
  id: string;
  referralId: string;
  referredUser: string;
  amount: number;
  level: number;
  percentage: number;
  sourceStakeId?: string;
  createdAt: string;
}

export interface ReferralTree {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    totalEarned: number;
  };
  children: ReferralTree[];
  level: number;
  earnedFromThis: number;
}

export interface ReferralLeaderboard {
  rank: number;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  totalReferrals: number;
  totalEarned: number;
  isCurrentUser: boolean;
}

export interface ValidateReferralCodeResponse {
  success: boolean;
  message?: string;
  data?: {
    isValid: boolean;
    referrerName?: string;
  };
}

// New API structure types (from FRONTEND_REFERRAL_TEAM_BONUS_INTEGRATION.md)
export interface ReferralInfo {
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

export interface ReferralTreeData {
  tree: ReferralTreeEntry[];
  stats: ReferralStats;
  maxLevels: number;
  note?: string;
}

// Referral commission rates by level
export const REFERRAL_COMMISSION_RATES = {
  level1: 5,
  level2: 2,
  level3: 1.5,
  level4: 1,
  level5: 0.5,
} as const;

/**
 * Referral and Team Metrics
 * From GET /api/v1/referral/metrics
 */
export interface ReferralMetrics {
  referrals: {
    total_direct: number; // Total number of direct referrals (Level 1)
    active_direct: number; // Active direct referrals with stakes
  };
  team: {
    total_members: number; // Total downline members (all levels)
    active_members: number; // Active team members with stakes
  };
}

export interface ReferralMetricsResponse {
  success: boolean;
  message: string;
  data: ReferralMetrics;
}
