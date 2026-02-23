'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import type { Stake } from '@/lib/queries/stakingQueries';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { fmt4 } from '@/utils/formatters';

/* Theme-aware: use var(--app-surface), var(--app-text-*), var(--app-shadow-*), var(--app-border) */
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

/** Circular progress: neumorphic ring + gradient arc (platform purple → blue), center value + label */
function CircularProgress({
  valuePercent,
  valueLabel,
  size = 100,
  strokeWidth = 10,
  embedded,
  gradientId,
}: {
  valuePercent: number;
  valueLabel: string;
  size?: number;
  strokeWidth?: number;
  embedded?: boolean;
  gradientId: string;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset =
    circumference * (1 - Math.min(100, Math.max(0, valuePercent)) / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: embedded ? 'rgba(15, 26, 52, 0.5)' : 'var(--app-surface)',
          boxShadow: embedded
            ? 'inset 4px 4px 12px rgba(4, 8, 18, 0.6), inset -4px -4px 12px rgba(25, 40, 72, 0.3)'
            : 'inset 6px 6px 12px var(--app-shadow-dark), inset -6px -6px 12px var(--app-shadow-light)',
        }}
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={ACCENT_PURPLE} />
              <stop offset="100%" stopColor={ACCENT_BLUE} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: size * 0.22,
              color: 'var(--app-text-primary)',
            }}
          >
            {Math.round(valuePercent)}%
          </span>
          <span
            className="text-[10px] font-medium sm:text-xs"
            style={{ color: 'var(--app-text-muted)' }}
          >
            {valueLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function SingleStakeCard({
  stake,
  embedded,
}: {
  stake: Stake;
  embedded?: boolean;
}) {
  const router = useRouter();
  const gradientId = React.useId().replace(/:/g, '');
  const stakingConfig = useStakingConfig();
  const isRegistrationBonus =
    stake.isRegistrationBonus === true || stake.type === 'registration_bonus';
  const targetROSPercent =
    stake.targetROSPercent ??
    (isRegistrationBonus ? 100 : (stakingConfig.goalTargetPercentage ?? 200));
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
        style={
          embedded
            ? {
                background: 'rgba(25, 40, 72, 0.6)',
                boxShadow: `
                  inset 4px 4px 10px rgba(4, 8, 18, 0.5),
                  inset -4px -4px 10px rgba(25, 40, 72, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.06)
                `,
              }
            : {
                background: 'var(--app-surface)',
                boxShadow: `
                  inset 8px 8px 16px var(--app-shadow-dark),
                  inset -8px -8px 16px var(--app-shadow-light),
                  inset 2px 2px 4px rgba(0, 0, 0, 0.15),
                  inset -2px -2px 4px var(--app-shadow-light),
                  0 0 0 1px var(--app-border)
                `,
              }
        }
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
                ${fmt4(stake.amount)}
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--app-text-muted)' }}
              >
                {isRegistrationBonus
                  ? 'Bonus'
                  : formatStakeDate(stake.createdAt)}
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
            {stake.status
              ? stake.status.charAt(0).toUpperCase() + stake.status.slice(1)
              : 'Active'}
          </span>
        </div>

        {/* Circular progress: neumorphic ring + gradient arc (platform purple → blue), center value + label */}
        <div className="mb-4 flex justify-center">
          <CircularProgress
            valuePercent={progressClamp}
            valueLabel="ROS"
            size={100}
            strokeWidth={10}
            embedded={embedded}
            gradientId={gradientId}
          />
        </div>

        {/* Earned, target, remaining — short labels only */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-xl border p-3"
            style={{
              borderColor: 'rgba(34, 197, 94, 0.4)',
              background: 'rgba(34, 197, 94, 0.08)',
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <DollarSign
                className="h-3.5 w-3.5"
                style={{ color: ACCENT_GREEN }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: ACCENT_GREEN }}
              >
                Earned
              </span>
            </div>
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: 'var(--app-text-primary)' }}
            >
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
              <span
                className="text-xs font-medium"
                style={{ color: ACCENT_BLUE }}
              >
                Target
              </span>
            </div>
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: 'var(--app-text-primary)' }}
            >
              ${fmt4(stake.targetReturn)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span
            className="flex items-center gap-1.5"
            style={{ color: 'var(--app-text-muted)' }}
          >
            <Clock className="h-3.5 w-3.5" />
            Left
          </span>
          <span
            className="font-medium"
            style={{ color: 'var(--app-text-primary)' }}
          >
            ${fmt4(stake.remainingToTarget)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** When true, card is rendered inside dashboard neumorphic container (no outer card, content on #0D162C). */
interface ActiveStakesCardProps {
  embedded?: boolean;
}

/**
 * Neumorphic Active Stakes card(s). Renders directly under Daily ROS Performance.
 * One neumorphic card per active stake; full width to align with other dashboard cards.
 * Use embedded=true when wrapped by the dashboard's shared container (#0D162C).
 */
export function ActiveStakesCard({ embedded = false }: ActiveStakesCardProps) {
  const router = useRouter();
  const openModal = useUIStore((s) => s.openModal);
  const { data: stakingData, isLoading, error } = useStakeDashboard();
  const activeStakes: Stake[] = stakingData?.activeStakes ?? [];
  const count = activeStakes.length;

  const goToStakes = () => router.push('/dashboard/stakes');
  const openCreateStakeModal = () => openModal('create-stake');

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
      >
        {isLoading ? (
          <button
            type="button"
            onClick={goToStakes}
            className={`w-full cursor-pointer text-left transition-opacity hover:opacity-95 ${embedded ? 'min-h-[120px]' : 'rounded-2xl p-5 sm:p-6'}`}
            style={
              embedded
                ? undefined
                : {
                    background: 'var(--app-surface)',
                    boxShadow: `
                      inset 8px 8px 16px var(--app-shadow-dark),
                      inset -8px -8px 16px var(--app-shadow-light),
                      0 0 0 1px var(--app-border)
                    `,
                  }
            }
          >
            <LoadingStates.Card height="h-48" />
          </button>
        ) : error ? (
          <button
            type="button"
            onClick={goToStakes}
            className={`w-full cursor-pointer text-center text-sm transition-opacity hover:opacity-95 ${embedded ? 'py-6' : 'rounded-2xl p-5 sm:p-6'}`}
            style={
              embedded
                ? { color: 'rgba(0, 155, 242, 0.8)' }
                : {
                    background: 'var(--app-surface)',
                    color: 'var(--app-text-muted)',
                    boxShadow: `
                      inset 8px 8px 16px var(--app-shadow-dark),
                      inset -8px -8px 16px var(--app-shadow-light),
                      0 0 0 1px var(--app-border)
                    `,
                  }
            }
          >
            Unable to load stakes. Try again later.
          </button>
        ) : count === 0 ? (
          <div
            className={`text-center ${embedded ? 'py-4 sm:py-6' : 'rounded-2xl p-6 sm:p-8'}`}
            style={
              embedded
                ? undefined
                : {
                    background: 'var(--app-surface)',
                    boxShadow: `
                      inset 8px 8px 16px var(--app-shadow-dark),
                      inset -8px -8px 16px var(--app-shadow-light),
                      0 0 0 1px var(--app-border)
                    `,
                  }
            }
          >
            <EmptyStates.EmptyState
              icon={
                <TrendingUp
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  style={embedded ? { color: '#009BF2' } : undefined}
                />
              }
              title="No active stakes"
              description="Create one to start earning up to 200%."
              variant="neumorphic"
              action={{
                label: 'Create stake',
                onClick: openCreateStakeModal,
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {activeStakes.map((stake) => (
              <SingleStakeCard
                key={stake._id}
                stake={stake}
                embedded={embedded}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
