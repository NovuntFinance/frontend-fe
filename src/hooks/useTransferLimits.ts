/**
 * Hook to get transfer limits from config
 * Replaces hardcoded TRANSFER_LIMITS
 */

import { useConfig } from '@/contexts/ConfigContext';

export interface TransferLimits {
  minAmount: number;
  maxAmount: number;
  fee: number;
  feePercentage: number;
}

/**
 * Hook to get transfer limits
 * Falls back to default values if config is not available
 */
export function useTransferLimits(): TransferLimits {
  const { getValue } = useConfig();

  return {
    minAmount: getValue('min_transfer_amount') ?? 1,
    maxAmount: getValue('max_transfer_amount') ?? 1000000,
    fee: 0, // Currently no fee
    feePercentage: getValue('transfer_fee_percentage') ?? 0,
  };
}
