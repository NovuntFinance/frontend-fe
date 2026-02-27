/**
 * Badge Grid Component
 * Displays all badges in a grid (no category filter)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { BadgeCard } from './BadgeCard';
import { ChevronDown } from 'lucide-react';
import { EmptyStates } from '@/components/EmptyStates';
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
}

export function BadgeGrid({
  earnedBadges,
  badgeCatalog,
  badgeProgress,
}: BadgeGridProps) {
  const [showAll, setShowAll] = useState(false);

  const INITIAL_LIMIT = 12;

  const earnedBadgesMap = useMemo(() => {
    const map = new Map<string, Badge>();
    earnedBadges.forEach((badge) => {
      map.set(badge.badgeType, badge);
    });
    return map;
  }, [earnedBadges]);

  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    badgeProgress.forEach((category) => {
      category.badges.forEach((badge) => {
        map.set(badge.type, badge.progress);
      });
    });
    return map;
  }, [badgeProgress]);

  const visibleBadges = showAll
    ? badgeCatalog
    : badgeCatalog.slice(0, INITIAL_LIMIT);
  const hasMore = badgeCatalog.length > INITIAL_LIMIT;

  return (
    <div>
      {badgeCatalog.length > 0 ? (
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
                    View More ({badgeCatalog.length - INITIAL_LIMIT} more)
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyStates.EmptyState
          title="No badges available"
          description="Explore badges as they become available."
        />
      )}
    </div>
  );
}
