/**
 * NotificationList Component
 * Displays a list of notifications with infinite scroll
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import type { NotificationFilters, Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  filters?: NotificationFilters;
  onNotificationClick?: (notification: Notification) => void;
  maxHeight?: string;
  showHeader?: boolean;
  className?: string;
}

export function NotificationList({
  filters = {},
  onNotificationClick,
  maxHeight = '600px',
  showHeader = true,
  className,
}: NotificationListProps) {
  const router = useRouter();
  const {
    notifications = [],
    unreadCount = 0,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    hasMore,
  } = useNotifications({ filters });

  // Log what the component receives
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationList] === COMPONENT RENDER ===');
      console.log('[NotificationList] Filters:', filters);
      console.log(
        '[NotificationList] notifications length:',
        notifications?.length || 0
      );
      console.log('[NotificationList] notifications:', notifications);
      console.log('[NotificationList] unreadCount:', unreadCount);
      console.log('[NotificationList] loading:', loading);
      console.log('[NotificationList] error:', error);
      if (notifications && notifications.length > 0) {
        console.log('[NotificationList] First notification:', notifications[0]);
      } else {
        console.warn('[NotificationList] ⚠️ No notifications received!');
      }
    }
  }, [notifications, unreadCount, loading, error, filters]);

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.metadata?.ctaUrl) {
      router.push(notification.metadata.ctaUrl);
    }
  };

  if (loading && (!notifications || notifications.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingStates.Inline />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <UserFriendlyError
          error={new Error(error)}
          variant="inline"
        />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <EmptyStates.EmptyState
        title="No notifications yet"
        description="You'll see notifications about your account activity here"
      />
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      {showHeader && unreadCount > 0 && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 text-xs"
          >
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notification List */}
      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-2 p-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.notificationId}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              onClick={handleNotificationClick}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center p-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
