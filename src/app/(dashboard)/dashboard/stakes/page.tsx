'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Target,
  Plus,
  Wallet,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import type { Stake } from '@/lib/queries/stakingQueries';
import { Button } from '@/components/ui/button';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import { useUIStore } from '@/store/uiStore';
import { StakeCard } from '@/components/stake/StakeCard';
import { StakingTransactionHistory } from '@/components/stake/StakingTransactionHistory';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export default function StakesPage() {
  const { openModal } = useUIStore();
  const { data: stakingData, isLoading, error } = useStakeDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <NovuntSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your stakes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Failed to Load Stakes
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Log what we actually received
  console.log('[Stakes Page] stakingData received:', stakingData);

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

  // Calculate This Week's Profit
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today);
  const endOfCurrentWeek = endOfWeek(today);

  const thisWeekProfit = activeStakes.reduce((total, stake) => {
    if (!stake.weeklyPayouts) return total;

    const weeklyAmount = stake.weeklyPayouts.reduce((weekTotal, payout) => {
      // Check if payout date is valid and within current week
      if (payout.date && payout.status === 'paid') {
        const payoutDate = parseISO(payout.date);
        if (
          isWithinInterval(payoutDate, {
            start: startOfCurrentWeek,
            end: endOfCurrentWeek,
          })
        ) {
          return weekTotal + (payout.amount || 0);
        }
      }
      return weekTotal;
    }, 0);

    return total + weeklyAmount;
  }, 0);

  console.log('[Stakes Page] Extracted data:', {
    activeStakesCount: activeStakes.length,
    hasWallets: !!wallets,
    hasSummary: !!summary,
    thisWeekProfit,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            My Stakes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your stakes and ROS progress
          </p>
        </div>
        <Button
          onClick={() => openModal('create-stake')}
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Stake Now
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {/* Total Stakes Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <Target className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Count</span>
          </div>
          <p className="mb-1 text-sm opacity-90">Total Stake(s)</p>
          <p className="text-3xl font-bold">{activeStakes.length || 0}</p>
        </motion.div>

        {/* Total Amount Staked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Total</span>
          </div>
          <p className="mb-1 text-sm opacity-90">Total Amount Staked</p>
          <p className="text-3xl font-bold">
            $
            {activeStakes
              .reduce((sum, stake) => sum + (stake.amount || 0), 0)
              .toFixed(2)}
          </p>
        </motion.div>

        {/* This Week Profit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Weekly</span>
          </div>
          <p className="mb-1 text-sm opacity-90">This Week Profit</p>
          <p className="text-3xl font-bold">${thisWeekProfit.toFixed(2)}</p>
        </motion.div>

        {/* Total Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Total Earned (ROS)
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${summary?.totalEarnedFromROS?.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        {/* Target Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Target Returns
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${summary?.targetTotalReturns?.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Overall Progress
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {summary?.progressToTarget || '0.00%'}
          </p>
        </motion.div>
      </div>

      {/* Available Balance */}
      {wallets && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Available to Stake
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                Deposit Wallet
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${wallets.fundedWallet?.toFixed(2) || '0.00'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {wallets.description?.fundedWallet}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                Earnings Wallet
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${wallets.earningWallet?.toFixed(2) || '0.00'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {wallets.description?.earningWallet}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                Total Available
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${wallets.totalAvailableBalance?.toFixed(2) || '0.00'}
              </p>
              <Button
                onClick={() => openModal('create-stake')}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus className="mr-1 h-3 w-3" />
                Stake Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Stakes */}
      {hasStakes ? (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Active Stakes ({activeStakes.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeStakes.map((stake, index) => (
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
              your first stake and receive weekly payouts!
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

      {/* Stake History */}
      {stakeHistory.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Completed Stakes ({stakeHistory.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stakeHistory.slice(0, 6).map((stake, index) => (
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
      )}

      {/* Staking Model Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">
              How Novunt Staking Works
            </h3>
            <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
              {summary?.stakingModel ||
                'Weekly ROS based on Novunt trading performance until 200% returns'}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {summary?.note ||
                'Stakes are permanent commitments. You benefit through weekly ROS payouts to your Earning Wallet until 200% maturity.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Staking Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <StakingTransactionHistory />
      </motion.div>
    </div>
  );
}
