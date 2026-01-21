'use client';

import { useMemo, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import {
  AdminDashboardData,
  AdminDashboardTimeframe,
  ChartDataPoint,
} from '@/types/admin';
import { LoadingStates } from '@/components/ui/loading-states';

type ChartTab = 'revenue' | 'users' | 'stakes';

interface AdminChartSectionProps {
  charts?: AdminDashboardData['charts'];
  timeframe: AdminDashboardTimeframe;
  onTimeframeChange: (timeframe: AdminDashboardTimeframe) => void;
  isLoading?: boolean;
}

const tabChartKey: Record<ChartTab, keyof AdminDashboardData['charts']> = {
  revenue: 'revenue',
  users: 'userGrowth',
  stakes: 'stakes',
};

const timeframeOptions: Array<{
  label: string;
  value: AdminDashboardTimeframe;
}> = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
];

const AdminChartSection = ({
  charts,
  timeframe,
  onTimeframeChange,
  isLoading = false,
}: AdminChartSectionProps) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('revenue');

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!charts) return [];
    const key = tabChartKey[activeTab];
    return charts[key] ?? [];
  }, [activeTab, charts]);

  const chartColorClass =
    activeTab === 'revenue'
      ? 'bg-indigo-500'
      : activeTab === 'users'
        ? 'bg-emerald-500'
        : 'bg-amber-500';

  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((item) => item.value)) : 0;

  const formattedLabels = useMemo(() => {
    return chartData.map((item) => {
      if (item.label) return item.label;
      const parsed = parseISO(item.date);
      if (isValid(parsed)) {
        if (timeframe === '7d' || timeframe === '24h') {
          return format(parsed, 'MMM d');
        }
        return format(parsed, 'MMM d');
      }
      return item.date;
    });
  }, [chartData, timeframe]);

  const totalValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    if (activeTab === 'revenue') {
      return chartData.reduce((sum, item) => sum + item.value, 0);
    }
    return chartData[chartData.length - 1]?.value ?? 0;
  }, [activeTab, chartData]);

  const changePercentage = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0]?.value ?? 0;
    const last = chartData[chartData.length - 1]?.value ?? 0;
    if (first === 0) {
      return last === 0 ? 0 : 100;
    }
    return ((last - first) / Math.abs(first)) * 100;
  }, [chartData]);

  const formatUSDT = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value < 1000 ? 2 : 0,
    }).format(value);
    return `${formatted} USDT`;
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value < 1000 ? 2 : 0,
    }).format(value);

  const totalDisplay =
    activeTab === 'revenue' ? formatUSDT(totalValue) : formatNumber(totalValue);
  const changeDisplay = `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%`;
  const changeClass =
    changePercentage >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  const showSkeleton = isLoading && chartData.length === 0;

  const exportActiveChartCsv = () => {
    const safeTimeframe = String(timeframe).toLowerCase();
    const tabLabel =
      activeTab === 'revenue'
        ? 'deposits'
        : activeTab === 'users'
          ? 'user-growth'
          : 'stakes';

    const rows = chartData.map((p) => ({
      date: p.date,
      value: p.value,
    }));

    const header = 'date,value';
    const csv = [header, ...rows.map((r) => `${r.date},${r.value}`)].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novunt-admin-${tabLabel}-${safeTimeframe}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'revenue'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'users'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              User Growth
            </button>
            <button
              onClick={() => setActiveTab('stakes')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === 'stakes'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              Stakes
            </button>
          </div>

          <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeframeChange(option.value)}
                className={`px-3 py-1 text-sm ${
                  timeframe === option.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${option.value === '30d' ? 'border-x border-gray-200 dark:border-gray-700' : ''}`}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="relative h-64">
          {showSkeleton ? (
            <div className="absolute inset-0">
              <LoadingStates.Card height="h-full" className="w-full" />
            </div>
          ) : (
            <>
              <div className="absolute top-0 bottom-0 left-0 flex w-10 flex-col justify-between py-1 text-xs text-gray-500 dark:text-gray-400">
                <div>{Math.round(maxValue).toLocaleString()}</div>
                <div>{Math.round(maxValue * 0.75).toLocaleString()}</div>
                <div>{Math.round(maxValue * 0.5).toLocaleString()}</div>
                <div>{Math.round(maxValue * 0.25).toLocaleString()}</div>
                <div>0</div>
              </div>

              <div className="absolute top-0 right-0 bottom-0 left-10 grid h-full grid-rows-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-full border-t border-gray-100 dark:border-gray-700"
                  />
                ))}
              </div>

              <div className="absolute top-0 right-0 bottom-5 left-10 flex items-end">
                {chartData.length > 0 ? (
                  chartData.map((item, index) => {
                    const height =
                      maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div
                        key={index}
                        className="flex flex-1 flex-col items-center justify-end"
                      >
                        <div
                          className={`${chartColorClass} w-5/6 rounded-t transition-all duration-500 ease-in-out`}
                          style={{ height: `${height}%` }}
                          title={`${item.label ?? item.date}: ${item.value.toLocaleString()}`}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex w-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    No data available for the selected range.
                  </div>
                )}
              </div>

              <div className="absolute right-0 bottom-0 left-10 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                {chartData
                  .map((item, index) => ({
                    label: formattedLabels[index],
                    index,
                  }))
                  .filter((_, i) => {
                    if (timeframe === '7d' || timeframe === '24h') return true;
                    if (timeframe === '30d') return i % 6 === 0;
                    return i % 15 === 0;
                  })
                  .map(({ label }, index) => (
                    <div
                      key={index}
                      className="text-center"
                      style={{
                        width:
                          timeframe === '7d' || timeframe === '24h'
                            ? '14.28%'
                            : timeframe === '30d'
                              ? '16.67%'
                              : '20%',
                      }}
                    >
                      {label}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {activeTab === 'revenue'
                ? 'Total Deposits'
                : activeTab === 'users'
                  ? 'Total Users'
                  : 'Total Stakes'}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {totalDisplay}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {timeframe === '24h'
                ? '24h Change'
                : timeframe === '7d'
                  ? '7-Day Change'
                  : timeframe === '30d'
                    ? '30-Day Change'
                    : '90-Day Change'}
            </p>
            <p className={`text-xl font-semibold ${changeClass}`}>
              {changeDisplay}
            </p>
          </div>

          <button
            type="button"
            onClick={exportActiveChartCsv}
            disabled={chartData.length === 0}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChartSection;
