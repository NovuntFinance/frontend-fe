import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { stakingQueryKeys } from '@/lib/queries/stakingQueries';
import { queryKeys } from '@/lib/queries';
import { registrationBonusApi } from '@/services/registrationBonusApi';

/**
 * Backend only accepts these goal values (lowercase). Any other text is sent as goal: 'other' with goalTitle for display.
 */
export const ALLOWED_GOAL_VALUES = [
  'wedding',
  'housing',
  'vehicle',
  'travel',
  'education',
  'emergency',
  'retirement',
  'business',
  'other',
] as const;

export type AllowedGoal = (typeof ALLOWED_GOAL_VALUES)[number];

/**
 * Normalize user goal text for the API: if it matches an allowed value (case-insensitive), return it lowercase; otherwise return 'other'.
 */
export function normalizeGoalForApi(userGoal: string): AllowedGoal {
  const normalized = userGoal.trim().toLowerCase();
  return ALLOWED_GOAL_VALUES.includes(normalized as AllowedGoal)
    ? (normalized as AllowedGoal)
    : 'other';
}

/**
 * Create Stake Request/Response Types
 */
export interface CreateStakeRequest {
  amount: number;
  source?: 'funded' | 'earning' | 'both'; // Frontend uses this
  sourceWallet?: 'funded' | 'earning' | 'both'; // Backend expects this
  duration?: string; // Backend requires this field
  goal?: string; // Must be one of ALLOWED_GOAL_VALUES (use normalizeGoalForApi for user text)
  goalTitle?: string; // User's own words for display (sent when goal is 'other')
  twoFactorCode?: string; // No longer used for stake creation (removed for UX)
}

/** Create-stake response shape (backend: data.stake, data.transaction, data.walletAfterStake). apiRequest unwraps to this. */
export interface CreateStakeResponse {
  success?: boolean;
  message?: string;
  stake: {
    id?: string;
    _id?: string;
    userId: string;
    amount: number;
    goal?: string | null;
    goalTitle?: string | null;
    targetReturn: number;
    startDate?: string;
    active?: boolean;
    nextPayoutDate?: string;
    model?: string;
    createdAt?: string;
    status: string;
    source?: string;
    weeklyPayouts?: Array<{
      week: number;
      expectedAmount: number;
      estimatedDate: string;
      status: string;
    }>;
  };
  transaction?: {
    reference: string;
    type: string;
    amount: number;
    timestamp: string;
  };
  /** Backend name; legacy response may use newBalance. */
  walletAfterStake?: {
    fundedWallet: number;
    earningWallet: number;
    totalBalance: number;
    deductionBreakdown?: { fromFunded: number; fromEarning: number };
  };
  /** Legacy: same as walletAfterStake when backend used this name. */
  newBalance?: {
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
 * - 2FA is not required for stake creation. 2FA is only required for withdrawal, transfer, and change of password.
 */
export function useCreateStake() {
  const queryClient = useQueryClient();

  return useMutation<CreateStakeResponse, Error, CreateStakeRequest>({
    mutationFn: async (data) => {
      console.log('[Staking Mutation] 🔄 Creating stake...', {
        amount: data.amount,
        source: data.source || 'both',
        goal: data.goal || 'none',
      });

      // Backend has a validation bug where duration: 0 is treated as missing
      // Send duration explicitly to ensure it's included in the request
      const payload: any = {
        amount: data.amount,
        sourceWallet: 'auto', // Backend requires 'auto' for automatic wallet deduction
        duration: 0, // Backend requires 0 for permanent stake (200% ROS)
      };

      // Add optional fields: goal must be one of allowed enum values (handled by caller via normalizeGoalForApi)
      if (data.goal) payload.goal = data.goal;
      if (data.goalTitle) payload.goalTitle = data.goalTitle;

      console.log(
        '[Staking Mutation] 📦 Final payload being sent:',
        JSON.stringify(payload, null, 2)
      );

      const response = await apiRequest<CreateStakeResponse>(
        'post',
        '/staking/create',
        payload
      );

      const stakeId = response.stake?.id ?? response.stake?._id;
      const wallet = response.walletAfterStake ?? response.newBalance;
      console.log('[Staking Mutation] ✅ Stake created successfully:', {
        stakeId,
        amount: response.stake.amount,
        targetReturn: response.stake.targetReturn,
        walletAfterStake: wallet,
      });

      return response;
    },
    onSuccess: async (data) => {
      console.log('[Staking Mutation] ✅ Stake created successfully!');
      console.log(
        '[Staking Mutation] Response data:',
        JSON.stringify(data, null, 2)
      );

      // Invalidate all staking-related queries immediately (don't wait for bonus processing)
      queryClient.invalidateQueries({ queryKey: stakingQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: stakingQueryKeys.history });

      // Invalidate wallet balance
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });

      // Invalidate dashboard overview
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });

      // Refresh rank progress (ranks update instantly on backend after stake creation)
      queryClient.invalidateQueries({ queryKey: ['rankProgress'] });

      console.log(
        '[Staking Mutation] ✅ All queries invalidated - UI will update immediately'
      );

      // Process stake for registration bonus in the background (non-blocking)
      // Use a timeout wrapper to prevent it from hanging
      const processBonusWithTimeout = async () => {
        // Handle both response shapes:
        //   1. { stake: { id/\_id, amount } }  — stake nested under "stake" key
        //   2. { id/\_id, amount }              — stake IS the response (apiRequest unwraps "data")
        const stakeId =
          data?.stake?.id ??
          data?.stake?._id ??
          (data as any)?.id ??
          (data as any)?._id;
        const stakeAmount = data?.stake?.amount ?? (data as any)?.amount;

        console.log('[Staking Mutation] 🔍 Bonus processing - extracted:', {
          stakeId,
          stakeAmount,
          responseKeys: data ? Object.keys(data) : 'null',
        });

        if (!stakeId || !stakeAmount) {
          console.warn(
            '[Staking Mutation] ⚠️ Missing stakeId or amount, skipping bonus processing.',
            'Response shape:',
            JSON.stringify(data, null, 2)
          );
          return;
        }

        try {
          // Create a timeout promise that rejects after 15 seconds
          // (bonus processing may involve creating a bonus stake on the backend)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error('Bonus processing timeout')),
              15000
            );
          });

