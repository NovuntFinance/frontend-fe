/**
 * Badge Card Component
 * Neumorphic, single reusable component: title, description, rarity, earned status,
 * NXP value, date, optional actions. Strict palette: #0D162C, #009BF2, #FFFFFF (opacity only).
 */

'use client';

import React from 'react';
import { cn, stripEmojis } from '@/lib/utils';
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

export function BadgeCard({ badge, earned = false, progress }: BadgeCardProps) {
  const nxpAmount = getNXPForRarity(badge.rarity);
  const rarityLabel =
    badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1);
  const levelNum =
    badge.rarity === 'legendary'
      ? 4
      : badge.rarity === 'epic'
        ? 3
        : badge.rarity === 'rare'
          ? 2
          : 1;

  const isOngoing = !earned && progress !== undefined && progress > 0;
  const statusDot = earned ? '🟢' : isOngoing ? '🟠' : '🔴';
  const statusClass = earned
    ? badgeStyles.badgeCardRoot_earned
    : isOngoing
      ? badgeStyles.badgeCardRoot_ongoing
      : badgeStyles.badgeCardRoot_unearned;

  return (
    <article className={cn(badgeStyles.badgeCardRoot, statusClass)}>
      {/* Faint enlarged emoji as background – does not overpower neumorphic design */}
      <div className={badgeStyles.badgeCardEmojiBg} aria-hidden>
        {badge.icon}
      </div>
      {/* Top row: status dot, rarity, level */}
      <div className={badgeStyles.badgeTopRow}>
        <span
          className={badgeStyles.badgeStatusDot}
          aria-label={
            earned ? 'Earned' : isOngoing ? 'In progress' : 'Not earned'
          }
        >
          {statusDot}
        </span>
        <span
          className={cn(
            badgeStyles.badgeRarityPill,
            RARITY_PILL_CLASS[badge.rarity]
          )}
        >
          {rarityLabel}
        </span>
        <span className={badgeStyles.badgeLevelPill}>Level {levelNum}</span>
      </div>

      {/* Icon – inset circle (central) */}
      <div className={badgeStyles.badgeIconWrap}>{badge.icon}</div>

      {/* Title */}
      <h3 className={badgeStyles.badgeTitle}>{stripEmojis(badge.title)}</h3>

      {/* NXP panel */}
      {earned ? (
        <div className={badgeStyles.badgeNxpPanel}>
          <div className={badgeStyles.badgeNxpValue}>+{nxpAmount} NXP</div>
        </div>
      ) : (
        <div className={badgeStyles.badgeNxpPanel}>
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
    </article>
  );
}
