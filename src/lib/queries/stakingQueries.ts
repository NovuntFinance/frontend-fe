import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Staking Data Types (Based on Backend Documentation)
 */

export interface Stake {
  _id: string;
  userId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'cancelled';
  source: 'funded' | 'earning' | 'both';
  targetReturn: number; // 200% of amount (or 100% for bonus stakes)
  totalEarned: number;
  progressToTarget: string; // "45.50%"
  remainingToTarget: number;
  goal?: string; // Goal for this stake (e.g., "Wedding", "Housing")
  weeklyPayouts: Array<{
    week: number;
    amount: number;
    date: string;
    status: 'pending' | 'paid';
  }>;
  // Registration Bonus Fields (confirmed by backend team - Jan 15, 2026)
  type?: 'regular' | 'registration_bonus' | 'referral_bonus'; // Stake type
  isRegistrationBonus?: boolean; // Flag for bonus stakes
  maxReturnMultiplier?: number; // 2.0 for regular, 1.0 for bonus (100% cap)
}

export interface StakingDashboard {
  success: boolean;
  data: {
    wallets: {
      fundedWallet: number;
      earningWallet: number;
      totalAvailableBalance: number;
      description: {
        fundedWallet: string;
        earningWallet: string;
      };
    };
    activeStakes: Stake[];
    stakeHistory: Stake[];
    summary: {
      totalActiveStakes: number;
      totalStakesSinceInception: number;
      totalEarnedFromROS: number;
      totalEarnedAllTime?: number; // Alias for totalEarnedFromROS
      targetTotalReturns: number;
      progressToTarget: string;
      totalActiveAmount?: number;
      totalAllTimeStaked?: number;
      todaysProfit: number; // ✅ NEW: Today's total profit from all active stakes
      todaysROSPercentage: number; // ✅ NEW: Today's declared ROS percentage
      stakingModel: string;
      note: string;
    };
  };
}

export interface StakeDetails {
  success: boolean;
  stake: Stake;
}

/**
 * Query Keys
 */
export const stakingQueryKeys = {
  dashboard: ['staking', 'dashboard'] as const,
  stake: (id: string) => ['staking', 'stake', id] as const,
  history: ['staking', 'history'] as const,
};

/**
 * Get Staking Dashboard
 * GET /api/v1/staking/dashboard
 *
 * Returns full staking dashboard with wallets, active stakes, history, and summary
 */
