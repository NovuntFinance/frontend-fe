'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash, CheckCircle2, Clock } from 'lucide-react';
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
import { ShimmerCard } from '@/components/ui/shimmer';
import { LoadingStates } from '@/components/ui/loading-states';
import { DeclareProfitModal } from './DeclareProfitModal';
import { BulkDeclareModal } from './BulkDeclareModal';
import type { DailyProfit } from '@/types/dailyProfit';
import { format, addDays, startOfToday, isToday, isPast } from 'date-fns';

interface DailyProfitCalendarProps {
  onDateClick?: (date: string) => void;
}

export function DailyProfitCalendar({ onDateClick }: DailyProfitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // Get declared profits for the next 30 days
  const today = startOfToday();
  const endDate = addDays(today, 30);

  const { data, isLoading } = useDeclaredDailyProfits({
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  });

  const declaredProfits = data?.dailyProfits || [];

  // Create a map for quick lookup
  const profitMap = new Map<string, DailyProfit>();
  declaredProfits.forEach((profit) => {
    profitMap.set(profit.date, profit);
  });

  // Generate 30 days starting from today
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const profit = profitMap.get(dateStr);

    return {
      date,
      dateStr,
      profit,
      isToday: isToday(date),
      isPast: isPast(date) && !isToday(date),
    };
  });

  const handleDateClick = (dateStr: string) => {
    if (onDateClick) {
      onDateClick(dateStr);
    } else {
      setSelectedDate(dateStr);
      const profit = profitMap.get(dateStr);
      if (profit && !profit.isDistributed) {
        setEditingDate(dateStr);
        setDeclareModalOpen(true);
      } else {
        setEditingDate(null);
        setDeclareModalOpen(true);
      }
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

  const getDateBadge = (day: (typeof days)[0]) => {
    if (day.isPast) return null;
    if (day.profit?.isDistributed) {
      return (
        <Badge variant="default" className="bg-green-500 text-xs text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Distributed
        </Badge>
      );
    }
    if (day.profit && !day.profit.isDistributed) {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-xs text-white">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        Not Declared
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Profit Calendar
              </CardTitle>
              <CardDescription>
                30-day lookahead - Click a date to declare or edit profit
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Bulk Declare
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingDate(null);
                  setDeclareModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Declare Profit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <LoadingStates.Card key={i} height="h-24" />
              ))}
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="mb-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-green-500/30 bg-green-50 dark:bg-green-900/20" />
                  <span>Distributed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/20" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" />
                  <span>Not Declared</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-800" />
                  <span>Past</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar Days */}
                {days.map((day) => (
                  <button
                    key={day.dateStr}
                    onClick={() => !day.isPast && handleDateClick(day.dateStr)}
                    disabled={day.isPast}
                    className={`relative rounded-lg border p-2 transition-all ${getDateColor(day)} ${!day.isPast ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'} ${selectedDate === day.dateStr ? 'ring-2 ring-blue-500' : ''} `}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-medium">
                        {format(day.date, 'd')}
                      </div>
                      {day.profit && (
                        <div className="text-xs font-bold">
                          {day.profit.profitPercentage.toFixed(1)}%
                        </div>
                      )}
                      {getDateBadge(day)}
                    </div>
                    {day.profit && !day.isPast && (
                      <div className="absolute top-1 right-1">
                        <Edit className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
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
