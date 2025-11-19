'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Plus, Wallet, AlertCircle } from 'lucide-react';
import type { Stake } from '@/lib/queries/stakingQueries';
import { Button } from '@/components/ui/button';
import { useStakingDashboard } from '@/lib/queries/stakingQueries';
import { CreateStakeModal } from '@/components/stake/CreateStakeModal';
import { StakeCard } from '@/components/stake/StakeCard';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';

export default function StakesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: stakingData, isLoading, error } = useStakingDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <NovuntSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your stakes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Stakes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
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
        earningWallet: ''
      }
    } as {
      fundedWallet: number;
      earningWallet: number;
      totalAvailableBalance: number;
      description: {
        fundedWallet: string;
        earningWallet: string;
      };
    }
  } = stakingData || {};
  const hasStakes = activeStakes && activeStakes.length > 0;
  
  console.log('[Stakes Page] Extracted data:', {
    activeStakesCount: activeStakes.length,
    hasWallets: !!wallets,
    hasSummary: !!summary
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Stakes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your stakes and ROS progress
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Create New Stake
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Active</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Staked</p>
          <p className="text-3xl font-bold">
            ${summary?.totalActiveStakes?.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        {/* Total Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earned (ROS)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${summary?.totalEarnedFromROS?.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        {/* Target Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Returns</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${summary?.targetTotalReturns?.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Progress</p>
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
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available to Stake
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deposit Wallet</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${wallets.fundedWallet?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {wallets.description?.fundedWallet}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Earnings Wallet</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${wallets.earningWallet?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {wallets.description?.earningWallet}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Available</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${wallets.totalAvailableBalance?.toFixed(2) || '0.00'}
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Stake Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Stakes */}
      {hasStakes ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Active Stakes ({activeStakes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full inline-block mb-4">
              <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Active Stakes Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start earning with Novunt's 200% ROS staking model. Create your first stake and receive weekly payouts!
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Stake
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stake History */}
      {stakeHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Completed Stakes ({stakeHistory.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              How Novunt Staking Works
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              {summary?.stakingModel || 'Weekly ROS based on Novunt trading performance until 200% returns'}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {summary?.note || 'Stakes are permanent commitments. You benefit through weekly ROS payouts to your Earning Wallet until 200% maturity.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Create Stake Modal */}
      <CreateStakeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
