"use client";

import { ReactNode, useMemo, useState } from 'react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminRecentActivity from '@/components/admin/AdminRecentActivity';
import AdminChartSection from '@/components/admin/AdminChartSection';
import { AdminDashboardTimeframe } from '@/types/admin';
import { useAdminDashboard } from '@/lib/queries';

const DEFAULT_TIMEFRAME: AdminDashboardTimeframe = '30d';

const getTrend = (value?: number): 'up' | 'down' | 'neutral' => {
  if (value === undefined || Number.isNaN(value)) return 'neutral';
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);

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

export default function AdminOverviewPage() {
  const [timeframe, setTimeframe] = useState<AdminDashboardTimeframe>(DEFAULT_TIMEFRAME);
  const { data, isLoading, isFetching, error } = useAdminDashboard(timeframe);

  const metrics = data?.metrics;
  const charts = data?.charts;
  const recentActivity = data?.recentActivity;

  const chartIsLoading = useMemo(() => {
    const hasChartData = charts
      ? Boolean(charts.revenue.length || charts.userGrowth.length || charts.stakes.length)
      : false;
    return !hasChartData && (isLoading || isFetching);
  }, [charts, isFetching, isLoading]);

  const metricCards = useMemo(() => {
  if (!metrics) return [] as Array<{ id: string; content: ReactNode }>;

    const userSparkline = takeLast(charts?.userGrowth.map((point) => Math.max(point.value, 0)) ?? []);
    const revenueSparkline = takeLast(charts?.revenue.map((point) => Math.max(point.value, 0)) ?? []);
    const stakeSparkline = takeLast(charts?.stakes.map((point) => Math.max(point.value, 0)) ?? []);

    const userChange = calculateChange(userSparkline);
    const stakeChange = calculateChange(stakeSparkline);
    const revenueChange = calculateChange(revenueSparkline);

    return [
      {
        id: 'total-users',
        content: (
          <AdminMetricCard
            title="Total Users"
            value={metrics.users.total.toLocaleString()}
            change={userChange ?? metrics.users.growthPercentage}
            icon="users"
            trend={getTrend(userChange ?? metrics.users.growthPercentage)}
            showChart={userSparkline.length > 0}
            sparklineData={userSparkline}
          />
        ),
      },
      {
        id: 'active-stakes',
        content: (
          <AdminMetricCard
            title="Active Stakes"
            value={metrics.stakes.active.toLocaleString()}
            secondaryValue={`$${metrics.stakes.totalValue.toLocaleString()}`}
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
        id: 'volume-24h',
        content: (
          <AdminMetricCard
            title="24h Volume"
            value={formatCurrency(metrics.transactions.volume24h)}
            secondaryValue={`${metrics.transactions.total.toLocaleString()} txns`}
            change={revenueChange}
            icon="money"
            trend={getTrend(revenueChange)}
            showChart={revenueSparkline.length > 0}
            sparklineData={revenueSparkline}
          />
        ),
      },
      {
        id: 'pending-withdrawals',
        content: (
          <AdminMetricCard
            title="Pending Withdrawals"
            value={metrics.withdrawals.pending.toLocaleString()}
            secondaryValue={formatCurrency(metrics.withdrawals.totalPending)}
            icon="wallet"
            trend="neutral"
            alert={(metrics.withdrawals.pending ?? 0) > 20}
          />
        ),
      },
      {
        id: 'monthly-revenue',
        content: (
          <AdminMetricCard
            title="Monthly Revenue"
            value={formatCurrency(metrics.platform.profit ?? revenueSparkline[revenueSparkline.length - 1] ?? 0)}
            change={revenueChange}
            icon="dollar"
            trend={getTrend(revenueChange)}
            showChart={revenueSparkline.length > 0}
            sparklineData={revenueSparkline}
          />
        ),
      },
      {
        id: 'kyc-pending',
        content: (
          <AdminMetricCard
            title="KYC Pending"
            value={(metrics.kyc?.pending ?? 0).toLocaleString()}
            secondaryValue={metrics.kyc?.highPriority ? `${metrics.kyc.highPriority} high priority` : undefined}
            icon="shield"
            trend="neutral"
            alert={(metrics.kyc?.highPriority ?? 0) > 0}
          />
        ),
      },
    ];
  }, [charts, metrics]);

  const lastUpdatedLabel = useMemo(() => {
    if (!data?.lastUpdated) return undefined;
    const parsed = parseISO(data.lastUpdated);
    if (!isValid(parsed)) return undefined;
    return formatDistanceToNow(parsed, { addSuffix: true });
  }, [data?.lastUpdated]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Admin Dashboard</h2>
          {lastUpdatedLabel && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Updated {lastUpdatedLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400">Failed to load insights. Please retry.</span>
          )}
          <button
            className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-300 dark:border-gray-600"
            type="button"
            onClick={() => setTimeframe((prev) => prev)}
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
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && metricCards.length === 0 ? (
          // Skeleton loaders
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))
        ) : metrics ? (
          metricCards.map((card) => (
            <div key={card.id}>{card.content}</div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Error loading metrics. Please try again.</p>
          </div>
        )}
      </div>
      
      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminChartSection
            charts={charts}
            timeframe={timeframe}
            onTimeframeChange={(value) => setTimeframe(value)}
            isLoading={chartIsLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <AdminRecentActivity activities={recentActivity} isLoading={isFetching && !recentActivity?.length} />
        </div>
      </div>
    </div>
  );
}