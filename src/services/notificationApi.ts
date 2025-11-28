/**
 * Notification API Service
 * Handles all API calls to the notification backend
 */

import apiClient from '@/lib/api';
import type {
  NotificationFilters,
  GetNotificationsResponse,
  GetNotificationCountsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  NotificationType,
  NotificationMetadata,
} from '@/types/notification';

/**
 * Get notifications with filters
 */
export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<GetNotificationsResponse> {
  const params: Record<string, string> = {};

  if (filters.page) params.page = filters.page.toString();
  if (filters.limit) params.limit = filters.limit.toString();
  if (filters.type) params.type = filters.type;
  if (filters.unreadOnly) params.unreadOnly = 'true';

  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/notifications?${queryString}` : '/notifications';

  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[notificationApi.getNotifications] === FETCHING NOTIFICATIONS ==='
    );
    console.log('[notificationApi.getNotifications] URL:', url);
    console.log('[notificationApi.getNotifications] Filters:', filters);
  }

  // Use apiClient directly to avoid auto-unwrapping of data
  // We need the full response to access pagination and unreadCount
  const response = await apiClient.get<GetNotificationsResponse>(url);

  if (process.env.NODE_ENV === 'development') {
    console.log('[notificationApi.getNotifications] === RESPONSE RECEIVED ===');
    console.log(
      '[notificationApi.getNotifications] Response status:',
      response.status
    );
    console.log(
      '[notificationApi.getNotifications] Response data keys:',
      Object.keys(response.data)
    );
  }

  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<GetNotificationCountsResponse>(
    '/notifications/counts'
  );

  // Handle different response structures safely
  if (
    response.data &&
    response.data.data &&
    typeof response.data.data.unreadCount === 'number'
  ) {
    return response.data.data.unreadCount;
  }

  // Fallback: maybe it's directly in data (e.g. { success: true, unreadCount: 5 })
  // or maybe response.data IS the data (if interceptor unwrapped it, though we think it doesn't)
  const anyData = response.data as any;
  if (typeof anyData.unreadCount === 'number') {
    return anyData.unreadCount;
  }

  return 0;
}

/**
 * Mark notification as read
 * @param notificationId - MongoDB _id of the notification
 */
export async function markAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  // Always log (not conditional) for debugging
  console.log('[notificationApi.markAsRead] === FUNCTION CALLED ===');
  console.log('[notificationApi.markAsRead] Notification ID:', notificationId);

  // Validate notification ID format (MongoDB ObjectId should be 24 hex characters)
  if (!notificationId || typeof notificationId !== 'string') {
    const error = new Error(
      'Invalid notification ID: must be a non-empty string'
    );
    console.error('[notificationApi.markAsRead] ❌ Validation error:', error);
    throw error;
  }

  const response = await apiClient.patch<MarkAsReadResponse>(
    `/notifications/${notificationId}/read`
  );

  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<MarkAllAsReadResponse> {
  const response = await apiClient.patch<MarkAllAsReadResponse>(
    '/notifications/mark-all-read'
  );
  return response.data;
}

/**
 * Delete notification
 * @param notificationId - MongoDB _id of the notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<DeleteNotificationResponse> {
  const response = await apiClient.delete<DeleteNotificationResponse>(
    `/notifications/${notificationId}`
  );
  return response.data;
}

/**
 * Create test notification (dev/admin only)
 */
interface CreateTestNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
}

interface CreateTestNotificationResponse {
  success: boolean;
  data: unknown;
  message?: string;
}

export async function createTestNotification(
  data: CreateTestNotificationPayload
): Promise<CreateTestNotificationResponse> {
  const response = await apiClient.post<CreateTestNotificationResponse>(
    '/notifications/test',
    data
  );
  return response.data;
}

/**
 * Error handler for notification API calls
 */
export function handleNotificationError(error: unknown): string {
  // Handle API errors (from our api client)
  if (error && typeof error === 'object') {
    // Our API client returns error objects with message property
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    // Check for nested error structures
    if (
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
    ) {
      return error.response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
