'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Clock,
  Circle,
  Star,
  Gift,
  Send,
  Award,
  CreditCard,
  Settings,
  HelpCircle,
} from 'lucide-react';
// Semantic aliases: use type-resolving icons (Trophy/Flame/BookOpen/Sparkles have declaration issues in some setups)
const Trophy = Award;
const Flame = Clock;
const BookOpen = HelpCircle;
const Sparkles = Star;
import {
  useWalletBalance,
  useActiveStakes,
  useDashboardOverview,
} from '@/lib/queries';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import { useTransactionHistory } from '@/hooks/useWallet';
import { LoadingStates } from '@/components/ui/loading-states';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StakeCard } from '@/components/stake/StakeCard';
import walletStyles from '@/styles/wallet-page.module.css';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AuthErrorFallback } from '@/components/dashboard/AuthErrorFallback';
import { LiveTradingSignals } from '@/components/dashboard/LiveTradingSignals';
import { LivePlatformActivities } from '@/components/dashboard/LivePlatformActivities';
import { RosCalendarCard } from '@/components/dashboard/RosCalendarCard';
import { NeumorphicCarouselDots } from '@/components/ui/neumorphic-carousel-dots';
import { StakingStreakModal } from '@/components/dashboard/StakingStreakModal';
import { WelcomeModal } from '@/components/auth/WelcomeModal';
import { RankProgressModal } from '@/components/rank-progress/RankProgressModal';
import { WelcomeBackCard } from '@/components/dashboard/WelcomeBackCard';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUIStore } from '@/store/uiStore';
import { useUser } from '@/hooks/useUser';
import { usePlatformActivity } from '@/hooks/usePlatformActivity';
import { useWallet } from '@/hooks/useWallet';
import { useResponsive } from '@/hooks/useResponsive';
import type { PlatformActivity } from '@/types/platformActivity';

/**
 * Modern Dashboard Home Page
 * Redesigned with premium animations and modern UI
 */
