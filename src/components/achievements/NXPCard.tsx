/**
 * NXP Card Component
 * Displays user's NXP balance, level, and progress
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Target } from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Progress } from '@/components/ui/progress';
import type { NXPBalance } from '@/types/achievements';

interface NXPCardProps {
  nxp: NXPBalance;
}

/**
 * Calculate progress percentage to next level
 */
function calculateLevelProgress(nxp: NXPBalance): number {
  // Level formula: level = sqrt(totalNXP / 100)
  // So NXP needed for level N = (N-1)^2 * 100
  const currentLevelNXP = Math.pow(nxp.nxpLevel - 1, 2) * 100;
  const nextLevelNXP = Math.pow(nxp.nxpLevel, 2) * 100;
  const progressPercent =
    ((nxp.totalNXP - currentLevelNXP) / (nextLevelNXP - currentLevelNXP)) * 100;
  return Math.max(0, Math.min(100, progressPercent));
}

/**
 * Get level color based on level
 */
function getLevelColor(level: number): string {
  if (level >= 20) return 'text-yellow-500'; // Legendary
  if (level >= 10) return 'text-purple-500'; // Epic
  if (level >= 5) return 'text-blue-500'; // Rare
  return 'text-gray-500'; // Common
}

export function NXPCard({ nxp }: NXPCardProps) {
  const progressPercent = calculateLevelProgress(nxp);
  const levelColor = getLevelColor(nxp.nxpLevel);

  return (
    <NovuntPremiumCard
      title="Novunt Experience Points"
      subtitle={`Level ${nxp.nxpLevel} • ${nxp.nxpToNextLevel} NXP to next level`}
      icon={Trophy}
      colorTheme="purple"
      tooltip="Earn NXP by unlocking badges, upgrading ranks, and reaching milestones"
    >
      <div className="space-y-6">
        {/* Total NXP Display */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-5xl font-bold text-transparent"
          >
            {nxp.totalNXP.toLocaleString()}
          </motion.div>
          <div className="text-muted-foreground text-sm">Total NXP</div>
        </div>

        {/* Level Badge */}
        <div className="flex items-center justify-center gap-2">
          <div
            className={`text-2xl font-bold ${levelColor} flex items-center gap-2`}
          >
            <Trophy className="h-6 w-6" />
            Level {nxp.nxpLevel}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress to Level {nxp.nxpLevel + 1}
            </span>
            <span className="font-semibold">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-muted-foreground text-center text-xs">
            {nxp.nxpToNextLevel} NXP needed
          </p>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 border-border/50 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground text-xs">From Badges</span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {nxp.breakdown.fromBadges.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 border-border/50 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground text-xs">From Ranks</span>
            </div>
            <div className="text-xl font-bold text-purple-600">
              {nxp.breakdown.fromRanks.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 border-border/50 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground text-xs">
                From Milestones
              </span>
            </div>
            <div className="text-xl font-bold text-emerald-600">
              {nxp.breakdown.fromMilestones.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 border-border/50 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground text-xs">
                Total Earned
              </span>
            </div>
            <div className="text-xl font-bold text-orange-600">
              {nxp.totalNxpEarned.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </NovuntPremiumCard>
  );
}
