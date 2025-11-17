'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Gift,
  Users,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useTransactionHistory,
  TransactionType,
  TransactionStatus,
  getTransactionTypeLabel,
  getTransactionStatusColor,
  getTransactionTypeColor,
  Transaction,
} from '@/lib/queries/transactionQueries';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch transactions with filters
  const { data, isLoading, error } = useTransactionHistory({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const transactions = data?.data.transactions || [];
  const pagination = data?.data.pagination;

  // Get icon for transaction type
  const getTypeIcon = (type: TransactionType) => {
    const icons = {
      deposit: ArrowDownRight,
      withdrawal: ArrowUpRight,
      transfer: ArrowRight,
      stake: TrendingUp,
      roi: DollarSign,
      bonus: Gift,
      referral: Users,
    };
    return icons[type] || FileText;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export to CSV (placeholder - can be implemented later)
  const handleExport = () => {
    alert('Export to CSV functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <NovuntSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Transactions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all your transactions and activities
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="hidden md:flex"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Label htmlFor="search" className="text-sm mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Label htmlFor="type-filter" className="text-sm mb-2 block">
              Type
            </Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value as TransactionType | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="stake">Stakes</SelectItem>
                <SelectItem value="roi">ROI Payouts</SelectItem>
                <SelectItem value="bonus">Bonuses</SelectItem>
                <SelectItem value="referral">Referrals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status-filter" className="text-sm mb-2 block">
              Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as TransactionStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const TypeIcon = getTypeIcon(transaction.type);
            const statusColor = getTransactionStatusColor(transaction.status);
            const typeColor = getTransactionTypeColor(transaction.type);

            return (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${typeColor.bg}`}>
                    <TypeIcon className={`w-6 h-6 ${typeColor.icon}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {getTransactionTypeLabel(transaction.type)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.createdAt)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'roi' || transaction.type === 'bonus' || transaction.type === 'referral'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : transaction.type === 'withdrawal'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'roi' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                          ${transaction.amount.toFixed(2)}
                        </p>
                        {transaction.fee && transaction.fee > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Fee: ${transaction.fee.toFixed(2)}
                          </p>
                        )}
                        {transaction.netAmount && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Net: ${transaction.netAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {transaction.metadata && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {transaction.metadata.recipientUsername && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">To:</span>{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                @{transaction.metadata.recipientUsername}
                              </span>
                            </div>
                          )}
                          {transaction.metadata.senderUsername && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">From:</span>{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                @{transaction.metadata.senderUsername}
                              </span>
                            </div>
                          )}
                          {transaction.metadata.network && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Network:</span>{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {transaction.metadata.network}
                              </span>
                            </div>
                          )}
                          {transaction.metadata.txHash && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">TX Hash:</span>{' '}
                              <span className="font-medium text-gray-900 dark:text-white font-mono">
                                {transaction.metadata.txHash.substring(0, 10)}...
                              </span>
                            </div>
                          )}
                          {transaction.metadata.week && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Week:</span>{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {transaction.metadata.week}
                              </span>
                            </div>
                          )}
                          {transaction.metadata.bonusType && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Bonus Type:</span>{' '}
                              <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {transaction.metadata.bonusType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-100 dark:bg-gray-900/30 rounded-full inline-block mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {typeFilter !== 'all' || statusFilter !== 'all' || searchQuery
                ? 'Try adjusting your filters or search query'
                : "You haven't made any transactions yet. Start by making a deposit!"}
            </p>
            {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <Button
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                variant="outline"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
