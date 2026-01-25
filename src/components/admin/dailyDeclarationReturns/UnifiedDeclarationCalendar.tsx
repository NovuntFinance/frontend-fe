'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useDeclaredReturns } from '@/lib/queries';
import {
  utcDayString,
  isTodayDate,
  isPastDate,
  isFutureDate,
} from '@/lib/dateUtils';
import { ShimmerCard } from '@/components/ui/shimmer';
import type { DailyDeclarationReturn } from '@/types/dailyDeclarationReturns';

interface UnifiedDeclarationCalendarProps {
  onDateClick?: (date: string) => void;
  onDeclareClick?: () => void;
}

export function UnifiedDeclarationCalendar({
  onDateClick,
  onDeclareClick,
}: UnifiedDeclarationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get declared returns for the next 30 days
  const todayUtc = utcDayString();
  const todayDate = new Date();
  const endDate = new Date(todayDate);
  endDate.setUTCDate(todayDate.getUTCDate() + 30);
  const endDateUtc = utcDayString(endDate);

  const { data, isLoading } = useDeclaredReturns({
    startDate: todayUtc,
    endDate: endDateUtc,
    includeDistributed: true,
  });

  const declarations = data?.declarations || [];

  // Create a map for quick lookup
  const declarationMap = new Map<string, DailyDeclarationReturn>();
  declarations.forEach((declaration) => {
    declarationMap.set(declaration.date, declaration);
  });

  // Generate 30 days starting from today (using UTC day strings)
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(todayDate);
    date.setUTCDate(todayDate.getUTCDate() + i);
    const dateStr = utcDayString(date);
    const declaration = declarationMap.get(dateStr);

    return {
      dateStr,
      declaration,
      isToday: isTodayDate(dateStr, todayUtc),
      isPast: isPastDate(dateStr, todayUtc),
      isFuture: isFutureDate(dateStr, todayUtc),
    };
  });

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  const getDateColor = (day: (typeof days)[0]) => {
    if (day.isPast && !day.declaration)
      return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
    if (day.isToday)
      return 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500';
    if (day.declaration?.poolsDistributed && day.declaration?.rosDistributed)
      return 'bg-green-50 dark:bg-green-900/20 border border-green-500/30';
    if (
      day.declaration &&
      (!day.declaration.poolsDistributed || !day.declaration.rosDistributed)
    )
      return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500/30';
    return 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700';
  };

  const getStatusLabel = (day: (typeof days)[0]): string => {
    if (!day.declaration) {
      return 'Not Declared';
    }
    if (day.declaration.poolsDistributed && day.declaration.rosDistributed) {
      return 'Fully Distributed';
    }
    if (day.declaration.poolsDistributed || day.declaration.rosDistributed) {
      return 'Partially Distributed';
    }
    if (day.isPast) {
      return 'Pending (missed)';
    }
    return 'Pending (scheduled)';
  };

  const getDateBadge = (day: (typeof days)[0]) => {
    if (day.isPast && !day.declaration) return null; // Past dates without declaration don't show badge

    if (day.declaration?.poolsDistributed && day.declaration?.rosDistributed) {
      return (
        <Badge
          variant="default"
          className="bg-green-500 text-[10px] whitespace-nowrap text-white sm:text-xs"
        >
          <CheckCircle2 className="mr-1 h-3 w-3 flex-shrink-0" />
          <span className="truncate">Fully Distributed</span>
        </Badge>
      );
    }
    if (day.declaration) {
      const isPartiallyDistributed =
        day.declaration.poolsDistributed || day.declaration.rosDistributed;
      const label = day.isPast
        ? 'Pending (missed)'
        : isPartiallyDistributed
          ? 'Partial'
          : 'Pending';
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 text-[10px] whitespace-nowrap text-white sm:text-xs"
        >
          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] whitespace-nowrap sm:text-xs"
      >
        <AlertCircle className="mr-1 h-3 w-3 flex-shrink-0" />
        <span className="truncate">Not Declared</span>
      </Badge>
    );
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">
              Declaration Calendar (Next 30 Days)
            </span>
          </CardTitle>
          {onDeclareClick && (
            <Button
              onClick={onDeclareClick}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="xs:inline hidden">Declare Returns</span>
              <span className="xs:hidden">Declare</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ShimmerCard key={i} className="h-40 sm:h-36" />
            ))}
          </div>
        ) : (
          <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {days.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => handleDateClick(day.dateStr)}
                className={`group relative flex min-h-[140px] flex-col items-start rounded-lg p-2.5 text-left transition-all hover:shadow-md sm:min-h-[130px] sm:p-3 ${getDateColor(day)} ${day.isPast && !day.declaration ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                disabled={day.isPast && !day.declaration}
                title={
                  day.declaration
                    ? `${formatDateLabel(day.dateStr)} - ${getStatusLabel(day)}${
                        !day.declaration.poolsDistributed ||
                        !day.declaration.rosDistributed
                          ? '. Users cannot see this until 23:59:59 BIT after distribution.'
                          : '. Visible to users.'
                      }`
                    : formatDateLabel(day.dateStr)
                }
              >
                <div className="mb-2 w-full">
                  <div className="truncate text-[10px] font-medium text-gray-600 sm:text-xs dark:text-gray-400">
                    {formatDateLabel(day.dateStr)}
                  </div>
                  <div className="mt-1 text-base font-semibold sm:text-lg">
                    {new Date(day.dateStr + 'T00:00:00Z').getUTCDate()}
                  </div>
                </div>

                {day.declaration && (
                  <div className="mt-auto w-full space-y-1.5 text-[10px] sm:text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-muted-foreground truncate">
                        Pools:
                      </span>
                      <span
                        className="truncate font-medium"
                        title={`$${day.declaration.totalPoolAmount.toLocaleString()}`}
                      >
                        ${day.declaration.totalPoolAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-muted-foreground truncate">
                        ROS:
                      </span>
                      <span className="truncate font-medium">
                        {day.declaration.rosPercentage}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {day.declaration.poolsDistributed && (
                        <Badge
                          variant="outline"
                          className="h-4 bg-green-100 px-1 text-[9px] text-green-700 sm:text-[10px] dark:bg-green-900/30 dark:text-green-400"
                          title="Pools Distributed"
                        >
                          P
                        </Badge>
                      )}
                      {day.declaration.rosDistributed && (
                        <Badge
                          variant="outline"
                          className="h-4 bg-blue-100 px-1 text-[9px] text-blue-700 sm:text-[10px] dark:bg-blue-900/30 dark:text-blue-400"
                          title="ROS Distributed"
                        >
                          R
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex min-h-[20px] w-full items-start">
                  {getDateBadge(day)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-4 text-[10px] sm:gap-4 sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20" />
            <span className="whitespace-nowrap">Today</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded border border-green-500/30 bg-green-50 dark:bg-green-900/20" />
            <span className="whitespace-nowrap">Fully Distributed</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/20" />
            <span className="whitespace-nowrap">Pending/Partial</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" />
            <span className="whitespace-nowrap">Not Declared</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