          // Race between the API call and timeout
          const bonusResponse = (await Promise.race([
            registrationBonusApi.processStake(stakeId, stakeAmount),
            timeoutPromise,
          ])) as any;

          console.log(
            '[Staking Mutation] 🎁 Registration bonus processed:',
            bonusResponse
          );

          // If bonus was activated (100% progress reached), trigger confetti
          if (bonusResponse?.success && bonusResponse?.bonusActivated) {
            console.log(
              '[Staking Mutation] 🎉 Bonus activated! Progress reached 100%'
            );
            // Dispatch custom event to trigger confetti in banner
            window.dispatchEvent(
              new CustomEvent('registrationBonusCompleted', {
                detail: { bonusAmount: bonusResponse.bonusAmount },
              })
            );
          }

          // Invalidate registration bonus status after successful processing
          queryClient.invalidateQueries({
            queryKey: queryKeys.registrationBonusStatus,
          });
        } catch (error: any) {
          // Check if it's a timeout error
          if (
            error?.message?.includes('timeout') ||
            error?.name === 'TimeoutError'
          ) {
            console.warn(
              '[Staking Mutation] ⚠️ Bonus processing timed out (non-critical) - will retry on next page load'
            );
          } else {
            console.error(
              '[Staking Mutation] ⚠️ Failed to process stake for bonus (non-critical):',
              error
            );
          }
          // Don't fail the whole stake creation if bonus processing fails
          // The bonus will be processed on next page load or when status is refreshed
        }
      };

      // Process bonus in background (fire and forget)
      processBonusWithTimeout().catch((error) => {
        console.error(
          '[Staking Mutation] Background bonus processing error:',
          error
        );
      });
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

      // Refresh rank progress (ranks update instantly on backend after stake cancellation)
      queryClient.invalidateQueries({ queryKey: ['rankProgress'] });
    },
  });
}
