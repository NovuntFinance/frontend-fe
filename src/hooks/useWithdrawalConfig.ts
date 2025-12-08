/**
 * Hook to get withdrawal configuration values
 * Replaces hardcoded withdrawal constants
 */

import { useConfig } from '@/contexts/ConfigContext';

export interface WithdrawalConfig {
  minAmount: number;
  feePercentage: number;
  dailyLimit: number;
  instantThreshold: number;
  instantEnabled: boolean;
}

/**
 * Hook to get withdrawal configuration
 * Falls back to default values if config is not available
 */
export function useWithdrawalConfig(): WithdrawalConfig {
  const { getValue } = useConfig();

  return {
    minAmount: getValue('min_withdrawal_amount') ?? 10,
    feePercentage: getValue('withdrawal_fee_percentage') ?? 2.5,
    dailyLimit: getValue('max_withdrawals_per_day') ?? 2,
    instantThreshold: getValue('instant_withdrawal_threshold') ?? 50,
    instantEnabled: getValue('enable_instant_withdrawals') ?? true,
  };
}
