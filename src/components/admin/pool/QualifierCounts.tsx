'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Users } from 'lucide-react';
import type { PoolQualifiersResponse } from '@/types/pool';

interface QualifierCountsProps {
  qualifiers: PoolQualifiersResponse['data'];
}

export function QualifierCounts({ qualifiers }: QualifierCountsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Performance Pool */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Performance Pool</h3>
              <p className="text-muted-foreground text-sm">
                {qualifiers.performancePool.description}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {qualifiers.performancePool.totalQualifiers}
              </span>
              <Badge
                variant="outline"
                className="text-blue-600 dark:text-blue-400"
              >
                Total Qualifiers
              </Badge>
            </div>
            <div className="space-y-2 border-t pt-2">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Breakdown by Rank:
              </p>
              {Object.entries(qualifiers.performancePool.byRank).map(
                ([rank, count]) => (
                  <div
                    key={rank}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{rank}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Pool */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Premium Pool</h3>
              <p className="text-muted-foreground text-sm">
                {qualifiers.premiumPool.description}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {qualifiers.premiumPool.totalQualifiers}
              </span>
              <Badge
                variant="outline"
                className="text-emerald-600 dark:text-emerald-400"
              >
                Total Qualifiers
              </Badge>
            </div>
            <div className="space-y-2 border-t pt-2">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Breakdown by Rank:
              </p>
              {Object.keys(qualifiers.premiumPool.byRank).length > 0 ? (
                Object.entries(qualifiers.premiumPool.byRank).map(
                  ([rank, count]) => (
                    <div
                      key={rank}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{rank}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                )
              ) : (
                <p className="text-muted-foreground text-xs italic">
                  No qualifiers yet
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      {qualifiers.note && (
        <div className="col-span-full">
          <div className="bg-muted rounded-lg border border-amber-200 p-4 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-muted-foreground text-sm">{qualifiers.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
