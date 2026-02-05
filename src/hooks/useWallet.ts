/**
 * Wallet Hooks
 * React Query hooks for wallet operations
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi, type TransactionFilters } from '@/services/walletApi';
import { queryKeys } from '@/lib/queries';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/wallet';

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
    enabled: typeof window !== 'undefined', // Only run on client side
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
              totalEarned: 0,
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
        console.log('[useWithdrawalLimits] 🔍 Fetching withdrawal limits...');
        const response = await walletApi.getWithdrawalLimits();
        console.log('[useWithdrawalLimits] 📥 Response:', response);

        // Ensure we always return a value, never undefined
        if (!response || !response.data) {
          console.warn(
            '[useWithdrawalLimits] ⚠️ Invalid response, returning default limits'
          );
          return {
            availableBalance: 0,
            limits: {
              minimum: 10,
              instantWithdrawalThreshold: 50,
              enableInstantWithdrawals: true,
            },
            dailyLimits: {
              maxWithdrawalsPerDay: 2,
              withdrawalsUsedToday: 0,
              withdrawalsRemaining: 2,
              canWithdrawToday: true,
              resetTime: new Date().toISOString(),
            },
            fees: {
              percentage: 3.0,
              description: '3% fee applied to all withdrawals',
            },
            supportedNetworks: ['TRC20', 'BEP20'],
            processingTimes: {
              instant: '5-15 minutes (amounts under $50)',
              standard: '1-24 hours (admin approval required)',
            },
          };
        }
        console.log('[useWithdrawalLimits] ✅ Returning data:', response.data);
        return response.data;
      } catch (error) {
        console.error('[useWithdrawalLimits] ❌ Error fetching limits:', error);
        // Return default limits on error instead of undefined
        return {
          availableBalance: 0,
          limits: {
            minimum: 10,
            instantWithdrawalThreshold: 50,
            enableInstantWithdrawals: true,
          },
          dailyLimits: {
            maxWithdrawalsPerDay: 2,
            withdrawalsUsedToday: 0,
            withdrawalsRemaining: 2,
            canWithdrawToday: true,
            resetTime: new Date().toISOString(),
          },
          fees: {
            percentage: 3.0,
            description: '3% fee applied to all withdrawals',
          },
          supportedNetworks: ['TRC20', 'BEP20'],
          processingTimes: {
            instant: '5-15 minutes (amounts under $50)',
            standard: '1-24 hours (admin approval required)',
          },
        };
      }
    },
  });
}

/**
 * Get default withdrawal address
 * GET /api/v1/wallets/withdrawal/default-address
 */
export function useDefaultWithdrawalAddress() {
  return useQuery({
    queryKey: ['withdrawal', 'default-address'],
    queryFn: async () => {
      try {
        const response = await walletApi.getDefaultWithdrawalAddress();
        console.log(
          '[useDefaultWithdrawalAddress] 📥 Raw API response:',
          response
        );

        // Ensure we always return a value, never undefined
        if (!response || !response.data) {
          console.warn(
            '[useDefaultWithdrawalAddress] Invalid response, returning default'
          );
          return {
            address: null,
            hasDefaultAddress: false,
            canChange: true,
            moratorium: {
              active: false,
              canChange: true,
              hoursRemaining: 0,
              minutesRemaining: 0,
              canChangeAt: null,
              canChangeAtFormatted: null,
              moratoriumDurationHours: 48,
            },
            immutable: false,
          };
        }

        console.log(
          '[useDefaultWithdrawalAddress] 📊 Response data:',
          response.data
        );
        console.log('[useDefaultWithdrawalAddress] 🔍 Address field:', {
          address: response.data.address,
          hasDefaultAddress: response.data.hasDefaultAddress,
          canChange: response.data.canChange,
          moratorium: response.data.moratorium,
        });

        return response.data;
      } catch (error: any) {
        // If 404, user doesn't have default address
        if (error?.response?.status === 404 || error?.statusCode === 404) {
          return {
            address: null,
            hasDefaultAddress: false,
            canChange: true,
            moratorium: {
              active: false,
              canChange: true,
              hoursRemaining: 0,
              minutesRemaining: 0,
              canChangeAt: null,
              canChangeAtFormatted: null,
              moratoriumDurationHours: 48,
            },
            immutable: false,
          };
        }
        // For other errors, return default instead of throwing
        // This prevents React Query from setting data to undefined
        console.error(
          '[useDefaultWithdrawalAddress] Error fetching default address:',
          error
        );
        return {
          address: null,
          hasDefaultAddress: false,
          canChange: true,
          moratorium: {
            active: false,
            canChange: true,
            hoursRemaining: 0,
            minutesRemaining: 0,
            canChangeAt: null,
            canChangeAtFormatted: null,
            moratoriumDurationHours: 48,
          },
          immutable: false,
        };
      }
    },
  });
}

/**
 * Set default withdrawal address mutation (requires 2FA, immutable once set)
 * POST /api/v1/wallets/withdrawal/default-address
 */
export function useSetDefaultWithdrawalAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      address: string;
      network?: 'TRC20' | 'BEP20';
      twoFACode?: string;
    }) => walletApi.setDefaultWithdrawalAddress(payload),
    onSuccess: async (response) => {
      // Update cache immediately with response data if available
      if (response?.data) {
        queryClient.setQueryData(
          ['withdrawal', 'default-address'],
          response.data
        );
      }
      // Invalidate both the default address query and wallet info query
      // (wallet info now includes default address info)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['withdrawal', 'default-address'],
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.walletInfo }),
      ]);
      // Refetch to ensure UI is updated immediately
      await queryClient.refetchQueries({
        queryKey: ['withdrawal', 'default-address'],
      });
      // Check if this is first-time setting or a change
      const isFirstTime = response?.data?.isFirstTime;
      const moratorium = response?.data?.moratorium;

      if (isFirstTime) {
        toast.success('Withdrawal address set', {
          description: 'Your withdrawal address has been saved successfully.',
        });
      } else {
        toast.success('Withdrawal address updated', {
          description: moratorium?.active
            ? `Address updated. You can change it again after 48 hours.`
            : 'Your withdrawal address has been updated successfully.',
        });
      }
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      const code = errorData?.code;
      const message =
        errorData?.message || error?.message || 'Failed to save address';

      // Handle moratorium active error
      if (code === 'ADDRESS_MORATORIUM_ACTIVE') {
        const moratorium = errorData?.moratorium;
        const hoursRemaining = moratorium?.hoursRemaining || 0;
        const minutesRemaining = moratorium?.minutesRemaining || 0;
        const canChangeAt = moratorium?.canChangeAtFormatted;

        // Invalidate and refetch to update the UI with moratorium status
        queryClient.invalidateQueries({
          queryKey: ['withdrawal', 'default-address'],
        });

        toast.error('Address change locked', {
          description: `Please wait ${hoursRemaining} hour(s) and ${minutesRemaining} minute(s). ${canChangeAt ? `Available at: ${canChangeAt}` : ''}`,
          duration: 6000,
        });
      } else if (code === 'UNSUPPORTED_NETWORK') {
        toast.error('Network not supported', {
          description: 'Only BEP20 (BSC) network is supported.',
        });
      } else if (code === 'INVALID_ADDRESS') {
        toast.error('Invalid BEP20 address', {
          description:
            message ||
            'Invalid BEP20 address. Please enter a valid BSC wallet address.',
        });
      } else if (code === '2FA_CODE_INVALID') {
        toast.error('Invalid 2FA code', {
          description: 'Invalid 2FA code. Please try again.',
        });
      } else {
        toast.error('Save failed', {
          description: message,
        });
      }
    },
  });
}

/**
 * Create withdrawal mutation (requires 2FA)
 * POST /api/v1/enhanced-transactions/withdrawal/create
 */
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      amount: number;
      walletAddress?: string; // Optional - if not provided, backend uses user's default withdrawal address
      network?: 'TRC20' | 'BEP20';
      twoFACode: string; // Required
      turnstileToken?: string; // Cloudflare Turnstile; required when backend has TURNSTILE_SECRET_KEY set
    }) => walletApi.createWithdrawal(payload),
    onSuccess: (response) => {
      // Invalidate wallet queries
      queryClient.invalidateQueries({ queryKey: queryKeys.walletInfo });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalLimits });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals });

      const requiresApproval = response.data?.requiresApproval;
      const estimatedTime =
        response.data?.estimatedProcessingTime || '1-24 hours';

      if (requiresApproval) {
        toast.success('Withdrawal submitted for approval', {
          description: `Admin approval required. ${estimatedTime}`,
        });
      } else {
        toast.success('Withdrawal processing', {
          description: `Processing your withdrawal. ${estimatedTime}`,
        });
      }
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      const code = errorData?.code;
      const message =
        errorData?.message || error?.message || 'Failed to create withdrawal';

      // Turnstile verification failed (widget reset is done in WithdrawalModal)
      if (code === 'TURNSTILE_FAILED') {
        toast.error('Security check failed', {
          description:
            errorData?.message ||
            'Please complete the verification and try again.',
        });
        return;
      }

      // Handle specific error codes
      if (code === 'INSUFFICIENT_FUNDS') {
        const availableBalance = errorData?.availableBalance || 0;
        toast.error('Insufficient balance', {
          description: `Available: ${formatCurrency(availableBalance)}. Withdrawals can only be made from earnings wallet.`,
        });
      } else if (code === 'WITHDRAWAL_AMOUNT_TOO_LOW') {
        toast.error('Amount too low', {
          description: message,
        });
      } else if (code === 'WITHDRAWAL_AMOUNT_TOO_HIGH') {
        toast.error('Amount too high', {
          description: message,
        });
      } else if (code === 'WALLET_ADDRESS_REQUIRED') {
        const requiresSetup = errorData?.requiresSetup;
        toast.error('Withdrawal address required', {
          description: requiresSetup
            ? message ||
              'Please set your default withdrawal address first. You will be redirected to the setup page.'
            : 'Please enter a wallet address or set a default address',
        });
      } else if (code === 'INVALID_ADDRESS') {
        toast.error('Invalid address', {
          description: message,
        });
      } else if (code === '2FA_REQUIRED' || code === '2FA_CODE_INVALID') {
        toast.error('2FA Error', {
          description: message || 'Invalid 2FA code. Please try again.',
        });
      } else if (code === 'DAILY_LIMIT_EXCEEDED') {
        toast.error('Daily limit exceeded', {
          description: message,
        });
      } else if (error?.response?.status === 403) {
        toast.error('2FA Required', {
          description: 'Please complete 2FA verification to proceed',
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
