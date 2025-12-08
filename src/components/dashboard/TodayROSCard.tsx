'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTodayRos } from '@/hooks/useTodayRos';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function TodayROSCard() {
  const { data, loading, error, refetch } = useTodayRos(true);

  if (loading) {
    return (
      <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />
        <CardHeader className="relative pb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-rose-500/10 to-transparent" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-lg font-bold text-red-600">
            Error Loading ROS
          </CardTitle>
          <CardDescription className="text-xs">
            {error.message || 'Failed to fetch today&apos;s ROS'}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <button
            onClick={refetch}
            className="text-muted-foreground hover:text-foreground text-sm underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 via-slate-500/10 to-transparent" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-lg font-bold">Today&apos;s ROS</CardTitle>
          <CardDescription className="text-xs">
            No active calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground text-sm">
            No ROS calendar is currently active. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    percentage,
    dayName,
    date,
    weekNumber,
    year,
    weeklyTotalPercentage,
    message,
    timing,
  } = data;

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Determine if showing previous day's ROS
  const isPreviousDay = timing.displayRule.toLowerCase().includes('previous');

  // Format percentage with 2 decimal places
  const formattedPercentage = percentage.toFixed(2);

  return (
    <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

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
        className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
      />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-3 shadow-lg backdrop-blur-sm"
            >
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </motion.div>
            <div>
              <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
                Today&apos;s ROS
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {dayName}, {displayDate}
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs">
            Week {weekNumber}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Main ROS Percentage */}
        <div className="flex items-baseline gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-purple-600 dark:text-purple-400"
          >
            {formattedPercentage}%
          </motion.div>
          {isPreviousDay && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Previous Day
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{timing.displayRule}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Timing Information */}
        {timing.displayRule && (
          <div className="text-muted-foreground flex items-start gap-2 text-xs">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <p>{timing.displayRule}</p>
          </div>
        )}

        {/* Week's Total (End of Week) */}
        {timing.isEndOfWeek && weeklyTotalPercentage !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Week&apos;s Total Profit
                </p>
                {message && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {message}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {weeklyTotalPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Week Info */}
        <div className="border-border/50 border-t pt-2">
          <p className="text-muted-foreground text-xs">
            Week {weekNumber}, {year}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
