/**
 * Badge Avatar Component
 * Displays a badge icon as an avatar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { isBadgeIcon, getBadgeIcon } from '@/lib/avatar-utils';

interface BadgeAvatarProps {
  badgeIcon: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
};

export function BadgeAvatar({
  badgeIcon,
  className,
  size = 'md',
}: BadgeAvatarProps) {
  // If badgeIcon is already an emoji (not a URL), use it directly
  const icon = isBadgeIcon(badgeIcon)
    ? getBadgeIcon(badgeIcon) || badgeIcon
    : badgeIcon;

  if (!icon) {
    return null;
  }

  const sizeMap = {
    sm: '2rem',
    md: '2.5rem',
    lg: '4rem',
    xl: '6rem',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-emerald-500/20',
        'border-2 border-purple-500/30 dark:border-purple-400/30',
        'shadow-lg backdrop-blur-sm',
        sizeClasses[size],
        className
      )}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        minWidth: sizeMap[size],
        minHeight: sizeMap[size],
      }}
    >
      <span className="drop-shadow-lg select-none">{icon}</span>
    </div>
  );
}
