/**
 * Social Media Confirmation Dialog - Branded Modal
 * Custom branded confirmation dialog for social media verification
 */

'use client';

import React, { useEffect } from 'react';
import { ExternalLink, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLATFORM_CONFIG } from '@/config/socialMediaIcons';
import { SocialMediaPlatform } from '@/types/registrationBonus';

interface SocialMediaConfirmDialogProps {
  isOpen: boolean;
  platform: SocialMediaPlatform | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SocialMediaConfirmDialog({
  isOpen,
  platform,
  onConfirm,
  onCancel,
}: SocialMediaConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !platform) return null;

  const config = PLATFORM_CONFIG[platform];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-sm duration-200"
        onClick={onCancel}
      />

      {/* Dialog Container - Centered */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
        {/* Dialog */}
        <div className="animate-in fade-in zoom-in-95 pointer-events-auto relative w-full max-w-md duration-300">
          <div className="from-background via-background to-novunt-gold-500/5 border-novunt-gold-500/30 shadow-novunt-gold-500/20 relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br shadow-2xl">
            {/* Close button */}
            <button
              onClick={onCancel}
              className="hover:bg-muted/50 absolute top-4 right-4 z-10 rounded-lg p-2 transition-colors"
              title="Close dialog"
              aria-label="Close dialog"
            >
              <X className="text-muted-foreground h-5 w-5" />
            </button>

            {/* Content */}
            <div className="relative z-10 p-6">
              {/* Icon Header */}
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="bg-novunt-gold-500/20 absolute inset-0 rounded-full blur-xl" />
                  <div className="from-novunt-gold-500/20 to-novunt-gold-600/30 border-novunt-gold-500/50 relative rounded-full border-2 bg-gradient-to-br p-4">
                    <IconComponent className="text-novunt-gold-600 dark:text-novunt-gold-500 h-12 w-12" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="from-novunt-gold-600 to-novunt-gold-800 dark:from-novunt-gold-400 dark:to-novunt-gold-600 mb-2 bg-gradient-to-r bg-clip-text text-center text-2xl font-bold text-transparent">
                Follow Novunt on {config.name}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-6 text-center">
                We’ve opened {config.name} in a new tab. Please follow our
                official account to continue.
              </p>

              {/* Steps */}
              <div className="bg-muted/30 mb-6 space-y-3 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-novunt-gold-500/20 text-novunt-gold-600 dark:text-novunt-gold-500 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">
                      Visit the page
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Check the new tab that opened
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-novunt-gold-500/20 text-novunt-gold-600 dark:text-novunt-gold-500 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">
                      Follow us
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Click the Follow/Subscribe button
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-novunt-gold-500/20 text-novunt-gold-600 dark:text-novunt-gold-500 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">
                      Confirm here
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Return and click I Followed button below
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonus Info */}
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  Earn progress towards your 10% registration bonus
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mb-4 flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className={cn(
                    'flex-1',
                    'from-novunt-gold-600 to-novunt-gold-700 bg-gradient-to-r',
                    'hover:from-novunt-gold-700 hover:to-novunt-gold-800',
                    'font-semibold text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    I Followed
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </Button>
              </div>

              {/* Reopen Link */}
              <div className="text-center">
                <button
                  onClick={() =>
                    window.open(config.url, '_blank', 'noopener,noreferrer')
                  }
                  className="text-novunt-gold-600 dark:text-novunt-gold-500 inline-flex items-center gap-1 text-xs hover:underline"
                >
                  Reopen {config.name}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
