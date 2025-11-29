/**
 * Wallet Hooks
 * React Query hooks for wallet operations
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi, type TransactionFilters } from '@/services/walletApi';
import { queryKeys } from '@/lib/queries';
import { toast } from 'sonner';

import type { WalletBalance } from '@/types/wallet';
import type { UserWallet } from '@/services/walletApi';
import type { TransactionHistoryParams } from '@/types/enhanced-transaction';

/**
 * Get wallet info (overview)
 * Auto-refetches every 30 seconds
 * Returns backward-compatible structure for existing components
 */
export function useWallet(): {
  balances: WalletBalance | null;
  wallet: UserWallet | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const queryResult = useQuery({
    queryKey: queryKeys.walletInfo,
    queryFn: async () => {
      try {
        const response = await walletApi.getWalletInfo();
        return response.wallet;
      } catch (error: any) {
        // Handle 404 - Wallet not found (new user) - This is expected
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
        };
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          console.log(
            '[useWallet] ℹ️ Wallet not created yet - returning empty wallet (normal for new users)'
          );
          // Return empty wallet structure
          return {
            totalBalance: 0,
            fundedWallet: 0,
            earningWallet: 0,
            canStake: false,
            canWithdraw: false,
            canTransfer: false,
            statistics: {
              totalDeposited: 0,
              totalWithdrawn: 0,
              totalTransferReceived: 0,
              totalTransferSent: 0,
              totalStaked: 0,
              totalStakeReturns: 0,
            },
            walletAddress: null,
            createdAt: new Date().toISOString(),
          } as UserWallet;
        }
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on 401, 403, or 404
      const status = error?.response?.status || error?.statusCode;
      if (status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Transform to backward-compatible structure
  const wallet = queryResult.data;
  const balances: WalletBalance | null = wallet
    ? {
        funded: {
          balance: wallet.fundedWallet || 0,
          availableBalance: wallet.fundedWallet || 0,
          lockedBalance: 0,
        },
        earnings: {
          balance: wallet.earningWallet || 0,
          availableBalance: wallet.earningWallet || 0,
          lockedBalance: 0,
        },
        total: wallet.totalBalance || 0,
        availableForWithdrawal: wallet.earningWallet || 0,
        pendingWithdrawals: 0,
        lockedInStakes: 0,
      }
    : null;

  return {
    balances,
    wallet,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

/**
 * Get detailed wallet (requires 2FA)
 * Only fetches when explicitly called
 */
export function useWalletDetailed() {
  return useQuery({
    queryKey: queryKeys.walletDetailed,
    queryFn: async () => {
      const response = await walletApi.getWalletDetailed();
      return response.wallet;
    },
    enabled: false, // Only fetch when explicitly called
  });
}

/**
 * Create deposit mutation
 */
export function useCreateDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => walletApi.createDeposit(amount),
    onSuccess: (response) => {
      // Invalidate wallet queries to refetch balance
      queryClient.invalidateQueries({ queryKey: queryKeys.walletInfo });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });

      // Note: Toast notification is handled in the component
      // to allow for automatic redirect to payment URL
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create deposit';
      toast.error('Deposit failed', {
        description: message,
      });
    },
  });
}

/**
 * Get deposit status (with polling)
 * Polls every 5 seconds if pending, stops if confirmed/failed
 */
export function useDepositStatus(invoiceId: string | null) {
  return useQuery({
    queryKey: queryKeys.depositStatus(invoiceId!),
    queryFn: () => walletApi.getDepositStatus(invoiceId!),
    enabled: !!invoiceId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      // Poll every 5 seconds if pending, stop if confirmed/failed
      return status === 'pending' ? 5000 : false;
    },
  });
}

/**
 * Get withdrawal limits
 */
