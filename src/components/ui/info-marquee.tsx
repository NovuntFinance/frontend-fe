'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaVolumeUp } from 'react-icons/fa';
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

  // Quadruple announcements for seamless loop on wider screens
  const duplicatedAnnouncements = [
    ...sortedAnnouncements,
    ...sortedAnnouncements,
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
          'relative flex w-full items-center overflow-hidden',
          className
        )}
        style={{
          background: 'var(--neu-bg)',
          borderTop: '1px solid rgba(var(--neu-accent-rgb), 0.25)',
          borderBottom: '1px solid rgba(var(--neu-accent-rgb), 0.25)',
        }}
      >
        {/* Speaker icon - fixed left */}
        <div className="z-20 flex shrink-0 items-center justify-center px-3 py-1.5">
          <FaVolumeUp
            className="h-4 w-4"
            style={{ color: 'var(--neu-accent)' }}
            aria-hidden={false}
            role="img"
          />
        </div>

        {/* Scrolling area */}
        <div className="relative flex-1 overflow-hidden py-1.5">
          {/* Fade edges */}
          <div
            className="pointer-events-none absolute top-0 left-0 z-10 h-full w-8"
            style={{
              background:
                'linear-gradient(to right, var(--neu-bg), transparent)',
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 z-10 h-full w-8"
            style={{
              background:
                'linear-gradient(to left, var(--neu-bg), transparent)',
            }}
          />

          <motion.div
            className="flex items-center gap-10"
            animate={{
              x: ['0%', '-25%'],
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
                className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap transition-opacity hover:opacity-70 focus-visible:outline-none"
              >
                <span
                  className="text-xs font-medium italic sm:text-sm"
                  style={{ color: 'var(--neu-accent)' }}
                >
                  {announcement.text}
                </span>
                {/* Separator dot */}
                {index < duplicatedAnnouncements.length - 1 && (
                  <span
                    className="mx-4 text-xs"
                    style={{ color: 'rgba(var(--neu-accent-rgb), 0.4)' }}
                  >
                    •
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
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
