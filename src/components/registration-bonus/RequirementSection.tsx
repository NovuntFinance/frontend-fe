/**
 * Requirement Section Component – Gold Design
 * Shows the 4 actionable requirements for the registration bonus.
 * (Step 1 "Registration" is automatic and not shown here.)
 *
 * Steps 2–5:
 *   2. 2FA Setup
 *   3. Withdrawal Address
 *   4. Social Media (ALL 5 platforms)
 *   5. First Stake (≥ 20 USDT)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import type { RegistrationBonusData } from '@/types/registrationBonus';
import { SocialMediaPlatform } from '@/types/registrationBonus';
import { queryKeys } from '@/lib/queries';
import { registrationBonusKeys } from '@/lib/queries/registrationBonusQueries';
import { TwoFARequirement } from './TwoFARequirement';
import { WithdrawalAddressRequirement } from './WithdrawalAddressRequirement';
import { SocialMediaRequirement } from './SocialMediaRequirement';
import { StakeRequirement } from './StakeRequirement';

interface RequirementSectionProps {
  requirements: RegistrationBonusData['requirements'];
  nextStepDescription: string;
  onRefresh: () => void;
}

export function RequirementSection({
  requirements,
  nextStepDescription,
  onRefresh,
}: RequirementSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.registrationBonusStatus,
    });
    queryClient.invalidateQueries({ queryKey: registrationBonusKeys.status() });
    onRefresh();
  }, [queryClient, onRefresh]);

  // Build the social-media details array from the V2 requirements structure
  const socialVerifications = requirements.socialMediaVerifications ?? [];
  const allPlatforms = [
    SocialMediaPlatform.FACEBOOK,
    SocialMediaPlatform.INSTAGRAM,
    SocialMediaPlatform.YOUTUBE,
    SocialMediaPlatform.TIKTOK,
    SocialMediaPlatform.TELEGRAM,
  ];

  const socialDetails = allPlatforms.map((platformName) => {
    const match = socialVerifications.find(
      (v) => v.platform.toLowerCase() === platformName.toLowerCase()
    );
    return {
      platform: platformName,
      isVerified: match?.isVerified ?? false,
      verifiedAt: match?.verifiedAt ?? null,
      accountHandle: null,
    };
  });

  const verifiedCount = socialDetails.filter((d) => d.isVerified).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 2FA Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <TwoFARequirement
            twoFAData={{
              isCompleted: requirements.twoFASetup?.isCompleted ?? false,
              completedAt: requirements.twoFASetup?.completedAt ?? null,
            }}
            onComplete={handleRefresh}
          />
        </motion.div>

        {/* Withdrawal Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="h-full"
        >
          <WithdrawalAddressRequirement
            addressData={{
              isCompleted:
                requirements.withdrawalAddressWhitelist?.isCompleted ?? false,
              address: requirements.withdrawalAddressWhitelist?.address ?? null,
              network: requirements.withdrawalAddressWhitelist?.network ?? null,
              completedAt:
                requirements.withdrawalAddressWhitelist?.completedAt ?? null,
            }}
            onComplete={handleRefresh}
          />
        </motion.div>

        {/* Social Media – ALL 5 required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full"
        >
          <SocialMediaRequirement
            socialData={{
              completed: verifiedCount,
              total: 5,
              minimumRequired: 5,
              details: socialDetails,
            }}
            onComplete={handleRefresh}
          />
        </motion.div>

        {/* First Stake (≥ 20 USDT) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="h-full"
        >
          <StakeRequirement
            stakeData={{
              completed:
                requirements.firstStakeCompleted ??
                requirements.firstStake?.completed ??
                false,
              amount: requirements.firstStake?.amount ?? null,
              stakeId: requirements.firstStake?.stakeId ?? null,
            }}
            onComplete={handleRefresh}
          />
        </motion.div>
      </div>
    </div>
  );
}
