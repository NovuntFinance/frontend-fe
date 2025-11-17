/**
 * Transaction History Component
 * Ultra-modern transaction list with filtering and pagination
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, Download, ArrowUpRight, ArrowDownRight, TrendingUp, Gift, RefreshCw } from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerCard } from '@/components/ui/shimmer';
import { formatCurrency, formatTransactionType, formatTransactionStatus, maskWalletAddress } from '@/lib/utils/wallet';
import type { TransactionFilters } from '@/services/walletApi';

/**
 * Transaction History Component
 */
export function TransactionHistory() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useTransactionHistory(filters);
  const transactionData = data as { transactions: any[]; pagination?: any } | undefined;

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({
      ...prev,
      search: query || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load transactions</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View all your deposits, withdrawals, and transfers
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                handleFilterChange('type', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="stake">Stakes</SelectItem>
                <SelectItem value="bonus">Bonuses</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      ) : transactionData?.transactions && transactionData.transactions.length > 0 ? (
        <>
          <div className="space-y-3">
            <AnimatePresence>
              {transactionData.transactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction._id}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {transactionData.pagination && transactionData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((transactionData.pagination.page - 1) * transactionData.pagination.limit) + 1} to{' '}
                {Math.min(transactionData.pagination.page * transactionData.pagination.limit, transactionData.pagination.total)} of{' '}
                {transactionData.pagination.total} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(transactionData.pagination.page - 1)}
                  disabled={!transactionData.pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(transactionData.pagination.page + 1)}
                  disabled={!transactionData.pagination.hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Transaction Item Component
 */
function TransactionItem({
  transaction,
  index,
}: {
  transaction: any;
  index: number;
}) {
  const statusInfo = formatTransactionStatus(transaction.status);
  const typeIcon = getTransactionIcon(transaction.type);
  const isPositive = ['deposit', 'bonus'].includes(transaction.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-4 flex-1">
              {/* Icon */}
              <motion.div
                className={`p-3 rounded-xl ${
                  isPositive ? 'bg-success/10' : 'bg-destructive/10'
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {typeIcon}
              </motion.div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">
                    {formatTransactionType(transaction.type)}
                  </p>
                  <Badge className={statusInfo.bgColor + ' ' + statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
                  {transaction.txId && (
                    <span className="font-mono text-xs">
                      {maskWalletAddress(transaction.txId)}
                    </span>
                  )}
                  {transaction.network && (
                    <Badge variant="outline" className="text-xs">
                      {transaction.network}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Amount */}
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {isPositive ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount), { showCurrency: false })}
              </p>
              {transaction.fee && (
                <p className="text-xs text-muted-foreground">
                  Fee: {formatCurrency(transaction.fee, { showCurrency: false })}
                </p>
              )}
              {transaction.netAmount && transaction.netAmount !== transaction.amount && (
                <p className="text-xs text-muted-foreground">
                  Net: {formatCurrency(transaction.netAmount, { showCurrency: false })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Get transaction type icon
 */
function getTransactionIcon(type: string) {
  const iconClass = 'h-5 w-5';
  switch (type) {
    case 'deposit':
      return <ArrowDownRight className={`${iconClass} text-success`} />;
    case 'withdrawal':
      return <ArrowUpRight className={`${iconClass} text-destructive`} />;
    case 'transfer':
      return <RefreshCw className={`${iconClass} text-primary`} />;
    case 'stake':
      return <TrendingUp className={`${iconClass} text-primary`} />;
    case 'bonus':
      return <Gift className={`${iconClass} text-success`} />;
    default:
      return <RefreshCw className={`${iconClass} text-muted-foreground`} />;
  }
}


