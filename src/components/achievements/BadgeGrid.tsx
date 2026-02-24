/**
 * Badge Grid Component
 * Displays badges in a grid with category tabs
 */

'use client';

import React, { useMemo, useState } from 'react';
import { BadgeCard } from './BadgeCard';
import { ChevronDown } from 'lucide-react';
import { EmptyStates } from '@/components/EmptyStates';
import { cn } from '@/lib/utils';
import badgeStyles from '@/styles/badge-card.module.css';
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
    <div>
      {/* Category filter tabs – neumorphic: inactive = raised, active = inset */}
      <div className={badgeStyles.badgeCatalogTabs} role="tablist">
        {(Object.keys(categoryLabels) as BadgeCategory[]).map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              badgeStyles.badgeCatalogTab,
              activeCategory === category && badgeStyles.badgeCatalogTab_active
            )}
          >
            {categoryLabels[category]} ({groupedBadges[category].length})
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      {displayedBadges.length > 0 ? (
        <>
          <div className={badgeStyles.badgeSectionGrid}>
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
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className={badgeStyles.badgeSectionMoreBtn}
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
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyStates.EmptyState
          title="No badges in this category"
          description={`You haven't earned any ${activeCategory === 'all' ? '' : categoryLabels[activeCategory].toLowerCase()} badges yet`}
        />
      )}
    </div>
  );
}
