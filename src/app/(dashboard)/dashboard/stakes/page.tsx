'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Wallet,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react';
import type { Stake, StakingDashboard } from '@/lib/queries/stakingQueries';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import { useUIStore } from '@/store/uiStore';
import { StakeCard } from '@/components/stake/StakeCard';
import { StakingTransactionHistory } from '@/components/stake/StakingTransactionHistory';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { fmt4, pct4 } from '@/utils/formatters';
import { prefersReducedMotion } from '@/lib/accessibility';
import walletStyles from '@/styles/wallet-page.module.css';
import neuStyles from '@/styles/neumorphic.module.css';

function StakeStatCard({
  reducedMotion,
  delay,
  icon: Icon,
  title,
  subtitle,
  value,
  helper,
}: {
  reducedMotion: boolean;
  delay: number;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  subtitle: string;
  value: string;
  helper?: string;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}
    >
      <div className="mb-1 flex items-center gap-2">
        <Icon
          className="h-4 w-4 sm:h-5 sm:w-5"
          style={{ color: 'var(--neu-accent)' }}
        />
        <p
          className={walletStyles.labelUppercase}
          style={{ color: 'var(--wallet-text-muted)' }}
        >
          {title}
        </p>
      </div>
      <p className="mb-2 text-xs" style={{ color: 'var(--wallet-label)' }}>
        {subtitle}
      </p>
      <p
        className="text-xl font-bold sm:text-2xl md:text-3xl"
        style={{ color: 'var(--wallet-accent)' }}
      >
        {value}
      </p>
      {helper && (
        <p
          className="mt-1 text-xs sm:text-sm"
          style={{ color: 'var(--wallet-text-muted)' }}
        >
          {helper}
        </p>
      )}
    </motion.div>
  );
}

