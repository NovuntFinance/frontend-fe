'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Target, Clock } from 'lucide-react';
import { Stake, hasReached200Target } from '@/lib/queries/stakingQueries';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import { prefersReducedMotion } from '@/lib/accessibility';
import { fmt4 } from '@/utils/formatters';
import neuStyles from '@/styles/neumorphic.module.css';
import walletStyles from '@/styles/wallet-page.module.css';

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
  const cardClass = `${neuStyles['neu-card']} rounded-[18px] p-4 sm:p-6 ${isRegistrationBonus ? 'border-[1px] border-[rgba(0,155,242,0.25)]' : ''}`;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? {} : { scale: 1.01 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className={cardClass}>
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
              style={{
                boxShadow: 'var(--neu-shadow-inset)',
                border: '1px solid var(--neu-border)',
                background: 'var(--neu-bg)',
                color: 'var(--wallet-accent)',
              }}
            >
              <TrendingUp className="h-5 w-5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-bold sm:text-base"
                style={{ color: 'var(--wallet-text)' }}
              >
                {isRegistrationBonus && '🎁 '}${fmt4(stake.amount)} USDT
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                {isRegistrationBonus
                  ? 'Registration Bonus'
                  : formatDate(stake.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <span
              className={`${neuStyles['neu-badge']} text-[10px] sm:text-xs`}
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              {stake.status
                ? stake.status.charAt(0).toUpperCase() + stake.status.slice(1)
                : 'Unknown'}
            </span>
            {isRegistrationBonus && (
              <span
                className={`${neuStyles['neu-badge']} ${neuStyles['neu-badge-accent']} text-[10px] sm:text-xs`}
              >
                {maxReturnCap}% Cap
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span style={{ color: 'var(--wallet-label)' }}>
              Progress to {maxReturnCap}% ROS
            </span>
            <span style={{ color: 'var(--wallet-accent)', fontWeight: 600 }}>
              {typeof stake.currentROSPercent === 'number' &&
              typeof stake.targetROSPercent === 'number'
                ? `${stake.currentROSPercent}% of ${stake.targetROSPercent}% ROS`
                : `${stake.progressToTarget || '0%'} of the way to ${maxReturnCap}% ROS`}
            </span>
          </div>
          <div className={walletStyles.nxpProgressBarTrack}>
            <motion.div
              initial={reducedMotion ? false : { width: 0 }}
              animate={reducedMotion ? false : { width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={walletStyles.nxpProgressBarFill}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
          <div
            className="rounded-[16px] p-2 sm:p-3"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <DollarSign
                className="h-3 w-3 sm:h-4 sm:w-4"
                style={{ color: 'var(--wallet-accent)' }}
              />
              <span
                className="text-[10px] font-medium sm:text-xs"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                {isRegistrationBonus ? 'Bonus Paid' : 'Total Earned'}
              </span>
            </div>
            <p
              className="text-sm font-bold sm:text-base"
              style={{ color: 'var(--wallet-accent)' }}
            >
              ${fmt4(stake.totalEarned)}
            </p>
          </div>
          <div
            className="rounded-[16px] p-2 sm:p-3"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <Target
                className="h-3 w-3 sm:h-4 sm:w-4"
                style={{ color: 'var(--wallet-accent)' }}
              />
              <span
                className="text-[10px] font-medium sm:text-xs"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                {isRegistrationBonus ? `Target (${maxReturnCap}%)` : 'Target'}
              </span>
            </div>
            <p
              className="text-sm font-bold sm:text-base"
              style={{ color: 'var(--wallet-accent)' }}
            >
              ${fmt4(stake.targetReturn)}
            </p>
          </div>
        </div>

        {/* Next Payout */}
        {!isCompleted && nextPayout && (
          <div
            className="mb-3 rounded-[16px] p-2 sm:p-3"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar
                  className="h-3 w-3 sm:h-4 sm:w-4"
                  style={{ color: 'var(--wallet-text-muted)' }}
                />
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--wallet-text-muted)' }}
                >
                  Next Payout
                </span>
              </div>
              <span
                className="text-xs font-medium sm:text-sm"
                style={{ color: 'var(--wallet-accent)' }}
              >
                Week {nextPayout.week}
              </span>
            </div>
          </div>
        )}

        {/* Remaining to Target */}
        {!isCompleted && (stake.remainingToTarget ?? 0) > 0 && (
          <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
            <span
              className="flex items-center gap-1.5"
              style={{ color: 'var(--wallet-text-muted)' }}
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Remaining
            </span>
            <span
              className="font-semibold"
              style={{ color: 'var(--wallet-accent)' }}
            >
              ${fmt4(stake.remainingToTarget)}
            </span>
          </div>
        )}

        {/* Goal */}
        {stake.goal && (
          <div
            className="mb-3 rounded-[16px] p-2 text-center"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
            }}
          >
            <p
              className="text-[10px] font-medium sm:text-xs"
              style={{ color: 'var(--wallet-text-secondary)' }}
            >
              🎯 Goal: {stake.goal}
            </p>
          </div>
        )}

        {/* Target Achieved */}
        {hasReachedTarget && (
          <div
            className="rounded-[16px] p-2 text-center sm:p-3"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid rgba(0,155,242,0.2)',
              background: 'var(--neu-bg)',
            }}
          >
            <p
              className="text-xs font-medium sm:text-sm"
              style={{ color: 'var(--wallet-accent)' }}
            >
              🎉 {maxReturnCap}% ROS Target Achieved!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
