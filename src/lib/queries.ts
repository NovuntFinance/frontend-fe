/**
 * React Query Configuration & Queries
 * Centralized API queries using TanStack Query (React Query)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { api } from './api';
import {
  UserProfile,
  ChangePasswordPayload,
  KYCDocument,
  Session,
} from '@/types/user';
import { WalletBalance, DepositAddress } from '@/types/wallet';
import { DashboardOverview } from '@/types/dashboard';
import { StakeWithGoal, StakeStats, ROIPayoutHistory } from '@/types/stake';
import {
  Transaction,
  TransactionDetail,
  TransactionFilters,
  TransactionSummary,
} from '@/types/transaction';
import {
  Withdrawal,
  WithdrawalFees,
  WithdrawalDetail,
  WithdrawalStats,
} from '@/types/withdrawal';
import {
  ReferralStats,
  ReferralTree,
  ReferralLeaderboard,
  ReferralInfo,
  ReferralTreeData,
} from '@/types/referral';
import { referralApi } from '@/services/referralApi';
import {
  TeamInfo,
  RankInfo,
  NextRankRequirements,
  PoolDistributionsData,
  IncentiveWallet,
} from '@/types/teamRank';
import { teamRankApi } from '@/services/teamRankApi';
import { registrationBonusApi } from '@/services/registrationBonusApi';
import {
  RegistrationBonusStatusResponse,
  BonusPayoutHistoryResponse,
} from '@/types/registrationBonus';
import { AdminDashboardData, AdminDashboardTimeframe } from '@/types/admin';
import { useAuthStore } from '@/store/authStore';

// Query Keys (for cache management)
export const queryKeys = {
  // Auth
  profile: ['profile'] as const,
  sessions: ['sessions'] as const,
  dashboardOverview: ['dashboard', 'overview'] as const,

  // Wallets
  wallets: ['wallets'] as const,
  walletInfo: ['wallet', 'info'] as const,
  walletDetailed: ['wallet', 'detailed'] as const,
  walletBalance: ['wallet', 'balance'] as const,
  depositAddress: ['wallet', 'deposit-address'] as const,
  depositStatus: (invoiceId: string) =>
    ['deposit', 'status', invoiceId] as const,
  withdrawalLimits: ['withdrawal', 'limits'] as const,

  // Stakes
  stakes: ['stakes'] as const,
  activeStakes: ['stakes', 'active'] as const,
  completedStakes: ['stakes', 'completed'] as const,
  stake: (id: string) => ['stake', id] as const,
  stakeStats: ['stakes', 'stats'] as const,
  roiHistory: (stakeId: string) => ['stake', stakeId, 'roi-history'] as const,

  // Transactions
  transactions: (filters?: TransactionFilters) =>
    ['transactions', filters] as const,
  transaction: (id: string) => ['transaction', id] as const,
  transactionSummary: (period: string) =>
    ['transactions', 'summary', period] as const,

  // Withdrawals
  withdrawals: ['withdrawals'] as const,
  withdrawal: (id: string) => ['withdrawal', id] as const,
  withdrawalFees: ['withdrawal', 'fees'] as const,
  withdrawalStats: ['withdrawals', 'stats'] as const,

  // Referrals
  referralStats: ['referrals', 'stats'] as const,
  referralInfo: ['referrals', 'info'] as const,
  referralTree: (maxLevels?: number) =>
    ['referrals', 'tree', maxLevels] as const,
  referralLeaderboard: ['referrals', 'leaderboard'] as const,

  // Team & Rank
  teamInfo: ['team', 'info'] as const,
  rankInfo: ['rank', 'info'] as const,
  nextRankRequirements: ['rank', 'next-requirements'] as const,
  poolDistributions: (page?: number, limit?: number, type?: string) =>
    ['pools', 'distributions', page, limit, type] as const,
  incentiveWallet: ['pools', 'incentive-wallet'] as const,

  // Registration Bonus
  registrationBonus: ['registrationBonus'] as const,
  registrationBonusStatus: ['registrationBonus', 'status'] as const,
  bonusPayoutHistory: (page?: number, limit?: number) =>
    ['registrationBonus', 'payout-history', page, limit] as const,

  // KYC
  kycStatus: ['kyc', 'status'] as const,
  kycDocuments: ['kyc', 'documents'] as const,

  // Admin
  adminDashboard: (timeframe: AdminDashboardTimeframe) =>
    ['admin', 'dashboard', timeframe] as const,
};

// Backend response format (from COMPLETE_FINANCIAL_SYSTEM_DOCUMENTATION.md)
interface WalletInfoBackendResponse {
  success: boolean;
  wallet: {
    walletAddress: string;
    fundedWallet: number; // Backend field name
    earningWallet: number; // Backend field name (no 's')
    totalBalance: number;
    availableForTransfer?: number; // Available for transfers (same as earningWallet)
    transferOptions?: {
      availableForTransfer: number;
      canTransferAll: boolean;
      breakdown: {
        fromFundedWallet: number;
        fromEarningWallet: number;
      };
    };
  };
}

// Legacy format for backward compatibility
interface WalletBalanceApiResponse {
  depositWallet:
    | number
    | {
        balance?: number;
        availableBalance?: number;
        lockedBalance?: number;
      };
  earningsWallet:
    | number
    | {
        balance?: number;
        availableBalance?: number;
        lockedBalance?: number;
      };
  totalBalance: number;
  availableForWithdrawal?: number;
  lockedInStakes?: number;
  pendingWithdrawals?: number;
}

const normaliseWalletSection = (
  section: WalletBalanceApiResponse['depositWallet'],
  fallbackAvailable = 0,
  fallbackLocked = 0
) => {
  if (typeof section === 'number') {
    const balance = section;
    const availableBalance = Math.max(fallbackAvailable || balance, 0);
    const lockedBalance = Math.max(
      fallbackLocked || balance - availableBalance,
      0
    );

    return {
      balance,
      availableBalance,
      lockedBalance,
    };
  }

  const balance = section.balance ?? 0;
  const availableBalance =
    section.availableBalance ?? fallbackAvailable ?? balance;
  const lockedBalance =
    section.lockedBalance ??
    fallbackLocked ??
    Math.max(balance - availableBalance, 0);

  return {
    balance,
    availableBalance: Math.max(availableBalance, 0),
    lockedBalance: Math.max(lockedBalance, 0),
  };
};

// ============================================
// AUTH QUERIES
// ============================================

import {
  userService,
  type UserProfile as UserServiceProfile,
} from './userService';
import type { UserProfile as FrontendUserProfile } from '@/types/user';

/**
 * useProfile - Get user profile
 * Phase 1: GET /users/profile
 *
 * Returns complete user profile with nested profile data
 */
