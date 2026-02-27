/**
 * Achievement Page
 * Combines Achievement Badge System and NXP (Novunt Experience Points) System
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronDown, AlertCircle } from 'lucide-react';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { BadgeCard } from '@/components/achievements/BadgeCard';
import { BadgeGrid } from '@/components/achievements/BadgeGrid';
import badgeStyles from '@/styles/badge-card.module.css';
import {
  useEarnedBadges,
  useBadgeProgress,
  useBadgeCatalog,
  useNXPBalance,
} from '@/lib/queries/achievementQueries';
import { toast } from '@/components/ui/enhanced-toast';
import { prefersReducedMotion } from '@/lib/accessibility';

/* Dashboard design tokens (match Stakes, WelcomeBackCard, Quick Actions) */
const MAIN_BG = '#0D162C';
const CARD_STYLE = {
  background: MAIN_BG,
  boxShadow:
    '8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)',
  border: '1px solid rgba(0, 155, 242, 0.08)',
} as const;
const ACCENT = '#009BF2';
const LABEL = 'rgba(255, 255, 255, 0.9)';
const SUBTITLE = 'rgba(255, 255, 255, 0.8)';
const ACCENT_SOFT = 'rgba(0, 155, 242, 0.12)';
const ACCENT_MUTED = 'rgba(0, 155, 242, 0.7)';
const ICON_BG = ACCENT;
const ICON_TEXT = MAIN_BG;
const ICON_BORDER = '1px solid rgba(13, 22, 44, 0.2)';
const ICON_SHADOW = 'inset 0 1px 0 rgba(255,255,255,0.2)';

