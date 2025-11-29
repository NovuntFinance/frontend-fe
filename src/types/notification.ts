/**
 * Notification System Types
 * Complete type definitions for in-app notification system
 */

/**
 * Supported notification types
 * Note: Backend may send 'info' and 'success' types which map to system/alert categories
 */
export type NotificationType =
  | 'deposit'
  | 'withdrawal'
  | 'bonus'
  | 'referral'
  | 'earning'
  | 'system'
  | 'alert'
  | 'security'
  | 'info' // Backend type: informational/system messages
  | 'success'; // Backend type: successful actions/transactions

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
 * Using Lucide icon names for cleaner UI
 */
export const NOTIFICATION_GROUPS: Record<
  NotificationGroup,
  NotificationGroupConfig
> = {
  financial: {
    id: 'financial',
    label: 'Financial Activity',
    icon: 'Wallet',
    color: '#10b981', // Green
    bgColor: 'rgba(16, 185, 129, 0.1)',
    types: ['deposit', 'withdrawal', 'success'], // success = successful transactions
  },
  investment: {
    id: 'investment',
    label: 'Investment & Earnings',
    icon: 'TrendingUp',
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    types: ['earning'],
  },
  rewards: {
    id: 'rewards',
    label: 'Rewards & Bonuses',
    icon: 'Gift',
    color: '#f59e0b', // Gold
    bgColor: 'rgba(245, 158, 11, 0.1)',
    types: ['bonus'],
  },
  social: {
    id: 'social',
    label: 'Social & Team',
    icon: 'Users',
    color: '#8b5cf6', // Purple
    bgColor: 'rgba(139, 92, 246, 0.1)',
    types: ['referral'],
  },
  security: {
    id: 'security',
    label: 'Security & Account',
    icon: 'Shield',
    color: '#ef4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    types: ['security'],
  },
  alerts: {
    id: 'alerts',
    label: 'Alerts & Warnings',
    icon: 'AlertTriangle',
    color: '#f59e0b', // Orange
    bgColor: 'rgba(245, 158, 11, 0.1)',
    types: ['alert'],
  },
  system: {
    id: 'system',
    label: 'System & Info',
    icon: 'Bell',
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    types: ['system', 'info'], // info = backend system messages
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
 * Using Lucide icon names for cleaner UI
 */
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  NotificationTypeConfig
> = {
  deposit: {
    icon: 'ArrowDownLeft',
    color: '#10b981', // Green
    bgColor: 'rgba(16, 185, 129, 0.1)',
    label: 'Deposit',
  },
  withdrawal: {
    icon: 'ArrowUpRight',
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    label: 'Withdrawal',
  },
  bonus: {
    icon: 'Gift',
    color: '#f59e0b', // Gold
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: 'Bonus',
  },
  referral: {
    icon: 'Users',
    color: '#8b5cf6', // Purple
    bgColor: 'rgba(139, 92, 246, 0.1)',
    label: 'Referral',
  },
  earning: {
    icon: 'TrendingUp',
    color: '#10b981', // Green
    bgColor: 'rgba(16, 185, 129, 0.1)',
    label: 'Earning',
  },
  system: {
    icon: 'Info',
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    label: 'System',
  },
  alert: {
    icon: 'AlertTriangle',
    color: '#f59e0b', // Orange
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: 'Alert',
  },
  security: {
    icon: 'Shield',
    color: '#ef4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    label: 'Security',
  },
  // Backend-specific types
  info: {
    icon: 'Bell',
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    label: 'Information',
  },
  success: {
    icon: 'CheckCircle',
    color: '#10b981', // Green
    bgColor: 'rgba(16, 185, 129, 0.1)',
    label: 'Success',
  },
};
