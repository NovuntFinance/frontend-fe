/**
 * Achievement Page
 * Combines Achievement Badge System and NXP (Novunt Experience Points) System
 */

'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, RefreshCw, XCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { NXPCard } from '@/components/achievements/NXPCard';
import { BadgeCard } from '@/components/achievements/BadgeCard';
import { BadgeGrid } from '@/components/achievements/BadgeGrid';
import { NXPHistory } from '@/components/achievements/NXPHistory';
import {
  useEarnedBadges,
  useBadgeProgress,
  useBadgeCatalog,
  useNXPBalance,
  useToggleBadgeDisplay,
} from '@/lib/queries/achievementQueries';
import { toast } from '@/lib/toast';

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

  const toggleBadgeMutation = useToggleBadgeDisplay();

  // State for "View More" functionality
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  const isLoading =
    badgesLoading || progressLoading || catalogLoading || nxpLoading;
  const hasError = badgesError || progressError || catalogError || nxpError;

  const earnedBadges = earnedBadgesData?.data?.badges || [];
  const badgeProgress = badgeProgressData?.data || [];
  const badgeCatalog = badgeCatalogData?.data?.badges || [];
  // Use backend NXP data directly (backend migration complete)
  const nxp = nxpBalanceData?.data;

  // Limit initial display
  const INITIAL_BADGE_LIMIT = 8;
  const INITIAL_CATALOG_LIMIT = 12;

  const displayedBadges = showAllBadges
    ? earnedBadges
    : earnedBadges.slice(0, INITIAL_BADGE_LIMIT);
  const hasMoreBadges = earnedBadges.length > INITIAL_BADGE_LIMIT;

  const handleToggleDisplay = async (badgeId: string) => {
    try {
      await toggleBadgeMutation.mutateAsync(badgeId);
      toast.success('Badge display updated');
    } catch (error) {
      toast.error('Failed to update badge display');
    }
  };

  const handleRefresh = () => {
    refetchBadges();
    refetchNXP();
    toast.success('Refreshing achievements...');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ShimmerCard className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <ShimmerCard className="h-96" />
          <ShimmerCard className="h-96" />
        </div>
        <ShimmerCard className="h-96" />
      </div>
    );
  }

  // Show partial data even if some queries fail
  const hasCriticalError =
    badgesError && progressError && catalogError && nxpError;

  if (hasCriticalError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            Failed to Load Achievements
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {badgesError?.message ||
              progressError?.message ||
              catalogError?.message ||
              nxpError?.message ||
              'Unable to fetch achievement data'}
          </p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Achievements & Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your accomplishments and earn experience points
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </motion.div>

      {/* Error Banner (if some queries failed but not all) */}
      {(badgesError || progressError || catalogError || nxpError) &&
        !hasCriticalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4"
          >
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ Some data couldn&apos;t be loaded. Showing available
              information.
            </p>
          </motion.div>
        )}

      {/* NXP Card - Show backend data */}
      {nxp ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NXPCard nxp={nxp} />
        </motion.div>
      ) : (
        nxpError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NovuntPremiumCard
              title="NXP Information"
              subtitle="Novunt Experience Points"
              icon={Award}
              colorTheme="purple"
            >
              <div className="py-8 text-center">
                {(() => {
                  const isUnderDevelopment =
                    (nxpError as any)?.message
                      ?.toLowerCase()
                      .includes('under development') ||
                    (nxpError as any)?.message
                      ?.toLowerCase()
                      .includes('not implemented') ||
                    (nxpError as any)?.statusCode === 501;

                  return isUnderDevelopment ? (
                    <>
                      <Award className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
                      <h3 className="mb-2 text-lg font-semibold">
                        Coming Soon
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        The NXP system will be available soon.
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Earn experience points by unlocking badges, upgrading
                        ranks, and reaching milestones!
                      </p>
                    </>
                  ) : (
                    <>
                      <Award className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
                      <p className="text-muted-foreground mb-4 text-sm">
                        NXP data is currently unavailable.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchNXP()}
                      >
                        Retry
                      </Button>
                    </>
                  );
                })()}
              </div>
            </NovuntPremiumCard>
          </motion.div>
        )
      )}

      {/* Earned Badges Section */}
      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Badges</h2>
              <p className="text-muted-foreground text-sm">
                {earnedBadges.length} badge
                {earnedBadges.length !== 1 ? 's' : ''} earned
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {displayedBadges.map((badge) => (
              <BadgeCard
                key={badge.badgeType}
                badge={badge}
                earned={true}
                onToggleDisplay={handleToggleDisplay}
              />
            ))}
          </div>
          {hasMoreBadges && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="gap-2"
              >
                {showAllBadges ? (
                  <>
                    Show Less
                    <ChevronDown className="h-4 w-4 rotate-180" />
                  </>
                ) : (
                  <>
                    View More ({earnedBadges.length - INITIAL_BADGE_LIMIT} more)
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Badge Catalog */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Badge Catalog</h2>
          <p className="text-muted-foreground text-sm">
            Explore all available badges and track your progress
          </p>
        </div>
        <BadgeGrid
          earnedBadges={earnedBadges}
          badgeCatalog={badgeCatalog}
          badgeProgress={badgeProgress}
          onToggleDisplay={handleToggleDisplay}
        />
      </motion.div>

      {/* NXP History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <NXPHistory />
      </motion.div>
    </div>
  );
}
