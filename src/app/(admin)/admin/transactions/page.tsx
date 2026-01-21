'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useAdminTransactionDetail, useAdminTransactions } from '@/lib/queries';
import type {
  AdminTransactionListSortBy,
  AdminTransactionListSortOrder,
  AdminTransactionRow,
  AdminTransactionsListResponse,
} from '@/types/adminTransactions';
import { adminService } from '@/services/adminService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatMoney(value: number) {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);
  return `${formatted} USDT`;
}

function safeDateLabel(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function DirectionBadge({ direction }: { direction?: string }) {
  const isOut = direction === 'out';
  const bg = isOut
    ? 'bg-red-100 dark:bg-red-900/30'
    : 'bg-green-100 dark:bg-green-900/30';
  const text = isOut
    ? 'text-red-800 dark:text-red-300'
    : 'text-green-800 dark:text-green-300';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {isOut ? 'Out' : 'In'}
    </span>
  );
}

function Chip({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}) {
  const styles =
    variant === 'warning'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      : variant === 'danger'
        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        : variant === 'success'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

export default function TransactionsPage() {
  const { hasPermission } = usePermissions();
  const canView =
    hasPermission('transactions.view') || hasPermission('transactions.read');
  const canExport = hasPermission('reports.export');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [method, setMethod] = useState('all');
  const [requiresApproval, setRequiresApproval] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const [sortBy, setSortBy] = useState<AdminTransactionListSortBy>('createdAt');
  const [sortOrder, setSortOrder] =
    useState<AdminTransactionListSortOrder>('desc');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = {
      page,
      limit: Math.min(Math.max(limit, 1), 200),
      sortBy,
      sortOrder,
    };
    if (debouncedSearchQuery) p.search = debouncedSearchQuery;
    if (status !== 'all') p.status = status;
    if (type !== 'all') p.type = type;
    if (category !== 'all') p.category = category;
    if (method !== 'all') p.method = method;
    if (requiresApproval !== 'all') p.requiresApproval = requiresApproval;
    if (createdFrom) p.createdFrom = createdFrom;
    if (createdTo) p.createdTo = createdTo;
    if (amountMin) p.amountMin = Number(amountMin);
    if (amountMax) p.amountMax = Number(amountMax);
    return p;
  }, [
    amountMax,
    amountMin,
    category,
    createdFrom,
    createdTo,
    debouncedSearchQuery,
    limit,
    method,
    page,
    requiresApproval,
    sortBy,
    sortOrder,
    status,
    type,
  ]);

  const { data, isLoading, error, refetch, isFetching } = useAdminTransactions(
    canView ? queryParams : undefined
  );

  const normalized: AdminTransactionsListResponse | null = useMemo(() => {
    if (!data) return null;
    // Backend may wrap again; normalize conservatively
    if (data?.data?.transactions) return data as AdminTransactionsListResponse;
    if ((data as any)?.transactions) {
      return {
        success: true,
        data: {
          transactions: (data as any).transactions,
          pagination: (data as any).pagination ?? {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
          summary: (data as any).summary,
        },
      };
    }
    return null;
  }, [data]);

  const rows: AdminTransactionRow[] = normalized?.data?.transactions ?? [];
  const pagination = normalized?.data?.pagination;
  const summary = normalized?.data?.summary;

  const detailQuery = useAdminTransactionDetail(
    drawerOpen ? selectedTxId : null
  );
  const detailTx =
    (detailQuery.data as any)?.data?.transaction ||
    (detailQuery.data as any)?.transaction;

  const openDrawer = (txId: string) => {
    setSelectedTxId(txId);
    setDrawerOpen(true);
  };

  const handleExport = async () => {
    if (!canExport) return;
    try {
      const response = await adminService.exportTransactionsCsv(queryParams);

      const blob = response.data as Blob;
      const disposition =
        (response.headers?.['content-disposition'] as string | undefined) ||
        (response.headers?.['Content-Disposition'] as string | undefined);

      let filename = 'novunt-admin-transactions.csv';
      if (disposition) {
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(
          disposition
        );
        const name = decodeURIComponent(match?.[1] || match?.[2] || '');
        if (name) filename = name;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      const code = e?.response?.data?.error?.code || e?.code;
      if (code === '2FA_CODE_REQUIRED') {
        toast.error('2FA required to export transactions');
        return;
      }
      if (code === '2FA_CODE_INVALID') {
        toast.error('Invalid 2FA code. Please try again.');
        return;
      }
      toast.error(
        e?.response?.data?.error?.message || e?.message || 'Export failed'
      );
    }
  };

  const handleSort = (col: AdminTransactionListSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(col);
    setSortOrder('desc');
  };

  // Transaction Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';

    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-400';
        break;
      case 'pending':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-400';
        break;
      case 'failed':
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-400';
        break;
      case 'cancelled':
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-300';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-300';
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Transaction Type badge
  const TypeBadge = ({ type }: { type: string }) => {
    let bgColor = '';
    let textColor = '';
    let icon = '';

    switch (type) {
      case 'deposit':
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
        textColor = 'text-blue-800 dark:text-blue-400';
        icon = 'M12 4v16m8-8H4';
        break;
      case 'withdrawal':
        bgColor = 'bg-purple-100 dark:bg-purple-900/30';
        textColor = 'text-purple-800 dark:text-purple-400';
        icon = 'M12 4v16m8-8H4';
        break;
      case 'stake':
        bgColor = 'bg-indigo-100 dark:bg-indigo-900/30';
        textColor = 'text-indigo-800 dark:text-indigo-400';
        icon =
          'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
        break;
      case 'unstake':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-400';
        icon = 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z';
        break;
      case 'reward':
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-400';
        icon =
          'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-300';
        icon = 'M9 5l7 7-7 7';
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}
      >
        <svg
          className="mr-1 h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon}></path>
        </svg>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Transaction Management
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={!canView}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV (2FA)
          </button>
        </div>
      </div>

      {!canView && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          You don’t have permission to view transactions. Required:{' '}
          <code>transactions.view</code> (or legacy{' '}
          <code>transactions.read</code>).
        </div>
      )}

      {/* Filters Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              placeholder="Search by user, transaction ID, or hash"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by type"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="stake">Stakes</option>
              <option value="unstake">Unstakes</option>
              <option value="reward">Rewards</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by status"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by category"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="staking">Staking</option>
              <option value="earnings">Earnings</option>
              <option value="transfer">Transfer</option>
              <option value="bonus">Bonus</option>
              <option value="fee">Fee</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by method"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Methods</option>
              <option value="nowpayments">NowPayments</option>
              <option value="internal">Internal</option>
              <option value="manual">Manual</option>
              <option value="system">System</option>
              <option value="bonus">Bonus</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Date Range + amounts */}
          <div className="grid grid-cols-2 gap-2 md:w-72">
            <div>
              <label
                htmlFor="date-from"
                className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                From Date
              </label>
              <input
                id="date-from"
                type="date"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                value={createdFrom}
                onChange={(e) => {
                  setCreatedFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label
                htmlFor="date-to"
                className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                To Date
              </label>
              <input
                id="date-to"
                type="date"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                value={createdTo}
                onChange={(e) => {
                  setCreatedTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:w-72">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Amount min
              </label>
              <input
                type="number"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                value={amountMin}
                onChange={(e) => {
                  setAmountMin(e.target.value);
                  setPage(1);
                }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Amount max
              </label>
              <input
                type="number"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                value={amountMax}
                onChange={(e) => {
                  setAmountMax(e.target.value);
                  setPage(1);
                }}
                placeholder="100000"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by requires approval"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={requiresApproval}
              onChange={(e) => {
                setRequiresApproval(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">Requires approval: Any</option>
              <option value="true">Requires approval: Yes</option>
              <option value="false">Requires approval: No</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <select
              aria-label="Rows per page"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={String(limit)}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[20, 50, 100, 200].map((n) => (
                <option key={n} value={String(n)}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1"></div> {/* Spacer */}
          <button
            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={() => {
              setSearchQuery('');
              setStatus('all');
              setType('all');
              setCategory('all');
              setMethod('all');
              setRequiresApproval('all');
              setCreatedFrom('');
              setCreatedTo('');
              setAmountMin('');
              setAmountMax('');
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination ? `${pagination.total} transactions found` : '—'}
            {isFetching ? ' (updating...)' : ''}
          </p>
          {summary && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Chip variant="warning">Pending: {summary.pending}</Chip>
              <Chip variant="warning">
                Needs approval: {summary.requiresApproval}
              </Chip>
              <Chip variant="danger">Failed: {summary.failed}</Chip>
              <Chip variant="success">Completed: {summary.completed}</Chip>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <div
                  className="flex cursor-pointer items-center"
                  onClick={() => handleSort('createdAt')}
                >
                  <span>Date/Time</span>
                  {sortBy === 'createdAt' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortOrder === 'asc' ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Reference / User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Type / Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <div
                  className="flex cursor-pointer items-center"
                  onClick={() => handleSort('amount')}
                >
                  <span>Amount</span>
                  {sortBy === 'amount' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortOrder === 'asc' ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <div
                  className="flex cursor-pointer items-center"
                  onClick={() => handleSort('status')}
                >
                  <span>Status</span>
                  {sortBy === 'status' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortOrder === 'asc' ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              // Loading skeleton
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="ml-auto h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                  </tr>
                ))
            ) : canView && rows.length > 0 ? (
              rows.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {safeDateLabel(tx.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.processedAt
                        ? `Processed: ${safeDateLabel(tx.processedAt)}`
                        : `ID: ${tx.id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tx.reference || tx.title || tx.id}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {tx.user?.fullName ||
                          tx.user?.email ||
                          tx.user?.username ||
                          '—'}
                      </span>
                      {tx.user?.id ? (
                        <span className="opacity-70">({tx.user.id})</span>
                      ) : null}
                      {tx.blockchainTxHash ? <Chip>Hash</Chip> : null}
                      {tx.requiresAdminApproval ? (
                        <Chip variant="warning">Needs approval</Chip>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <TypeBadge type={tx.type} />
                      {tx.category ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {tx.category}
                        </span>
                      ) : null}
                      {tx.method ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {tx.method}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <DirectionBadge direction={tx.direction} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatMoney(tx.displayAmount ?? tx.amount)}
                      </span>
                    </div>
                    {(tx.fee ?? 0) > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Fee: {formatMoney(tx.fee as number)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => openDrawer(tx.id)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {error
                    ? (error as any)?.response?.data?.error?.message ||
                      (error as any)?.message ||
                      'Failed to load transactions'
                    : 'No transactions found matching your search criteria'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between rounded-lg border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 ${
                    pagination.page === 1
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                  (_, i) => {
                    // Show pages around current page
                    const pageToShow = Math.min(
                      Math.max(pagination.page - 2 + i, 1),
                      pagination.totalPages
                    );

                    // Only show the page if it hasn't been shown yet
                    const hasShown = Array.from({ length: i }).some((_, j) => {
                      const prevPageToShow = Math.min(
                        Math.max(pagination.page - 2 + j, 1),
                        pagination.totalPages
                      );
                      return prevPageToShow === pageToShow;
                    });

                    if (hasShown) {
                      return null;
                    }

                    return (
                      <button
                        key={pageToShow}
                        onClick={() => setPage(pageToShow)}
                        className={`relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 ${
                          pagination.page === pageToShow
                            ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageToShow}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 ${
                    pagination.page === pagination.totalPages
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Mobile pagination */}
      {pagination && (
        <div className="flex items-center justify-between sm:hidden">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={pagination.page === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600 ${
              pagination.page === 1
                ? 'bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{pagination.page}</span> of{' '}
            <span className="font-medium">{pagination.totalPages}</span>
          </div>
          <button
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, pagination.totalPages))
            }
            disabled={pagination.page === pagination.totalPages}
            className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600 ${
              pagination.page === pagination.totalPages
                ? 'bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Transaction View Drawer (Dialog) */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
            <DialogDescription>
              {selectedTxId ? `ID: ${selectedTxId}` : '—'}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ) : detailQuery.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100">
              {(detailQuery.error as any)?.response?.data?.error?.message ||
                (detailQuery.error as any)?.message ||
                'Failed to load transaction'}
            </div>
          ) : detailTx ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium">
                    {String((detailTx as any).type || '—')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">
                    {String((detailTx as any).status || '—')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-medium">
                    {Number.isFinite((detailTx as any).displayAmount)
                      ? formatMoney(Number((detailTx as any).displayAmount))
                      : Number.isFinite((detailTx as any).amount)
                        ? formatMoney(Number((detailTx as any).amount))
                        : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Direction</div>
                  <div className="font-medium">
                    {String((detailTx as any).direction || '—')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {safeDateLabel((detailTx as any).createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Processed</div>
                  <div className="font-medium">
                    {safeDateLabel((detailTx as any).processedAt)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="text-muted-foreground mb-2">Identifiers</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground">Reference</div>
                    <div className="font-mono text-xs break-all">
                      {String((detailTx as any).reference || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">TxID</div>
                    <div className="font-mono text-xs break-all">
                      {String((detailTx as any).txId || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Wallet</div>
                    <div className="font-mono text-xs break-all">
                      {String((detailTx as any).walletAddress || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Blockchain hash</div>
                    <div className="font-mono text-xs break-all">
                      {String(
                        (detailTx as any).blockchainTxHash ||
                          (detailTx as any)?.metadata?.blockchainTxHash ||
                          '—'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="text-muted-foreground mb-2">Raw payload</div>
                <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 dark:bg-gray-900/40 dark:text-gray-100">
                  {JSON.stringify(detailTx, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              No transaction selected.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
