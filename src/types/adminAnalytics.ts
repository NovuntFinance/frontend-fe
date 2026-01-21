export type AdminAnalyticsTimeframePreset = '24h' | '7d' | '30d' | '90d';

export type AdminAnalyticsTimeframe = AdminAnalyticsTimeframePreset | 'custom';

export interface AdminAnalyticsDateRange {
  start: string; // ISO
  end: string; // ISO
  previousStart?: string; // ISO
  previousEnd?: string; // ISO
}

export interface AdminAnalyticsCardValue {
  value: number;
  delta?: number;
  deltaPct?: number;
}

export interface AdminAnalyticsSeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface AdminAnalyticsBreakdownRow {
  _id: string;
  count: number;
}

export interface AdminAnalyticsUserTab {
  cards: {
    totalUsers?: AdminAnalyticsCardValue;
    newUsers?: AdminAnalyticsCardValue;
    activeUsers?: AdminAnalyticsCardValue;
    retentionRate?: {
      value: number; // percentage
      delta?: number;
    };
  };
  series: {
    registrations?: AdminAnalyticsSeriesPoint[];
    activeUsers?: AdminAnalyticsSeriesPoint[];
  };
  breakdowns?: {
    byRole?: AdminAnalyticsBreakdownRow[];
    byStatus?: AdminAnalyticsBreakdownRow[];
    byRank?: AdminAnalyticsBreakdownRow[];
  };
}

export interface AdminAnalyticsFinancialTab {
  cards: {
    totalDeposited?: AdminAnalyticsCardValue;
    totalWithdrawn?: AdminAnalyticsCardValue;
    netFlow?: AdminAnalyticsCardValue;
    fees?: AdminAnalyticsCardValue;
    pendingWithdrawals?: { count: number; amount: number };
    failedWithdrawals?: { count: number; amount: number };
    platformWallets?: {
      fundedTotal: number;
      earningTotal: number;
      totalBalance: number;
    };
  };
  series?: {
    deposits?: AdminAnalyticsSeriesPoint[];
    withdrawals?: AdminAnalyticsSeriesPoint[];
    fees?: AdminAnalyticsSeriesPoint[];
  };
}

export interface AdminAnalyticsStakingTab {
  cards: {
    stakesCreated?: AdminAnalyticsCardValue;
    totalStaked?: AdminAnalyticsCardValue;
    averageStakeAmount?: AdminAnalyticsCardValue;
    activeStakes?: AdminAnalyticsCardValue;
    activeStakedAmount?: AdminAnalyticsCardValue;
    stakesCompleted?: AdminAnalyticsCardValue;
  };
  series?: {
    stakedByDay?: AdminAnalyticsSeriesPoint[];
    completedByDay?: AdminAnalyticsSeriesPoint[];
  };
  breakdowns?: {
    byStatus?: AdminAnalyticsBreakdownRow[];
    byType?: AdminAnalyticsBreakdownRow[];
    byGoal?: AdminAnalyticsBreakdownRow[];
  };
}

export interface AdminAnalyticsTopReferrerRow {
  userId: string;
  totalBonus: number;
  count: number;
  user?: {
    id: string;
    email?: string;
    username?: string;
    fullName?: string | null;
  };
}

export interface AdminAnalyticsReferralTab {
  cards: {
    newReferredUsers?: AdminAnalyticsCardValue;
    referralBonusesPaid?: AdminAnalyticsCardValue;
    uniqueReferrers?: AdminAnalyticsCardValue;
    referredConversionRate?: AdminAnalyticsCardValue; // percentage
  };
  series?: {
    referredUsers?: AdminAnalyticsSeriesPoint[];
    referralBonuses?: AdminAnalyticsSeriesPoint[];
  };
  breakdowns?: Record<string, AdminAnalyticsBreakdownRow[] | undefined>;
  topReferrers?: AdminAnalyticsTopReferrerRow[];
}

export interface AdminAnalyticsDashboardData {
  timeframe: AdminAnalyticsTimeframe;
  range: AdminAnalyticsDateRange;
  user: AdminAnalyticsUserTab;
  financial: AdminAnalyticsFinancialTab;
  staking: AdminAnalyticsStakingTab;
  referral: AdminAnalyticsReferralTab;
}

export interface AdminAnalyticsDashboardResponse {
  success: boolean;
  data: AdminAnalyticsDashboardData;
}
