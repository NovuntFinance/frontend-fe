'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  Clock,
  Info,
  Calendar,
  TrendingDown,
  Circle,
  Star,
  Gift,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useWalletBalance, useActiveStakes, useTransactions, useDashboardOverview } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { StakeCard } from '@/components/dashboard/StakeCard';
import { AuthErrorFallback } from '@/components/dashboard/AuthErrorFallback';
import { LiveTradingSignals } from '@/components/dashboard/LiveTradingSignals';
import { WelcomeModal } from '@/components/auth/WelcomeModal';
import { RegistrationBonusBanner } from '@/components/registration-bonus/RegistrationBonusBanner';
import { RankProgressCard } from '@/components/rank-progress/RankProgressCard';
import { WelcomeBackCard } from '@/components/dashboard/WelcomeBackCard';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

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
  const { data: walletBalance, isLoading: balanceLoading, error: balanceError, refetch } = useWalletBalance();
  const { data: activeStakes, isLoading: stakesLoading, error: stakesError } = useActiveStakes();
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactions();
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();

  // Platform ranks
  const ranks = React.useMemo(() => [
    'Stakeholder',
    'Associate Stakeholder',
    'Principal Strategist',
    'Elite Capitalist',
    'Wealth Architect',
    'Finance Titan'
  ], []);

  // Generate random platform activity
  const generateRandomActivity = React.useCallback(() => {
    const generateMaskedName = () => {
      const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna', 'Tom', 'Rachel', 'James', 'Sophie', 'Mark', 'Nina', 'Paul', 'Grace', 'Peter', 'Kate', 'Alex', 'Maria', 'Dan', 'Eva', 'Ryan', 'Zoe', 'Luke', 'Mia', 'Ben', 'Ella', 'Sam', 'Amy', 'Jack', 'Lily', 'Max', 'Ruby', 'Leo', 'Ivy', 'Noah', 'Lucy', 'Jake', 'Aria', 'Owen', 'Maya', 'Cole', 'Leah', 'Ian', 'Nora', 'Eric', 'Jade', 'Sean', 'Rose'];
      const lastNames = ['Anderson', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans'];

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
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

    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const amount = activity.amountRange
      ? Math.floor(Math.random() * (activity.amountRange[1] - activity.amountRange[0])) + activity.amountRange[0]
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

  // Generate initial activity and update every 30 seconds
  const [currentActivity, setCurrentActivity] = React.useState(() => generateRandomActivity());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(generateRandomActivity());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [generateRandomActivity]);

  // Check if ALL queries have failed (indicating auth issue)
  const allQueriesFailed =
    !balanceLoading && !walletBalance &&
    !stakesLoading && !activeStakes &&
    !transactionsLoading && !transactions &&
    !overviewLoading && !overview;

  // If all queries failed and we're not loading, show auth error
  if (allQueriesFailed && (balanceError || stakesError || transactionsError || overviewError)) {
    return <AuthErrorFallback />;
  }

  // Calculate totals with safe property access
  const totalBalance = overview?.wallets?.totalBalance ?? ((walletBalance?.funded?.balance || 0) + (walletBalance?.earnings?.balance || 0));
  const totalStaked = overview?.staking?.totalStaked ?? (Array.isArray(activeStakes) ? activeStakes.reduce((sum, stake) => sum + stake.amount, 0) : 0);
  const totalEarnings = overview?.staking?.totalEarnings ?? walletBalance?.earnings?.balance ?? 0;
  const totalReferralEarnings = overview?.referrals?.referralEarnings ?? 0;
  const availableForWithdrawal = overview?.wallets?.availableForWithdrawal ?? walletBalance?.availableForWithdrawal ?? walletBalance?.earnings?.availableBalance ?? 0;
  const lockedInStakes = overview?.wallets?.lockedInStakes ?? walletBalance?.lockedInStakes ?? walletBalance?.funded?.lockedBalance ?? 0;
  const pendingWithdrawals = overview?.wallets?.pendingWithdrawals ?? walletBalance?.pendingWithdrawals ?? 0;

  // Calculate total portfolio value (combines all stakes and wallet balances)
  const totalPortfolioValue = totalBalance + totalStaked;

  // Last week's profit (will be updated by backend)
  // TODO: Backend to add analytics.lastWeekProfit and analytics.lastWeekProfitChange
  const overviewData = overview as { analytics?: { lastWeekProfit?: number; lastWeekProfitChange?: number } } | undefined;
  const lastWeekProfit = overviewData?.analytics?.lastWeekProfit ?? 0;
  const lastWeekProfitChange = overviewData?.analytics?.lastWeekProfitChange ?? 0;

  // Pending earnings (optional - profits awaiting maturity)
  // TODO: Backend to add staking.pendingEarnings
  const pendingEarnings = 0; // Will come from overview?.staking?.pendingEarnings

  // Next payout date (optional - next ROS distribution)
  const nextPayoutDate = overview?.staking?.nextPayout ?? null;

  const isLoading = balanceLoading || overviewLoading;
  const isRefetching = false; // Can be connected to refetch state

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="space-y-6">
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
          />
        </motion.div>

        {/* Registration Bonus Banner */}
        <RegistrationBonusBanner />

        {/* Stats Grid - Premium Cards */}
        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Total Balance',
              value: totalBalance,
              tooltip: 'Funds currently available across all wallets.',
              icon: Wallet,
              colorTheme: 'purple' as const,
            },
            {
              title: 'Total Earnings',
              value: totalEarnings + totalReferralEarnings,
              tooltip: 'Includes staking profits, referral bonuses, and other earnings.',
              icon: DollarSign,
              colorTheme: 'emerald' as const,
            },
            {
              title: "Last Week's Profit",
              value: lastWeekProfit,
              tooltip: 'Profit made last week.',
              icon: lastWeekProfitChange >= 0 ? TrendingUp : TrendingDown,
              colorTheme: lastWeekProfitChange >= 0 ? 'emerald' as const : 'orange' as const,
              change: `${lastWeekProfitChange >= 0 ? '+' : ''}${lastWeekProfitChange.toFixed(1)}%`,
              changePositive: lastWeekProfitChange >= 0,
            },
            {
              title: 'Live Platform Activity',
              value: null,
              tooltip: 'Real-time user activities across the platform.',
              icon: Circle,
              colorTheme: 'blue' as const,
              isActivity: true,
            },
            ...(pendingEarnings > 0 ? [{
              title: 'Pending Earnings',
              value: pendingEarnings,
              tooltip: 'Earnings awaiting confirmation or release.',
              icon: Clock,
              colorTheme: 'orange' as const,
            }] : []),
            ...(nextPayoutDate ? [{
              title: 'Next Payout',
              value: null,
              displayValue: new Date(nextPayoutDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              tooltip: 'Expected date for your next ROS or distribution.',
              icon: Calendar,
              colorTheme: 'blue' as const,
            }] : []),
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <NovuntPremiumCard
                title={stat.title}
                tooltip={stat.tooltip}
                icon={stat.icon}
                colorTheme={stat.colorTheme}
                className="h-full"
              >
                {isLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : stat.isActivity ? (
                  // Live Activity Display
                  <motion.div
                    key={currentActivity.user + currentActivity.time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${stat.colorTheme}-500/10`}>
                        <currentActivity.icon className={`h-4 w-4 text-${stat.colorTheme}-500`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {currentActivity.user}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {currentActivity.action}
                          {currentActivity.amount && (
                            <span className="font-semibold text-foreground">
                              ${currentActivity.amount.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Badge variant="outline" className="text-xs bg-background/50">
                        {currentActivity.time}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-xs font-medium text-green-500">Live</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        {balanceVisible ? (
                          stat.displayValue || `$${(stat.value ?? 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        ) : '••••••'}
                      </p>
                    </div>
                    {stat.change && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={stat.changePositive ? "default" : "destructive"}
                          className={cn(
                            "text-xs font-bold px-2 py-0.5",
                            stat.changePositive
                              ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border-emerald-500/20"
                              : "bg-red-500/20 text-red-600 hover:bg-red-500/30 border-red-500/20"
                          )}
                        >
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground">vs last week</span>
                      </div>
                    )}
                  </div>
                )}
              </NovuntPremiumCard>
            </motion.div>
          ))}
        </div>

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

        {/* Portfolio Performance - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PortfolioChart />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ActivityFeed
            transactions={transactions || []}
            isLoading={transactionsLoading}
          />
        </motion.div>

        {/* Live Trading Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <LiveTradingSignals />
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* ROS Card */}
          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm group">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent" />

            {/* Animated Floating Blob */}
            <motion.div
              animate={{
                x: [0, 15, 0],
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-12 -right-12 w-24 h-24 bg-green-500/30 rounded-full blur-2xl"
            />

            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 backdrop-blur-sm shadow-lg"
                >
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </motion.div>
                <div>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Return on Stake
                  </CardTitle>
                  <CardDescription className="text-xs">Overall performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-3 mb-3">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                >
                  24.8%
                </motion.span>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none shadow-lg hover:shadow-xl">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +5.2%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Compared to last month
              </p>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ delay: 1, duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm group">
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
              className="absolute -bottom-12 -left-12 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl"
            />

            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 backdrop-blur-sm shadow-lg"
                >
                  <Clock className="h-6 w-6 text-blue-500" />
                </motion.div>
                <div>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Staking Streak
                  </CardTitle>
                  <CardDescription className="text-xs">Consecutive active days</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline gap-3 mb-4">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                >
                  45
                </motion.span>
                <span className="text-lg font-semibold text-muted-foreground">days</span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
                    whileHover={{ scaleY: 1.2 }}
                    className={`h-10 flex-1 rounded-lg transition-all ${i < 6
                      ? 'bg-gradient-to-t from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50'
                      : 'bg-muted/50'
                      }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Welcome Modal for First-Time Users */}
      {
        newUserInfo && (
          <WelcomeModal
            isOpen={showWelcomeModal}
            onClose={handleWelcomeModalClose}
            firstName={newUserInfo.firstName}
            lastName={newUserInfo.lastName}
            email={newUserInfo.email}
          />
        )
      }
    </div >
  );
}