export default function StakesPage() {
  const { openModal } = useUIStore();
  const { data: stakingData, isLoading, error, refetch } = useStakeDashboard();

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

  // Rotating featured stake: one active + one completed, cycle every 35s (hooks must be before any return)
  const ROTATE_INTERVAL_MS = 35000;
  const [activeRotateIndex, setActiveRotateIndex] = React.useState(0);
  const [completedRotateIndex, setCompletedRotateIndex] = React.useState(0);
  const activeStakesForRotate = stakingData?.activeStakes ?? [];
  const stakeHistoryForRotate = stakingData?.stakeHistory ?? [];
  React.useEffect(() => {
    if (activeStakesForRotate.length <= 1 && stakeHistoryForRotate.length <= 1)
      return;
    const t = setInterval(() => {
      if (activeStakesForRotate.length > 1) {
        setActiveRotateIndex((i) => (i + 1) % activeStakesForRotate.length);
      }
      if (stakeHistoryForRotate.length > 1) {
        setCompletedRotateIndex((i) => (i + 1) % stakeHistoryForRotate.length);
      }
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [activeStakesForRotate.length, stakeHistoryForRotate.length]);

  if (isLoading) {
    return (
      <div className={walletStyles.walletPage}>
        <div className={walletStyles.pageContainer}>
          <div className={walletStyles.pageContainerInner}>
            <div className="space-y-6">
              <LoadingStates.Card height="h-64" />
              <div className="grid gap-4 md:grid-cols-2">
                <LoadingStates.Card height="h-48" />
                <LoadingStates.Card height="h-48" />
              </div>
              <LoadingStates.Card height="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={walletStyles.walletPage}>
        <div className={walletStyles.pageContainer}>
          <div className="flex min-h-[60vh] items-center justify-center p-4">
            <UserFriendlyError
              error={error}
              onRetry={() => window.location.reload()}
              variant="card"
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Strictly using backend fields for summary stats
  const {
    activeStakes = [] as Stake[],
    stakeHistory = [] as Stake[],
    summary = {} as StakingDashboard['data']['summary'],
    wallets = {
      fundedWallet: 0,
      earningWallet: 0,
      totalAvailableBalance: 0,
      description: {
        fundedWallet: '',
        earningWallet: '',
      },
    } as StakingDashboard['data']['wallets'],
  } = stakingData || {};

  const hasStakes = activeStakes && activeStakes.length > 0;

  const totalEarnedROS = Number(summary?.totalEarnedFromROS || 0);

  // ✅ Strictly rely on API values - no more local fallback calculations
  const todayProfitAmount = Number(summary?.todaysProfit || 0);
  const displayROSPercentage = Number(summary?.todaysROSPercentage || 0);

  console.log('[Stakes Page] Summary stats:', {
    todayProfitAmount,
    displayROSPercentage,
    progressToTarget: summary?.progressToTarget,
    totalEarnedROS,
  });

  const reducedMotion = prefersReducedMotion();

  const featuredActiveStake =
    activeStakes.length > 0
      ? activeStakes[activeRotateIndex % activeStakes.length]
      : null;
  const featuredCompletedStake =
    stakeHistory.length > 0
      ? stakeHistory[completedRotateIndex % stakeHistory.length]
      : null;

  return (
    <div className={walletStyles.walletPage}>
      <div className={walletStyles.pageContainer}>
        <div
          className={`${walletStyles.pageContainerInner} space-y-4 sm:space-y-6`}
        >
          {/* My Stakes – neumorphic hero card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${walletStyles.cardRaised} rounded-[18px] p-4 sm:p-6`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`${walletStyles.nxpStatusIconWrap} flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14`}
                  style={{ color: 'var(--wallet-accent)' }}
                >
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-base font-bold sm:text-lg"
                    style={{ color: 'var(--wallet-text)' }}
                  >
                    My Stakes
                  </h1>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: 'var(--wallet-text-muted)' }}
                  >
                    Track your stakes and ROS progress
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openModal('create-stake')}
                className={`${neuStyles['neu-button-accent']} inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[var(--wallet-focus-ring)] focus-visible:outline-none sm:px-5 sm:py-3 sm:text-base`}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Stake Now
              </button>
            </div>
          </motion.div>

          {/* Overview stat cards – neumorphic, same pattern as Wallets */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <StakeStatCard
              reducedMotion={reducedMotion}
              delay={0.2}
              icon={DollarSign}
              title="Total Earned (ROS)"
              subtitle="Earnings from regular stakes only"
              value={`$${fmt4(totalEarnedROS)}`}
            />
            <StakeStatCard
              reducedMotion={reducedMotion}
              delay={0.25}
              icon={Wallet}
              title="Total Staked"
              subtitle="Total amount staked across all stakes"
              value={`$${fmt4(
                activeStakes.reduce((sum: number, stake: Stake) => {
                  const amount = Number(stake?.amount || 0);
                  return sum + (isNaN(amount) ? 0 : amount);
                }, 0)
              )}`}
            />
            <StakeStatCard
              reducedMotion={reducedMotion}
              delay={0.4}
              icon={Calendar}
              title="Today's Profit"
              subtitle="Daily profit from active stakes"
              value={`$${fmt4(todayProfitAmount)}`}
              helper={
                displayROSPercentage > 0
                  ? pct4(displayROSPercentage)
                  : undefined
              }
            />
            <StakeStatCard
              reducedMotion={reducedMotion}
              delay={0.45}
              icon={TrendingUp}
              title="Overall Progress"
              subtitle="Progress toward target returns"
              value={summary?.progressToTarget || '0.00%'}
              helper={
                summary?.targetTotalReturns && summary.targetTotalReturns > 0
                  ? `Target: $${fmt4(summary.targetTotalReturns)}`
                  : undefined
              }
            />
          </div>

          {/* Active Stake – single rotating card */}
          {featuredActiveStake && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2
                className="mb-3 text-base font-bold sm:text-lg"
                style={{ color: 'var(--wallet-text)' }}
              >
                Active Stake
              </h2>
              <div className="relative min-h-[300px] w-full max-w-md">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={featuredActiveStake._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <StakeCard stake={featuredActiveStake} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Completed Stakes – single rotating card */}
          {featuredCompletedStake && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <h2
                className="mb-3 text-base font-bold sm:text-lg"
                style={{ color: 'var(--wallet-text)' }}
              >
                Completed Stakes
              </h2>
              <div className="relative min-h-[300px] w-full max-w-md">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={featuredCompletedStake._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <StakeCard stake={featuredCompletedStake} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Available to Stake – neumorphic card */}
          {wallets && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}
            >
              <div className="mb-4 flex items-center gap-2">
                <Wallet
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={{ color: 'var(--wallet-accent)' }}
                />
                <h2
                  className="text-base font-bold sm:text-lg"
                  style={{ color: 'var(--wallet-text)' }}
                >
                  Available to Stake
                </h2>
              </div>
              <p
                className="mb-4 text-xs sm:text-sm"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                Your available balance for staking
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                <div>
                  <p
                    className={walletStyles.labelUppercase}
                    style={{ color: 'var(--wallet-label)', marginBottom: 4 }}
                  >
                    Deposit Wallet
                  </p>
                  <p
                    className="text-lg font-bold sm:text-xl"
                    style={{ color: 'var(--wallet-accent)' }}
                  >
                    ${fmt4(Number(wallets.fundedWallet) || 0)}
                  </p>
                  {wallets.description?.fundedWallet && (
                    <p
                      className="mt-1 text-[10px] sm:text-xs"
                      style={{ color: 'var(--wallet-text-muted)' }}
                    >
                      {wallets.description.fundedWallet}
                    </p>
                  )}
                </div>
                <div>
                  <p
                    className={walletStyles.labelUppercase}
                    style={{ color: 'var(--wallet-label)', marginBottom: 4 }}
                  >
                    Earnings Wallet
                  </p>
                  <p
                    className="text-lg font-bold sm:text-xl"
                    style={{ color: 'var(--wallet-accent)' }}
                  >
                    ${fmt4(Number(wallets.earningWallet) || 0)}
                  </p>
                  {wallets.description?.earningWallet && (
                    <p
                      className="mt-1 text-[10px] sm:text-xs"
                      style={{ color: 'var(--wallet-text-muted)' }}
                    >
                      {wallets.description.earningWallet}
                    </p>
                  )}
                </div>
                <div>
                  <p
                    className={walletStyles.labelUppercase}
                    style={{ color: 'var(--wallet-label)', marginBottom: 4 }}
                  >
                    Total Available
                  </p>
                  <p
                    className="text-lg font-bold sm:text-xl"
                    style={{ color: 'var(--wallet-accent)' }}
                  >
                    ${fmt4(Number(wallets.totalAvailableBalance) || 0)}
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal('create-stake')}
                    className={`${neuStyles['neu-button-accent']} mt-3 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-[var(--wallet-focus-ring)] focus-visible:outline-none sm:px-4 sm:py-2.5 sm:text-sm`}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    Stake Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Stakes */}
          {hasStakes ? (
            <div>
              <h2
                className="mb-4 text-lg font-bold sm:text-xl"
                style={{ color: 'var(--wallet-text)' }}
              >
                Active Stakes ({activeStakes.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeStakes.map((stake: Stake, index: number) => (
                  <motion.div
                    key={stake._id}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <StakeCard stake={stake} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              className={`rounded-[18px] p-8 text-center sm:p-12 ${neuStyles['neu-card']}`}
            >
              <div
                className={`${walletStyles.nxpStatusIconWrap} mx-auto mb-4 flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16`}
                style={{ color: 'var(--wallet-accent)' }}
              >
                <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3
                className="mb-2 text-lg font-bold sm:text-xl"
                style={{ color: 'var(--wallet-text)' }}
              >
                No Active Stakes Yet
              </h3>
              <p
                className="mb-6 text-sm"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                Start earning with Novunt&apos;s 200% Accumulated ROS staking
                model. Create your first stake and receive daily payouts!
              </p>
              <button
                type="button"
                onClick={() => openModal('create-stake')}
                className={`${neuStyles['neu-button-accent']} inline-flex items-center gap-2 px-5 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[var(--wallet-focus-ring)] focus-visible:outline-none sm:text-base`}
              >
                <Plus className="h-5 w-5" />
                Create Your First Stake
              </button>
            </motion.div>
          )}

          {/* Completed Stakes */}
          {stakeHistory.length > 0 && (
            <>
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FileText
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    style={{ color: 'var(--wallet-accent)' }}
                  />
                  <div>
                    <h2
                      className="text-base font-bold sm:text-lg"
                      style={{ color: 'var(--wallet-text)' }}
                    >
                      Completed Stakes ({stakeHistory.length})
                    </h2>
                    <p
                      className="text-xs sm:text-sm"
                      style={{ color: 'var(--wallet-text-muted)' }}
                    >
                      Your completed staking positions
                    </p>
                  </div>
                </div>
              </motion.div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {stakeHistory.slice(0, 6).map((stake: Stake, index: number) => (
                  <motion.div
                    key={stake._id}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 + 0.1 * index }}
                  >
                    <StakeCard stake={stake} />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* How Novunt Staking Works – neumorphic card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}
          >
            <div className="mb-4 flex items-center gap-2 sm:gap-3">
              <AlertCircle
                className="h-4 w-4 sm:h-5 sm:w-5"
                style={{ color: 'var(--wallet-accent)' }}
              />
              <div>
                <h2
                  className="text-base font-bold sm:text-lg"
                  style={{ color: 'var(--wallet-text)' }}
                >
                  How Novunt Staking Works
                </h2>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--wallet-text-muted)' }}
                >
                  Understanding the staking model
                </p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--wallet-text-secondary)' }}
              >
                {summary?.stakingModel ||
                  'Daily ROS based on Novunt trading performance until 200% returns'}
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                {summary?.note ||
                  'Stakes are permanent commitments. You benefit through daily ROS payouts to your Earning Wallet until 200% maturity.'}
              </p>
            </div>
          </motion.div>

          {/* Staking Transaction History */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <StakingTransactionHistory />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
