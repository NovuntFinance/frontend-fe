/**
 * Notification Store
 * Manages in-app notifications and push notification state
 */

import { create } from 'zustand';
import type {
  Notification,
  NotificationFilters,
  PaginationInfo,
} from '@/types/notification';
import * as notificationApi from '@/services/notificationApi';

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
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;

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

  // Actions
  fetchNotifications: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationApi.getNotifications(filters);
      if (response.success) {
        set({
          notifications: response.data,
          pagination: response.pagination,
          unreadCount: response.unreadCount,
        });
      }
    } catch (error) {
      set({ error: notificationApi.handleNotificationError(error) });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  loadMore: async () => {
    const { pagination, notifications, loading } = get();
    if (loading || !pagination || pagination.page >= pagination.pages) return;

    set({ loading: true });
    try {
      const response = await notificationApi.getNotifications({
        page: pagination.page + 1,
        limit: pagination.limit,
      });

      if (response.success) {
        set({
          notifications: [...notifications, ...response.data],
          pagination: response.pagination,
          unreadCount: response.unreadCount,
        });
      }
    } catch (error) {
      set({ error: notificationApi.handleNotificationError(error) });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      await notificationApi.markAsRead(notificationId);
    } catch (error) {
      // Revert on failure (could be improved)
      console.error('Failed to mark as read:', error);
      // Ideally we would revert the state here, but for now we just log
    }
  },

  markAllAsRead: async () => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      // Optimistic update
      set((state) => {
        const notification = state.notifications.find(
          (n) => n.notificationId === notificationId
        );
        const wasUnread = notification && !notification.isRead;
        return {
          notifications: state.notifications.filter(
            (n) => n.notificationId !== notificationId
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });

      await notificationApi.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearError: () => set({ error: null }),

  // Push notifications
  setPushEnabled: (enabled) => {
    set({ pushEnabled: enabled });
  },

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
