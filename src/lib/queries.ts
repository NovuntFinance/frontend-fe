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
import { ChangePasswordPayload, Session } from '@/types/user';
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
  ReferralLeaderboard,
  ReferralInfo,
} from '@/types/referral';
import { referralApi } from '@/services/referralApi';
// TeamRank types are inferred from API responses, no explicit imports needed
import { teamRankApi } from '@/services/teamRankApi';
import { registrationBonusApi } from '@/services/registrationBonusApi';
import {
  RegistrationBonusStatusResponse,
  BonusPayoutHistoryResponse,
  RegistrationBonusStatus,
} from '@/types/registrationBonus';
import { AdminDashboardData, AdminDashboardTimeframe } from '@/types/admin';
import type {
  AdminAnalyticsDashboardData,
  AdminAnalyticsTimeframe,
} from '@/types/adminAnalytics';
import type { RankAnalyticsResponse } from '@/types/rankAnalytics';
import { useAuthStore } from '@/store/authStore';
import { getStakingStreak } from '@/services/stakingStreakApi';
import { rosApi, type WeeklySummaryData } from '@/services/rosApi';
import { announcementsApi } from '@/services/announcementsApi';
import type { Announcement } from '@/types/announcement';

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
  stakingStreak: ['staking', 'streak'] as const,
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
  referralMetrics: ['referrals', 'metrics'] as const,

  // Team & Rank
  teamInfo: ['team', 'info'] as const,
  rankInfo: ['rank', 'info'] as const,
  nextRankRequirements: ['rank', 'next-requirements'] as const,
  allTeamMembers: (page?: number, limit?: number, search?: string) =>
    ['team', 'all-members', page, limit, search] as const,
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
  // Admin Users
  adminUsers: ['admin', 'users'] as const,

  // Admin
  adminDashboard: (timeframe: AdminDashboardTimeframe) =>
    ['admin', 'dashboard', timeframe] as const,
  adminAnalyticsDashboard: (params: {
    timeframe: AdminAnalyticsTimeframe;
    from?: string;
    to?: string;
  }) => ['admin', 'analytics-dashboard', params] as const,
  rankAnalytics: ['admin', 'rank-analytics'] as const,

  // RBAC
  rbacPermissions: ['rbac', 'permissions'] as const,

  // Analytics
  weeklyROSSummary: ['analytics', 'weekly-ros-summary'] as const,

  // Daily Profit (Admin)
  declaredDailyProfits: (filters?: any) =>
    ['admin', 'daily-profit', 'declared', filters] as const,

  // Daily Profit (User)
  todayProfit: ['daily-profit', 'today'] as const,
  profitHistory: (limit?: number, offset?: number) =>
    ['daily-profit', 'history', limit, offset] as const,

  // Daily Declaration Returns (Unified - Admin)
  declaredReturns: (filters?: any) =>
    ['admin', 'daily-declaration-returns', 'declared', filters] as const,
  declarationByDate: (date: string) =>
    ['admin', 'daily-declaration-returns', date] as const,

  // Announcements
  announcements: ['announcements'] as const,
  activeAnnouncements: ['announcements', 'active'] as const,
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
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.dashboardOverview,
    enabled: !!isAuthenticated && _hasHydrated, // Wait for auth - prevents 401 loop
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
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.activeStakes,
    enabled: !!isAuthenticated && _hasHydrated, // Wait for auth - prevents 401 loop
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

/**
 * Get user's staking streak information
 */