export default function DashboardPage() {
  const balanceVisible = useUIStore((s) => s.balanceVisible);
  const setBalanceVisible = useUIStore((s) => s.setBalanceVisible);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentStat, setCurrentStat] = useState<
    'earned' | 'staked' | 'deposited' | 'withdrawn'
  >('staked');
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );
  const [pressedFeatureButtonIndex, setPressedFeatureButtonIndex] = useState<
    number | null
  >(null);
  const [newUserInfo, setNewUserInfo] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const { user } = useUser();
  const {} = useResponsive();
  const openModal = useUIStore((s) => s.openModal);

  // Handle hash navigation (e.g., #daily-ros)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the #
      const element = document.getElementById(hash);
      if (element) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, []);

  // Check for first-time login and show welcome modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('novunt_new_user');
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          // Check if stored within last 24 hours
          if (Date.now() - userData.timestamp < 24 * 60 * 60 * 1000) {
            setNewUserInfo(userData);
            // Show modal after a short delay for better UX
            setTimeout(() => {
              setShowWelcomeModal(true);
            }, 1000);
          } else {
            // Expired, remove it
            localStorage.removeItem('novunt_new_user');
          }
        } catch (e) {
          console.error('Failed to parse new user info:', e);
          localStorage.removeItem('novunt_new_user');
        }
      }
    }
  }, []);

  // Rotate through all stats every 5 seconds (carousel)
  const stats = useMemo<Array<'earned' | 'staked' | 'deposited' | 'withdrawn'>>(
    () => ['staked', 'earned', 'deposited', 'withdrawn'],
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [stats.length]);

  useEffect(() => {
    setCurrentStat(stats[currentIndex]);
  }, [currentIndex, stats]);

  // Handle welcome modal close
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('novunt_new_user');
    }
  };

  // Fetch data
  const {
    data: walletBalance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch,
  } = useWalletBalance();
  const {
    data: activeStakes,
    isLoading: stakesLoading,
    error: stakesError,
  } = useActiveStakes();
  const { data: stakingData } = useStakeDashboard();
  const dashboardActiveStakes = Array.isArray(stakingData?.activeStakes)
    ? stakingData.activeStakes
    : [];
  const dashboardStakeHistory = Array.isArray(stakingData?.stakeHistory)
    ? stakingData.stakeHistory
    : [];

  // One list: actives first, then completed. One card at a time, rotates every 35s.
  const featuredStakesList = React.useMemo(
    () => [...dashboardActiveStakes, ...dashboardStakeHistory],
    [dashboardActiveStakes, dashboardStakeHistory]
  );
  const ROTATE_INTERVAL_MS = 35000;
  const [featuredStakeIndex, setFeaturedStakeIndex] = React.useState(0);
  React.useEffect(() => {
    if (featuredStakesList.length <= 1) return;
    const t = setInterval(() => {
      setFeaturedStakeIndex((i) => (i + 1) % featuredStakesList.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [featuredStakesList.length]);
  const featuredStake =
    featuredStakesList.length > 0
      ? featuredStakesList[featuredStakeIndex % featuredStakesList.length]
      : null;

  // Fetch recent transactions from transaction history API
  const {
    data: transactionHistoryData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactionHistory({
    page: 1,
    limit: 5, // Show only 5 most recent transactions
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  // Extract transactions from the response
  const transactions = transactionHistoryData?.transactions || [];
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useDashboardOverview();

  // Get wallet statistics for all financial metrics
  // Call hook at top level (required by React), but handle SSR gracefully
  const { wallet } = useWallet();
  const walletStats = wallet?.statistics || {
    totalDeposited: 0,
    totalStaked: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  };

  // Platform ranks
  const ranks = React.useMemo(
    () => [
      'Stakeholder',
      'Associate Stakeholder',
      'Principal Strategist',
      'Elite Capitalist',
      'Wealth Architect',
      'Finance Titan',
    ],
    []
  );

  // Generate random platform activity (fallback)
  const generateRandomActivity = React.useCallback(() => {
    const generateMaskedName = () => {
      const firstNames = [
        'John',
        'Sarah',
        'Mike',
        'Emma',
        'David',
        'Lisa',
        'Chris',
        'Anna',
        'Tom',
        'Rachel',
        'James',
        'Sophie',
        'Mark',
        'Nina',
        'Paul',
        'Grace',
        'Peter',
        'Kate',
        'Alex',
        'Maria',
        'Dan',
        'Eva',
        'Ryan',
        'Zoe',
        'Luke',
        'Mia',
        'Ben',
        'Ella',
        'Sam',
        'Amy',
        'Jack',
        'Lily',
        'Max',
        'Ruby',
        'Leo',
        'Ivy',
        'Noah',
        'Lucy',
        'Jake',
        'Aria',
        'Owen',
        'Maya',
        'Cole',
        'Leah',
        'Ian',
        'Nora',
        'Eric',
        'Jade',
        'Sean',
        'Rose',
      ];
      const lastNames = [
        'Anderson',
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
        'Rodriguez',
        'Martinez',
        'Hernandez',
        'Lopez',
        'Gonzalez',
        'Wilson',
        'Taylor',
        'Thomas',
        'Moore',
        'Jackson',
        'Martin',
        'Lee',
        'Walker',
        'Hall',
        'Allen',
        'Young',
        'King',
        'Wright',
        'Scott',
        'Green',
        'Baker',
        'Adams',
        'Nelson',
        'Carter',
        'Mitchell',
        'Roberts',
        'Turner',
        'Phillips',
        'Campbell',
        'Parker',
        'Evans',
      ];

      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      const maskName = (name: string) => {
        if (name.length <= 2) return name;
        const asteriskCount = Math.floor(Math.random() * (name.length - 2)) + 1;
        return name[0] + '*'.repeat(asteriskCount) + name[name.length - 1];
      };

      return `${maskName(firstName)} ${lastName[0]}.`;
    };
    // Realistic amount ranges for a new/beginning platform
    const activityTypes = [
      {
        type: 'deposit',
        action: 'deposited',
        icon: ArrowDownRight,
        color: 'text-blue-600 dark:text-blue-400',
        amountRange: [20, 500], // Reduced from [50, 25000] - more realistic for new platform
      },
      {
        type: 'withdraw',
        action: 'withdrew',
        icon: ArrowUpRight,
        color: 'text-purple-600 dark:text-purple-400',
        amountRange: [30, 300], // Reduced from [100, 15000] - more realistic for new platform
      },
      {
        type: 'stake',
        action: 'staked',
        icon: TrendingUp,
        color: 'text-emerald-600 dark:text-emerald-400',
        amountRange: [25, 400], // Reduced from [20, 50000] - much more realistic for new platform
      },
      {
        type: 'referral',
        action: 'earned referral bonus',
        icon: Users,
        color: 'text-green-600 dark:text-green-400',
        amountRange: [10, 150], // Reduced from [50, 2500] - more realistic for new platform
      },
      {
        type: 'ros',
        action: 'earned ROS',
        icon: DollarSign,
        color: 'text-green-600 dark:text-green-400',
        amountRange: [5, 100], // Reduced from [100, 5000] - more realistic for new platform
      },
      {
        type: 'rank',
        action: 'earned rank bonus',
        icon: Gift,
        color: 'text-orange-600 dark:text-orange-400',
        amountRange: [15, 200], // Reduced from [200, 10000] - more realistic for new platform
      },
      {
        type: 'promotion',
        action: `promoted to ${ranks[Math.floor(Math.random() * ranks.length)]}`,
        icon: Star,
        color: 'text-yellow-600 dark:text-yellow-400',
        amountRange: null,
      },
      {
        type: 'transfer',
        action: 'transferred',
        icon: Send,
        color: 'text-cyan-600 dark:text-cyan-400',
        amountRange: [20, 250], // Reduced from [100, 10000] - more realistic for new platform
      },
    ];

    const activity =
      activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const amount = activity.amountRange
      ? Math.floor(
          Math.random() * (activity.amountRange[1] - activity.amountRange[0])
        ) + activity.amountRange[0]
      : null;

    // Generate random time (1-60 minutes ago)
    const minutes = Math.floor(Math.random() * 60) + 1;
    const timeStr = minutes === 1 ? '1 min ago' : `${minutes} min ago`;

    return {
      user: generateMaskedName(),
      action: activity.action,
      amount,
      icon: activity.icon,
      color: activity.color,
      time: timeStr,
    };
  }, [ranks]);

  // Fetch platform activities from API (with fallback to mock) - Fetch multiple for scrollable list
  const { activities: apiActivities, loading: activityLoading } =
    usePlatformActivity({
      limit: 1, // Fetch 1 new activity at a time for smooth updates
      pollInterval: 30000,
      enabled: true,
    });

  // State to manage accumulated activities for smooth animations
  const [displayActivitiesState, setDisplayActivitiesState] = React.useState<
    any[]
  >([]);

  // Update activities when new data arrives - prepend new activity and keep last 3
  React.useEffect(() => {
    if (apiActivities && apiActivities.length > 0) {
      const newActivity = apiActivities[0];
      setDisplayActivitiesState((prev) => {
        // Check if this activity already exists (to avoid duplicates)
        const isDuplicate = prev.some(
          (act) =>
            act.user === newActivity.user &&
            act.action === newActivity.action &&
            act.time === newActivity.timeAgo &&
            act.amount === newActivity.amount
        );

        if (isDuplicate) {
          return prev;
        }

        // Add new activity to front and keep only first 3
        return [newActivity, ...prev].slice(0, 4);
      });
    }
  }, [apiActivities]);

  // Map activity type to icon and color
  const getActivityIcon = React.useCallback((type: string) => {
    const iconMap: Record<string, typeof ArrowDownRight> = {
      deposit: ArrowDownRight,
      withdraw: ArrowUpRight,
      stake: TrendingUp,
      referral: Users,
      ros: DollarSign,
      rank: Gift,
      promotion: Star,
      transfer: Send,
      registration_bonus: Gift,
      stake_completion: TrendingUp,
      bonus_activation: Star,
      new_signup: Users,
    };
    return iconMap[type] || Circle;
  }, []);

  const getActivityColor = React.useCallback((type: string) => {
    const colorMap: Record<string, string> = {
      deposit: 'text-blue-600 dark:text-blue-400',
      withdraw: 'text-purple-600 dark:text-purple-400',
      stake: 'text-emerald-600 dark:text-emerald-400',
      referral: 'text-green-600 dark:text-green-400',
      ros: 'text-green-600 dark:text-green-400',
      rank: 'text-orange-600 dark:text-orange-400',
      promotion: 'text-yellow-600 dark:text-yellow-400',
      transfer: 'text-cyan-600 dark:text-cyan-400',
      registration_bonus: 'text-green-600 dark:text-green-400',
      stake_completion: 'text-emerald-600 dark:text-emerald-400',
      bonus_activation: 'text-yellow-600 dark:text-yellow-400',
      new_signup: 'text-blue-600 dark:text-blue-400',
    };
    return colorMap[type] || 'text-foreground';
  }, []);

  // Convert accumulated activities to display format
  const displayActivities = React.useMemo(() => {
    if (displayActivitiesState.length > 0) {
      return displayActivitiesState.map((activity: PlatformActivity) => ({
        user: activity.user,
        action: activity.action,
        amount: activity.amount,
        icon: getActivityIcon(activity.type),
        color: getActivityColor(activity.type),
        time: activity.timeAgo,
        type: activity.type,
      }));
    }

    // Fallback to mock data if no activities yet
    return Array.from({ length: 4 }, () => generateRandomActivity());
  }, [
    displayActivitiesState,
    getActivityIcon,
    getActivityColor,
    generateRandomActivity,
  ]);

  // Check if ALL queries have failed (indicating auth issue)
  const allQueriesFailed =
    !balanceLoading &&
    !walletBalance &&
    !stakesLoading &&
    !activeStakes &&
    !transactionsLoading &&
    !transactions &&
    !overviewLoading &&
    !overview;

  // If all queries failed and we're not loading, show auth error
  if (
    allQueriesFailed &&
    (balanceError || stakesError || transactionsError || overviewError)
  ) {
    return <AuthErrorFallback />;
  }

  // Calculate totals with safe property access and proper fallbacks
  // Priority: overview API > calculated from activeStakes > walletStats > defaults

  // Total Balance - prioritize overview, then sum wallet balances
  const totalBalance =
    overview?.wallets?.totalBalance ??
    (walletBalance?.funded?.balance || 0) +
      (walletBalance?.earnings?.balance || 0);

  // Total Staked - prioritize overview, then calculate from activeStakes, then walletStats
  // Handle different response formats from useActiveStakes
  const activeStakesArray = Array.isArray(activeStakes)
    ? activeStakes
    : (activeStakes as any)?.data?.activeStakes ||
      (activeStakes as any)?.activeStakes ||
      [];

  const totalStakedFromOverview = overview?.staking?.totalStaked;
  const totalStakedFromActiveStakes =
    activeStakesArray.length > 0
      ? activeStakesArray.reduce((sum: number, stake: any) => {
          const amount = Number(stake?.amount || stake?.stakeAmount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0)
      : 0;
  const totalStaked =
    totalStakedFromOverview ??
    totalStakedFromActiveStakes ??
    walletStats.totalStaked ??
    0;

  // Total Earnings - prioritize overview, then wallet balance, then walletStats
  const totalEarningsFromOverview = overview?.staking?.totalEarnings;
  const totalEarningsFromBalance = walletBalance?.earnings?.balance ?? 0;
  const totalEarnings =
    totalEarningsFromOverview ??
    totalEarningsFromBalance ??
    walletStats.totalEarned ??
    0;

  // Total Deposited - prioritize walletStats (most accurate source)
  const totalDeposited = walletStats.totalDeposited ?? 0;

  // Total Withdrawn - prioritize walletStats (most accurate source)
  const totalWithdrawn = walletStats.totalWithdrawn ?? 0;

  // Total Earned - use calculated totalEarnings (has best fallbacks)
  const totalEarned = totalEarnings;

  // Calculate total portfolio value (combines all stakes and wallet balances)
  const totalPortfolioValue = totalBalance + totalStaked;

  // Pending earnings (optional - profits awaiting maturity)
  // TODO: Backend to add staking.pendingEarnings
  const pendingEarnings = 0; // Will come from overview?.staking?.pendingEarnings

  // Next payout date (optional - next ROS distribution)
  const nextPayoutDate = overview?.staking?.nextPayout ?? null;

  const isLoading = balanceLoading || overviewLoading;
  const isRefetching = false; // Can be connected to refetch state

  return (
    <div className="min-h-screen lg:h-full lg:min-h-0">
      <div className="space-y-5 lg:grid lg:h-full lg:grid-cols-2 lg:gap-5 lg:space-y-0">
        {/* Column 1 - Balance, quick actions, stats carousel (Registration Bonus is in modal via 10% Bonus button) */}
        <div className="flex flex-col gap-5 lg:min-h-0 lg:overflow-y-auto">
          <div className="lg:max-w-md lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-5"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <WelcomeBackCard
                  user={user}
                  balanceVisible={balanceVisible}
                  setBalanceVisible={setBalanceVisible}
                  refetch={refetch}
                  isRefetching={isRefetching}
                  totalPortfolioValue={totalPortfolioValue}
                  totalEarnings={totalEarnings}
                  lastWeekProfitChange={0}
                />
              </motion.div>

              {/* Quick Actions - Neumorphic card */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div
                  className="rounded-2xl p-5 sm:p-6"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
                  }}
                >
                  <QuickActions />
                </div>
              </motion.div>

              {/* Stats Carousel Card */}
              <div>
                <div
                  className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
                  }}
                >
                  <div className="relative min-h-[80px]">
                    <AnimatePresence initial={false}>
                      {currentStat === 'earned' && (
                        <motion.div
                          key="total-earned"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 w-full"
                        >
                          <div className="mb-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-block cursor-help text-left text-xs font-semibold sm:text-sm"
                                  style={{
                                    color: 'var(--neu-accent)',
                                    filter: 'none',
                                  }}
                                  aria-label="Total Earned. Tap for details."
                                >
                                  Total Earned
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="top"
                                align="start"
                                className="max-w-[240px] shadow-lg"
                                style={{
                                  borderColor: 'var(--neu-border)',
                                  background: 'var(--neu-bg)',
                                  color: 'var(--neu-text-primary)',
                                }}
                              >
                                <p
                                  className="text-xs opacity-90"
                                  style={{ color: 'var(--neu-text-primary)' }}
                                >
                                  Total earnings from all sources
                                </p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {isLoading ? (
                            <div
                              className="h-8 w-28 animate-pulse rounded sm:h-9"
                              style={{
                                background: 'rgba(var(--neu-accent-rgb), 0.25)',
                              }}
                              aria-hidden
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              key={totalEarned ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'var(--neu-text-primary)',
                                filter: 'none',
                              }}
                            >
                              {balanceVisible
                                ? `$${(totalEarned ?? 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}`
                                : '••••••'}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                      {currentStat === 'staked' && (
                        <motion.div
                          key="total-staked"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 w-full"
                        >
                          <div className="mb-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-block cursor-help text-left text-xs font-semibold sm:text-sm"
                                  style={{
                                    color: 'var(--neu-accent)',
                                    filter: 'none',
                                  }}
                                  aria-label="Total Staked. Tap for details."
                                >
                                  Total Staked
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="top"
                                align="start"
                                className="max-w-[240px] shadow-lg"
                                style={{
                                  borderColor: 'var(--neu-border)',
                                  background: 'var(--neu-bg)',
                                  color: 'var(--neu-text-primary)',
                                }}
                              >
                                <p
                                  className="text-xs opacity-90"
                                  style={{ color: 'var(--neu-text-primary)' }}
                                >
                                  Total amount staked across all stakes
                                </p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {isLoading ? (
                            <div
                              className="h-8 w-28 animate-pulse rounded sm:h-9"
                              style={{
                                background: 'rgba(var(--neu-accent-rgb), 0.25)',
                              }}
                              aria-hidden
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              key={totalStaked ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'var(--neu-text-primary)',
                                filter: 'none',
                              }}
                            >
                              {balanceVisible
                                ? `$${(totalStaked ?? 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}`
                                : '••••••'}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                      {currentStat === 'deposited' && (
                        <motion.div
                          key="total-deposited"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 w-full"
                        >
                          <div className="mb-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-block cursor-help text-left text-xs font-semibold sm:text-sm"
                                  style={{
                                    color: 'var(--neu-accent)',
                                    filter: 'none',
                                  }}
                                  aria-label="Total Deposited. Tap for details."
                                >
                                  Total Deposited
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="top"
                                align="start"
                                className="max-w-[240px] shadow-lg"
                                style={{
                                  borderColor: 'var(--neu-border)',
                                  background: 'var(--neu-bg)',
                                  color: 'var(--neu-text-primary)',
                                }}
                              >
                                <p
                                  className="text-xs opacity-90"
                                  style={{ color: 'var(--neu-text-primary)' }}
                                >
                                  Total amount deposited to your wallet
                                </p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {isLoading ? (
                            <div
                              className="h-8 w-28 animate-pulse rounded sm:h-9"
                              style={{
                                background: 'rgba(var(--neu-accent-rgb), 0.25)',
                              }}
                              aria-hidden
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              key={totalDeposited ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'var(--neu-text-primary)',
                                filter: 'none',
                              }}
                            >
                              {balanceVisible
                                ? `$${(totalDeposited ?? 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}`
                                : '••••••'}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                      {currentStat === 'withdrawn' && (
                        <motion.div
                          key="total-withdrawn"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 w-full"
                        >
                          <div className="mb-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-block cursor-help text-left text-xs font-semibold sm:text-sm"
                                  style={{
                                    color: 'var(--neu-accent)',
                                    filter: 'none',
                                  }}
                                  aria-label="Total Withdrawn. Tap for details."
                                >
                                  Total Withdrawn
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="top"
                                align="start"
                                className="max-w-[240px] shadow-lg"
                                style={{
                                  borderColor: 'var(--neu-border)',
                                  background: 'var(--neu-bg)',
                                  color: 'var(--neu-text-primary)',
                                }}
                              >
                                <p
                                  className="text-xs opacity-90"
                                  style={{ color: 'var(--neu-text-primary)' }}
                                >
                                  Total amount withdrawn from your wallet
                                </p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {isLoading ? (
                            <div
                              className="h-8 w-28 animate-pulse rounded sm:h-9"
                              style={{
                                background: 'rgba(var(--neu-accent-rgb), 0.25)',
                              }}
                              aria-hidden
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              key={totalWithdrawn ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'var(--neu-text-primary)',
                                filter: 'none',
                              }}
                            >
                              {balanceVisible
                                ? `$${(totalWithdrawn ?? 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}`
                                : '••••••'}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Feature Buttons Grid - 8 circular buttons, same colors & neumorphic as Quick Actions */}
              <div className="w-full">
                <div
                  className="w-full rounded-2xl p-5 sm:p-6"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
                  }}
                >
                  <div className="grid grid-cols-4 justify-items-center gap-6 sm:gap-8 md:gap-10 lg:gap-8 xl:gap-10">
                    {[
                      {
                        id: 'welcome-bonus',
                        label: '10% Bonus',
                        icon: Gift,
                        href: '/dashboard/onboarding',
                      },
                      {
                        id: 'nxp-gamification',
                        label: 'NXP',
                        icon: Sparkles,
                        href: '/dashboard/achievements',
                      },
                      {
                        id: 'rank',
                        label: 'Rank',
                        icon: Trophy,
                        href: '#',
                      },
                      {
                        id: 'wallet-address',
                        label: 'Wallet',
                        icon: CreditCard,
                        href: '/dashboard/wallets',
                      },
                      {
                        id: 'community',
                        label: 'Team',
                        icon: Users,
                        href: '/dashboard/team',
                      },
                      {
                        id: 'staking-streak',
                        label: 'Streak',
                        icon: Flame,
                        href: '/dashboard',
                      },
                      {
                        id: 'knowledge-base',
                        label: 'Knowledge base',
                        icon: BookOpen,
                        href: '/dashboard/knowledge-base',
                      },
                      {
                        id: 'settings',
                        label: 'Settings',
                        icon: Settings,
                        href: '/dashboard/settings',
                      },
                    ].map((button, index) => {
                      const IconComponent = button.icon;
                      const isHovered = hoveredButtonIndex === index;
                      const isPressed = pressedFeatureButtonIndex === index;
                      const isActive = isHovered || isPressed;

                      const isSettings = button.id === 'settings';
                      const isStreak = button.id === 'staking-streak';
                      const isRank = button.id === 'rank';
                      const isWelcomeBonus = button.id === 'welcome-bonus';
                      const isWallet = button.id === 'wallet-address';
                      const buttonContent = (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="flex touch-manipulation flex-col items-center gap-1.5 sm:gap-2"
                        >
                          {/* Circular neumorphic button – same as Quick Actions: default light blue + dark icon, hover dark + light blue; label white */}
                          <div
                            className="relative flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14 md:h-16 md:w-16"
                            style={{
                              background: isActive ? '#0D162C' : '#009BF2',
                              boxShadow: isPressed
                                ? 'var(--neu-shadow-inset-press)'
                                : 'var(--neu-shadow-raised)',
                              border: '1px solid var(--neu-border)',
                              transform:
                                isHovered && !isPressed
                                  ? 'translateY(-2px)'
                                  : 'translateY(0)',
                              transition:
                                'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), transform 250ms cubic-bezier(0.4, 0, 0.2, 1), background 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <IconComponent
                              className="h-5 w-5 sm:h-6 sm:w-6"
                              style={{
                                color: isActive ? '#009BF2' : '#0D162C',
                              }}
                            />
                          </div>
                          {/* Label – white */}
                          <span
                            className="text-center text-[10px] font-medium sm:text-xs"
                            style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                          >
                            {button.label}
                          </span>
                        </motion.button>
                      );

                      const hoverPressProps = {
                        onMouseEnter: () => setHoveredButtonIndex(index),
                        onMouseLeave: () => {
                          setHoveredButtonIndex(null);
                          setPressedFeatureButtonIndex(null);
                        },
                        onMouseDown: () => setPressedFeatureButtonIndex(index),
                        onMouseUp: () => setPressedFeatureButtonIndex(null),
                        onTouchStart: () => setPressedFeatureButtonIndex(index),
                        onTouchEnd: () => setPressedFeatureButtonIndex(null),
                      };

                      return (
                        <React.Fragment key={button.id}>
                          {isWelcomeBonus ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => openModal('registration-bonus')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  openModal('registration-bonus');
                                }
                              }}
                              className="cursor-pointer border-0 bg-transparent p-0 text-left"
                              {...hoverPressProps}
                            >
                              {buttonContent}
                            </div>
                          ) : isSettings ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(
                                  new CustomEvent('openProfileModal', {
                                    bubbles: true,
                                  })
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  window.dispatchEvent(
                                    new CustomEvent('openProfileModal', {
                                      bubbles: true,
                                    })
                                  );
                                }
                              }}
                              className="cursor-pointer border-0 bg-transparent p-0 text-left"
                              {...hoverPressProps}
                            >
                              {buttonContent}
                            </div>
                          ) : isStreak ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setStreakModalOpen(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setStreakModalOpen(true);
                                }
                              }}
                              className="cursor-pointer border-0 bg-transparent p-0 text-left"
                              {...hoverPressProps}
                            >
                              {buttonContent}
                            </div>
                          ) : isRank ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setRankModalOpen(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setRankModalOpen(true);
                                }
                              }}
                              className="cursor-pointer border-0 bg-transparent p-0 text-left"
                              {...hoverPressProps}
                            >
                              {buttonContent}
                            </div>
                          ) : isWallet ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => openModal('wallet')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  openModal('wallet');
                                }
                              }}
                              className="cursor-pointer border-0 bg-transparent p-0 text-left"
                              {...hoverPressProps}
                            >
                              {buttonContent}
                            </div>
                          ) : (
                            <Link
                              href={button.href}
                              className="block text-left"
                              {...hoverPressProps}
                            >
                              {buttonContent}
                            </Link>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Platform Activities - desktop only: under the 8 action buttons for better grid balance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="hidden lg:block lg:pt-5"
            >
              <LivePlatformActivities />
            </motion.div>
          </div>
        </div>

        {/* Column 2 - Activity Feed, Stake Card, Live Trading, ROS Calendar, Platform Activities (2-col desktop) */}
        <div className="flex flex-col gap-5 lg:min-h-0 lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Recent Activity (e.g. Daily ROS Payout cards) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <ActivityFeed
                transactions={transactions || []}
                isLoading={transactionsLoading}
              />
            </motion.div>
            {/* Stake Card – full width to align with Activity Feed and other column cards */}
            {featuredStake && (
              <div className={`${walletStyles.nxpSectionRoot} w-full`}>
                <div className="relative min-h-0">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={featuredStake._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      <StakeCard stake={featuredStake} variant="dashboard" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
            {/* Live Trading Signals, ROS Calendar, Live Platform Activities (merged into column 2 on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LiveTradingSignals />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <RosCalendarCard />
            </motion.div>
            {/* Live Platform Activities - mobile/tablet only; on desktop it appears under 8 action buttons in column 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="lg:hidden"
            >
              <LivePlatformActivities />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Staking Streak - Neumorphic modal (opened via Streak button) */}
      <StakingStreakModal
        open={streakModalOpen}
        onOpenChange={setStreakModalOpen}
      />

      {/* Rank Progress - Neumorphic modal (opened via Rank button) */}
      <RankProgressModal open={rankModalOpen} onOpenChange={setRankModalOpen} />

      {/* Welcome Modal for First-Time Users */}
      {newUserInfo && (
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeModalClose}
          firstName={newUserInfo.firstName}
          lastName={newUserInfo.lastName}
          email={newUserInfo.email}
        />
      )}
    </div>
  );
}
