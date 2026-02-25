/**
 * NotificationBadge Component
 * Displays unread notification count
 */

'use client';

import React from 'react';
import { useUnreadCount } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
  maxCount?: number;
}

export function NotificationBadge({
  className = '',
  showZero = false,
  maxCount = 99,
}: NotificationBadgeProps) {
  const { unreadCount } = useUnreadCount();

  if (unreadCount === 0 && !showZero) {
    return null;
  }

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;

  return (
    <span
      className={cn(
        'absolute -top-0.5 right-0 flex items-center justify-center',
        'text-xs font-semibold text-red-500',
        'animate-in zoom-in-50 duration-200',
        className
      )}
      aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </span>
  );
}
