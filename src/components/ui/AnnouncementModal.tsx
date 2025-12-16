'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Info,
  TrendingUp,
  Gift,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Announcement } from '@/types/announcement';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AnnouncementModalProps {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getIcon = (type: Announcement['type']) => {
  switch (type) {
    case 'success':
      return <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />;
    case 'promo':
      return <Gift className="h-5 w-5 sm:h-6 sm:w-6" />;
    default:
      return <Info className="h-5 w-5 sm:h-6 sm:w-6" />;
  }
};

const getColorClasses = (type: Announcement['type']) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'warning':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'promo':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    default:
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  }
};

export function AnnouncementModal({
  announcement,
  open,
  onOpenChange,
}: AnnouncementModalProps) {
  if (!announcement) return null;

  const handleLinkClick = () => {
    if (announcement.linkUrl) {
      window.open(announcement.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                getColorClasses(announcement.type)
              )}
            >
              {announcement.icon ? (
                <span className="text-xl sm:text-2xl">{announcement.icon}</span>
              ) : (
                getIcon(announcement.type)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-foreground text-lg font-semibold sm:text-xl dark:text-white">
                Announcement
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-xs sm:text-sm dark:text-white/60">
                {announcement.createdAt &&
                  format(new Date(announcement.createdAt), 'MMMM d, yyyy')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Announcement Text */}
          <div className="bg-muted/50 rounded-lg p-4 dark:bg-white/5">
            <p className="text-foreground text-sm leading-relaxed sm:text-base dark:text-white/90">
              {announcement.text}
            </p>
          </div>

          {/* Link Button */}
          {announcement.linkUrl && (
            <Button
              onClick={handleLinkClick}
              variant="outline"
              className="w-full justify-center gap-2"
            >
              {announcement.linkText || 'Learn More'}
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
