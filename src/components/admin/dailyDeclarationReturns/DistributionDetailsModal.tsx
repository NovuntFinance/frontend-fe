'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dailyDeclarationReturnsService } from '@/services/dailyDeclarationReturnsService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { fmt4, pct4 } from '@/utils/formatters';

interface DistributionDetailsModalProps {
  date: string;
  onClose: () => void;
}

export function DistributionDetailsModal({
  date,
  onClose,
}: DistributionDetailsModalProps) {
  // Fetch details
  const { data: detailsData, isLoading } = useQuery({
    queryKey: ['distribution-details', date],
    queryFn: async () => {
      return await dailyDeclarationReturnsService.getDistributionDetails(date);
    },
  });

  const details = detailsData?.data;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📋 Distribution Details - {date}</DialogTitle>
          <DialogDescription>
            Detailed information about this distribution execution
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Status and Queue Info */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <p className="mt-1 text-lg">
                  {details.status === 'COMPLETED' ? '✅' : '❌'}{' '}
                  {details.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Date
                </p>
                <p className="mt-1 font-mono text-sm">{details.date}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Queued By
                </p>
                <p className="mt-1 text-sm">
                  {details.queuedBy.username} ({details.queuedBy.email})
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Queued At
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {new Date(details.queuedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Configuration */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold">Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    ROS Percentage
                  </p>
                  <p className="mt-1 font-mono text-lg">
                    {pct4(details.values.rosPercentage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Execution Time
                  </p>
                  <p className="mt-1 font-mono text-lg">
                    {(details.executionTimeMs / 1000).toFixed(1)}s
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Premium Pool Amount
                  </p>
                  <p className="mt-1 font-mono">
                    $
                    {details.values.premiumPoolAmount.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Performance Pool Amount
                  </p>
                  <p className="mt-1 font-mono">
                    $
                    {details.values.performancePoolAmount.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}
                  </p>
                </div>
              </div>
              {details.values.description && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </p>
                  <p className="mt-1 text-sm">{details.values.description}</p>
                </div>
              )}
            </div>

            {/* ROS Distribution */}
            {details.rosDistribution && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
                  💰 ROS Distribution
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Processed Stakes
                    </p>
                    <p className="mt-1 font-mono text-lg">
                      {details.rosDistribution.processedStakes.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Total Distributed
                    </p>
                    <p className="mt-1 font-mono">
                      $
                      {details.rosDistribution.totalDistributed.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pool Distribution */}
            {details.poolDistribution && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <h3 className="mb-3 font-semibold text-green-900 dark:text-green-100">
                  🎁 Pool Distribution
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded bg-white p-3 dark:bg-gray-900">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Premium Pool
                      </p>
                      <p className="mt-1">
                        <span className="font-mono text-lg">
                          {details.poolDistribution.premium.usersCount}
                        </span>{' '}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          users
                        </span>
                      </p>
                      <p className="mt-1 font-mono">
                        $
                        {details.poolDistribution.premium.totalAmount.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                    <div className="rounded bg-white p-3 dark:bg-gray-900">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Performance Pool
                      </p>
                      <p className="mt-1">
                        <span className="font-mono text-lg">
                          {details.poolDistribution.performance.usersCount}
                        </span>{' '}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          users
                        </span>
                      </p>
                      <p className="mt-1 font-mono">
                        $
                        {details.poolDistribution.performance.totalAmount.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Time */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold">⏱️ Execution Details</h3>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Duration
                </p>
                <p className="mt-1 font-mono text-lg">
                  {fmt4(details.executionTimeMs / 1000)}s
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Executed At
                </p>
                <p className="mt-1 font-mono text-sm">
                  {new Date(details.executedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Error (if any) */}
            {details.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <h3 className="mb-2 font-semibold text-red-900 dark:text-red-100">
                  ❌ Error
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {details.error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-gray-600">
            <p>No details available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
