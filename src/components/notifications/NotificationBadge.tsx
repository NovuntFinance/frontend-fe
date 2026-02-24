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
        'absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center',
        'rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white',
        'ring-background ring-2',
        'animate-in zoom-in-50 duration-200',
        className
      )}
      aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </span>
  );
}
