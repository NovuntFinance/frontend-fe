/**
 * Badge Grid Component
 * Displays badges in a grid with category tabs
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { BadgeCard } from './BadgeCard';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Badge,
  BadgeDefinition,
  BadgeProgress,
} from '@/types/achievements';

interface BadgeGridProps {
  earnedBadges: Badge[];
  badgeCatalog: BadgeDefinition[];
  badgeProgress: BadgeProgress[];
  onToggleDisplay?: (badgeId: string) => void;
}

type BadgeCategory =
  | 'all'
  | 'staking'
  | 'ranks'
  | 'team'
  | 'earnings'
  | 'referrals'
  | 'special';

export function BadgeGrid({
  earnedBadges,
  badgeCatalog,
  badgeProgress,
  onToggleDisplay,
}: BadgeGridProps) {
  const [activeCategory, setActiveCategory] = useState<BadgeCategory>('all');
  const [showAll, setShowAll] = useState(false);

  const INITIAL_LIMIT = 12;

  // Create a map of earned badges by type
  const earnedBadgesMap = useMemo(() => {
    const map = new Map<string, Badge>();
    earnedBadges.forEach((badge) => {
      map.set(badge.badgeType, badge);
    });
    return map;
  }, [earnedBadges]);

  // Create a map of progress by badge type
  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    badgeProgress.forEach((category) => {
      category.badges.forEach((badge) => {
        map.set(badge.type, badge.progress);
      });
    });
    return map;
  }, [badgeProgress]);

  // Group badges by category
  const groupedBadges = useMemo(() => {
    const groups: Record<BadgeCategory, BadgeDefinition[]> = {
      all: [],
      staking: [],
      ranks: [],
      team: [],
      earnings: [],
      referrals: [],
      special: [],
    };

    badgeCatalog.forEach((badge) => {
      if (
        badge.badgeType.startsWith('stake_') ||
        badge.badgeType === 'first_stake'
      ) {
        groups.staking.push(badge);
      } else if (badge.badgeType.startsWith('rank_')) {
        groups.ranks.push(badge);
      } else if (badge.badgeType.startsWith('team_')) {
        groups.team.push(badge);
      } else if (
        badge.badgeType.startsWith('profit_') ||
        badge.badgeType.startsWith('earnings_')
      ) {
        groups.earnings.push(badge);
      } else if (badge.badgeType.startsWith('referral_')) {
        groups.referrals.push(badge);
      } else {
        groups.special.push(badge);
      }
      groups.all.push(badge);
    });

    return groups;
  }, [badgeCatalog]);

  const categoryLabels: Record<BadgeCategory, string> = {
    all: 'All Badges',
    staking: 'Staking',
    ranks: 'Ranks',
    team: 'Team',
    earnings: 'Earnings',
    referrals: 'Referrals',
    special: 'Special',
  };

  const displayedBadges = groupedBadges[activeCategory];
  const visibleBadges = showAll
    ? displayedBadges
    : displayedBadges.slice(0, INITIAL_LIMIT);
  const hasMore = displayedBadges.length > INITIAL_LIMIT;

  // Reset showAll when category changes
  React.useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(Object.keys(categoryLabels) as BadgeCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'rounded-lg px-4 py-2 font-medium whitespace-nowrap transition-colors',
              activeCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {categoryLabels[category]} ({groupedBadges[category].length})
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      {displayedBadges.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visibleBadges.map((badge) => {
              const earnedBadge = earnedBadgesMap.get(badge.badgeType);
              const progress = progressMap.get(badge.badgeType);

              return (
                <BadgeCard
                  key={badge.badgeType}
                  badge={earnedBadge || badge}
                  earned={!!earnedBadge}
                  progress={progress}
                  onToggleDisplay={onToggleDisplay}
                />
              );
            })}
          </div>
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="gap-2"
              >
                {showAll ? (
                  <>
                    Show Less
                    <ChevronDown className="h-4 w-4 rotate-180" />
                  </>
                ) : (
                  <>
                    View More ({displayedBadges.length - INITIAL_LIMIT} more)
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-muted-foreground py-12 text-center">
          <p>No badges in this category</p>
        </div>
      )}
    </div>
  );
}
