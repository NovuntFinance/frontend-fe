'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Target, Clock } from 'lucide-react';
import { Stake, hasReached200Target } from '@/lib/queries/stakingQueries';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prefersReducedMotion } from '@/lib/accessibility';
import { fmt4 } from '@/utils/formatters';

interface StakeCardProps {
  stake: Stake;
  onClick?: () => void;
}

export function StakeCard({ stake, onClick }: StakeCardProps) {
  const stakingConfig = useStakingConfig();

  // ✅ BACKEND CONFIRMED (Jan 15, 2026): Bonus stakes have these identifiers
  const isRegistrationBonus =
    stake.isRegistrationBonus === true || stake.type === 'registration_bonus';
  const maxReturnCap = stake.maxReturnMultiplier
    ? stake.maxReturnMultiplier * 100
    : isRegistrationBonus
      ? 100
      : stakingConfig.goalTargetPercentage;

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
      isRegistrationBonus,
      type: stake.type,
      maxReturnMultiplier: stake.maxReturnMultiplier,
      maxReturnCap,
    });
  }

  const progress = stake.progressToTarget
    ? parseFloat(stake.progressToTarget.replace('%', ''))
    : 0;
  const isCompleted = stake.status === 'completed';
  const hasReachedTarget = hasReached200Target(stake);

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

  const reducedMotion = prefersReducedMotion();
  // 🎁 SPECIAL STYLING FOR BONUS STAKES (golden theme)
  const gradientColors = isRegistrationBonus
    ? {
        gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
        blob: 'bg-amber-500/30',
        iconBg: 'from-amber-500/30 to-yellow-500/20',
        textGradient: 'from-amber-600 to-yellow-600',
        iconColor: 'text-amber-500',
      }
    : isCompleted
      ? {
          gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
          blob: 'bg-emerald-500/30',
          iconBg: 'from-emerald-500/30 to-green-500/20',
          textGradient: 'from-emerald-600 to-green-600',
          iconColor: 'text-emerald-500',
        }
      : {
          gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
          blob: 'bg-purple-500/30',
          iconBg: 'from-purple-500/30 to-indigo-500/20',
          textGradient: 'from-purple-600 to-indigo-600',
          iconColor: 'text-purple-500',
        };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? {} : { scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        className={`bg-card/50 group relative overflow-hidden shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl ${
          isRegistrationBonus
            ? 'border-2 border-amber-500/30' // 🎁 Special border for bonus stakes
            : 'border-0'
        }`}
      >
        {/* Animated Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientColors.gradient}`}
        />

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
            className={`absolute -bottom-8 -left-12 h-24 w-24 rounded-full ${gradientColors.blob} blur-2xl`}
          />
        )}

        <CardHeader className="relative p-4 sm:p-6">
          <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className={`rounded-xl bg-gradient-to-br ${gradientColors.iconBg} p-2 shadow-lg backdrop-blur-sm sm:p-3`}
              >
                <TrendingUp
                  className={`h-5 w-5 ${gradientColors.iconColor} sm:h-6 sm:w-6`}
                />
              </motion.div>
              <div className="min-w-0 flex-1">
                <CardTitle
                  className={`bg-gradient-to-r ${gradientColors.textGradient} bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg`}
                >
                  {isRegistrationBonus && '🎁 '}${fmt4(stake.amount)} USDT
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">
                  {isRegistrationBonus
                    ? 'Registration Bonus'
                    : formatDate(stake.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Badge
                className={`text-[10px] sm:text-xs ${
                  isRegistrationBonus
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : stake.status === 'active'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
              >
                {stake.status
                  ? stake.status.charAt(0).toUpperCase() + stake.status.slice(1)
                  : 'Unknown'}
              </Badge>
              {isRegistrationBonus && (
                <Badge className="bg-amber-100 text-[10px] text-amber-700 sm:text-xs dark:bg-amber-900/30 dark:text-amber-400">
                  {maxReturnCap}% Cap
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
          {/* Progress Section — label makes 0–200% scale explicit (not 0–100%) */}
          <div className="mb-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                <span className="text-muted-foreground">
                  Progress to {maxReturnCap}% ROS
                </span>
                <span className="font-semibold">
                  {typeof stake.currentROSPercent === 'number' &&
                  typeof stake.targetROSPercent === 'number'
                    ? `${stake.currentROSPercent}% of ${stake.targetROSPercent}% ROS`
                    : `${stake.progressToTarget || '0%'} of the way to ${maxReturnCap}% ROS`}
                </span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <motion.div
                  initial={reducedMotion ? false : { width: 0 }}
                  animate={reducedMotion ? false : { width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${gradientColors.textGradient}`}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
              {/* Total Earned */}
              <div
                className={`rounded-lg p-2 sm:p-3 ${
                  isRegistrationBonus
                    ? 'border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20'
                    : 'border border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20'
                }`}
              >
                <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                  <DollarSign
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      isRegistrationBonus
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium sm:text-xs ${
                      isRegistrationBonus
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {isRegistrationBonus ? 'Bonus Paid' : 'Total Earned'}
                  </span>
                </div>
                <p
                  className={`text-sm font-bold sm:text-lg ${
                    isRegistrationBonus
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-emerald-900 dark:text-emerald-100'
                  }`}
                >
                  ${fmt4(stake.totalEarned)}
                </p>
              </div>

              {/* Target Return */}
              <div
                className={`rounded-lg p-2 sm:p-3 ${
                  isRegistrationBonus
                    ? 'border border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    : 'border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20'
                }`}
              >
                <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                  <Target
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      isRegistrationBonus
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium sm:text-xs ${
                      isRegistrationBonus
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {isRegistrationBonus
                      ? `Target (${maxReturnCap}%)`
                      : 'Target'}
                  </span>
                </div>
                <p
                  className={`text-sm font-bold sm:text-lg ${
                    isRegistrationBonus
                      ? 'text-yellow-900 dark:text-yellow-100'
                      : 'text-blue-900 dark:text-blue-100'
                  }`}
                >
                  ${fmt4(stake.targetReturn)}
                </p>
              </div>
            </div>
          </div>

          {/* Next Payout */}
          {!isCompleted && nextPayout && (
            <div className="border-muted bg-muted/50 mb-3 rounded-lg border p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    Next Payout
                  </span>
                </div>
                <span className="text-xs font-medium sm:text-sm">
                  Week {nextPayout.week}
                </span>
              </div>
            </div>
          )}

          {/* Remaining to Target */}
          {!isCompleted && (stake.remainingToTarget ?? 0) > 0 && (
            <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Remaining
              </span>
              <span className="font-semibold">
                ${fmt4(stake.remainingToTarget)}
              </span>
            </div>
          )}

          {/* Goal Badge */}
          {stake.goal && (
            <div className="mb-3 rounded-lg border border-purple-200 bg-purple-50/50 p-2 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-center text-[10px] font-medium text-purple-900 sm:text-xs dark:text-purple-100">
                🎯 Goal: {stake.goal}
              </p>
            </div>
          )}

          {/* Completed Badge – show only when stake has actually reached target (totalEarned >= targetReturn or remainingToTarget <= 0) */}
          {hasReachedTarget && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-100/50 p-2 sm:p-3 dark:border-emerald-800 dark:bg-emerald-900/30">
              <p className="text-center text-xs font-medium text-emerald-900 sm:text-sm dark:text-emerald-100">
                🎉 {maxReturnCap}% ROS Target Achieved!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
