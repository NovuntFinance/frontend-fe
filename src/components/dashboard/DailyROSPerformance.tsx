'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Info } from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { rosApi, TimeRange, DailyEarning } from '@/services/rosApi';
import { useTodayRos } from '@/hooks/useTodayRos';
import { ShimmerCard } from '@/components/ui/shimmer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const timeRanges: TimeRange[] = ['7D', '30D'];

export function DailyROSPerformance() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [data, setData] = useState<DailyEarning[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch today's ROS
  const { data: todayRos } = useTodayRos(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await rosApi.getDailyEarnings(selectedRange);
        setData(response.dailyData || []);
      } catch (error) {
        // Only log in development - 404s are handled gracefully by the API
        if (process.env.NODE_ENV === 'development') {
          console.warn('Daily earnings endpoint not available:', error);
        }
        // Set empty data - API already returns empty structure for 404s
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRange]);

  // Calculate totals (using amount field from DailyEarning)
  const totalEarnings = data.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Since the API doesn't provide breakdown by source, we'll use the total amount
  // and assume it's all from staking (which is the primary source)

  // Calculate max value for chart scaling
  const maxDailyTotal = Math.max(
    ...data.map((d) => d.amount || 0),
    1 // Prevent division by zero
  );

  return (
    <NovuntPremiumCard
      title="Daily ROS Performance"
      subtitle="Track your daily earnings and sources"
      icon={TrendingUp}
      colorTheme="emerald"
      className="h-full"
    >
      <div className="space-y-6">
        {/* Today's ROS Display */}
        {todayRos && todayRos.timing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      Today&apos;s ROS
                    </span>
                    {todayRos.timing?.displayRule
                      ?.toLowerCase()
                      .includes('previous') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              Previous Day
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {todayRos.timing?.displayRule ||
                                'Previous day&apos;s ROS'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {typeof todayRos.percentage === 'number'
                        ? todayRos.percentage.toFixed(2)
                        : '0.00'}
                      %
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {todayRos.dayName || 'Today'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Week's Total (End of Week) */}
              {todayRos.timing?.isEndOfWeek &&
                todayRos.weeklyTotalPercentage !== undefined && (
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs font-medium">
                      Week&apos;s Total
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {todayRos.weeklyTotalPercentage.toFixed(2)}%
                    </p>
                  </div>
                )}
            </div>

            {/* Timing Information */}
            {todayRos.timing?.displayRule && (
              <div className="text-muted-foreground mt-3 flex items-start gap-2 border-t border-emerald-500/20 pt-3 text-xs">
                <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                <p>
                  {todayRos.timing?.displayRule ||
                    'ROS displayed at end of day'}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Controls & Summary */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <ShimmerCard className="h-8 w-32" />
            ) : (
              <>
                <h2 className="text-3xl font-bold text-emerald-500">
                  $
                  {totalEarnings.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>
                <span className="text-muted-foreground text-sm">
                  earned in {selectedRange}
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

        {/* Chart Area - Legend removed to eliminate repetition */}
        <div className="relative mt-4 h-[220px] w-full select-none">
          {loading ? (
            <div className="flex h-full items-end justify-between gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <ShimmerCard
                  key={i}
                  className="w-full rounded-t"
                  style={{ height: `${Math.random() * 50 + 20}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2">
              {data.map((day, index) => {
                const dailyTotal = day.amount || 0;
                const heightPercent = (dailyTotal / maxDailyTotal) * 100;

                // Since API doesn't provide breakdown, all earnings are from staking
                const stakingAmount = dailyTotal;

                // Calculate segment heights as percentages of the BAR height (not chart height)

                const isHovered = hoveredIndex === index;

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
                              {day.date} • Total: ${dailyTotal.toFixed(2)}
                            </p>
                            <div className="space-y-1">
                              {stakingAmount > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                                    Earnings
                                  </span>
                                  <span className="font-mono">
                                    ${stakingAmount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {day.ros > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    ROS
                                  </span>
                                  <span className="font-mono">
                                    {day.ros.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="bg-popover/95 border-border/50 absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Stacked Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: index * 0.03 }}
                      className={cn(
                        'relative w-full overflow-hidden rounded-t-sm transition-all duration-200',
                        isHovered
                          ? 'z-10 scale-x-110 opacity-100 shadow-lg'
                          : 'opacity-85 hover:opacity-100'
                      )}
                    >
                      {/* Earnings Bar - Full height since it's the only segment */}
                      <div
                        className="w-full bg-emerald-500 transition-colors"
                        style={{ height: '100%' }}
                      />
                    </motion.div>

                    {/* X-Axis Label */}
                    <div className="text-muted-foreground mt-2 truncate text-center text-[10px] font-medium">
                      {selectedRange === '7D'
                        ? new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                          })
                        : index % 5 === 0
                          ? new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid Lines (Optional background visual) */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-10">
            <div className="bg-foreground h-px w-full" />
            <div className="bg-foreground h-px w-full" />
            <div className="bg-foreground h-px w-full" />
            <div className="bg-foreground h-px w-full" />
            <div className="bg-foreground h-px w-full" />
          </div>
        </div>
      </div>
    </NovuntPremiumCard>
  );
}
