/**
 * NotificationItem Component
 * Individual notification display with actions
 */

'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Users,
  TrendingUp,
  Info,
  AlertTriangle,
  Shield,
  Bell,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Map icon names to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Users,
  TrendingUp,
  Info,
  AlertTriangle,
  Shield,
  Bell,
  CheckCircle,
};

// Get the icon component for a notification type
function getNotificationIcon(type: NotificationType): LucideIcon {
  const config =
    NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.info;
  return ICON_MAP[config.icon] || Bell;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
  showDelete?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  showDelete = true,
}: NotificationItemProps) {
  // Safely get config with fallback to system type if type is invalid
  const notificationType = notification.type || 'system';
  const config =
    NOTIFICATION_TYPE_CONFIG[notificationType] ||
    NOTIFICATION_TYPE_CONFIG.system ||
    NOTIFICATION_TYPE_CONFIG.info; // Fallback for unknown types
  const isUnread = !notification.isRead;

  // Check notification category for styling
  const isSystemOrAlert = [
    'system',
    'alert',
    'bonus',
    'security',
    'info',
  ].includes(notificationType);
  const isPromotional = ['bonus', 'referral'].includes(notificationType);

  const handleClick = () => {
    console.log('[NotificationItem.handleClick] === CLICKED ===');
    console.log('[NotificationItem.handleClick] Notification:', {
      _id: notification._id,
      notificationId: notification.notificationId,
      title: notification.title,
      isRead: notification.isRead,
      type: notification.type,
    });

    // Always call onClick first (for navigation/actions)
    if (onClick) {
      console.log('[NotificationItem.handleClick] Calling onClick callback...');
      onClick(notification);
    }

    // Mark as read in the background (don't block navigation if it fails)
    if (isUnread) {
      console.log(
        '[NotificationItem.handleClick] Notification is unread, marking as read...'
      );
      console.log(
        '[NotificationItem.handleClick] Using _id:',
        notification._id
      );
      // Don't await - let it run in background so navigation isn't blocked
      onMarkAsRead(notification._id).catch((error) => {
        console.error(
          '[NotificationItem.handleClick] ❌ Error marking as read (non-blocking):',
          error
        );
        // Error is logged but doesn't prevent navigation/action
      });
    } else {
      console.log(
        '[NotificationItem.handleClick] Notification is already read'
      );
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification._id);
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-lg border p-3 transition-all duration-200',
        'hover:bg-accent/50 cursor-pointer',
        isUnread
          ? 'bg-accent/20 border-l-2'
          : 'border-l-2 border-l-transparent',
        // Color-coded left border based on type
        isUnread && isPromotional && 'border-l-amber-500',
        isUnread && isSystemOrAlert && !isPromotional && 'border-l-blue-500',
        isUnread && !isSystemOrAlert && !isPromotional && 'border-l-emerald-500'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Notification: ${notification.title}`}
    >
      {/* Icon */}
      {(() => {
        const IconComponent = getNotificationIcon(
          notificationType as NotificationType
        );
        return (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: config.bgColor }}
            aria-hidden="true"
          >
            <IconComponent
              className="h-4 w-4"
              style={{ color: config.color }}
            />
          </div>
        );
      })()}

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm leading-tight font-medium">
                {notification.title}
              </h4>
              {/* Type Badge */}
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                }}
              >
                {config.label}
              </span>
              {isUnread && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
                  aria-label="Unread"
                />
              )}
            </div>
          </div>

          {/* Delete button */}
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleDelete}
              aria-label="Delete notification"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Message */}
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
          {notification.message}
        </p>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-muted-foreground/70 text-[11px]">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* CTA Button */}
          {notification.metadata?.ctaUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[11px]"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = notification.metadata!.ctaUrl!;
              }}
            >
              {notification.metadata.ctaText || 'View Details'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
