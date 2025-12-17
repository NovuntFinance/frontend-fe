'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, TrendingUp, Gift, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveAnnouncements } from '@/lib/queries';
import type { Announcement as AnnouncementType } from '@/types/announcement';
import { AnnouncementModal } from './AnnouncementModal';

interface InfoMarqueeProps {
  announcements?: AnnouncementType[]; // Optional override for testing
  speed?: number;
  className?: string;
}

// Fallback announcements (used only if API fails or no announcements)
const defaultAnnouncements: AnnouncementType[] = [
  {
    id: 'fallback-1',
    text: '🚀 Welcome to Novunt - Your Gateway to Financial Growth',
    type: 'info',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getIcon = (type: AnnouncementType['type']) => {
  switch (type) {
    case 'success':
      return <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
    case 'warning':
      return <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
    case 'promo':
      return <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
    default:
      return <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
  }
};

const getColorClasses = (type: AnnouncementType['type']) => {
  switch (type) {
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'promo':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-indigo-600 dark:text-indigo-400';
  }
};

export function InfoMarquee({
  announcements: propAnnouncements,
  speed = 30,
  className,
}: InfoMarqueeProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch announcements from API
  const { data: apiAnnouncements = [], isLoading } = useActiveAnnouncements();

  // Use prop announcements if provided (for testing), otherwise use API data, fallback to defaults
  const announcements =
    propAnnouncements || apiAnnouncements.length > 0
      ? apiAnnouncements
      : defaultAnnouncements;

  // Sort by priority (lower number = higher priority), then by creation date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const priorityA = a.priority ?? 999;
    const priorityB = b.priority ?? 999;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Don't render if loading and no announcements
  if (isLoading && announcements.length === 0) {
    return null;
  }

  // Don't render if no announcements
  if (sortedAnnouncements.length === 0) {
    return null;
  }

  // Duplicate announcements for seamless loop
  const duplicatedAnnouncements = [
    ...sortedAnnouncements,
    ...sortedAnnouncements,
  ];

  const handleAnnouncementClick = (announcement: AnnouncementType) => {
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'relative flex h-full w-full items-center overflow-hidden',
          className
        )}
      >
        {/* Gradient fade on edges - theme aware */}
        <div className="from-background via-background pointer-events-none absolute top-0 left-0 z-10 h-full w-16 bg-gradient-to-r to-transparent dark:from-slate-950 dark:via-slate-950" />
        <div className="from-background via-background pointer-events-none absolute top-0 right-0 z-10 h-full w-16 bg-gradient-to-l to-transparent dark:from-slate-950 dark:via-slate-950" />

        <motion.div
          className="flex items-center gap-8"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: speed,
              ease: 'linear',
            },
          }}
        >
          {duplicatedAnnouncements.map((announcement, index) => (
            <button
              key={`${announcement.id}-${index}`}
              onClick={() => handleAnnouncementClick(announcement)}
              className="focus-visible:ring-primary -mx-2 -my-1 flex shrink-0 cursor-pointer items-center gap-2 rounded px-2 py-1 whitespace-nowrap transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label={`View announcement: ${announcement.text}`}
            >
              <div
                className={cn(
                  'flex items-center justify-center',
                  getColorClasses(announcement.type)
                )}
              >
                {announcement.icon ? (
                  <span className="text-sm sm:text-base">
                    {announcement.icon}
                  </span>
                ) : (
                  getIcon(announcement.type)
                )}
              </div>
              <span className="text-foreground text-xs font-medium sm:text-sm dark:text-white/90">
                {announcement.text}
              </span>
              {/* Separator dot */}
              {index < duplicatedAnnouncements.length - 1 && (
                <div className="bg-foreground/30 mx-2 h-1 w-1 rounded-full dark:bg-white/30" />
              )}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
