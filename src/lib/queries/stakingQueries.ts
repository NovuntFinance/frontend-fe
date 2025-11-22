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
  targetReturn: number; // 200% of amount
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
      targetTotalReturns: number;
      progressToTarget: string;
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
 * Returns:
        const dashboardData = response.data || response;
        
        console.log('[Staking] ✅ Dashboard loaded:', {
          hasData: !!dashboardData,
          activeStakesCount: dashboardData?.activeStakes?.length || 0,
          hasWallets: !!dashboardData?.wallets,
        });
        
        return dashboardData;
      } catch (error: unknown) {
        // Handle 404 gracefully - user has no wallet yet (new user)
        const err = error as { response?: { status?: number }; statusCode?: number };
        if (err?.response?.status === 404 || err?.statusCode === 404) {
          console.log('[Staking] ⚠️ No wallet found - returning empty dashboard');
          // Return empty dashboard structure (matches what the API would return)
          return {
            wallets: {
              fundedWallet: 0,
              earningWallet: 0,
              totalAvailableBalance: 0,
              description: {
                fundedWallet: 'Available for staking only (deposits + P2P transfers)',
                earningWallet: 'Available for withdrawal + staking (ROS + bonuses)',
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
              stakingModel: 'Weekly ROS based on Novunt trading performance until 200% returns',
              note: 'Stakes are permanent commitments. You benefit through weekly ROS payouts to your Earning Wallet until 200% maturity.',
            },
          };
        }
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 120 * 1000, // Refetch every 2 minutes
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number }; statusCode?: number };
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
      console.log(`[Staking] 🔄 Fetching stake details for: ${stakeId}`);
      const response = await api.get<StakeDetails>(`/staking/${stakeId}`);
      console.log('[Staking] ✅ Stake details loaded:', response.stake);
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
      console.log('[Staking] 🔄 Fetching stake history...');
      const response = await api.get<StakingDashboard>('/staking/dashboard');
      const history = response.data.stakeHistory || [];
      console.log('[Staking] ✅ History loaded:', history.length, 'stakes');
      return history;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number }; statusCode?: number };
      // Don't retry 404s
      if (err?.response?.status === 404 || err?.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

