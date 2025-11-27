/**
 * DateFilteredNotificationList Component
 * Displays notifications in chronological order with date grouping and filtering
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar } from 'lucide-react';
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfDay,
  parseISO,
} from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  NotificationFilters,
  Notification,
  NotificationType,
} from '@/types/notification';
import { cn } from '@/lib/utils';

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

interface DateFilteredNotificationListProps {
  filters?: NotificationFilters;
  dateFilter?: DateFilter;
  customDateRange?: { start?: Date; end?: Date };
  onNotificationClick?: (notification: Notification) => void;
  maxHeight?: string;
  showHeader?: boolean;
  className?: string;
  // Allow filtering by multiple types (for system tab)
  includeTypes?: NotificationType[];
  excludeTypes?: NotificationType[];
}

export function DateFilteredNotificationList({
  filters = {},
  dateFilter = 'all',
  customDateRange,
  onNotificationClick,
  maxHeight = '600px',
  showHeader = true,
  className,
  includeTypes,
  excludeTypes,
}: DateFilteredNotificationListProps) {
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

  // Filter and group notifications by date
  const { filteredNotifications, dateGroups } = useMemo(() => {
    let filtered = [...notifications];

    // Apply type filters (include/exclude)
    if (includeTypes && includeTypes.length > 0) {
      filtered = filtered.filter((n) => includeTypes.includes(n.type));
    }
    if (excludeTypes && excludeTypes.length > 0) {
      filtered = filtered.filter((n) => !excludeTypes.includes(n.type));
    }

    // Apply date filter
    if (dateFilter === 'today') {
      filtered = filtered.filter((n) => isToday(parseISO(n.createdAt)));
    } else if (dateFilter === 'week') {
      filtered = filtered.filter((n) => isThisWeek(parseISO(n.createdAt)));
    } else if (dateFilter === 'month') {
      filtered = filtered.filter((n) => isThisMonth(parseISO(n.createdAt)));
    } else if (dateFilter === 'custom' && customDateRange) {
      const start = customDateRange.start
        ? startOfDay(customDateRange.start)
        : null;
      const end = customDateRange.end ? startOfDay(customDateRange.end) : null;

      filtered = filtered.filter((n) => {
        const notificationDate = startOfDay(parseISO(n.createdAt));
        if (start && notificationDate < start) return false;
        if (end && notificationDate > end) return false;
        return true;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
    });

    // Group by date
    const groups: Record<string, Notification[]> = {};

    filtered.forEach((notification) => {
      const date = parseISO(notification.createdAt);
      let groupKey: string;

      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else if (isThisWeek(date)) {
        groupKey = format(date, 'EEEE'); // Day name (Monday, Tuesday, etc.)
      } else if (isThisMonth(date)) {
        groupKey = format(date, 'MMMM d'); // Month and day (January 15)
      } else {
        groupKey = format(date, 'MMMM yyyy'); // Month and year (January 2025)
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    // Convert to array and sort groups
    const groupArray = Object.entries(groups).map(
      ([dateLabel, notifications]) => ({
        dateLabel,
        notifications,
        date: parseISO(notifications[0].createdAt),
      })
    );

    // Sort groups by date (newest first)
    groupArray.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      filteredNotifications: filtered,
      dateGroups: groupArray,
    };
  }, [notifications, dateFilter, customDateRange, includeTypes, excludeTypes]);

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
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive text-sm">Error: {error}</p>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
        <p className="text-muted-foreground">
          {dateFilter === 'all'
            ? 'No notifications yet'
            : `No notifications found for ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : dateFilter === 'month' ? 'this month' : 'selected date range'}`}
        </p>
      </div>
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

      {/* Notification List with Date Groups */}
      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-6 p-4">
          {dateGroups.map(
            ({ dateLabel, notifications: groupNotifications }) => (
              <div key={dateLabel} className="space-y-3">
                {/* Date Header */}
                <div className="bg-background/95 border-border/50 sticky top-0 z-10 border-b py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                    <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      {dateLabel}
                    </h3>
                    <span className="text-muted-foreground/70 text-xs">
                      ({groupNotifications.length})
                    </span>
                  </div>
                </div>

                {/* Notifications for this date */}
                <div className="space-y-2 pl-1">
                  {groupNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.notificationId}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              </div>
            )
          )}
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
