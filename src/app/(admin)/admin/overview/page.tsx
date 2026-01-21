'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminRecentActivity from '@/components/admin/AdminRecentActivity';
import AdminChartSection from '@/components/admin/AdminChartSection';
import { AdminDashboardTimeframe } from '@/types/admin';
import { useAdminDashboard } from '@/lib/queries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DEFAULT_TIMEFRAME: AdminDashboardTimeframe = '30d';

const getTrend = (value?: number): 'up' | 'down' | 'neutral' => {
  if (value === undefined || Number.isNaN(value)) return 'neutral';
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
};

const formatUSDT = (value: number) => {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);
  return `${formatted} USDT`;
};

const takeLast = (values: number[] = [], count = 12) => {
  if (!values.length) return [];
  const start = Math.max(values.length - count, 0);
  return values.slice(start);
};

const calculateChange = (series: number[]) => {
  if (!series || series.length < 2) return undefined;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) {
    if (last === 0) return 0;
    return last > 0 ? 100 : -100;
  }
  return Number((((last - first) / Math.abs(first)) * 100).toFixed(1));
};

function TitleWithTooltip({
  title,
  tooltip,
}: {
  title: string;
  tooltip: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{title}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`About ${title}`}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [timeframe, setTimeframe] =
    useState<AdminDashboardTimeframe>(DEFAULT_TIMEFRAME);
  const { data, isLoading, isFetching, error } = useAdminDashboard(timeframe);

  const metrics = data?.metrics;
  const charts = data?.charts;
  const recentActivity = data?.recentActivity;

  // These panels are "today/current" and should not disappear when switching timeframe.
  // If backend omits them for a given timeframe (e.g. 24h), keep the last known values.
  const [stickyExtras, setStickyExtras] = useState<{
    todayProfit: any | null;
    poolQualifiers: any | null;
  }>({ todayProfit: null, poolQualifiers: null });

  const todayProfit = data?.dailyProfit?.today ?? stickyExtras.todayProfit;
  const poolQualifiers = data?.pools?.qualifiers ?? stickyExtras.poolQualifiers;

  useEffect(() => {
    if (data?.dailyProfit?.today || data?.pools?.qualifiers) {
      setStickyExtras((prev) => ({
        todayProfit: data?.dailyProfit?.today ?? prev.todayProfit,
        poolQualifiers: data?.pools?.qualifiers ?? prev.poolQualifiers,
      }));
    }
  }, [data?.dailyProfit?.today, data?.pools?.qualifiers]);

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case '24h':
        return '24H';
      case '7d':
        return '7D';
      case '30d':
        return '30D';
      case '90d':
        return '90D';
      default:
        return String(timeframe).toUpperCase();
    }
  }, [timeframe]);

  const chartIsLoading = useMemo(() => {
    const hasChartData = charts
      ? Boolean(
          charts.revenue.length ||
            charts.userGrowth.length ||
            charts.stakes.length
        )
      : false;
    return !hasChartData && (isLoading || isFetching);
  }, [charts, isFetching, isLoading]);

  const metricCards = useMemo(() => {
    if (!metrics) return [] as Array<{ id: string; content: ReactNode }>;

    const userSparkline = takeLast(
      charts?.userGrowth.map((point) => Math.max(point.value, 0)) ?? []
    );
    // Backend chart key is `revenue` but it represents deposits trend now.
    const depositsSparkline = takeLast(
      charts?.revenue.map((point) => Math.max(point.value, 0)) ?? []
    );
    const stakeSparkline = takeLast(
      charts?.stakes.map((point) => Math.max(point.value, 0)) ?? []
    );

    const userChange = calculateChange(userSparkline);
    const stakeChange = calculateChange(stakeSparkline);
    const depositsChange = calculateChange(depositsSparkline);

    const tvl = metrics.stakes.tvl ?? metrics.stakes.totalValue;
    const pendingAmount =
      metrics.withdrawals.pendingAmount ?? metrics.withdrawals.totalPending;
    const netFlow24h = metrics.platform.netFlow24h ?? 0;
    const netFlowPeriod = metrics.platform.netFlowPeriod ?? 0;

    return [
      {
        id: 'total-users',
        content: (
          <AdminMetricCard
            title="Total Users"
            value={metrics.users.total.toLocaleString()}
            tooltip="Total number of registered user accounts on Novunt."
            change={userChange ?? metrics.users.growthPercentage}
            icon="users"
            trend={getTrend(userChange ?? metrics.users.growthPercentage)}
            showChart={userSparkline.length > 0}
            sparklineData={userSparkline}
          />
        ),
      },
      {
        id: 'new-users-24h',
        content: (
          <AdminMetricCard
            title="New Users (24h)"
            value={(metrics.users.new24h ?? 0).toLocaleString()}
            tooltip="Number of new user registrations created in the last 24 hours."
            icon="users"
            trend="neutral"
          />
        ),
      },
      {
        id: 'active-stakes',
        content: (
          <AdminMetricCard
            title="Active Stakes"
            value={metrics.stakes.active.toLocaleString()}
            secondaryValue={`TVL: ${formatUSDT(tvl)}`}
            tooltip="Count of currently active staking positions (not completed)."
            change={stakeChange}
            icon="chart"
            trend={getTrend(stakeChange)}
            showChart={stakeSparkline.length > 0}
            sparklineData={stakeSparkline}
            sparklineColor="bg-purple-500"
          />
        ),
      },
      {
        id: 'tvl',
        content: (
          <AdminMetricCard
            title="TVL (Total Staked)"
            value={formatUSDT(tvl)}
            tooltip="TVL (Total Value Locked) = sum of all active stake amounts."
            icon="wallet"
            trend="neutral"
          />
        ),
      },
      {
        id: 'volume-24h',
        content: (
          <AdminMetricCard
            title="24h External Volume"
            value={formatUSDT(metrics.transactions.volume24h)}
            secondaryValue="Deposits + Withdrawals (24h)"
            tooltip="External volume only: successful deposits + successful withdrawals in the last 24h. Excludes internal payouts/bonuses/pool distributions."
            change={depositsChange}
            icon="money"
            trend={getTrend(depositsChange)}
            showChart={depositsSparkline.length > 0}
            sparklineData={depositsSparkline}
          />
        ),
      },
      {
        id: 'pending-withdrawals',
        content: (
          <AdminMetricCard
            title="Pending Withdrawals"
            value={metrics.withdrawals.pending.toLocaleString()}
            secondaryValue={formatUSDT(pendingAmount)}
            tooltip="Withdrawals currently pending (count + total amount). These are awaiting processing/approval."
            icon="wallet"
            trend="neutral"
            alert={(metrics.withdrawals.pending ?? 0) > 20}
          />
        ),
      },
      {
        id: 'net-flow-24h',
        content: (
          <AdminMetricCard
            title="Net Flow (Last 24h)"
            value={formatUSDT(netFlow24h)}
            secondaryValue="Deposits − Withdrawals (rolling 24h)"
            tooltip="Net external flow over the last 24 hours (rolling window): successful deposits minus successful withdrawals. This does not change with the selected timeframe."
            icon="dollar"
            trend={getTrend(netFlow24h)}
          />
        ),
      },
      {
        id: 'net-flow-period',
        content: (
          <AdminMetricCard
            title={`Net Flow (${timeframeLabel})`}
            value={formatUSDT(netFlowPeriod)}
            secondaryValue={`Deposits − Withdrawals (selected: ${timeframeLabel})`}
            tooltip="Net external flow for the selected timeframe (top-right switcher): successful deposits minus successful withdrawals across the whole selected range."
            icon="dollar"
            trend={getTrend(netFlowPeriod)}
          />
        ),
      },
    ];
  }, [charts, metrics, timeframeLabel]);

  const lastUpdatedLabel = useMemo(() => {
    if (!data?.lastUpdated) return undefined;
    const parsed = parseISO(data.lastUpdated);
    if (!isValid(parsed)) return undefined;
    return formatDistanceToNow(parsed, { addSuffix: true });
  }, [data?.lastUpdated]);

  const exportReport = () => {
    if (!data) return;

    const payload = {
      exportedAt: new Date().toISOString(),
      timeframe,
      lastUpdated: data.lastUpdated ?? null,
      data,
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novunt-admin-overview-report-${timeframe}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h2>
          {lastUpdatedLabel && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Updated {lastUpdatedLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400">
              Failed to load insights. Please retry.
            </span>
          )}
          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            type="button"
            onClick={exportReport}
            disabled={!data}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading && metricCards.length === 0 ? (
          // Skeleton loaders
          Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))
        ) : metrics ? (
          metricCards.map((card) => <div key={card.id}>{card.content}</div>)
        ) : (
          <div className="col-span-3 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Error loading metrics. Please try again.
            </p>
          </div>
        )}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminChartSection
            charts={charts}
            timeframe={timeframe}
            onTimeframeChange={(value) => setTimeframe(value)}
            isLoading={chartIsLoading}
          />

          {/* Daily Profit + Pools (from dashboard endpoint) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <TitleWithTooltip
                    title="Today’s Profit Declaration"
                    tooltip="Shows today’s ROS % and pool amounts (premium/performance), plus whether distribution has been completed."
                  />
                </CardTitle>
                <CardDescription>
                  Premium / Performance pools and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {todayProfit ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ROS %</span>
                      <span className="font-medium">
                        {todayProfit.rosPercentage ?? 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Premium pool
                      </span>
                      <span className="font-medium">
                        {formatUSDT(todayProfit.premiumPoolAmount ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Performance pool
                      </span>
                      <span className="font-medium">
                        {formatUSDT(todayProfit.performancePoolAmount ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total pool</span>
                      <span className="font-medium">
                        {formatUSDT(todayProfit.totalPoolAmount ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Distributed</span>
                      <span className="font-medium">
                        {todayProfit.isDistributed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    Not available for the selected timeframe.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <TitleWithTooltip
                    title="Pool Qualification"
                    tooltip="Counts of users qualified for each pool category based on the current qualification rules."
                  />
                </CardTitle>
                <CardDescription>Qualified counts by pool</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {poolQualifiers ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Performance qualified
                      </span>
                      <span className="font-medium">
                        {(
                          poolQualifiers.performancePoolQualified ?? 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Premium qualified
                      </span>
                      <span className="font-medium">
                        {(
                          poolQualifiers.premiumPoolQualified ?? 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Rank qualified
                      </span>
                      <span className="font-medium">
                        {(
                          poolQualifiers.rankPoolQualified ?? 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Redistribution qualified
                      </span>
                      <span className="font-medium">
                        {(
                          poolQualifiers.redistributionPoolQualified ?? 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    Not available for the selected timeframe.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-1">
          <AdminRecentActivity
            activities={recentActivity}
            isLoading={isFetching && !recentActivity?.length}
          />
        </div>
      </div>
    </div>
  );
}
