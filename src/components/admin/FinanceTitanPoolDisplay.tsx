'use client';

import React from 'react';
import { Award, Users, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRankAnalytics } from '@/lib/queries';
import { LoadingStates } from '@/components/ui/loading-states';
import type { RankInfo } from '@/types/rankAnalytics';

/**
 * Finance Titan Pool Display Component
 * Displays pool allocation information for Finance Titan rank
 */
export function FinanceTitanPoolDisplay() {
  const { data, isLoading, error } = useRankAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Finance Titan Pool Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingStates.Card height="h-40" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Finance Titan Pool Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center text-sm">
            Failed to load Finance Titan pool information
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find Finance Titan rank (highest rank)
  const financeTitan = data?.ranks?.find(
    (rank: RankInfo) => rank.isHighestRank
  );

  if (!financeTitan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Finance Titan Pool Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center text-sm">
            No Finance Titan users found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Finance Titan - Pool Allocations
          <Badge variant="outline" className="ml-auto">
            Level {financeTitan.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pool Allocations */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Performance Pool */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">Performance Pool</h3>
              <Badge className="bg-blue-500/20 text-blue-400">Blue Tick</Badge>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-blue-400">
                {financeTitan.poolAllocations.performancePool.allocationPercent}
                %
              </div>
              <p className="text-muted-foreground text-xs">
                {financeTitan.poolAllocations.performancePool.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>
                Qualified:{' '}
                <strong>
                  {financeTitan.currentStats.performancePoolQualified}
                </strong>
              </span>
            </div>
          </div>

          {/* Premium Pool */}
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold">Premium Pool</h3>
              <Badge className="bg-green-500/20 text-green-400">
                Green Tick
              </Badge>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-green-400">
                {financeTitan.poolAllocations.premiumPool.allocationPercent}%
              </div>
              <p className="text-muted-foreground text-xs">
                {financeTitan.poolAllocations.premiumPool.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>
                Qualified:{' '}
                <strong>
                  {financeTitan.currentStats.premiumPoolQualified}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="bg-muted/50 rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            <h3 className="font-semibold">Current Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Users</div>
              <div className="text-lg font-semibold">
                {financeTitan.currentStats.totalUsers}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Personal Stake</div>
              <div className="text-lg font-semibold">
                {financeTitan.currentStats.totalPersonalStake.toLocaleString()}{' '}
                USDT
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Team Stake</div>
              <div className="text-lg font-semibold">
                {financeTitan.currentStats.totalTeamStake.toLocaleString()} USDT
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
