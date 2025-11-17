import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { AdminActivityItem } from '@/types/admin';

interface AdminRecentActivityProps {
  activities?: AdminActivityItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

const AdminRecentActivity = ({ activities, isLoading = false, onViewAll }: AdminRecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_user':
      case 'registration':
        return (
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'withdrawal':
      case 'payout':
        return (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        );
      case 'stake':
      case 'investment':
        return (
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case 'kyc':
      case 'verification':
        return (
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case 'deposit':
      case 'funding':
        return (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        );
      case 'login':
      case 'session':
        return (
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const renderTimeLabel = (activity: AdminActivityItem) => {
    if (activity.relativeTime) return activity.relativeTime;
    if (activity.createdAt) {
      const parsed = parseISO(activity.createdAt);
      if (isValid(parsed)) {
        return formatDistanceToNow(parsed, { addSuffix: true });
      }
    }
    return 'Just now';
  };

  const renderDetail = (activity: AdminActivityItem) => {
    if (activity.description) return activity.description;
    if (activity.amount) {
      const currency = activity.currency ?? 'USD';
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: activity.amount < 1000 ? 2 : 0,
      }).format(activity.amount);
      return formatted;
    }
    if (activity.metadata?.email && typeof activity.metadata.email === 'string') {
      return activity.metadata.email;
    }
    return activity.metadata?.details && typeof activity.metadata.details === 'string'
      ? activity.metadata.details
      : undefined;
  };

  if (isLoading && (!activities || activities.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse w-3/5" />
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse w-2/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-200 dark:border-gray-700">
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    );
  }

  const hasActivities = activities && activities.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        <button
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-60"
          type="button"
          onClick={onViewAll}
          disabled={!hasActivities}
        >
          View all
        </button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {hasActivities ? (
          activities.map((activity) => {
            const detail = renderDetail(activity);
            return (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex">
                {getActivityIcon(activity.type)}
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  {detail && <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{renderTimeLabel(activity)}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400 text-center">No recent activity to display.</div>
        )}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-200 dark:border-gray-700">
        <button
          className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-60"
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