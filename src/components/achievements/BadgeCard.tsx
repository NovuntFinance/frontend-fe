/**
 * Badge Card Component
 * Displays a badge with NXP information
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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

/**
 * Get NXP amount for a badge based on rarity
 */
function getNXPForRarity(rarity: BadgeRarity): number {
  const nxpByRarity: Record<BadgeRarity, number> = {
    common: 25,
    rare: 75,
    epic: 150,
    legendary: 400,
  };
  return nxpByRarity[rarity] || 25;
}

/**
 * Get rarity color classes
 */
function getRarityStyles(rarity: BadgeRarity) {
  const styles = {
    common: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-300 dark:border-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      badge: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    },
    rare: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
      badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    },
    epic: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-300 dark:border-purple-700',
      text: 'text-purple-800 dark:text-purple-200',
      badge:
        'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
    },
    legendary: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-800 dark:text-yellow-200',
      badge:
        'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
    },
  };
  return styles[rarity];
}

export function BadgeCard({
  badge,
  earned = false,
  progress,
  onToggleDisplay,
}: BadgeCardProps) {
  const nxpAmount = getNXPForRarity(badge.rarity);
  const styles = getRarityStyles(badge.rarity);
  const earnedBadge = earned && 'awardedAt' in badge ? badge : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 p-3 transition-all duration-300 sm:p-5',
        earned
          ? cn(
              styles.bg,
              styles.border,
              'shadow-lg hover:shadow-xl',
              'bg-gradient-to-br',
              badge.rarity === 'legendary' &&
                'from-yellow-100 via-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-orange-900/30',
              badge.rarity === 'epic' &&
                'from-purple-100 via-purple-50 to-pink-100 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-pink-900/30',
              badge.rarity === 'rare' &&
                'from-blue-100 via-blue-50 to-cyan-100 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-cyan-900/30',
              badge.rarity === 'common' &&
                'from-gray-100 via-gray-50 to-slate-100 dark:from-gray-800/30 dark:via-gray-700/20 dark:to-slate-800/30'
            )
          : 'bg-muted/30 border-muted opacity-60',
        'group'
      )}
    >
      {/* Badge Icon as Background Pattern */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center',
          'opacity-5 dark:opacity-10',
          earned && 'opacity-10 dark:opacity-15',
          'text-[80px] sm:text-[200px]'
        )}
        style={{
          lineHeight: 1,
          transform: 'rotate(-5deg)',
        }}
      >
        {badge.icon}
      </div>

      {/* Premium glow effect for earned badges */}
      {earned && (
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
            'bg-gradient-to-br from-transparent via-white/10 to-transparent',
            'blur-xl'
          )}
        />
      )}

      {/* Badge Icon and Status */}
      <div className="relative z-10 mb-2 flex items-start justify-between sm:mb-4">
        <div
          className={cn(
            'text-3xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl',
            earned && 'relative z-10 drop-shadow-lg'
          )}
        >
          {badge.icon}
        </div>
        {earned ? (
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow-sm sm:h-6 sm:w-6" />
            </motion.div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm sm:px-2 sm:py-1 sm:text-xs dark:text-emerald-400"
            >
              ✓ Earned
            </Badge>
          </div>
        ) : (
          <Lock className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </div>

      {/* Badge Title */}
      <h3
        className={cn(
          'relative z-10 mb-2 text-sm font-bold sm:text-xl',
          styles.text,
          earned && 'drop-shadow-sm'
        )}
      >
        {badge.title}
      </h3>

      {/* Badge Description */}
      <p
        className={cn(
          'relative z-10 mb-3 line-clamp-2 text-xs leading-relaxed sm:mb-4 sm:line-clamp-none sm:text-sm',
          earned ? 'text-gray-700 dark:text-gray-300' : 'text-muted-foreground'
        )}
      >
        {badge.description}
      </p>

      {/* Rarity Badge */}
      <div className="relative z-10 mb-2 sm:mb-4">
        <Badge
          className={cn(
            'px-3 py-1 text-xs font-bold shadow-md',
            styles.badge,
            earned && 'ring-2 ring-offset-2',
            badge.rarity === 'legendary' && earned && 'ring-yellow-400/50',
            badge.rarity === 'epic' && earned && 'ring-purple-400/50',
            badge.rarity === 'rare' && earned && 'ring-blue-400/50'
          )}
        >
          {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
        </Badge>
      </div>

      {/* NXP Display - Premium Style */}
      {earned ? (
        <div
          className={cn(
            'relative z-10 mb-2 overflow-hidden rounded-lg border-2 p-2 sm:mb-4 sm:p-3',
            'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10',
            'border-blue-500/30 dark:border-blue-400/30',
            'shadow-md'
          )}
        >
          <div className="relative z-10">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wide text-blue-700 uppercase sm:mb-1 sm:text-xs dark:text-blue-300">
              NXP Earned
            </div>
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-lg font-bold text-transparent sm:text-2xl dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400">
              +{nxpAmount} NXP
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50" />
        </div>
      ) : (
        <div className="bg-muted/50 border-border/50 mb-2 rounded-lg border p-2 sm:mb-4 sm:p-3">
          <div className="text-muted-foreground mb-0.5 text-[10px] sm:mb-1 sm:text-xs">
            Will Earn
          </div>
          <div className="text-sm font-bold text-blue-600 sm:text-lg dark:text-blue-400">
            +{nxpAmount} NXP
          </div>
        </div>
      )}

      {/* Progress Bar (for unearned badges) */}
      {!earned && progress !== undefined && (
        <div className="relative z-10 mb-3">
          <div className="text-muted-foreground mb-1 flex justify-between text-xs">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Date Earned (if earned) */}
      {earnedBadge?.awardedAt && (
        <div className="text-muted-foreground relative z-10 text-xs">
          Earned: {new Date(earnedBadge.awardedAt).toLocaleDateString()}
        </div>
      )}

      {/* Display Toggle (if earned and callback provided) */}
      {earned && 'isDisplayed' in badge && onToggleDisplay && (
        <button
          onClick={() => onToggleDisplay(badge.badgeType)}
          className="text-muted-foreground hover:text-foreground relative z-10 mt-2 text-xs transition-colors"
        >
          {badge.isDisplayed ? 'Hide from profile' : 'Show on profile'}
        </button>
      )}
    </motion.div>
  );
}
