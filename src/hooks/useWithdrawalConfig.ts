/**
 * Hook to get withdrawal configuration values
 * Replaces hardcoded withdrawal constants
 */

import { useConfig } from '@/contexts/ConfigContext';

function resolveInstantEnabled(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0 || raw == null) return false;
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off' || s === '') {
      return false;
    }
  }
  return Boolean(raw);
}

function resolveInstantThreshold(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 50;
}

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
    instantThreshold: resolveInstantThreshold(
      getValue('instant_withdrawal_threshold')
    ),
    instantEnabled: resolveInstantEnabled(
      getValue('enable_instant_withdrawals') ?? true
    ),
  };
}
