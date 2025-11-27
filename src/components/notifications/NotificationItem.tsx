/**
 * NotificationItem Component
 * Individual notification display with actions
 */

'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import type { Notification } from '@/types/notification';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    NOTIFICATION_TYPE_CONFIG.system;
  const isUnread = !notification.isRead;

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
        'group relative flex gap-3 rounded-lg border p-4 transition-all duration-200',
        'hover:bg-accent/50 cursor-pointer',
        isUnread && 'bg-accent/30 border-l-primary border-l-4'
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
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: config.bgColor }}
        aria-hidden="true"
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">{notification.title}</h4>
              {isUnread && (
                <span
                  className="bg-primary h-2 w-2 rounded-full"
                  aria-label="Unread"
                />
              )}
            </div>
            <span className="text-muted-foreground text-xs">
              {config.label}
            </span>
          </div>

          {/* Delete button */}
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleDelete}
              aria-label="Delete notification"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Message */}
        <p className="text-muted-foreground text-sm">{notification.message}</p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* CTA Button */}
          {notification.metadata?.ctaUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
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
