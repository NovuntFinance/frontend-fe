/**
 * Bonus Payout History Component
 * Displays paginated history of weekly bonus payouts
 * Shows transparency in how registration bonus is distributed
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useBonusPayoutHistory } from '@/lib/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyStates } from '@/components/EmptyStates';

interface BonusPayoutHistoryProps {
  /** Initial page number */
  initialPage?: number;
  /** Items per page */
  pageSize?: number;
}

/**
 * Bonus Payout History Component
 * Shows weekly bonus payouts with pagination
 */
export function BonusPayoutHistory({ 
  initialPage = 1, 
  pageSize = 10 
}: BonusPayoutHistoryProps) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const { data, isLoading, error } = useBonusPayoutHistory(currentPage, pageSize);

  // Handle pagination
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.data?.pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Failed to load payout history. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data?.data?.payouts || data.data.payouts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyStates.EmptyState
            icon={<DollarSign className="h-12 w-12" />}
            title="No payouts yet"
            description="Payouts will appear here when you earn ROS from your stakes"
          />
        </CardContent>
      </Card>
    );
  }

  const { payouts, pagination, totalPaidOut, totalRemaining } = data.data;
  const totalPages = pagination.totalPages;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Payout History
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Track how your registration bonus is paid out weekly with ROS earnings
          </p>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <p className="text-xs text-emerald-700 font-medium">Total Paid Out</p>
              </div>
              <p className="text-lg font-bold text-emerald-900">
                {formatCurrency(totalPaidOut)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Remaining Balance</p>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>

          {/* Payout Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Week</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">ROS %</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Amount Paid</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, index) => (
                  <motion.tr
                    key={payout._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-700">
                            {payout.weekNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(payout.paidAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-700">
                          {payout.rosPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(payout.amountPaid)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-600">
                        {formatCurrency(payout.remainingBalance)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {totalPages} 
                <span className="ml-2 text-gray-400">
                  ({pagination.totalItems} total payouts)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrevPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageClick(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700">
              <strong>How it works:</strong> Your registration bonus is paid out gradually. 
              Each week, when you earn ROS from your stakes, a percentage of your bonus is paid out. 
              For example, if you earn 5% ROS, you receive 5% of your remaining bonus.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
