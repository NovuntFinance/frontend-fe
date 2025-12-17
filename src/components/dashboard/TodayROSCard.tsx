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

export function TodayROSCard() {
  const { data, isLoading: loading, error, refetch } = useTodayProfit();

  if (loading) {
    return <ShimmerCard className="h-full" />;
  }

  if (error) {
    const isNotFound =
      error instanceof Error &&
      error.message === 'No profit declared for today';

    if (isNotFound) {
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

  const { profitPercentage, date, isDistributed } = data;

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get day name from date
  const dayName = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
  });

  // Format percentage with 2 decimal places
  const formattedPercentage = profitPercentage.toFixed(2);

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
                Today&apos;s Profit
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {displayDate}
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
        {/* Main Profit Percentage */}
        <div className="flex items-baseline gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-purple-600 dark:text-purple-400"
          >
            {formattedPercentage}%
          </motion.div>
        </div>

        {/* Distribution Status */}
        <div className="text-muted-foreground flex items-start gap-2 text-xs">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <p>
            {isDistributed
              ? 'Profit has been distributed to all active stakes'
              : 'Profit will be distributed at the end of the day'}
          </p>
        </div>

        {/* Date Info */}
        <div className="border-border/50 border-t pt-2">
          <p className="text-muted-foreground text-xs">
            Daily profit percentage for{' '}
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
