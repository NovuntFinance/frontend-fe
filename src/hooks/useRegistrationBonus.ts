/**
 * Registration Bonus Hooks
 * React Query hooks for registration bonus feature
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationBonusApi } from '@/services/registrationBonusApi';
import { queryKeys } from '@/lib/queries';
import type {
  RegistrationBonusStatusResponse,
  ProcessStakeRequest,
  ProcessStakeResponse,
} from '@/types/registrationBonus';
import { toast } from 'sonner';

/**
 * Get registration bonus status
 * Auto-refreshes every 30 seconds when status is pending/requirements_met
 * Uses longer intervals for other statuses
 */
export function useRegistrationBonus() {
  return useQuery({
    queryKey: queryKeys.registrationBonusStatus,
    queryFn: () => registrationBonusApi.getStatus(),
    refetchInterval: (query) => {
      const data = query.state.data as RegistrationBonusStatusResponse | undefined;
      const status = data?.data?.status;
      
      // Smart polling based on status
      switch (status) {
        case 'PENDING':
        case 'REQUIREMENTS_MET':
          return 30000; // 30 seconds - active user
        case 'BONUS_ACTIVE':
          return 300000; // 5 minutes - less frequent
        case 'EXPIRED':
        case 'COMPLETED':
        case 'CANCELLED':
          return false; // No polling needed
        default:
          return 60000; // 1 minute default
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Process stake for registration bonus
 * Called immediately after user creates their first stake
 */
export function useProcessStake() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ stakeId, stakeAmount }: { stakeId: string; stakeAmount: number }) =>
      registrationBonusApi.processStake(stakeId, stakeAmount),
    onSuccess: (data) => {
      // Invalidate and refetch bonus status
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationBonusStatus });
      
      // Show success message
      if (data.success && data.bonusAmount) {
        toast.success('Bonus Activated!', {
          description: data.message || `You received $${data.bonusAmount} bonus stake!`,
          duration: 5000,
        });
      } else if (data.success) {
        toast.info('Stake Processed', {
          description: data.message || 'Complete remaining requirements to activate bonus',
          duration: 4000,
        });
      }
    },
    onError: (error: any) => {
      console.error('[useProcessStake] Error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to process stake for bonus';
      toast.error('Bonus Processing Failed', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });
}

