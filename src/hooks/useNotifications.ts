/**
 * useNotifications Hook
 * Custom React hooks for managing notifications
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import type { NotificationFilters, Notification } from '@/types/notification';

interface UseNotificationsOptions {
  filters?: NotificationFilters;
  pollInterval?: number; // milliseconds, 0 to disable
  onNewNotification?: (notification: Notification) => void;
}

/**
 * Main hook for managing notifications with full features
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    filters = {},
    pollInterval = 30000, // 30 seconds default
    onNewNotification,
  } = options;

  const {
    notifications = [],
    unreadCount = 0,
    pagination,
    loading = false,
    error = null,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    clearError,
  } = useNotificationStore();

  const previousNotificationIds = useRef<Set<string>>(new Set());

  // Initial fetch
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useNotifications] === INITIAL FETCH ===');
      console.log('[useNotifications] Filters:', filters);
    }
    fetchNotifications(filters);
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling for updates
  useEffect(() => {
    if (pollInterval === 0) return;

    const intervalId = setInterval(() => {
      fetchNotifications(filters);
      fetchUnreadCount();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollInterval, JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect new notifications
  useEffect(() => {
    if (!onNewNotification) return;

    // Initialize on first load
    if (previousNotificationIds.current.size === 0) {
      notifications.forEach((n) =>
        previousNotificationIds.current.add(n.notificationId)
      );
      return;
    }

    // Check for new notifications
    const newNotifications = notifications.filter(
      (n) => !previousNotificationIds.current.has(n.notificationId)
    );

    if (newNotifications.length > 0) {
      newNotifications.forEach(onNewNotification);
    }

    // Update set
    previousNotificationIds.current = new Set(
      notifications.map((n) => n.notificationId)
    );
  }, [notifications, onNewNotification]);

  const refetch = useCallback(async () => {
    await fetchNotifications(filters);
    await fetchUnreadCount();
  }, [filters, fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      console.log('[useNotifications.handleMarkAsRead] === CALLED ===');
      console.log(
        '[useNotifications.handleMarkAsRead] Notification ID:',
        notificationId
      );

      try {
        console.log(
          '[useNotifications.handleMarkAsRead] 📤 Calling markAsRead from store...'
        );
        await markAsRead(notificationId);
        console.log(
          '[useNotifications.handleMarkAsRead] ✅ Successfully marked as read'
        );
      } catch (err: unknown) {
        console.error('[useNotifications.handleMarkAsRead] ❌ ERROR');
        if (err instanceof Error) {
          console.error('[useNotifications.handleMarkAsRead] Error:', err);
          console.error(
            '[useNotifications.handleMarkAsRead] Error message:',
            err.message
          );
        }
        if (typeof err === 'object' && err !== null) {
          const errorDetails = err as {
            success?: boolean;
            message?: string;
            statusCode?: number;
            code?: string;
            response?: unknown;
          };
          console.error('[useNotifications.handleMarkAsRead] Error details:', {
            success: errorDetails.success,
            message: errorDetails.message,
            statusCode: errorDetails.statusCode,
            code: errorDetails.code,
            response: errorDetails.response,
          });
        }
        // Re-throw so the UI can handle it
        throw err;
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [markAllAsRead]);

  const handleDelete = useCallback(
    async (notificationId: string) => {
      try {
        await deleteNotification(notificationId);
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    },
    [deleteNotification]
  );

  // Log notifications when they change
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useNotifications] === NOTIFICATIONS STATE ===');
      console.log(
        '[useNotifications] notifications length:',
        notifications?.length || 0
      );
      console.log('[useNotifications] notifications:', notifications);
      console.log('[useNotifications] unreadCount:', unreadCount);
      console.log('[useNotifications] loading:', loading);
      console.log('[useNotifications] error:', error);
      console.log('[useNotifications] pagination:', pagination);
      if (notifications && notifications.length > 0) {
        console.log('[useNotifications] First notification:', notifications[0]);
      }
    }
  }, [notifications, unreadCount, loading, error, pagination]);

  return {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    refetch,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    loadMore,
    clearError,
    hasMore: pagination ? pagination.page < pagination.pages : false,
  };
}

/**
 * Lightweight hook for unread count only (for badge display)
 */
export function useUnreadCount(pollInterval = 30000) {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    if (pollInterval === 0) return;

    // Poll for updates
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollInterval, fetchUnreadCount]);

  return { unreadCount };
}

/**
 * Hook for notification polling with custom callback
 */
export function useNotificationPolling(
  callback: () => void | Promise<void>,
  interval = 30000
) {
  useEffect(() => {
    if (interval === 0) return;

    const intervalId = setInterval(() => {
      callback();
    }, interval);

    return () => clearInterval(intervalId);
  }, [callback, interval]);
}
