'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Edit, CheckCircle2, Clock, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeclaredDailyProfits } from '@/lib/queries';
import { LoadingStates } from '@/components/ui/loading-states';
import { DeclareProfitModal } from './DeclareProfitModal';
import { BulkDeclareModal } from './BulkDeclareModal';
import type { DailyProfit } from '@/types/dailyProfit';
import {
  utcDayString,
  isPastDate,
  isTodayDate,
  isFutureDate,
  formatWeekdayShort,
  formatDateShort,
} from '@/lib/dateUtils';

interface DailyProfitCalendarProps {
  onDateClick?: (date: string) => void;
}

export function DailyProfitCalendar({ onDateClick }: DailyProfitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // Get declared profits for the next 30 days
  const todayUtc = utcDayString();

  // Calculate end date (30 days from today) using UTC day strings
  const todayDate = new Date();
  const endDate = new Date(todayDate);
  endDate.setUTCDate(todayDate.getUTCDate() + 30);
  const endDateUtc = utcDayString(endDate);

  const { data, isLoading } = useDeclaredDailyProfits({
    startDate: todayUtc,
    endDate: endDateUtc,
  });

  const declaredProfits = data?.dailyProfits || [];

  // Create a map for quick lookup
  const profitMap = new Map<string, DailyProfit>();
  declaredProfits.forEach((profit) => {
    profitMap.set(profit.date, profit);
  });

  // Generate 30 days starting from today (using UTC day strings)
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(todayDate);
    date.setUTCDate(todayDate.getUTCDate() + i);
    const dateStr = utcDayString(date);
    const profit = profitMap.get(dateStr);

    return {
      dateStr,
      profit,
      isToday: isTodayDate(dateStr, todayUtc),
      isPast: isPastDate(dateStr, todayUtc),
      isFuture: isFutureDate(dateStr, todayUtc),
    };
  });

  const handleDateClick = (dateStr: string) => {
    if (onDateClick) {
      onDateClick(dateStr);
    } else {
      setSelectedDate(dateStr);
      // Always open the modal for the selected date. If the day is already
      // declared+distributed, the modal will show "Distributed (locked)" and
      // disable editing.
      setEditingDate(dateStr);
      setDeclareModalOpen(true);
    }
  };

  const getDateColor = (day: (typeof days)[0]) => {
    if (day.isPast) return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
    if (day.isToday)
      return 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500';
    if (day.profit?.isDistributed)
      return 'bg-green-50 dark:bg-green-900/20 border border-green-500/30';
    if (day.profit && !day.profit.isDistributed)
      return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500/30';
    return 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700';
  };

  const getStatusLabel = (day: (typeof days)[0]): string => {
    if (day.profit?.isDistributed) {
      return 'Distributed (locked)';
    }
    if (day.profit && !day.profit.isDistributed) {
      if (day.isPast) {
        return 'Pending (missed)';
      }
      return 'Pending (scheduled)';
    }
    return 'Not Set';
  };

  const getDateBadge = (day: (typeof days)[0]) => {
    if (day.isPast && !day.profit) return null; // Past dates without profit don't show badge

    if (day.profit?.isDistributed) {
      return (
        <Badge variant="default" className="bg-green-500 text-xs text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Distributed (locked)
        </Badge>
      );
    }
    if (day.profit && !day.profit.isDistributed) {
      const label = day.isPast ? 'Pending (missed)' : 'Pending (scheduled)';
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-xs text-white">
          <Clock className="mr-1 h-3 w-3" />
          {label}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        Not Set
      </Badge>
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 bg-gradient-to-br from-blue-50 to-white pb-4 sm:pb-6 dark:from-gray-800 dark:to-gray-900">
          <div className="space-y-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <Calendar className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                Daily Profit Calendar
              </CardTitle>
              <CardDescription className="mt-2 text-sm leading-relaxed sm:text-base">
                30-day lookahead • Tap a date to manage profit
              </CardDescription>
            </div>

            {/* Action buttons - Larger, more prominent */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setBulkModalOpen(true)}
                className="w-full border-2 text-base font-medium sm:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Bulk Declare
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setEditingDate(null);
                  setDeclareModalOpen(true);
                }}
                className="w-full bg-blue-600 text-base font-medium hover:bg-blue-700 sm:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Declare Profit
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 35 }).map((_, i) => (
                <LoadingStates.Card key={i} height="h-32 sm:h-36 lg:h-40" />
              ))}
            </div>
          ) : (
            <>
              {/* Legend - Clearer with better spacing */}
              <div className="rounded-lg border bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Status Legend
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex-shrink-0 rounded-md border-2 border-blue-500 bg-blue-100 sm:h-5 sm:w-5 dark:bg-blue-900/30" />
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex-shrink-0 rounded-md bg-green-500 sm:h-5 sm:w-5" />
                    <span className="text-sm font-medium">
                      Distributed (locked)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex-shrink-0 rounded-md bg-yellow-500 sm:h-5 sm:w-5" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex-shrink-0 rounded-md border-2 border-dashed border-gray-300 bg-white sm:h-5 sm:w-5 dark:border-gray-600 dark:bg-gray-800" />
                    <span className="text-sm font-medium">Not Set</span>
                  </div>
                </div>
              </div>

              {/* Calendar Grid - Responsive columns: 2 on mobile, 4 on tablet, 5 on desktop */}
              <div className="space-y-3">
                {/* Day Headers - Hidden on mobile, visible on larger screens */}
                <div className="hidden grid-cols-5 gap-3 lg:grid">
                  {[
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ]
                    .slice(0, 5)
                    .map((day) => (
                      <div
                        key={day}
                        className="py-2 text-center text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400"
                      >
                        {day}
                      </div>
                    ))}
                </div>

                {/* Calendar Days - 2 columns on mobile, 3 on tablet, 5 on desktop */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
                  {days.map((day) => (
                    <button
                      key={day.dateStr}
                      onClick={() =>
                        !day.isPast && handleDateClick(day.dateStr)
                      }
                      disabled={day.isPast}
                      className={`group relative flex min-h-[140px] flex-col overflow-hidden rounded-2xl border-2 p-3 shadow-md transition-all duration-200 sm:min-h-[150px] sm:p-4 lg:min-h-[160px] ${
                        day.isPast
                          ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-40 dark:border-gray-700 dark:bg-gray-800/50'
                          : day.isToday
                            ? 'border-blue-500 bg-blue-50 shadow-lg dark:bg-blue-900/20'
                            : day.profit?.isDistributed
                              ? 'border-green-400 bg-green-50 hover:shadow-xl dark:border-green-600 dark:bg-green-900/20'
                              : day.profit
                                ? 'border-yellow-400 bg-yellow-50 hover:shadow-xl dark:border-yellow-600 dark:bg-yellow-900/20'
                                : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-xl dark:border-gray-600 dark:bg-gray-800/30'
                      } ${!day.isPast ? 'cursor-pointer active:scale-95' : ''} ${
                        selectedDate === day.dateStr
                          ? 'ring-4 ring-blue-500 ring-offset-2'
                          : ''
                      }`}
                    >
                      {/* Day name + Date number */}
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            {formatWeekdayShort(day.dateStr)}
                          </div>
                          <div
                            className={`text-2xl leading-none font-bold sm:text-3xl ${
                              day.isToday
                                ? 'text-blue-700 dark:text-blue-300'
                                : day.profit?.isDistributed
                                  ? 'text-green-700 dark:text-green-300'
                                  : day.profit
                                    ? 'text-yellow-700 dark:text-yellow-300'
                                    : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {day.dateStr.split('-')[2]}
                          </div>
                        </div>

                        {/* Edit indicator */}
                        {day.profit && !day.isPast && (
                          <div className="rounded-full bg-white/80 p-1.5 backdrop-blur-sm dark:bg-gray-800/80">
                            {day.profit.isDistributed ? (
                              <Lock className="h-4 w-4 text-green-700 dark:text-green-300" />
                            ) : (
                              <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Profit info - Better spacing and larger text */}
                      {day.profit ? (
                        <div className="mb-auto space-y-2 text-left">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Premium Pool
                            </div>
                            <div className="text-lg font-bold text-green-700 sm:text-xl dark:text-green-400">
                              $
                              {(day.profit.premiumPoolAmount / 1000).toFixed(0)}
                              k
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Performance
                            </div>
                            <div className="text-lg font-bold text-blue-700 sm:text-xl dark:text-blue-400">
                              $
                              {(
                                day.profit.performancePoolAmount / 1000
                              ).toFixed(0)}
                              k
                            </div>
                          </div>

                          <div className="rounded-lg bg-purple-100 px-2 py-1.5 dark:bg-purple-900/30">
                            <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
                              ROS {day.profit.rosPercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-auto flex flex-1 items-center justify-center py-4">
                          <div className="text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                            Not Set
                          </div>
                        </div>
                      )}

                      {/* Status indicator - Bottom badge */}
                      {!day.isPast && (
                        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                          {day.profit?.isDistributed ? (
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500 py-2 text-white shadow-md">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm font-bold tracking-wide uppercase">
                                Distributed (locked)
                              </span>
                            </div>
                          ) : day.profit ? (
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-2 text-white shadow-md">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-bold tracking-wide uppercase">
                                {day.isPast
                                  ? 'Pending (missed)'
                                  : 'Pending (scheduled)'}
                              </span>
                            </div>
                          ) : (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white/50 py-2 text-center dark:border-gray-600 dark:bg-gray-700/50">
                              <span className="text-sm font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                Tap to Set
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DeclareProfitModal
        open={declareModalOpen}
        onOpenChange={setDeclareModalOpen}
        initialDate={editingDate || undefined}
        editingProfit={
          editingDate ? profitMap.get(editingDate) || undefined : undefined
        }
      />
      <BulkDeclareModal open={bulkModalOpen} onOpenChange={setBulkModalOpen} />
    </>
  );
}
