/**
 * Registration Bonus Queries
 * React Query hooks for registration bonus status
 */

import { useQuery } from '@tanstack/react-query';
import { registrationBonusApi } from '@/services/registrationBonusApi';
import { RegistrationBonusStatusResponse } from '@/types/registrationBonus';

export const registrationBonusKeys = {
  all: ['registration-bonus'] as const,
  status: () => [...registrationBonusKeys.all, 'status'] as const,
};

/**
 * Hook to get registration bonus status
 * Optimized with refetching to catch automated updates
 */
export function useRegistrationBonusStatus() {
  return useQuery<RegistrationBonusStatusResponse>({
    queryKey: registrationBonusKeys.status(),
    queryFn: () => registrationBonusApi.getStatus(),
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      // Refetch every 10 seconds if requirements are not met or if bonus is active
      if (!data || !data.allRequirementsMet) return 10000;
      return false;
    },
    staleTime: 5000,
  });
}
