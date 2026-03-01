'use client';

import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Mail as MessageIcon,
  DollarSign,
  TrendingUp,
  Users,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

export function NotificationsModal({
  open,
  onOpenChange,
}: NotificationsModalProps) {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      icon: MessageIcon,
      enabled: false,
    },
    {
      id: 'deposits',
      title: 'Deposit Alerts',
      description: 'Get notified when deposits are successful',
      icon: DollarSign,
      enabled: true,
    },
    {
      id: 'withdrawals',
      title: 'Withdrawal Alerts',
      description: 'Get notified when withdrawals are processed',
      icon: DollarSign,
      enabled: true,
    },
    {
      id: 'stakes',
      title: 'Stake Updates',
      description: 'Receive updates on your stakes and earnings',
      icon: TrendingUp,
      enabled: true,
    },
    {
      id: 'referrals',
      title: 'Referral Notifications',
      description: 'Get notified when someone joins through your link',
      icon: Users,
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = () => {
    // TODO: Save notification settings to backend
    toast.success('Notification preferences saved!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] p-4 sm:max-w-xl sm:p-6 md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            Notification Settings
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Manage how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {settings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.id}
                className="border-border bg-card hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div className="flex flex-1 items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={setting.id}
                      className="cursor-pointer text-base font-medium"
                    >
                      {setting.title}
                    </Label>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.enabled}
                  onCheckedChange={() => handleToggle(setting.id)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
