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
import { pct4 } from '@/utils/formatters';

interface DistributionDetailsModalProps {
  date: string;
  onClose: () => void;
}

function usd(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DistributionDetailsModal({
  date,
  onClose,
}: DistributionDetailsModalProps) {
  const { data: detailsRes, isLoading } = useQuery({
    queryKey: ['distribution-details', date],
    queryFn: async () => {
      return await dailyDeclarationReturnsService.getDistributionDetails(date);
    },
  });

  const d = detailsRes?.data;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Distribution details — {date}</DialogTitle>
          <DialogDescription>
            Declared configuration and execution totals (stake ROS + qualifier
            pools)
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          </div>
        ) : d ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <p className="mt-1 text-lg">
                  {d.status === 'COMPLETED' ? '✅' : '❌'} {d.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Date
                </p>
                <p className="mt-1 font-mono text-sm">{d.date}</p>
              </div>
              {d.queue?.queuedBy ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Queued by
                    </p>
                    <p className="mt-1 text-sm">
                      {d.queue.queuedBy.username} ({d.queue.queuedBy.email})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Queued at
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {d.queue.queuedAt
                        ? new Date(d.queue.queuedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold">Declared configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Total ROS % (document)
                  </p>
                  <p className="mt-1 font-mono text-lg">
                    {pct4(d.declaration.rosPercentage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Pool budget (premium + performance)
                  </p>
                  <p className="mt-1 font-mono">
                    ${usd(d.declaration.totalPoolAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Premium pool (declared)
                  </p>
                  <p className="mt-1 font-mono">
                    ${usd(d.declaration.premiumPoolAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Performance pool (declared)
                  </p>
                  <p className="mt-1 font-mono">
                    ${usd(d.declaration.performancePoolAmount)}
                  </p>
                </div>
              </div>
              {d.declaration.description ? (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </p>
                  <p className="mt-1 text-sm">{d.declaration.description}</p>
                </div>
              ) : null}
            </div>

            {d.execution?.statistics ? (
              <>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                  <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
                    Stake ROS (actual)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Processed stakes (reported)
                      </p>
                      <p className="mt-1 font-mono text-lg">
                        {d.execution.statistics.ros.processedStakes.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Total distributed (USDT)
                      </p>
                      <p className="mt-1 font-mono">
                        ${usd(d.execution.statistics.ros.totalDistributed)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <h3 className="mb-3 font-semibold text-green-900 dark:text-green-100">
                    Pools — paid to qualifiers (actual)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded bg-white p-3 dark:bg-gray-900">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Premium
                      </p>
                      <p className="mt-1">
                        <span className="font-mono text-lg">
                          {d.execution.statistics.premiumPool.usersReceived}
                        </span>{' '}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          users
                        </span>
                      </p>
                      <p className="mt-1 font-mono">
                        $
                        {usd(
                          d.execution.statistics.premiumPool.totalDistributed
                        )}
                      </p>
                    </div>
                    <div className="rounded bg-white p-3 dark:bg-gray-900">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Performance
                      </p>
                      <p className="mt-1">
                        <span className="font-mono text-lg">
                          {d.execution.statistics.performancePool.usersReceived}
                        </span>{' '}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          users
                        </span>
                      </p>
                      <p className="mt-1 font-mono">
                        $
                        {usd(
                          d.execution.statistics.performancePool
                            .totalDistributed
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-green-200 pt-3 dark:border-green-800">
                    <p className="text-xs font-medium text-green-800 dark:text-green-200">
                      Combined platform outflow (ROS + both pools)
                    </p>
                    <p className="mt-1 font-mono text-xl font-semibold">
                      ${usd(d.execution.statistics.totalDistributed)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="mb-3 font-semibold">Execution timing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Duration
                      </p>
                      <p className="mt-1 font-mono text-lg">
                        {((d.execution.executionTimeMs ?? 0) / 1000).toFixed(1)}
                        s
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Completed at
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        {d.execution.executedAt
                          ? new Date(d.execution.executedAt).toLocaleString()
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {d.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <h3 className="mb-2 font-semibold text-red-900 dark:text-red-100">
                  Error
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {d.error.message}
                  {d.error.reason ? ` — ${d.error.reason}` : ''}
                </p>
              </div>
            ) : null}
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
