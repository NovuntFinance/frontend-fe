/**
 * Admin Types
 */

export interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    new24h: number;
    new7d: number;
    growthPercentage: number;
  };
  stakes: {
    total: number;
    active: number;
    completed: number;
    /**
     * Legacy field used by older dashboard responses.
     * Prefer `tvl` when available.
     */
    totalValue: number;
    /**
     * TVL = sum of active stake amounts (backend source of truth).
     * May be omitted by older backend responses.
     */
    tvl?: number;
    averageStake: number;
  };
  transactions: {
    total: number;
    /**
     * External volume (deposits + withdrawals) in last 24h.
     */
    volume24h: number;
    volume7d: number;
    volumeTotal: number;
  };
  withdrawals: {
    pending: number;
    /**
     * Sum of pending withdrawals amounts.
     * New backend field: `pendingAmount`
     */
    pendingAmount?: number;
    processing: number;
    processingAmount?: number;
    completed24h: number;
    /**
     * Legacy field used by older dashboard responses.
     * Prefer `pendingAmount` when available.
     */
    totalPending: number;
  };
  platform: {
    totalBalance: number;
    totalPaidROI: number;
    totalBonusesPaid: number;
    /**
     * Deprecated for Overview page. Prefer net flow metrics.
     */
    profit?: number;
    /**
     * deposits - withdrawals (24h)
     */
    netFlow24h?: number;
    /**
     * deposits - withdrawals (selected timeframe)
     */
    netFlowPeriod?: number;
  };
  /**
   * Deprecated: KYC is not used on the platform anymore.
   * Keep optional for compatibility with older UI code paths.
   */
  kyc?: {
    pending: number;
    highPriority?: number;
    approved24h?: number;
  };
}

export interface FinancialDashboard {
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  expenses: {
    roiPaid: number;
    bonusesPaid: number;
    withdrawalsPaid: number;
    total: number;
  };
  reconciliation: {
    status: 'balanced' | 'unbalanced' | 'pending';
    difference: number;
    lastReconciled: string;
  };
  charts: {
    revenueOverTime: ChartDataPoint[];
    transactionVolume: ChartDataPoint[];
    userGrowth: ChartDataPoint[];
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export type AdminDashboardTimeframe = '24h' | '7d' | '30d' | '90d';

export type AdminActivityType =
  | 'new_user'
  | 'withdrawal'
  | 'stake'
  | 'kyc'
  | 'deposit'
  | 'login'
  | 'system'
  | 'alert'
  | 'bonus'
  | 'transaction';

export interface AdminActivityItem {
  id: string;
  type: AdminActivityType;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  relativeTime?: string;
}

/**
 * Admin UI dashboard recentActivity item (backend source of truth).
 * This is different from `AdminActivityItem` which is UI-friendly.
 */
export interface AdminUiRecentActivityItem {
  id?: string;
  type: string;
  amount?: number;
  status?: string;
  timestamp?: string;
  user?: {
    maskedName?: string;
    name?: string;
  };
  currency?: string;
}

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  charts: {
    revenue: ChartDataPoint[];
    userGrowth: ChartDataPoint[];
    stakes: ChartDataPoint[];
  };
  recentActivity: Array<AdminActivityItem | AdminUiRecentActivityItem>;
  dailyProfit?: {
    today?: {
      rosPercentage?: number;
      premiumPoolAmount?: number;
      performancePoolAmount?: number;
      totalPoolAmount?: number;
      isDistributed?: boolean;
      distributionStatus?: string;
    };
  };
  pools?: {
    qualifiers?: {
      performancePoolQualified?: number;
      premiumPoolQualified?: number;
      rankPoolQualified?: number;
      redistributionPoolQualified?: number;
    };
  };
  alerts?: Array<{
    id: string;
    title: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    acknowledged?: boolean;
  }>;
  timeframe?: AdminDashboardTimeframe;
  lastUpdated?: string;
}

export interface SystemAlert {
  id: string;
  type: 'fraud' | 'low_balance' | 'system' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface UserManagement {
  users: AdminUser[];
  filters: UserFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role: string;
  status: string;
  rank: string;
  rankInfo?: {
    currentRank: string;
    qualifiedRank: string;
    performancePoolQualified: boolean; // Blue Tick
    premiumPoolQualified: boolean; // Green Tick
    nxp?: {
      totalNXP: number;
      nxpLevel: number;
      totalNxpEarned: number;
    };
    requirements?: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      rankBonusPercent: number;
    };
  };
  // New backend users list fields (preferred)
  createdAt: string;
  lastLoginAt?: string | null;
  wallets?: {
    funded: { balance: number };
    earnings: { balance: number };
  };
  stats?: {
    activeStakesCount: number;
    totalStaked: number;
    totalDeposited: number;
    totalWithdrawn: number;
    totalEarned: number;
  };

  // Legacy fields kept for compatibility with older UI code paths
  totalInvested?: number;
  totalEarned?: number;
  activeStakes?: number;
  totalReferrals?: number;
  lastLogin?: string | null; // legacy
}

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
  // kycStatus removed - backend no longer supports this filter
  rank?: string;
  hasActiveStakes?: boolean;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}

export interface UserDetailAdmin extends AdminUser {
  wallets: {
    funded: { balance: number };
    earnings: { balance: number };
  };
  statistics: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalStakeROI: number;
    totalReferralEarnings: number;
  };
  recentActivity: {
    lastLogin: string;
    lastTransaction: string;
    lastStake: string;
    lastWithdrawal: string;
  };
  securityInfo: {
    twoFactorEnabled: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastPasswordChange: string;
    activeSessions: number;
  };
}

export interface UserAction {
  action:
    | 'suspend'
    | 'activate'
    | 'verify_kyc'
    | 'reject_kyc'
    | 'modify_balance'
    | 'reset_password';
  userId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalItem<TDetails = unknown> {
  id: string;
  type: 'kyc' | 'withdrawal' | 'transaction';
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  details: TDetails;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ApprovalAction {
  id: string;
  action: 'approve' | 'reject';
  comment?: string;
}

export interface BusinessRule {
  id: string;
  category: 'staking' | 'withdrawal' | 'bonus' | 'referral' | 'security';
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'percentage';
  isActive: boolean;
  canModify: boolean;
  lastModified: string;
  modifiedBy?: string;
}

export interface AnalyticsData {
  userAnalytics: {
    registrations: ChartDataPoint[];
    activeUsers: ChartDataPoint[];
    retentionRate: number;
  };
  stakingAnalytics: {
    stakesCreated: ChartDataPoint[];
    stakesCompleted: ChartDataPoint[];
    averageStakeSize: number;
    completionRate: number;
  };
  financialAnalytics: {
    revenue: ChartDataPoint[];
    expenses: ChartDataPoint[];
    profit: ChartDataPoint[];
    profitMargin: number;
  };
  referralAnalytics: {
    referralsByLevel: Record<string, number>;
    topReferrers: Array<{
      userId: string;
      name: string;
      count: number;
      earned: number;
    }>;
    conversionRate: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  adminId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export type AdminTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'stake'
  | 'unstake'
  | 'reward'
  | 'bonus'
  | 'fee';

export type AdminTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  type: AdminTransactionType;
  status: AdminTransactionStatus;
  amount: number;
  currency: string;
  fee?: number;
  description?: string;
  txHash?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface KycDocumentDetails {
  documentType: 'passport' | 'id_card' | 'driving_license' | string;
  documentNumber: string;
  country: string;
  documentImages: string[];
  selfieImage?: string;
  submittedAt: string;
}

export type KycApprovalItem = ApprovalItem<KycDocumentDetails>;