export function useProfile(
  options?: Partial<UseQueryOptions<FrontendUserProfile>>
) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      try {
        console.log('[useProfile] Fetching profile from Phase 1 endpoint...');
        const response = await userService.getProfile();

        // Unwrap response if nested
        let profile = response;
        if (response && typeof response === 'object' && 'data' in response) {
          profile = (response as any).data;
        }

        console.log('[useProfile] Profile fetched:', profile);

        // Normalize backend field names (fname/lname) to frontend format (firstName/lastName)
        const backendProfile = profile as unknown as UserServiceProfile;
        // Preserve the nested profile structure from UserServiceProfile
        const normalizedProfile: FrontendUserProfile & {
          profile?: UserServiceProfile['profile'];
        } = {
          _id: backendProfile.userId || '',
          id: backendProfile.userId,
          email: backendProfile.email,
          username: backendProfile.username,
          fname: backendProfile.fname,
          lname: backendProfile.lname,
          firstName: backendProfile.fname,
          lastName: backendProfile.lname,
          fullName: `${backendProfile.fname} ${backendProfile.lname}`,
          phoneNumber: backendProfile.phoneNumber,
          countryCode: backendProfile.countryCode,
          avatar: backendProfile.profilePicture,
          role: backendProfile.role as 'user' | 'admin' | 'superAdmin',
          rank: 'Stakeholder' as const,
          emailVerified: true,
          twoFAEnabled: backendProfile.twoFAEnabled,
          referralCode: backendProfile.referralCode || '',
          isActive: backendProfile.isActive ?? true,
          createdAt: backendProfile.createdAt || new Date().toISOString(),
          updatedAt: backendProfile.updatedAt,
          wallets: {
            funded: { id: '', balance: 0 },
            earnings: { id: '', balance: 0 },
          },
          statistics: {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalStakeROI: 0,
            totalReferralEarnings: 0,
            totalBonuses: 0,
          },
          // Preserve nested profile structure for compatibility
          profile: backendProfile.profile,
        } as FrontendUserProfile & { profile?: UserServiceProfile['profile'] };

        console.log('[useProfile] Normalized profile:', normalizedProfile);
        return normalizedProfile;
      } catch (error: any) {
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
          code?: string;
          message?: string;
        };

        // Handle network errors gracefully - return minimal profile instead of throwing
        const isNetworkError =
          err?.code === 'ERR_NETWORK' ||
          err?.message?.includes('Network Error') ||
          err?.message?.includes('Failed to fetch') ||
          (!err?.response && !err?.statusCode);

        if (isNetworkError) {
          console.warn(
            '[useProfile] ⚠️ Network error - backend might be unavailable'
          );
          // Return minimal profile structure to prevent app crash
          return {
            _id: '',
            id: '',
            email: '',
            username: '',
            fname: '',
            lname: '',
            firstName: '',
            lastName: '',
            fullName: '',
            phoneNumber: '',
            countryCode: '',
            avatar: '',
            role: 'user' as const,
            rank: 'Stakeholder' as const,
            emailVerified: false,
            twoFAEnabled: false,
            referralCode: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wallets: {
              funded: { id: '', balance: 0 },
              earnings: { id: '', balance: 0 },
            },
            statistics: {
              totalDeposits: 0,
              totalWithdrawals: 0,
              totalStakeROI: 0,
              totalReferralEarnings: 0,
              totalBonuses: 0,
            },
          } as FrontendUserProfile;
        }

        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds - refetch more often
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: (failureCount, error: any) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
        code?: string;
        message?: string;
      };

      // Don't retry network errors aggressively (backend might be down)
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch') ||
        (!err?.response && !err?.statusCode);
      if (isNetworkError) {
        return failureCount < 1; // Only retry once for network errors
      }

      // Don't retry on 401/403 (auth errors)
      const status = err?.response?.status || err?.statusCode;
      if (status === 401 || status === 403) {
        return false;
      }

      return failureCount < 2;
    },
    ...options,
  });
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => api.get<Session[]>('/better-auth/sessions'),
  });
}

