/**
 * Requirement Section Component - Gold Design
 * Modern card-based layout with gold accents
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import type { RegistrationBonusData } from '@/types/registrationBonus';
import { SocialMediaPlatform } from '@/types/registrationBonus';
import { queryKeys } from '@/lib/queries';
import { SocialMediaRequirement } from './SocialMediaRequirement';
import { ProfileRequirement } from './ProfileRequirement';
import { StakeRequirement } from './StakeRequirement';

interface RequirementSectionProps {
  requirements: RegistrationBonusData['requirements'];
  nextStepDescription: string;
  onRefresh: () => void;
}

/**
 * Requirement Section Component
 * Shows all requirements in elegant card layout
 */
export function RequirementSection({
  requirements,
  nextStepDescription,
  onRefresh,
}: RequirementSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Enhanced refresh function that invalidates cache and refetches
  const handleRefresh = React.useCallback(() => {
    console.log('[RequirementSection] Refreshing registration bonus status...');
    // Invalidate the query cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: queryKeys.registrationBonusStatus });
    // Also call the original refresh function
    onRefresh();
  }, [queryClient, onRefresh]);

  // Determine next action based on requirements
  const handleNextStepAction = () => {
    const profilePercentage = requirements.profileCompletion?.percentage ?? 0;
    if (profilePercentage < 100) {
      // Dispatch custom event to open profile modal
      window.dispatchEvent(new CustomEvent('openProfileModal'));
    } else {
      const socialVerified = requirements.socialMediaVerification?.verifiedCount ?? 0;
      const socialRequired = requirements.socialMediaVerification?.totalRequired ?? 5;
      if (socialVerified < socialRequired) {
        const socialSection = document.getElementById('social-media-requirement');
        if (socialSection) {
          socialSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (!requirements.firstStake?.completed) {
        router.push('/dashboard/stakes');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Requirements Grid - Gold Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
        {/* Profile Requirement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <ProfileRequirement
            profileData={{
              completionPercentage: requirements.profileCompletion?.percentage ?? 0,
              details: [], // Legacy field - not used in new structure
            }}
            onComplete={handleRefresh}
          />
        </motion.div>

        {/* Social Media Requirement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full"
        >
          <SocialMediaRequirement
            socialData={{
              completed: requirements.socialMediaVerification?.verifiedCount ?? 0,
              total: requirements.socialMediaVerification?.totalRequired ?? 5,
              minimumRequired: 1, // Only 1 required for 25% progress
              details: (() => {
                // Get verified platforms from API
                const verifiedPlatforms = requirements.socialMediaVerification?.platforms || [];
                // All 5 platforms that should be displayed (using enum values)
                const allPlatforms = [
                  SocialMediaPlatform.FACEBOOK,
                  SocialMediaPlatform.INSTAGRAM,
                  SocialMediaPlatform.YOUTUBE,
                  SocialMediaPlatform.TIKTOK,
                  SocialMediaPlatform.TELEGRAM,
                ];
                
                // Create complete list with verification status
                return allPlatforms.map((platformName) => ({
                  platform: platformName,
                  isVerified: verifiedPlatforms.includes(platformName),
                  verifiedAt: verifiedPlatforms.includes(platformName) ? new Date().toISOString() : null,
                  accountHandle: null,
                }));
              })(),
            }}
            onComplete={handleRefresh}
          />
        </motion.div>

        {/* Stake Requirement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <StakeRequirement
            stakeData={{
              completed: requirements.firstStake?.completed ?? false,
              amount: null, // Not available in new API structure
              stakeId: requirements.firstStake?.stakeId ?? null,
            }}
            onComplete={handleRefresh}
          />
        </motion.div>
      </div>
    </div>
  );
}
