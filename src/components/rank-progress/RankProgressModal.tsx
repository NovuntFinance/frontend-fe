'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { RankProgressCard } from './RankProgressCard';
import { cn } from '@/lib/utils';

const NEU_BG = '#131B2E';
const NEU_SHADOW_DARK = 'rgba(0, 0, 0, 0.5)';
const NEU_SHADOW_LIGHT = 'rgba(255, 255, 255, 0.05)';

interface RankProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RankProgressModal({ open, onOpenChange }: RankProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          'border-white/10 p-0 overflow-hidden',
          'bg-transparent shadow-none',
          'max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-xl',
          'max-h-[calc(100vh-3rem)] overflow-y-auto'
        )}
        style={{
          background: NEU_BG,
          boxShadow: `
            16px 16px 32px ${NEU_SHADOW_DARK},
            -16px -16px 32px ${NEU_SHADOW_LIGHT},
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        <div className="relative p-4 sm:p-5">
          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, rgba(0, 155, 242, 0.06) 0%, transparent 50%)`,
            }}
          />
          <div className="relative">
            <RankProgressCard />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