export function useWithdrawalLimits() {
  return useQuery({
    queryKey: queryKeys.withdrawalLimits,
    queryFn: async () => {
      try {
        const response = await walletApi.getWithdrawalLimits();
        // Ensure we always return a value, never undefined
        if (!response || !response.data) {
          console.warn(
            '[useWithdrawalLimits] Invalid response, returning default limits'
          );
          return {
            minWithdrawal: 20,
            maxWithdrawal: 10000,
            dailyLimit: 2,
            dailyCount: 0,
            resetTime: new Date().toISOString(),
            feePercentage: 2.5,
            feeFixed: 1,
            feeCalculation: '2.5% + 1 USDT',
            availableBalance: 0,
            canWithdraw: false,
            requiresKYC: false,
            requires2FA: true,
            supportedNetworks: ['BEP20', 'TRC20'],
          };
        }
        return response.data;
      } catch (error) {
        console.error('[useWithdrawalLimits] Error fetching limits:', error);
        // Return default limits on error instead of undefined
        return {
          minWithdrawal: 20,
          maxWithdrawal: 10000,
          dailyLimit: 2,
          dailyCount: 0,
          resetTime: new Date().toISOString(),
          feePercentage: 2.5,
          feeFixed: 1,
          feeCalculation: '2.5% + 1 USDT',
          availableBalance: 0,
          canWithdraw: false,
          requiresKYC: false,
          requires2FA: true,
          supportedNetworks: ['BEP20', 'TRC20'],
        };
      }
    },
  });
}

/**
 * Create withdrawal mutation (requires 2FA)
 */
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      amount: number;
      walletAddress: string;
      network?: string;
    }) => walletApi.createWithdrawal(payload),
    onSuccess: (response) => {
      // Invalidate wallet queries
      queryClient.invalidateQueries({ queryKey: queryKeys.walletInfo });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalLimits });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals });

      toast.success('Withdrawal requested', {
        description: 'Your withdrawal will be processed within 24-48 hours',
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create withdrawal';

      // Handle specific error cases
      if (error?.response?.status === 403) {
        toast.error('2FA Required', {
          description: 'Please complete 2FA verification to proceed',
        });
      } else if (error?.response?.status === 400) {
        toast.error('Invalid Request', {
          description: message,
        });
      } else {
        toast.error('Withdrawal failed', {
          description: message,
        });
      }
    },
  });
}

/**
 * Get transaction history with filters
 * Returns the full enhanced transaction history response including summary and category breakdown
 */
