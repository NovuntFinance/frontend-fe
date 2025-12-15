/**
 * Rank Progress Card Component
 * Displays dual rank progress (Performance & Premium) with regression logic
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  Shield,
  Lock,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShimmerCard } from '@/components/ui/shimmer';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useRankProgressLightweight,
  useRankProgressDetailed,
} from '@/lib/queries/rankProgressQueries';
import { cn } from '@/lib/utils';
import type { Requirement } from '@/types/rankProgress';
import { getPremiumPoolDownlineRequirement } from '@/lib/utils/premiumPoolUtils';

/**
 * Main Rank Progress Card
 */
export function RankProgressCard() {
  // Use lightweight endpoint for dashboard (fast loading < 100ms)
  const { data, isLoading, error } = useRankProgressLightweight();

  // Hybrid approach: Fetch detailed endpoint separately for Premium Pool progress
  // This keeps dashboard fast while still showing Premium Pool progress
  // The detailed query runs in background and doesn't block the UI
  const { data: detailedData } = useRankProgressDetailed();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [prevProgress, setPrevProgress] = React.useState<{
    performance: number;
    premium: number;
  } | null>(null);

  // Track progress changes for regression badge
  React.useEffect(() => {
    if (data) {
      // Use overall_progress_percent if available (detailed), otherwise use progress_percent (lightweight)
      const performanceProgress =
        data.overall_progress_percent ?? data.progress_percent ?? 0;

      // Get Premium Pool progress from detailed endpoint (hybrid approach)
      // Use detailed data if available, otherwise fallback to lightweight calculation
      let premiumProgress = 0;
      const isStakeholder = data.current_rank === 'Stakeholder';

      if (!isStakeholder && detailedData) {
        // Use premium_progress_percent from detailed endpoint
        premiumProgress = detailedData.premium_progress_percent ?? 0;

        // Fallback: Calculate from lower_rank_downlines if premium_progress_percent is 0 or missing
        if (
          premiumProgress === 0 &&
          detailedData.requirements?.lower_rank_downlines
        ) {
          const { current = 0, required = 0 } =
            detailedData.requirements.lower_rank_downlines;
          if (required > 0) {
            premiumProgress = Math.min(
              100,
              Math.round((current / required) * 100)
            );
          }
        }
      }

      const newProgress = {
        performance: performanceProgress,
        premium: premiumProgress,
      };

      if (prevProgress === null) {
        setPrevProgress(newProgress);
      } else {
        // Only update prevProgress if it changes, to avoid loops
        if (
          newProgress.performance !== prevProgress.performance ||
          newProgress.premium !== prevProgress.premium
        ) {
          setPrevProgress(newProgress);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Show loading skeleton while lightweight data loads (fast, < 100ms)
  if (isLoading) {
    return <RankProgressSkeleton />;
  }

  if (error) {
    return <RankProgressError error={error.message} />;
  }

  if (!data) {
    return null;
  }

  const {
    current_rank,
    current_rank_icon,
    next_rank,
    next_rank_icon,
    progress_percent,
    overall_progress_percent,
    requirements,
    pool_qualification,
  } = data;

  // Get Premium Pool data from detailed endpoint (hybrid approach)
  // Use detailed data for Premium Pool progress, lightweight data for everything else
  const premiumProgressFromDetailed = detailedData?.premium_progress_percent;
  const detailedRequirements = detailedData?.requirements;
  const detailedPoolQualification = detailedData?.pool_qualification;

  const isMaxRank = next_rank === null;
  const isStakeholder = current_rank === 'Stakeholder';

  // Use overall_progress_percent if available (detailed), otherwise use progress_percent (lightweight)
  const performanceProgress = overall_progress_percent ?? progress_percent ?? 0;

  // Calculate Premium Pool progress from detailed endpoint (hybrid approach)
  let premiumProgress = 0;

  if (!isStakeholder) {
    // Priority 1: Use premium_progress_percent from detailed endpoint
    if (
      premiumProgressFromDetailed !== undefined &&
      premiumProgressFromDetailed !== null
    ) {
      premiumProgress = premiumProgressFromDetailed;
    }
    // Priority 2: Calculate from lower_rank_downlines in detailed endpoint
    else if (detailedRequirements?.lower_rank_downlines) {
      const { current = 0, required = 0 } =
        detailedRequirements.lower_rank_downlines;
      if (required > 0) {
        premiumProgress = Math.min(100, Math.round((current / required) * 100));
      }
    }
    // Priority 3: Fallback to lightweight requirements (may not have lower_rank_downlines)
    else if (requirements?.lower_rank_downlines) {
      const { current = 0, required = 0 } = requirements.lower_rank_downlines;
      if (required > 0) {
        premiumProgress = Math.min(100, Math.round((current / required) * 100));
      }
    }
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && !isStakeholder) {
    console.log(
      '[RankProgressCard] 🔍 Premium Pool Progress (Hybrid Approach):',
      {
        current_rank,
        lightweight_loaded: !!data,
        detailed_loaded: !!detailedData,
        detailed_premium_progress_percent: premiumProgressFromDetailed,
        calculated_premiumProgress: premiumProgress,
        detailed_lower_rank_downlines:
          detailedRequirements?.lower_rank_downlines
            ? {
                current: detailedRequirements.lower_rank_downlines.current,
                required: detailedRequirements.lower_rank_downlines.required,
                description:
                  detailedRequirements.lower_rank_downlines.description,
              }
            : null,
        pool_qualification: detailedPoolQualification?.premium_pool
          ? {
              is_qualified: detailedPoolQualification.premium_pool.is_qualified,
              message: detailedPoolQualification.premium_pool.message,
            }
          : null,
      }
    );
  }

  // Check for regression (must happen after premiumProgress is calculated)
  const performanceDecreased =
    prevProgress && performanceProgress < prevProgress.performance;
  const premiumDecreased =
    prevProgress && premiumProgress < prevProgress.premium;

  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent" />

      {/* Animated Floating Blob */}
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

      <CardHeader className="relative p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
            >
              <Target className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                  {isMaxRank
                    ? `${current_rank} Progress`
                    : next_rank
                      ? `${next_rank} Progress`
                      : 'Rank Progress'}
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-3.5 w-3.5 cursor-help sm:h-4 sm:w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Track your journey through the ranks. Progress is based
                        on active stakes and team performance.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription className="text-[10px] sm:text-xs">
                {isMaxRank
                  ? 'Highest rank achieved!'
                  : next_rank
                    ? `Progressing to ${next_rank}`
                    : 'Your journey to the next level'}
              </CardDescription>
            </div>
          </div>
          {!isMaxRank && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 text-xs sm:text-sm"
            >
              {isExpanded ? 'Hide' : 'Details'}
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Current & Next Rank with Icons - Responsive Layout */}
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
            {/* Current Rank - Prominent */}
            <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              <div className="relative">
                {current_rank_icon ? (
                  <motion.img
                    src={current_rank_icon}
                    alt={current_rank}
                    className="h-20 w-20 object-contain drop-shadow-xl"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: 'easeInOut',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 shadow-xl">
                    <span className="text-3xl">🏆</span>
                  </div>
                )}
                <div className="bg-background/80 border-border absolute -right-2 -bottom-2 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-sm">
                  Current
                </div>
              </div>
              <div>
                <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                  {current_rank}
                </p>
              </div>
            </div>

            {!isMaxRank && (
              <>
                {/* Arrow Indicator */}
                <div className="text-muted-foreground/50 hidden flex-col items-center gap-1 md:flex">
                  <span className="text-xs tracking-widest uppercase">
                    Progress
                  </span>
                  <TrendingUp className="h-6 w-6" />
                </div>

                {/* Next Rank - Target */}
                <div className="flex flex-col items-center gap-3 text-center opacity-80 transition-opacity hover:opacity-100 md:items-end md:text-right">
                  <div className="relative">
                    {next_rank_icon ? (
                      <motion.img
                        src={next_rank_icon}
                        alt={next_rank}
                        className="h-14 w-14 object-contain opacity-70 grayscale-[30%]"
                        whileHover={{
                          scale: 1.05,
                          opacity: 1,
                          filter: 'grayscale(0%)',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 opacity-60 shadow-lg">
                        <span className="text-2xl">💎</span>
                      </div>
                    )}
                    <div className="bg-muted/80 border-border absolute -bottom-2 -left-2 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-sm md:-right-2 md:left-auto">
                      Next
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-lg font-bold">
                      {next_rank}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dual Progress Bars - Stacked Vertically */}
          {!isMaxRank && (
            <div className="space-y-6">
              {/* Bar A: Performance Rank (Blue Theme) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-500/10 p-1">
                      <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-foreground font-medium">
                      {isMaxRank
                        ? `${current_rank} Progress`
                        : next_rank
                          ? `${next_rank} Progress`
                          : 'Performance Progress'}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="text-muted-foreground/60 h-3.5 w-3.5 transition-colors hover:text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="mb-1 font-semibold">
                            Performance Calculation:
                          </p>
                          <ul className="list-disc space-y-1 pl-4 text-xs">
                            <li>Personal Stake (1x weight)</li>
                            <li>Team Stake (7x weight)</li>
                            <li>Direct Downlines (2x weight)</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    {performanceDecreased && (
                      <Badge
                        variant="destructive"
                        className="animate-pulse gap-1 text-xs"
                      >
                        <TrendingDown className="h-3 w-3" />
                        Decreased
                      </Badge>
                    )}
                    <span
                      className={cn(
                        'font-bold',
                        performanceDecreased
                          ? 'text-red-500'
                          : 'text-blue-600 dark:text-blue-400'
                      )}
                    >
                      {performanceProgress}%
                    </span>
                  </div>
                </div>
                <div className="bg-muted relative h-3 overflow-hidden rounded-full">
                  <motion.div
                    animate={{ width: `${performanceProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className={cn(
                      'h-full rounded-full shadow-lg transition-colors duration-500',
                      performanceDecreased
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500'
                    )}
                  />
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      duration: 2.5,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                </div>
              </div>

              {/* Bar B: Premium Rank (Green Theme) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-500/10 p-1">
                      <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-foreground font-medium">
                      Premium Pool Qualification
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="text-muted-foreground/60 h-3.5 w-3.5 transition-colors hover:text-emerald-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="mb-1 font-semibold">Premium Pool:</p>
                          <p className="text-xs">
                            {current_rank === 'Associate Stakeholder' ? (
                              <>
                                Requires 2 <strong>Stakeholder</strong>{' '}
                                downlines with <strong>$50+ stake each</strong>.
                                You can lose this qualification if downlines
                                become inactive or their stake drops below $50.
                              </>
                            ) : (
                              <>
                                Requires maintaining active downlines at
                                specific ranks. You can lose this qualification
                                if downlines become inactive.
                              </>
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    {premiumDecreased && (
                      <Badge
                        variant="destructive"
                        className="animate-pulse gap-1 text-xs"
                      >
                        <TrendingDown className="h-3 w-3" />
                        Decreased
                      </Badge>
                    )}
                    {isStakeholder ? (
                      <span className="text-muted-foreground text-xs font-medium">
                        Not Eligible
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'font-bold',
                          premiumDecreased
                            ? 'text-red-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {premiumProgress}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-muted relative h-3 overflow-hidden rounded-full">
                  {isStakeholder ? (
                    <div className="bg-muted-foreground/10 flex h-full w-full items-center justify-center">
                      <div className="h-full w-full bg-[url('/assets/stripe-pattern.png')] opacity-10" />
                    </div>
                  ) : (
                    <>
                      <motion.div
                        animate={{ width: `${premiumProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className={cn(
                          'h-full rounded-full shadow-lg transition-colors duration-500',
                          premiumDecreased
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : premiumProgress > 0
                              ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500'
                              : 'bg-gradient-to-r from-emerald-500/30 via-emerald-400/30 to-teal-500/30'
                        )}
                      />
                      {/* Shimmer effect - only show when there's progress */}
                      {premiumProgress > 0 && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{
                            duration: 2.5,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
                {isStakeholder && (
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Lock className="h-3 w-3" /> Stakeholders are not eligible
                    for Premium Pool
                  </p>
                )}
                {!isStakeholder &&
                  premiumProgress < 100 &&
                  current_rank === 'Associate Stakeholder' && (
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      Need 2 Stakeholder downlines with $50+ stake each
                    </p>
                  )}
                {!isStakeholder &&
                  premiumProgress === 0 &&
                  current_rank !== 'Associate Stakeholder' &&
                  !detailedData && (
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      Loading Premium Pool progress...
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Max Rank Celebration */}
          {isMaxRank && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-transparent p-6 text-center"
            >
              <div className="mb-3 flex justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <h3 className="mb-1 text-lg font-bold">Congratulations!</h3>
              <p className="text-muted-foreground text-sm">
                You’ve reached the highest rank: <strong>{current_rank}</strong>
              </p>
            </motion.div>
          )}

          {/* Collapsible Details Section */}
          <AnimatePresence>
            {isExpanded && !isMaxRank && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="border-border/50 mt-2 space-y-6 border-t pt-6">
                  {/* Requirements */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                      <Star className="h-4 w-4 text-orange-500" />
                      Requirements
                    </h4>
                    <div className="space-y-2.5">
                      {requirements?.personal_stake && (
                        <RequirementItem
                          icon={DollarSign}
                          title="Personal Stake"
                          requirement={requirements.personal_stake}
                          unit="$"
                        />
                      )}
                      {requirements?.team_stake && (
                        <RequirementItem
                          icon={Users}
                          title="Team Stake"
                          requirement={requirements.team_stake}
                          unit="$"
                        />
                      )}
                      {requirements?.direct_downlines && (
                        <RequirementItem
                          icon={Users}
                          title="Direct Downlines"
                          requirement={requirements.direct_downlines}
                        />
                      )}
                      {/* Use detailed requirements if available, otherwise fallback to lightweight */}
                      {((detailedRequirements?.lower_rank_downlines &&
                        detailedRequirements.lower_rank_downlines.required &&
                        detailedRequirements.lower_rank_downlines.required >
                          0) ||
                        (requirements?.lower_rank_downlines &&
                          requirements.lower_rank_downlines.required &&
                          requirements.lower_rank_downlines.required > 0)) && (
                        <div className="space-y-1">
                          <RequirementItem
                            icon={TrendingUp}
                            title={
                              getPremiumPoolDownlineRequirement(
                                current_rank,
                                detailedRequirements?.lower_rank_downlines
                                  ?.description ||
                                  requirements?.lower_rank_downlines
                                    ?.description
                              ).description
                            }
                            requirement={
                              detailedRequirements?.lower_rank_downlines ||
                              requirements?.lower_rank_downlines || {
                                current: 0,
                                required: 0,
                                progress_percent: 0,
                                is_met: false,
                              }
                            }
                          />
                          {/* Show stake requirement for Associate Stakeholder */}
                          {current_rank === 'Associate Stakeholder' && (
                            <p className="text-muted-foreground ml-11 text-xs">
                              Each must have $50+ stake (Premium Pool
                              requirement)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pool Qualifications - Use detailed data if available, otherwise lightweight */}
                  {(detailedPoolQualification || pool_qualification) && (
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-semibold">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Pool Qualifications
                      </h4>
                      <div className="grid gap-3">
                        {(detailedPoolQualification?.performance_pool ||
                          pool_qualification?.performance_pool) && (
                          <PoolBadge
                            title="Performance Pool"
                            isQualified={
                              isStakeholder
                                ? false
                                : (detailedPoolQualification?.performance_pool
                                    ?.is_qualified ??
                                  pool_qualification?.performance_pool
                                    ?.is_qualified ??
                                  false)
                            }
                            message={
                              isStakeholder
                                ? 'Stakeholders are not eligible for Performance Pool. Qualification starts from Associate Stakeholder.'
                                : detailedPoolQualification?.performance_pool
                                    ?.message ||
                                  pool_qualification?.performance_pool
                                    ?.message ||
                                  'Reach next rank to qualify'
                            }
                            type="performance"
                            isStakeholder={isStakeholder}
                          />
                        )}
                        {(detailedPoolQualification?.premium_pool ||
                          pool_qualification?.premium_pool) && (
                          <PoolBadge
                            title="Premium Pool"
                            isQualified={
                              isStakeholder
                                ? false
                                : (detailedPoolQualification?.premium_pool
                                    ?.is_qualified ??
                                  pool_qualification?.premium_pool
                                    ?.is_qualified ??
                                  false)
                            }
                            message={
                              isStakeholder
                                ? 'Stakeholders are not eligible for Premium Pool. Qualification starts from Associate Stakeholder.'
                                : current_rank === 'Associate Stakeholder'
                                  ? 'Requires 2 Stakeholder downlines with $50+ stake each'
                                  : detailedPoolQualification?.premium_pool
                                      ?.message ||
                                    pool_qualification?.premium_pool?.message ||
                                    'Requires lower-rank downlines'
                            }
                            type="premium"
                            isStakeholder={isStakeholder}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Requirement Item Component
 */
function RequirementItem({
  icon: Icon,
  title,
  requirement,
  unit = '',
}: {
  icon: React.ElementType;
  title: string;
  requirement: Requirement;
  unit?: string;
}) {
  // Backend now always provides is_met field (both lightweight and detailed endpoints)
  const { current = 0, required = 0, is_met } = requirement;
  // Fallback calculation for backward compatibility (backend should always provide is_met)
  const isMet = is_met ?? current >= required;

  // Safety check - if requirement is invalid, don't render
  if (!requirement || required === undefined) {
    return null;
  }

  return (
    <div className="bg-muted/50 border-border/50 hover:bg-muted/80 flex items-center gap-3 rounded-lg border p-3 transition-colors">
      <div
        className={cn(
          'rounded-lg p-2',
          isMet
            ? 'bg-green-500/10 text-green-600 dark:text-green-500'
            : 'bg-muted'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="truncate text-sm font-medium">{title}</span>
          {isMet ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
          ) : (
            <Circle className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          )}
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {unit}
            {current.toLocaleString()} / {unit}
            {required.toLocaleString()}
          </span>
          <span
            className={
              isMet ? 'font-medium text-green-600 dark:text-green-500' : ''
            }
          >
            {isMet ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Pool Qualification Badge
 */
function PoolBadge({
  title,
  isQualified,
  message,
  type,
  isStakeholder = false,
}: {
  title: string;
  isQualified: boolean;
  message: string;
  type: 'performance' | 'premium';
  isStakeholder?: boolean;
}) {
  const isPerformance = type === 'performance';
  const activeColorClass = isPerformance
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-green-600 dark:text-green-400';
  const activeBgClass = isPerformance
    ? 'bg-blue-500/10 border-blue-500/20'
    : 'bg-green-500/10 border-green-500/20';
  const activeBadgeClass = isPerformance
    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
    : 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 transition-all',
        isQualified ? activeBgClass : 'bg-muted/30 border-border/50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isStakeholder ? (
            <Lock className="text-muted-foreground h-4 w-4" />
          ) : isQualified ? (
            <CheckCircle2 className={cn('h-4 w-4', activeColorClass)} />
          ) : (
            <Circle className="text-muted-foreground h-4 w-4" />
          )}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Badge
          variant={isQualified ? 'default' : 'secondary'}
          className={cn('text-xs', isQualified && activeBadgeClass)}
        >
          {isStakeholder
            ? 'Not Eligible'
            : isQualified
              ? 'Qualified'
              : 'Not Qualified'}
        </Badge>
      </div>
      <p className="text-muted-foreground pl-6 text-xs">{message}</p>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function RankProgressSkeleton() {
  return <ShimmerCard className="h-full" />;
}

/**
 * Error State
 */
function RankProgressError({ error }: { error: string }) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Failed to load rank progress</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Default export for Next.js/Turbopack compatibility
export default RankProgressCard;
