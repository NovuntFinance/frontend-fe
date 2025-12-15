'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminUser } from '@/types/admin';
import { ShimmerCard } from '@/components/ui/shimmer';
import { useAdminUsers } from '@/lib/queries';
import { useUpdateUserStatus } from '@/lib/mutations';
import { AddUserModal } from '@/components/admin/AddUserModal';
import { AddAdminModal } from '@/components/admin/AddAdminModal';
import { RankBadge } from '@/components/admin/RankBadge';
import { adminAuthService } from '@/services/adminAuthService';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Check if current admin is super admin
  const currentAdmin = adminAuthService.getCurrentAdmin();
  const isSuperAdmin = currentAdmin?.role === 'superAdmin';

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
    limit: 10,
    search: debouncedSearchQuery || undefined,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });

  // Update user status mutation
  const updateUserStatus = useUpdateUserStatus();

  // Handle suspend/activate
  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateUserStatus.mutate({
      userId,
      status: newStatus as 'active' | 'suspended',
    });
  };

  const users: AdminUser[] = usersData?.users || usersData?.data?.users || [];
  const pagination = useMemo(() => {
    const paginationData = usersData?.pagination || usersData?.data?.pagination;
    return {
      page: paginationData?.page ?? 1,
      limit: paginationData?.limit ?? 10,
      total: paginationData?.total ?? 0,
      totalPages: paginationData?.totalPages ?? 0,
    };
  }, [usersData]);

  // Client-side sorting (API handles filtering and pagination)
  const sortedUsers = useMemo(() => {
    if (!users.length) return [];

    return [...users].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'date':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'staked':
          comparison = a.totalInvested - b.totalInvested;
          break;
        case 'rank':
          const rankA = a.rank || a.rankInfo?.currentRank || '';
          const rankB = b.rank || b.rankInfo?.currentRank || '';
          comparison = rankA.localeCompare(rankB);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [users, sortBy, sortDirection]);

  // Handle sort click
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
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
      case 'admin':
        bgColor = 'bg-purple-100 dark:bg-purple-900/30';
        textColor = 'text-purple-800 dark:text-purple-400';
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
          <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
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
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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
                  onClick={() => handleSort('name')}
                >
                  <span>User</span>
                  {sortBy === 'name' && (
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
                  onClick={() => handleSort('email')}
                >
                  <span>Email</span>
                  {sortBy === 'email' && (
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
                  onClick={() => handleSort('rank')}
                >
                  <span>Rank</span>
                  {sortBy === 'rank' && (
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
                  onClick={() => handleSort('staked')}
                >
                  <span>Staked</span>
                  {sortBy === 'staked' && (
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
                  onClick={() => handleSort('date')}
                >
                  <span>Join Date</span>
                  {sortBy === 'date' && (
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
            ) : sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
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
                      ${user.totalInvested.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.activeStakes || 0} active stake
                      {user.activeStakes !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        onClick={(e) => {
                          // Prevent navigation if user detail page doesn't exist yet
                          // Will be handled by the page itself
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleStatusChange(user.id, user.status)}
                        disabled={updateUserStatus.isPending}
                        className={`${user.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {updateUserStatus.isPending
                          ? 'Updating...'
                          : user.status === 'active'
                            ? 'Suspend'
                            : 'Activate'}
                      </button>
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
                  {error instanceof Error
                    ? error.message
                    : 'An error occurred while fetching users. Please try again.'}
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
