'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Wallet,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react';
import type { Stake } from '@/lib/queries/stakingQueries';
import { Button } from '@/components/ui/button';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import { useUIStore } from '@/store/uiStore';
import { StakeCard } from '@/components/stake/StakeCard';
import { StakingTransactionHistory } from '@/components/stake/StakingTransactionHistory';
import { ShimmerCard } from '@/components/ui/shimmer';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { EmptyStates } from '@/components/EmptyStates';
import { useTodayProfit } from '@/lib/queries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { prefersReducedMotion } from '@/lib/accessibility';
import { useResponsive } from '@/hooks/useResponsive';

export default function StakesPage() {
  const { openModal } = useUIStore();
  const { data: stakingData, isLoading, error } = useStakeDashboard();
  const { data: todayProfitData } = useTodayProfit();
  const { isMobile, breakpoint } = useResponsive();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ShimmerCard className="h-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <ShimmerCard className="h-48" />
          <ShimmerCard className="h-48" />
        </div>
        <ShimmerCard className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <UserFriendlyError
          error={error}
          onRetry={() => window.location.reload()}
          variant="card"
          className="max-w-md"
        />
      </div>
    );
  }

  // 🔍 DEBUG: Log what we actually received with detailed stake info
  console.log('[Stakes Page] 🔍 stakingData received:', {
    fullData: stakingData,
    activeStakesCount: stakingData?.activeStakes?.length || 0,
    firstStakeDetails: stakingData?.activeStakes?.[0]
      ? {
          _id: stakingData.activeStakes[0]._id,
          amount: stakingData.activeStakes[0].amount,
          totalEarned: stakingData.activeStakes[0].totalEarned,
          progressToTarget: stakingData.activeStakes[0].progressToTarget,
          remainingToTarget: stakingData.activeStakes[0].remainingToTarget,
          targetReturn: stakingData.activeStakes[0].targetReturn,
          status: stakingData.activeStakes[0].status,
          updatedAt: stakingData.activeStakes[0].updatedAt,
        }
      : null,
    summary: stakingData?.summary,
  });

  // The query returns the dashboard data directly (already unwrapped by the query function)
  // Structure: { wallets: {...}, activeStakes: [...], stakeHistory: [...], summary: {...} }
  const {
    activeStakes = [] as Stake[],
    stakeHistory = [] as Stake[],
    summary = {} as {
      totalActiveStakes?: number;
      totalStakesSinceInception?: number;
      totalEarnedFromROS?: number;
      targetTotalReturns?: number;
      progressToTarget?: string;
      stakingModel?: string;
      note?: string;
    },
    wallets = {
      fundedWallet: 0,
      earningWallet: 0,
      totalAvailableBalance: 0,
      description: {
        fundedWallet: '',
        earningWallet: '',
      },
    } as {
      fundedWallet: number;
      earningWallet: number;
      totalAvailableBalance: number;
      description: {
        fundedWallet: string;
        earningWallet: string;
      };
    },
  } = stakingData || {};
  const hasStakes = activeStakes && activeStakes.length > 0;

  // Calculate Today's Profit
  // Get today's profit amount from active stakes based on today's declared percentage
  const todayProfitAmount = todayProfitData?.profitPercentage
    ? activeStakes.reduce((total: number, stake: Stake) => {
        // Calculate today's profit: (stake amount) × (today's ROS %) / 100
        const stakeProfit =
          (stake.amount * (todayProfitData.profitPercentage || 0)) / 100;
        return total + stakeProfit;
      }, 0)
    : 0;

  console.log('[Stakes Page] Extracted data:', {
    activeStakesCount: activeStakes.length,
    hasWallets: !!wallets,
    hasSummary: !!summary,
    todayProfitAmount,
    todayProfitPercentage: todayProfitData?.profitPercentage,
  });

  const reducedMotion = prefersReducedMotion();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header - Staking Streak Template */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent" />

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
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
            />
          )}

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <TrendingUp className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    My Stakes
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Track your stakes and ROS progress
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => openModal('create-stake')}
                size="sm"
                className="h-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 sm:h-10 sm:text-sm"
              >
                <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Stake Now</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Overview Cards - Staking Streak Template (2x3 Grid) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {/* Total Earned ROS */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent" />
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
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
              />
            )}
            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <DollarSign className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Total Earned (ROS)
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Total earnings from all sources
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl">
                ${summary?.totalEarnedFromROS?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Staked */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent" />
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
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-orange-500/30 blur-2xl"
              />
            )}
            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Wallet className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Total Staked
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Total amount staked across all stakes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl">
                $
                {activeStakes
                  .reduce(
                    (sum: number, stake: Stake) => sum + (stake.amount || 0),
                    0
                  )
                  .toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Profit */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent" />
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
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-cyan-500/30 blur-2xl"
              />
            )}
            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Calendar className="h-5 w-5 text-cyan-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Today&apos;s Profit
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Daily profit from active stakes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl">
                ${todayProfitAmount.toFixed(2)}
              </p>
              {todayProfitData?.profitPercentage && (
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  {todayProfitData.profitPercentage.toFixed(2)}% ROS
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" />
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
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-indigo-500/30 blur-2xl"
              />
            )}
            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <TrendingUp className="h-5 w-5 text-indigo-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Overall Progress
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Progress toward target returns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl">
                {summary?.progressToTarget || '0.00%'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Available Balance - Staking Streak Template */}
      {wallets && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />
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
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
              />
            )}
            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Wallet className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Available to Stake
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Your available balance for staking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                    Deposit Wallet
                  </p>
                  <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                    ${wallets.fundedWallet?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                    {wallets.description?.fundedWallet}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                    Earnings Wallet
                  </p>
                  <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                    ${wallets.earningWallet?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                    {wallets.description?.earningWallet}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                    Total Available
                  </p>
                  <p className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                    ${wallets.totalAvailableBalance?.toFixed(2) || '0.00'}
                  </p>
                  <Button
                    onClick={() => openModal('create-stake')}
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs sm:h-8 sm:text-sm"
                  >
                    <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Stake Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Stakes */}
      {hasStakes ? (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Active Stakes ({activeStakes.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeStakes.map((stake: Stake, index: number) => (
              <motion.div
                key={stake._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <StakeCard stake={stake} />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mx-auto max-w-md">
            <div className="mb-4 inline-block rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
              <TrendingUp className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              No Active Stakes Yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Start earning with Novunt&apos;s 200% ROS staking model. Create
              your first stake and receive daily payouts!
            </p>
            <Button
              onClick={() => openModal('create-stake')}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Stake
            </Button>
          </div>
        </motion.div>
      )}

      {/* Completed Stakes Section Header - Staking Streak Template */}
      {stakeHistory.length > 0 && (
        <>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />
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
                  className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
                />
              )}
              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <FileText className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Completed Stakes ({stakeHistory.length})
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Your completed staking positions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {stakeHistory.slice(0, 6).map((stake: Stake, index: number) => (
              <motion.div
                key={stake._id}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + 0.1 * index }}
              >
                <StakeCard stake={stake} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Staking Model Info - Staking Streak Template */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />
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
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-amber-500/30 blur-2xl"
            />
          )}
          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
              >
                <AlertCircle className="h-5 w-5 text-amber-500 sm:h-6 sm:w-6" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <CardTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                  How Novunt Staking Works
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">
                  Understanding the staking model
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-muted-foreground text-xs sm:text-sm">
                {summary?.stakingModel ||
                  'Daily ROS based on Novunt trading performance until 200% returns'}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {summary?.note ||
                  'Stakes are permanent commitments. You benefit through daily ROS payouts to your Earning Wallet until 200% maturity.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Staking Transaction History */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
      >
        <StakingTransactionHistory />
      </motion.div>
    </div>
  );
}
