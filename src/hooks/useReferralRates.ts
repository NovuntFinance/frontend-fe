/**
 * Hook to get referral commission rates from config
 * Replaces hardcoded REFERRAL_COMMISSION_RATES
 */

import { useConfig } from '@/contexts/ConfigContext';

export interface ReferralRates {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

/**
 * Hook to get referral commission rates
 * Falls back to default values if config is not available
 */
export function useReferralRates(): ReferralRates {
  const { getValue } = useConfig();

  return {
    level1: getValue('referral_level_1_percentage') ?? 5,
    level2: getValue('referral_level_2_percentage') ?? 2,
    level3: getValue('referral_level_3_percentage') ?? 1.5,
    level4: getValue('referral_level_4_percentage') ?? 1,
    level5: getValue('referral_level_5_percentage') ?? 0.5,
  };
}