// ============================================
// WALLET QUERIES
// ============================================

export function useWalletBalance() {
  // Check authentication before running query
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.walletBalance,
    enabled: !!isAuthenticated && !authLoading, // Only run when user is authenticated
    queryFn: async () => {
      try {
        console.log(
          '[useWalletBalance] 🔄 Fetching wallet from NEW financial backend...'
        );

        // NEW: Call the financial system backend endpoint
        const response =
          await api.get<WalletInfoBackendResponse>('/wallets/info');

        console.log('[useWalletBalance] ✅ Response from backend:', response);

        // Backend returns { success: true, wallet: { ... } }
        const walletData = response.wallet || response;

        console.log('[useWalletBalance] 📊 Wallet data:', {
          fundedWallet: walletData.fundedWallet,
          earningWallet: walletData.earningWallet,
          totalBalance: walletData.totalBalance,
        });

        // Map backend field names to frontend format
        // Backend: fundedWallet → Frontend: funded (Deposit Wallet)
        // Backend: earningWallet → Frontend: earnings (Earnings Wallet)
        // Use availableForTransfer if provided, otherwise fallback to earningWallet
        const availableForTransfer =
          walletData.availableForTransfer ??
          walletData.transferOptions?.availableForTransfer ??
          walletData.earningWallet ??
          0;

        return {
          funded: {
            balance: walletData.fundedWallet || 0,
            availableBalance: walletData.fundedWallet || 0,
            lockedBalance: 0, // Funds in Deposit Wallet are available for staking
          },
          earnings: {
            balance: walletData.earningWallet || 0,
            availableBalance: availableForTransfer, // Use availableForTransfer for transfers
            lockedBalance: 0, // Earnings are available for withdrawal/transfer/staking
          },
          total: walletData.totalBalance || 0,
          availableForWithdrawal: walletData.earningWallet || 0, // Only Earnings Wallet can withdraw
          pendingWithdrawals: 0,
          lockedInStakes: 0,
        } satisfies WalletBalance;
      } catch (error: unknown) {
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
          code?: string;
          message?: string;
        };

        // Handle 404 - Wallet not found (new user) - This is expected
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          console.log(
            '[useWalletBalance] ℹ️ Wallet not created yet - returning empty wallet (normal for new users)'
          );
          return {
            funded: { balance: 0, availableBalance: 0, lockedBalance: 0 },
            earnings: { balance: 0, availableBalance: 0, lockedBalance: 0 },
            total: 0,
            availableForWithdrawal: 0,
            pendingWithdrawals: 0,
            lockedInStakes: 0,
          } satisfies WalletBalance;
        }

        // Handle network errors gracefully - return empty wallet instead of throwing
        const isNetworkError =
          err?.code === 'ERR_NETWORK' ||
          err?.message?.includes('Network Error') ||
          err?.message?.includes('Failed to fetch') ||
          (!err?.response && !err?.statusCode);

        if (isNetworkError) {
          console.warn(
            '[useWalletBalance] ⚠️ Network error - returning empty wallet (backend might be unavailable)'
          );
          return {
            funded: { balance: 0, availableBalance: 0, lockedBalance: 0 },
            earnings: { balance: 0, availableBalance: 0, lockedBalance: 0 },
            total: 0,
            availableForWithdrawal: 0,
            pendingWithdrawals: 0,
            lockedInStakes: 0,
          } satisfies WalletBalance;
        }

        // Only log and throw for other errors
        console.error('[useWalletBalance] ❌ Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: (failureCount, error) => {
      // Don't retry on 401 (authentication errors), 403 (authorization errors), or 404 (wallet not found)
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response?: { status?: number } }).response
          ?.status;
        if (status === 401 || status === 403 || status === 404) {
          return false; // Don't retry these errors
        }
      }
      // Don't retry if error has statusCode 404
      if (
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        (error as { statusCode?: number }).statusCode === 404
      ) {
        return false;
      }
      return failureCount < 2; // Retry other errors up to 2 times
    },
  });
}

