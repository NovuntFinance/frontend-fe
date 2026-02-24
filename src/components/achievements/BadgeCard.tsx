/**
 * Badge Card Component
 * Neumorphic, single reusable component: title, description, rarity, earned status,
 * NXP value, date, optional actions. Strict palette: #0D162C, #009BF2, #FFFFFF (opacity only).
 */

'use client';

import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import badgeStyles from '@/styles/badge-card.module.css';
import type {
  Badge as BadgeType,
  BadgeDefinition,
  BadgeRarity,
} from '@/types/achievements';

interface BadgeCardProps {
  badge: BadgeType | BadgeDefinition;
  earned?: boolean;
  progress?: number;
  onToggleDisplay?: (badgeId: string) => void;
}

function getNXPForRarity(rarity: BadgeRarity): number {
  const nxpByRarity: Record<BadgeRarity, number> = {
    common: 25,
    rare: 75,
    epic: 150,
    legendary: 400,
  };
  return nxpByRarity[rarity] ?? 25;
}

const RARITY_PILL_CLASS: Record<BadgeRarity, string> = {
  legendary: badgeStyles.badgeRarityPill_legendary,
  epic: badgeStyles.badgeRarityPill_epic,
  rare: badgeStyles.badgeRarityPill_rare,
  common: badgeStyles.badgeRarityPill_common,
};

export function BadgeCard({
  badge,
  earned = false,
  progress,
  onToggleDisplay,
}: BadgeCardProps) {
  const nxpAmount = getNXPForRarity(badge.rarity);
  const earnedBadge = earned && 'awardedAt' in badge ? badge : null;
  const rarityLabel =
    badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1);

  return (
    <article
      className={cn(
        badgeStyles.badgeCardRoot,
        !earned && badgeStyles.badgeCardRoot_unearned
      )}
    >
      {/* Top row: rarity pill (left) + earned status or lock (right) */}
      <div className={badgeStyles.badgeTopRow}>
        <span
          className={cn(
            badgeStyles.badgeRarityPill,
            RARITY_PILL_CLASS[badge.rarity]
          )}
        >
          {rarityLabel}
        </span>
        {earned ? (
          <span className={badgeStyles.badgeEarnedChip}>
            <CheckCircle2
              className={badgeStyles.badgeEarnedChipIcon}
              strokeWidth={2.5}
              aria-hidden
            />
            Earned
          </span>
        ) : (
          <span className={badgeStyles.badgeLockWrap} aria-hidden>
            <Lock className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
          </span>
        )}
      </div>

      {/* Icon – inset circle (central) */}
      <div className={badgeStyles.badgeIconWrap}>{badge.icon}</div>

      {/* Title */}
      <h3 className={badgeStyles.badgeTitle}>{badge.title}</h3>

      {/* Description */}
      <p className={badgeStyles.badgeDescription}>{badge.description}</p>

      {/* NXP panel – inset */}
      {earned ? (
        <div className={badgeStyles.badgeNxpPanel}>
          <div className={badgeStyles.badgeNxpLabel}>NXP Earned</div>
          <div className={badgeStyles.badgeNxpValue}>+{nxpAmount} NXP</div>
        </div>
      ) : (
        <div className={badgeStyles.badgeNxpPanel}>
          <div className={badgeStyles.badgeNxpLabel}>Will Earn</div>
          <div
            className={cn(
              badgeStyles.badgeNxpValue,
              badgeStyles.badgeNxpValueMuted
            )}
          >
            +{nxpAmount} NXP
          </div>
        </div>
      )}

      {/* Progress bar (unearned only) */}
      {!earned && progress !== undefined && (
        <div className={badgeStyles.badgeProgressWrap}>
          <div className={badgeStyles.badgeProgressLabel}>
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className={badgeStyles.badgeProgressTrack}>
            <div
              className={badgeStyles.badgeProgressFill}
              style={{ width: `${Math.min(100, Math.round(progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Date earned */}
      {earnedBadge?.awardedAt && (
        <div className={badgeStyles.badgeDate}>
          Earned: {new Date(earnedBadge.awardedAt).toLocaleDateString()}
        </div>
      )}

      {/* Display toggle */}
      {earned && 'isDisplayed' in badge && onToggleDisplay && (
        <button
          type="button"
          onClick={() => onToggleDisplay(badge.badgeType)}
          className={badgeStyles.badgeAction}
        >
          {badge.isDisplayed ? 'Hide from profile' : 'Show on profile'}
        </button>
      )}
    </article>
  );
}
