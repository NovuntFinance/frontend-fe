# Frontend Notification System - Complete Implementation Guide

> **Production-Ready Guide** for integrating the Novunt notification system into your frontend application.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Reference](#api-reference)
3. [TypeScript Types](#typescript-types)
4. [React/Next.js Integration](#reactnextjs-integration)
5. [State Management](#state-management)
6. [Real-Time Updates](#real-time-updates)
7. [UI Components](#ui-components)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Testing](#testing)
11. [Production Checklist](#production-checklist)

---

## Quick Start

### Base URL

```
/api/v1/notifications
```

### Authentication

All endpoints require authentication via `betterAuthMiddleware`. Include session cookies or Bearer tokens in requests.

### Minimal Integration

```typescript
// 1. Install dependencies (if using a fetch wrapper)
// npm install axios  // or use native fetch

// 2. Create API client
const API_BASE = '/api/v1/notifications';

async function getNotifications() {
  const response = await fetch(`${API_BASE}?page=1&limit=20`, {
    credentials: 'include'
  });
  return response.json();
}

// 3. Use in component
function NotificationList() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(data => {
      if (data.success) {
        setNotifications(data.data);
      }
    });
  }, []);

  return <div>{/* Render notifications */}</div>;
}
```

---

## API Reference

### 1. Get Notifications

**GET** `/api/v1/notifications`

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 50) - Items per page
- `type` (string, optional) - Filter by type: `deposit`, `withdrawal`, `bonus`, `referral`, `earning`, `system`, `alert`, `security`
- `unreadOnly` (boolean, default: false) - Only return unread notifications

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "notificationId": "550e8400-e29b-41d4-a716-446655440000",
      "user": "507f1f77bcf86cd799439012",
      "title": "Deposit Confirmed",
      "message": "Your deposit of 100 USDT has been confirmed.",
      "type": "deposit",
      "metadata": {
        "txId": "tx-123",
        "amount": 100,
        "ctaUrl": "/transactions/tx-123",
        "ctaText": "View Transaction"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "readAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "unreadCount": 12
}
```

**Example Requests:**

```typescript
// Get all notifications
GET /api/v1/notifications?page=1&limit=20

// Get unread notifications only
GET /api/v1/notifications?unreadOnly=true

// Filter by type
GET /api/v1/notifications?type=deposit&limit=10

// Combined filters
GET /api/v1/notifications?type=bonus&unreadOnly=true&page=1&limit=10
```

---

### 2. Get Notification Counts

**GET** `/api/v1/notifications/counts`

**Response:**

```json
{
  "success": true,
  "data": {
    "unreadCount": 12
  }
}
```

---

### 3. Mark Notification as Read

**PATCH** `/api/v1/notifications/:notificationId/read`

**Parameters:**

- `notificationId` (string) - MongoDB `_id` of the notification (use `_id`, not `notificationId`)

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Notification not found or already read"
}
```

---

### 4. Mark All Notifications as Read

**PATCH** `/api/v1/notifications/mark-all-read`

**Response:**

```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "updatedCount": 5
}
```

---

### 5. Delete Notification

**DELETE** `/api/v1/notifications/:notificationId`

**Parameters:**

- `notificationId` (string) - MongoDB `_id` of the notification

**Response:**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 6. Create Test Notification (Dev/Admin Only)

**POST** `/api/v1/notifications/test`

**Request Body:**

```json
{
  "title": "Test Notification",
  "message": "This is a test notification",
  "type": "system",
  "metadata": {
    "testId": "123",
    "ctaUrl": "/test"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Test notification created",
  "data": {
    "channels": {
      "platform": true,
      "push": false,
      "email": false
    }
  }
}
```

---

## TypeScript Types

### Complete Type Definitions

```typescript
// types/notification.ts

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
  [key: string]: any; // Additional metadata
}

/**
 * Core notification object
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
```

---

## React/Next.js Integration

### API Client Service

```typescript
// services/notificationService.ts

import type {
  Notification,
  NotificationFilters,
  GetNotificationsResponse,
  GetNotificationCountsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  ApiErrorResponse,
} from '@/types/notification';

const API_BASE = '/api/v1/notifications';

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

/**
 * Get notifications with filters
 */
export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<GetNotificationsResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.type) params.append('type', filters.type);
  if (filters.unreadOnly) params.append('unreadOnly', 'true');

  const query = params.toString();
  return apiRequest<GetNotificationsResponse>(`?${query}`);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await apiRequest<GetNotificationCountsResponse>('/counts');
  return response.data.unreadCount;
}

/**
 * Mark notification as read
 */
export async function markAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  return apiRequest<MarkAsReadResponse>(`/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<MarkAllAsReadResponse> {
  return apiRequest<MarkAllAsReadResponse>('/mark-all-read', {
    method: 'PATCH',
  });
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<DeleteNotificationResponse> {
  return apiRequest<DeleteNotificationResponse>(`/${notificationId}`, {
    method: 'DELETE',
  });
}

/**
 * Create test notification (dev/admin only)
 */
export async function createTestNotification(data: {
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}): Promise<any> {
  return apiRequest('/test', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### Custom React Hooks

```typescript
// hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import type {
  Notification,
  NotificationFilters,
  GetNotificationsResponse,
} from '@/types/notification';
import {
  getNotifications as fetchNotifications,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  deleteNotification as removeNotification,
  getUnreadCount as fetchUnreadCount,
} from '@/services/notificationService';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useNotifications(
  filters: NotificationFilters = {}
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchNotifications({
          ...filters,
          page,
          limit: pagination.limit,
        });

        if (page === 1) {
          setNotifications(response.data);
        } else {
          setNotifications((prev) => [...prev, ...response.data]);
        }

        setPagination(response.pagination);
        setUnreadCount(response.unreadCount);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load notifications'
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications(1);
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to mark as read'
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to mark all as read'
      );
    }
  }, []);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await removeNotification(id);
        const deleted = notifications.find((n) => n._id === id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Failed to delete notification'
        );
      }
    },
    [notifications]
  );

  const loadMore = useCallback(async () => {
    if (pagination.page < pagination.pages && !loading) {
      await loadNotifications(pagination.page + 1);
    }
  }, [pagination, loading, loadNotifications]);

  const refetch = useCallback(async () => {
    await loadNotifications(1);
    await loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    hasMore: pagination.page < pagination.pages,
  };
}

/**
 * Hook for unread count only (lightweight, for badge display)
 */
export function useUnreadCount(pollInterval = 30000) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await fetchUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return { unreadCount, loading };
}
```

---

## State Management

### Context Provider (Optional - for global state)

```typescript
// contexts/NotificationContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationFilters } from '@/types/notification';

interface NotificationContextValue {
  notifications: ReturnType<typeof useNotifications>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
  filters = {},
}: {
  children: ReactNode;
  filters?: NotificationFilters;
}) {
  const notifications = useNotifications(filters);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}
```

---

## Real-Time Updates

### Polling Strategy

```typescript
// hooks/useNotificationPolling.ts

import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';

interface UseNotificationPollingOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onNewNotification?: (notification: Notification) => void;
}

export function useNotificationPolling(
  filters: NotificationFilters = {},
  options: UseNotificationPollingOptions = {}
) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    onNewNotification,
  } = options;

  const { notifications, refetch } = useNotifications(filters);
  const previousNotificationIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    // Initialize previous IDs
    if (previousNotificationIds.current.size === 0) {
      notifications.forEach((n) =>
        previousNotificationIds.current.add(n.notificationId)
      );
      return;
    }

    // Check for new notifications
    const currentIds = new Set(notifications.map((n) => n.notificationId));
    const newNotifications = notifications.filter(
      (n) => !previousNotificationIds.current.has(n.notificationId)
    );

    if (newNotifications.length > 0 && onNewNotification) {
      newNotifications.forEach(onNewNotification);
    }

    previousNotificationIds.current = currentIds;
  }, [notifications, enabled, onNewNotification]);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, refetch]);
}
```

### WebSocket Integration (Future Enhancement)

```typescript
// hooks/useNotificationWebSocket.ts

import { useEffect, useRef, useState } from 'react';
import type { Notification } from '@/types/notification';

export function useNotificationWebSocket(
  enabled: boolean = true,
  onNotification: (notification: Notification) => void
) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Connect to WebSocket (if implemented)
    // const ws = new WebSocket('wss://your-api.com/notifications');
    // wsRef.current = ws;

    // ws.onopen = () => setConnected(true);
    // ws.onclose = () => setConnected(false);
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   onNotification(notification);
    // };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled, onNotification]);

  return { connected };
}
```

---

## UI Components

### Notification Item Component

```typescript
// components/NotificationItem.tsx

import React from 'react';
import type { Notification } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type];
  const isUnread = !notification.isRead;

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
    if (isUnread) {
      onMarkAsRead(notification._id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification._id);
  };

  return (
    <div
      className={`notification-item ${isUnread ? 'unread' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="notification-icon" style={{ color: config.color }}>
        {config.icon}
      </div>

      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          {isUnread && <span className="unread-badge" />}
        </div>

        <p className="notification-message">{notification.message}</p>

        <div className="notification-footer">
          <span className="notification-time">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>

          {notification.metadata?.ctaUrl && (
            <a
              href={notification.metadata.ctaUrl}
              onClick={(e) => e.stopPropagation()}
              className="notification-cta"
            >
              {notification.metadata.ctaText || 'View Details'}
            </a>
          )}
        </div>
      </div>

      <button
        className="notification-delete"
        onClick={handleDelete}
        aria-label="Delete notification"
      >
        ×
      </button>
    </div>
  );
}
```

### Notification List Component

```typescript
// components/NotificationList.tsx

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import type { NotificationFilters } from '@/types/notification';
import { useRouter } from 'next/router';

interface NotificationListProps {
  filters?: NotificationFilters;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationList({
  filters = {},
  onNotificationClick,
}: NotificationListProps) {
  const router = useRouter();
  const {
    notifications,
    loading,
    error,
    markAsRead,
    deleteNotification,
    loadMore,
    hasMore,
    markAllAsRead,
    unreadCount,
  } = useNotifications(filters);

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.metadata?.ctaUrl) {
      router.push(notification.metadata.ctaUrl);
    }
  };

  if (loading && notifications.length === 0) {
    return <div className="notification-list-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notification-list-error">Error: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="notification-list-empty">No notifications</div>;
  }

  return (
    <div className="notification-list">
      {unreadCount > 0 && (
        <div className="notification-list-header">
          <span>{unreadCount} unread</span>
          <button onClick={markAllAsRead}>Mark all as read</button>
        </div>
      )}

      <div className="notification-list-items">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.notificationId}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onClick={handleNotificationClick}
          />
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore} className="notification-list-load-more">
          Load More
        </button>
      )}
    </div>
  );
}
```

### Notification Badge Component

```typescript
// components/NotificationBadge.tsx

import React from 'react';
import { useUnreadCount } from '@/hooks/useNotifications';

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
}

export function NotificationBadge({
  className = '',
  showZero = false,
}: NotificationBadgeProps) {
  const { unreadCount, loading } = useUnreadCount();

  if (loading) {
    return <span className={`notification-badge loading ${className}`}>...</span>;
  }

  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <span className={`notification-badge ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
```

---

## Error Handling

### Error Boundary Component

```typescript
// components/NotificationErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class NotificationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Notification error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="notification-error">
          <p>Something went wrong with notifications.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Handling Utility

```typescript
// utils/notificationErrors.ts

export class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

export function handleNotificationError(error: unknown): string {
  if (error instanceof NotificationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function isNotificationError(
  error: unknown
): error is NotificationError {
  return error instanceof NotificationError;
}
```

---

## Performance Optimization

### Memoization

```typescript
// Optimize notification rendering
import { useMemo } from 'react';

function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      // Unread first
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  // ... render
}
```

### Virtual Scrolling (for large lists)

```typescript
// Use react-window or react-virtualized for large notification lists
import { FixedSizeList } from 'react-window';

function VirtualizedNotificationList({ notifications }: { notifications: Notification[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <NotificationItem notification={notifications[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={notifications.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Debounced Updates

```typescript
// Debounce mark as read to avoid excessive API calls
import { useDebouncedCallback } from 'use-debounce';

function useDebouncedMarkAsRead() {
  const debouncedMarkAsRead = useDebouncedCallback(
    async (id: string, markAsReadFn: (id: string) => Promise<void>) => {
      await markAsReadFn(id);
    },
    500 // 500ms delay
  );

  return debouncedMarkAsRead;
}
```

---

## Testing

### Unit Tests Example

```typescript
// __tests__/notificationService.test.ts

import { getNotifications, markAsRead } from '@/services/notificationService';
import { fetch } from '@/mocks/fetch';

describe('NotificationService', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should fetch notifications', async () => {
    const mockResponse = {
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      unreadCount: 0,
    };

    fetch.mockResponseOnce(JSON.stringify(mockResponse));

    const result = await getNotifications();
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    fetch.mockReject(new Error('Network error'));

    await expect(getNotifications()).rejects.toThrow('Network error');
  });
});
```

### Component Tests Example

```typescript
// __tests__/NotificationItem.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationItem } from '@/components/NotificationItem';
import type { Notification } from '@/types/notification';

const mockNotification: Notification = {
  _id: '1',
  notificationId: 'uuid-1',
  user: 'user-1',
  title: 'Test Notification',
  message: 'Test message',
  type: 'system',
  isRead: false,
  createdAt: new Date().toISOString(),
};

describe('NotificationItem', () => {
  it('renders notification', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('calls onMarkAsRead when clicked', () => {
    const onMarkAsRead = jest.fn();
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });
});
```

---

## Production Checklist

### Before Deployment

- [ ] **API Integration**
  - [ ] All endpoints tested with authentication
  - [ ] Error handling implemented
  - [ ] Loading states handled
  - [ ] Network failures handled gracefully

- [ ] **Performance**
  - [ ] Pagination implemented
  - [ ] Infinite scroll or "Load More" working
  - [ ] Memoization applied where needed
  - [ ] Large lists optimized (virtual scrolling if needed)

- [ ] **Real-Time Updates**
  - [ ] Polling configured (30-60 second intervals)
  - [ ] Unread count badge updates
  - [ ] New notifications appear without refresh

- [ ] **UI/UX**
  - [ ] All notification types styled correctly
  - [ ] Icons and colors match type configuration
  - [ ] Deep linking works from metadata
  - [ ] Empty states handled
  - [ ] Loading skeletons shown

- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Screen reader support
  - [ ] ARIA labels on interactive elements
  - [ ] Focus management

- [ ] **Error Handling**
  - [ ] Error boundaries in place
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms
  - [ ] Offline handling

- [ ] **Testing**
  - [ ] Unit tests for services
  - [ ] Component tests
  - [ ] Integration tests
  - [ ] E2E tests for critical flows

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Analytics for notification interactions
  - [ ] Performance monitoring

---

## Notification Types Reference

| Type         | Use Case                | Icon | Color            | Background   |
| ------------ | ----------------------- | ---- | ---------------- | ------------ |
| `deposit`    | Deposit confirmations   | 💰   | Green (#10b981)  | Light Green  |
| `withdrawal` | Withdrawal status       | 💸   | Blue (#3b82f6)   | Light Blue   |
| `bonus`      | Bonus credits           | 🎁   | Gold (#f59e0b)   | Light Gold   |
| `referral`   | Referral earnings       | 👥   | Purple (#8b5cf6) | Light Purple |
| `earning`    | Profit/ROI earnings     | 📈   | Green (#10b981)  | Light Green  |
| `system`     | General updates         | ℹ️   | Blue (#3b82f6)   | Light Blue   |
| `alert`      | Warnings/actions needed | ⚠️   | Orange (#f59e0b) | Light Orange |
| `security`   | Security events         | 🔒   | Red (#ef4444)    | Light Red    |

---

## Best Practices Summary

1. **Use `notificationId` (UUID) for frontend deduplication** - Stable across syncs
2. **Use `_id` (ObjectId) for API calls** - Required for update/delete operations
3. **Handle pagination** - Implement infinite scroll or "Load More"
4. **Poll for unread count** - Update badge every 30-60 seconds
5. **Deep linking** - Use `metadata.ctaUrl` to navigate users
6. **Type-based styling** - Map notification `type` to icons and colors consistently
7. **Optimistic updates** - Update UI immediately, sync with server
8. **Error recovery** - Provide retry mechanisms and clear error messages
9. **Performance** - Memoize expensive operations, use virtual scrolling for large lists
10. **Accessibility** - Support keyboard navigation and screen readers

---

## Support & Troubleshooting

### Common Issues

**Issue**: Notifications not loading

- Check authentication token/cookie
- Verify API endpoint is correct
- Check network tab for errors

**Issue**: Unread count not updating

- Verify polling interval is set
- Check if `getUnreadCount` is being called
- Ensure API response format matches expected structure

**Issue**: Mark as read not working

- Verify using `_id` (not `notificationId`) for API calls
- Check authentication
- Verify notification exists and belongs to user

**Issue**: Performance issues with large lists

- Implement pagination
- Use virtual scrolling
- Memoize expensive operations

---

## Additional Resources

- **API Reference**: See `FRONTEND_NOTIFICATION_API_REFERENCE.md`
- **Backend Documentation**: See `IN_APP_NOTIFICATION_SYSTEM.md`
- **Testing Guide**: See `NOTIFICATION_SYSTEM_TESTING_GUIDE.md`

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Status**: Production Ready ✅