export function useStakeDashboard() {
  return useQuery({
    queryKey: stakingQueryKeys.dashboard,
    queryFn: async () => {
      try {
        console.log(
          '🔍 [useStakeDashboard] Starting API call to /staking/dashboard'
        );

        const response = await api.get<StakingDashboard>('/staking/dashboard');

        // 🔍 DEBUG: Log raw API response
        const responseData = response.data as StakingDashboard | any;
        console.log('🔍 [useStakeDashboard] ✅ API Response Received:', {
          status: (response as any).status,
          hasData: !!responseData,
          responseStructure: {
            hasSuccess: 'success' in (responseData || {}),
            hasNestedData: 'data' in (responseData || {}),
            directKeys: responseData ? Object.keys(responseData) : [],
          },
        });

        // Handle both response formats:
        // 1. { success: true, data: {...} } - Standard API response
        // 2. { wallets: {...}, activeStakes: [...] } - Direct data
        const dashboardData =
          (responseData as StakingDashboard)?.data || responseData || response;

        // 🔍 Map field names if backend uses different field names
        // Backend might use totalReturnsEarned internally, but should return totalEarned
        if (dashboardData.activeStakes) {
          dashboardData.activeStakes = dashboardData.activeStakes.map(
            (stake: any) => {
              // Map totalReturnsEarned to totalEarned if needed
              if (
                stake.totalReturnsEarned !== undefined &&
                stake.totalEarned === undefined
              ) {
                stake.totalEarned = stake.totalReturnsEarned;
              }
              return stake;
            }
          );
        }

        // 🔍 DEBUG: Log extracted data and first stake details
        const firstStake = dashboardData.activeStakes?.[0];

        // 🔍 DEBUG: Log ALL fields in first stake to detect field name mismatches
        if (firstStake) {
          console.log('🔍 [useStakeDashboard] 🔬 First Stake - ALL Fields:', {
            allFields: Object.keys(firstStake),
            fieldValues: {
              totalEarned: firstStake.totalEarned,
              totalReturnsEarned: (firstStake as any).totalReturnsEarned,
              totalEarnings: (firstStake as any).totalEarnings,
              returnsEarned: (firstStake as any).returnsEarned,
            },
            note: 'Checking for field name mismatches - backend might use different field name',
          });
        }
        console.log('🔍 [useStakeDashboard] 📊 Extracted Dashboard Data:', {
          hasWallets: !!dashboardData.wallets,
          activeStakesCount: dashboardData.activeStakes?.length || 0,
          stakeHistoryCount: dashboardData.stakeHistory?.length || 0,
          hasSummary: !!dashboardData.summary,
          firstStake: firstStake
            ? {
                _id: firstStake._id?.substring(0, 8) + '...',
                amount: firstStake.amount,
                totalEarned: firstStake.totalEarned,
                progressToTarget: firstStake.progressToTarget,
                remainingToTarget: firstStake.remainingToTarget,
                targetReturn: firstStake.targetReturn,
                status: firstStake.status,
                updatedAt: firstStake.updatedAt,
              }
            : 'NO STAKES',
          summary: dashboardData.summary
            ? {
                totalEarnedFromROS: dashboardData.summary.totalEarnedFromROS,
                progressToTarget: dashboardData.summary.progressToTarget,
                totalActiveStakes: dashboardData.summary.totalActiveStakes,
              }
            : 'NO SUMMARY',
        });

        // 🔍 CRITICAL: Log if totalEarned is 0
        if (firstStake) {
          const totalEarned =
            firstStake.totalEarned ??
            (firstStake as any).totalReturnsEarned ??
            0;

          if (totalEarned === 0) {
            console.warn(
              '⚠️ [useStakeDashboard] ⚠️ WARNING: First stake has totalEarned = 0',
              {
                stakeId: firstStake._id,
                amount: firstStake.amount,
                targetReturn: firstStake.targetReturn,
                updatedAt: firstStake.updatedAt,
                totalEarned: firstStake.totalEarned,
                totalReturnsEarned: (firstStake as any).totalReturnsEarned,
                note: 'Backend is not updating stake fields after distribution. Check: 1) Is distribution running? 2) Is stake.save() being called? 3) Is field name correct?',
              }
            );
          } else {
            // Update the stake object with the correct value
            firstStake.totalEarned = totalEarned;
            console.log('✅ [useStakeDashboard] Stake has earnings:', {
              stakeId: firstStake._id,
              totalEarned: totalEarned,
            });
          }
        }

        return dashboardData;
      } catch (error: unknown) {
        // Handle 404 gracefully - user has no wallet yet (new user)
        const err = error as {
          response?: { status?: number };
          statusCode?: number;
        };
        if (err?.response?.status === 404 || err?.statusCode === 404) {
          // Return empty dashboard structure (matches what the API would return)
          return {
            wallets: {
              fundedWallet: 0,
              earningWallet: 0,
              totalAvailableBalance: 0,
              description: {
                fundedWallet:
                  'Available for staking only (deposits + P2P transfers)',
                earningWallet:
                  'Available for withdrawal + staking (ROS + bonuses)',
              },
            },
            activeStakes: [],
            stakeHistory: [],
            summary: {
              totalActiveStakes: 0,
              totalStakesSinceInception: 0,
              totalEarnedFromROS: 0,
              targetTotalReturns: 0,
              progressToTarget: '0.00%',
              stakingModel:
                'Daily ROS based on Novunt trading performance until 200% returns',
              note: 'Stakes are permanent commitments. You benefit through daily ROS payouts to your Earning Wallet until 200% maturity.',
            },
          };
        }
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute to catch daily profit updates
    retry: (failureCount, error: unknown) => {
      const err = error as {
        response?: { status?: number };
        statusCode?: number;
      };
      // Don't retry 404s (new users without wallets)
      if (err?.response?.status === 404 || err?.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get Stake Details
 * GET /api/v1/staking/:stakeId
 *
 * Returns detailed information about a specific stake
 */
export function useStakeDetails(stakeId: string) {
  return useQuery<StakeDetails>({
    queryKey: stakingQueryKeys.stake(stakeId),
    queryFn: async () => {
      const response = await api.get<StakeDetails>(`/staking/${stakeId}`);
      return response;
    },
    enabled: !!stakeId, // Only run if stakeId exists
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get Stake History
 * Uses the dashboard query but returns only history
 */
export function useStakeHistory() {
  return useQuery<Stake[]>({
    queryKey: stakingQueryKeys.history,
    queryFn: async () => {
      const response = await api.get<StakingDashboard>('/staking/dashboard');
      const history = response.data.stakeHistory || [];
      return history;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: (failureCount, error: unknown) => {
      const err = error as {
        response?: { status?: number };
        statusCode?: number;
      };
      // Don't retry 404s
      if (err?.response?.status === 404 || err?.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
