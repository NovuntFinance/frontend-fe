/**
 * Enhanced Transaction History API Types
 * Based on TransactionHistory API-FrontendIntegrationGuide.md
 */

// Transaction Types
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_out'
  | 'transfer_in'
  | 'stake'
  | 'unstake'
  | 'ros_payout'
  | 'stake_completion'
  | 'stake_pool_payout'
  | 'performance_pool_payout'
  | 'premium_pool_payout'
  | 'registration_bonus'
  | 'referral_bonus'
  | 'bonus_activation'
  | 'fee'
  | 'adjustment'
  | 'refund';

export type TransactionCategory =
  | 'deposit'
  | 'withdrawal'
  | 'staking'
  | 'earnings'
  | 'transfer'
  | 'bonus'
  | 'fee'
  | 'system';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'requires_approval';

export type TransactionDirection = 'in' | 'out' | 'neutral';

export type WalletType =
  | 'funded'
  | 'earning'
  | 'external'
  | 'platform'
  | 'stake';

// Transaction Interface
export interface Transaction {
  _id: string;
  type: TransactionType;
  typeLabel: string;
  category: TransactionCategory;
  direction: TransactionDirection;
  amount: number;
  fee: number;
  netAmount: number;
  title: string;
  description: string;
  status: TransactionStatus;
  requiresAdminApproval: boolean;
  reference: string;
  txId?: string;
  sourceWallet?: WalletType;
  destinationWallet?: WalletType;
  walletAddress?: string;
  method?: string;
  fromUser?: UserInfo | null;
  toUser?: UserInfo | null;
  metadata?: Record<string, any>;
  balanceBefore?: number;
  balanceAfter?: number;
  timestamp: string;
  processedAt?: string;
  createdAt: string;
}

export interface UserInfo {
  username: string;
  name: string;
}

// Pagination Interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Summary Interface
export interface TransactionSummary {
  deposits: { total: number; count: number };
  withdrawals: { total: number; count: number };
  staking: {
    totalStaked: number;
    stakeCount: number;
    totalCompletions: number;
    completionCount: number;
  };
  earnings: {
    rosPayouts: number;
    rosCount: number;
    poolPayouts: number;
  };
  bonuses: { total: number; count: number };
  transfers: { sent: number; received: number };
  fees: number;
  netInflow: number;
}

// Category Breakdown
export interface CategoryBreakdown {
  [category: string]: {
    count: number;
    totalAmount: number;
  };
}

// API Response Interface
export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: Pagination;
    summary: TransactionSummary;
    categoryBreakdown: CategoryBreakdown;
    filters: {
      type: string;
      category: string;
      status: string;
      dateFrom: string | null;
      dateTo: string | null;
      amountMin: number | null;
      amountMax: number | null;
      search: string | null;
    };
    availableFilters: {
      types: string[];
      categories: string[];
      statuses: string[];
    };
  };
}

// Query Parameters Interface
export interface TransactionHistoryParams {
  page?: number;
  limit?: number;
  type?: TransactionType | 'all';
  category?: TransactionCategory | 'all';
  status?: TransactionStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: 'timestamp' | 'amount' | 'type';
  sortOrder?: 'asc' | 'desc';
}
