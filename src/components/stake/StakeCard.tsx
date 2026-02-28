'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Target, Clock } from 'lucide-react';
import {
  Stake,
  hasReached200Target,
  getStakeId,
  getGoalDisplayLabel,
} from '@/lib/queries/stakingQueries';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import { useUIStore } from '@/store/uiStore';
import { prefersReducedMotion } from '@/lib/accessibility';
import { fmt4 } from '@/utils/formatters';
import neuStyles from '@/styles/neumorphic.module.css';
import { celebrateStake200AndDashboard } from '@/lib/celebrations';
import { getFoodForThoughtForProgress } from '@/data/stakeFoodForThought';

const STAKES_200_CONFETTI_KEY = 'novunt_stake_200_confetti';

const MASK = '••••••';

const TEXT_WHITE = 'rgba(255, 255, 255, 0.95)';
const TEXT_WHITE_MUTED = 'rgba(255, 255, 255, 0.7)';

interface StakeCardProps {
  stake: Stake;
  onClick?: () => void;
  /** Use white primary text (dashboard style); default is wallet blue theme */
  variant?: 'default' | 'dashboard';
}

export function StakeCard({
  stake,
  onClick,
  variant = 'default',
}: StakeCardProps) {
  const stakingConfig = useStakingConfig();
  const balanceVisible = useUIStore((s) => s.balanceVisible);
  const isDashboard = variant === 'dashboard';
  const maskAmounts = isDashboard && !balanceVisible;
  const primaryColor = isDashboard ? TEXT_WHITE : 'var(--wallet-accent)';
  const textColor = isDashboard ? TEXT_WHITE : 'var(--wallet-text)';
  const mutedColor = isDashboard
    ? TEXT_WHITE_MUTED
    : 'var(--wallet-text-muted)';
  const secondaryColor = isDashboard
    ? TEXT_WHITE_MUTED
    : 'var(--wallet-text-secondary)';

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
      id: getStakeId(stake),
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
  // Food-for-thought must match the visible "X% of 200%" (current ROS 0–200). Use currentROSPercent when present; else convert completion (0–100) to ROS.
  const progressForQuote =
    typeof stake.currentROSPercent === 'number'
      ? Math.min(200, stake.currentROSPercent)
      : Math.min(200, progress * 2);
  const isCompleted = stake.status === 'completed';
  const hasReachedTarget = hasReached200Target(stake);

  // Confetti once per stake when it reaches 200% target
  useEffect(() => {
    if (!hasReachedTarget || typeof window === 'undefined') return;
    if (prefersReducedMotion()) return;
    const key = `${STAKES_200_CONFETTI_KEY}_${getStakeId(stake)}`;
    if (localStorage.getItem(key) === 'true') return;
    localStorage.setItem(key, 'true');
    celebrateStake200AndDashboard();
  }, [hasReachedTarget, getStakeId(stake)]);

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
  const cardClass = `${neuStyles['neu-card']} rounded-[18px] p-4 sm:p-6 md:p-7 ${isRegistrationBonus ? 'border-[1px] border-[rgba(0,155,242,0.25)]' : ''}`;

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
            {!isDashboard && (
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
            )}
            <div className="min-w-0">
              <p
                className="text-sm font-bold sm:text-base"
                style={{ color: textColor }}
              >
                {isRegistrationBonus && '🎁 '}$
                {maskAmounts ? MASK : fmt4(stake.amount)} USDT
              </p>
              <p className="text-xs" style={{ color: mutedColor }}>
                {isRegistrationBonus
                  ? 'Registration Bonus'
                  : formatDate(stake.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <span
              className={`${neuStyles['neu-badge']} text-[10px] sm:text-xs`}
              style={{
                color: isDashboard
                  ? TEXT_WHITE_MUTED
                  : 'var(--neu-text-secondary)',
              }}
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

        {/* Progress – bar uses design tokens so it shows in any context (dashboard, stakes page, etc.) */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span style={{ color: primaryColor, fontWeight: 600 }}>
              {typeof stake.currentROSPercent === 'number' &&
              typeof stake.targetROSPercent === 'number'
                ? `${stake.currentROSPercent}% of ${stake.targetROSPercent}%`
                : `${stake.progressToTarget || '0%'} of ${maxReturnCap}%`}
            </span>
          </div>
          <div
            className="overflow-hidden rounded-[16px]"
            style={{
              height: 10,
              background: 'var(--neu-bg)',
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
            }}
          >
            <motion.div
              initial={reducedMotion ? false : { width: 0 }}
              animate={
                reducedMotion ? false : { width: `${Math.min(progress, 100)}%` }
              }
              transition={{ duration: 0.6, delay: 0.15 }}
              className="h-full rounded-[16px] transition-[width] duration-300"
              style={{
                background: 'var(--neu-accent)',
              }}
            />
          </div>
          {/* Food for thought – one statement per 5% progression (0–200%) */}
          <p
            className="mt-2 text-[11px] leading-snug sm:text-xs"
            style={{ color: mutedColor, fontStyle: 'italic' }}
          >
            {getFoodForThoughtForProgress(progressForQuote)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
          <div
            className="flex items-center gap-2 rounded-[16px] p-2 sm:gap-3 sm:p-3"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
            }}
          >
            <DollarSign
              className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
              style={{
                color: isDashboard ? TEXT_WHITE : 'var(--wallet-accent)',
              }}
            />
            <p
              className="min-w-0 truncate text-sm font-bold sm:text-base"
              style={{ color: primaryColor }}
            >
              ${maskAmounts ? MASK : fmt4(stake.totalEarned)}
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-[16px] p-2 sm:gap-3 sm:p-3"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
            }}
          >
            <Target
              className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
              style={{
                color: isDashboard ? TEXT_WHITE : 'var(--wallet-accent)',
              }}
            />
            <p
              className="min-w-0 truncate text-sm font-bold sm:text-base"
              style={{ color: primaryColor }}
            >
              ${maskAmounts ? MASK : fmt4(stake.targetReturn)}
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
                  style={{ color: mutedColor }}
                />
              </div>
              <span
                className="text-xs font-medium sm:text-sm"
                style={{ color: primaryColor }}
              >
                Week {nextPayout.week}
              </span>
            </div>
          </div>
        )}

        {/* Remaining to Target */}
        {!isCompleted && (stake.remainingToTarget ?? 0) > 0 && (
          <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
            <Clock
              className="h-3 w-3 sm:h-4 sm:w-4"
              style={{ color: mutedColor }}
            />
            <span className="font-semibold" style={{ color: primaryColor }}>
              ${maskAmounts ? MASK : fmt4(stake.remainingToTarget)}
            </span>
          </div>
        )}

        {/* Goal: show goalTitle when present, otherwise label for goal (per backend sync doc) */}
        {getGoalDisplayLabel(stake) && (
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
              style={{ color: secondaryColor }}
            >
              🎯 {getGoalDisplayLabel(stake)}
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
              style={{ color: primaryColor }}
            >
              🎉 {maxReturnCap}% achieved
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
