'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/lib/queries';
import { AvatarSelector } from '@/components/profile/AvatarSelector';
import { BadgeAvatarSelector } from '@/components/achievements/BadgeAvatarSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AvatarEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarEditModal({ open, onOpenChange }: AvatarEditModalProps) {
  const { user } = useAuth();
  const { updateUser } = useAuthStore();
  const { refetch: refetchProfile } = useProfile();
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(
    undefined
  );

  if (!user) return null;

  const handleAvatarUploadComplete = (url: string) => {
    setCurrentAvatar(url);
    updateUser({ avatar: url });
    refetchProfile();

    setTimeout(() => {
      window.location.href = window.location.href;
    }, 500);
  };

  const neuCardRaised = {
    background: 'var(--neu-modal-bg)',
    border: '1px solid var(--neu-border)',
    borderRadius: '1.5rem',
    boxShadow:
      '6px 6px 16px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light), inset 1px 1px 0 rgba(255,255,255,0.03)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-4 sm:max-w-xl sm:p-6 md:max-w-2xl"
        style={neuCardRaised}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold sm:text-2xl"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            Update Avatar
          </DialogTitle>
          <DialogDescription
            className="text-sm sm:text-base"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            Choose your profile avatar style.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notionist" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-lg border border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] p-1">
            <TabsTrigger
              value="notionist"
              className="text-[var(--neu-text-secondary)] data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.1)] data-[state=active]:text-[var(--neu-text-primary)]"
            >
              Notionist
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="text-[var(--neu-text-secondary)] data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.1)] data-[state=active]:text-[var(--neu-text-primary)]"
            >
              Badge Avatars
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notionist" className="mt-4">
            <AvatarSelector
              currentAvatar={currentAvatar || user?.avatar}
              userId={user.id || user._id || ''}
              userName={user.username || user.email || 'User'}
              onAvatarSelected={handleAvatarUploadComplete}
              allowedStyles={['notionists']}
            />
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <BadgeAvatarSelector
              user={user}
              currentAvatar={currentAvatar || user?.avatar}
              onClose={() => {
                handleAvatarUploadComplete(currentAvatar || user?.avatar || '');
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
