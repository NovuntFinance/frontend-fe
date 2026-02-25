'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { QualificationRequirementsContent } from './QualificationRequirementsContent';
import {
  NEU_TOKENS,
  neuModalRaised,
  neuRadius,
  neuInset,
  neuRaised,
} from './neumorphicTokens';
import { cn } from '@/lib/utils';

interface RankProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RankProgressModal({
  open,
  onOpenChange,
}: RankProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        overlayClassName={cn(
          '!bg-transparent',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        )}
        className={cn(
          'rank-progress-neu-modal',
          'overflow-hidden border-0 p-0 shadow-none',
          'max-h-[calc(100vh-2rem)] max-w-[calc(100%-2rem)]',
          'sm:max-w-lg md:max-w-xl lg:max-w-2xl',
          'overflow-y-auto',
          'rounded-[20px]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:duration-200 data-[state=open]:duration-300',
          '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20'
        )}
        style={{
          background: `linear-gradient(165deg, #0f1930 0%, ${NEU_TOKENS.bg} 45%, #0b1222 100%)`,
          boxShadow: neuModalRaised,
          border: `1px solid ${NEU_TOKENS.border}`,
        }}
      >
        {/* Inner padding: mobile 16px, tablet 24px, desktop 32px */}
        <div className="relative p-4 sm:p-6 lg:p-8">
          <style>{`
            .rank-progress-neu-modal [data-slot="dialog-close"] {
              background: ${NEU_TOKENS.bg};
              box-shadow: ${neuRaised};
              border: 1px solid ${NEU_TOKENS.border};
              color: ${NEU_TOKENS.accent};
              border-radius: ${neuRadius.md};
            }
            .rank-progress-neu-modal [data-slot="dialog-close"]:hover {
              box-shadow: 8px 8px 16px rgba(0,0,0,0.4), -4px -4px 12px rgba(255,255,255,0.05);
            }
            .rank-progress-neu-modal [data-slot="dialog-close"]:active {
              box-shadow: ${neuInset};
            }
            .rank-progress-neu-modal [data-slot="dialog-close"]:focus-visible {
              outline: 2px solid ${NEU_TOKENS.focusRing};
              outline-offset: 2px;
            }
          `}</style>
          <div data-rank-modal-inner className="relative">
            <QualificationRequirementsContent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
