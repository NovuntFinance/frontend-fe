/**
 * Achievement Page
 * Combines Achievement Badge System and NXP (Novunt Experience Points) System
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, RefreshCw, XCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { toast } from '@/components/ui/enhanced-toast';
import { prefersReducedMotion } from '@/lib/accessibility';

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

  const handleToggleDisplay = async (badgeId: string) => {
    try {
      await toggleBadgeMutation.mutateAsync(badgeId);
      toast.success('Badge display updated');
    } catch {
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
      <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
        <div className="space-y-4 sm:space-y-6">
          <LoadingStates.Card height="h-20" className="w-full" />
          <LoadingStates.Grid items={2} columns={2} className="gap-3 sm:gap-4 md:gap-6" />
          <LoadingStates.Card height="h-96" />
        </div>
      </div>
    );
  }

  // Show partial data even if some queries fail
  const hasCriticalError =
    !!badgesError && !!progressError && !!catalogError && !!nxpError;

  if (hasCriticalError) {
    return (
      <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <UserFriendlyError
            error={badgesError || progressError || catalogError || nxpError || new Error('Unable to fetch achievement data')}
            onRetry={handleRefresh}
            variant="card"
            className="max-w-md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header - Staking Streak Template */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: -20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

            {/* Animated Floating Blob */}
            {!reducedMotion && (
              <motion.div
                animate={{
                  x: [0, -15, 0],
                  y: [0, 10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
              />
            )}

            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2.5 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Award className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-base leading-tight font-bold text-transparent sm:text-lg md:text-xl">
                      Achievements & Progress
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed sm:text-sm">
                      Track your accomplishments and earn experience points
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-9 gap-1.5 text-xs sm:h-10 sm:gap-2 sm:text-sm"
                >
                  <RefreshCw className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="xs:inline hidden">Refresh</span>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Error Banner (if some queries failed but not all) */}
        {(badgesError || progressError || catalogError || nxpError) &&
          !hasCriticalError && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -10 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 sm:p-4"
            >
              <p className="text-sm leading-relaxed text-yellow-700 sm:text-base dark:text-yellow-300">
                ⚠️ Some data couldn&apos;t be loaded. Showing available
                information.
              </p>
            </motion.div>
          )}

        {/* NXP Card - Show backend data */}
        {nxp ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NXPCard nxp={nxp} />
          </motion.div>
        ) : (
          nxpError && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

                {/* Animated Floating Blob */}
                {!reducedMotion && (
                  <motion.div
                    animate={{
                      x: [0, -15, 0],
                      y: [0, 10, 0],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
                  />
                )}

                <CardHeader className="relative p-4 sm:p-6">
                  <div className="mb-2 flex items-center gap-2 sm:gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2.5 shadow-lg backdrop-blur-sm sm:p-3"
                    >
                      <Award className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-base leading-tight font-bold text-transparent sm:text-lg md:text-xl">
                        NXP Information
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed sm:text-sm">
                        Novunt Experience Points
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative py-6 text-center sm:py-8">
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
                        <Award className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-50 sm:h-12 sm:w-12" />
                        <h3 className="mb-2 text-base leading-tight font-semibold sm:text-lg">
                          Coming Soon
                        </h3>
                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed sm:text-base">
                          The NXP system will be available soon.
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                          Earn experience points by unlocking badges, upgrading
                          ranks, and reaching milestones!
                        </p>
                      </>
                    ) : (
                      <>
                        <Award className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-50 sm:h-12 sm:w-12" />
                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed sm:text-base">
                          NXP data is currently unavailable.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchNXP()}
                          className="text-sm sm:text-base"
                        >
                          Retry
                        </Button>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )
        )}

        {/* Earned Badges Section */}
        {earnedBadges.length > 0 && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent" />

              {/* Animated Floating Blob */}
              {!reducedMotion && (
                <motion.div
                  animate={{
                    x: [0, -15, 0],
                    y: [0, 10, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
                />
              )}

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2.5 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Award className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-base leading-tight font-bold text-transparent sm:text-lg md:text-xl">
                      Your Badges
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed sm:text-sm">
                      {earnedBadges.length} badge
                      {earnedBadges.length !== 1 ? 's' : ''} earned
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
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
                      size="sm"
                      className="gap-1.5 text-sm sm:gap-2 sm:text-base"
                    >
                      {showAllBadges ? (
                        <>
                          Show Less
                          <ChevronDown className="h-4 w-4 rotate-180 sm:h-4 sm:w-4" />
                        </>
                      ) : (
                        <>
                          View More ({earnedBadges.length - INITIAL_BADGE_LIMIT}{' '}
                          more)
                          <ChevronDown className="h-4 w-4 sm:h-4 sm:w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Badge Catalog */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />

            {/* Animated Floating Blob */}
            {!reducedMotion && (
              <motion.div
                animate={{
                  x: [0, -15, 0],
                  y: [0, 10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
              />
            )}

            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-2.5 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Award className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-base leading-tight font-bold text-transparent sm:text-lg md:text-xl">
                    Badge Catalog
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed sm:text-sm">
                    Explore all available badges and track your progress
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
              <BadgeGrid
                earnedBadges={earnedBadges}
                badgeCatalog={badgeCatalog}
                badgeProgress={badgeProgress}
                onToggleDisplay={handleToggleDisplay}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* NXP History */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NXPHistory />
        </motion.div>
      </div>
    </div>
  );
}
