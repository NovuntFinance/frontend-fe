'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { QualificationRequirementsContent } from './QualificationRequirementsContent';
import { neuRadius } from './neumorphicTokens';
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
          background: 'var(--neu-modal-bg)',
          boxShadow: 'var(--neu-shadow-raised)',
          border: '1px solid var(--neu-border)',
        }}
      >
        {/* Inner padding: mobile 16px, tablet 24px, desktop 32px */}
        <div className="relative p-4 sm:p-6 lg:p-8">
          <style>{`
            .rank-progress-neu-modal [data-slot="dialog-close"] {
              background: var(--neu-bg);
              box-shadow: var(--neu-shadow-raised);
              border: 1px solid var(--neu-border);
              color: var(--neu-accent);
              border-radius: ${neuRadius.md};
            }
            .rank-progress-neu-modal [data-slot="dialog-close"]:hover {
              box-shadow: var(--neu-shadow-raised-hover);
            }
            .rank-progress-neu-modal [data-slot="dialog-close"]:active {
              box-shadow: var(--neu-shadow-inset-press);
            }
            .rank-progress-neu-modal [data-slot="dialog-close"]:focus-visible {
              outline: 2px solid var(--neu-focus-ring);
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