export default function AchievementsPage() {
  const {
    data: earnedBadgesData,
    isLoading: badgesLoading,
    error: badgesError,
    refetch: refetchBadges,
  } = useEarnedBadges();

  const {
    data: badgeProgressData,
    isLoading: progressLoading,
    error: progressError,
  } = useBadgeProgress();

  const {
    data: badgeCatalogData,
    isLoading: catalogLoading,
    error: catalogError,
  } = useBadgeCatalog();

  const {
    data: nxpBalanceData,
    isLoading: nxpLoading,
    error: nxpError,
    refetch: refetchNXP,
  } = useNXPBalance();

  // State for "View More" functionality
  const [showAllBadges, setShowAllBadges] = useState(false);

  const isLoading =
    badgesLoading || progressLoading || catalogLoading || nxpLoading;
  const reducedMotion = prefersReducedMotion();

  const earnedBadges = earnedBadgesData?.data?.badges || [];
  const badgeProgress = badgeProgressData?.data || [];
  const badgeCatalog = badgeCatalogData?.data?.badges || [];
  // Use backend NXP data directly (backend migration complete)
  const nxp = nxpBalanceData?.data;

  // Limit initial display
  const INITIAL_BADGE_LIMIT = 8;

  const displayedBadges = showAllBadges
    ? earnedBadges
    : earnedBadges.slice(0, INITIAL_BADGE_LIMIT);
  const hasMoreBadges = earnedBadges.length > INITIAL_BADGE_LIMIT;

  const handleRefresh = () => {
    refetchBadges();
    refetchNXP();
    toast.success('Refreshing achievements...');
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen lg:h-full lg:min-h-0"
        style={{ background: MAIN_BG }}
      >
        <div className="flex flex-col gap-5">
          <div className="h-48 rounded-2xl" style={CARD_STYLE} />
          <div
            className="grid grid-cols-2 gap-4 rounded-2xl p-5 sm:p-6"
            style={CARD_STYLE}
          >
            <div
              className="h-24 rounded-xl"
              style={{ background: ACCENT_SOFT }}
            />
            <div
              className="h-24 rounded-xl"
              style={{ background: ACCENT_SOFT }}
            />
          </div>
          <div className="h-96 rounded-2xl" style={CARD_STYLE} />
        </div>
      </div>
    );
  }

  // Show partial data even if some queries fail
  const hasCriticalError =
    !!badgesError && !!progressError && !!catalogError && !!nxpError;

  if (hasCriticalError) {
    return (
      <div
        className="min-h-screen lg:h-full lg:min-h-0"
        style={{ background: MAIN_BG }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex min-h-[300px] items-center justify-center p-4">
            <UserFriendlyError
              error={
                badgesError ||
                progressError ||
                catalogError ||
                nxpError ||
                new Error('Unable to fetch achievement data')
              }
              onRetry={handleRefresh}
              variant="card"
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen lg:h-full lg:min-h-0"
      style={{ background: MAIN_BG }}
    >
      <div className="flex flex-col gap-5">
        {/* Error Banner (if some queries failed but not all) */}
        {(badgesError || progressError || catalogError || nxpError) &&
          !hasCriticalError && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -10 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-[rgba(0,155,242,0.2)] p-3 sm:p-4"
              style={{ background: ACCENT_SOFT }}
            >
              <AlertCircle
                className="h-4 w-4 shrink-0"
                style={{ color: ACCENT }}
              />
              <p
                className="text-sm leading-relaxed sm:text-base"
                style={{ color: ACCENT_MUTED }}
              >
                Some data couldn&apos;t be loaded. Showing available
                information.
              </p>
            </motion.div>
          )}

        {/* Page hero – same design as Stakes "My Stakes" card */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6"
          style={CARD_STYLE}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
              style={{
                background: ICON_BG,
                border: ICON_BORDER,
                color: ICON_TEXT,
                boxShadow: ICON_SHADOW,
              }}
            >
              <Award className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1
                className="text-base font-bold sm:text-lg"
                style={{ color: LABEL }}
              >
                Achievements & NXP
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: SUBTITLE }}>
                Track your badges and experience points
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview – Badges Received & Total NXP only */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={badgeStyles.overviewRoot}
          aria-label="Overview"
        >
          <div className={badgeStyles.overviewGrid}>
            <div className={badgeStyles.overviewStatCard}>
              <p className={badgeStyles.overviewStatLabel}>Badges Received</p>
              <p className={badgeStyles.overviewStatValue}>
                {earnedBadges.length}
              </p>
            </div>
            <div className={badgeStyles.overviewStatCard}>
              <p className={badgeStyles.overviewStatLabel}>Total NXP</p>
              {nxp ? (
                <p className={badgeStyles.overviewStatValue}>
                  {nxp.totalNXP.toLocaleString('en-US')}
                </p>
              ) : nxpError ? (
                <p className={badgeStyles.overviewStatValue}>—</p>
              ) : (
                <div className={badgeStyles.overviewStatSkeleton} />
              )}
            </div>
          </div>
        </motion.section>

        {/* Your Badges – section only, no outer card */}
        {earnedBadges.length > 0 && (
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
            aria-label="Your Badges"
          >
            <header className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
                style={{
                  background: ICON_BG,
                  border: ICON_BORDER,
                  color: ICON_TEXT,
                  boxShadow: ICON_SHADOW,
                }}
                aria-hidden
              >
                <Award className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
              </div>
              <div>
                <h2
                  className="text-sm font-bold sm:text-base"
                  style={{ color: LABEL }}
                >
                  Your Badges
                </h2>
                <p className="text-xs" style={{ color: SUBTITLE }}>
                  {earnedBadges.length} badge
                  {earnedBadges.length !== 1 ? 's' : ''} earned
                </p>
              </div>
            </header>
            <div className={badgeStyles.badgeSectionGrid}>
              {displayedBadges.map((badge) => (
                <BadgeCard key={badge.badgeType} badge={badge} earned={true} />
              ))}
            </div>
            {hasMoreBadges && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllBadges(!showAllBadges)}
                  className={badgeStyles.badgeSectionMoreBtn}
                >
                  {showAllBadges ? (
                    <>
                      Show Less
                      <ChevronDown className="h-4 w-4 rotate-180" />
                    </>
                  ) : (
                    <>
                      View More ({earnedBadges.length - INITIAL_BADGE_LIMIT}{' '}
                      more)
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* Badge Catalog – section only, no outer card */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
          aria-label="Badge Catalog"
        >
          <header className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
              style={{
                background: ICON_BG,
                border: ICON_BORDER,
                color: ICON_TEXT,
                boxShadow: ICON_SHADOW,
              }}
              aria-hidden
            >
              <Award className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
            </div>
            <div>
              <h2
                className="text-sm font-bold sm:text-base"
                style={{ color: LABEL }}
              >
                Badge Catalog
              </h2>
              <p className="text-xs" style={{ color: SUBTITLE }}>
                Explore all available badges and track your progress
              </p>
            </div>
          </header>
          <BadgeGrid
            earnedBadges={earnedBadges}
            badgeCatalog={badgeCatalog}
            badgeProgress={badgeProgress}
          />
        </motion.section>
      </div>
    </div>
  );
}