export function useDepositAddress() {
  // Check authentication before running query
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.depositAddress,
    enabled: !!isAuthenticated && !authLoading, // Only run when user is authenticated
    queryFn: () => api.get<DepositAddress>('/wallet/deposit-address'),
    staleTime: Infinity, // Address doesn't change
  });
}

// ============================================
// DASHBOARD QUERIES
// ============================================

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboardOverview,
    queryFn: async () => {
      try {
        return await api.get<DashboardOverview>('/staking/dashboard');
      } catch (error: unknown) {
        // Handle 404 - No dashboard data yet (new user)
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
        };
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          console.log(
            '[useDashboardOverview] Dashboard not found - returning empty data'
          );
          return null;
        }
        throw error;
      }
    },
    staleTime: 60 * 1000,
    retry: (failureCount, error: unknown) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
      };
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        return false; // Don't retry 404s
      }
      return failureCount < 2;
    },
  });
}

// ============================================
// STAKE QUERIES
// ============================================

export function useActiveStakes() {
  return useQuery({
    queryKey: queryKeys.activeStakes,
    queryFn: async () => {
      try {
        return await api.get<StakeWithGoal[]>('/staking/dashboard');
      } catch (error: unknown) {
        // Handle 404 - No stakes yet (new user)
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
        };
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          console.log(
            '[useActiveStakes] Stakes not found - returning empty array'
          );
          return [];
        }
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    retry: (failureCount, error: unknown) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
      };
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        return false; // Don't retry 404s
      }
      return failureCount < 2;
    },
  });
}

export function useCompletedStakes() {
  return useQuery({
    queryKey: queryKeys.completedStakes,
    queryFn: () => api.get<StakeWithGoal[]>('/staking/completed'),
  });
}

export function useStake(id: string) {
  return useQuery({
    queryKey: queryKeys.stake(id),
    queryFn: () => api.get<StakeWithGoal>(`/staking/${id}`),
    enabled: !!id,
  });
}

export function useStakeStats() {
  return useQuery({
    queryKey: queryKeys.stakeStats,
    queryFn: () => api.get<StakeStats>('/staking/stats'),
  });
}

export function useROIHistory(stakeId: string) {
  return useQuery({
    queryKey: queryKeys.roiHistory(stakeId),
    queryFn: () =>
      api.get<ROIPayoutHistory[]>(`/staking/${stakeId}/roi-history`),
    enabled: !!stakeId,
  });
}

// ============================================
// TRANSACTION QUERIES
// ============================================

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: async () => {
      try {
        return await api.get<Transaction[]>('/transactions/history', {
          params: filters,
        });
      } catch (error: unknown) {
        // Handle 404 - No transactions yet (new user)
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
        };
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          console.log(
            '[useTransactions] Transactions not found - returning empty array'
          );
          return [];
        }
        throw error;
      }
    },
    staleTime: 30 * 1000,
    retry: (failureCount, error: unknown) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
      };
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        return false; // Don't retry 404s
      }
      return failureCount < 2;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => api.get<TransactionDetail>(`/transactions/${id}`),
    enabled: !!id,
  });
}

export function useTransactionSummary(
  period: '7d' | '30d' | '90d' | 'all' = '30d'
) {
  return useQuery({
    queryKey: queryKeys.transactionSummary(period),
    queryFn: () =>
      api.get<TransactionSummary>(`/transactions/summary?period=${period}`),
  });
}

