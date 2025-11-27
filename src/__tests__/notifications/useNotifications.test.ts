/**
 * useNotifications Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications, useUnreadCount } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/notificationStore';

// Mock the notification store
jest.mock('@/store/notificationStore');
const mockUseNotificationStore = useNotificationStore as jest.MockedFunction<
  typeof useNotificationStore
>;

describe('useNotifications', () => {
  const mockFetchNotifications = jest.fn();
  const mockFetchUnreadCount = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockMarkAllAsRead = jest.fn();
  const mockDeleteNotification = jest.fn();
  const mockLoadMore = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseNotificationStore.mockReturnValue(
      buildStoreValue({
        fetchNotifications: mockFetchNotifications,
        fetchUnreadCount: mockFetchUnreadCount,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
        deleteNotification: mockDeleteNotification,
        loadMore: mockLoadMore,
        clearError: mockClearError,
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches notifications on mount', () => {
    renderHook(() => useNotifications());

    expect(mockFetchNotifications).toHaveBeenCalledWith({});
  });

  it('fetches notifications with filters', () => {
    const filters = { type: 'deposit' as const, unreadOnly: true };

    renderHook(() => useNotifications({ filters }));

    expect(mockFetchNotifications).toHaveBeenCalledWith(filters);
  });

  it('polls for updates at specified interval', async () => {
    renderHook(() => useNotifications({ pollInterval: 5000 }));

    // Initial call
    expect(mockFetchNotifications).toHaveBeenCalledTimes(1);

    // Fast forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockFetchNotifications).toHaveBeenCalledTimes(2);
    });

    // Fast forward another 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockFetchNotifications).toHaveBeenCalledTimes(3);
    });
  });

  it('disables polling when pollInterval is 0', () => {
    renderHook(() => useNotifications({ pollInterval: 0 }));

    // Initial call only
    expect(mockFetchNotifications).toHaveBeenCalledTimes(1);

    // Fast forward
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Should not poll
    expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls onNewNotification for new notifications', () => {
    const mockOnNewNotification = jest.fn();
    const initialNotifications = [
      {
        _id: '1',
        notificationId: 'uuid-1',
        title: 'Test 1',
        message: 'Message 1',
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
        user: 'user1',
      },
    ];

    mockUseNotificationStore.mockReturnValue(
      buildStoreValue({
        notifications: initialNotifications,
        unreadCount: 1,
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        fetchNotifications: mockFetchNotifications,
        fetchUnreadCount: mockFetchUnreadCount,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
        deleteNotification: mockDeleteNotification,
        loadMore: mockLoadMore,
        clearError: mockClearError,
      })
    );

    const { rerender } = renderHook(() =>
      useNotifications({ onNewNotification: mockOnNewNotification })
    );

    // Add new notification
    const updatedNotifications = [
      {
        _id: '2',
        notificationId: 'uuid-2',
        title: 'Test 2',
        message: 'Message 2',
        type: 'deposit',
        isRead: false,
        createdAt: new Date().toISOString(),
        user: 'user1',
      },
      ...initialNotifications,
    ];

    mockUseNotificationStore.mockReturnValue(
      buildStoreValue({
        notifications: updatedNotifications,
        unreadCount: 2,
        pagination: { page: 1, limit: 20, total: 2, pages: 1 },
        fetchNotifications: mockFetchNotifications,
        fetchUnreadCount: mockFetchUnreadCount,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
        deleteNotification: mockDeleteNotification,
        loadMore: mockLoadMore,
        clearError: mockClearError,
      })
    );

    rerender();

    expect(mockOnNewNotification).toHaveBeenCalledWith(updatedNotifications[0]);
  });
});

describe('useUnreadCount', () => {
  const mockFetchUnreadCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseNotificationStore.mockReturnValue(
      buildStoreValue({
        unreadCount: 5,
        fetchUnreadCount: mockFetchUnreadCount,
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches unread count on mount', () => {
    renderHook(() => useUnreadCount());

    expect(mockFetchUnreadCount).toHaveBeenCalledTimes(1);
  });

  it('polls for unread count updates', async () => {
    renderHook(() => useUnreadCount(5000));

    expect(mockFetchUnreadCount).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockFetchUnreadCount).toHaveBeenCalledTimes(2);
    });
  });

  it('returns unread count', () => {
    const { result } = renderHook(() => useUnreadCount());

    expect(result.current.unreadCount).toBe(5);
  });
});
