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
  showZero = true,
  maxCount = 99,
}: NotificationBadgeProps) {
  const { unreadCount } = useUnreadCount();

  if (unreadCount === 0 && !showZero) {
    return null;
  }

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;
  const isZero = unreadCount === 0;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full sm:h-6 sm:w-6',
        'text-[8px] font-bold text-white sm:text-[9px]',
        'shadow-[0_0_0_2px_var(--neu-bg)]',
        isZero ? 'bg-emerald-500' : 'bg-orange-500',
        'animate-in zoom-in-50 duration-200',
        className
      )}
      aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </span>
  );
}
