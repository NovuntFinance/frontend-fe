'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { AdminUser } from '@/types/admin';
import { ShimmerCard } from '@/components/ui/shimmer';
import { RankBadge } from '@/components/admin/RankBadge';
import { toast } from 'sonner';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminService.getUserById(userId);
        const userData =
          response.data?.user || response.user || response.data || response;
        setUser(userData);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        const status = err?.response?.status;
        const errorCode = err?.response?.data?.error?.code;
        const errorMessage =
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to load user';

        // Handle different error cases
        if (status === 404) {
          if (errorCode === 'ROUTE_NOT_FOUND') {
            // Endpoint doesn't exist (shouldn't happen now, but keep for safety)
            setError(
              'User detail endpoint not available. The backend needs to implement GET /api/v1/admin/users/:userId'
            );
            toast.error('User detail endpoint not implemented on backend', {
              description:
                'Please contact the backend team to implement this endpoint.',
              duration: 5000,
            });
          } else if (errorCode === 'USER_NOT_FOUND') {
            // User doesn't exist
            setError('User not found');
            toast.error('User not found', {
              description: 'The user you are looking for does not exist.',
            });
          } else {
            // Generic 404
            setError(errorMessage || 'User not found');
            toast.error(errorMessage || 'User not found');
          }
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }

        // Redirect back to users list after 3 seconds
        setTimeout(() => {
          router.push('/admin/users');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            User Details
          </h2>
          <button
            onClick={() => router.push('/admin/users')}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to Users
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <ShimmerCard className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            User Details
          </h2>
          <button
            onClick={() => router.push('/admin/users')}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to Users
          </button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
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
                {error?.includes('endpoint not available')
                  ? 'Backend Endpoint Missing'
                  : 'Error Loading User'}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error || 'User not found'}</p>
                {error?.includes('endpoint not available') && (
                  <div className="mt-3 rounded-md bg-red-100 p-3 dark:bg-red-900/30">
                    <p className="text-xs font-medium">
                      Required Backend Endpoint:
                    </p>
                    <code className="mt-1 block text-xs">
                      GET /api/v1/admin/users/:userId
                    </code>
                    <p className="mt-2 text-xs">
                      See{' '}
                      <strong>
                        BACKEND_USER_DETAIL_ENDPOINT_IMPLEMENTATION.md
                      </strong>{' '}
                      for implementation details.
                    </p>
                  </div>
                )}
                {error === 'User not found' && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    The user ID may be invalid or the user may have been
                    deleted.
                  </p>
                )}
              </div>
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                Redirecting back to users list in a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          User Details
        </h2>
        <button
          onClick={() => router.push('/admin/users')}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to Users
        </button>
      </div>

      {/* User Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Basic Information
          </h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Full Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.fullName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.phoneNumber || 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                User ID
              </dt>
              <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </dt>
              <dd className="mt-1">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {user.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {user.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Join Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Login
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : 'Never'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Rank Information */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Rank Information
          </h3>
        </div>
        <div className="px-6 py-4">
          <RankBadge user={user} />
          {user.rankInfo &&
            (() => {
              const currentRank =
                user.rank || user.rankInfo?.currentRank || 'Stakeholder';
              const isStakeholder = currentRank === 'Stakeholder';
              // Stakeholders can NEVER qualify for premium or performance pools
              const performancePoolQualified = isStakeholder
                ? false
                : (user.rankInfo.performancePoolQualified ?? false);
              const premiumPoolQualified = isStakeholder
                ? false
                : (user.rankInfo.premiumPoolQualified ?? false);

              return (
                <div className="mt-4 space-y-2">
                  {performancePoolQualified && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500">●</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Performance Pool Qualified
                      </span>
                    </div>
                  )}
                  {premiumPoolQualified && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">●</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Premium Pool Qualified
                      </span>
                    </div>
                  )}
                  {isStakeholder && (
                    <div className="text-muted-foreground text-xs italic">
                      Note: Stakeholders are not eligible for pool
                      qualifications. Qualification starts from Associate
                      Stakeholder.
                    </div>
                  )}
                  {user.rankInfo.nxp && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-purple-500">★</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        NXP: {user.rankInfo.nxp.totalNXP.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      </div>

      {/* Financial Information */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Financial Information
          </h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Staked
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${user.totalInvested.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Earned
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${(user.totalEarned || 0).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Stakes
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.activeStakes || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Referrals
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.totalReferrals || 0}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
