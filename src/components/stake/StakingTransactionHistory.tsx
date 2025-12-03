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
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShimmerCard } from '@/components/ui/shimmer';
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
  const transactions = useMemo(() => {
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

  const handleRefresh = () => {
    refetchStaking();
    refetchEarnings();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staking Transaction History</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            View all your staking activities and earnings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as StakingTab)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            <ArrowDownRight className="mr-2 h-4 w-4" />
            All Staking
          </TabsTrigger>
          <TabsTrigger value="staking">
            <TrendingUp className="mr-2 h-4 w-4" />
            Staking Activity
          </TabsTrigger>
          <TabsTrigger value="earnings">
            <DollarSign className="mr-2 h-4 w-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>
                    {activeTab === 'staking' && 'Staking Activity'}
                    {activeTab === 'earnings' && 'Earnings'}
                    {activeTab === 'all' && 'All Staking Related'}
                  </span>
                  <Badge variant="outline">
                    {transactions.length} transactions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
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
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-30" />
                <p className="text-muted-foreground mb-2 text-lg font-medium">
                  No transactions found
                </p>
                <p className="text-muted-foreground text-sm">
                  {activeTab === 'staking' &&
                    'Your staking activity will appear here'}
                  {activeTab === 'earnings' && 'Your earnings will appear here'}
                  {activeTab === 'all' &&
                    'Your staking transactions will appear here'}
                </p>
              </CardContent>
            </Card>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-muted/50 group p-4 transition-colors"
    >
      <div className="flex items-center justify-between">
        {/* Left: Icon & Details */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Icon */}
          <div
            className={`shrink-0 rounded-xl p-3 ${
              isPositive
                ? 'bg-emerald-500/10'
                : isNeutral
                  ? 'bg-muted'
                  : 'bg-blue-500/10'
            }`}
          >
            {typeIcon}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="text-foreground font-semibold">
                {transaction.typeLabel ||
                  formatTransactionType(transaction.type)}
              </p>
              <Badge
                className={`${statusInfo.bgColor} ${statusInfo.color} text-xs`}
              >
                {statusInfo.label}
              </Badge>
              {transaction.category && (
                <Badge variant="outline" className="text-xs">
                  {transaction.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-1 text-sm">
              {transaction.description}
            </p>

            {/* Staking-specific metadata */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
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
        <div className="ml-4 shrink-0 text-right">
          <p
            className={`text-lg font-bold ${
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
            <p className="text-muted-foreground text-xs">
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
