'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { rosApi, TimeRange, DailyEarningData } from '@/services/rosApi';
import { toast } from 'sonner';

const timeRanges: TimeRange[] = ['7D', '30D'];

export function DailyROSPerformance() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [data, setData] = useState<DailyEarningData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await rosApi.getDailyEarnings(selectedRange);
        setData(data.dailyData);
      } catch (error) {
        console.error('Failed to fetch daily earnings:', error);
        toast.error('Failed to load daily earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRange]);

  // Calculate totals
  const totalStaking = data.reduce((sum, d) => sum + d.staking, 0);
  const totalReferral = data.reduce((sum, d) => sum + d.referral, 0);
  const totalBonus = data.reduce((sum, d) => sum + d.bonus, 0);
  const totalEarnings = totalStaking + totalReferral + totalBonus;

  // Calculate max value for chart scaling
  const maxDailyTotal = Math.max(
    ...data.map((d) => d.staking + d.referral + d.bonus),
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
        {/* Controls & Summary */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-emerald-500/20" />
            ) : (
              <h2 className="text-3xl font-bold text-emerald-500">
                $
                {totalEarnings.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            )}
            <span className="text-muted-foreground text-sm">
              earned in {selectedRange}
            </span>
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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Staking</span>
            <span className="font-semibold">${totalStaking.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Referrals</span>
            <span className="font-semibold">${totalReferral.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Bonuses</span>
            <span className="font-semibold">${totalBonus.toFixed(2)}</span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative mt-4 h-[220px] w-full select-none">
          {loading ? (
            <div className="flex h-full items-end justify-between gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full animate-pulse rounded-t bg-emerald-500/10"
                  style={{ height: `${Math.random() * 50 + 20}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2">
              {data.map((day, index) => {
                const dailyTotal = day.staking + day.referral + day.bonus;
                const heightPercent = (dailyTotal / maxDailyTotal) * 100;

                // Calculate segment heights as percentages of the BAR height (not chart height)
                const stakingPercent =
                  dailyTotal > 0 ? (day.staking / dailyTotal) * 100 : 0;
                const referralPercent =
                  dailyTotal > 0 ? (day.referral / dailyTotal) * 100 : 0;
                const bonusPercent =
                  dailyTotal > 0 ? (day.bonus / dailyTotal) * 100 : 0;

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
                              {day.staking > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                                    Staking
                                  </span>
                                  <span className="font-mono">
                                    ${day.staking.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {day.referral > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />{' '}
                                    Referral
                                  </span>
                                  <span className="font-mono">
                                    ${day.referral.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {day.bonus > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-purple-500" />{' '}
                                    Bonus
                                  </span>
                                  <span className="font-mono">
                                    ${day.bonus.toFixed(2)}
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
                        'relative flex w-full flex-col-reverse overflow-hidden rounded-t-sm transition-all duration-200',
                        isHovered
                          ? 'z-10 scale-x-110 opacity-100 shadow-lg'
                          : 'opacity-85 hover:opacity-100'
                      )}
                    >
                      {/* Staking Segment (Bottom) */}
                      <div
                        style={{ height: `${stakingPercent}%` }}
                        className="w-full bg-emerald-500 transition-colors"
                      />
                      {/* Referral Segment (Middle) */}
                      {day.referral > 0 && (
                        <div
                          style={{ height: `${referralPercent}%` }}
                          className="w-full bg-blue-500 transition-colors"
                        />
                      )}
                      {/* Bonus Segment (Top) */}
                      {day.bonus > 0 && (
                        <div
                          style={{ height: `${bonusPercent}%` }}
                          className="w-full bg-purple-500 transition-colors"
                        />
                      )}
                    </motion.div>

                    {/* X-Axis Label */}
                    <div className="text-muted-foreground mt-2 truncate text-center text-[10px] font-medium">
                      {selectedRange === '7D'
                        ? day.day
                        : index % 5 === 0
                          ? day.day
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
