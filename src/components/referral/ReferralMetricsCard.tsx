/**
 * Referral Metrics Card Component
 * Displays referral and team metrics with total and active counts
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Share, TrendingUp } from 'lucide-react';
import { useReferralMetrics } from '@/lib/queries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  total: number;
  active: number;
  activePercent: number;
  colorTheme: 'purple' | 'blue';
}

/**
 * Individual metric card for displaying referral or team stats
 */
function MetricCard({
  title,
  description,
  icon: Icon,
  total,
  active,
  activePercent,
  colorTheme,
}: MetricCardProps) {
  const inactive = total - active;

  const colorStyles = {
    purple: {
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      progressBg: 'bg-purple-500/20',
      progressFill: 'bg-purple-500',
      activeBadge: 'bg-purple-500/20 text-purple-300',
      border: 'border-purple-500/20',
    },
    blue: {
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      progressBg: 'bg-blue-500/20',
      progressFill: 'bg-blue-500',
      activeBadge: 'bg-blue-500/20 text-blue-300',
      border: 'border-blue-500/20',
    },
  };

  const styles = colorStyles[colorTheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={cn(
          'bg-card/70 h-full border-0 shadow-md backdrop-blur-sm transition-all hover:shadow-lg',
          styles.border
        )}
      >
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  styles.iconBg
                )}
              >
                <Icon className={cn('h-5 w-5', styles.iconColor)} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold sm:text-lg">
                  {title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {description}
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Total Count */}
          <div className="pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold sm:text-4xl">{total}</span>
              <span className="text-muted-foreground text-sm">
                {total === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          {/* Active/Inactive Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground text-sm">Active:</span>
                <span className="font-semibold">{active}</span>
              </div>
              <Badge className={cn('text-xs', styles.activeBadge)}>
                {activePercent}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-muted h-2 w-2 rounded-full" />
                <span className="text-muted-foreground text-sm">Inactive:</span>
                <span className="font-semibold">{inactive}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={activePercent}
              className={cn('h-2', styles.progressBg)}
            />
            <p className="text-muted-foreground text-xs">
              {active > 0
                ? `${active} active ${active === 1 ? 'member' : 'members'} with stakes`
                : 'No active members yet'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Empty state when user has no referrals
 */
function EmptyMetricsState() {
  return (
    <Card className="bg-card/70 border-0 shadow-md">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Users className="text-primary h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          Start Building Your Network
        </h3>
        <p className="text-muted-foreground mb-4 max-w-sm text-sm">
          Share your referral link with others to start earning rewards and
          building your team.
        </p>
        <Badge variant="outline" className="text-xs">
          Earn up to 5% from direct referrals
        </Badge>
      </CardContent>
    </Card>
  );
}

/**
 * Main component that fetches and displays referral metrics
 */
export function ReferralMetricsCard() {
  const { data: metrics, isLoading, error, refetch } = useReferralMetrics();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Network Performance
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your referral network metrics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LoadingStates.Card height="h-64" />
          <LoadingStates.Card height="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-card/70 border-0 shadow-md">
        <CardContent className="py-8">
          <UserFriendlyError error={error as Error} onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  // Empty state (no referrals at all)
  if (
    !metrics ||
    (metrics.referrals.total_direct === 0 && metrics.team.total_members === 0)
  ) {
    return <EmptyMetricsState />;
  }

  // Calculate percentages
  const directActivePercent =
    metrics.referrals.total_direct > 0
      ? Math.round(
          (metrics.referrals.active_direct / metrics.referrals.total_direct) *
            100
        )
      : 0;

  const teamActivePercent =
    metrics.team.total_members > 0
      ? Math.round(
          (metrics.team.active_members / metrics.team.total_members) * 100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Network Performance
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Track your referrals and team growth
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Direct Referrals Card */}
        <MetricCard
          title="Direct Referrals"
          description="People you directly invited"
          icon={Users}
          total={metrics.referrals.total_direct}
          active={metrics.referrals.active_direct}
          activePercent={directActivePercent}
          colorTheme="purple"
        />

        {/* Team Members Card */}
        <MetricCard
          title="Team Members"
          description="All members in your network"
          icon={Share}
          total={metrics.team.total_members}
          active={metrics.team.active_members}
          activePercent={teamActivePercent}
          colorTheme="blue"
        />
      </div>
    </div>
  );
}
