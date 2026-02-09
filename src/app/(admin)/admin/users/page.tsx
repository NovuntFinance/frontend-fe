'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminUser } from '@/types/admin';
import { ShimmerCard } from '@/components/ui/shimmer';
import { useAdminUsers } from '@/lib/queries';
import {
  useChangeUserRole,
  useDeleteUser,
  useForceLogoutUser,
  useUpdateUserStatus,
} from '@/lib/mutations';
import { AddUserModal } from '@/components/admin/AddUserModal';
import { AddAdminModal } from '@/components/admin/AddAdminModal';
import { RankBadge } from '@/components/admin/RankBadge';
import { adminAuthService } from '@/services/adminAuthService';
import { usePermissions } from '@/hooks/usePermissions';
import { CriticalActionDialog } from '@/components/dialogs/CriticalActionDialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    | 'all'
    | 'user'
    | 'support_agent'
    | 'support_lead'
    | 'finance'
    | 'risk'
    | 'operations'
    | 'admin'
    | 'superAdmin'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'active' | 'suspended' | 'inactive'
  >('all');
  const [sortBy, setSortBy] = useState<
    | 'createdAt'
    | 'lastLoginAt'
    | 'totalStaked'
    | 'totalDeposited'
    | 'totalWithdrawn'
    | 'walletFundedBalance'
    | 'walletEarningsBalance'
  >('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Check if current admin is super admin
  const currentAdmin = adminAuthService.getCurrentAdmin();
  const isSuperAdmin = currentAdmin?.role === 'superAdmin';

  const { hasPermission } = usePermissions();
  const canExport = hasPermission('reports.export');
  const canSuspend = hasPermission('users.suspend');
  const canDelete = hasPermission('users.delete');
  const canRoleChange = hasPermission('users.roleChange');
  const canForceLogout = hasPermission('users.forceLogout');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from API
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useAdminUsers({
    page: currentPage,
    limit: 20,
    search: debouncedSearchQuery || undefined,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    sortBy,
    sortOrder: sortDirection,
  });

  // Update user status mutation
  const updateUserStatus = useUpdateUserStatus();
  const forceLogoutUser = useForceLogoutUser();
  const changeUserRole = useChangeUserRole();
  const deleteUser = useDeleteUser();

  type UserActionType = 'status' | 'forceLogout' | 'role' | 'delete';
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<UserActionType>('status');
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionStatus, setActionStatus] = useState<
    'active' | 'suspended' | 'inactive'
  >('suspended');
  const [actionRole, setActionRole] = useState<string>('user');
  const [deleteMode, setDeleteMode] = useState<'anonymize' | 'hard'>(
    'anonymize'
  );

  const openAction = (
    type: UserActionType,
    user: AdminUser,
    opts?: { roleOverride?: string }
  ) => {
    setActionType(type);
    setActionUser(user);
    setActionReason('');

    if (type === 'status') {
      const current = user.status;
      const next =
        current === 'active'
          ? 'suspended'
          : current === 'suspended'
            ? 'active'
            : 'active';
      setActionStatus(next as 'active' | 'suspended' | 'inactive');
    }
    if (type === 'role') {
      setActionRole(opts?.roleOverride ?? user.role ?? 'user');
    }
    if (type === 'delete') {
      setDeleteMode('anonymize');
    }

    setActionOpen(true);
  };

  const confirmAction = async () => {
    if (!actionUser) return;
    if (!actionReason.trim()) return;

    if (actionType === 'status') {
      updateUserStatus.mutate({
        userId: actionUser.id,
        status: actionStatus,
        reason: actionReason.trim(),
      });
      return;
    }

    if (actionType === 'forceLogout') {
      forceLogoutUser.mutate({
        userId: actionUser.id,
        reason: actionReason.trim(),
      });
      return;
    }

    if (actionType === 'role') {
      changeUserRole.mutate({
        userId: actionUser.id,
        role: actionRole,
        reason: actionReason.trim(),
      });
      return;
    }

    if (actionType === 'delete') {
      deleteUser.mutate({
        userId: actionUser.id,
        reason: actionReason.trim(),
        mode: deleteMode,
      });
    }
  };

  const users: AdminUser[] =
    usersData?.data?.users ||
    usersData?.users ||
    usersData?.data?.data?.users ||
    [];
  const pagination = useMemo(() => {
    const paginationData =
      usersData?.data?.pagination ||
      usersData?.pagination ||
      usersData?.data?.data?.pagination;
    return {
      page: paginationData?.page ?? 1,
      limit: paginationData?.limit ?? 20,
      total: paginationData?.total ?? 0,
      totalPages: paginationData?.totalPages ?? 0,
    };
  }, [usersData]);

  // Handle sort click
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortDirection('desc');
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';

    switch (status) {
      case 'active':
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-400';
        break;
      case 'suspended':
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-400';
        break;
      case 'pending':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-400';
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

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    let bgColor = '';
    let textColor = '';

    switch (role) {
      case 'superAdmin':
        bgColor = 'bg-purple-100 dark:bg-purple-900/30';
        textColor = 'text-purple-800 dark:text-purple-300';
        break;
      case 'admin':
        bgColor = 'bg-purple-100 dark:bg-purple-900/30';
        textColor = 'text-purple-800 dark:text-purple-400';
        break;
      case 'support_agent':
      case 'support_lead':
        bgColor = 'bg-indigo-100 dark:bg-indigo-900/30';
        textColor = 'text-indigo-800 dark:text-indigo-300';
        break;
      case 'finance':
        bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
        textColor = 'text-emerald-800 dark:text-emerald-300';
        break;
      case 'risk':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-300';
        break;
      case 'operations':
        bgColor = 'bg-sky-100 dark:bg-sky-900/30';
        textColor = 'text-sky-800 dark:text-sky-300';
        break;
      case 'user':
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
        textColor = 'text-blue-800 dark:text-blue-400';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-700';
        textColor = 'text-gray-800 dark:text-gray-300';
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          User Management
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canExport}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => {
              // Export current page results as CSV
              const rows = users.map((u) => {
                const s = u.stats;
                return {
                  id: u.id,
                  fullName: u.fullName,
                  email: u.email,
                  phoneNumber: u.phoneNumber ?? '',
                  role: u.role,
                  status: u.status,
                  rank: u.rank ?? '',
                  createdAt: u.createdAt,
                  lastLoginAt: u.lastLoginAt ?? '',
                  fundedBalance: u.wallets?.funded?.balance ?? '',
                  earningsBalance: u.wallets?.earnings?.balance ?? '',
                  activeStakesCount:
                    s?.activeStakesCount ?? u.activeStakes ?? '',
                  totalStaked: s?.totalStaked ?? u.totalInvested ?? '',
                  totalDeposited: s?.totalDeposited ?? '',
                  totalWithdrawn: s?.totalWithdrawn ?? '',
                  totalEarned: s?.totalEarned ?? u.totalEarned ?? '',
                };
              });

              const header = Object.keys(rows[0] || {}).join(',');
              const csv = [
                header,
                ...rows.map((r) =>
                  Object.values(r)
                    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                    .join(',')
                ),
              ].join('\n');

              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `novunt-admin-users-page-${currentPage}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
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
            Export CSV
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Admin
            </button>
          )}
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add User
          </button>
        </div>
      </div>

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
              placeholder="Search by name, email, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by role"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(
                  e.target.value as
                    | 'all'
                    | 'user'
                    | 'support_agent'
                    | 'support_lead'
                    | 'finance'
                    | 'risk'
                    | 'operations'
                    | 'admin'
                    | 'superAdmin'
                )
              }
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="support_agent">Support Agent</option>
              <option value="support_lead">Support Lead</option>
              <option value="finance">Finance</option>
              <option value="risk">Risk</option>
              <option value="operations">Operations</option>
              <option value="admin">Admin</option>
              {isSuperAdmin && <option value="superAdmin">Super Admin</option>}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              aria-label="Filter by status"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as 'all' | 'active' | 'suspended' | 'inactive'
                )
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} users found
          </p>
          <button
            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={() => {
              setSearchQuery('');
              setSelectedRole('all');
              setSelectedStatus('all');
              setCurrentPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Users Table */}
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
                  <span>User</span>
                  {sortBy === 'createdAt' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortDirection === 'asc' ? (
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
                  onClick={() => handleSort('lastLoginAt')}
                >
                  <span>Email</span>
                  {sortBy === 'lastLoginAt' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortDirection === 'asc' ? (
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
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <div
                  className="flex cursor-pointer items-center"
                  onClick={() => handleSort('walletFundedBalance')}
                >
                  <span>Rank</span>
                  {sortBy === 'walletFundedBalance' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortDirection === 'asc' ? (
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
                  onClick={() => handleSort('totalStaked')}
                >
                  <span>Staked</span>
                  {sortBy === 'totalStaked' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortDirection === 'asc' ? (
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
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <div
                  className="flex cursor-pointer items-center"
                  onClick={() => handleSort('createdAt')}
                >
                  <span>Join Date</span>
                  {sortBy === 'createdAt' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortDirection === 'asc' ? (
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
                  <tr key={i}>
                    <td colSpan={9} className="px-6 py-4">
                      <ShimmerCard className="h-12 w-full" />
                    </td>
                  </tr>
                ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.avatar ? (
                          <Image
                            className="rounded-full"
                            src={user.avatar}
                            alt={`${user.fullName}'s avatar`}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {user.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.phoneNumber || 'No phone'}
                      {user.lastLoginAt ? (
                        <span className="ml-2 opacity-80">
                          • Last login:{' '}
                          {new Date(user.lastLoginAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RankBadge user={user} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      $
                      {(
                        user.stats?.totalStaked ??
                        user.totalInvested ??
                        0
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.stats?.activeStakesCount ?? user.activeStakes ?? 0}{' '}
                      active stake
                      {(user.stats?.activeStakesCount ??
                        user.activeStakes ??
                        0) !== 1
                        ? 's'
                        : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Actions
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
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage user</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {canSuspend && (
                            <DropdownMenuItem
                              onClick={() => openAction('status', user)}
                              variant={
                                user.status === 'active'
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {user.status === 'active'
                                ? 'Suspend'
                                : user.status === 'suspended'
                                  ? 'Activate'
                                  : 'Set Active'}
                            </DropdownMenuItem>
                          )}

                          {canForceLogout && (
                            <DropdownMenuItem
                              onClick={() => openAction('forceLogout', user)}
                              variant="default"
                            >
                              Force logout
                            </DropdownMenuItem>
                          )}

                          {canRoleChange && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                Change role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {[
                                  'user',
                                  'support_agent',
                                  'support_lead',
                                  'finance',
                                  'risk',
                                  'operations',
                                  'admin',
                                  ...(isSuperAdmin ? ['superAdmin'] : []),
                                ].map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    onClick={() => {
                                      openAction('role', user, {
                                        roleOverride: role,
                                      });
                                    }}
                                  >
                                    {role}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          )}

                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => openAction('delete', user)}
                              >
                                Delete…
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed to load users
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  {(() => {
                    const status = (error as { response?: { status?: number } })
                      ?.response?.status;
                    if (status === 429) {
                      return 'Too many requests. The server is temporarily limiting requests. Please wait a minute and try again.';
                    }
                    return error instanceof Error
                      ? error.message
                      : 'An error occurred while fetching users. Please try again.';
                  })()}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="text-sm font-medium text-red-800 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 ${
                    currentPage === 1
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

                {Array.from({
                  length: Math.min(5, pagination?.totalPages || 0),
                }).map((_, i) => {
                  // Show pages around current page
                  const pageToShow = Math.min(
                    Math.max(currentPage - 2 + i, 1),
                    pagination?.totalPages || 1
                  );

                  // Only show the page if it hasn't been shown yet
                  const hasShown = Array.from({ length: i }).some((_, j) => {
                    const prevPageToShow = Math.min(
                      Math.max(currentPage - 2 + j, 1),
                      pagination?.totalPages || 1
                    );
                    return prevPageToShow === pageToShow;
                  });

                  if (hasShown) {
                    return null;
                  }

                  return (
                    <button
                      key={pageToShow}
                      onClick={() => setCurrentPage(pageToShow)}
                      className={`relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 ${
                        currentPage === pageToShow
                          ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageToShow}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination?.totalPages || 1)
                    )
                  }
                  disabled={currentPage >= (pagination?.totalPages || 0)}
                  className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-800 ${
                    currentPage >= (pagination?.totalPages || 0)
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

      {/* Action confirmation dialog (reason required; 2FA handled automatically on write requests) */}
      <CriticalActionDialog
        open={actionOpen}
        onOpenChange={setActionOpen}
        type={actionType === 'delete' ? 'warning' : 'confirm'}
        title={
          actionType === 'status'
            ? `Confirm status change`
            : actionType === 'forceLogout'
              ? `Force logout user`
              : actionType === 'role'
                ? `Change user role`
                : `Delete user`
        }
        description={
          actionType === 'status'
            ? `You're about to set this user's status to "${actionStatus}". This action is audited and requires a reason.`
            : actionType === 'forceLogout'
              ? `You're about to revoke this user's sessions. This action is audited and requires a reason.`
              : actionType === 'role'
                ? `You're about to change this user's role to "${actionRole}". This action is audited and requires a reason.`
                : `You're about to delete this user (${deleteMode}). This action is audited, requires a reason, and requires 2FA.`
        }
        confirmText={
          actionType === 'delete'
            ? 'Delete'
            : actionType === 'forceLogout'
              ? 'Force logout'
              : actionType === 'role'
                ? 'Change role'
                : 'Confirm'
        }
        onConfirm={confirmAction}
        details={
          actionUser
            ? [
                { label: 'User', value: actionUser.fullName },
                { label: 'Email', value: actionUser.email },
                { label: 'ID', value: actionUser.id },
              ]
            : undefined
        }
      >
        <div className="space-y-3">
          {actionType === 'delete' && isSuperAdmin && (
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground">
                Delete mode (default is safe anonymize)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`rounded-md border px-3 py-2 ${
                    deleteMode === 'anonymize'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                  onClick={() => setDeleteMode('anonymize')}
                >
                  Anonymize (safe)
                </button>
                <button
                  type="button"
                  className={`rounded-md border px-3 py-2 ${
                    deleteMode === 'hard'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                  onClick={() => setDeleteMode('hard')}
                >
                  Hard delete
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 text-sm font-medium">Reason (required)</div>
            <Textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Explain why you are performing this action…"
              className="min-h-[90px]"
            />
            <div className="text-muted-foreground mt-2 text-xs">
              This will be stored in audit logs.
            </div>
          </div>
        </div>
      </CriticalActionDialog>

      {/* Modals */}
      <AddUserModal
        open={showAddUserModal}
        onOpenChange={(open) => {
          setShowAddUserModal(open);
          if (!open) refetch();
        }}
      />
      {isSuperAdmin && (
        <AddAdminModal
          open={showAddAdminModal}
          onOpenChange={(open) => {
            setShowAddAdminModal(open);
            if (!open) refetch();
          }}
        />
      )}
    </div>
  );
}
