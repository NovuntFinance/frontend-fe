'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import type { Stake } from '@/lib/queries/stakingQueries';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import { LoadingStates } from '@/components/ui/loading-states';
import { fmt4 } from '@/utils/formatters';

const NEU_SURFACE = '#131B2E';
const NEU_TEXT = 'rgba(255, 255, 255, 0.95)';
const NEU_TEXT_MUTED = 'rgba(255, 255, 255, 0.5)';
const NEU_SHADOW_DARK = 'rgba(0, 0, 0, 0.5)';
const NEU_SHADOW_LIGHT = 'rgba(255, 255, 255, 0.05)';
const ACCENT_PURPLE = '#a855f7';
const ACCENT_GREEN = '#22c55e';
const ACCENT_BLUE = '#009BF2';

function formatStakeDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SingleStakeCard({ stake }: { stake: Stake }) {
  const router = useRouter();
  const stakingConfig = useStakingConfig();
  const isRegistrationBonus =
    stake.isRegistrationBonus === true || stake.type === 'registration_bonus';
  const targetROSPercent = stake.targetROSPercent ?? (isRegistrationBonus ? 100 : stakingConfig.goalTargetPercentage ?? 200);
  const currentROSPercent = stake.currentROSPercent ?? 0;
  const progressNum = stake.progressToTarget
    ? parseFloat(stake.progressToTarget.replace('%', ''))
    : targetROSPercent > 0
      ? (currentROSPercent / targetROSPercent) * 100
      : 0;
  const progressClamp = Math.min(100, Math.max(0, progressNum));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => router.push('/dashboard/stakes')}
      className="cursor-pointer"
    >
      <div
        className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
        style={{
          background: NEU_SURFACE,
          boxShadow: `
            inset 8px 8px 16px ${NEU_SHADOW_DARK},
            inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
            inset 2px 2px 4px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.03)
          `,
        }}
      >
        {/* Top: icon, amount, date, status */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10"
              style={{ background: 'rgba(168, 85, 247, 0.2)' }}
            >
              <TrendingUp
                className="h-4 w-4 sm:h-5 sm:w-5"
                style={{ color: ACCENT_PURPLE }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="font-semibold sm:text-lg"
                style={{ color: ACCENT_PURPLE }}
              >
                ${fmt4(stake.amount)} USDT
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: NEU_TEXT_MUTED }}
              >
                {isRegistrationBonus ? 'Registration Bonus' : formatStakeDate(stake.createdAt)}
              </p>
            </div>
          </div>
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-xs"
            style={{
              background: 'rgba(0, 155, 242, 0.2)',
              color: ACCENT_BLUE,
            }}
          >
            {stake.status ? stake.status.charAt(0).toUpperCase() + stake.status.slice(1) : 'Active'}
          </span>
        </div>

        {/* Progress to target ROS */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span style={{ color: NEU_TEXT }}>
              Progress to {targetROSPercent}% ROS
            </span>
            <span style={{ color: NEU_TEXT }}>
              {typeof stake.currentROSPercent === 'number' && typeof stake.targetROSPercent === 'number'
                ? `${stake.currentROSPercent}% of ${stake.targetROSPercent}% ROS`
                : `${stake.progressToTarget || '0%'} of ${targetROSPercent}% ROS`}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: 'rgba(0, 0, 0, 0.25)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressClamp}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${ACCENT_PURPLE}, ${ACCENT_BLUE})`,
              }}
            />
          </div>
        </div>

        {/* Total Earned & Target boxes */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-xl border p-3"
            style={{
              borderColor: 'rgba(34, 197, 94, 0.4)',
              background: 'rgba(34, 197, 94, 0.08)',
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" style={{ color: ACCENT_GREEN }} />
              <span className="text-xs font-medium" style={{ color: ACCENT_GREEN }}>
                Total Earned
              </span>
            </div>
            <p className="text-base font-bold sm:text-lg" style={{ color: NEU_TEXT }}>
              ${fmt4(stake.totalEarned)}
            </p>
          </div>
          <div
            className="rounded-xl border p-3"
            style={{
              borderColor: 'rgba(0, 155, 242, 0.4)',
              background: 'rgba(0, 155, 242, 0.08)',
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" style={{ color: ACCENT_BLUE }} />
              <span className="text-xs font-medium" style={{ color: ACCENT_BLUE }}>
                Target
              </span>
            </div>
            <p className="text-base font-bold sm:text-lg" style={{ color: NEU_TEXT }}>
              ${fmt4(stake.targetReturn)}
            </p>
          </div>
        </div>

        {/* Remaining */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="flex items-center gap-1.5" style={{ color: NEU_TEXT_MUTED }}>
            <Clock className="h-3.5 w-3.5" />
            Remaining
          </span>
          <span className="font-medium" style={{ color: NEU_TEXT }}>
            ${fmt4(stake.remainingToTarget)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Neumorphic Active Stakes card(s). Renders directly under Daily ROS Performance.
 * One neumorphic card per active stake; full width to align with other dashboard cards.
 */
export function ActiveStakesCard() {
  const router = useRouter();
  const { data: stakingData, isLoading, error } = useStakeDashboard();
  const activeStakes: Stake[] = stakingData?.activeStakes ?? [];
  const count = activeStakes.length;

  const goToStakes = () => router.push('/dashboard/stakes');

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
      >
        {isLoading ? (
          <div
            role="button"
            tabIndex={0}
            onClick={goToStakes}
            onKeyDown={(e) => e.key === 'Enter' && goToStakes()}
            className="cursor-pointer rounded-2xl p-5 sm:p-6 transition-opacity hover:opacity-95"
            style={{
              background: NEU_SURFACE,
              boxShadow: `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `,
            }}
          >
            <LoadingStates.Card height="h-48" />
          </div>
        ) : error ? (
          <div
            role="button"
            tabIndex={0}
            onClick={goToStakes}
            onKeyDown={(e) => e.key === 'Enter' && goToStakes()}
            className="cursor-pointer rounded-2xl p-5 text-center text-sm sm:p-6 transition-opacity hover:opacity-95"
            style={{
              background: NEU_SURFACE,
              color: NEU_TEXT_MUTED,
              boxShadow: `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `,
            }}
          >
            Unable to load stakes. Try again later.
          </div>
        ) : count === 0 ? (
          <div
            role="button"
            tabIndex={0}
            onClick={goToStakes}
            onKeyDown={(e) => e.key === 'Enter' && goToStakes()}
            className="cursor-pointer rounded-2xl p-6 text-center sm:p-8 transition-opacity hover:opacity-95"
            style={{
              background: NEU_SURFACE,
              boxShadow: `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `,
            }}
          >
            <p className="mb-2 text-sm font-medium" style={{ color: NEU_TEXT }}>
              No Active Stakes Yet
            </p>
            <p className="text-xs" style={{ color: NEU_TEXT_MUTED }}>
              Create a stake to start earning 200% ROS.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeStakes.map((stake) => (
              <SingleStakeCard key={stake._id} stake={stake} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