export function useStakingStreak() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.stakingStreak,
    enabled: !!isAuthenticated && _hasHydrated,
    queryFn: async () => {
      try {
        const response = await getStakingStreak();
        return response.data;
      } catch (error: any) {
        // Handle 404 or 501 (not implemented yet)
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
        };
        if (
          err?.statusCode === 404 ||
          err?.response?.status === 404 ||
          err?.statusCode === 501
        ) {
          // Return default values if endpoint not available
          return {
            currentStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
            lastActiveDate: null,
            streakStartDate: null,
            isActiveToday: false,
            daysUntilNextMilestone: 10,
            nextMilestone: 10,
            weeklyProgress: Array.from({ length: 7 }, () => ({
              date: new Date().toISOString(),
              hasActiveStake: false,
            })),
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
      };
      if (
        err?.statusCode === 404 ||
        err?.response?.status === 404 ||
        err?.statusCode === 501
      ) {
        return false; // Don't retry 404s or 501s
      }
      return failureCount < 2;
    },
  });
}

/**
 * useWeeklyROSSummary - Get weekly ROS summary
 * GET /api/analytics/weekly-summary
 *
 * Returns weekly Return on Stake summary including:
 * - Weekly ROS percentage (admin-declared, shown at end of week)
 * - Total earnings for the week (stake returns only)
 * - Daily breakdown (Monday-Sunday)
 * - Week information (week number, year, dates)
 */
