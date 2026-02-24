'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBar,
  TrendingUp,
  Lock,
  ClipboardList,
  Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { fmt4 } from '@/utils/formatters';

const ACCENT_BLUE = '#009BF2';

/** 40 Food for Thought quotes — one shown per 5% progress (0%, 5%, 10%, … up to 195%). */
const FOOD_FOR_THOUGHT_QUOTES: readonly string[] = [
  'Every journey begins with a single step.',
  'Great start! Your wealth is growing.',
  'Consistency is the key to success.',
  'Small steps lead to big results.',
  'You are building something real.',
  'Patience and persistence pay off.',
  'Your future self will thank you.',
  'Progress, not perfection.',
  'Stay the course.',
  'You are closer than you think.',
  "Momentum is on your side.",
  "Your dedication is paying off.",
  "Halfway there — keep going.",
  "Compound growth works in your favor.",
  "Every percent counts.",
  "You're in the home stretch.",
  "Success is a habit.",
  "Excellence is a choice.",
  "Almost there — don't stop now.",
  "Victory favors the persistent.",
  "You've crossed 100% — doubling in progress.",
  "Beyond the initial goal — keep building.",
  "Your stake is working for you.",
  "Growth compounds over time.",
  "Steady progress wins.",
  "You're building lasting wealth.",
  "Discipline creates freedom.",
  "The best time to start was yesterday; the next best is now.",
  "Your commitment is your edge.",
  "Small daily gains add up.",
  "Trust the process.",
  "You're ahead of where you started.",
  "Courage is not the absence of fear, but the triumph over it.",
  "The biggest risk is not taking any.",
  "Your money is working while you focus on life.",
  "Consistency beats intensity.",
  "You're writing your own financial story.",
  "Every milestone deserves a pause — then keep going.",
  "200% is in sight — stay focused.",
  "You've come far. The rest is within reach.",
];

/** Pick one quote by 5% progress bucket: 0–4.99% → quote 0, 5–9.99% → quote 1, … 195–200% → quote 39. */
function getQuoteForProgress(progressPercent: number): string {
  const index = Math.min(
    39,
    Math.max(0, Math.floor(progressPercent / 5))
  );
  return FOOD_FOR_THOUGHT_QUOTES[index] ?? FOOD_FOR_THOUGHT_QUOTES[0];
}

/** When true, card is rendered inside dashboard neumorphic container (#0D162C). */
interface ActiveStakesCardProps {
  embedded?: boolean;
}

/**
 * ROS Overview stake section: Portfolio Pulse, progress, 2x2 metrics (Target, Earned, Left, Staked),
 * and Food for Thought quote. Uses same API (useStakeDashboard) and platform colors/neumorphism.
 */
