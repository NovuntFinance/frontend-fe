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
    totalValue: number;
    averageStake: number;
  };
  transactions: {
    total: number;
    volume24h: number;
    volume7d: number;
    volumeTotal: number;
  };
  withdrawals: {
    pending: number;
    processing: number;
    completed24h: number;
    totalPending: number;
  };
  platform: {
    totalBalance: number;
    totalPaidROI: number;
    totalBonusesPaid: number;
    profit: number;
  };
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

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  charts: {
    revenue: ChartDataPoint[];
    userGrowth: ChartDataPoint[];
    stakes: ChartDataPoint[];
  };
  recentActivity: AdminActivityItem[];
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
  // kycStatus removed - backend no longer returns this field
  totalInvested: number;
  totalEarned: number;
  activeStakes: number;
  totalReferrals: number;
  lastLogin?: string | null; // Can be null according to backend
  createdAt: string;
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
