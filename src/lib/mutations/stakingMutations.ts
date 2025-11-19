import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { stakingQueryKeys } from '@/lib/queries/stakingQueries';
import { queryKeys } from '@/lib/queries';
import { registrationBonusApi } from '@/services/registrationBonusApi';

/**
 * Create Stake Request/Response Types
 */

export interface CreateStakeRequest {
  amount: number;
  source?: 'funded' | 'earning' | 'both'; // Frontend uses this
  sourceWallet?: 'funded' | 'earning' | 'both'; // Backend expects this
  duration?: string; // Backend requires this field
  goal?: string; // Optional goal for this stake (e.g., 'wedding', 'housing', etc.)
  twoFactorCode?: string; // Required if 2FA enabled and amount > $500
}

export interface CreateStakeResponse {
  success: boolean;
  message: string;
  stake: {
    _id: string;
    userId: string;
    amount: number;
    targetReturn: number; // 200% of amount
    createdAt: string;
    status: 'active';
    source: string;
    goal?: string; // Optional goal field
    weeklyPayouts: Array<{
      week: number;
      expectedAmount: number;
      estimatedDate: string;
      status: 'pending';
    }>;
  };
  newBalance: {
    fundedWallet: number;
    earningWallet: number;
    totalBalance: number;
  };
}

/**
 * Create New Stake
 * POST /api/v1/staking/create
 * 
 * Creates a new permanent stake with 200% ROI target
 * 
 * Rules:
 * - Minimum stake: $20 USDT
 * - Can stake from Deposit Wallet, Earnings Wallet, or both
 * - Receives weekly ROI payouts until 200% return achieved
 * - Stakes are permanent (cannot withdraw principal)
 * - 2FA required if amount > $500 and user has 2FA enabled
 */
export function useCreateStake() {
  const queryClient = useQueryClient();

  return useMutation<CreateStakeResponse, Error, CreateStakeRequest>({
    mutationFn: async (data) => {
      console.log('[Staking Mutation] 🔄 Creating stake...', {
        amount: data.amount,
        source: data.source || 'both',
        goal: data.goal || 'none',
        has2FA: !!data.twoFactorCode,
      });

      // Backend has a validation bug where duration: 0 is treated as missing
      // Send duration explicitly to ensure it's included in the request
      const payload = {
        amount: data.amount,
        sourceWallet: 'auto', // Backend requires 'auto' for automatic wallet deduction
        duration: 0, // Backend requires 0 for permanent stake (200% ROS)
      };
      
      // Add optional fields
      if (data.goal) payload.goal = data.goal;
      if (data.twoFactorCode) payload.twoFactorCode = data.twoFactorCode;

      console.log('[Staking Mutation] 📦 Final payload being sent:', JSON.stringify(payload, null, 2));

      const response = await apiRequest<CreateStakeResponse>(
        'post',
        '/staking/create',
        payload
      );

      console.log('[Staking Mutation] ✅ Stake created successfully:', {
        stakeId: response.stake._id,
        amount: response.stake.amount,
        targetReturn: response.stake.targetReturn,
        newBalance: response.newBalance,
      });

      return response;
    },
    onSuccess: async (data) => {
      console.log('[Staking Mutation] ✅ Stake created, processing for registration bonus...');
      
      // Process stake for registration bonus (this will update progress to 100% if it's the first stake)
      try {
        const bonusResponse = await registrationBonusApi.processStake(
          data.stake._id,
          data.stake.amount
        );
        console.log('[Staking Mutation] 🎁 Registration bonus processed:', bonusResponse);
        
        // If bonus was activated (100% progress reached), trigger confetti
        if (bonusResponse.success && bonusResponse.bonusActivated) {
          console.log('[Staking Mutation] 🎉 Bonus activated! Progress reached 100%');
          // Dispatch custom event to trigger confetti in banner
          window.dispatchEvent(new CustomEvent('registrationBonusCompleted', {
            detail: { bonusAmount: bonusResponse.bonusAmount }
          }));
        }
      } catch (error) {
        console.error('[Staking Mutation] ⚠️ Failed to process stake for bonus (non-critical):', error);
        // Don't fail the whole stake creation if bonus processing fails
      }
      
      // Invalidate all staking-related queries
      queryClient.invalidateQueries({ queryKey: stakingQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: stakingQueryKeys.history });
      
      // Invalidate wallet balance
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      
      // Invalidate dashboard overview
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      
      // Invalidate registration bonus status to show updated progress
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationBonusStatus });
      
      console.log('[Staking Mutation] ✅ All queries invalidated and refetched');
    },
    onError: (error) => {
      console.error('[Staking Mutation] ❌ Failed to create stake:', error);
    },
  });
}

/**
 * Cancel Stake (If backend implements this in future)
 * POST /api/v1/staking/:stakeId/cancel
 * 
 * Note: Currently stakes are permanent, but keeping this for future use
 */
export function useCancelStake() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (stakeId) => {
      console.log(`[Staking Mutation] 🔄 Cancelling stake: ${stakeId}`);
      const response = await apiRequest<{ success: boolean; message: string }>(
        'post',
        `/staking/${stakeId}/cancel`
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakingQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: stakingQueryKeys.history });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
    },
  });
}

