'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  CheckCircle,
  XCircle,
  Star,
  Shield,
  Target,
  Users,
  DollarSign,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  Award as Trophy,
  Circle,
  Lock,
} from 'lucide-react';
import { usePoolDistributions, useIncentiveWallet } from '@/lib/queries';
import { useRankProgressDetailed } from '@/lib/queries/rankProgressQueries';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  getPremiumPoolDownlineRequirement,
  formatPremiumPoolRequirement,
  correctPremiumPoolTask,
} from '@/lib/utils/premiumPoolUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { Progress } from '@/components/ui/progress';
import { prefersReducedMotion } from '@/lib/accessibility';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DistributionTypeFilter = 'all' | 'rank_pool' | 'redistribution_pool';

/**
 * Pools Page - Premium Design with Staking Streak Template
 * Integrates with detailed rank progress endpoint
 */
export default function PoolsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<DistributionTypeFilter>('all');
  const limit = 20;

  const distributionType = filter === 'all' ? undefined : filter;
  const { data: distributionsData, isLoading: distributionsLoading } =
    usePoolDistributions(page, limit, distributionType);
  const { data: incentiveWallet, isLoading: walletLoading } =
    useIncentiveWallet();
  const {
    data: rankProgressData,
    isLoading: rankLoading,
    error: rankError,
    refetch: refetchRank,
  } = useRankProgressDetailed();

  const isLoading = distributionsLoading || walletLoading || rankLoading;
  const reducedMotion = prefersReducedMotion();

  const distributions = distributionsData?.distributions || [];
  const pagination = distributionsData?.pagination;
  const totalEarnings = distributionsData?.totalEarnings || {
    rankPool: 0,
    redistributionPool: 0,
    total: 0,
  };

  // Extract rank progress data
  const rankData = rankProgressData;
  const currentRank = rankData?.current_rank || 'Stakeholder';
  const nextRank = rankData?.next_rank;
  const progressPercent =
    rankData?.progress_percent ?? rankData?.overall_progress_percent ?? 0;
  const premiumProgressPercent = rankData?.premium_progress_percent ?? 0;
  const requirements = rankData?.requirements;
  const poolQualification = rankData?.pool_qualification;
  const details = rankData?.details;

  // Debug: Log what backend is sending and what we're correcting (only in development)
  if (process.env.NODE_ENV === 'development') {
    if (details) {
      console.log('[PoolsPage] 🔍 Backend tasks:', {
        tasks_completed: details.tasks_completed,
        tasks_remaining: details.tasks_remaining,
        currentRank,
      });
      if (details.tasks_remaining.length > 0) {
        details.tasks_remaining.forEach((task, idx) => {
          const corrected = correctPremiumPoolTask(task, currentRank);
          if (task !== corrected) {
            console.log(`[PoolsPage] ✅ Corrected task ${idx}:`, {
              original: task,
              corrected,
            });
          }
        });
      }
    }
    if (requirements?.lower_rank_downlines) {
      const correctedDesc = getPremiumPoolDownlineRequirement(
        currentRank,
        requirements.lower_rank_downlines.description
      );
      console.log('[PoolsPage] 🔍 Lower rank downlines:', {
        backendDescription: requirements.lower_rank_downlines.description,
        correctedDescription: correctedDesc.description,
        stakeRequirement: correctedDesc.stakeRequirement,
        current: requirements.lower_rank_downlines.current,
        required: requirements.lower_rank_downlines.required,
        currentRank,
      });
    }
  }

  const isStakeholder = currentRank === 'Stakeholder';
  // Stakeholders can NEVER qualify for premium or performance pools
  // Qualification starts from Associate Stakeholder and above
  const performancePoolQualified = isStakeholder
    ? false
    : (poolQualification?.performance_pool?.is_qualified ?? false);
  const premiumPoolQualified = isStakeholder
    ? false
    : (poolQualification?.premium_pool?.is_qualified ?? false);

  const handleFilterChange = (newFilter: DistributionTypeFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
        <div className="space-y-4 sm:space-y-6">
          <LoadingStates.Card height="h-20" className="w-full" />
          <LoadingStates.Grid items={3} columns={3} className="gap-3 sm:gap-4 md:gap-6" />
          <LoadingStates.Card height="h-96" />
        </div>
      </div>
    );
  }

  if (rankError) {
    return (
      <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <XCircle className="text-destructive mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12" />
            <h3 className="mb-2 text-base font-semibold sm:text-lg">
              Failed to Load Rank Progress
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {rankError.message || 'Unable to fetch rank progress data'}
            </p>
            <Button onClick={() => refetchRank()}>Try Again</Button>
          </div>
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
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Trophy className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Rank & Pools
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Track your rank progression and pool earnings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Cards - Staking Streak Template (Mobile-first grid) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
          {/* Current Rank Card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />

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
                  className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-amber-500/30 blur-2xl"
                />
              )}

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Star className="h-5 w-5 text-amber-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Current Rank
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] sm:text-xs">
                      {nextRank ? `Next: ${nextRank}` : 'Highest rank achieved'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl">
                    {currentRank}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {performancePoolQualified && (
                      <Badge className="bg-blue-500 text-xs hover:bg-blue-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Performance Pool
                      </Badge>
                    )}
                    {premiumPoolQualified && (
                      <Badge className="bg-emerald-500 text-xs hover:bg-emerald-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Premium Pool
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {progressPercent}% progress to next rank
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Earnings Card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -4, scale: 1.01 }}
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
                    className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Gift className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Total Earnings
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] sm:text-xs">
                      From all pools
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                <div className="mb-2 flex w-full min-w-0 items-baseline gap-2 sm:mb-4 sm:gap-3">
                  <motion.span
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    key={totalEarnings.total}
                    className="overflow-visible bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {formatCurrency(totalEarnings.total)}
                  </motion.span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Performance Pool
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(totalEarnings.rankPool)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Premium Pool</span>
                    <span className="font-semibold">
                      {formatCurrency(totalEarnings.redistributionPool)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pool Qualification Status */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, scale: 1.01 }}
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
                    className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Trophy className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Pool Status
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] sm:text-xs">
                      Qualification overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                <div
                  className={`rounded-lg border-2 p-3 sm:p-4 ${
                    performancePoolQualified
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-slate-500/30 bg-slate-500/5'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    {performancePoolQualified ? (
                      <CheckCircle className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" />
                    ) : (
                      <XCircle className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs font-semibold sm:text-sm">
                      Performance Pool
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-xs">
                    {isStakeholder
                      ? 'Stakeholders are not eligible for Performance Pool. Qualification starts from Associate Stakeholder.'
                      : poolQualification?.performance_pool?.message ||
                        'Reach next rank to qualify'}
                  </p>
                </div>
                <div
                  className={`rounded-lg border-2 p-3 sm:p-4 ${
                    premiumPoolQualified
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-500/30 bg-slate-500/5'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    {premiumPoolQualified ? (
                      <CheckCircle className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                    ) : (
                      <XCircle className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs font-semibold sm:text-sm">
                      Premium Pool
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px] sm:text-xs">
                    {isStakeholder
                      ? 'Stakeholders are not eligible for Premium Pool. Qualification starts from Associate Stakeholder.'
                      : currentRank === 'Associate Stakeholder'
                        ? 'Requires 2 Stakeholder downlines with $50+ stake each'
                        : poolQualification?.premium_pool?.message ||
                          'Requires lower-rank downlines'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Rank & Qualification Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Overall Progress Card */}
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
                    className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Target className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      {!nextRank
                        ? `${currentRank} Progress`
                        : nextRank
                          ? `${nextRank} Progress`
                          : 'Rank Progress'}
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      {nextRank
                        ? `Progressing to ${nextRank}`
                        : "You've reached the highest rank!"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">
                      {!nextRank
                        ? `${currentRank} Progress`
                        : nextRank
                          ? `${nextRank} Progress`
                          : 'Performance Progress'}
                    </span>
                    <span className="font-semibold">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 sm:h-3" />
                </div>
                {!isStakeholder && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Premium Pool Qualification
                      </span>
                      <span className="font-semibold">
                        {premiumProgressPercent > 0
                          ? `${premiumProgressPercent}%`
                          : '0%'}
                      </span>
                    </div>
                    <Progress
                      value={premiumProgressPercent}
                      className="h-2 bg-emerald-500/20 sm:h-3"
                    />
                    {currentRank === 'Associate Stakeholder' &&
                      premiumProgressPercent < 100 && (
                        <p className="text-muted-foreground text-[10px] sm:text-xs">
                          Need 2 Stakeholder downlines with $50+ stake each
                        </p>
                      )}
                  </div>
                )}
                {isStakeholder && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Premium Pool Qualification
                      </span>
                      <span className="text-muted-foreground text-xs font-medium">
                        Not Eligible
                      </span>
                    </div>
                    <div className="bg-muted-foreground/10 h-2 rounded-full sm:h-3">
                      <div className="h-full w-full bg-[url('/assets/stripe-pattern.png')] opacity-10" />
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
                      <Lock className="h-3 w-3" /> Stakeholders are not eligible
                      for Premium Pool
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Requirements Breakdown */}
          {requirements && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />

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
                    className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-amber-500/30 blur-2xl"
                  />
                )}

                <CardHeader className="relative p-4 sm:p-6">
                  <div className="mb-2 flex items-center gap-2 sm:gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      className="rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                    >
                      <Award className="h-5 w-5 text-amber-500 sm:h-6 sm:w-6" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                        Rank Requirements
                      </CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">
                        Requirements for {nextRank || 'next rank'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                  <div className="space-y-4">
                    {/* Personal Stake */}
                    {requirements.personal_stake && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {requirements.personal_stake.is_met ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="text-muted-foreground h-5 w-5" />
                            )}
                            <div className="flex items-center gap-2">
                              <DollarSign className="text-muted-foreground h-4 w-4" />
                              <span className="font-medium">
                                Personal Stake
                              </span>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm">
                            {formatCurrency(
                              requirements.personal_stake.current
                            )}{' '}
                            /{' '}
                            {formatCurrency(
                              requirements.personal_stake.required
                            )}
                          </span>
                        </div>
                        <Progress
                          value={requirements.personal_stake.progress_percent}
                          className="h-2"
                        />
                        {requirements.personal_stake.remaining &&
                          requirements.personal_stake.remaining > 0 && (
                            <p className="text-muted-foreground text-[10px] sm:text-xs">
                              Need{' '}
                              {formatCurrency(
                                requirements.personal_stake.remaining
                              )}{' '}
                              more
                            </p>
                          )}
                      </div>
                    )}

                    {/* Team Stake */}
                    {requirements.team_stake && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {requirements.team_stake.is_met ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="text-muted-foreground h-5 w-5" />
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="text-muted-foreground h-4 w-4" />
                              <span className="font-medium">Team Stake</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="text-muted-foreground h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Includes all downline stakes across all
                                      levels
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm">
                            {formatCurrency(requirements.team_stake.current)} /{' '}
                            {formatCurrency(requirements.team_stake.required)}
                          </span>
                        </div>
                        <Progress
                          value={requirements.team_stake.progress_percent}
                          className="h-2"
                        />
                        {requirements.team_stake.remaining &&
                          requirements.team_stake.remaining > 0 && (
                            <p className="text-muted-foreground text-[10px] sm:text-xs">
                              Need{' '}
                              {formatCurrency(
                                requirements.team_stake.remaining
                              )}{' '}
                              more
                            </p>
                          )}
                      </div>
                    )}

                    {/* Direct Downlines */}
                    {requirements.direct_downlines && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {requirements.direct_downlines.is_met ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="text-muted-foreground h-5 w-5" />
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="text-muted-foreground h-4 w-4" />
                              <span className="font-medium">
                                Direct Downlines
                              </span>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm">
                            {requirements.direct_downlines.current} /{' '}
                            {requirements.direct_downlines.required}
                          </span>
                        </div>
                        <Progress
                          value={requirements.direct_downlines.progress_percent}
                          className="h-2"
                        />
                        {requirements.direct_downlines.remaining &&
                          requirements.direct_downlines.remaining > 0 && (
                            <p className="text-muted-foreground text-[10px] sm:text-xs">
                              Need {requirements.direct_downlines.remaining}{' '}
                              more direct referrals
                            </p>
                          )}
                      </div>
                    )}

                    {/* Lower Rank Downlines - Premium Pool Requirement */}
                    {requirements.lower_rank_downlines && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {requirements.lower_rank_downlines.is_met ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="text-muted-foreground h-5 w-5" />
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Shield className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">
                                  {
                                    getPremiumPoolDownlineRequirement(
                                      currentRank,
                                      requirements.lower_rank_downlines
                                        .description
                                    ).description
                                  }
                                </span>
                              </div>
                              {/* Show stake requirement for Associate Stakeholder */}
                              {currentRank === 'Associate Stakeholder' && (
                                <p className="text-muted-foreground ml-6 text-xs">
                                  Each must have $50+ stake (Premium Pool
                                  requirement)
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm">
                            {requirements.lower_rank_downlines.current} /{' '}
                            {requirements.lower_rank_downlines.required}
                          </span>
                        </div>
                        <Progress
                          value={
                            requirements.lower_rank_downlines.progress_percent
                          }
                          className="h-2"
                        />
                        {requirements.lower_rank_downlines.remaining &&
                          requirements.lower_rank_downlines.remaining > 0 && (
                            <p className="text-muted-foreground text-[10px] sm:text-xs">
                              {formatPremiumPoolRequirement(
                                currentRank,
                                requirements.lower_rank_downlines.current,
                                requirements.lower_rank_downlines.required,
                                requirements.lower_rank_downlines.description
                              )}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tasks Summary */}
          {details &&
            (details.tasks_completed.length > 0 ||
              details.tasks_remaining.length > 0) && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
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
                        className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                      >
                        <Star className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                          Progress Summary
                        </CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">
                          Completed and remaining tasks
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      {details.tasks_completed.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-emerald-500 sm:text-sm">
                            Completed Tasks
                          </h4>
                          <ul className="space-y-1 text-xs sm:text-sm">
                            {details.tasks_completed.map((task, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
                                <span className="text-muted-foreground">
                                  {correctPremiumPoolTask(task, currentRank)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {details.tasks_remaining.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-orange-500 sm:text-sm">
                            Remaining Tasks
                          </h4>
                          <ul className="space-y-1 text-xs sm:text-sm">
                            {details.tasks_remaining.map((task, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Circle className="text-muted-foreground mt-0.5 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span className="text-muted-foreground">
                                  {correctPremiumPoolTask(task, currentRank)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          {/* Distribution History */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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
                    className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Gift className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Distribution History
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Your pool distribution earnings history
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'rank_pool' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('rank_pool')}
                  >
                    Performance
                  </Button>
                  <Button
                    variant={
                      filter === 'redistribution_pool' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleFilterChange('redistribution_pool')}
                  >
                    Premium
                  </Button>
                </div>

                {distributions.length > 0 ? (
                  <div className="space-y-3">
                    {distributions.map((distribution, index) => (
                      <motion.div
                        key={distribution._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="bg-background/50 hover:bg-background/70 flex flex-col gap-3 rounded-lg border border-slate-500/20 p-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
                      >
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                          <div
                            className={`flex-shrink-0 rounded-lg p-1.5 sm:p-2 ${
                              distribution.verificationIcon === 'blue'
                                ? 'bg-blue-500/20'
                                : distribution.verificationIcon === 'green'
                                  ? 'bg-emerald-500/20'
                                  : 'bg-red-500/20'
                            }`}
                          >
                            {distribution.isQualified ? (
                              <CheckCircle
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                  distribution.verificationIcon === 'blue'
                                    ? 'text-blue-400'
                                    : distribution.verificationIcon === 'green'
                                      ? 'text-emerald-400'
                                      : 'text-red-400'
                                }`}
                              />
                            ) : (
                              <XCircle className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold sm:text-sm">
                                {distribution.distributionType === 'rank_pool'
                                  ? 'Performance Pool'
                                  : 'Premium Pool'}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] sm:text-xs"
                              >
                                {distribution.rankName}
                              </Badge>
                              {distribution.isQualified && (
                                <Badge
                                  variant="default"
                                  className="bg-emerald-500 text-[10px] sm:text-xs"
                                >
                                  Qualified
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm">
                              <span>
                                Period:{' '}
                                {formatDate(
                                  new Date(distribution.distributionPeriod)
                                )}
                              </span>
                              <span>
                                Share:{' '}
                                {(distribution.userShare * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start">
                          <p className="text-base font-bold text-emerald-400 sm:text-lg">
                            +{formatCurrency(distribution.bonusAmount)}
                          </p>
                          <p className="text-muted-foreground text-[10px] sm:text-right sm:text-xs">
                            {formatDate(new Date(distribution.createdAt))}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center sm:py-12">
                    <Gift className="text-muted-foreground mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                    <h3 className="mb-2 text-base font-semibold sm:text-lg">
                      No Distributions Yet
                    </h3>
                    <p className="text-muted-foreground mb-4 text-xs sm:mb-6 sm:text-sm">
                      {filter === 'all'
                        ? "You haven't received any pool distributions yet. Distributions happen weekly on Mondays."
                        : `No ${filter === 'rank_pool' ? 'Performance' : 'Premium'} Pool distributions yet.`}
                    </p>
                    {!incentiveWallet?.qualificationStatus
                      .performancePoolQualified &&
                      !incentiveWallet?.qualificationStatus
                        .premiumPoolQualified && (
                        <Button>View Rank Requirements Above</Button>
                      )}
                  </div>
                )}

                {/* Pagination - Wallet Style */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, pagination.total)} of{' '}
                      {pagination.total} distributions
                    </p>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 text-xs sm:h-9 sm:text-sm"
                      >
                        <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <span className="bg-muted flex items-center rounded-md px-2 text-xs sm:px-4 sm:text-sm">
                        Page {page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        disabled={page >= pagination.totalPages}
                        className="h-8 text-xs sm:h-9 sm:text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
