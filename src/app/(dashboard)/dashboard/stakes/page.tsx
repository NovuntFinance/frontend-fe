'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus } from 'lucide-react';
import type { Stake, StakingDashboard } from '@/lib/queries/stakingQueries';
import { useStakeDashboard, getStakeId } from '@/lib/queries/stakingQueries';
import { useUIStore } from '@/store/uiStore';
import { StakeCard } from '@/components/stake/StakeCard';
import { TransactionHistory } from '@/components/wallet';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { prefersReducedMotion } from '@/lib/accessibility';
import neuStyles from '@/styles/neumorphic.module.css';

/* Dashboard design system: theme tokens (--neu-*) for light/dark */
const CARD_STYLE = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
} as const;

const INITIAL_STAKE_DISPLAY = 5;

export default function StakesPage() {
  const { openModal } = useUIStore();
  const { data: stakingData, isLoading, error, refetch } = useStakeDashboard();
  const [showAllActive, setShowAllActive] = React.useState(false);
  const [showAllCompleted, setShowAllCompleted] = React.useState(false);

  React.useEffect(() => {
    if (window.location.hash === '#transaction-history') {
      const timeout = setTimeout(() => {
        document
          .getElementById('transaction-history')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, []);

  // ✅ Auto-refresh logic: Re-fetch dashboard data at 00:00:00 BIT (1 PM Nigeria Time)
  // This ensures the UI updates the moment masked "Today's Profit" becomes available
  React.useEffect(() => {
    const calculateDelayUntilEOD = () => {
      const now = new Date();
      // Target is 13:00:05 UTC (with 5s buffer) to ensure backend has processed distribution
      // Note: Actual distribution times are configured in admin distribution schedule
      const target = new Date(now);
      target.setUTCHours(13, 0, 5, 0);

      // If it's already past 1 PM UTC today, set target to 1 PM tomorrow
      if (now.getTime() >= target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }

      return target.getTime() - now.getTime();
    };

    const delay = calculateDelayUntilEOD();
    console.log(
      `[Stakes Page] 🕒 Scheduling dashboard re-fetch in ${Math.round(delay / 1000 / 60)} minutes (at EOD transition)`
    );

    const timer = setTimeout(() => {
      console.log(
        '[Stakes Page] 🔄 EOD transition reached. Re-fetching data...'
      );
      refetch();
    }, delay);

    return () => clearTimeout(timer);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen lg:h-full lg:min-h-0">
        <div className="flex flex-col gap-5">
          <LoadingStates.Card height="h-64" />
          <LoadingStates.Card height="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col gap-5 lg:h-full lg:min-h-0">
        <div className="flex min-h-[60vh] flex-1 items-center justify-center p-4">
          <UserFriendlyError
            error={error}
            onRetry={() => window.location.reload()}
            variant="card"
            className="max-w-md"
          />
        </div>
      </div>
    );
  }

  // ✅ Strictly using backend fields for summary stats
  const {
    activeStakes = [] as Stake[],
    stakeHistory = [] as Stake[],
    summary = {} as StakingDashboard['data']['summary'],
  } = stakingData || {};

  const hasStakes = activeStakes && activeStakes.length > 0;

  const reducedMotion = prefersReducedMotion();

  return (
    <div className="min-h-screen lg:h-full lg:min-h-0">
      <div className="flex flex-col gap-5">
        {/* My Stakes – same design as Welcome Back card (dark blue + light blue + white) */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'var(--neu-bg)',
            boxShadow: 'var(--neu-shadow-raised)',
            border: '1px solid var(--neu-border)',
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
                style={{
                  background: 'var(--neu-accent)',
                  border: '1px solid var(--neu-border)',
                  color: 'var(--neu-accent-foreground)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-base font-bold sm:text-lg"
                  style={{ color: 'var(--neu-text-primary)' }}
                >
                  My Stakes
                </h1>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--neu-text-secondary)' }}
                >
                  Track your stakes and ROS progress
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openModal('create-stake')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--neu-focus-ring)] focus-visible:outline-none sm:px-5 sm:py-3 sm:text-base"
              style={{
                background: 'var(--neu-accent)',
                color: 'var(--neu-accent-foreground)',
                border: '1px solid var(--neu-border)',
              }}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Stake Now
            </button>
          </div>
        </motion.div>

        {/* Active Stakes */}
        {hasStakes ? (
          <div className="flex flex-col gap-5">
            <h2
              className="text-base font-bold sm:text-lg"
              style={{ color: 'var(--neu-text-primary)' }}
            >
              Active Stakes ({activeStakes.length})
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {(showAllActive
                ? activeStakes
                : activeStakes.slice(0, INITIAL_STAKE_DISPLAY)
              ).map((stake: Stake, index: number) => (
                <motion.div
                  key={getStakeId(stake)}
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <StakeCard stake={stake} variant="dashboard" />
                </motion.div>
              ))}
            </div>
            {activeStakes.length > INITIAL_STAKE_DISPLAY && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllActive((v) => !v)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium sm:px-5 sm:py-3 sm:text-base ${neuStyles['neu-button']}`}
                  style={{ color: 'var(--neu-accent)' }}
                >
                  {showAllActive
                    ? 'Show less'
                    : `More (${activeStakes.length - INITIAL_STAKE_DISPLAY} more)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            className="rounded-2xl p-5 text-center sm:p-6"
            style={CARD_STYLE}
          >
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
              style={{
                background: 'var(--neu-bg)',
                boxShadow: 'var(--neu-shadow-inset)',
                border: '1px solid var(--neu-border)',
                color: 'var(--neu-accent)',
              }}
            >
              <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h3
              className="mb-2 text-lg font-bold sm:text-xl"
              style={{ color: 'var(--neu-text-primary)' }}
            >
              No Active Stakes Yet
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              Start earning with Novunt&apos;s 200% Accumulated ROS staking
              model. Create your first stake and receive daily payouts!
            </p>
            <button
              type="button"
              onClick={() => openModal('create-stake')}
              className={`${neuStyles['neu-button-accent']} inline-flex items-center gap-2 px-5 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[var(--neu-focus-ring)] focus-visible:outline-none sm:text-base`}
            >
              <Plus className="h-5 w-5" />
              Create Your First Stake
            </button>
          </motion.div>
        )}

        {/* Completed Stakes */}
        {stakeHistory.length > 0 && (
          <div className="flex flex-col gap-5">
            <h2
              className="text-base font-bold sm:text-lg"
              style={{ color: 'var(--neu-text-primary)' }}
            >
              Completed Stakes ({stakeHistory.length})
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {(showAllCompleted
                ? stakeHistory
                : stakeHistory.slice(0, INITIAL_STAKE_DISPLAY)
              ).map((stake: Stake, index: number) => (
                <motion.div
                  key={getStakeId(stake)}
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + 0.1 * index }}
                >
                  <StakeCard stake={stake} variant="dashboard" />
                </motion.div>
              ))}
            </div>
            {stakeHistory.length > INITIAL_STAKE_DISPLAY && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllCompleted((v) => !v)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium sm:px-5 sm:py-3 sm:text-base ${neuStyles['neu-button']}`}
                  style={{ color: 'var(--neu-accent)' }}
                >
                  {showAllCompleted
                    ? 'Show less'
                    : `More (${stakeHistory.length - INITIAL_STAKE_DISPLAY} more)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transaction History – full platform history with search and filters */}
        <motion.div
          id="transaction-history"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <TransactionHistory variant="compact" />
        </motion.div>
      </div>
    </div>
  );
}
