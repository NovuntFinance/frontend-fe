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
  ChevronRight,
  Info,
  Award as Trophy,
  Star as Sparkles,
  Circle,
  Lock,
} from 'lucide-react';
import { usePoolDistributions, useIncentiveWallet } from '@/lib/queries';
import { useRankProgressDetailed } from '@/lib/queries/rankProgressQueries';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  getPremiumPoolDownlineRequirement,
  formatPremiumPoolRequirement,
  formatPremiumPoolTask,
  correctPremiumPoolTask,
} from '@/lib/utils/premiumPoolUtils';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerCard } from '@/components/ui/shimmer';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DistributionTypeFilter = 'all' | 'rank_pool' | 'redistribution_pool';

/**
 * Pools Page - Premium Design with NovuntPremiumCard
 * Integrates with detailed rank progress endpoint
 */
export default function PoolsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<DistributionTypeFilter>('all');
  const [activeTab, setActiveTab] = useState<'rank'>('rank');
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
      <div className="space-y-6">
        <ShimmerCard className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <ShimmerCard className="h-40" />
          <ShimmerCard className="h-40" />
          <ShimmerCard className="h-40" />
        </div>
        <ShimmerCard className="h-96" />
      </div>
    );
  }

  if (rankError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            Failed to Load Rank Progress
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {rankError.message || 'Unable to fetch rank progress data'}
          </p>
          <Button onClick={() => refetchRank()}>Try Again</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Rank & Pools</h1>
          <p className="text-muted-foreground mt-1">
            Track your rank progression and pool earnings
          </p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="border-border flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('rank')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'rank'
              ? 'text-primary border-primary border-b-2'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rank & Qualification
        </button>
      </div>

      {/* Stats Cards - Premium Design */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NovuntPremiumCard
            title="Current Rank"
            subtitle={nextRank ? `Next: ${nextRank}` : 'Highest rank achieved'}
            icon={Star}
            colorTheme="orange"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">{currentRank}</span>
                {performancePoolQualified && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Performance Pool
                  </Badge>
                )}
                {premiumPoolQualified && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Premium Pool
                  </Badge>
                )}
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-muted-foreground text-sm">
                {progressPercent}% progress to next rank
              </p>
            </div>
          </NovuntPremiumCard>
        </motion.div>

        {/* Total Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NovuntPremiumCard
            title="Total Earnings"
            subtitle="From all pools"
            icon={Gift}
            colorTheme="emerald"
          >
            <div className="space-y-4">
              <div>
                <span className="text-4xl font-bold">
                  {formatCurrency(totalEarnings.total)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
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
            </div>
          </NovuntPremiumCard>
        </motion.div>

        {/* Pool Qualification Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <NovuntPremiumCard
            title="Pool Status"
            subtitle="Qualification overview"
            icon={Trophy}
            colorTheme="purple"
          >
            <div className="space-y-3">
              <div
                className={`rounded-lg border-2 p-3 ${
                  performancePoolQualified
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-500/30 bg-slate-500/5'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  {performancePoolQualified ? (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <XCircle className="text-muted-foreground h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    Performance Pool
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {isStakeholder
                    ? 'Stakeholders are not eligible for Performance Pool. Qualification starts from Associate Stakeholder.'
                    : poolQualification?.performance_pool?.message ||
                      'Reach next rank to qualify'}
                </p>
              </div>
              <div
                className={`rounded-lg border-2 p-3 ${
                  premiumPoolQualified
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-slate-500/30 bg-slate-500/5'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  {premiumPoolQualified ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="text-muted-foreground h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">Premium Pool</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {isStakeholder
                    ? 'Stakeholders are not eligible for Premium Pool. Qualification starts from Associate Stakeholder.'
                    : currentRank === 'Associate Stakeholder'
                      ? 'Requires 2 Stakeholder downlines with $50+ stake each'
                      : poolQualification?.premium_pool?.message ||
                        'Requires lower-rank downlines'}
                </p>
              </div>
            </div>
          </NovuntPremiumCard>
        </motion.div>
      </div>

      {/* Rank & Qualification Tab Content */}
      {activeTab === 'rank' && (
        <div className="space-y-6">
          {/* Overall Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <NovuntPremiumCard
              title={
                !nextRank
                  ? `${currentRank} Progress`
                  : nextRank
                    ? `${nextRank} Progress`
                    : 'Rank Progress'
              }
              subtitle={
                nextRank
                  ? `Progressing to ${nextRank}`
                  : "You've reached the highest rank!"
              }
              icon={Target}
              colorTheme="blue"
              tooltip="Your overall progress toward the next rank based on all requirements"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {!nextRank
                        ? `${currentRank} Progress`
                        : nextRank
                          ? `${nextRank} Progress`
                          : 'Performance Progress'}
                    </span>
                    <span className="font-semibold">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
                {!isStakeholder && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
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
                      className="h-3 bg-emerald-500/20"
                    />
                    {currentRank === 'Associate Stakeholder' &&
                      premiumProgressPercent < 100 && (
                        <p className="text-muted-foreground text-xs">
                          Need 2 Stakeholder downlines with $50+ stake each
                        </p>
                      )}
                  </div>
                )}
                {isStakeholder && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Premium Pool Qualification
                      </span>
                      <span className="text-muted-foreground text-xs font-medium">
                        Not Eligible
                      </span>
                    </div>
                    <div className="bg-muted-foreground/10 h-3 rounded-full">
                      <div className="h-full w-full bg-[url('/assets/stripe-pattern.png')] opacity-10" />
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Lock className="h-3 w-3" /> Stakeholders are not eligible
                      for Premium Pool
                    </p>
                  </div>
                )}
              </div>
            </NovuntPremiumCard>
          </motion.div>

          {/* Requirements Breakdown */}
          {requirements && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <NovuntPremiumCard
                title="Rank Requirements"
                subtitle={`Requirements for ${nextRank || 'next rank'}`}
                icon={Award}
                colorTheme="orange"
              >
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
                            <span className="font-medium">Personal Stake</span>
                          </div>
                        </div>
                        <span className="text-sm">
                          {formatCurrency(requirements.personal_stake.current)}{' '}
                          /{' '}
                          {formatCurrency(requirements.personal_stake.required)}
                        </span>
                      </div>
                      <Progress
                        value={requirements.personal_stake.progress_percent}
                        className="h-2"
                      />
                      {requirements.personal_stake.remaining &&
                        requirements.personal_stake.remaining > 0 && (
                          <p className="text-muted-foreground text-xs">
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
                        <span className="text-sm">
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
                          <p className="text-muted-foreground text-xs">
                            Need{' '}
                            {formatCurrency(requirements.team_stake.remaining)}{' '}
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
                        <span className="text-sm">
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
                          <p className="text-muted-foreground text-xs">
                            Need {requirements.direct_downlines.remaining} more
                            direct referrals
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
                        <span className="text-sm">
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
                          <p className="text-muted-foreground text-xs">
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
              </NovuntPremiumCard>
            </motion.div>
          )}

          {/* Tasks Summary */}
          {details &&
            (details.tasks_completed.length > 0 ||
              details.tasks_remaining.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <NovuntPremiumCard
                  title="Progress Summary"
                  subtitle="Completed and remaining tasks"
                  icon={Star}
                  colorTheme="emerald"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {details.tasks_completed.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-emerald-500">
                          Completed Tasks
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {details.tasks_completed.map((task, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
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
                        <h4 className="text-sm font-semibold text-orange-500">
                          Remaining Tasks
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {details.tasks_remaining.map((task, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Circle className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {correctPremiumPoolTask(task, currentRank)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </NovuntPremiumCard>
              </motion.div>
            )}

          {/* Distribution History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <NovuntPremiumCard
              title="Distribution History"
              subtitle="Your pool distribution earnings history"
              icon={Gift}
              colorTheme="purple"
            >
              <div className="space-y-4">
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
                        className="bg-background/50 hover:bg-background/70 flex items-center justify-between rounded-lg border border-slate-500/20 p-4 transition-colors"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <div
                            className={`rounded-lg p-2 ${
                              distribution.verificationIcon === 'blue'
                                ? 'bg-blue-500/20'
                                : distribution.verificationIcon === 'green'
                                  ? 'bg-emerald-500/20'
                                  : 'bg-red-500/20'
                            }`}
                          >
                            {distribution.isQualified ? (
                              <CheckCircle
                                className={`h-5 w-5 ${
                                  distribution.verificationIcon === 'blue'
                                    ? 'text-blue-400'
                                    : distribution.verificationIcon === 'green'
                                      ? 'text-emerald-400'
                                      : 'text-red-400'
                                }`}
                              />
                            ) : (
                              <XCircle className="text-muted-foreground h-5 w-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-semibold text-white">
                                {distribution.distributionType === 'rank_pool'
                                  ? 'Performance Pool'
                                  : 'Premium Pool'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {distribution.rankName}
                              </Badge>
                              {distribution.isQualified && (
                                <Badge
                                  variant="default"
                                  className="bg-emerald-500 text-xs"
                                >
                                  Qualified
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-4 text-sm">
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

                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-400">
                            +{formatCurrency(distribution.bonusAmount)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(new Date(distribution.createdAt))}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Gift className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Distributions Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
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

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-500/20 pt-4">
                    <div className="text-muted-foreground text-sm">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, pagination.total)} of{' '}
                      {pagination.total} distributions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        disabled={page >= pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </NovuntPremiumCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}
