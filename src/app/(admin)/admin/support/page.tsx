/**
 * Admin Support Dashboard — Overview & Ticket Management
 *
 * Features:
 *   - Stats cards (by status, priority, category)
 *   - Filterable, searchable, paginated ticket list
 *   - Quick actions (status change, priority change, assign)
 *   - Socket.io real-time for new tickets & status changes
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Search,
  RefreshCw,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { getAdminSupportStats, getAdminTickets } from '@/services/assistantApi';
import { useSupportSocket } from '@/hooks/useSupportSocket';
import { useAuthStore } from '@/store/authStore';
import type { AdminTicket, TicketStats, Pagination } from '@/types/assistant';

// ─── Status / Priority config ────────────────────────────────────────
const statusBadge: Record<string, { label: string; color: string }> = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  in_progress: {
    label: 'In Progress',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  resolved: {
    label: 'Resolved',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

const priorityBadge: Record<string, { label: string; color: string }> = {
  low: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  high: {
    label: 'High',
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

export default function AdminSupportPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Stats
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Tickets
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Socket.io for real-time
  useSupportSocket(user?._id || user?.id, 'admin', {
    onTicketNew: () => {
      loadStats();
      loadTickets(pagination.page);
    },
    onTicketStatusChanged: () => {
      loadStats();
      loadTickets(pagination.page);
    },
  });

  // ─── Data loaders ──────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getAdminSupportStats();
      if (res?.success && res.data) {
        setStats(res.data);
      } else {
        setStatsError('Failed to load stats');
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load stats';
      setStatsError(msg);
      console.error('[AdminSupport] loadStats error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadTickets = useCallback(
    async (page = 1) => {
      setTicketsLoading(true);
      setTicketsError(null);
      try {
        const params: Record<string, unknown> = {
          page,
          limit: pagination.limit,
          sort,
        };
        if (statusFilter !== 'all') params.status = statusFilter;
        if (priorityFilter !== 'all') params.priority = priorityFilter;
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await getAdminTickets(
          params as Parameters<typeof getAdminTickets>[0]
        );
        if (res?.success && res.data) {
          setTickets(res.data.tickets || []);
          setPagination(
            res.data.pagination || { page, limit: 15, total: 0, totalPages: 0 }
          );
        } else {
          setTicketsError('Failed to load tickets');
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to load tickets';
        setTicketsError(msg);
        console.error('[AdminSupport] loadTickets error:', err);
      } finally {
        setTicketsLoading(false);
      }
    },
    [
      statusFilter,
      priorityFilter,
      categoryFilter,
      debouncedSearch,
      sort,
      pagination.limit,
    ]
  );

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadTickets(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, categoryFilter, debouncedSearch, sort]);

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Support Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage user support tickets and escalations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadStats();
            loadTickets(pagination.page);
          }}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Stats Cards ── */}
      {statsError && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Stats error: {statsError}</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tickets"
          value={stats?.byStatus?.total ?? '—'}
          icon={<Ticket className="h-5 w-5 text-indigo-500" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Open"
          value={
            (stats?.byStatus?.submitted ?? 0) +
            (stats?.byStatus?.in_progress ?? 0)
          }
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          loading={statsLoading}
          subtitle="submitted + in progress"
        />
        <StatsCard
          title="Resolved"
          value={stats?.byStatus?.resolved ?? '—'}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Urgent"
          value={stats?.openByPriority?.urgent ?? 0}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          loading={statsLoading}
        />
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="pl-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Ticket Table ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Tickets</CardTitle>
            <button
              onClick={() =>
                setSort((s) =>
                  s === '-createdAt' ? 'createdAt' : '-createdAt'
                )
              }
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sort === '-createdAt' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : ticketsError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="text-destructive mb-3 h-10 w-10" />
              <p className="text-destructive text-sm font-medium">
                Failed to load tickets
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {ticketsError}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => loadTickets(pagination.page)}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Ticket className="text-muted-foreground mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-medium">
                No tickets found
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-left text-xs">
                      <th className="pr-4 pb-2 font-medium">Ticket</th>
                      <th className="pr-4 pb-2 font-medium">User</th>
                      <th className="pr-4 pb-2 font-medium">Status</th>
                      <th className="pr-4 pb-2 font-medium">Priority</th>
                      <th className="pr-4 pb-2 font-medium">Category</th>
                      <th className="pr-4 pb-2 font-medium">Assigned</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tickets.map((ticket) => {
                      const sBadge =
                        statusBadge[ticket.status] || statusBadge.submitted;
                      const pBadge =
                        priorityBadge[ticket.priority] || priorityBadge.medium;
                      return (
                        <tr
                          key={ticket._id}
                          onClick={() =>
                            router.push(`/admin/support/${ticket.ticketId}`)
                          }
                          className="hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div>
                              <p className="line-clamp-1 font-medium">
                                {ticket.subject}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                #{ticket.ticketId}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {ticket.userId ? (
                              <div>
                                <p className="text-xs font-medium">
                                  {ticket.userId.fname} {ticket.userId.lname}
                                </p>
                                <p className="text-muted-foreground text-[10px]">
                                  {ticket.userId.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Unknown
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                                sBadge.color
                              )}
                            >
                              {sBadge.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                                pBadge.color
                              )}
                            >
                              {pBadge.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-muted-foreground text-xs capitalize">
                              {ticket.category}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-muted-foreground text-xs">
                              {ticket.assignedTo
                                ? `${ticket.assignedTo.fname} ${ticket.assignedTo.lname}`
                                : 'Unassigned'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-muted-foreground text-xs">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="space-y-2 md:hidden">
                {tickets.map((ticket) => {
                  const sBadge =
                    statusBadge[ticket.status] || statusBadge.submitted;
                  const pBadge =
                    priorityBadge[ticket.priority] || priorityBadge.medium;
                  return (
                    <button
                      key={ticket._id}
                      onClick={() =>
                        router.push(`/admin/support/${ticket.ticketId}`)
                      }
                      className="bg-card hover:bg-muted/50 w-full rounded-lg border p-3 text-left transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-medium">
                          {ticket.subject}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            sBadge.color
                          )}
                        >
                          {sBadge.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground">
                          #{ticket.ticketId}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 font-medium',
                            pBadge.color
                          )}
                        >
                          {pBadge.label}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={pagination.page <= 1}
                      onClick={() => loadTickets(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => loadTickets(pagination.page + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stats Card sub-component ────────────────────────────────────────
function StatsCard({
  title,
  value,
  icon,
  loading,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="bg-muted rounded-lg p-2.5">{icon}</div>
        <div>
          {loading ? (
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          <p className="text-muted-foreground text-xs font-medium">{title}</p>
          {subtitle && (
            <p className="text-muted-foreground text-[10px]">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
