/**
 * Notification System Types
 * Complete type definitions for in-app notification system
 */

/**
 * Supported notification types
 */
export type NotificationType =
  | 'deposit'
  | 'withdrawal'
  | 'bonus'
  | 'referral'
  | 'earning'
  | 'system'
  | 'alert'
  | 'security';

/**
 * Notification metadata for deep linking and additional data
 */
export interface NotificationMetadata {
  ctaUrl?: string; // Deep link URL
  ctaText?: string; // Call-to-action button text
  txId?: string; // Transaction ID
  amount?: number; // Amount value
  currency?: string; // Currency code
  [key: string]: unknown; // Additional metadata
}

/**
 * Core notification object from backend
 */
export interface Notification {
  _id: string; // MongoDB ObjectId (use for API operations)
  notificationId: string; // UUID (use for frontend deduplication)
  user: string; // User ObjectId
  title: string; // Short title (max 120 chars)
  message: string; // Full message (max 600 chars)
  type: NotificationType; // One of 8 types
  metadata?: NotificationMetadata; // Optional deep-link data
  isRead: boolean; // Read status
  createdAt: string; // ISO date string
  readAt?: string | null; // ISO date string or null
  updatedAt?: string; // ISO date string (optional)
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * API response for GET /notifications
 */
export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: PaginationInfo;
  unreadCount: number;
}

/**
 * API response for GET /notifications/counts
 */
export interface GetNotificationCountsResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

/**
 * API response for PATCH /notifications/:id/read
 */
export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

/**
 * API response for PATCH /notifications/mark-all-read
 */
export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
  updatedCount: number;
}

/**
 * API response for DELETE /notifications/:id
 */
export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Query parameters for GET /notifications
 */
export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  unreadOnly?: boolean;
}

/**
 * Notification type configuration for UI
 */
export interface NotificationTypeConfig {
  icon: string;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * Notification Group Types
 */
export type NotificationGroup =
  | 'financial'
  | 'investment'
  | 'rewards'
  | 'social'
  | 'security'
  | 'alerts'
  | 'system';

/**
 * Notification Group Configuration
 */
export interface NotificationGroupConfig {
  id: NotificationGroup;
  label: string;
  icon: string; // Emoji or icon name
  color: string;
  bgColor: string;
  types: NotificationType[];
}

/**
 * Group configuration map
 */
export const NOTIFICATION_GROUPS: Record<
  NotificationGroup,
  NotificationGroupConfig
> = {
  financial: {
    id: 'financial',
    label: 'Financial Activity',
    icon: '💰',
    color: '#10b981', // Green
    bgColor: '#d1fae5',
    types: ['deposit', 'withdrawal'],
  },
  investment: {
    id: 'investment',
    label: 'Investment & Earnings',
    icon: '📈',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
    types: ['earning'],
  },
  rewards: {
    id: 'rewards',
    label: 'Rewards & Bonuses',
    icon: '🎁',
    color: '#f59e0b', // Gold
    bgColor: '#fef3c7',
    types: ['bonus'],
  },
  social: {
    id: 'social',
    label: 'Social & Team',
    icon: '👥',
    color: '#8b5cf6', // Purple
    bgColor: '#ede9fe',
    types: ['referral'],
  },
  security: {
    id: 'security',
    label: 'Security & Account',
    icon: '🔒',
    color: '#ef4444', // Red
    bgColor: '#fee2e2',
    types: ['security'],
  },
  alerts: {
    id: 'alerts',
    label: 'Alerts & Warnings',
    icon: '⚠️',
    color: '#f59e0b', // Orange
    bgColor: '#fef3c7',
    types: ['alert'],
  },
  system: {
    id: 'system',
    label: 'System & Info',
    icon: 'ℹ️',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
    types: ['system'],
  },
};

/**
 * Get group for a notification type
 */
export function getNotificationGroup(
  type: NotificationType | string | undefined
): NotificationGroup {
  // Handle invalid or missing types
  if (!type || typeof type !== 'string') {
    return 'system';
  }

  for (const [groupKey, group] of Object.entries(NOTIFICATION_GROUPS)) {
    if (group.types.includes(type as NotificationType)) {
      return groupKey as NotificationGroup;
    }
  }
  return 'system'; // Default fallback
}

/**
 * Type configuration map
 */
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  NotificationTypeConfig
> = {
  deposit: {
    icon: '💰',
    color: '#10b981', // Green
    bgColor: '#d1fae5',
    label: 'Deposit',
  },
  withdrawal: {
    icon: '💸',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
    label: 'Withdrawal',
  },
  bonus: {
    icon: '🎁',
    color: '#f59e0b', // Gold
    bgColor: '#fef3c7',
    label: 'Bonus',
  },
  referral: {
    icon: '👥',
    color: '#8b5cf6', // Purple
    bgColor: '#ede9fe',
    label: 'Referral',
  },
  earning: {
    icon: '📈',
    color: '#10b981', // Green
    bgColor: '#d1fae5',
    label: 'Earning',
  },
  system: {
    icon: 'ℹ️',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
    label: 'System',
  },
  alert: {
    icon: '⚠️',
    color: '#f59e0b', // Orange
    bgColor: '#fef3c7',
    label: 'Alert',
  },
  security: {
    icon: '🔒',
    color: '#ef4444', // Red
    bgColor: '#fee2e2',
    label: 'Security',
  },
};
