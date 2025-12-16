/**
 * Notifications Page
 * Full-page view for managing all notifications
 */

'use client';

import React, { useState } from 'react';
import { Bell, Filter, CheckCircle2, Calendar, X } from 'lucide-react';
import {
  DateFilteredNotificationList,
  type DateFilter,
} from '@/components/notifications/DateFilteredNotificationList';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationType } from '@/types/notification';
import { format } from 'date-fns';

// Category types for notification filtering
type NotificationCategory = 'all' | 'activity' | 'system';

// System & Alerts types: system messages, alerts, bonuses (registration bonus), referrals, security
// Includes 'info' which is the backend type for system/informational messages
const SYSTEM_ALERT_TYPES: NotificationType[] = [
  'system',
  'alert',
  'bonus',
  'referral',
  'security',
  'info',
];

// Activity types: financial transactions and earnings
// Includes 'success' which is the backend type for successful transactions
const ACTIVITY_TYPES: NotificationType[] = [
  'deposit',
  'withdrawal',
  'earning',
  'success',
];

export default function NotificationsPage() {
  const [categoryFilter, setCategoryFilter] =
    useState<NotificationCategory>('all');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterUnread, setFilterUnread] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateRange, setCustomDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filters = {
    ...(filterType !== 'all' && { type: filterType as NotificationType }),
    ...(filterUnread && { unreadOnly: true }),
  };

  const {
    unreadCount = 0,
    markAllAsRead,
    notifications = [],
  } = useNotifications({ filters });

  // Debug: Log notifications and their types
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationsPage] === NOTIFICATIONS DEBUG ===');
      console.log(
        '[NotificationsPage] Total notifications:',
        notifications.length
      );
      console.log('[NotificationsPage] Notification types found:', [
        ...new Set(notifications.map((n) => n.type)),
      ]);
      console.log('[NotificationsPage] All notifications:', notifications);
      if (notifications.length > 0) {
        console.log(
          '[NotificationsPage] Sample notification:',
          notifications[0]
        );
      }
    }
  }, [notifications]);

  // Calculate unread counts for each category (case-insensitive matching)
  const systemAlertsUnread = notifications.filter((n) => {
    const type = (n.type || '').toLowerCase();
    return (
      SYSTEM_ALERT_TYPES.some((t) => t.toLowerCase() === type) && !n.isRead
    );
  }).length;
  const activityUnread = notifications.filter((n) => {
    const type = (n.type || '').toLowerCase();
    return ACTIVITY_TYPES.some((t) => t.toLowerCase() === type) && !n.isRead;
  }).length;

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    if (value !== 'custom') {
      setCustomDateRange({});
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          return `${format(customDateRange.start, 'MMM d')} - ${format(customDateRange.end, 'MMM d')}`;
        }
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-4 py-4 sm:space-y-6 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Bell className="h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
            <span className="truncate">Notifications</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Stay updated with your account activities
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card className="relative overflow-visible border shadow-sm">
        <CardHeader className="relative z-10 pb-4">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-lg">Activity Feed</CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : "You're all caught up!"}
              </CardDescription>
            </div>

            <div className="relative z-20 flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="bg-muted/30 flex items-center rounded-lg border">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('all');
                    setFilterType('all');
                  }}
                  className="rounded-r-none"
                >
                  All
                  {unreadCount > 0 && (
                    <span className="bg-primary/20 ml-1.5 rounded-full px-1.5 py-0.5 text-xs">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant={categoryFilter === 'activity' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('activity');
                    setFilterType('all');
                  }}
                  className="border-border/50 rounded-none border-x"
                >
                  Activity
                  {activityUnread > 0 && (
                    <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                      {activityUnread}
                    </span>
                  )}
                </Button>
                <Button
                  variant={categoryFilter === 'system' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('system');
                    setFilterType('all');
                  }}
                  className="rounded-l-none"
                >
                  System & Alerts
                  {systemAlertsUnread > 0 && (
                    <span className="ml-1.5 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                      {systemAlertsUnread}
                    </span>
                  )}
                </Button>
              </div>

              {/* Date Filter */}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full min-w-[140px] shrink-0 justify-start sm:w-[160px]"
                    onClick={() => setShowDatePicker(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate text-xs sm:text-sm">
                      {getDateFilterLabel()}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="bg-background z-[10000] w-auto border p-0 shadow-lg"
                  align="start"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="space-y-2 p-3">
                    <div className="space-y-1">
                      <Button
                        variant={dateFilter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          handleDateFilterChange('all');
                          setShowDatePicker(false);
                        }}
                      >
                        All Time
                      </Button>
                      <Button
                        variant={dateFilter === 'today' ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          handleDateFilterChange('today');
                          setShowDatePicker(false);
                        }}
                      >
                        Today
                      </Button>
                      <Button
                        variant={dateFilter === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          handleDateFilterChange('week');
                          setShowDatePicker(false);
                        }}
                      >
                        This Week
                      </Button>
                      <Button
                        variant={dateFilter === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          handleDateFilterChange('month');
                          setShowDatePicker(false);
                        }}
                      >
                        This Month
                      </Button>
                    </div>
                    <div className="mt-3 border-t pt-3">
                      <p className="text-muted-foreground mb-2 px-2 text-xs font-medium">
                        Custom Range
                      </p>
                      <div className="grid grid-cols-2 gap-2 px-2">
                        <div>
                          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                            From
                          </label>
                          <input
                            type="date"
                            className="border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1.5 text-xs focus:ring-2 focus:outline-none"
                            value={
                              customDateRange.start
                                ? format(customDateRange.start, 'yyyy-MM-dd')
                                : ''
                            }
                            onChange={(e) => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
                              setCustomDateRange({
                                ...customDateRange,
                                start: date,
                              });
                              if (date) {
                                setDateFilter('custom');
                                // Keep popover open for "To" date selection
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                            To
                          </label>
                          <input
                            type="date"
                            className="border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1.5 text-xs focus:ring-2 focus:outline-none"
                            value={
                              customDateRange.end
                                ? format(customDateRange.end, 'yyyy-MM-dd')
                                : ''
                            }
                            onChange={(e) => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
                              setCustomDateRange({
                                ...customDateRange,
                                end: date,
                              });
                              if (date) {
                                setDateFilter('custom');
                                // Auto-close after both dates are selected
                                if (customDateRange.start && date) {
                                  setTimeout(
                                    () => setShowDatePicker(false),
                                    300
                                  );
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      {dateFilter === 'custom' &&
                        (customDateRange.start || customDateRange.end) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full text-xs"
                            onClick={() => {
                              setCustomDateRange({});
                              setDateFilter('all');
                              setShowDatePicker(false);
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Clear Range
                          </Button>
                        )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Filter by Type - Show relevant options based on category */}
              <Select
                value={filterType}
                onValueChange={(value) => {
                  console.log('[NotificationsPage] Filter changed to:', value);
                  setFilterType(value as NotificationType | 'all');
                }}
              >
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <Filter className="mr-2 h-4 w-4 shrink-0" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent
                  className="z-[9999]"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="all" className="cursor-pointer">
                    All Types
                  </SelectItem>

                  {/* Activity Types - Show for All or Activity category */}
                  {(categoryFilter === 'all' ||
                    categoryFilter === 'activity') && (
                    <>
                      <SelectItem value="deposit" className="cursor-pointer">
                        Deposits
                      </SelectItem>
                      <SelectItem value="withdrawal" className="cursor-pointer">
                        Withdrawals
                      </SelectItem>
                      <SelectItem value="earning" className="cursor-pointer">
                        Earnings
                      </SelectItem>
                      <SelectItem value="success" className="cursor-pointer">
                        Successful Actions
                      </SelectItem>
                    </>
                  )}

                  {/* System & Alert Types - Show for All or System category */}
                  {(categoryFilter === 'all' ||
                    categoryFilter === 'system') && (
                    <>
                      <SelectItem value="info" className="cursor-pointer">
                        Information
                      </SelectItem>
                      <SelectItem value="bonus" className="cursor-pointer">
                        Bonuses & Promotions
                      </SelectItem>
                      <SelectItem value="referral" className="cursor-pointer">
                        Referrals
                      </SelectItem>
                      <SelectItem value="system" className="cursor-pointer">
                        System Messages
                      </SelectItem>
                      <SelectItem value="alert" className="cursor-pointer">
                        Alerts & Announcements
                      </SelectItem>
                      <SelectItem value="security" className="cursor-pointer">
                        Security
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              {/* Filter Unread */}
              <Button
                variant={filterUnread ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterUnread(!filterUnread)}
                className="w-full shrink-0 text-xs sm:w-auto sm:text-sm"
              >
                <span className="whitespace-nowrap">Unread Only</span>
              </Button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full shrink-0 text-xs sm:w-auto sm:text-sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">Mark All Read</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <DateFilteredNotificationList
            filters={filters}
            dateFilter={dateFilter}
            customDateRange={customDateRange}
            includeTypes={
              categoryFilter === 'system'
                ? SYSTEM_ALERT_TYPES
                : categoryFilter === 'activity'
                  ? ACTIVITY_TYPES
                  : undefined
            }
            maxHeight="calc(100vh - 380px)"
            showHeader={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