export function ActiveStakesCard({ embedded = false }: ActiveStakesCardProps) {
  const router = useRouter();
  const openModal = useUIStore((s) => s.openModal);
  const { data: dashboardData, isLoading, error } = useStakeDashboard();

  const activeStakes = dashboardData?.activeStakes ?? [];
  const count = activeStakes.length;

  // Derive all metrics from activeStakes so dashboard matches Active Stakes card data exactly
  const { metrics, progressPercent } = useMemo(() => {
    const staked = activeStakes.reduce(
      (sum, s) => sum + (Number(s?.amount ?? 0) || 0),
      0
    );
    const earned = activeStakes.reduce(
      (sum, s) => sum + (Number(s?.totalEarned ?? 0) || 0),
      0
    );
    const target = activeStakes.reduce(
      (sum, s) => sum + (Number(s?.targetReturn ?? 0) || 0),
      0
    );
    const left = activeStakes.reduce(
      (sum, s) => sum + (Number(s?.remainingToTarget ?? 0) || 0),
      0
    );
    // Match Active Stakes card: "X% of 200% ROS" = current ROS % = (earned / staked) * 100
    const progressNum =
      staked > 0 ? Math.min(200, (earned / staked) * 100) : 0;
    return {
      metrics: { target, earned, left, staked },
      progressPercent: progressNum,
    };
  }, [activeStakes]);

  const quote = useMemo(
    () => getQuoteForProgress(progressPercent),
    [progressPercent]
  );

  const goToStakes = useCallback(() => router.push('/dashboard/stakes'), [router]);
  const openCreateStakeModal = () => openModal('create-stake');

  // Single card style: match Activity Feed / cards above (one border, no double)
  const cardWrapperStyle = embedded
    ? {
        background: '#0D162C',
        boxShadow:
          '8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)',
        border: '1px solid var(--app-border)',
      }
    : {
        background: 'var(--app-surface)',
        boxShadow: `
          inset 6px 6px 14px var(--app-shadow-dark),
          inset -6px -6px 14px var(--app-shadow-light),
          0 0 0 1px var(--app-border)
        `,
      };
  const raisedShadow =
    '6px 6px 12px var(--app-shadow-dark), -6px -6px 12px var(--app-shadow-light)';
  const insetShadow =
    'inset 4px 4px 10px var(--app-shadow-dark), inset -4px -4px 10px var(--app-shadow-light)';

  const metricCards = [
    { label: 'STAKED', value: `$${fmt4(metrics.staked)}`, icon: Lock },
    { label: 'TARGET', value: `$${fmt4(metrics.target)}`, icon: Target },
    { label: 'EARNED', value: `$${fmt4(metrics.earned)}`, icon: TrendingUp },
    {
      label: 'LEFT',
      value: `$${fmt4(metrics.left)}`,
      icon: ClipboardList,
    },
  ] as const;

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
            className="w-full cursor-pointer rounded-2xl p-5 text-left transition-opacity hover:opacity-95 sm:p-6"
            style={cardWrapperStyle}
            title="View all stakes"
          >
            <LoadingStates.Card height="h-48" />
          </button>
        ) : error ? (
          <button
            type="button"
            onClick={goToStakes}
            className={`w-full cursor-pointer text-center text-sm transition-opacity hover:opacity-95 rounded-2xl p-5 sm:p-6`}
            style={{
              ...cardWrapperStyle,
              color: embedded ? 'rgba(0, 155, 242, 0.8)' : 'var(--app-text-muted)',
            }}
            title="View stakes page"
          >
            Unable to load stakes. Try again later.
          </button>
        ) : count === 0 ? (
          <div
            className={`text-center rounded-2xl p-6 sm:p-8`}
            style={cardWrapperStyle}
          >
            <EmptyStates.EmptyState
              icon={
                <ChartBar
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  style={embedded ? { color: ACCENT_BLUE } : undefined}
                />
              }
              title="No stakes yet"
              description="Create a stake to start earning up to 200%."
              variant="neumorphic"
              action={{
                label: 'Create stake',
                onClick: openCreateStakeModal,
              }}
            />
          </div>
        ) : (
          <div
            onClick={goToStakes}
            className="cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-300 sm:min-h-[200px] sm:p-5"
            style={cardWrapperStyle}
          >
            <div>
              {/* Progress bar (0–200% ROS: bar fill = progress/200, capped at 100% width) */}
              <div className="flex items-center gap-3">
                <div
                  className="relative h-3 w-full overflow-hidden rounded-full sm:h-4"
                  style={{
                    background: embedded
                      ? 'rgba(4, 8, 18, 0.6)'
                      : 'var(--app-shadow-dark)',
                    boxShadow: insetShadow,
                  }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${ACCENT_BLUE}, rgba(168, 85, 247, 0.9))`,
                      boxShadow: `0 0 12px ${ACCENT_BLUE}40`,
                    }}
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${Math.min(100, (progressPercent / 200) * 100)}%`,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span
                  className="flex-shrink-0 text-sm font-bold tabular-nums sm:text-base"
                  style={{ color: 'var(--app-text-primary)' }}
                >
                  {Math.round(progressPercent)}%
                </span>
              </div>

              {/* 2x2 metric cards - raised neumorphic */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                {metricCards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3"
                    style={{
                      background: embedded
                        ? 'linear-gradient(145deg, rgba(15, 26, 52, 0.8), rgba(21, 34, 68, 0.7))'
                        : 'var(--app-surface)',
                      boxShadow: raisedShadow,
                    }}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
                      style={{ color: ACCENT_BLUE }}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[10px] font-medium uppercase tracking-wider sm:text-xs"
                        style={{ color: ACCENT_BLUE }}
                      >
                        {label}
                      </p>
                      <p
                        className="truncate text-sm font-bold tabular-nums sm:text-base"
                        style={{ color: 'var(--app-text-primary)' }}
                        title={value}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Food for Thought - recessed neumorphic */}
              <div className="mt-4">
                <div
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: ACCENT_BLUE }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: ACCENT_BLUE }}
                  />
                  FOOD FOR THOUGHT
                </div>
                <div
                  className="rounded-xl px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3"
                  style={{
                    background: embedded
                      ? 'rgba(4, 8, 18, 0.5)'
                      : 'var(--app-shadow-dark)',
                    boxShadow: insetShadow,
                  }}
                >
                  <p
                    className="text-xs leading-relaxed sm:text-sm"
                    style={{ color: 'var(--app-text-secondary)' }}
                  >
                    {quote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
