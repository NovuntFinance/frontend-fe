'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWeeklyROSSummary } from '@/lib/queries';
import { ShimmerCard } from '@/components/ui/shimmer';

export function WeeklyROSCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading: loading } = useWeeklyROSSummary();

  // Calculate week progress based on daily breakdown
  const currentDay = data?.dailyBreakdown?.length || 0;
  const weekProgress = data ? (currentDay / 7) * 100 : 0;

  return (
    <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent" />

      {/* Animated Floating Blob */}
      <motion.div
        animate={{
          x: [0, 15, 0],
          y: [0, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-green-500/30 blur-2xl"
      />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 p-3 shadow-lg backdrop-blur-sm"
            >
              <TrendingUp className="h-6 w-6 text-green-500" />
            </motion.div>
            <div>
              <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-lg font-bold text-transparent">
                Weekly ROS
              </CardTitle>
              <CardDescription className="text-xs">
                {data ? `Week ${data.weekNumber}, ${data.year}` : 'Loading...'}
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 gap-1 text-xs"
          >
            {isExpanded ? 'Hide' : 'Details'}
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="mb-3 flex items-baseline gap-3">
          {loading ? (
            <ShimmerCard className="h-12 w-32" />
          ) : (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-5xl font-black text-transparent"
            >
              {data?.weeklyRos?.toFixed(2) || 0}%
            </motion.span>
          )}

          {!loading && data && (
            <Badge className="border-none bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl">
              <DollarSign className="mr-1 h-3 w-3" />
              {data.totalEarnings.toFixed(2)}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          Current Week Performance
        </p>

        {/* Collapsible Details */}
        <AnimatePresence>
          {isExpanded && data && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-border/50 space-y-3 border-t pt-3">
                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Daily Breakdown
                </h4>
                <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
                  {(data.dailyBreakdown || []).map((day, index) => (
                    <div
                      key={index}
                      className="bg-background/50 hover:bg-background/80 flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                        <span>{day.dayOfWeek}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">
                          {day.ros.toFixed(2)}%
                        </span>
                        <span
                          className={`font-bold text-green-600 dark:text-green-400`}
                        >
                          ${day.earnings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Week Progress</span>
                    <span>{currentDay}/7 Days</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weekProgress}%` }}
                      transition={{ delay: 0.2, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