export function useWeeklyROSSummary() {
  return useQuery({
    queryKey: queryKeys.weeklyROSSummary,
    queryFn: async () => {
      try {
        const data = await rosApi.getWeeklySummary();
        return data;
      } catch (error: any) {
        const err = error as {
          statusCode?: number;
          response?: { status?: number };
          code?: string;
          message?: string;
        };

        // Handle 404 gracefully - endpoint may not be implemented yet
        if (err?.statusCode === 404 || err?.response?.status === 404) {
          // Return empty data structure matching WeeklySummaryData interface
          const now = new Date();
          const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const weekStart = new Date(now);
          weekStart.setUTCDate(now.getUTCDate() - daysSinceMonday);
          weekStart.setUTCHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
          weekEnd.setUTCHours(23, 59, 59, 999);

          const yearStart = new Date(now.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );

          return {
            weekNumber,
            year: now.getFullYear(),
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            totalEarnings: 0,
            weeklyRos: 0,
            status: 'pending' as const,
            dailyBreakdown: [],
          } satisfies WeeklySummaryData;
        }

        // Handle network errors gracefully
        const isNetworkError =
          err?.code === 'ERR_NETWORK' ||
          err?.message?.includes('Network Error') ||
          err?.message?.includes('Failed to fetch') ||
          (!err?.response && !err?.statusCode);

        if (isNetworkError) {
          console.warn(
            '[useWeeklyROSSummary] ⚠️ Network error - returning empty data'
          );
          // Return same empty structure as 404
          const now = new Date();
          const dayOfWeek = now.getUTCDay();
          const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const weekStart = new Date(now);
          weekStart.setUTCDate(now.getUTCDate() - daysSinceMonday);
          weekStart.setUTCHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
          weekEnd.setUTCHours(23, 59, 59, 999);

          const yearStart = new Date(now.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );

          return {
            weekNumber,
            year: now.getFullYear(),
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            totalEarnings: 0,
            weeklyRos: 0,
            status: 'pending' as const,
            dailyBreakdown: [],
          } satisfies WeeklySummaryData;
        }

        // Throw other errors
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      const err = error as {
        statusCode?: number;
        response?: { status?: number };
        code?: string;
      };
      // Don't retry 404s or network errors
      if (
        err?.statusCode === 404 ||
        err?.response?.status === 404 ||
        err?.code === 'ERR_NETWORK'
      ) {
        return false;
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
      } catch (error: any) {
        // Extract meaningful error information
        const isNetworkError =
          error?.code === 'ERR_NETWORK' ||
          error?.message?.includes('Network Error') ||
          !error?.response;

        if (isNetworkError) {
          // Suppress verbose network error logs (expected when backend is unavailable)
          if (process.env.NODE_ENV === 'development') {
            const logKey = 'referral_info_network_error_logged';
            if (
              typeof window !== 'undefined' &&
              !sessionStorage.getItem(logKey)
            ) {
              console.debug(
                '[useReferralInfo] Network error (backend may be unavailable)'
              );
              sessionStorage.setItem(logKey, 'true');
            }
          }
        } else {
          // Log actual API errors (4xx, 5xx)
          console.error('[useReferralInfo] Error fetching referral info:', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
          });
        }
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
export function useReferralTree(
  maxLevels: number = 5,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
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
    ...options, // Spread user options (e.g., enabled: false)
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
      console.log('[useReferralStats] 🔄 Fetching referral stats...');

      // Fetch both referral info and tree data with error handling
      const [referralInfoResponse, treeResponse] = await Promise.all([
        referralApi.getReferralInfo().catch((err) => {
          console.warn(
            '[useReferralStats] ⚠️ Failed to fetch referral info:',
            err?.message
          );
          return null;
        }),
        referralApi.getReferralTree(5).catch((err) => {
          console.warn(
            '[useReferralStats] ⚠️ Failed to fetch referral tree:',
            err?.message
          );
          return null;
        }),
      ]);

      const referralInfo = referralInfoResponse?.data;
      const treeData = treeResponse?.data;

      // Log what we got
      console.log('[useReferralStats] ✅ Data fetched:', {
        hasReferralInfo: !!referralInfo,
        hasTreeData: !!treeData,
        referralInfoCount: referralInfo?.totalReferrals,
        treeCount: treeData?.stats?.totalReferrals,
      });

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

/**
 * Get referral and team metrics
 * GET /api/v1/referral/metrics
 * Shows total and active counts for direct referrals and team members
 */
export function useReferralMetrics() {
  return useQuery({
    queryKey: queryKeys.referralMetrics,
    queryFn: async () => {
      console.log('[useReferralMetrics] 🔄 Fetching referral metrics...');
      const response = await referralApi.getReferralMetrics();
      console.log('[useReferralMetrics] ✅ Response:', response);

      // api.get() unwraps the response, so response is the data directly
      // Response structure: { referrals: {...}, team: {...} }
      if (response && typeof response === 'object' && 'referrals' in response) {
        console.log('[useReferralMetrics] ✅ Data (direct):', response);
        return response as any;
      }

      // Fallback: check if it has a data property
      if (response && typeof response === 'object' && 'data' in response) {
        console.log(
          '[useReferralMetrics] ✅ Data (nested):',
          (response as any).data
        );
        return (response as any).data;
      }

      console.warn(
        '[useReferralMetrics] ⚠️ Unexpected response format:',
        response
      );
      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
 * Get all team members with referrer information
 * GET /api/v1/user-rank/all-team-members
 */
export function useAllTeamMembers(
  page: number = 1,
  limit: number = 30,
  search?: string
) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.allTeamMembers(page, limit, search),
    queryFn: async () => {
      const response: any = await teamRankApi.getAllTeamMembers(
        page,
        limit,
        search
      );

      // NOTE: Our `api.get()` helper auto-unwraps `{ data: ... }` responses.
      // Depending on the backend + endpoint, `teamRankApi.getAllTeamMembers()`
      // may return either:
      // - `{ success: true, data: { teamMembers, pagination } }` (wrapped)
      // - `{ teamMembers, pagination }` (already unwrapped)
      const maybeData =
        response &&
        typeof response === 'object' &&
        'data' in response &&
        (response as any).data
          ? (response as any).data
          : response;

      if (
        maybeData &&
        typeof maybeData === 'object' &&
        'teamMembers' in maybeData
      ) {
        const teamMembers = maybeData.teamMembers || [];

        // Process team members to handle "Unknown" levels and validate ranks
        const processedMembers = teamMembers.map((member: any) => {
          // If level is "Unknown" or missing, try to calculate from referrer
          let level = member.level;
          if (!level || level === 'Unknown' || level === 'unknown') {
            // If member has a referrer, they're at least Level 2
            // If no referrer or referrer is the current user, they're Direct
            // Note: This is a fallback - backend should calculate this correctly
            if (member.referrer) {
              // We can't determine exact level without traversing the tree
              // So we'll mark it as needing calculation
              level = 'Unknown'; // Keep as Unknown but we'll style it differently
            } else {
              level = 'Direct';
            }
          }

          // Ensure rank is present and valid
          const rank = member.rank || 'Stakeholder';

          // Log if we're fixing data
          if (member.level !== level || member.rank !== rank) {
            console.warn('[useAllTeamMembers] Fixed team member data:', {
              account: member.account,
              username: member.username,
              originalLevel: member.level,
              newLevel: level,
              originalRank: member.rank,
              newRank: rank,
            });
          }

          return {
            ...member,
            level,
            rank,
          };
        });

        // Log summary
        const levelDistribution = processedMembers.reduce(
          (acc: Record<string, number>, m: any) => {
            acc[m.level] = (acc[m.level] || 0) + 1;
            return acc;
          },
          {}
        );
        const rankDistribution = processedMembers.reduce(
          (acc: Record<string, number>, m: any) => {
            acc[m.rank] = (acc[m.rank] || 0) + 1;
            return acc;
          },
          {}
        );

        console.log('[useAllTeamMembers] Processed team members:', {
          total: processedMembers.length,
          levelDistribution,
          rankDistribution,
        });

        return {
          teamMembers: processedMembers,
          pagination: maybeData.pagination || {
            page: 1,
            limit: 30,
            total: 0,
            totalPages: 0,
          },
        };
      }

      return {
        teamMembers: [],
        pagination: {
          page: 1,
          limit: 30,
          total: 0,
          totalPages: 0,
        },
      };
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
      queryClient.invalidateQueries({ queryKey: ['team', 'all-members'] });
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
        // Ensure we always return a value, even if data is undefined
        if (response?.data) {
          return response.data;
        }
        // Return empty structure if data is undefined
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
        // Ensure we always return a value, even if data is undefined
        if (response?.data) {
          return response.data;
        }
        // Return empty wallet structure if data is undefined
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
              status: RegistrationBonusStatus.PENDING,
              bonusPercentage: 10,
              bonusAmount: null,
              daysRemaining: 7,
              expiresAt,
              progressPercentage: 0,
              requirements: {
                twoFASetup: {
                  isCompleted: false,
                  completedAt: null,
                },
                withdrawalAddressWhitelist: {
                  isCompleted: false,
                  address: null,
                  network: null,
                },
                socialMediaVerifications: [],
                firstStakeCompleted: false,
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
        case RegistrationBonusStatus.PENDING:
        case RegistrationBonusStatus.REQUIREMENTS_MET:
          return 30000; // 30 seconds - active user
        case RegistrationBonusStatus.BONUS_ACTIVE:
          return 300000; // 5 minutes - less frequent
        case RegistrationBonusStatus.EXPIRED:
        case RegistrationBonusStatus.COMPLETED:
        case RegistrationBonusStatus.CANCELLED:
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
  // Check if user is authenticated as admin (client-side check)
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // Dynamic import to avoid SSR issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: queryKeys.adminDashboard(timeframe),
    queryFn: async () => {
      const { adminService } = await import('@/services/adminService');
      try {
        const response = await adminService.getDashboardMetrics(timeframe);
        // Normalize dashboard response:
        // Backend may return a wrapper `{ status/success, data: {...}, dailyProfit, pools, ... }`.
        // If we naïvely return `response.data`, we can accidentally DROP sibling fields like
        // `dailyProfit` and `pools` that are not nested under `data`.
        const raw = response as any;
        const maybeNested = raw?.data;

        // If nested `data` exists and looks like the dashboard payload, merge it with any
        // extra top-level fields (dailyProfit/pools/recentActivity/lastUpdated).
        if (maybeNested && typeof maybeNested === 'object') {
          const merged: AdminDashboardData = {
            ...(maybeNested as object),
            // Preserve top-level extras if present
            dailyProfit: raw?.dailyProfit ?? (maybeNested as any)?.dailyProfit,
            pools: raw?.pools ?? (maybeNested as any)?.pools,
            recentActivity:
              raw?.recentActivity ?? (maybeNested as any)?.recentActivity,
            lastUpdated: raw?.lastUpdated ?? (maybeNested as any)?.lastUpdated,
            timeframe: raw?.timeframe ?? (maybeNested as any)?.timeframe,
          } as AdminDashboardData;

          if (process.env.NODE_ENV === 'development') {
            if (!merged.dailyProfit || !merged.pools) {
              console.log('[useAdminDashboard] Dashboard merge debug:', {
                hasNestedData: true,
                topLevelKeys: Object.keys(raw || {}),
                nestedKeys: Object.keys(maybeNested || {}),
                hasDailyProfit: !!merged.dailyProfit,
                hasPools: !!merged.pools,
              });
            }
          }

          return merged;
        }

        // Otherwise it is already the dashboard payload.
        return raw as AdminDashboardData;
      } catch (error: any) {
        // Clear 2FA cache on invalid code error
        const errorCode = error?.response?.data?.error?.code;
        if (errorCode === '2FA_CODE_INVALID') {
          adminService.clearCached2FA();
          console.log(
            '[useAdminDashboard] Cleared 2FA cache due to invalid code'
          );
        }
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: checkAdminAuth(), // Only fetch if admin is authenticated
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (auth issues)
      const status = error?.response?.status || error?.statusCode;
      const errorCode = error?.response?.data?.error?.code;

      if (status === 401 || status === 403) {
        // Clear cache on auth errors (async, but don't wait)
        if (errorCode === '2FA_CODE_INVALID') {
          import('@/services/adminService').then(({ adminService }) => {
            adminService.clearCached2FA();
          });
        }
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get paginated list of users (Admin only)
 * GET /api/v1/admin/users
 */
export function useAdminUsers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'suspended' | 'inactive';
  role?: string;
  rank?: string;
  hasActiveStakes?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?:
    | 'createdAt'
    | 'lastLoginAt'
    | 'totalStaked'
    | 'walletFundedBalance'
    | 'walletEarningsBalance'
    | 'totalDeposited'
    | 'totalWithdrawn';
  sortOrder?: 'asc' | 'desc';
}) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: [...queryKeys.adminUsers, filters],
    queryFn: async () => {
      const { adminService } = await import('@/services/adminService');
      try {
        const response = await adminService.getUsers(filters);
        return response;
      } catch (error: any) {
        const errorCode = error?.response?.data?.error?.code;
        if (errorCode === '2FA_CODE_INVALID') {
          adminService.clearCached2FA();
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: checkAdminAuth(),
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      // Do not retry on 429 (rate limit) — retrying immediately makes it worse
      if (status === 429) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Admin Transactions list (Admin only)
 * GET /api/v1/admin/transactions
 */
export function useAdminTransactions(params?: Record<string, unknown> | null) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: ['admin-transactions', params] as const,
    queryFn: async () => {
      const { adminService } = await import('@/services/adminService');
      return adminService.getTransactions(params || undefined);
    },
    staleTime: 30 * 1000,
    enabled: checkAdminAuth() && !!params,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Admin Transaction detail (Admin only)
 * GET /api/v1/admin/transactions/:transactionId
 */
export function useAdminTransactionDetail(transactionId?: string | null) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: ['admin-transaction', transactionId] as const,
    queryFn: async () => {
      const { adminService } = await import('@/services/adminService');
      return adminService.getTransactionById(transactionId as string);
    },
    enabled: checkAdminAuth() && !!transactionId,
    staleTime: 30 * 1000,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Admin Analytics dashboard (all tabs in one call)
 * GET /api/v1/admin/analytics/dashboard
 * Note: Read-only, NO 2FA
 */
export function useAdminAnalyticsDashboard(params: {
  timeframe: AdminAnalyticsTimeframe;
  from?: string;
  to?: string;
}) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  const isParamsReady =
    params.timeframe !== 'custom' || (!!params.from && !!params.to);

  return useQuery<AdminAnalyticsDashboardData>({
    queryKey: queryKeys.adminAnalyticsDashboard(params),
    queryFn: async (): Promise<AdminAnalyticsDashboardData> => {
      const { adminService } = await import('@/services/adminService');
      const raw = await adminService.getAnalyticsDashboard({
        timeframe: params.timeframe,
        from: params.from,
        to: params.to,
      });
      // expected: { success: true, data: { ... } }
      return ((raw as any)?.data ?? raw) as AdminAnalyticsDashboardData;
    },
    staleTime: 5 * 60 * 1000, // endpoint cached ~5 mins server-side
    enabled: checkAdminAuth() && isParamsReady,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Get Rank Analytics (includes Finance Titan pool allocations)
 * GET /api/v1/rank-management/analytics
 * Note: Admin only, read-only, NO 2FA
 */
export function useRankAnalytics() {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: queryKeys.rankAnalytics,
    queryFn: async () => {
      const { adminService } = await import('@/services/adminService');
      const response = await adminService.getRankAnalytics();
      // API client may unwrap response.data, normalize it
      return (response?.data ?? response) as RankAnalyticsResponse['data'];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: checkAdminAuth(),
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Get all permissions (Admin only)
 * GET /api/v1/rbac/permissions
 */
export function useAllPermissions() {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: queryKeys.rbacPermissions,
    queryFn: async () => {
      const { rbacService } = await import('@/services/rbacService');
      try {
        const response = await rbacService.getAllPermissions();
        return response.data || [];
      } catch (error: any) {
        const errorCode = error?.response?.data?.error?.code;
        if (errorCode === '2FA_CODE_INVALID') {
          const { adminService } = await import('@/services/adminService');
          adminService.clearCached2FA();
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - permissions don't change often
    enabled: checkAdminAuth(),
    retry: (failureCount, error: any) => {
      const status = error?.response?.status || error?.statusCode;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 2;
    },
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

// ============================================
// DAILY PROFIT QUERIES
// ============================================

import type { DeclaredProfitsFilters } from '@/types/dailyProfit';

/**
 * Get all declared daily profits (Admin only)
 * GET /api/v1/admin/daily-profit/declared
 */
export function useDeclaredDailyProfits(filters?: DeclaredProfitsFilters) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: queryKeys.declaredDailyProfits(filters),
    queryFn: async () => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      try {
        const response = await dailyProfitService.getDeclaredProfits(filters);
        return response.data || response;
      } catch (error: any) {
        const errorCode = error?.response?.data?.error?.code;
        if (errorCode === '2FA_CODE_INVALID') {
          const { adminService } = await import('@/services/adminService');
          adminService.clearCached2FA();
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: checkAdminAuth(),
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get today's profit (User)
 * GET /api/v1/daily-profit/today
 */
export function useTodayProfit() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.todayProfit,
    queryFn: async () => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      const response = await dailyProfitService.getTodayProfit();
      return response.data;
    },
    enabled: isAuthenticated,
    retry: false, // Don't retry on 404 (no profit declared)
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get profit history (User)
 * GET /api/v1/daily-profit/history
 */
export function useProfitHistory(limit: number = 30, offset: number = 0) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.profitHistory(limit, offset),
    queryFn: async () => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      try {
        const response = await dailyProfitService.getProfitHistory(
          limit,
          offset
        );

        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[useProfitHistory] API Response:', {
            success: response?.success,
            hasData: !!response?.data,
            profitsCount: response?.data?.profits?.length || 0,
            profits: response?.data?.profits,
            pagination: response?.data?.pagination,
          });
        }

        return response.data;
      } catch (error: any) {
        // Enhanced error logging
        const status = error?.statusCode || error?.response?.status;
        const message = error?.message || error?.response?.data?.message;

        // 404 is expected if no history exists yet - use warn instead of error
        if (status === 404) {
          console.warn(
            '[useProfitHistory] ⚠️ 404 - No profit history found (this is normal for new users)'
          );
        } else {
          console.error(
            '[useProfitHistory] ❌ Failed to fetch profit history:',
            {
              status,
              message,
              error,
            }
          );
        }

        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry 404 errors (no data exists)
      const status = error?.statusCode || error?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook to fetch active announcements for the information marquee
 * Auto-refetches every 2 minutes to show latest announcements
 * Public endpoint - no authentication required
 * Gracefully handles 404 (returns empty array if endpoint doesn't exist yet)
 */
export function useActiveAnnouncements() {
  return useQuery({
    queryKey: queryKeys.activeAnnouncements,
    queryFn: async (): Promise<Announcement[]> => {
      // The API service handles all errors and returns empty array
      // No need for additional error handling here
      return await announcementsApi.getActiveAnnouncements();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - announcements can change frequently
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes to catch new announcements
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: false, // Don't retry - API service handles 404 gracefully
    retryOnMount: false, // Don't retry on mount if it failed
  });
}

// ============================================
// DAILY DECLARATION RETURNS QUERIES (Unified)
// ============================================

import type {
  GetDeclaredReturnsFilters,
  GetDeclaredReturnsResponse,
  GetDeclarationByDateResponse,
} from '@/types/dailyDeclarationReturns';

/**
 * Get all declared returns (pools + ROS) for a date range
 * GET /api/v1/admin/daily-declaration-returns/declared
 */
export function useDeclaredReturns(filters?: GetDeclaredReturnsFilters) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: queryKeys.declaredReturns(filters),
    queryFn: async () => {
      const { dailyDeclarationReturnsService } = await import(
        '@/services/dailyDeclarationReturnsService'
      );
      try {
        const response =
          await dailyDeclarationReturnsService.getDeclaredReturns(filters);

        // Debug logging to verify response structure
        if (process.env.NODE_ENV === 'development') {
          console.log('[useDeclaredReturns] Full response:', response);
          console.log('[useDeclaredReturns] Response structure:', {
            success: (response as any).success,
            hasData: !!(response as any).data,
            declarations: (response as any).data?.declarations,
            declarationsCount: (response as any).data?.declarations?.length,
            summary: (response as any).data?.summary,
          });
        }

        // Return the inner data object (contains declarations and summary)
        // Response structure from backend: { success, data: { declarations, summary }, meta }
        // Service returns: GetDeclaredReturnsResponse = { success, data: { declarations, summary }, meta }
        // We want to return: { declarations, summary } for component access
        // Access response.data to get the inner data object
        const responseTyped = response as GetDeclaredReturnsResponse;
        return responseTyped.data || (response as any);
      } catch (error: any) {
        const errorCode = error?.response?.data?.error?.code;
        if (errorCode === '2FA_CODE_INVALID') {
          const { adminService } = await import('@/services/adminService');
          adminService.clearCached2FA();
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: checkAdminAuth(),
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get declaration for a specific date
 * GET /api/v1/admin/daily-declaration-returns/:date
 */
export function useDeclarationByDate(date: string) {
  const checkAdminAuth = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminAuthService } = require('@/services/adminAuthService');
      return adminAuthService.isAuthenticated();
    } catch {
      return false;
    }
  };

  return useQuery({
    queryKey: queryKeys.declarationByDate(date),
    queryFn: async () => {
      const { dailyDeclarationReturnsService } = await import(
        '@/services/dailyDeclarationReturnsService'
      );
      try {
        const response =
          await dailyDeclarationReturnsService.getDeclarationByDate(date);
        return response.data;
      } catch (error: any) {
        const errorCode = error?.response?.data?.error?.code;
        if (errorCode === '2FA_CODE_INVALID') {
          const { adminService } = await import('@/services/adminService');
          adminService.clearCached2FA();
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: checkAdminAuth() && !!date,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