export function useTransactionHistory(filters: TransactionHistoryParams = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(filters as any),
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[useTransactionHistory] 🔄 Fetching with filters:',
            filters
          );
        }

        const response = await walletApi.getTransactionHistory(filters);

        if (process.env.NODE_ENV === 'development') {
          console.log('[useTransactionHistory] ✅ Raw response:', response);
          console.log(
            '[useTransactionHistory] Response type:',
            typeof response
          );
          console.log(
            '[useTransactionHistory] Response keys:',
            response ? Object.keys(response) : []
          );
          console.log(
            '[useTransactionHistory] Has data prop:',
            response && 'data' in response
          );
          console.log(
            '[useTransactionHistory] Has transactions prop:',
            response && 'transactions' in response
          );
          if (response?.data) {
            console.log(
              '[useTransactionHistory] Response.data:',
              response.data
            );
            console.log(
              '[useTransactionHistory] Response.data.transactions:',
              response.data.transactions?.length
            );
          }
          if ((response as any)?.transactions) {
            console.log(
              '[useTransactionHistory] Direct transactions:',
              (response as any).transactions?.length
            );
          }
        }

        // Handle case where response is already the data object (unwrapped by API client)
        if (
          response &&
          'transactions' in response &&
          !('success' in response)
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[useTransactionHistory] 📦 Response is already unwrapped data object'
            );
          }
          return response as any;
        }

        // Handle wrapped response { success: true, data: {...} }
        if (response?.data) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useTransactionHistory] 📦 Returning response.data');
          }
          return response.data;
        }
        // Return empty structure if no data
        return {
          transactions: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: filters.limit || 20,
            hasNext: false,
            hasPrev: false,
          },
          summary: {
            deposits: { total: 0, count: 0 },
            withdrawals: { total: 0, count: 0 },
            staking: {
              totalStaked: 0,
              stakeCount: 0,
              totalCompletions: 0,
              completionCount: 0,
            },
            earnings: {
              rosPayouts: 0,
              rosCount: 0,
              poolPayouts: 0,
            },
            bonuses: { total: 0, count: 0 },
            transfers: { sent: 0, received: 0 },
            fees: 0,
            netInflow: 0,
          },
          categoryBreakdown: {},
          filters: {
            type: filters.type || 'all',
            category: filters.category || 'all',
            status: filters.status || 'all',
            dateFrom: filters.dateFrom || null,
            dateTo: filters.dateTo || null,
            amountMin: filters.amountMin || null,
            amountMax: filters.amountMax || null,
            search: filters.search || null,
          },
          availableFilters: {
            types: [],
            categories: [],
            statuses: [],
          },
        };
      } catch (error: any) {
        console.error('[useTransactionHistory] ❌ Error:', error);
        console.error('[useTransactionHistory] Error details:', {
          message: error?.message,
          status: error?.response?.status || error?.statusCode,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          url: error?.config?.url,
        });

        // Handle 404 - No transactions yet (new user) - This is expected
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
        };
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          console.log(
            '[useTransactionHistory] ℹ️ No transactions found - returning empty list (normal for new users)'
          );
          return {
            transactions: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: filters.limit || 20,
              hasNext: false,
              hasPrev: false,
            },
            summary: {
              deposits: { total: 0, count: 0 },
              withdrawals: { total: 0, count: 0 },
              staking: {
                totalStaked: 0,
                stakeCount: 0,
                totalCompletions: 0,
                completionCount: 0,
              },
              earnings: {
                rosPayouts: 0,
                rosCount: 0,
                poolPayouts: 0,
              },
              bonuses: { total: 0, count: 0 },
              transfers: { sent: 0, received: 0 },
              fees: 0,
              netInflow: 0,
            },
            categoryBreakdown: {},
            filters: {
              type: filters.type || 'all',
              category: filters.category || 'all',
              status: filters.status || 'all',
              dateFrom: filters.dateFrom || null,
              dateTo: filters.dateTo || null,
              amountMin: filters.amountMin || null,
              amountMax: filters.amountMax || null,
              search: filters.search || null,
            },
            availableFilters: {
              types: [],
              categories: [],
              statuses: [],
            },
          };
        }
        // For other errors, return empty structure instead of throwing
        console.error(
          '[useTransactionHistory] Error fetching transactions:',
          error
        );
        return {
          transactions: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: filters.limit || 20,
            hasNext: false,
            hasPrev: false,
          },
          summary: {
            deposits: { total: 0, count: 0 },
            withdrawals: { total: 0, count: 0 },
            staking: {
              totalStaked: 0,
              stakeCount: 0,
              totalCompletions: 0,
              completionCount: 0,
            },
            earnings: {
              rosPayouts: 0,
              rosCount: 0,
              poolPayouts: 0,
            },
            bonuses: { total: 0, count: 0 },
            transfers: { sent: 0, received: 0 },
            fees: 0,
            netInflow: 0,
          },
          categoryBreakdown: {},
          filters: {
            type: filters.type || 'all',
            category: filters.category || 'all',
            status: filters.status || 'all',
            dateFrom: filters.dateFrom || null,
            dateTo: filters.dateTo || null,
            amountMin: filters.amountMin || null,
            amountMax: filters.amountMax || null,
            search: filters.search || null,
          },
          availableFilters: {
            types: [],
            categories: [],
            statuses: [],
          },
        };
      }
    },
    placeholderData: (previousData) => previousData, // Keep previous data while loading new page
  });
}
