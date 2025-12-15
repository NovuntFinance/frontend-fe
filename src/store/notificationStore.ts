/**
 * Notification Store
 * Manages in-app notifications with API integration
 */

import { create } from 'zustand';
import {
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
  handleNotificationError,
} from '@/services/notificationApi';
import type {
  Notification,
  NotificationFilters,
  PaginationInfo,
  GetNotificationsResponse,
} from '@/types/notification';

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  pushEnabled: boolean;

  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Push notifications
  setPushEnabled: (enabled: boolean) => void;
  requestPushPermission: () => Promise<boolean>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  pagination: null,
  loading: false,
  error: null,
  pushEnabled: false,

  // Fetch notifications from API
  fetchNotifications: async (filters: NotificationFilters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getNotifications(filters);

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[notificationStore] === PROCESSING RESPONSE ===');
        console.log('[notificationStore] Response type:', typeof response);
        console.log('[notificationStore] Is array?:', Array.isArray(response));
        console.log('[notificationStore] Response:', response);
      }

      // Handle both array response (API client unwraps data) and object response
      if (Array.isArray(response)) {
        // API returned unwrapped array of notifications
        const notifications = response as Notification[];
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[notificationStore] ✅ Array detected, notifications count:',
            notifications.length
          );
          console.log(
            '[notificationStore] Notification types:',
            notifications.map((n) => n.type)
          );
          if (notifications.length > 0) {
            console.log(
              '[notificationStore] First notification:',
              notifications[0]
            );
          }
        }
        set({
          notifications,
          pagination: null, // Pagination info not available in unwrapped response
          unreadCount: notifications.filter((n) => !n.isRead).length,
          loading: false,
        });
      } else {
        // API returned wrapped object response (GetNotificationsResponse)
        const responseObj = response as GetNotificationsResponse;
        const notifications = responseObj.data || [];
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[notificationStore] Object response, data count:',
            notifications.length
          );
        }
        set({
          notifications,
          pagination: responseObj.pagination || null,
          unreadCount: responseObj.unreadCount || 0,
          loading: false,
        });
      }
    } catch (err) {
      const errorMessage = handleNotificationError(err);
      set({ error: errorMessage, loading: false });
      console.error('[notificationStore.fetchNotifications] Error:', err);
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadCount();
      set({ unreadCount: count });
    } catch (err: any) {
      // getUnreadCount now handles errors internally and returns 0
      // Only log if it's not a network error (to avoid console spam)
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.toLowerCase().includes('network error') ||
        !err?.response;

      if (!isNetworkError && process.env.NODE_ENV === 'development') {
        console.error('[notificationStore.fetchUnreadCount] Error:', err);
      }

      // Set unreadCount to 0 on error to prevent UI issues
      set({ unreadCount: 0 });
    }
  },

  // Mark notification as read (API call + state update)
  markAsRead: async (notificationId: string) => {
    try {
      await markAsReadApi(notificationId);
      // Update local state
      set((state) => {
        // Support both _id (MongoDB) and notificationId (UUID) for compatibility
        const notification = state.notifications.find(
          (n) => n._id === notificationId || n.notificationId === notificationId
        );
        if (!notification || notification.isRead) {
          return state;
        }

        const updatedNotifications = state.notifications.map((n) =>
          n._id === notificationId || n.notificationId === notificationId
            ? { ...n, isRead: true }
            : n
        );

        return {
          notifications: updatedNotifications,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
    } catch (err) {
      const errorMessage = handleNotificationError(err);
      set({ error: errorMessage });
      throw err;
    }
  },

  // Mark all notifications as read (API call + state update)
  markAllAsRead: async () => {
    try {
      await markAllAsReadApi();
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      const errorMessage = handleNotificationError(err);
      set({ error: errorMessage });
      throw err;
    }
  },

  // Delete notification (API call + state update)
  deleteNotification: async (notificationId: string) => {
    try {
      await deleteNotificationApi(notificationId);
      // Update local state
      set((state) => {
        // Support both _id (MongoDB) and notificationId (UUID) for compatibility
        const notification = state.notifications.find(
          (n) => n._id === notificationId || n.notificationId === notificationId
        );
        const wasUnread = notification && !notification.isRead;

        return {
          notifications: state.notifications.filter(
            (n) =>
              n._id !== notificationId && n.notificationId !== notificationId
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (err) {
      const errorMessage = handleNotificationError(err);
      set({ error: errorMessage });
      throw err;
    }
  },

  // Load more notifications (pagination)
  loadMore: async () => {
    const { pagination, notifications } = get();
    if (!pagination || pagination.page >= pagination.pages) {
      return; // No more pages
    }

    set({ loading: true });
    try {
      const nextPage = pagination.page + 1;
      const response = await getNotifications({ page: nextPage });

      // Handle both array response (API client unwraps data) and object response
      if (Array.isArray(response)) {
        // API returned unwrapped array of notifications
        const newNotifications = response as Notification[];
        set({
          notifications: [...notifications, ...newNotifications],
          pagination: null, // Pagination info not available in unwrapped response
          loading: false,
        });
      } else {
        // API returned wrapped object response
        const responseObj = response as GetNotificationsResponse;
        set({
          notifications: [...notifications, ...(responseObj.data || [])],
          pagination: responseObj.pagination || null,
          unreadCount: responseObj.unreadCount || get().unreadCount,
          loading: false,
        });
      }
    } catch (err) {
      const errorMessage = handleNotificationError(err);
      set({ error: errorMessage, loading: false });
      console.error('[notificationStore.loadMore] Error:', err);
    }
  },

  // Add notification (for real-time updates)
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead
        ? state.unreadCount
        : state.unreadCount + 1,
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set loading state
  setLoading: (loading: boolean) => set({ loading }),

  // Set error state
  setError: (error: string | null) => set({ error }),

  // Set push notification enabled state
  setPushEnabled: (enabled: boolean) => set({ pushEnabled: enabled }),

  // Request push notification permission
  requestPushPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      set({ pushEnabled: true });
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      set({ pushEnabled: granted });
      return granted;
    }

    return false;
  },
}));
