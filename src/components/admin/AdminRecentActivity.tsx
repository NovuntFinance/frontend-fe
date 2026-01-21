import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { AdminActivityItem, AdminUiRecentActivityItem } from '@/types/admin';
import { useAuthStore } from '@/store/authStore';
import { ShimmerCard } from '@/components/ui/shimmer';

interface AdminRecentActivityProps {
  activities?: Array<AdminActivityItem | AdminUiRecentActivityItem>;
  isLoading?: boolean;
  onViewAll?: () => void;
}

const AdminRecentActivity = ({
  activities,
  isLoading = false,
  onViewAll,
}: AdminRecentActivityProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // If user is not admin, don't show anything (security/UX)
  if (!isAdmin) {
    return null;
  }

  const getDisplayName = (
    activity: AdminActivityItem | AdminUiRecentActivityItem
  ) => {
    const maybeUser = (activity as AdminUiRecentActivityItem).user;
    return (
      maybeUser?.maskedName ||
      maybeUser?.name ||
      (activity as any)?.metadata?.maskedName ||
      (activity as any)?.metadata?.name ||
      'Anonymous'
    );
  };

  const humanizeType = (type: string) => {
    if (!type) return 'Activity';
    return type
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_user':
      case 'registration':
        return (
          <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        );
      case 'withdrawal':
      case 'payout':
        return (
          <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
        );
      case 'stake':
      case 'investment':
        return (
          <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        );
      case 'deposit':
      case 'funding':
        return (
          <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        );
      case 'login':
      case 'session':
        return (
          <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const renderTimeLabel = (
    activity: AdminActivityItem | AdminUiRecentActivityItem
  ) => {
    const anyActivity = activity as unknown as
      | AdminActivityItem
      | AdminUiRecentActivityItem;

    if ((anyActivity as AdminActivityItem).relativeTime) {
      return (anyActivity as AdminActivityItem).relativeTime as string;
    }

    const createdAt =
      (anyActivity as AdminActivityItem).createdAt ||
      (anyActivity as AdminUiRecentActivityItem).timestamp;

    if (createdAt) {
      const parsed = parseISO(createdAt);
      if (isValid(parsed)) {
        return formatDistanceToNow(parsed, { addSuffix: true });
      }
    }
    return 'Just now';
  };

  const renderDetail = (
    activity: AdminActivityItem | AdminUiRecentActivityItem
  ) => {
    const anyActivity = activity as any;
    if (anyActivity.description) return anyActivity.description as string;

    const amount =
      typeof anyActivity.amount === 'number'
        ? (anyActivity.amount as number)
        : undefined;

    const status =
      typeof anyActivity.status === 'string'
        ? (anyActivity.status as string)
        : undefined;

    if (amount !== undefined) {
      const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: amount < 1000 ? 2 : 0,
      }).format(amount);
      return status ? `${formatted} USDT • ${status}` : `${formatted} USDT`;
    }

    if (status) return status;

    if (
      anyActivity.metadata?.email &&
      typeof anyActivity.metadata.email === 'string'
    ) {
      return anyActivity.metadata.email as string;
    }

    return anyActivity.metadata?.details &&
      typeof anyActivity.metadata.details === 'string'
      ? (anyActivity.metadata.details as string)
      : undefined;
  };

  if (isLoading && (!activities || activities.length === 0)) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Live Platform Activity
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <ShimmerCard key={index} className="h-16" />
          ))}
        </div>
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
          <ShimmerCard className="h-3" />
        </div>
      </div>
    );
  }

  const hasActivities = activities && activities.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Live Platform Activity
        </h3>
        <button
          className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-60 dark:text-indigo-400 dark:hover:text-indigo-300"
          type="button"
          onClick={onViewAll}
          disabled={!hasActivities}
        >
          View all
        </button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {hasActivities ? (
          activities.map((activity, index) => {
            const detail = renderDetail(activity);
            const displayType = (activity as any).type as string;
            const displayTitle =
              typeof (activity as any).title === 'string'
                ? ((activity as any).title as string)
                : `${getDisplayName(activity)} • ${humanizeType(displayType)}`;

            return (
              <div
                key={
                  (activity as any).id ||
                  `${(activity as any).timestamp || (activity as any).createdAt || 'activity'}-${index}`
                }
                className="flex p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {getActivityIcon(displayType)}
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayTitle}
                  </p>
                  {detail && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {detail}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {renderTimeLabel(activity)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No recent activity to display.
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
        <button
          className="w-full text-center text-sm text-gray-600 hover:text-indigo-600 disabled:opacity-60 dark:text-gray-400 dark:hover:text-indigo-400"
          type="button"
          disabled={!hasActivities}
        >
          Load more
        </button>
      </div>
    </div>
  );
};

export default AdminRecentActivity;
