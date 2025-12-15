/**
 * Achievement and NXP System Types
 * Type definitions for the Achievement Badge System and NXP (Novunt Experience Points)
 */

// ============================================
// ACHIEVEMENT TYPES
// ============================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  badgeType: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  awardedAt?: string;
  metadata?: {
    stakingAmount?: number;
    teamSize?: number;
    earnings?: number;
    rank?: string;
    [key: string]: any;
  };
  isDisplayed: boolean;
}

export interface BadgeDefinition {
  badgeType: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  requirement: number;
}

export interface BadgeProgress {
  category: string;
  badges: Array<{
    type: string;
    progress: number; // 0-100
    current: number;
    required: number;
  }>;
}

export interface EarnedBadgesResponse {
  success: boolean;
  data: {
    totalBadges: number;
    badges: Badge[];
  };
}

export interface BadgeProgressResponse {
  success: boolean;
  data: BadgeProgress[];
}

export interface BadgeCatalogResponse {
  success: boolean;
  data: {
    totalBadges: number;
    badges: BadgeDefinition[];
  };
}

export interface ToggleBadgeResponse {
  success: boolean;
  data: {
    badgeId: string;
    isDisplayed: boolean;
  };
}

// ============================================
// NXP TYPES
// ============================================

export type NXPSource = 'badge' | 'rank' | 'milestone' | 'activity' | 'bonus';

export interface NXPBalance {
  totalNXP: number;
  nxpLevel: number;
  nxpToNextLevel: number;
  totalNxpEarned: number;
  breakdown: {
    fromBadges: number;
    fromRanks: number;
    fromMilestones: number;
    fromActivities: number;
  };
}

export interface NXPTransaction {
  _id: string;
  amount: number;
  source: NXPSource;
  sourceName: string;
  description: string;
  metadata: {
    badgeType?: string;
    badgeRarity?: string;
    rankName?: string;
    milestoneType?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface NXPHistoryResponse {
  success: boolean;
  data: {
    transactions: NXPTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface NXPStatsResponse {
  success: boolean;
  data: {
    totalNXP: number;
    nxpLevel: number;
    nxpToNextLevel: number;
    totalNxpEarned: number;
    breakdown: {
      fromBadges: number;
      fromRanks: number;
      fromMilestones: number;
      fromActivities: number;
    };
    leaderboardPosition: number | null;
  };
}

export interface LeaderboardEntry {
  position: number;
  userId: string;
  username: string;
  fname?: string;
  lname?: string;
  totalNXP: number;
  nxpLevel: number;
  rank: string;
}

export interface NXPLeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardEntry[];
    userPosition: number | null;
  };
}

export interface NXPBalanceResponse {
  success: boolean;
  data: NXPBalance;
}

// ============================================
// COMBINED TYPES
// ============================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AchievementPageData {
  nxp: NXPBalance;
  earnedBadges: Badge[];
  badgeProgress: BadgeProgress[];
  badgeCatalog: BadgeDefinition[];
  nxpHistory: {
    transactions: NXPTransaction[];
    pagination: Pagination;
  };
  leaderboard: {
    leaderboard: LeaderboardEntry[];
    userPosition: number | null;
  };
}
