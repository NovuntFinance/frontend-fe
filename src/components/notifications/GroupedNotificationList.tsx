/**
 * GroupedNotificationList Component
 * Displays notifications grouped by category with group headers
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type {
  NotificationFilters,
  Notification,
  NotificationGroup,
} from '@/types/notification';
import {
  getNotificationGroup,
  NOTIFICATION_GROUPS,
} from '@/types/notification';
import { cn } from '@/lib/utils';

interface GroupedNotificationListProps {
  filters?: NotificationFilters;
  onNotificationClick?: (notification: Notification) => void;
  maxHeight?: string;
  showHeader?: boolean;
  className?: string;
  defaultExpandedGroups?: NotificationGroup[];
}

export function GroupedNotificationList({
  filters = {},
  onNotificationClick,
  maxHeight = '600px',
  showHeader = true,
  className,
  defaultExpandedGroups = [],
}: GroupedNotificationListProps) {
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

  // Group notifications by their group type
  const groupedNotifications = useMemo(() => {
    const groups: Record<NotificationGroup, Notification[]> = {
      financial: [],
      investment: [],
      rewards: [],
      social: [],
      security: [],
      alerts: [],
      system: [],
    };

    notifications.forEach((notification) => {
      const group = getNotificationGroup(notification.type);
      groups[group].push(notification);
    });

    // Sort groups by order: financial, investment, rewards, social, security, alerts, system
    const groupOrder: NotificationGroup[] = [
      'financial',
      'investment',
      'rewards',
      'social',
      'security',
      'alerts',
      'system',
    ];

    // Filter out empty groups and sort by order
    return groupOrder
      .map(
        (groupKey) =>
          [groupKey, groups[groupKey]] as [NotificationGroup, Notification[]]
      )
      .filter(([, notifications]) => notifications.length > 0);
  }, [notifications]);

  // Track expanded groups
  const [expandedGroups, setExpandedGroups] = React.useState<
    Set<NotificationGroup>
  >(new Set(defaultExpandedGroups));

  const toggleGroup = (group: NotificationGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

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

  if (!notifications || notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No notifications yet</p>
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

      {/* Grouped Notification List */}
      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-4 p-4">
          {groupedNotifications.map(([groupKey, groupNotifications]) => {
            const groupConfig =
              NOTIFICATION_GROUPS[groupKey] || NOTIFICATION_GROUPS.system;
            const isExpanded = expandedGroups.has(groupKey);
            const unreadInGroup = groupNotifications.filter(
              (n) => !n.isRead
            ).length;

            return (
              <Collapsible
                key={groupKey}
                open={isExpanded}
                onOpenChange={() => toggleGroup(groupKey)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'hover:bg-accent/50 h-auto w-full justify-between p-3',
                      'rounded-lg border transition-colors'
                    )}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                        style={{
                          backgroundColor: groupConfig.bgColor,
                        }}
                      >
                        {groupConfig.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {groupConfig.label}
                          </span>
                          {unreadInGroup > 0 && (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs text-white"
                              style={{ backgroundColor: groupConfig.color }}
                            >
                              {unreadInGroup}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {groupNotifications.length} notification
                          {groupNotifications.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2 pl-14">
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
                </CollapsibleContent>
              </Collapsible>
            );
          })}
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
