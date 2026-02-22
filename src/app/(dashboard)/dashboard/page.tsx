'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { slideUp } from '@/design-system/animations';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Clock,
  Calendar,
  TrendingDown,
  Circle,
  Star,
  Gift,
  Send,
  Check,
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
import { useTransactionHistory } from '@/hooks/useWallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingStates } from '@/components/ui/loading-states';
import { DailyROSPerformance } from '@/components/dashboard/DailyROSPerformance';
import { ActiveStakesCard } from '@/components/dashboard/ActiveStakesCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AuthErrorFallback } from '@/components/dashboard/AuthErrorFallback';
import { LiveTradingSignals } from '@/components/dashboard/LiveTradingSignals';
import { LivePlatformActivities } from '@/components/dashboard/LivePlatformActivities';
import { StakingStreakModal } from '@/components/dashboard/StakingStreakModal';
import { WelcomeModal } from '@/components/auth/WelcomeModal';
import { RankProgressModal } from '@/components/rank-progress/RankProgressModal';
import { WelcomeBackCard } from '@/components/dashboard/WelcomeBackCard';
import { AchievementsSummaryCard } from '@/components/achievements/AchievementsSummaryCard';
import { ReferralMetricsCard } from '@/components/referral/ReferralMetricsCard';
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
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentStat, setCurrentStat] = useState<
    'earned' | 'staked' | 'deposited' | 'withdrawn'
  >('staked');
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );
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
      <div className="space-y-1 sm:space-y-2 lg:grid lg:h-full lg:grid-cols-3 lg:gap-4 lg:space-y-0">
        {/* Column 1 - Balance, quick actions, stats carousel (Registration Bonus is in modal via 10% Bonus button) */}
        <div className="flex flex-col space-y-1 sm:space-y-2 lg:min-h-0 lg:overflow-y-auto">
          <div className="lg:max-w-md lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-0"
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
                  noCard={true}
                />
              </motion.div>

              {/* Quick Actions - Directly under balance card */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-2"
              >
                <QuickActions />
              </motion.div>

              {/* Stats Carousel Card */}
              <div className="mt-2">
                <div
                  className="rounded-2xl p-5 transition-all duration-300 sm:p-6 lg:p-5 xl:p-6"
                  style={{
                    background: '#0D162C',
                    boxShadow: `
                      inset 8px 8px 16px rgba(0, 0, 0, 0.5),
                      inset -8px -8px 16px rgba(255, 255, 255, 0.05),
                      inset 2px 2px 4px rgba(0, 0, 0, 0.4),
                      inset -2px -2px 4px rgba(255, 255, 255, 0.1),
                      0 0 0 1px rgba(255, 255, 255, 0.03)
                    `,
                  }}
                >
                  <div className="min-h-[80px]">
                    <AnimatePresence mode="wait">
                      {currentStat === 'earned' && (
                        <motion.div
                          key="total-earned"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="w-full"
                        >
                          <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <Wallet
                                className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.95)',
                                  filter: 'none',
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-xs font-medium sm:text-sm lg:text-xs"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  filter: 'none',
                                }}
                              >
                                Total Earned
                              </p>
                              <p
                                className="text-[10px] sm:text-xs lg:text-[10px]"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  filter: 'none',
                                }}
                              >
                                Total earnings from all sources
                              </p>
                            </div>
                          </div>
                          {isLoading ? (
                            <LoadingStates.Text
                              lines={1}
                              className="h-8 sm:h-10"
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              key={totalEarned ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'rgba(255, 255, 255, 0.95)',
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
                          custom={currentIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="w-full"
                        >
                          <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <TrendingUp
                                className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.95)',
                                  filter: 'none',
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-xs font-medium sm:text-sm lg:text-xs"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  filter: 'none',
                                }}
                              >
                                Total Staked
                              </p>
                              <p
                                className="text-[10px] sm:text-xs lg:text-[10px]"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  filter: 'none',
                                }}
                              >
                                Total amount staked across all stakes
                              </p>
                            </div>
                          </div>
                          {isLoading ? (
                            <LoadingStates.Text
                              lines={1}
                              className="h-8 sm:h-10"
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              key={totalStaked ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'rgba(255, 255, 255, 0.95)',
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
                          custom={currentIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="w-full"
                        >
                          <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <ArrowDownRight
                                className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.95)',
                                  filter: 'none',
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-xs font-medium sm:text-sm lg:text-xs"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  filter: 'none',
                                }}
                              >
                                Total Deposited
                              </p>
                              <p
                                className="text-[10px] sm:text-xs lg:text-[10px]"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  filter: 'none',
                                }}
                              >
                                Total amount deposited to your wallet
                              </p>
                            </div>
                          </div>
                          {isLoading ? (
                            <LoadingStates.Text
                              lines={1}
                              className="h-8 sm:h-10"
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              key={totalDeposited ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'rgba(255, 255, 255, 0.95)',
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
                          custom={currentIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          className="w-full"
                        >
                          <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <ArrowUpRight
                                className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.95)',
                                  filter: 'none',
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-xs font-medium sm:text-sm lg:text-xs"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  filter: 'none',
                                }}
                              >
                                Total Withdrawn
                              </p>
                              <p
                                className="text-[10px] sm:text-xs lg:text-[10px]"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  filter: 'none',
                                }}
                              >
                                Total amount withdrawn from your wallet
                              </p>
                            </div>
                          </div>
                          {isLoading ? (
                            <LoadingStates.Text
                              lines={1}
                              className="h-8 sm:h-10"
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              key={totalWithdrawn ?? 0}
                              className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                              style={{
                                color: 'rgba(255, 255, 255, 0.95)',
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
                  {/* Carousel Indicators */}
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    {stats.map((stat, index) => (
                      <button
                        key={stat}
                        onClick={() => {
                          setCurrentIndex(index);
                          setCurrentStat(stats[index]);
                        }}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: currentIndex === index ? '24px' : '8px',
                          background:
                            currentIndex === index
                              ? 'rgba(255, 255, 255, 0.7)'
                              : 'rgba(255, 255, 255, 0.3)',
                        }}
                        aria-label={`Go to ${stat}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Buttons Grid - 8 circular buttons, directly under stats carousel */}
              <div className="mt-2 flex justify-center px-2 sm:px-4 lg:mt-6">
                <div className="grid w-full max-w-md grid-cols-4 justify-items-center gap-6 sm:gap-8 md:gap-10 lg:gap-8 xl:gap-10">
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
                      label: 'Help',
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
                    const NEU_SURFACE = '#131B2E';
                    const NEU_TEXT = '#009BF2';
                    const NEU_SHADOW_DARK = 'rgba(0, 0, 0, 0.5)';
                    const NEU_SHADOW_LIGHT = 'rgba(255, 255, 255, 0.05)';

                    const isSettings = button.id === 'settings';
                    const isStreak = button.id === 'staking-streak';
                    const isRank = button.id === 'rank';
                    const buttonContent = (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        {/* Circular neumorphic button */}
                        <div
                          className="relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 sm:h-14 sm:w-14 md:h-16 md:w-16"
                          style={{
                            background:
                              hoveredButtonIndex === index
                                ? 'var(--app-accent)'
                                : 'var(--app-surface)',
                            boxShadow: `
                            6px 6px 12px var(--app-shadow-dark),
                            -6px -6px 12px var(--app-shadow-light),
                            0 0 0 1px var(--app-border)
                          `,
                          }}
                          onMouseEnter={(e) => {
                            setHoveredButtonIndex(index);
                            e.currentTarget.style.boxShadow = `
                            8px 8px 16px ${NEU_SHADOW_DARK},
                            -8px -8px 16px ${NEU_SHADOW_LIGHT},
                            0 0 0 1px rgba(255, 255, 255, 0.08),
                            0 0 20px rgba(0, 155, 242, 0.2)
                          `;
                            e.currentTarget.style.transform =
                              'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            setHoveredButtonIndex(null);
                            e.currentTarget.style.boxShadow = `
                            6px 6px 12px ${NEU_SHADOW_DARK},
                            -6px -6px 12px ${NEU_SHADOW_LIGHT},
                            0 0 0 1px rgba(255, 255, 255, 0.05)
                          `;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.boxShadow = `
                            inset 3px 3px 6px ${NEU_SHADOW_DARK},
                            inset -3px -3px 6px ${NEU_SHADOW_LIGHT}
                          `;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.boxShadow = `
                            8px 8px 16px ${NEU_SHADOW_DARK},
                            -8px -8px 16px ${NEU_SHADOW_LIGHT},
                            0 0 0 1px rgba(255, 255, 255, 0.08),
                            0 0 20px rgba(0, 155, 242, 0.2)
                          `;
                          }}
                        >
                          <motion.div
                            animate={{
                              y: [0, -2, 0],
                              scale: [1, 1.02, 1],
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: index * 0.3,
                            }}
                          >
                            <IconComponent
                              className="h-5 w-5 transition-colors duration-200 sm:h-6 sm:w-6"
                              style={{
                                color:
                                  hoveredButtonIndex === index
                                    ? NEU_SURFACE
                                    : NEU_TEXT,
                                filter: 'none',
                              }}
                            />
                          </motion.div>
                        </div>
                        {/* Label */}
                        <span
                          className="text-center text-[10px] font-medium sm:text-xs"
                          style={{ color: NEU_TEXT, filter: 'none' }}
                        >
                          {button.label}
                        </span>
                      </motion.button>
                    );

                    return (
                      <React.Fragment key={button.id}>
                        {isSettings ? (
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
                          >
                            {buttonContent}
                          </div>
                        ) : (
                          <Link href={button.href}>{buttonContent}</Link>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Column 2 - activity, daily ROS, Active Stakes (lg only) */}
        <div className="flex flex-col space-y-1 sm:space-y-2 lg:min-h-0 lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-0"
          >
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-2"
            >
              <ActivityFeed
                transactions={transactions || []}
                isLoading={transactionsLoading}
              />
            </motion.div>

            {/* Daily ROS Performance - Directly under Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="mt-2"
              id="daily-ros"
            >
              <DailyROSPerformance />
            </motion.div>

            {/* Active Stakes - under Daily ROS Performance on large screens only */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 hidden lg:block"
            >
              <ActiveStakesCard />
            </motion.div>
          </motion.div>
        </div>

        {/* Column 3 - Active stakes (small screens), live signals, live platform activities */}
        <div className="flex flex-col space-y-1 sm:space-y-2 lg:min-h-0 lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
          >
            {/* Active Stakes - shown here on small screens only; on lg it moves to column 2 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 lg:mt-0 lg:hidden"
            >
              <ActiveStakesCard />
            </motion.div>

            {/* Live Trading Signals & Live Platform Activity - on lg they stack and share column height equally (50/50) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-2 grid grid-cols-1 gap-3 lg:mt-0 lg:min-h-0 lg:flex-1 lg:grid-rows-2"
            >
              <LiveTradingSignals />
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
