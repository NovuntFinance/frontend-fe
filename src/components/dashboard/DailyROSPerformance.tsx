'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfitHistory } from '@/lib/queries';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { hoverAnimation } from '@/design-system/animations';
import { pct4 } from '@/utils/formatters';

type TimeRange = '7D' | '30D' | '100D';

const timeRanges: TimeRange[] = ['7D', '30D', '100D'];

/**
 * Daily ROS Performance Card
 *
 * Displays a graph of declared ROS percentages over time.
 * Shows 7D, 30D, or 100D views with interactive chart.
 */
export function DailyROSPerformance() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Determine limit based on selected range
  const limit = useMemo(() => {
    switch (selectedRange) {
      case '7D':
        return 7;
      case '30D':
        return 30;
      case '100D':
        return 100;
      default:
        return 7;
    }
  }, [selectedRange]);

  // Fetch profit history for selected range
  const { data: profitHistory, isLoading, error } = useProfitHistory(limit, 0);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DailyROSPerformance] Data Debug:', {
        profitHistory,
        hasProfits: !!profitHistory?.profits,
        profitsLength: profitHistory?.profits?.length || 0,
        profits: profitHistory?.profits,
        isLoading,
        error,
        errorStatus: error?.statusCode || error?.response?.status,
        errorMessage: error?.message || error?.response?.data?.message,
      });
    }
  }, [profitHistory, isLoading, error]);

  // Prepare chart data - reverse to show oldest to newest (left to right)
  const chartData = useMemo(() => {
    if (!profitHistory?.profits) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[DailyROSPerformance] No profits data:', {
          profitHistory,
          hasProfits: !!profitHistory?.profits,
        });
      }
      return [];
    }

    // Sort by date (oldest first) and take the last N entries
    const sorted = [...profitHistory.profits]
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(-limit)
      // Filter out entries with invalid rosPercentage values
      .filter((d) => {
        const ros = d.rosPercentage;
        return (
          ros !== undefined &&
          ros !== null &&
          !isNaN(ros) &&
          isFinite(ros) &&
          ros >= 0
        );
      })
      // Ensure rosPercentage is a valid number
      .map((d) => ({
        ...d,
        rosPercentage: Number(d.rosPercentage) || 0,
      }));

    return sorted;
  }, [profitHistory, limit]);

  // Calculate max percentage for chart scaling
  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 1;
    const validPercentages = chartData
      .map((d) => d.rosPercentage)
      .filter((p) => !isNaN(p) && isFinite(p) && p >= 0);
    if (validPercentages.length === 0) return 1;
    const max = Math.max(...validPercentages);
    // Add 10% padding for better visualization
    return max * 1.1 || 1;
  }, [chartData]);

  // Calculate average percentage
  const averagePercentage = useMemo(() => {
    if (chartData.length === 0) return 0;
    const validPercentages = chartData
      .map((d) => d.rosPercentage)
      .filter((p) => !isNaN(p) && isFinite(p) && p >= 0);
    if (validPercentages.length === 0) return 0;
    const sum = validPercentages.reduce((acc, p) => acc + p, 0);
    return sum / validPercentages.length;
  }, [chartData]);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DailyROSPerformance] Profit History:', {
        profitHistory,
        profitsCount: profitHistory?.profits?.length || 0,
        firstProfit: profitHistory?.profits?.[0],
        isLoading,
        error,
        chartDataLength: chartData.length,
        averagePercentage,
        chartDataSample: chartData.slice(0, 3),
      });
    }
  }, [profitHistory, isLoading, error, chartData, averagePercentage]);

  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent" />

      {/* Animated Floating Blob */}
      <motion.div
        animate={{
          x: [0, -15, 0],
          y: [0, 10, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
      />

      <CardHeader className="relative p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2 sm:gap-3">
          <motion.div
            {...hoverAnimation()}
            className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
          >
            <TrendingUp className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
              Daily ROS Performance
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Declared percentages over time
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-4 sm:space-y-6">
          {/* Controls & Summary */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              {isLoading ? (
                <LoadingStates.Text
                  lines={1}
                  className="h-7 w-24 sm:h-8 sm:w-32"
                />
              ) : (
                <>
                  <h2 className="text-xl font-bold text-emerald-500 sm:text-2xl md:text-3xl">
                    {isNaN(averagePercentage) || !isFinite(averagePercentage)
                      ? '0.0000'
                      : pct4(averagePercentage)}
                  </h2>
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    avg in {selectedRange}
                  </span>
                </>
              )}
            </div>

            <div className="bg-muted/50 flex rounded-lg p-1">
              {timeRanges.map((range) => (
                <Button
                  key={range}
                  variant={selectedRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    'h-7 text-xs font-medium transition-all',
                    selectedRange === range &&
                      'bg-emerald-600 text-white hover:bg-emerald-700'
                  )}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative mt-3 h-[180px] w-full select-none sm:mt-4 sm:h-[200px] md:h-[220px]">
            {isLoading ? (
              <LoadingStates.Grid
                items={Math.min(limit, 7)}
                columns={Math.min(limit, 7)}
                className="h-full items-end"
              />
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title="Failed to load data"
                  description="Unable to fetch ROS performance data. Please try again later."
                />
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title="Unable to load data"
                  description={
                    (error as any)?.statusCode === 404 ||
                    (error as any)?.response?.status === 404
                      ? 'The profit history endpoint is not available yet. Data will appear here once the backend endpoint is implemented.'
                      : 'Failed to fetch ROS performance data. Please try again later.'
                  }
                />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title={`No data available for ${selectedRange}`}
                  description="ROS performance data will appear here once profits are declared and distributed"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2">
                {chartData.map((day, index) => {
                  const percentage = day.rosPercentage || 0;
                  const heightPercent =
                    maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;

                  const isHovered = hoveredIndex === index;
                  const date = new Date(day.date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  const isYesterday =
                    date.toDateString() ===
                    new Date(Date.now() - 86400000).toDateString();

                  // Format date label based on range
                  const getDateLabel = () => {
                    if (selectedRange === '7D') {
                      return date.toLocaleDateString('en-US', {
                        weekday: 'short',
                      });
                    } else if (selectedRange === '30D') {
                      return index % 5 === 0
                        ? date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '';
                    } else {
                      // 100D - show fewer labels
                      return index % 15 === 0
                        ? date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '';
                    }
                  };

                  return (
                    <div
                      key={index}
                      className="group relative flex h-full flex-1 flex-col justify-end"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2"
                          >
                            <div className="bg-popover/95 border-border/50 rounded-xl border p-3 text-xs shadow-xl backdrop-blur-md">
                              <p className="border-border/50 mb-2 border-b pb-1 text-center font-semibold">
                                {date.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    ROS Percentage
                                  </span>
                                  <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                                    {pct4(percentage)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    Status
                                  </span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {day.isDistributed
                                      ? 'Distributed'
                                      : 'Pending'}
                                  </span>
                                </div>
                                {(isToday || isYesterday) && (
                                  <div className="text-muted-foreground pt-1 text-[10px] italic">
                                    {isToday ? 'Today' : 'Yesterday'}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="bg-popover/95 border-border/50 absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.5, delay: index * 0.02 }}
                        className={cn(
                          'relative w-full overflow-hidden rounded-t-sm transition-all duration-200',
                          isHovered
                            ? 'z-10 scale-x-110 opacity-100 shadow-lg'
                            : 'opacity-85 hover:opacity-100',
                          isToday || isYesterday
                            ? 'bg-emerald-600 dark:bg-emerald-500'
                            : 'bg-emerald-500'
                        )}
                      >
                        <div
                          className="w-full bg-emerald-500 transition-colors"
                          style={{ height: '100%' }}
                        />
                      </motion.div>

                      {/* X-Axis Label */}
                      {getDateLabel() && (
                        <div className="text-muted-foreground mt-2 truncate text-center text-[10px] font-medium">
                          {getDateLabel()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grid Lines */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-10">
              <div className="bg-foreground h-px w-full" />
              <div className="bg-foreground h-px w-full" />
              <div className="bg-foreground h-px w-full" />
              <div className="bg-foreground h-px w-full" />
              <div className="bg-foreground h-px w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
