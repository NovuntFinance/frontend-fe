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
import { useTodayProfit } from '@/lib/queries';
import { ShimmerCard } from '@/components/ui/shimmer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { pct4 } from '@/utils/formatters';

export function TodayROSCard() {
  const { data, isLoading: loading, error, refetch } = useTodayProfit();

  if (loading) {
    return <ShimmerCard className="h-full" />;
  }

  if (error) {
    // Check for 404 or "No profit" error (handles both old and new error messages)
    const isNotFound =
      error instanceof Error &&
      (error.message.includes('No profit') ||
        error.message.includes('not available') ||
        error.message.includes('becomes visible'));

    if (isNotFound) {
      return (
        <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 via-slate-500/10 to-transparent" />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-lg font-bold">
              Today&apos;s Profit
            </CardTitle>
            <CardDescription className="text-xs">
              Not yet available
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className="text-muted-foreground text-sm">
              Today&apos;s profit becomes visible at 23:59:59 BIT after
              distribution.
            </p>
            <div className="text-muted-foreground flex items-start gap-2 text-xs">
              <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <p>
                You can only see previous day&apos;s profit during the day.
                Today&apos;s profit will be visible after distribution.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-rose-500/10 to-transparent" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-lg font-bold text-red-600">
            Error Loading Profit
          </CardTitle>
          <CardDescription className="text-xs">
            {error instanceof Error
              ? error.message
              : 'Failed to fetch today&apos;s profit'}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <button
            onClick={() => refetch()}
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
          <CardTitle className="text-lg font-bold">
            Today&apos;s Profit
          </CardTitle>
          <CardDescription className="text-xs">
            No profit declared
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground text-sm">
            No profit has been declared for today. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { profitPercentage, rosPercentage, date, isDistributed } = data;

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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
              <div className="flex items-center gap-2">
                <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
                  Today&apos;s Profit
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-3.5 w-3.5 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        This shows yesterday&apos;s distributed profit.
                        Today&apos;s profit becomes visible at 23:59:59 BIT
                        after distribution.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {displayDate}
                <span className="text-muted-foreground/70">
                  {' '}
                  (Previous day)
                </span>
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={isDistributed ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isDistributed ? 'Distributed' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* ROS Percentage */}
        <div className="flex items-baseline gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-purple-600 dark:text-purple-400"
          >
            {pct4(rosPercentage)}
          </motion.div>
          <span className="text-sm text-purple-500/70">Daily ROS</span>
        </div>

        {/* Distribution Status */}
        <div className="rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-3">
          <p className="mb-1 text-xs font-medium text-purple-600 dark:text-purple-400">
            Distribution Status
          </p>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
            {isDistributed ? 'Distributed' : 'Pending Distribution'}
          </p>
        </div>

        {/* Distribution Info */}
        <div className="text-muted-foreground flex items-start gap-2 text-xs">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <p>
            {isDistributed
              ? 'Profit has been distributed to all qualified users and active stakes'
              : 'Profit will be distributed at 23:59:59 BIT'}
          </p>
        </div>

        {/* Visibility Info */}
        <div className="border-border/50 border-t pt-2">
          <div className="text-muted-foreground flex items-start gap-2 text-xs">
            <Clock className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <p>
              Today&apos;s profit becomes visible at 23:59:59 BIT after
              distribution. You are currently viewing yesterday&apos;s profit.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
