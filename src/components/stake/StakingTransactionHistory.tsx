/**
 * Staking Transaction History Component
 * Dedicated view for staking-related transactions with tabs for:
 * - Staking Activity (stake, stake_completion)
 * - Earnings (ros_payout, pool payouts)
 *
 * Based on the enhanced-transactions API with category filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TrendingUp,
  DollarSign,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Target,
  Star,
  Award,
  FileText,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useWallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingStates } from '@/components/ui/loading-states';
import { prefersReducedMotion } from '@/lib/accessibility';
import {
  formatCurrency,
  formatTransactionType,
  formatTransactionStatus,
  formatAmountWithDirection,
  formatTransactionDate,
} from '@/lib/utils/wallet';
import type { Transaction } from '@/types/enhanced-transaction';

type StakingTab = 'staking' | 'earnings' | 'all';

/**
 * Staking Transaction History Component
 */
export function StakingTransactionHistory() {
  const [activeTab, setActiveTab] = useState<StakingTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const reducedMotion = prefersReducedMotion();

  // Fetch staking category transactions
  const {
    data: stakingData,
    isLoading: isLoadingStaking,
    refetch: refetchStaking,
  } = useTransactionHistory({
    category: 'staking',
    page: 1,
    limit: 1000, // Fetch all for client-side filtering
  });

  // Fetch earnings category transactions
  const {
    data: earningsData,
    isLoading: isLoadingEarnings,
    refetch: refetchEarnings,
  } = useTransactionHistory({
    category: 'earnings',
    page: 1,
    limit: 1000, // Fetch all for client-side filtering
  });

  const isLoading = isLoadingStaking || isLoadingEarnings;

  // Combine transactions based on active tab
  const allTransactions = useMemo(() => {
    const stakingTxs = stakingData?.transactions || [];
    const earningsTxs = earningsData?.transactions || [];

    switch (activeTab) {
      case 'staking':
        return stakingTxs;
      case 'earnings':
        return earningsTxs;
      case 'all':
        // Merge, deduplicate by _id, and sort by timestamp (newest first)
        const allTxs = [...stakingTxs, ...earningsTxs];
        const uniqueTxsMap = new Map<string, Transaction>();
        const duplicateIds = new Set<string>();

        // Deduplicate: if a transaction appears in both arrays, keep only one
        allTxs.forEach((tx) => {
          if (!uniqueTxsMap.has(tx._id)) {
            uniqueTxsMap.set(tx._id, tx);
          } else {
            duplicateIds.add(tx._id);
          }
        });

        // Log duplicates in development mode for debugging
        if (process.env.NODE_ENV === 'development' && duplicateIds.size > 0) {
          console.warn(
            '[StakingTransactionHistory] ⚠️ Found duplicate transactions:',
            Array.from(duplicateIds)
          );
        }

        const uniqueTxs = Array.from(uniqueTxsMap.values());
        return uniqueTxs.sort((a, b) => {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      default:
        return [];
    }
  }, [activeTab, stakingData, earningsData]);

  // Pagination calculations
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const transactions = allTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of transaction list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    refetchStaking();
    refetchEarnings();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Staking Streak Template */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" />

          {/* Animated Floating Blob */}
          {!reducedMotion && (
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
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-indigo-500/30 blur-2xl"
            />
          )}

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <TrendingUp className="h-5 w-5 text-indigo-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Staking Transaction History
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    View all your staking activities and earnings
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8 w-8 shrink-0 rounded-full"
                aria-label="Refresh transactions"
              >
                <RefreshCw
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as StakingTab)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            <ArrowDownRight className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">All Staking</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="staking" className="text-xs sm:text-sm">
            <TrendingUp className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Staking Activity</span>
            <span className="sm:hidden">Staking</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs sm:text-sm">
            <DollarSign className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <LoadingStates.List items={5} />
          ) : transactions.length > 0 ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent" />
                {!reducedMotion && (
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
                    className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
                  />
                )}
                <CardHeader className="relative p-4 sm:p-6">
                  <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                      >
                        <FileText className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                          {activeTab === 'staking' && 'Staking Activity'}
                          {activeTab === 'earnings' && 'Earnings'}
                          {activeTab === 'all' && 'All Staking Related'}
                        </CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">
                          {transactions.length} transactions
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transactions.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative p-0 pt-0 sm:pt-0">
                  <div className="divide-border/50 divide-y">
                    {transactions.map(
                      (transaction: Transaction, index: number) => (
                        <StakingTransactionItem
                          key={transaction._id}
                          transaction={transaction}
                          index={index}
                        />
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-card/50 mt-4 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, allTransactions.length)} of{' '}
                    {allTransactions.length} transactions
                  </p>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 text-xs sm:h-9 sm:text-sm"
                    >
                      <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <span className="bg-muted flex items-center rounded-md px-2 text-xs sm:px-4 sm:text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 text-xs sm:h-9 sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-gray-500/10 to-transparent" />
                {!reducedMotion && (
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
                    className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-slate-500/30 blur-2xl"
                  />
                )}
                <CardContent className="relative p-8 text-center sm:p-12">
                  <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-30 sm:h-16 sm:w-16" />
                  <p className="text-muted-foreground mb-2 text-base font-medium sm:text-lg">
                    No transactions found
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {activeTab === 'staking' &&
                      'Your staking activity will appear here'}
                    {activeTab === 'earnings' &&
                      'Your earnings will appear here'}
                    {activeTab === 'all' &&
                      'Your staking transactions will appear here'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Staking Transaction Item Component
 */
function StakingTransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const reducedMotion = prefersReducedMotion();
  const statusInfo = formatTransactionStatus(transaction.status);
  const typeIcon = getStakingTransactionIcon(
    transaction.type,
    transaction.direction
  );
  const isPositive = transaction.direction === 'in';
  const isNeutral = transaction.direction === 'neutral';

  // Extract staking-specific metadata
  const stakeId = transaction.metadata?.stakeId;
  const weekNumber = transaction.metadata?.weekNumber;
  const rosPercentage = transaction.metadata?.rosPercentage;
  const stakeAmount = transaction.metadata?.stakeAmount;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={reducedMotion ? false : { opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-muted/50 group p-3 transition-colors sm:p-4"
    >
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-4">
        {/* Left: Icon & Details */}
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-4">
          {/* Icon */}
          <div
            className={`shrink-0 rounded-lg p-2 sm:rounded-xl sm:p-3 ${
              isPositive
                ? 'bg-emerald-500/10'
                : isNeutral
                  ? 'bg-muted'
                  : 'bg-blue-500/10'
            }`}
          >
            <div className="h-4 w-4 sm:h-5 sm:w-5">{typeIcon}</div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p className="text-foreground text-sm font-semibold sm:text-base">
                {formatTransactionType(transaction.type, transaction.typeLabel)}
              </p>
              <Badge
                className={`${statusInfo.bgColor} ${statusInfo.color} text-[10px] sm:text-xs`}
              >
                {statusInfo.label}
              </Badge>
              {transaction.category && (
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  {transaction.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-1 line-clamp-2 text-xs sm:line-clamp-1 sm:text-sm">
              {transaction.description}
            </p>

            {/* Staking-specific metadata */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[10px] sm:gap-3 sm:text-xs">
              <span>{formatTransactionDate(transaction.timestamp)}</span>
              {weekNumber && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Week {weekNumber}
                </span>
              )}
              {rosPercentage && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {rosPercentage}% ROS
                </span>
              )}
              {stakeAmount && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Stake: {formatCurrency(stakeAmount, { showCurrency: false })}
                </span>
              )}
              {stakeId && (
                <span className="font-mono text-xs">
                  Stake ID: {stakeId.slice(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount */}
        <div className="ml-2 shrink-0 text-right sm:ml-4">
          <p
            className={`text-sm font-bold sm:text-lg ${
              isPositive
                ? 'text-emerald-500'
                : isNeutral
                  ? 'text-muted-foreground'
                  : 'text-blue-500'
            }`}
          >
            {formatAmountWithDirection(
              transaction.amount,
              transaction.direction
            )}
          </p>
          {transaction.fee > 0 && (
            <p className="text-muted-foreground text-[10px] sm:text-xs">
              Fee: {formatCurrency(transaction.fee, { showCurrency: false })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Get staking transaction icon based on type
 */
function getStakingTransactionIcon(
  type: string,
  direction: 'in' | 'out' | 'neutral'
): React.ReactNode {
  const iconClass = 'h-5 w-5';

  switch (type) {
    case 'stake':
      return <ArrowUpRight className={`${iconClass} text-blue-500`} />;
    case 'stake_completion':
      return <Target className={`${iconClass} text-purple-500`} />;
    case 'ros_payout':
      return <DollarSign className={`${iconClass} text-emerald-500`} />;
    case 'stake_pool_payout':
    case 'performance_pool_payout':
    case 'premium_pool_payout':
      return <Award className={`${iconClass} text-amber-500`} />;
    default:
      if (direction === 'in') {
        return <ArrowDownRight className={`${iconClass} text-emerald-500`} />;
      }
      if (direction === 'out') {
        return <ArrowUpRight className={`${iconClass} text-blue-500`} />;
      }
      return <TrendingUp className={`${iconClass} text-muted-foreground`} />;
  }
}
