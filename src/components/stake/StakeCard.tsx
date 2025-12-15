'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Target, Clock } from 'lucide-react';
import { Stake } from '@/lib/queries/stakingQueries';
import { useStakingConfig } from '@/hooks/useStakingConfig';

interface StakeCardProps {
  stake: Stake;
  onClick?: () => void;
}

export function StakeCard({ stake, onClick }: StakeCardProps) {
  const stakingConfig = useStakingConfig();

  // 🔍 DEBUG: Log stake data being rendered
  if (process.env.NODE_ENV === 'development') {
    console.log('[StakeCard] 🔍 Rendering stake:', {
      _id: stake._id,
      amount: stake.amount,
      totalEarned: stake.totalEarned,
      progressToTarget: stake.progressToTarget,
      remainingToTarget: stake.remainingToTarget,
      targetReturn: stake.targetReturn,
      status: stake.status,
      updatedAt: stake.updatedAt,
    });
  }

  const progress = stake.progressToTarget
    ? parseFloat(stake.progressToTarget.replace('%', ''))
    : 0;
  const isCompleted = stake.status === 'completed';

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get next payout
  const nextPayout = stake.weeklyPayouts?.find((p) => p.status === 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border-2 bg-white p-6 transition-all dark:bg-gray-800 ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10'
          : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700 dark:hover:border-emerald-700'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-3 ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}
          >
            <TrendingUp
              className={`h-5 w-5 ${
                isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-white'
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ${stake.amount.toFixed(2)} USDT
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(stake.createdAt)}
            </p>
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : stake.status === 'active'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {stake.status
            ? stake.status.charAt(0).toUpperCase() + stake.status.slice(1)
            : 'Unknown'}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Progress to {stakingConfig.goalTargetPercentage}% ROS
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {stake.progressToTarget || '0%'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Total Earned */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="mb-1 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Total Earned
              </span>
            </div>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              ${(stake.totalEarned || 0).toFixed(2)}
            </p>
          </div>

          {/* Target Return */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-1 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Target
              </span>
            </div>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              ${(stake.targetReturn || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Next Payout */}
      {!isCompleted && nextPayout && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Next Payout
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Week {nextPayout.week}
            </span>
          </div>
        </div>
      )}

      {/* Remaining to Target */}
      {!isCompleted && (stake.remainingToTarget ?? 0) > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            Remaining
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${(stake.remainingToTarget || 0).toFixed(2)}
          </span>
        </div>
      )}

      {/* Goal Badge */}
      {stake.goal && (
        <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20">
          <p className="text-center text-xs font-medium text-purple-900 dark:text-purple-100">
            🎯 Goal: {stake.goal}
          </p>
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-100 p-3 dark:border-emerald-800 dark:bg-emerald-900/30">
          <p className="text-center text-sm font-medium text-emerald-900 dark:text-emerald-100">
            🎉 {stakingConfig.goalTargetPercentage}% ROS Target Achieved!
          </p>
        </div>
      )}
    </motion.div>
  );
}
