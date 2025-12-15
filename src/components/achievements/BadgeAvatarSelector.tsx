/**
 * Badge Avatar Selector Component
 * Allows users to select earned badges as their profile picture
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeAvatar } from '@/components/ui/BadgeAvatar';
import { useEarnedBadges } from '@/lib/queries/achievementQueries';
import { useUpdateProfilePicture } from '@/lib/mutations/profileMutations';
import { toast } from '@/lib/toast';
import { isBadgeIcon, getBadgeIcon } from '@/lib/avatar-utils';
import type { User } from '@/types/user';

interface BadgeAvatarSelectorProps {
  user: Partial<User> | null;
  currentAvatar?: string;
  onClose?: () => void;
}

export function BadgeAvatarSelector({
  user,
  currentAvatar,
  onClose,
}: BadgeAvatarSelectorProps) {
  const { data: badgesData, isLoading } = useEarnedBadges();
  const updateMutation = useUpdateProfilePicture(user?._id || user?.id || '');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(
    currentAvatar && isBadgeIcon(currentAvatar) ? currentAvatar : null
  );

  const earnedBadges = badgesData?.data?.badges || [];
  const currentBadgeIcon =
    currentAvatar && isBadgeIcon(currentAvatar)
      ? getBadgeIcon(currentAvatar)
      : null;

  const handleSelectBadge = async (badgeIcon: string) => {
    setSelectedBadge(badgeIcon);
  };

  const handleSave = async () => {
    if (!selectedBadge || (!user?._id && !user?.id)) {
      toast.error('Please select a badge');
      return;
    }

    try {
      await updateMutation.mutateAsync({ profilePicture: selectedBadge });
      toast.success('Profile picture updated!');
      onClose?.();
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  const handleRemove = async () => {
    if (!user?._id && !user?.id) return;

    try {
      // Set avatar to empty string to use default
      await updateMutation.mutateAsync({ profilePicture: '' });
      toast.success('Profile picture reset to default');
      onClose?.();
    } catch (error) {
      toast.error('Failed to reset profile picture');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Loading badges...</p>
      </div>
    );
  }

  if (earnedBadges.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4 text-sm">
          You haven&apos;t earned any badges yet.
        </p>
        <p className="text-muted-foreground text-xs">
          Earn badges to use them as your profile picture!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">
          Select Badge as Profile Picture
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose from your earned badges to use as your profile picture
        </p>
      </div>

      {/* Current Selection Preview */}
      {selectedBadge && (
        <div className="bg-muted/50 border-border rounded-lg border p-4">
          <p className="mb-2 text-sm font-semibold">Selected Badge:</p>
          <div className="flex items-center gap-3">
            <BadgeAvatar badgeIcon={selectedBadge} size="lg" />
            <div>
              <p className="text-sm font-medium">
                {earnedBadges.find((b) => b.icon === selectedBadge)?.title ||
                  'Badge'}
              </p>
              <p className="text-muted-foreground text-xs">
                This will be your new profile picture
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge Grid */}
      <div className="grid max-h-64 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
        {earnedBadges.map((badge) => {
          const isSelected = selectedBadge === badge.icon;
          const isCurrent = currentBadgeIcon === badge.icon;

          return (
            <motion.button
              key={badge.badgeType}
              onClick={() => handleSelectBadge(badge.icon)}
              className={cn(
                'relative rounded-lg border-2 p-3 transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50',
                isCurrent && 'ring-2 ring-emerald-500/50'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BadgeAvatar badgeIcon={badge.icon} size="md" />

              {/* Selected Indicator */}
              {isSelected && (
                <div className="bg-primary absolute -top-1 -right-1 rounded-full p-1">
                  <Check className="text-primary-foreground h-3 w-3" />
                </div>
              )}

              {/* Current Badge Indicator */}
              {isCurrent && !isSelected && (
                <div className="absolute -top-1 -right-1 rounded-full bg-emerald-500 p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              <p className="mt-2 line-clamp-1 text-center text-xs">
                {badge.title}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        {currentBadgeIcon && (
          <Button variant="outline" onClick={handleRemove} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!selectedBadge || updateMutation.isPending}
          className="flex-1"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
