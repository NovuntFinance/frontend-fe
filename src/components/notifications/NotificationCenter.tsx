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

      <DropdownMenuContent
        align="end"
        className="flex h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden p-0 sm:h-[600px] sm:w-[420px]"
        sideOffset={8}
      >
        {/* Fixed Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3">
          <h3 className="text-sm font-semibold sm:text-base">Notifications</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'all' | 'system')}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="w-full shrink-0 justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-primary shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs sm:px-4 sm:text-sm"
            >
              <span className="whitespace-nowrap">All Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:border-primary shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs sm:px-4 sm:text-sm"
            >
              <span className="whitespace-nowrap">System & Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="all"
            className="m-0 min-h-0 flex-1 overflow-hidden"
          >
            <DateFilteredNotificationList
              dateFilter="all"
              maxHeight="100%"
              showHeader={false}
              className="h-full"
            />
          </TabsContent>

          <TabsContent
            value="system"
            className="m-0 min-h-0 flex-1 overflow-hidden"
          >
            <DateFilteredNotificationList
              includeTypes={[
                'system',
                'security',
                'alert',
                'bonus',
                'referral',
                'info', // Backend type for system messages
              ]}
              dateFilter="all"
              maxHeight="100%"
              showHeader={false}
              className="h-full"
            />
          </TabsContent>
        </Tabs>

        {/* Fixed Footer */}
        <div className="bg-background shrink-0 border-t p-2">
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
