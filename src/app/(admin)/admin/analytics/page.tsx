'use client';

import { useMemo, useState } from 'react';
import type {
  AdminAnalyticsBreakdownRow,
  AdminAnalyticsCardValue,
  AdminAnalyticsSeriesPoint,
  AdminAnalyticsTimeframe,
} from '@/types/adminAnalytics';
import { useAdminAnalyticsDashboard } from '@/lib/queries';
import { PermissionGuard } from '@/components/admin/PermissionGuard';
import { FinanceTitanPoolDisplay } from '@/components/admin/FinanceTitanPoolDisplay';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Disable static generation
export const dynamic = 'force-dynamic';

function formatNumber(num: number) {
  return num.toLocaleString();
}

function formatPercentage(num: number) {
  return `${num.toFixed(1)}%`;
}

function formatUSDT(num: number) {
  const safe = Number.isFinite(num) ? num : 0;
  return `${safe.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT`;
}

function toIsoStartOfDayUTC(dateInput: string) {
  const [y, m, d] = dateInput.split('-').map((v) => Number(v));
  const ms = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return new Date(ms).toISOString();
}

function toIsoEndOfDayUTC(dateInput: string) {
  const [y, m, d] = dateInput.split('-').map((v) => Number(v));
  const ms = Date.UTC(y, m - 1, d, 23, 59, 59, 999);
  return new Date(ms).toISOString();
}

