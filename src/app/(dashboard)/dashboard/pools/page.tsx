'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react';
import {
  usePoolDistributions,
  useIncentiveWallet,
  useRankInfo,
  useNextRankRequirements,
  useCalculateRank,
} from '@/lib/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

type DistributionTypeFilter = 'all' | 'rank_pool' | 'redistribution_pool';

/**
 * Pools Page (Merged: Rank + Pools)
 * Premium dark card design matching dashboard style
 */
export default function PoolsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<DistributionTypeFilter>('all');
  const [activeTab, setActiveTab] = useState<'rank' | 'pools'>('rank');
  const limit = 20;

  const distributionType = filter === 'all' ? undefined : filter;
  const { data: distributionsData, isLoading: distributionsLoading } =
    usePoolDistributions(page, limit, distributionType);
  const { data: incentiveWallet, isLoading: walletLoading } =
    useIncentiveWallet();
  const {
    data: rankInfo,
    isLoading: rankLoading,
    refetch: refetchRank,
  } = useRankInfo();
  const { data: nextRankData, isLoading: nextRankLoading } =
    useNextRankRequirements();
  const calculateRankMutation = useCalculateRank();

  const isLoading =
    distributionsLoading || walletLoading || rankLoading || nextRankLoading;

  const distributions = distributionsData?.distributions || [];
  const pagination = distributionsData?.pagination;
  const totalEarnings = distributionsData?.totalEarnings || {
    rankPool: 0,
    redistributionPool: 0,
    total: 0,
  };

  // Rank data
  const currentRank = rankInfo?.currentRank || 'Stakeholder';
  const qualifiedRank = rankInfo?.qualifiedRank || currentRank;
  const isUpgradeAvailable = rankInfo?.isUpgradeAvailable || false;
  const performancePoolQualified = rankInfo?.performancePoolQualified || false;
  const premiumPoolQualified = rankInfo?.premiumPoolQualified || false;
  const requirements = rankInfo?.requirements;
  const shortfalls = rankInfo?.shortfalls || {
    personalStake: 0,
    teamStake: 0,
    directDownlines: 0,
  };
  const nextRankProgress = nextRankData?.progressPercentages || {
    personalStake: 0,
    teamStake: 0,
    directDownlines: 0,
    lowerRankCount: 0,
  };

  const handleFilterChange = (newFilter: DistributionTypeFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleCalculateRank = async () => {
    try {
      await calculateRankMutation.mutateAsync();
      toast.success('Rank recalculated successfully');
      refetchRank();
    } catch (error: any) {
      toast.error('Failed to recalculate rank', {
        description: error?.response?.data?.message || error?.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rank & Pools</h1>
          <p className="text-muted-foreground mt-1">
            Track your rank progression and pool earnings
          </p>
        </div>
        {activeTab === 'rank' && (
          <Button
            variant="outline"
            onClick={handleCalculateRank}
            disabled={calculateRankMutation.isPending}
            className="border-yellow-500/20"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${calculateRankMutation.isPending ? 'animate-spin' : ''}`}
            />
            Recalculate Rank
          </Button>
        )}
      </div>

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
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pools'
              ? 'text-primary border-primary border-b-2'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pool Distributions
        </button>
      </div>

      {/* Stats Cards - Premium Dark Design */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-yellow-500/20 p-3">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-400">Your Rank</p>
                <p className="text-3xl font-bold text-white">{currentRank}</p>
                <p className="text-muted-foreground text-xs">
                  {isUpgradeAvailable && currentRank !== qualifiedRank
                    ? `Qualified: ${qualifiedRank}`
                    : 'Stakeholder level'}
                </p>
                <Progress
                  value={isUpgradeAvailable ? 75 : 100}
                  className="h-1.5 bg-yellow-900/30"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-500/20 bg-gradient-to-br from-green-900/20 via-green-800/10 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-green-500/20 p-3">
                  <Gift className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-400">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(totalEarnings.total)}
                </p>
                <p className="text-muted-foreground text-xs">From all pools</p>
                <Progress
                  value={
                    totalEarnings.total
                      ? Math.min(100, (totalEarnings.total / 10000) * 100)
                      : 0
                  }
                  className="h-1.5 bg-green-900/30"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Pool Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className={`bg-gradient-to-br ${performancePoolQualified ? 'border-blue-500/20 from-blue-900/20 via-blue-800/10 to-transparent' : 'border-slate-500/20 from-slate-900/20 via-slate-800/10 to-transparent'}`}
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`rounded-xl p-3 ${performancePoolQualified ? 'bg-blue-500/20' : 'bg-slate-500/20'}`}
                >
                  {performancePoolQualified ? (
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-slate-400" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p
                  className={`text-sm font-medium ${performancePoolQualified ? 'text-blue-400' : 'text-slate-400'}`}
                >
                  Performance Pool
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(totalEarnings.rankPool)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {performancePoolQualified ? 'Qualified' : 'Not qualified'}
                </p>
                <Progress
                  value={performancePoolQualified ? 100 : 0}
                  className={`h-1.5 ${performancePoolQualified ? 'bg-blue-900/30' : 'bg-slate-900/30'}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rank Tab Content */}
      {activeTab === 'rank' && (
        <div className="space-y-6">
          {/* Current Rank Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="mb-2 flex items-center gap-3 text-yellow-400">
                      <Star className="h-6 w-6" />
                      Current Rank
                    </CardTitle>
                    <CardDescription>
                      {isUpgradeAvailable && currentRank !== qualifiedRank
                        ? `You qualify for ${qualifiedRank} but are currently ${currentRank}`
                        : `Your current rank in the system`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {performancePoolQualified && (
                      <Badge
                        variant="default"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Performance Pool
                      </Badge>
                    )}
                    {premiumPoolQualified && (
                      <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Premium Pool
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="rounded-xl border-2 border-yellow-500/30 bg-yellow-500/20 p-4">
                    <Star className="h-12 w-12 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-2 text-3xl font-bold text-white">
                      {currentRank}
                    </h2>
                    {isUpgradeAvailable && currentRank !== qualifiedRank && (
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">
                          Upgrade Available: {qualifiedRank}
                        </span>
                      </div>
                    )}
                    {requirements && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Rank Bonus:
                          </span>
                          <span className="font-semibold text-white">
                            {requirements.rankBonusPercent}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Requirements Checklist */}
          {requirements && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent">
                <CardHeader>
                  <CardTitle>Rank Requirements</CardTitle>
                  <CardDescription>
                    Requirements for {requirements.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Personal Stake */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {shortfalls.personalStake <= 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="text-muted-foreground h-5 w-5" />
                        )}
                        <span className="font-medium">Personal Stake</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatCurrency(
                          requirements.personalStake - shortfalls.personalStake
                        )}{' '}
                        / {formatCurrency(requirements.personalStake)}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(
                        0,
                        Math.min(
                          100,
                          ((requirements.personalStake -
                            shortfalls.personalStake) /
                            requirements.personalStake) *
                            100
                        )
                      )}
                      className="h-2 bg-slate-900/30"
                    />
                    {shortfalls.personalStake > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Need {formatCurrency(shortfalls.personalStake)} more
                      </p>
                    )}
                  </div>

                  {/* Team Stake */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {shortfalls.teamStake <= 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="text-muted-foreground h-5 w-5" />
                        )}
                        <span className="font-medium">Team Stake</span>
                        <Badge variant="outline" className="text-xs">
                          All levels included
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatCurrency(
                          requirements.teamStake - shortfalls.teamStake
                        )}{' '}
                        / {formatCurrency(requirements.teamStake)}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(
                        0,
                        Math.min(
                          100,
                          ((requirements.teamStake - shortfalls.teamStake) /
                            requirements.teamStake) *
                            100
                        )
                      )}
                      className="h-2 bg-slate-900/30"
                    />
                    {shortfalls.teamStake > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Need {formatCurrency(shortfalls.teamStake)} more
                      </p>
                    )}
                  </div>

                  {/* Direct Downlines */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {shortfalls.directDownlines <= 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="text-muted-foreground h-5 w-5" />
                        )}
                        <span className="font-medium">Direct Downlines</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {requirements.directDownlines -
                          shortfalls.directDownlines}{' '}
                        / {requirements.directDownlines}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(
                        0,
                        Math.min(
                          100,
                          ((requirements.directDownlines -
                            shortfalls.directDownlines) /
                            requirements.directDownlines) *
                            100
                        )
                      )}
                      className="h-2 bg-slate-900/30"
                    />
                    {shortfalls.directDownlines > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Need {shortfalls.directDownlines} more direct referrals
                      </p>
                    )}
                  </div>

                  {/* Lower Rank Requirement */}
                  {requirements.lowerRankRequirement &&
                    requirements.lowerRankType && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {(shortfalls.lowerRankCount || 0) <= 0 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="text-muted-foreground h-5 w-5" />
                            )}
                            <span className="font-medium">
                              {requirements.lowerRankType} Downlines
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {requirements.lowerRankRequirement -
                              (shortfalls.lowerRankCount || 0)}{' '}
                            / {requirements.lowerRankRequirement}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            Math.min(
                              100,
                              ((requirements.lowerRankRequirement -
                                (shortfalls.lowerRankCount || 0)) /
                                requirements.lowerRankRequirement) *
                                100
                            )
                          )}
                          className="h-2 bg-slate-900/30"
                        />
                        {(shortfalls.lowerRankCount || 0) > 0 && (
                          <p className="text-muted-foreground text-xs">
                            Need {shortfalls.lowerRankCount} more{' '}
                            {requirements.lowerRankType} downlines
                          </p>
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Next Rank Preview */}
          {nextRankData && rankInfo?.nextRank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <TrendingUp className="h-5 w-5" />
                    Next Rank: {nextRankData.nextRank}
                  </CardTitle>
                  <CardDescription>
                    Progress toward your next rank upgrade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Personal Stake Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Personal Stake
                      </span>
                      <span className="font-medium text-white">
                        {formatCurrency(
                          nextRankData.currentProgress.personalStake
                        )}{' '}
                        /{' '}
                        {formatCurrency(
                          nextRankData.requirements.personalStake
                        )}
                      </span>
                    </div>
                    <Progress
                      value={nextRankProgress.personalStake}
                      className="h-2 bg-purple-900/30"
                    />
                  </div>

                  {/* Team Stake Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Team Stake</span>
                      <span className="font-medium text-white">
                        {formatCurrency(nextRankData.currentProgress.teamStake)}{' '}
                        / {formatCurrency(nextRankData.requirements.teamStake)}
                      </span>
                    </div>
                    <Progress
                      value={nextRankProgress.teamStake}
                      className="h-2 bg-purple-900/30"
                    />
                  </div>

                  {/* Direct Downlines Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Direct Downlines
                      </span>
                      <span className="font-medium text-white">
                        {nextRankData.currentProgress.directDownlines} /{' '}
                        {nextRankData.requirements.directDownlines}
                      </span>
                    </div>
                    <Progress
                      value={nextRankProgress.directDownlines}
                      className="h-2 bg-purple-900/30"
                    />
                  </div>

                  {/* Lower Rank Progress */}
                  {nextRankData.requirements.lowerRankRequirement && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {nextRankData.requirements.lowerRankType} Downlines
                        </span>
                        <span className="font-medium text-white">
                          {nextRankData.currentProgress.lowerRankCount || 0} /{' '}
                          {nextRankData.requirements.lowerRankRequirement}
                        </span>
                      </div>
                      <Progress
                        value={nextRankProgress.lowerRankCount || 0}
                        className="h-2 bg-purple-900/30"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Pools Tab Content */}
      {activeTab === 'pools' && (
        <div className="space-y-6">
          {/* Qualification Status */}
          {incentiveWallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent">
                <CardHeader>
                  <CardTitle>Qualification Status</CardTitle>
                  <CardDescription>
                    Your current pool qualification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div
                      className={`rounded-lg border-2 p-4 ${
                        incentiveWallet.qualificationStatus
                          .performancePoolQualified
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-slate-500/30 bg-slate-500/5'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        {incentiveWallet.qualificationStatus
                          .performancePoolQualified ? (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <XCircle className="text-muted-foreground h-5 w-5" />
                        )}
                        <span className="font-semibold">Performance Pool</span>
                        {incentiveWallet.qualificationStatus
                          .performancePoolQualified && (
                          <Badge variant="default" className="bg-blue-500">
                            Qualified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Earnings:{' '}
                        {formatCurrency(incentiveWallet.rankPoolEarnings)}
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border-2 p-4 ${
                        incentiveWallet.qualificationStatus.premiumPoolQualified
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-slate-500/30 bg-slate-500/5'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        {incentiveWallet.qualificationStatus
                          .premiumPoolQualified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="text-muted-foreground h-5 w-5" />
                        )}
                        <span className="font-semibold">Premium Pool</span>
                        {incentiveWallet.qualificationStatus
                          .premiumPoolQualified && (
                          <Badge variant="default" className="bg-green-500">
                            Qualified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Earnings:{' '}
                        {formatCurrency(
                          incentiveWallet.redistributionPoolEarnings
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Distribution History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Distribution History</CardTitle>
                    <CardDescription>
                      Your pool distribution earnings history
                    </CardDescription>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent>
                {distributions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Distribution List */}
                    <div className="space-y-3">
                      {distributions.map((distribution, index) => (
                        <motion.div
                          key={distribution._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="bg-background/50 hover:bg-background/70 flex items-center justify-between rounded-lg border border-slate-500/20 p-4 transition-colors"
                        >
                          <div className="flex flex-1 items-center gap-4">
                            {/* Verification Icon */}
                            <div
                              className={`rounded-lg p-2 ${
                                distribution.verificationIcon === 'blue'
                                  ? 'bg-blue-500/20'
                                  : distribution.verificationIcon === 'green'
                                    ? 'bg-green-500/20'
                                    : 'bg-red-500/20'
                              }`}
                            >
                              {distribution.isQualified ? (
                                <CheckCircle
                                  className={`h-5 w-5 ${
                                    distribution.verificationIcon === 'blue'
                                      ? 'text-blue-400'
                                      : distribution.verificationIcon ===
                                          'green'
                                        ? 'text-green-400'
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
                                    className="bg-green-500 text-xs"
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
                            <p className="text-lg font-bold text-green-400">
                              +{formatCurrency(distribution.bonusAmount)}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatDate(new Date(distribution.createdAt))}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

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
                            className="border-slate-500/20"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPage((p) =>
                                Math.min(pagination.totalPages, p + 1)
                              )
                            }
                            disabled={page >= pagination.totalPages}
                            className="border-slate-500/20"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
                        <Button onClick={() => setActiveTab('rank')}>
                          View Rank Requirements
                        </Button>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
