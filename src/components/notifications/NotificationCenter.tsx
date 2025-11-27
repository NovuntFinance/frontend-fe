/**
 * NotificationCenter Component
 * Dropdown panel for viewing and managing notifications
 */

'use client';

import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import { NotificationBadge } from './NotificationBadge';
import { DateFilteredNotificationList } from './DateFilteredNotificationList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'system'>('all');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[420px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'all' | 'system')}
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4"
            >
              All Notifications
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4"
            >
              System & Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <DateFilteredNotificationList
              dateFilter="all"
              maxHeight="500px"
              showHeader={false}
              className="max-h-[500px]"
            />
          </TabsContent>

          <TabsContent value="system" className="m-0">
            <DateFilteredNotificationList
              includeTypes={[
                'system',
                'security',
                'alert',
                'bonus',
                'referral',
              ]}
              dateFilter="all"
              maxHeight="500px"
              showHeader={false}
              className="max-h-[500px]"
            />
          </TabsContent>
        </Tabs>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {
              setOpen(false);
              window.location.href = '/dashboard/notifications';
            }}
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
