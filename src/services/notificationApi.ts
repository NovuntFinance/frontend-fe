/**
 * Notification API Service
 * Handles all API calls to the notification backend
 */

import { api } from '@/lib/api';
import type {
  Notification,
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
 * Notification response type - API may return wrapped object or unwrapped array
 * (API client auto-unwraps the 'data' property from responses)
 */
export type NotificationApiResponse = GetNotificationsResponse | Notification[];

/**
 * Get notifications with filters
 */
export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<NotificationApiResponse> {
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

  const response = await api.get<NotificationApiResponse>(url);

  if (process.env.NODE_ENV === 'development') {
    const isArray = Array.isArray(response);
    console.log('[notificationApi.getNotifications] === RESPONSE RECEIVED ===');
    console.log(
      '[notificationApi.getNotifications] Response is array?',
      isArray
    );
    if (isArray) {
      console.log(
        '[notificationApi.getNotifications] Notifications count:',
        response.length
      );
      if (response.length > 0) {
        console.log(
          '[notificationApi.getNotifications] First notification:',
          response[0]
        );
      }
    } else {
      const objResponse = response as GetNotificationsResponse;
      console.log(
        '[notificationApi.getNotifications] Response.data length:',
        objResponse.data?.length || 0
      );
      console.log(
        '[notificationApi.getNotifications] Response.pagination:',
        objResponse.pagination
      );
      console.log(
        '[notificationApi.getNotifications] Response.unreadCount:',
        objResponse.unreadCount
      );
    }
  }

  return response;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<GetNotificationCountsResponse>(
    '/notifications/counts'
  );
  return response.data.unreadCount;
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
  console.log('[notificationApi.markAsRead] ID type:', typeof notificationId);
  console.log(
    '[notificationApi.markAsRead] ID length:',
    notificationId?.length
  );
  console.log(
    '[notificationApi.markAsRead] Endpoint path:',
    `/notifications/${notificationId}/read`
  );

  // Validate notification ID format (MongoDB ObjectId should be 24 hex characters)
  if (!notificationId || typeof notificationId !== 'string') {
    const error = new Error(
      'Invalid notification ID: must be a non-empty string'
    );
    console.error('[notificationApi.markAsRead] ❌ Validation error:', error);
    throw error;
  }

  if (notificationId.length !== 24) {
    console.warn(
      '[notificationApi.markAsRead] ⚠️ Warning: Notification ID length is not 24 characters (expected MongoDB ObjectId format)'
    );
    console.warn('[notificationApi.markAsRead] ⚠️ ID:', notificationId);
  }

  console.log('[notificationApi.markAsRead] 📤 About to call api.patch...');
  console.log(
    '[notificationApi.markAsRead] Full URL will be: /notifications/' +
      notificationId +
      '/read'
  );

  try {
    console.log('[notificationApi.markAsRead] 📤 Making PATCH request NOW...');
    const response = await api.patch<MarkAsReadResponse>(
      `/notifications/${notificationId}/read`
    );

    console.log('[notificationApi.markAsRead] ✅ Success! Response received');
    console.log('[notificationApi.markAsRead] Response:', response);

    return response;
  } catch (error: unknown) {
    console.log('[notificationApi.markAsRead] ⚠️ CATCH BLOCK ENTERED');
    console.error('[notificationApi.markAsRead] ❌ ERROR OCCURRED');
    if (error instanceof Error) {
      console.error('[notificationApi.markAsRead] Error type:', error.name);
      console.error('[notificationApi.markAsRead] Error:', error);
      console.error(
        '[notificationApi.markAsRead] Error message:',
        error.message
      );
    } else {
      console.error('[notificationApi.markAsRead] Error type:', typeof error);
      console.error('[notificationApi.markAsRead] Error:', error);
    }

    if (typeof error === 'object' && error !== null) {
      const errorDetails = error as {
        message?: string;
        code?: string;
        statusCode?: number;
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
          headers?: unknown;
        };
        config?: {
          url?: string;
          method?: string;
          baseURL?: string;
        };
      };

      console.error(
        '[notificationApi.markAsRead] Error code:',
        errorDetails.code
      );
      console.error(
        '[notificationApi.markAsRead] Error statusCode:',
        errorDetails.statusCode
      );

      if (errorDetails.response) {
        console.error(
          '[notificationApi.markAsRead] Response status:',
          errorDetails.response.status
        );
        console.error(
          '[notificationApi.markAsRead] Response statusText:',
          errorDetails.response.statusText
        );
        console.error(
          '[notificationApi.markAsRead] Response data:',
          errorDetails.response.data
        );
        console.error(
          '[notificationApi.markAsRead] Response headers:',
          errorDetails.response.headers
        );
      }

      if (errorDetails.config) {
        console.error(
          '[notificationApi.markAsRead] Request URL:',
          errorDetails.config.url
        );
        console.error(
          '[notificationApi.markAsRead] Request method:',
          errorDetails.config.method
        );
        console.error(
          '[notificationApi.markAsRead] Request baseURL:',
          errorDetails.config.baseURL
        );
        console.error(
          '[notificationApi.markAsRead] Full request URL:',
          `${errorDetails.config.baseURL || ''}${errorDetails.config.url || ''}`
        );
      }
    }

    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<MarkAllAsReadResponse> {
  return api.patch<MarkAllAsReadResponse>('/notifications/mark-all-read');
}

/**
 * Delete notification
 * @param notificationId - MongoDB _id of the notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<DeleteNotificationResponse> {
  return api.delete<DeleteNotificationResponse>(
    `/notifications/${notificationId}`
  );
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
  return api.post<CreateTestNotificationResponse>('/notifications/test', data);
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
