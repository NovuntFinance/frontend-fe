/**
 * Hook to get staking configuration values
 * Replaces hardcoded staking constants
 */

import { useConfig } from '@/contexts/ConfigContext';

export interface StakingConfig {
  minAmount: number;
  maxAmount: number;
  weeklyReturnPercentage: number;
  goalTargetPercentage: number;
}

/**
 * Hook to get staking configuration
 * Falls back to default values if config is not available
 */
export function useStakingConfig(): StakingConfig {
  const { getValue } = useConfig();

  return {
    minAmount: getValue('min_stake_amount') ?? 20,
    maxAmount: getValue('max_stake_amount') ?? 10000,
    weeklyReturnPercentage: getValue('weekly_return_percentage') ?? 6,
    goalTargetPercentage: getValue('goal_target_percentage') ?? 200,
  };
}
