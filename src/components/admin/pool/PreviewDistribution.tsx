'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, Award, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PreviewDistributionResponse } from '@/types/pool';

interface PreviewDistributionProps {
  preview: PreviewDistributionResponse['data'];
}

// Calculate percentage for a rank's share
const calculatePercentage = (rankTotal: number, poolTotal: number): number => {
  if (poolTotal === 0) return 0;
  return (rankTotal / poolTotal) * 100;
};

export function PreviewDistribution({ preview }: PreviewDistributionProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(preview.totalAmount)}
                </p>
              </div>
              <DollarSign className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">
                  Total Qualifiers
                </p>
                <p className="text-2xl font-bold">{preview.totalQualifiers}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Performance: {preview.performancePool.totalQualifiers} •
                  Premium: {preview.premiumPool.totalQualifiers}
                </p>
              </div>
              <Users className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Pool Details */}
      {preview.performancePool.totalAmount > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>
                  Performance Pool Distribution (
                  {formatCurrency(preview.performancePool.totalAmount)})
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Total Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(preview.performancePool.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Qualifiers</p>
                <p className="text-xl font-bold">
                  {preview.performancePool.totalQualifiers}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Average per Qualifier
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(preview.performancePool.perQualifierAmount)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  * Varies by rank (see table below)
                </p>
              </div>
            </div>

            {preview.performancePool.byRank &&
            preview.performancePool.byRank.length > 0 ? (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium">
                    Breakdown by Rank:
                  </p>
                  <p className="text-muted-foreground text-xs italic">
                    Each rank gets a percentage of the total pool, then divided
                    equally among users in that rank
                  </p>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead className="text-right">Qualifiers</TableHead>
                        <TableHead className="text-right">
                          Rank&apos;s Share
                        </TableHead>
                        <TableHead className="text-right">Per User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.performancePool.byRank.map((rankDist, index) => {
                        const percentage = calculatePercentage(
                          rankDist.totalAmount,
                          preview.performancePool.totalAmount
                        );
                        return (
                          <TableRow key={`${rankDist.rank}-${index}`}>
                            <TableCell className="font-medium">
                              {rankDist.rank}
                            </TableCell>
                            <TableCell className="text-right">
                              {rankDist.eligibleUsers}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold">
                                  {formatCurrency(rankDist.totalAmount)}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(rankDist.perUserAmount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted font-bold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">
                          {preview.performancePool.totalQualifiers}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(preview.performancePool.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {/* Debug: Show if there's a mismatch */}
                {(() => {
                  const displayedQualifiers =
                    preview.performancePool.byRank.reduce(
                      (sum, rank) => sum + rank.eligibleUsers,
                      0
                    );
                  const displayedAmount = preview.performancePool.byRank.reduce(
                    (sum, rank) => sum + rank.totalAmount,
                    0
                  );
                  // Use totalToDistribute if available (actual amount to distribute)
                  // Otherwise use totalAmount (might be input amount)
                  const expectedAmount =
                    preview.performancePool.totalToDistribute ??
                    preview.performancePool.totalAmount;
                  const hasMismatch =
                    displayedQualifiers !==
                      preview.performancePool.totalQualifiers ||
                    Math.abs(displayedAmount - expectedAmount) > 0.01;

                  if (hasMismatch) {
                    const showAmountBreakdown =
                      preview.performancePool.totalToDistribute !== undefined &&
                      preview.performancePool.totalToDistribute !==
                        preview.performancePool.totalAmount;

                    return (
                      <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          ⚠️ <strong>Data Mismatch Detected:</strong> The
                          breakdown table shows {displayedQualifiers} qualifiers
                          and {formatCurrency(displayedAmount)}, but totals
                          indicate {preview.performancePool.totalQualifiers}{' '}
                          qualifiers and {formatCurrency(expectedAmount)}
                          {showAmountBreakdown && (
                            <>
                              {' '}
                              (Input:{' '}
                              {formatCurrency(
                                preview.performancePool.totalAmount
                              )}
                              , Distributed:{' '}
                              {formatCurrency(
                                preview.performancePool.totalToDistribute
                              )}
                              )
                            </>
                          )}
                          . Some ranks may be missing from the breakdown.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : (
              <div className="border-t pt-4">
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No rank breakdown available. All qualifiers may be unranked or
                  data is incomplete.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Premium Pool Details */}
      {preview.premiumPool.totalAmount > 0 && (
        <>
          {/* Warning if amount > 0 but no qualifiers */}
          {preview.premiumPool.totalQualifiers === 0 && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ <strong>Backend Data Error:</strong> Premium Pool has $
                {formatCurrency(preview.premiumPool.totalAmount)}
                allocated but 0 qualifiers. This is a backend data
                inconsistency.
              </p>
            </div>
          )}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle>
                    Premium Pool Distribution (
                    {formatCurrency(preview.premiumPool.totalAmount)})
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-sm">Total Amount</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(preview.premiumPool.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Qualifiers</p>
                  <p className="text-xl font-bold">
                    {preview.premiumPool.totalQualifiers}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Average per Qualifier
                  </p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(preview.premiumPool.perQualifierAmount)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    * Varies by rank (see table below)
                  </p>
                </div>
              </div>

              {preview.premiumPool.byRank &&
              preview.premiumPool.byRank.length > 0 ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm font-medium">
                      Breakdown by Rank:
                    </p>
                    <p className="text-muted-foreground text-xs italic">
                      Each rank gets a percentage of the total pool, then
                      divided equally among users in that rank
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead className="text-right">
                            Qualifiers
                          </TableHead>
                          <TableHead className="text-right">
                            Rank&apos;s Share
                          </TableHead>
                          <TableHead className="text-right">Per User</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.premiumPool.byRank.map((rankDist, index) => {
                          const percentage = calculatePercentage(
                            rankDist.totalAmount,
                            preview.premiumPool.totalAmount
                          );
                          return (
                            <TableRow key={`${rankDist.rank}-${index}`}>
                              <TableCell className="font-medium">
                                {rankDist.rank}
                              </TableCell>
                              <TableCell className="text-right">
                                {rankDist.eligibleUsers}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-semibold">
                                    {formatCurrency(rankDist.totalAmount)}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {percentage.toFixed(1)}%
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(rankDist.perUserAmount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-muted font-bold">
                          <TableCell>TOTAL</TableCell>
                          <TableCell className="text-right">
                            {preview.premiumPool.totalQualifiers}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(preview.premiumPool.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  {/* Debug: Show if there's a mismatch */}
                  {(() => {
                    const displayedQualifiers =
                      preview.premiumPool.byRank.reduce(
                        (sum, rank) => sum + rank.eligibleUsers,
                        0
                      );
                    const displayedAmount = preview.premiumPool.byRank.reduce(
                      (sum, rank) => sum + rank.totalAmount,
                      0
                    );
                    // Use totalToDistribute if available (actual amount to distribute)
                    const expectedAmount =
                      preview.premiumPool.totalToDistribute ??
                      preview.premiumPool.totalAmount;
                    const hasMismatch =
                      displayedQualifiers !==
                        preview.premiumPool.totalQualifiers ||
                      Math.abs(displayedAmount - expectedAmount) > 0.01;

                    if (hasMismatch) {
                      const showAmountBreakdown =
                        preview.premiumPool.totalToDistribute !== undefined &&
                        preview.premiumPool.totalToDistribute !==
                          preview.premiumPool.totalAmount;

                      return (
                        <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            ⚠️ <strong>Data Mismatch Detected:</strong> The
                            breakdown table shows {displayedQualifiers}{' '}
                            qualifiers and {formatCurrency(displayedAmount)},
                            but totals indicate{' '}
                            {preview.premiumPool.totalQualifiers} qualifiers and{' '}
                            {formatCurrency(expectedAmount)}
                            {showAmountBreakdown && (
                              <>
                                {' '}
                                (Input:{' '}
                                {formatCurrency(
                                  preview.premiumPool.totalAmount
                                )}
                                , Distributed:{' '}
                                {formatCurrency(
                                  preview.premiumPool.totalToDistribute
                                )}
                                )
                              </>
                            )}
                            . Some ranks may be missing from the breakdown.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : preview.premiumPool.totalQualifiers > 0 ? (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No rank breakdown available despite{' '}
                    {preview.premiumPool.totalQualifiers} qualifiers. Backend
                    may not be returning rank data.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
