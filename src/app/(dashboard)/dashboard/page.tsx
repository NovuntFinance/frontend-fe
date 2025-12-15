'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import {
  useWalletBalance,
  useActiveStakes,
  useDashboardOverview,
  useStakingStreak,
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
import { ShimmerCard } from '@/components/ui/shimmer';
import { DailyROSPerformance } from '@/components/dashboard/DailyROSPerformance';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AuthErrorFallback } from '@/components/dashboard/AuthErrorFallback';
import { LiveTradingSignals } from '@/components/dashboard/LiveTradingSignals';
import { WelcomeModal } from '@/components/auth/WelcomeModal';
import { RankProgressCard } from '@/components/rank-progress/RankProgressCard';
import { WelcomeBackCard } from '@/components/dashboard/WelcomeBackCard';
import { AchievementsSummaryCard } from '@/components/achievements/AchievementsSummaryCard';
import { useUser } from '@/hooks/useUser';
import { usePlatformActivity } from '@/hooks/usePlatformActivity';
import { useWallet } from '@/hooks/useWallet';
import type { PlatformActivity } from '@/types/platformActivity';

/**
 * Modern Dashboard Home Page
 * Redesigned with premium animations and modern UI
 */
export default function DashboardPage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newUserInfo, setNewUserInfo] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const { user } = useUser();

  // Fetch staking streak data
  const { data: streakData, isLoading: streakLoading } = useStakingStreak();

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

  const totalDeposited = walletStats.totalDeposited ?? 0;
  const totalStakedFromStats = walletStats.totalStaked ?? 0;
  const totalEarned = walletStats.totalEarned ?? 0;
  const totalWithdrawn = walletStats.totalWithdrawn ?? 0;

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
    const activityTypes = [
      {
        type: 'deposit',
        action: 'deposited',
        icon: ArrowDownRight,
        color: 'text-blue-600 dark:text-blue-400',
        amountRange: [50, 25000],
      },
      {
        type: 'withdraw',
        action: 'withdrew',
        icon: ArrowUpRight,
        color: 'text-purple-600 dark:text-purple-400',
        amountRange: [100, 15000],
      },
      {
        type: 'stake',
        action: 'staked',
        icon: TrendingUp,
        color: 'text-emerald-600 dark:text-emerald-400',
        amountRange: [20, 50000],
      },
      {
        type: 'referral',
        action: 'earned referral bonus',
        icon: Users,
        color: 'text-green-600 dark:text-green-400',
        amountRange: [50, 2500],
      },
      {
        type: 'ros',
        action: 'earned ROS',
        icon: DollarSign,
        color: 'text-green-600 dark:text-green-400',
        amountRange: [100, 5000],
      },
      {
        type: 'rank',
        action: 'earned rank bonus',
        icon: Gift,
        color: 'text-orange-600 dark:text-orange-400',
        amountRange: [200, 10000],
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
        amountRange: [100, 10000],
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
      limit: 4, // Fetch 4 activities to match Live Trading Signals
      pollInterval: 30000,
      enabled: true,
    });

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

  // Convert API activities to display format (with fallback to mock)
  const displayActivities = React.useMemo(() => {
    if (apiActivities && apiActivities.length > 0) {
      return apiActivities.map((activity: PlatformActivity) => ({
        user: activity.user,
        action: activity.action,
        amount: activity.amount,
        icon: getActivityIcon(activity.type),
        color: getActivityColor(activity.type),
        time: activity.timeAgo,
        type: activity.type,
      }));
    }

    // Fallback to mock data if API fails or is loading
    return Array.from({ length: 4 }, () => generateRandomActivity());
  }, [
    apiActivities,
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

  // Calculate totals with safe property access
  const totalBalance =
    overview?.wallets?.totalBalance ??
    (walletBalance?.funded?.balance || 0) +
      (walletBalance?.earnings?.balance || 0);
  const totalStaked =
    overview?.staking?.totalStaked ??
    (Array.isArray(activeStakes)
      ? activeStakes.reduce((sum, stake) => sum + stake.amount, 0)
      : 0);
  const totalEarnings =
    overview?.staking?.totalEarnings ?? walletBalance?.earnings?.balance ?? 0;

  // Calculate total portfolio value (combines all stakes and wallet balances)
  const totalPortfolioValue = totalBalance + totalStaked;

  // Last week's profit (will be updated by backend)
  // TODO: Backend to add analytics.lastWeekProfit and analytics.lastWeekProfitChange
  const overviewData = overview as
    | { analytics?: { lastWeekProfit?: number; lastWeekProfitChange?: number } }
    | undefined;
  const lastWeekProfit = overviewData?.analytics?.lastWeekProfit ?? 0;
  const lastWeekProfitChange =
    overviewData?.analytics?.lastWeekProfitChange ?? 0;

  // Pending earnings (optional - profits awaiting maturity)
  // TODO: Backend to add staking.pendingEarnings
  const pendingEarnings = 0; // Will come from overview?.staking?.pendingEarnings

  // Next payout date (optional - next ROS distribution)
  const nextPayoutDate = overview?.staking?.nextPayout ?? null;

  const isLoading = balanceLoading || overviewLoading;
  const isRefetching = false; // Can be connected to refetch state

  return (
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <div className="space-y-6">
        {/* Hero Section - Welcome Card */}
        {/* Hero Section - Welcome Card */}
        {/* Hero Section - Welcome Card */}
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
            lastWeekProfitChange={lastWeekProfitChange}
            totalEarnings={totalEarnings}
          />
        </motion.div>

        {/* Stats Grid - Premium Cards (2x2 layout) */}
        {/* REORDERED: Total Earned FIRST (most motivating), then Total Staked, Total Deposited, Total Withdrawn */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
          {[
            {
              title: 'Total Earned',
              value: totalEarned,
              tooltip: 'Total earnings from all sources.',
              icon: TrendingUp,
              colorTheme: 'emerald' as const,
            },
            {
              title: 'Total Staked',
              value: totalStakedFromStats,
              tooltip: 'Total amount staked across all stakes.',
              icon: Wallet,
              colorTheme: 'orange' as const,
            },
            {
              title: 'Total Deposited',
              value: totalDeposited,
              tooltip: 'Total amount deposited to your wallet.',
              icon: ArrowDownRight,
              colorTheme: 'purple' as const,
            },
            {
              title: 'Total Withdrawn',
              value: totalWithdrawn,
              tooltip: 'Total amount withdrawn from your wallet.',
              icon: ArrowUpRight,
              colorTheme: 'blue' as const,
            },
            ...(pendingEarnings > 0
              ? [
                  {
                    title: 'Pending Earnings',
                    value: pendingEarnings,
                    tooltip: 'Earnings awaiting confirmation or release.',
                    icon: Clock,
                    colorTheme: 'orange' as const,
                  },
                ]
              : []),
            ...(nextPayoutDate
              ? [
                  {
                    title: 'Next Payout',
                    value: null,
                    displayValue: new Date(nextPayoutDate).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    ),
                    tooltip: 'Expected date for your next ROS or distribution.',
                    icon: Calendar,
                    colorTheme: 'blue' as const,
                  },
                ]
              : []),
          ].map((stat, index) => {
            // Color theme mappings for gradient backgrounds
            const colorConfigs: Record<
              string,
              {
                gradient: string;
                blob: string;
                iconBg: string;
                textGradient: string;
                iconColor: string;
              }
            > = {
              purple: {
                gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
                blob: 'bg-purple-500/30',
                iconBg: 'from-purple-500/30 to-indigo-500/20',
                textGradient: 'from-purple-600 to-indigo-600',
                iconColor: 'text-purple-500',
              },
              orange: {
                gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
                blob: 'bg-amber-500/30',
                iconBg: 'from-amber-500/30 to-orange-500/20',
                textGradient: 'from-amber-600 to-orange-600',
                iconColor: 'text-amber-500',
              },
              emerald: {
                gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
                blob: 'bg-emerald-500/30',
                iconBg: 'from-emerald-500/30 to-green-500/20',
                textGradient: 'from-emerald-600 to-green-600',
                iconColor: 'text-emerald-500',
              },
              blue: {
                gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
                blob: 'bg-blue-500/30',
                iconBg: 'from-blue-500/30 to-cyan-500/20',
                textGradient: 'from-blue-600 to-cyan-600',
                iconColor: 'text-blue-500',
              },
            };

            const colors = colorConfigs[stat.colorTheme] || colorConfigs.purple;
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
                  {/* Animated Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}
                  />

                  {/* Animated Floating Blob */}
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
                    className={`absolute -bottom-12 -left-12 h-24 w-24 rounded-full ${colors.blob} blur-2xl`}
                  />

                  <CardHeader className="relative p-4 sm:p-6">
                    <div className="mb-2 flex items-center gap-2 sm:gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        className={`rounded-xl bg-gradient-to-br ${colors.iconBg} p-2 shadow-lg backdrop-blur-sm sm:p-3`}
                      >
                        <IconComponent
                          className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.iconColor}`}
                        />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <CardTitle
                          className={`bg-gradient-to-r ${colors.textGradient} truncate bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg`}
                        >
                          {stat.title}
                        </CardTitle>
                        <CardDescription className="truncate text-[10px] sm:text-xs">
                          {stat.tooltip.split('.')[0]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative overflow-visible p-4 pt-0 sm:p-6 sm:pt-0">
                    {isLoading ? (
                      <ShimmerCard className="h-16 sm:h-20" />
                    ) : (
                      <div className="mb-2 flex w-full min-w-0 items-baseline gap-2 sm:mb-4 sm:gap-3">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 }}
                          key={stat.value ?? 0}
                          className={`bg-gradient-to-r ${colors.textGradient} overflow-visible bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl`}
                          style={{ wordBreak: 'keep-all' }}
                        >
                          {balanceVisible
                            ? stat.displayValue ||
                              `$${(stat.value ?? 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : '••••••'}
                        </motion.span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Daily ROS Performance - MOVED UP (Critical for showing earning potential) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DailyROSPerformance />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <QuickActions />
        </motion.div>

        {/* Rank Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <RankProgressCard />
        </motion.div>

        {/* Achievements Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.47 }}
        >
          <AchievementsSummaryCard />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ActivityFeed
            transactions={transactions || []}
            isLoading={transactionsLoading}
          />
        </motion.div>

        {/* Staking Streak - MOVED UP (Critical for habit building and retention) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-8 sm:mb-10"
        >
          {streakLoading ? (
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="relative">
                <ShimmerCard className="h-20" />
              </CardHeader>
              <CardContent className="relative">
                <ShimmerCard className="h-32" />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />

              {/* Animated Floating Blob */}
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
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
              />

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-3 shadow-lg backdrop-blur-sm"
                  >
                    <Clock className="h-6 w-6 text-blue-500" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Staking Streak
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Consecutive active days
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="mb-2 flex items-baseline gap-2 sm:mb-4 sm:gap-3">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    key={streakData?.currentStreak || 0}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-black break-words text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
                  >
                    {streakData?.currentStreak || 0}
                  </motion.span>
                  <span className="text-muted-foreground text-sm font-semibold sm:text-base md:text-lg">
                    days
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {(
                    streakData?.weeklyProgress ||
                    Array.from({ length: 7 }, () => ({ hasActiveStake: false }))
                  ).map((day, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
                      whileHover={{ scaleY: 1.2 }}
                      className={`h-10 flex-1 rounded-lg transition-all ${
                        day.hasActiveStake
                          ? 'bg-gradient-to-t from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50'
                          : 'bg-muted/50'
                      }`}
                      title={
                        day.hasActiveStake ? 'Active stake' : 'No active stake'
                      }
                    />
                  ))}
                </div>
                {streakData?.nextMilestone &&
                  streakData.daysUntilNextMilestone > 0 && (
                    <div className="text-muted-foreground mt-3 text-center text-xs">
                      {streakData.daysUntilNextMilestone} days until{' '}
                      {streakData.nextMilestone} day milestone
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Last Week's Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 sm:mt-10"
          >
            <Card className="bg-card/50 group relative overflow-visible border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  (lastWeekProfitChange ?? 0) >= 0
                    ? 'from-emerald-500/20 via-green-500/10 to-transparent'
                    : 'from-orange-500/20 via-red-500/10 to-transparent'
                }`}
              />

              {/* Animated Floating Blob */}
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
                className={`absolute -bottom-8 -left-12 h-24 w-24 rounded-full blur-2xl ${
                  (lastWeekProfitChange ?? 0) >= 0
                    ? 'bg-emerald-500/30'
                    : 'bg-orange-500/30'
                }`}
              />

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className={`rounded-xl p-2 shadow-lg backdrop-blur-sm sm:p-3 ${
                      (lastWeekProfitChange ?? 0) >= 0
                        ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/20'
                        : 'bg-gradient-to-br from-orange-500/30 to-red-500/20'
                    }`}
                  >
                    {(lastWeekProfitChange ?? 0) >= 0 ? (
                      <TrendingUp
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          (lastWeekProfitChange ?? 0) >= 0
                            ? 'text-emerald-500'
                            : 'text-orange-500'
                        }`}
                      />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                    )}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle
                      className={`truncate bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg ${
                        (lastWeekProfitChange ?? 0) >= 0
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600'
                          : 'bg-gradient-to-r from-orange-600 to-red-600'
                      }`}
                    >
                      Last Week&apos;s Profit
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Profit made last week
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="mb-2 flex items-baseline gap-2 sm:mb-4 sm:gap-3">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    key={lastWeekProfit ?? 0}
                    className={`bg-clip-text text-2xl font-black break-words text-transparent sm:text-3xl md:text-4xl lg:text-5xl ${
                      (lastWeekProfitChange ?? 0) >= 0
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600'
                        : 'bg-gradient-to-r from-orange-600 to-red-600'
                    }`}
                  >
                    $
                    {(lastWeekProfit ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </motion.span>
                </div>
                {(lastWeekProfitChange ?? 0) !== 0 && (
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className={`${
                        (lastWeekProfitChange ?? 0) >= 0
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'border-orange-500/30 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                      } px-3 py-1 text-sm font-semibold`}
                    >
                      <TrendingUp
                        className={`mr-1.5 h-3.5 w-3.5 ${
                          (lastWeekProfitChange ?? 0) >= 0
                            ? 'text-emerald-400'
                            : 'rotate-180 text-orange-400'
                        }`}
                      />
                      <span className="font-bold">
                        {(lastWeekProfitChange ?? 0) >= 0 ? '+' : ''}
                        {(lastWeekProfitChange ?? 0).toFixed(1)}% vs last week
                      </span>
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Additional Value Cards - Lower Priority */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {/* Live Trading Signals - MOVED DOWN (Additional value, less critical) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <LiveTradingSignals />
          </motion.div>

          {/* Live Platform Activity Card - MOVED DOWN (Social proof, less personal relevance) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />

              {/* Animated Floating Blob */}
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
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
              />

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                    >
                      <Circle className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                          Live Platform Activity
                        </CardTitle>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex-shrink-0"
                        >
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </motion.div>
                      </div>
                      <CardDescription className="text-[10px] sm:text-xs">
                        <Check className="mr-1 inline h-3 w-3 flex-shrink-0 text-emerald-500" />
                        Real-time user activities
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="custom-scrollbar relative max-h-[400px] space-y-2 overflow-y-auto p-4 pt-0 sm:max-h-[450px] sm:space-y-3 sm:p-6 sm:pt-0">
                {activityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <ShimmerCard key={i} className="h-20" />
                    ))}
                  </div>
                ) : displayActivities.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Circle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">No activities available</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {displayActivities.map((activity, index) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <motion.div
                          key={`${activity.user}-${activity.time}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 transition-all hover:border-blue-500/40 hover:shadow-md sm:p-4"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
                            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                              <div className="flex-shrink-0 rounded-lg bg-blue-500/20 p-1.5 sm:p-2">
                                <ActivityIcon
                                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activity.color}`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-bold sm:text-base">
                                  {activity.user}
                                </p>
                                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                                  {activity.action}
                                  {activity.amount && (
                                    <span className="text-foreground font-semibold">
                                      ${activity.amount.toLocaleString()}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border-border/50 flex items-center justify-between border-t pt-2 sm:pt-3">
                            <Badge
                              variant="outline"
                              className="bg-background/50 text-xs"
                            >
                              {activity.time}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                {/* Footer */}
                <div className="border-border/50 border-t pt-3">
                  <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-1 px-2 text-center text-xs sm:gap-1.5">
                    <Check className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                    <strong className="whitespace-nowrap">Auto-updated</strong>
                    <span className="text-muted-foreground/60 hidden sm:inline">
                      •
                    </span>
                    <span className="whitespace-nowrap">
                      Real-time platform activities
                    </span>
                  </p>
                </div>
              </CardContent>

              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: hsl(var(--muted-foreground) / 0.3);
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: hsl(var(--muted-foreground) / 0.5);
                }
              `}</style>
            </Card>
          </motion.div>
        </div>
      </div>

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
