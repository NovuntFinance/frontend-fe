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

  // Custom date range state
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  // pickerFrom/To: draft values the admin types in the inputs
  const [pickerFrom, setPickerFrom] = useState('');
  const [pickerTo, setPickerTo] = useState('');
  // appliedFrom/To: committed values that actually drive the query (set on Apply only)
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  // Only pass dates to the query AFTER the user has clicked Apply.
  // While the picker is open the old timeframe stays active.
  const queryFrom =
    timeframe === 'custom' && appliedFrom ? appliedFrom : undefined;
  const queryTo = timeframe === 'custom' && appliedTo ? appliedTo : undefined;

  const { data, isLoading, isFetching, error } = useAdminDashboard(
    timeframe,
    queryFrom,
    queryTo
  );

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

    const p = metrics.platform as any;
    const totalDeposited = p.totalDepositedAllTime ?? 0;
    const totalDepositCount = p.totalDepositCountAllTime ?? 0;
    const totalWithdrawn = p.totalWithdrawnAllTime ?? 0;
    const netCapital = totalDeposited - totalWithdrawn;
    const totalStaked = p.totalStakedAllTime ?? 0; // user capital only
    const bonusStakes = p.bonusStakesTotal ?? 0; // platform-funded bonus stakes
    const bonusStakesCount = p.bonusStakesCount ?? 0;
    const totalReturnsEarned = p.totalReturnsEarned ?? 0;
    const platformBalance = p.totalBalance ?? 0;
    const fundedWallet = p.fundedWalletTotal ?? 0;
    const earningWallet = p.earningWalletTotal ?? 0;
    const rosPayouts =
      p.rosPayoutsAllTime ?? p.totalPaidROIAllTime ?? p.totalPaidROI ?? 0;
    const rosCount = p.rosPayoutsCountAllTime ?? 0;
    const premiumPool = p.premiumPoolAllTime ?? 0;
    const performancePool = p.performancePoolAllTime ?? 0;
    const rankPool = p.rankPoolAllTime ?? 0;
    const redistributionPool = p.redistributionPoolAllTime ?? 0;
    const totalROI = p.totalPaidROIAllTime ?? p.totalPaidROI ?? 0;
    const regBonus = p.registrationBonusPaidAllTime ?? 0;
    const regBonusCount = p.registrationBonusCountAllTime ?? 0;
    const referralBonus = p.referralBonusPaidAllTime ?? 0;
    const referralBonusCount = p.referralBonusCountAllTime ?? 0;
    const totalBonuses = p.totalBonusesPaidAllTime ?? p.totalBonusesPaid ?? 0;

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
      // ── Capital Flow ─────────────────────────────────────────────────────
      {
        id: 'total-deposited-alltime',
        content: (
          <AdminMetricCard
            title="Total Deposited"
            value={formatUSDT(totalDeposited)}
            secondaryValue={`${totalDepositCount} confirmed deposits`}
            tooltip="All-time sum of every confirmed deposit (transaction ledger — authoritative, includes partial deposits)."
            icon="dollar"
            trend="neutral"
          />
        ),
      },
      {
        id: 'total-withdrawn-alltime',
        content: (
          <AdminMetricCard
            title="Total Withdrawn"
            value={formatUSDT(totalWithdrawn)}
            secondaryValue="All-time successful withdrawals"
            tooltip="All-time total successfully withdrawn by users (wallet rollup)."
            icon="wallet"
            trend="neutral"
          />
        ),
      },
      {
        id: 'net-capital',
        content: (
          <AdminMetricCard
            title="Net Capital"
            value={formatUSDT(netCapital)}
            secondaryValue="Total Deposited − Total Withdrawn"
            tooltip="Net capital remaining on the platform: all-time deposits minus all-time withdrawals."
            icon="dollar"
            trend={getTrend(netCapital)}
          />
        ),
      },
      // ── Staking ───────────────────────────────────────────────────────────
      {
        id: 'total-staked-alltime',
        content: (
          <AdminMetricCard
            title="User Capital Staked"
            value={formatUSDT(totalStaked)}
            secondaryValue={`${metrics.stakes.total - bonusStakesCount} user positions · TVL ${formatUSDT(tvl)}`}
            tooltip="All-time total user-deposited capital put into staking positions. Excludes platform-funded registration bonus stakes. Matches total deposited."
            icon="chart"
            trend="neutral"
          />
        ),
      },
      {
        id: 'bonus-stakes',
        content: (
          <AdminMetricCard
            title="Bonus Stakes (Platform)"
            value={formatUSDT(bonusStakes)}
            secondaryValue={`${bonusStakesCount} registration bonus positions`}
            tooltip="Total platform-funded registration bonus stake positions (10% of qualifying stake). These are NOT user deposits — they are funded by the platform as a bonus reward."
            icon="shield"
            trend="neutral"
          />
        ),
      },
      {
        id: 'total-returns-earned',
        content: (
          <AdminMetricCard
            title="Total Returns Earned"
            value={formatUSDT(totalReturnsEarned)}
            secondaryValue="Cumulative ROS across all positions"
            tooltip="Total returns (ROS earnings) accumulated across all stake positions — both user capital and bonus stakes."
            icon="money"
            trend="neutral"
          />
        ),
      },
      {
        id: 'platform-balance',
        content: (
          <AdminMetricCard
            title="Platform Balance"
            value={formatUSDT(platformBalance)}
            secondaryValue={`Funded: ${formatUSDT(fundedWallet)} · Earning: ${formatUSDT(earningWallet)}`}
            tooltip="Total funds currently held in all user wallets. Funded = available to stake/withdraw. Earning = accumulated ROS not yet withdrawn."
            icon="wallet"
            trend="neutral"
          />
        ),
      },
      // ── ROI & Payouts ─────────────────────────────────────────────────────
      {
        id: 'ros-payouts',
        content: (
          <AdminMetricCard
            title="Daily ROS Paid Out"
            value={formatUSDT(rosPayouts)}
            secondaryValue={`${rosCount.toLocaleString()} daily distributions`}
            tooltip="All-time total daily ROS (Return on Stake) payouts credited to user earning wallets."
            icon="money"
            trend="neutral"
          />
        ),
      },
      {
        id: 'premium-pool',
        content: (
          <AdminMetricCard
            title="Premium Pool Paid"
            value={formatUSDT(premiumPool)}
            secondaryValue="All-time premium pool distributions"
            tooltip="All-time total premium pool payouts distributed to qualified stakers."
            icon="money"
            trend="neutral"
          />
        ),
      },
      {
        id: 'performance-pool',
        content: (
          <AdminMetricCard
            title="Performance Pool Paid"
            value={formatUSDT(performancePool)}
            secondaryValue={`Rank: ${formatUSDT(rankPool)} · Redist: ${formatUSDT(redistributionPool)}`}
            tooltip="All-time performance pool distributions. Subtitle shows rank pool and redistribution pool totals."
            icon="money"
            trend="neutral"
          />
        ),
      },
      // ── Bonuses ───────────────────────────────────────────────────────────
      {
        id: 'reg-bonus',
        content: (
          <AdminMetricCard
            title="Registration Bonuses"
            value={formatUSDT(regBonus)}
            secondaryValue={`${regBonusCount.toLocaleString()} payouts`}
            tooltip="All-time registration bonus payouts credited to qualifying users (10% of first stake)."
            icon="shield"
            trend="neutral"
          />
        ),
      },
      {
        id: 'referral-bonus',
        content: (
          <AdminMetricCard
            title="Referral Bonuses"
            value={formatUSDT(referralBonus)}
            secondaryValue={`${referralBonusCount.toLocaleString()} payouts`}
            tooltip="All-time referral bonus payouts credited to users who referred new stakers."
            icon="shield"
            trend="neutral"
          />
        ),
      },
      {
        id: 'total-bonuses',
        content: (
          <AdminMetricCard
            title="Total Bonuses Paid"
            value={formatUSDT(totalBonuses)}
            secondaryValue="Registration + Referral combined"
            tooltip="All-time total bonus payouts: registration bonuses plus referral bonuses."
            icon="shield"
            trend="neutral"
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

  const TIMEFRAMES: { value: AdminDashboardTimeframe; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom' },
  ];

  const customRangeLabel =
    timeframe === 'custom' && appliedFrom
      ? `${appliedFrom}${appliedTo ? ` → ${appliedTo}` : ` → today`}`
      : null;

  return (
    <div className="space-y-6">
      {/* ── Sticky Top Control Bar ──────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 dark:border-gray-700 dark:bg-gray-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: title + active period label + last-updated */}
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Admin Dashboard
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {customRangeLabel ? (
                <span className="font-medium text-indigo-500">
                  {customRangeLabel}
                </span>
              ) : timeframe === 'all' ? (
                <span className="font-medium text-indigo-500">All Time</span>
              ) : (
                <span>Last {timeframeLabel}</span>
              )}
              {lastUpdatedLabel && <span> · Updated {lastUpdatedLabel}</span>}
              {isFetching && !isLoading && (
                <span className="ml-2 inline-flex items-center gap-1 text-indigo-500">
                  <svg
                    className="h-3 w-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Refreshing…
                </span>
              )}
            </p>
          </div>

          {/* Right: timeframe pills + export */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {error && (
              <span className="text-xs text-red-500 dark:text-red-400">
                Failed to load. Please retry.
              </span>
            )}

            {/* Timeframe pill group */}
            <div className="flex flex-wrap items-center rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
              {TIMEFRAMES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    if (value === 'custom') {
                      // Only open the picker — don't switch timeframe yet.
                      // Timeframe switches to 'custom' only when Apply is clicked.
                      setShowCustomPicker((p) => !p);
                    } else {
                      setShowCustomPicker(false);
                      setTimeframe(value);
                    }
                  }}
                  className={[
                    'rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-150',
                    timeframe === value ||
                    (value === 'custom' && showCustomPicker)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Export button */}
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              type="button"
              onClick={exportReport}
              disabled={!data}
              title="Export report as JSON"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
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
              Export
            </button>
          </div>
        </div>

        {/* ── Custom date-range picker ─────────────────────────────── */}
        {showCustomPicker && (
          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900/20">
            <p className="mb-3 text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
              Select Date Range
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="custom-from"
                  className="text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  From
                </label>
                <input
                  id="custom-from"
                  type="date"
                  title="Start date"
                  value={pickerFrom}
                  max={pickerTo || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickerFrom(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex items-end pb-2 text-sm text-gray-400">→</div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="custom-to"
                  className="text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  To
                </label>
                <input
                  id="custom-to"
                  type="date"
                  title="End date"
                  value={pickerTo}
                  min={pickerFrom}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickerTo(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <button
                  type="button"
                  disabled={!pickerFrom}
                  onClick={() => {
                    const toDate =
                      pickerTo || new Date().toISOString().split('T')[0];
                    setAppliedFrom(pickerFrom);
                    setAppliedTo(toDate);
                    setTimeframe('custom'); // activate only now
                    setShowCustomPicker(false);
                  }}
                  className="rounded-md bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomPicker(false);
                    // If custom was already active, keep showing it;
                    // otherwise just close the picker.
                    if (timeframe !== 'custom') {
                      // nothing to reset — previous timeframe is still active
                    } else {
                      setTimeframe(DEFAULT_TIMEFRAME);
                      setAppliedFrom('');
                      setAppliedTo('');
                    }
                    setPickerFrom('');
                    setPickerTo('');
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
            {customRangeLabel && (
              <p className="mt-2 text-xs text-indigo-500">
                Currently active:{' '}
                <span className="font-semibold">{customRangeLabel}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Live Metrics Grid (top 8 cards) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading && metricCards.length === 0 ? (
          Array(8)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))
        ) : metrics ? (
          metricCards
            .slice(0, 8)
            .map((card) => <div key={card.id}>{card.content}</div>)
        ) : (
          <div className="col-span-4 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Error loading metrics. Please try again.
            </p>
          </div>
        )}
      </div>

      {/* All-Time Platform Financials — 4 subsections */}
      {metrics && (
        <div className="space-y-6">
          {/* Capital Flow */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Capital Flow
              </h3>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {metricCards.slice(8, 11).map((card) => (
                <div key={card.id}>{card.content}</div>
              ))}
            </div>
          </div>

          {/* Staking — 4 cards: User Capital, Platform Bonus Stakes, Returns Earned, Platform Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Staking
              </h3>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.slice(11, 15).map((card) => (
                <div key={card.id}>{card.content}</div>
              ))}
            </div>
          </div>

          {/* ROI & Payouts */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                ROI &amp; Payouts
              </h3>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {metricCards.slice(15, 18).map((card) => (
                <div key={card.id}>{card.content}</div>
              ))}
            </div>
          </div>

          {/* Bonuses */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Bonuses
              </h3>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {metricCards.slice(18).map((card) => (
                <div key={card.id}>{card.content}</div>
              ))}
            </div>
          </div>
        </div>
      )}

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
