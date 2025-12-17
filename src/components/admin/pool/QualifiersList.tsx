'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';
import {
  TrendingUp,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { poolService } from '@/services/poolService';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import type { AdminUser } from '@/types/admin';

interface QualifiersListProps {
  poolType: 'performance' | 'premium';
}

interface QualifierUser extends AdminUser {
  rank: string;
}

export function QualifiersList({ poolType }: QualifiersListProps) {
  const [qualifiers, setQualifiers] = useState<QualifierUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poolName =
    poolType === 'performance' ? 'Performance Pool' : 'Premium Pool';
  const poolIcon = poolType === 'performance' ? TrendingUp : Award;
  const poolColor =
    poolType === 'performance'
      ? 'border-blue-200 dark:border-blue-800'
      : 'border-emerald-200 dark:border-emerald-800';
  const poolIconColor =
    poolType === 'performance'
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-emerald-600 dark:text-emerald-400';

  const Icon = poolIcon;

  const fetchQualifiers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get qualifier counts to know how many we're looking for
      const qualifiersResponse = await poolService.getQualifiers();
      const qualifierData =
        poolType === 'performance'
          ? qualifiersResponse.data.performancePool
          : qualifiersResponse.data.premiumPool;

      if (qualifierData.totalQualifiers === 0) {
        setQualifiers([]);
        return;
      }

      // Fetch users with pagination to get all qualifiers
      // Note: Ideally backend should provide a dedicated endpoint for pool qualifiers list
      let allUsers: AdminUser[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      // Fetch all pages until we have enough users or no more pages
      while (hasMore && allUsers.length < qualifierData.totalQualifiers * 2) {
        const usersResponse = await adminService.getUsers({ page, limit });
        const users = usersResponse.data?.users || usersResponse.users || [];

        if (users.length === 0) {
          hasMore = false;
        } else {
          allUsers = [...allUsers, ...users];
          // If we got less than limit, we've reached the end
          if (users.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // Filter users based on pool qualification
      const qualifiedUsers: QualifierUser[] = allUsers
        .filter((user: AdminUser) => {
          if (poolType === 'performance') {
            // Performance Pool: All ranks except Stakeholder
            const rank =
              user.rank || user.rankInfo?.currentRank || 'Stakeholder';
            return rank !== 'Stakeholder';
          } else {
            // Premium Pool: Users with leadership qualification (at least one downline of their rank)
            return user.rankInfo?.premiumPoolQualified === true;
          }
        })
        .map((user: AdminUser) => ({
          ...user,
          rank: user.rank || user.rankInfo?.currentRank || 'Stakeholder',
        }))
        .slice(0, qualifierData.totalQualifiers); // Limit to expected count

      setQualifiers(qualifiedUsers);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to load qualifiers';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchQualifiers();
    }
  }, [isExpanded, poolType]);

  return (
    <Card className={poolColor}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${poolIconColor}`} />
            <CardTitle className="text-base">{poolName}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isLoading}
            className="h-7 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <ShimmerCard className="h-16" />
              <ShimmerCard className="h-16" />
              <ShimmerCard className="h-16" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchQualifiers}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : qualifiers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                No qualifiers found
              </p>
            </div>
          ) : (
            <>
              <div className="mb-2">
                <p className="text-muted-foreground text-xs">
                  {qualifiers.length} qualifier
                  {qualifiers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {qualifiers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-card hover:bg-muted/50 rounded-lg border p-2 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                            <User className="text-muted-foreground h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {user.fullName}
                        </p>
                        <p className="text-muted-foreground mb-1 truncate text-xs">
                          {user.email}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-xs"
                          >
                            {user.rank}
                          </Badge>
                          {user.rankInfo?.nxp && (
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 text-xs"
                            >
                              {user.rankInfo.nxp.totalNXP.toLocaleString()} NXP
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
