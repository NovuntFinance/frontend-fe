/**
 * Registration Bonus Queries
 * React Query hooks for registration bonus status
 *
 * IMPORTANT: Uses the same query keys as queryKeys.registrationBonusStatus
 * so that cache invalidations from mutations.ts and other places all hit
 * the same cache entry.
 */

import { useQuery } from '@tanstack/react-query';
import { registrationBonusApi } from '@/services/registrationBonusApi';
import { RegistrationBonusStatusResponse } from '@/types/registrationBonus';
import { queryKeys } from '@/lib/queries';

// Re-export keys that match queryKeys for consistency
export const registrationBonusKeys = {
  all: queryKeys.registrationBonus,
  status: () => queryKeys.registrationBonusStatus,
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
