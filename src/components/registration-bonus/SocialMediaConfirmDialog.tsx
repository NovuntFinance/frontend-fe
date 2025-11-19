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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog Container - Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        {/* Dialog */}
        <div className="relative w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="relative bg-gradient-to-br from-background via-background to-novunt-gold-500/5 border-2 border-novunt-gold-500/30 rounded-2xl shadow-2xl shadow-novunt-gold-500/20 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Icon Header */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-novunt-gold-500/20 rounded-full blur-xl" />
                <div className="relative p-4 bg-gradient-to-br from-novunt-gold-500/20 to-novunt-gold-600/30 rounded-full border-2 border-novunt-gold-500/50">
                  <IconComponent className="h-12 w-12 text-novunt-gold-600 dark:text-novunt-gold-500" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-novunt-gold-600 to-novunt-gold-800 dark:from-novunt-gold-400 dark:to-novunt-gold-600 bg-clip-text text-transparent">
              Follow Novunt on {config.name}
            </h2>

            {/* Description */}
            <p className="text-center text-muted-foreground mb-6">
              We've opened {config.name} in a new tab. Please follow our official account to continue.
            </p>

            {/* Steps */}
            <div className="bg-muted/30 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-novunt-gold-500/20 text-novunt-gold-600 dark:text-novunt-gold-500 text-sm font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Visit the page</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Check the new tab that opened
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-novunt-gold-500/20 text-novunt-gold-600 dark:text-novunt-gold-500 text-sm font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Follow us</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click the Follow/Subscribe button
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-novunt-gold-500/20 text-novunt-gold-600 dark:text-novunt-gold-500 text-sm font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Confirm here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Return and click I Followed button below
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus Info */}
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                Earn progress towards your 10% registration bonus
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className={cn(
                  "flex-1",
                  "bg-gradient-to-r from-novunt-gold-600 to-novunt-gold-700",
                  "hover:from-novunt-gold-700 hover:to-novunt-gold-800",
                  "text-white font-semibold"
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
                onClick={() => window.open(config.url, '_blank', 'noopener,noreferrer')}
                className="text-xs text-novunt-gold-600 dark:text-novunt-gold-500 hover:underline inline-flex items-center gap-1"
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