// ============================================
// WITHDRAWAL QUERIES
// ============================================

export function useWithdrawals() {
  return useQuery({
    queryKey: queryKeys.withdrawals,
    queryFn: () => api.get<Withdrawal[]>('/withdrawal/my-withdrawals'),
  });
}

export function useWithdrawal(id: string) {
  return useQuery({
    queryKey: queryKeys.withdrawal(id),
    queryFn: () => api.get<WithdrawalDetail>(`/withdrawal/${id}`),
    enabled: !!id,
  });
}

export function useWithdrawalFees() {
  return useQuery({
    queryKey: queryKeys.withdrawalFees,
    queryFn: () => api.get<WithdrawalFees[]>('/withdrawal/fees'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useWithdrawalStats() {
  return useQuery({
    queryKey: queryKeys.withdrawalStats,
    queryFn: () => api.get<WithdrawalStats>('/withdrawal/stats'),
  });
}

// ============================================
// REFERRAL QUERIES
// ============================================

/**
 * Get referral information (code, link, basic stats)
 * GET /api/v1/better-auth/referral-info
 */
export function useReferralInfo() {
  return useQuery<ReferralInfo>({
    queryKey: queryKeys.referralInfo,
    queryFn: async (): Promise<ReferralInfo> => {
      try {
        const response = await referralApi.getReferralInfo();
        console.log(
          '[useReferralInfo] Full API response from referralApi:',
          response
        );
        console.log('[useReferralInfo] Response type:', typeof response);
        console.log(
          '[useReferralInfo] Response keys:',
          response && typeof response === 'object'
            ? Object.keys(response)
            : 'N/A'
        );
        console.log(
          '[useReferralInfo] Has data property?',
          response && typeof response === 'object' && 'data' in response
        );
        console.log(
          '[useReferralInfo] Has referralCode?',
          response && typeof response === 'object' && 'referralCode' in response
        );

        // referralApi.getReferralInfo() always returns { success: boolean, data: { referralCode, ... } }
        // So we need to extract response.data
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          response.data
        ) {
          const data = response.data;
          console.log('[useReferralInfo] Extracted data:', data);
          console.log('[useReferralInfo] Data type:', typeof data);
          console.log(
            '[useReferralInfo] Data keys:',
            data && typeof data === 'object' ? Object.keys(data) : 'N/A'
          );
          console.log(
            '[useReferralInfo] Data has referralCode?',
            data && typeof data === 'object' && 'referralCode' in data
          );
          console.log(
            '[useReferralInfo] Data has referralLink?',
            data && typeof data === 'object' && 'referralLink' in data
          );
          console.log(
            '[useReferralInfo] referralCode value:',
            data && typeof data === 'object'
              ? (data as any).referralCode
              : 'N/A'
          );
          console.log(
            '[useReferralInfo] referralLink value:',
            data && typeof data === 'object'
              ? (data as any).referralLink
              : 'N/A'
          );
          return data as ReferralInfo;
        }

        // Fallback: if somehow response is already the data object
        if (
          response &&
          typeof response === 'object' &&
          'referralCode' in response &&
          'referralLink' in response
        ) {
          console.log(
            '[useReferralInfo] Response is already data object:',
            response
          );
          return response as unknown as ReferralInfo;
        }

        // Last resort: return empty object structure
        console.warn(
          '[useReferralInfo] Unexpected response structure, returning empty:',
          response
        );
        const emptyInfo: ReferralInfo = {
          referralCode: '',
          referralLink: '',
          totalReferrals: 0,
          referralBonusBalance: 0,
        };
        return emptyInfo;
      } catch (error) {
        console.error('[useReferralInfo] Error fetching referral info:', error);
        // Return empty structure on error instead of throwing
        const emptyInfo: ReferralInfo = {
          referralCode: '',
          referralLink: '',
          totalReferrals: 0,
          referralBonusBalance: 0,
        };
        return emptyInfo;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour - referral code rarely changes
    retry: 1, // Only retry once
  });
}

/**
 * Get referral tree with configurable depth
 * GET /api/v1/referral/my-tree?maxLevels={n}
 * @param maxLevels - Number of levels to show (1-20, default: 5)
 */
export function useReferralTree(maxLevels: number = 5) {
  return useQuery({
    queryKey: queryKeys.referralTree(maxLevels),
    queryFn: async () => {
      try {
        const response = await referralApi.getReferralTree(maxLevels);

        // Log for debugging
        console.log('[useReferralTree] Response received:', {
          hasResponse: !!response,
          hasData: !!response?.data,
          hasTree: !!response?.data?.tree,
          treeLength: response?.data?.tree?.length || 0,
          responseStructure: response ? Object.keys(response) : [],
        });

        // Ensure we always return a valid object, never undefined
        const treeData = response?.data || {
          tree: [],
          stats: {
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarned: 0,
            currentBalance: 0,
            canWithdraw: false,
          },
          maxLevels,
        };

        console.log('[useReferralTree] Returning tree data:', {
          treeLength: treeData.tree?.length || 0,
          hasStats: !!treeData.stats,
          maxLevels: treeData.maxLevels,
        });

        return treeData;
      } catch (error) {
        console.error('[useReferralTree] Error fetching referral tree:', error);
        // Return default structure on error
        return {
          tree: [],
          stats: {
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarned: 0,
            currentBalance: 0,
            canWithdraw: false,
          },
          maxLevels,
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds - tree updates when referrals join
    refetchInterval: 60 * 1000, // Poll every 60 seconds on referral dashboard
  });
}

/**
 * Get referral stats (from tree endpoint)
 * This combines referral info and tree stats for backward compatibility
 */
export function useReferralStats() {
  return useQuery({
    queryKey: queryKeys.referralStats,
    queryFn: async () => {
      // Fetch both referral info and tree data
      const [referralInfoResponse, treeResponse] = await Promise.all([
        referralApi.getReferralInfo().catch(() => null),
        referralApi.getReferralTree(5).catch(() => null),
      ]);

      const referralInfo = referralInfoResponse?.data;
      const treeData = treeResponse?.data;

      // Combine data from referral info and tree
      const stats: ReferralStats = {
        totalReferrals:
          treeData?.stats?.totalReferrals || referralInfo?.totalReferrals || 0,
        activeReferrals: treeData?.stats?.activeReferrals || 0,
        totalEarned: treeData?.stats?.totalEarned || 0,
        currentBalance:
          treeData?.stats?.currentBalance ||
          referralInfo?.referralBonusBalance ||
          0,
        canWithdraw: treeData?.stats?.canWithdraw || false,
        // Legacy fields (optional)
        earningsByLevel: {
          level1: { count: 0, earned: 0, percentage: 5 },
          level2: { count: 0, earned: 0, percentage: 2 },
          level3: { count: 0, earned: 0, percentage: 1.5 },
          level4: { count: 0, earned: 0, percentage: 1 },
          level5: { count: 0, earned: 0, percentage: 0.5 },
        },
        recentEarnings: [],
      };

      // Calculate earnings by level from tree
      if (treeData?.tree && stats.earningsByLevel) {
        const earningsByLevel = stats.earningsByLevel;
        treeData.tree.forEach((entry) => {
          if (entry.level >= 1 && entry.level <= 5) {
            const levelKey = `level${entry.level}` as
              | 'level1'
              | 'level2'
              | 'level3'
              | 'level4'
              | 'level5';
            const levelData = earningsByLevel[levelKey];
            if (levelData) {
              levelData.count += 1;
            }
          }
        });
      }

      return stats;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every 60 seconds
  });
}

export function useReferralLeaderboard() {
  return useQuery({
    queryKey: queryKeys.referralLeaderboard,
    queryFn: () => api.get<ReferralLeaderboard[]>('/referrals/leaderboard'),
  });
}

// ============================================
// TEAM & RANK QUERIES
// ============================================

/**
 * Get team information
 * GET /api/v1/user-rank/my-team
 */
export function useTeamInfo() {
  return useQuery({
    queryKey: queryKeys.teamInfo,
    queryFn: async () => {
      try {
        const response = await teamRankApi.getTeamInfo();
        // Ensure we always return a valid object, never undefined
        return (
          response.data || {
            teamStats: {
              totalTeamMembers: 0,
              totalDirectDownlines: 0,
              rankDistribution: {},
            },
            directDownlines: [],
          }
        );
      } catch (error) {
        console.error('[useTeamInfo] Error fetching team info:', error);
        // Return default structure on error
        return {
          teamStats: {
            totalTeamMembers: 0,
            totalDirectDownlines: 0,
            rankDistribution: {},
          },
          directDownlines: [],
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - team grows slowly
  });
}

/**
 * Get rank information
 * GET /api/v1/user-rank/my-rank
 */
export function useRankInfo() {
  return useQuery({
    queryKey: queryKeys.rankInfo,
    queryFn: async () => {
      try {
        const response = await teamRankApi.getRankInfo();
        return response.data;
      } catch (error: any) {
        // If it's a 404, return default data instead of throwing
        if (error?.statusCode === 404 || error?.response?.status === 404) {
          return {
            currentRank: 'Stakeholder',
            qualifiedRank: 'Stakeholder',
            isUpgradeAvailable: false,
            requirements: null,
            shortfalls: {
              personalStake: 0,
              teamStake: 0,
              directDownlines: 0,
            },
            performancePoolQualified: false,
            premiumPoolQualified: false,
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - rank updates after actions
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      const status = error?.statusCode || error?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Calculate rank (triggers recalculation)
 * GET /api/v1/user-rank/calculate-rank
 */
export function useCalculateRank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamRankApi.calculateRank(),
    onSuccess: () => {
      // Invalidate rank-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rankInfo });
      queryClient.invalidateQueries({
        queryKey: queryKeys.nextRankRequirements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamInfo });
    },
  });
}

/**
 * Get next rank requirements
 * GET /api/v1/user-rank/next-rank-requirements
 */
export function useNextRankRequirements() {
  return useQuery({
    queryKey: queryKeys.nextRankRequirements,
    queryFn: async () => {
      try {
        const response = await teamRankApi.getNextRankRequirements();
        return response.data;
      } catch (error: any) {
        // If it's a 404, return undefined instead of throwing
        if (error?.statusCode === 404 || error?.response?.status === 404) {
          return undefined;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      const status = error?.statusCode || error?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Get pool distribution history
 * GET /api/v1/user-rank/my-pool-distributions
 */
export function usePoolDistributions(
  page: number = 1,
  limit: number = 20,
  distributionType?: 'rank_pool' | 'redistribution_pool'
) {
  return useQuery({
    queryKey: queryKeys.poolDistributions(page, limit, distributionType),
    queryFn: async () => {
      try {
        const response = await teamRankApi.getPoolDistributions(
          page,
          limit,
          distributionType
        );
        return response.data;
      } catch (error: any) {
        // If it's a 404, return empty structure instead of throwing
        if (error?.statusCode === 404 || error?.response?.status === 404) {
          return {
            distributions: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
            totalEarnings: {
              rankPool: 0,
              redistributionPool: 0,
              total: 0,
            },
          };
        }
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute - new distributions weekly
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes on distributions screen
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      const status = error?.statusCode || error?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Get incentive wallet summary
 * GET /api/v1/user-rank/my-incentive-wallet
 */
export function useIncentiveWallet() {
  return useQuery({
    queryKey: queryKeys.incentiveWallet,
    queryFn: async () => {
      try {
        const response = await teamRankApi.getIncentiveWallet();
        return response.data;
      } catch (error: any) {
        // If it's a 404, return empty wallet structure instead of throwing
        if (error?.statusCode === 404 || error?.response?.status === 404) {
          return {
            totalEarnings: 0,
            rankPoolEarnings: 0,
            redistributionPoolEarnings: 0,
            currentBalance: 0,
            qualificationStatus: {
              performancePoolQualified: false,
              premiumPoolQualified: false,
              rankPoolQualified: false,
              redistributionPoolQualified: false,
            },
            recentDistributions: [],
          };
        }
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      const status = error?.statusCode || error?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// REGISTRATION BONUS QUERIES
// ============================================

/**
 * Get registration bonus status
 * GET /api/v1/bonuses/registration/status
 * Auto-refreshes every 30 seconds when status is pending/requirements_met
 */
export function useRegistrationBonusStatus() {
  return useQuery({
    queryKey: queryKeys.registrationBonusStatus,
    queryFn: async () => {
      try {
        return await registrationBonusApi.getStatus();
      } catch (error: any) {
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
          code?: string;
          message?: string;
        };

        // Handle network errors gracefully - return default status instead of throwing
        const isNetworkError =
          err?.code === 'ERR_NETWORK' ||
          err?.message?.includes('Network Error') ||
          err?.message?.includes('Failed to fetch') ||
          (!err?.response && !err?.statusCode);

        if (isNetworkError) {
          console.warn(
            '[useRegistrationBonusStatus] ⚠️ Network error - returning default status'
          );
          // Return a default response structure to prevent app crash
          const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString();
          return {
            success: false,
            data: {
              status: 'pending' as const,
              bonusPercentage: 10,
              bonusAmount: null,
              daysRemaining: 7,
              expiresAt,
              progressPercentage: 0,
              requirements: {
                profileCompletion: {
                  completed: false,
                  percentage: 0,
                },
                socialMediaVerification: {
                  completed: false,
                  verifiedCount: 0,
                  totalRequired: 5,
                  platforms: [],
                },
                firstStake: {
                  completed: false,
                  stakeId: null,
                },
              },
              allRequirementsMet: false,
            },
          } as RegistrationBonusStatusResponse;
        }

        throw error;
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data as
        | RegistrationBonusStatusResponse
        | undefined;
      const status = data?.data?.status;

      // Smart polling based on status
      switch (status) {
        case 'pending':
        case 'requirements_met':
          return 30000; // 30 seconds - active user
        case 'bonus_active':
          return 300000; // 5 minutes - less frequent
        case 'expired':
        case 'completed':
        case 'cancelled':
          return false; // No polling needed
        default:
          return 60000; // 1 minute default
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: (failureCount, error: any) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
        code?: string;
        message?: string;
      };

      // Don't retry network errors aggressively
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch') ||
        (!err?.response && !err?.statusCode);
      if (isNetworkError) {
        return failureCount < 1; // Only retry once for network errors
      }

      return failureCount < 2;
    },
    retryDelay: 1000,
  });
}

/**
 * Get bonus payout history with pagination
 * GET /api/v1/registration-bonus/payout-history
 */
export function useBonusPayoutHistory(page: number = 1, limit: number = 10) {
  return useQuery<BonusPayoutHistoryResponse>({
    queryKey: queryKeys.bonusPayoutHistory(page, limit),
    queryFn: async () => {
      return await registrationBonusApi.getPayoutHistory(page, limit);
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error: any) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
        code?: string;
        message?: string;
      };

      // Don't retry network errors aggressively
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch') ||
        (!err?.response && !err?.statusCode);
      if (isNetworkError) {
        return failureCount < 1; // Only retry once for network errors
      }

      return failureCount < 2;
    },
    retryDelay: 1000,
  });
}

// ============================================
// KYC QUERIES
// ============================================

/**
 * Get KYC verification status
 * Phase 1: GET /users/kyc/status
 */
export function useKYCStatus() {
  return useQuery({
    queryKey: queryKeys.kycStatus,
    queryFn: async () => {
      const response = await userService.getKYCStatus();

      // Unwrap response if nested
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = (response as any).data;
      }

      return data;
    },
  });
}

// ============================================
// ADMIN QUERIES
// ============================================

export function useAdminDashboard(timeframe: AdminDashboardTimeframe = '30d') {
  return useQuery({
    queryKey: queryKeys.adminDashboard(timeframe),
    queryFn: () =>
      api.get<AdminDashboardData>('/admin/metrics', {
        params: { timeframe },
      }),
    staleTime: 60 * 1000,
  });
}

// ============================================
// BONUS QUERIES
// ============================================

// Add to queryKeys
export const bonusKeys = {
  bonuses: ['bonuses'] as const,
  bonusHistory: ['bonuses', 'history'] as const,
};

// Bonus type
export interface Bonus {
  id: string;
  type: 'deposit' | 'referral' | 'ranking' | 'redistribution' | 'special';
  amount: number;
  status: 'claimable' | 'claimed' | 'pending';
  title: string;
  description: string;
  metadata?: {
    depositAmount?: number;
    referralLevel?: number;
    oldRank?: string;
    newRank?: string;
    poolAmount?: number;
    reason?: string;
  };
  createdAt: string;
  claimedAt?: string;
  expiresAt?: string;
}

export function useBonusHistory() {
  return useQuery({
    queryKey: bonusKeys.bonusHistory,
    queryFn: () => api.get<Bonus[]>('/bonuses/history'),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useClaimBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bonusId: string) => api.post(`/bonuses/${bonusId}/claim`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bonusKeys.bonusHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
    },
  });
}

// ============================================
// PROFILE MUTATIONS
// ============================================

// Note: useUpdateProfile is implemented in mutations.ts
// This file only contains queries, not mutations

export function useUploadKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => api.post('/kyc/upload', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kycStatus });
    },
  });
}

// ============================================
// SETTINGS MUTATIONS
// ============================================

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      api.post('/better-auth/change-password', payload),
  });
}

export function useEnable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    // Note: BetterAuth uses /better-auth/mfa/verify to enable 2FA
    // This is a simplified wrapper - use authService.enable2FA() for full functionality
    mutationFn: () => api.post('/better-auth/mfa/verify'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    // Note: BetterAuth doesn't have a disable endpoint in the current implementation
    // This may need to be handled differently or removed
    mutationFn: () => api.post('/better-auth/mfa/disable'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  stakingUpdates: boolean;
  referralNotifications: boolean;
  marketingEmails: boolean;
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: NotificationSettings) =>
      api.put('/better-auth/notification-settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