function formatSeriesLabel(date: string) {
  // date is "YYYY-MM-DD"
  const dt = new Date(`${date}T00:00:00.000Z`);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getChangeMeta(card?: AdminAnalyticsCardValue) {
  const delta = card?.delta;
  const deltaPct = card?.deltaPct;
  const basis =
    typeof deltaPct === 'number'
      ? deltaPct
      : typeof delta === 'number'
        ? delta
        : 0;
  return {
    delta,
    deltaPct,
    isPositive: basis >= 0,
  };
}

function AnalyticsPageInner() {
  const [activeTab, setActiveTab] = useState<
    'users' | 'financial' | 'staking' | 'referral' | 'ranks'
  >('users');
  const [timeframe, setTimeframe] = useState<AdminAnalyticsTimeframe>('30d');

  const now = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => now.toISOString().slice(0, 10), [now]);
  const defaultFrom = useMemo(() => {
    const d = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [now]);

  const [customFrom, setCustomFrom] = useState<string>(defaultFrom);
  const [customTo, setCustomTo] = useState<string>(defaultTo);

  const queryParams = useMemo(() => {
    if (timeframe === 'custom') {
      return {
        timeframe,
        from: toIsoStartOfDayUTC(customFrom),
        to: toIsoEndOfDayUTC(customTo),
      };
    }
    return { timeframe };
  }, [customFrom, customTo, timeframe]);

  const { data, isLoading, error, refetch, isFetching } =
    useAdminAnalyticsDashboard(queryParams);

  // Simplified chart component
  const SimpleChart = ({
    data,
    height = 80,
    stroke = '#6366f1',
  }: {
    data: AdminAnalyticsSeriesPoint[];
    height?: number;
    stroke?: string;
  }) => {
    if (!data || data.length === 0)
      return (
        <div className="flex h-20 items-center justify-center text-gray-400">
          No data available
        </div>
      );

    const maxValue = Math.max(...data.map((p) => p.value), 0);
    const safeMax = maxValue > 0 ? maxValue : 1;

    const points = data
      .map((point, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = ((safeMax - point.value) / safeMax) * height;
        return `${x},${y}`;
      })
      .join(' ');

    const areaPoints = `0,${height} ${points} ${100},${height}`;

    const areaFill = stroke;

    return (
      <div style={{ height: `${height}px` }} className="relative w-full">
        <svg
          className="h-full w-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={areaPoints}
            fill={areaFill}
            fillOpacity={0.12}
            stroke="none"
          />
          <polyline
            points={points}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
          {data.map((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = ((safeMax - point.value) / safeMax) * height;
            return (
              <circle
                key={`${point.date}-${index}`}
                cx={x}
                cy={y}
                r="1.5"
                fill={stroke}
              />
            );
          })}
        </svg>

        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {data.length > 10 ? (
            <>
              <div>{formatSeriesLabel(data[0].date)}</div>
              <div>
                {formatSeriesLabel(data[Math.floor(data.length / 2)].date)}
              </div>
              <div>{formatSeriesLabel(data[data.length - 1].date)}</div>
            </>
          ) : (
            data.map((point, index) => (
              <div key={`${point.date}-${index}`}>
                {formatSeriesLabel(point.date)}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Title with tooltip helper component
  const TitleWithTooltip = ({
    title,
    tooltip,
  }: {
    title: string;
    tooltip?: string;
  }) => {
    if (!tooltip) {
      return <span>{title}</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <span>{title}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`About ${title}`}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
  };

  // Analytics card component
  const AnalyticsCard = ({
    title,
    value,
    change,
    chartData,
    stroke = '#6366f1',
    format = 'number',
    subtitle,
    tooltip,
  }: {
    title: string;
    value: number | string;
    change?: { delta?: number; deltaPct?: number; isPositive: boolean };
    chartData?: AdminAnalyticsSeriesPoint[];
    stroke?: string;
    format?: 'number' | 'percentage' | 'currency';
    subtitle?: string;
    tooltip?: string;
  }) => {
    let formattedValue = value;
    if (typeof value === 'number') {
      if (format === 'percentage') {
        formattedValue = formatPercentage(value);
      } else if (format === 'currency') {
        formattedValue = formatUSDT(value);
      } else {
        formattedValue = formatNumber(value);
      }
    }

    const deltaLabel =
      typeof change?.deltaPct === 'number'
        ? `${change.deltaPct >= 0 ? '+' : ''}${formatPercentage(change.deltaPct)}`
        : typeof change?.delta === 'number'
          ? `${change.delta >= 0 ? '+' : ''}${
              format === 'currency'
                ? formatUSDT(change.delta)
                : format === 'percentage'
                  ? formatPercentage(change.delta)
                  : formatNumber(change.delta)
            }`
          : null;

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <TitleWithTooltip title={title} tooltip={tooltip} />
        </h3>
        {subtitle ? (
          <div className="-mt-1 mb-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        ) : null}
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {formattedValue}
          </p>
          {deltaLabel ? (
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                change?.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
              title="Change vs previous period"
            >
              <span>
                {change?.isPositive ? (
                  <svg
                    className="h-4 w-4 flex-shrink-0 self-center"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 flex-shrink-0 self-center"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span className="ml-1">{deltaLabel}</span>
            </p>
          ) : null}
        </div>

        {chartData && (
          <div className="mt-4">
            <SimpleChart data={chartData} stroke={stroke} />
          </div>
        )}
      </div>
    );
  };

  const BreakdownList = ({
    title,
    rows,
  }: {
    title: string;
    rows?: AdminAnalyticsBreakdownRow[];
  }) => {
    if (!rows || rows.length === 0) return null;
    const max = Math.max(...rows.map((r) => r.count), 1);
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="relative">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {row._id}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatNumber(row.count)}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 bg-indigo-500"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Analytics Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <select
            className="block rounded-md border-gray-300 bg-white py-2 pr-10 pl-3 text-base text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            value={timeframe}
            onChange={(e) =>
              setTimeframe(e.target.value as AdminAnalyticsTimeframe)
            }
            aria-label="Timeframe"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/50"
            title="Refresh"
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {timeframe === 'custom' ? (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center dark:border-gray-700 dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Custom range
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="analytics-custom-from"
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              From
            </label>
            <input
              type="date"
              id="analytics-custom-from"
              aria-label="From date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="analytics-custom-to"
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              To
            </label>
            <input
              type="date"
              id="analytics-custom-to"
              aria-label="To date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="text-xs text-gray-500 md:ml-auto dark:text-gray-400">
            Compared to previous period of equal length.
          </div>
        </div>
      ) : null}

      {/* Analytics Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`${
              activeTab === 'financial'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
          >
            Financial Analytics
          </button>
          <button
            onClick={() => setActiveTab('staking')}
            className={`${
              activeTab === 'staking'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
          >
            Staking Analytics
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`${
              activeTab === 'referral'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
          >
            Referral Analytics
          </button>
          <button
            onClick={() => setActiveTab('ranks')}
            className={`${
              activeTab === 'ranks'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
          >
            Rank & Pool Analytics
          </button>
        </nav>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-6 h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-3">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="mt-6 h-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-gray-800">
          <div className="mb-2 text-sm font-medium text-red-600 dark:text-red-400">
            Failed to load analytics
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">
            {(error as any)?.response?.data?.error?.message ||
              (error as any)?.response?.data?.message ||
              (error as any)?.message ||
              'Unknown error'}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            If you get 403, the admin role likely lacks{' '}
            <code>analytics.view</code>.
          </div>
          <details className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer select-none">
              Debug details
            </summary>
            <pre className="mt-2 break-words whitespace-pre-wrap">
              {JSON.stringify(
                {
                  status: (error as any)?.response?.status,
                  url: (error as any)?.config?.url,
                  baseURL: (error as any)?.config?.baseURL,
                  method: (error as any)?.config?.method,
                  code: (error as any)?.response?.data?.error?.code,
                  message:
                    (error as any)?.response?.data?.error?.message ||
                    (error as any)?.response?.data?.message ||
                    (error as any)?.message,
                  data: (error as any)?.response?.data,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      ) : (
        <div>
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                  title="Total Users"
                  tooltip="Total number of registered user accounts on the platform. This includes all users regardless of their current status."
                  value={data?.user?.cards?.totalUsers?.value ?? 0}
                  change={getChangeMeta(data?.user?.cards?.totalUsers)}
                  stroke="#6366f1"
                />
                <AnalyticsCard
                  title="New Users"
                  subtitle="Registrations in selected range"
                  tooltip="Number of new user registrations created during the selected time period. Shows the growth rate of your user base."
                  value={data?.user?.cards?.newUsers?.value ?? 0}
                  change={getChangeMeta(data?.user?.cards?.newUsers)}
                  chartData={data?.user?.series?.registrations ?? []}
                  stroke="#2563eb"
                />
                <AnalyticsCard
                  title="Active Users"
                  subtitle="Active in selected range"
                  tooltip="Number of users who logged in or performed any activity during the selected time period. This helps measure engagement."
                  value={data?.user?.cards?.activeUsers?.value ?? 0}
                  change={getChangeMeta(data?.user?.cards?.activeUsers)}
                  chartData={data?.user?.series?.activeUsers ?? []}
                  stroke="#16a34a"
                />
                <AnalyticsCard
                  title="Retention Rate"
                  tooltip="Percentage of users who remained active compared to the previous period. Higher retention indicates better user engagement and platform value."
                  value={data?.user?.cards?.retentionRate?.value ?? 0}
                  change={{
                    delta: data?.user?.cards?.retentionRate?.delta,
                    isPositive:
                      (data?.user?.cards?.retentionRate?.delta ?? 0) >= 0,
                  }}
                  format="percentage"
                  stroke="#7c3aed"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <BreakdownList
                  title="Users by Role"
                  rows={data?.user?.breakdowns?.byRole}
                />
                <BreakdownList
                  title="Users by Status"
                  rows={data?.user?.breakdowns?.byStatus}
                />
                <BreakdownList
                  title="Users by Rank"
                  rows={data?.user?.breakdowns?.byRank}
                />
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                  title="Total Deposited"
                  tooltip="Total amount of USDT deposited by all users during the selected time period. This represents incoming funds to the platform."
                  value={data?.financial?.cards?.totalDeposited?.value ?? 0}
                  change={getChangeMeta(data?.financial?.cards?.totalDeposited)}
                  format="currency"
                  chartData={data?.financial?.series?.deposits ?? []}
                  stroke="#059669"
                />
                <AnalyticsCard
                  title="Total Withdrawn"
                  tooltip="Total amount of USDT withdrawn by all users during the selected time period. This represents outgoing funds from the platform."
                  value={data?.financial?.cards?.totalWithdrawn?.value ?? 0}
                  change={getChangeMeta(data?.financial?.cards?.totalWithdrawn)}
                  format="currency"
                  chartData={data?.financial?.series?.withdrawals ?? []}
                  stroke="#f59e0b"
                />
                <AnalyticsCard
                  title="Net Flow"
                  subtitle="Deposits − Withdrawals"
                  tooltip="Net financial flow calculated as total deposits minus total withdrawals. Positive values indicate net inflow (more deposits than withdrawals), while negative values indicate net outflow."
                  value={data?.financial?.cards?.netFlow?.value ?? 0}
                  change={getChangeMeta(data?.financial?.cards?.netFlow)}
                  format="currency"
                  stroke="#6366f1"
                />
                <AnalyticsCard
                  title="Fees"
                  tooltip="Total transaction fees collected during the selected time period. Fees are typically charged on withdrawals and other platform transactions."
                  value={data?.financial?.cards?.fees?.value ?? 0}
                  change={getChangeMeta(data?.financial?.cards?.fees)}
                  format="currency"
                  chartData={data?.financial?.series?.fees ?? []}
                  stroke="#ef4444"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
                    Withdrawals
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Pending
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatNumber(
                          data?.financial?.cards?.pendingWithdrawals?.count ?? 0
                        )}{' '}
                        ·{' '}
                        {formatUSDT(
                          data?.financial?.cards?.pendingWithdrawals?.amount ??
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Failed
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatNumber(
                          data?.financial?.cards?.failedWithdrawals?.count ?? 0
                        )}{' '}
                        ·{' '}
                        {formatUSDT(
                          data?.financial?.cards?.failedWithdrawals?.amount ?? 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
                    Platform Wallet Totals
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Funded Total
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatUSDT(
                          data?.financial?.cards?.platformWallets
                            ?.fundedTotal ?? 0
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Earning Total
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatUSDT(
                          data?.financial?.cards?.platformWallets
                            ?.earningTotal ?? 0
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Total Balance
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatUSDT(
                          data?.financial?.cards?.platformWallets
                            ?.totalBalance ?? 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnalyticsCard
                  title="Stakes Created"
                  tooltip="Total number of staking positions created during the selected time period. This shows staking activity and user participation."
                  value={data?.staking?.cards?.stakesCreated?.value ?? 0}
                  change={getChangeMeta(data?.staking?.cards?.stakesCreated)}
                  chartData={data?.staking?.series?.stakedByDay ?? []}
                  stroke="#6366f1"
                />
                <AnalyticsCard
                  title="Total Staked"
                  tooltip="Total amount of USDT locked in all stakes (both active and completed) created during the selected time period. This represents the capital committed to staking."
                  value={data?.staking?.cards?.totalStaked?.value ?? 0}
                  change={getChangeMeta(data?.staking?.cards?.totalStaked)}
                  format="currency"
                  stroke="#059669"
                />
                <AnalyticsCard
                  title="Average Stake Amount"
                  tooltip="Average amount of USDT per stake created during the selected time period. Higher averages indicate users are making larger investments."
                  value={data?.staking?.cards?.averageStakeAmount?.value ?? 0}
                  change={getChangeMeta(
                    data?.staking?.cards?.averageStakeAmount
                  )}
                  format="currency"
                  stroke="#7c3aed"
                />
                <AnalyticsCard
                  title="Active Stakes"
                  tooltip="Current number of stakes that are currently active (not yet completed or withdrawn early). This represents ongoing staking positions."
                  value={data?.staking?.cards?.activeStakes?.value ?? 0}
                  change={getChangeMeta(data?.staking?.cards?.activeStakes)}
                  stroke="#16a34a"
                />
                <AnalyticsCard
                  title="Active Staked Amount"
                  tooltip="Total amount of USDT currently locked in active stakes. This represents the current Total Value Locked (TVL) in the staking system."
                  value={data?.staking?.cards?.activeStakedAmount?.value ?? 0}
                  change={getChangeMeta(
                    data?.staking?.cards?.activeStakedAmount
                  )}
                  format="currency"
                  stroke="#2563eb"
                />
                <AnalyticsCard
                  title="Stakes Completed"
                  tooltip="Number of stakes that reached their completion date or were successfully completed during the selected time period. This shows successful staking outcomes."
                  value={data?.staking?.cards?.stakesCompleted?.value ?? 0}
                  change={getChangeMeta(data?.staking?.cards?.stakesCompleted)}
                  chartData={data?.staking?.series?.completedByDay ?? []}
                  stroke="#f59e0b"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <BreakdownList
                  title="Stakes by Status"
                  rows={data?.staking?.breakdowns?.byStatus}
                />
                <BreakdownList
                  title="Stakes by Type"
                  rows={data?.staking?.breakdowns?.byType}
                />
                <BreakdownList
                  title="Stakes by Goal"
                  rows={data?.staking?.breakdowns?.byGoal}
                />
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                  title="New Referred Users"
                  tooltip="Number of new users who registered using a referral code during the selected time period. This measures the effectiveness of your referral program."
                  value={data?.referral?.cards?.newReferredUsers?.value ?? 0}
                  change={getChangeMeta(
                    data?.referral?.cards?.newReferredUsers
                  )}
                  chartData={data?.referral?.series?.referredUsers ?? []}
                  stroke="#2563eb"
                />
                <AnalyticsCard
                  title="Referral Bonuses Paid"
                  tooltip="Total amount of USDT paid out as referral bonuses during the selected time period. This represents the cost/reward of the referral program."
                  value={data?.referral?.cards?.referralBonusesPaid?.value ?? 0}
                  change={getChangeMeta(
                    data?.referral?.cards?.referralBonusesPaid
                  )}
                  format="currency"
                  chartData={data?.referral?.series?.referralBonuses ?? []}
                  stroke="#059669"
                />
                <AnalyticsCard
                  title="Unique Referrers"
                  tooltip="Number of unique users who successfully referred at least one new user during the selected time period. This shows active participation in the referral program."
                  value={data?.referral?.cards?.uniqueReferrers?.value ?? 0}
                  change={getChangeMeta(data?.referral?.cards?.uniqueReferrers)}
                  stroke="#6366f1"
                />
                <AnalyticsCard
                  title="Conversion Rate"
                  subtitle="Referred users who deposited"
                  tooltip="Percentage of referred users who made at least one deposit after registration. Higher rates indicate that referred users are more engaged and valuable."
                  value={
                    data?.referral?.cards?.referredConversionRate?.value ?? 0
                  }
                  change={getChangeMeta(
                    data?.referral?.cards?.referredConversionRate
                  )}
                  format="percentage"
                  stroke="#7c3aed"
                />
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Top Referrers
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/60">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                        >
                          Referrals
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                        >
                          Total Bonus
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {(data?.referral?.topReferrers ?? []).map((row) => {
                        const name =
                          row.user?.fullName ||
                          row.user?.username ||
                          row.user?.email ||
                          row.userId;
                        return (
                          <tr
                            key={row.userId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {row.userId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {formatNumber(row.count)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                {formatUSDT(row.totalBonus)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(data?.referral?.topReferrers ?? []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No top referrers in this range.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ranks' && (
            <div className="space-y-6">
              <FinanceTitanPoolDisplay />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <PermissionGuard permission="analytics.view">
      <AnalyticsPageInner />
    </PermissionGuard>
  );
}
