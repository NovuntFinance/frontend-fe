'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Target, Clock } from 'lucide-react';
import { Stake } from '@/lib/queries/stakingQueries';

interface StakeCardProps {
  stake: Stake;
  onClick?: () => void;
}

export function StakeCard({ stake, onClick }: StakeCardProps) {
  const progress = parseFloat(stake.progressToTarget.replace('%', ''));
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
  const nextPayout = stake.weeklyPayouts?.find(p => p.status === 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 cursor-pointer transition-all ${
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-900/30'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            <TrendingUp className={`w-5 h-5 ${
              isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'
            }`} />
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
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isCompleted
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : stake.status === 'active'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {stake.status.charAt(0).toUpperCase() + stake.status.slice(1)}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3 mb-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress to 200% ROS</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {stake.progressToTarget}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Total Earned */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Total Earned
              </span>
            </div>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              ${stake.totalEarned.toFixed(2)}
            </p>
          </div>

          {/* Target Return */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Target
              </span>
            </div>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              ${stake.targetReturn.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Next Payout */}
      {!isCompleted && nextPayout && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
      {!isCompleted && stake.remainingToTarget > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Remaining
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${stake.remainingToTarget.toFixed(2)}
          </span>
        </div>
      )}

      {/* Goal Badge */}
      {stake.goal && (
        <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-center font-medium text-purple-900 dark:text-purple-100">
            🎯 Goal: {stake.goal}
          </p>
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="mt-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-center font-medium text-emerald-900 dark:text-emerald-100">
            🎉 200% ROS Target Achieved!
          </p>
        </div>
      )}
    </motion.div>
  );
}

