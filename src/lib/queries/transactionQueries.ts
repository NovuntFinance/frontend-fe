import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

/**
 * Transaction Types & Data Models
 */

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'stake'
  | 'roi'
  | 'bonus'
  | 'referral';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  netAmount?: number;
  status: TransactionStatus;
  description: string;
  metadata?: {
    // Deposit
    invoiceId?: string;
    paymentAddress?: string;
    network?: 'BEP20' | 'TRC20';

    // Withdrawal
    withdrawalAddress?: string;
    txHash?: string;

    // Transfer
    recipientId?: string;
    recipientUsername?: string;
    senderId?: string;
    senderUsername?: string;
    note?: string;

    // Stake
    stakeId?: string;
    targetReturn?: number;

    // ROI
    roiStakeId?: string;
    week?: number;
    weekNumber?: number;

    // Bonus
    bonusType?: 'registration' | 'referral' | 'performance';
    relatedUserId?: string;

    // Safe fields (still available after sanitization)
    date?: string;
    level?: number;
    referralLevel?: number;
    rosPercentage?: number;
    profitPercentage?: number;
    userRank?: string;
    poolType?: string;
    daysActive?: number;

    // ❌ REMOVED FIELDS (don't use these - sanitized by backend):
    // stakeAmount
    // referredUserName
    // referredUserId
    // totalPoolAmount
    // premiumPoolAmount
    // performancePoolAmount
    // poolSharePercentage
    // qualifierCount
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface TransactionHistoryParams {
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Query Keys
 */
export const transactionQueryKeys = {
  all: ['transactions'] as const,
  history: (params: TransactionHistoryParams) =>
    ['transactions', 'history', params] as const,
  details: (id: string) => ['transactions', 'details', id] as const,
};

/**
 * Get Transaction History
 * GET /api/v1/transactions/history?type=...&page=...&limit=...
 *
 * Fetches paginated transaction history with optional filters
 */
export function useTransactionHistory(params: TransactionHistoryParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `/transactions/history${queryString ? `?${queryString}` : ''}`;

  return useQuery<TransactionHistoryResponse>({
    queryKey: transactionQueryKeys.history(params),
    queryFn: async () => {
      console.log('[Transactions] 🔄 Fetching transaction history...', params);

      try {
        const response = await apiRequest<TransactionHistoryResponse>(
          'get',
          url
        );

        console.log('[Transactions] ✅ History loaded:', {
          count: response.data.transactions.length,
          page: response.data.pagination.currentPage,
          total: response.data.pagination.totalItems,
        });

        return response;
      } catch (error: unknown) {
        // Handle 404 gracefully - user has no transactions yet
        const err = error as {
          response?: { status?: number };
          statusCode?: number;
        };
        if (err?.response?.status === 404 || err?.statusCode === 404) {
          console.log(
            '[Transactions] ⚠️ No transactions found - returning empty list'
          );
          return {
            success: true,
            data: {
              transactions: [],
              pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: params.limit || 10,
                hasNextPage: false,
                hasPrevPage: false,
              },
            },
          };
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: unknown) => {
      const err = error as {
        response?: { status?: number };
        statusCode?: number;
      };
      // Don't retry 404s (new users without transactions)
      if (err?.response?.status === 404 || err?.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get Transaction Details
 * GET /api/v1/transactions/:transactionId
 *
 * Fetches detailed information about a specific transaction
 */
export function useTransactionDetails(transactionId: string) {
  return useQuery<{ success: boolean; transaction: Transaction }>({
    queryKey: transactionQueryKeys.details(transactionId),
    queryFn: async () => {
      console.log(
        `[Transactions] 🔄 Fetching transaction details: ${transactionId}`
      );
      const response = await apiRequest<{
        success: boolean;
        transaction: Transaction;
      }>('get', `/transactions/${transactionId}`);
      console.log(
        '[Transactions] ✅ Transaction details loaded:',
        response.transaction
      );
      return response;
    },
    enabled: !!transactionId, // Only run if transactionId exists
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Helper function to get transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    stake: 'Stake',
    roi: 'ROI Payout',
    bonus: 'Bonus',
    referral: 'Referral Bonus',
  };
  return labels[type] || type;
}

/**
 * Helper function to get transaction status color
 */
export function getTransactionStatusColor(status: TransactionStatus): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<
    TransactionStatus,
    { bg: string; text: string; border: string }
  > = {
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
    processing: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    completed: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    failed: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-800',
    },
  };
  return colors[status] || colors.pending;
}

/**
 * Helper function to get transaction type color
 */
export function getTransactionTypeColor(type: TransactionType): {
  bg: string;
  text: string;
  icon: string;
} {
  const colors: Record<
    TransactionType,
    { bg: string; text: string; icon: string }
  > = {
    deposit: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    withdrawal: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    transfer: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-700 dark:text-cyan-400',
      icon: 'text-cyan-600 dark:text-cyan-400',
    },
    stake: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    roi: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: 'text-green-600 dark:text-green-400',
    },
    bonus: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    referral: {
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      text: 'text-pink-700 dark:text-pink-400',
      icon: 'text-pink-600 dark:text-pink-400',
    },
  };
  return colors[type] || colors.deposit;
}
