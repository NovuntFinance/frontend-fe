'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Stake } from '@/types/stake';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { pct4 } from '@/utils/formatters';

interface StakeCardProps {
  stake: Stake;
  compact?: boolean;
}

/**
 * StakeCard Component
 * Modern stake display with gradients, animations, and progress indicators
 */
export function StakeCard({ stake, compact = false }: StakeCardProps) {
  // Calculate progress
  const startDate = new Date(stake.startDate);
  const estimatedEndDate = stake.estimatedCompletionDate
    ? new Date(stake.estimatedCompletionDate)
    : null;
  const completedDate = stake.completionDate
    ? new Date(stake.completionDate)
    : null;
  const endDate =
    completedDate ||
    estimatedEndDate ||
    new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const progress = stake.rosPercentage;
  const daysRemaining = estimatedEndDate
    ? Math.ceil(
        (estimatedEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;
  const isCompleted = stake.status === 'completed';
  const isActive = stake.status === 'active';

  // Calculate expected earnings
  const expectedEarnings = stake.targetValue - stake.amount;
  const currentEarnings = stake.currentValue - stake.amount;

  // Gradient colors based on status
  const gradientClass = isCompleted
    ? 'from-green-500/20 via-green-500/10 to-transparent'
    : isActive
      ? 'from-purple-500/20 via-purple-500/10 to-transparent'
      : 'from-gray-500/20 via-gray-500/10 to-transparent';

  const iconBgClass = isCompleted
    ? 'bg-green-500/10'
    : isActive
      ? 'bg-purple-500/10'
      : 'bg-gray-500/10';

  const iconColorClass = isCompleted
    ? 'text-green-500'
    : isActive
      ? 'text-purple-500'
      : 'text-gray-500';

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="border-border/50 bg-card group relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
      >
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50`}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`rounded-lg p-2 ${iconBgClass} transition-transform duration-300 group-hover:scale-110`}
              >
                <Target className={`h-4 w-4 ${iconColorClass}`} />
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(stake.amount)}
              </span>
            </div>
            <Badge
              variant={
                isCompleted ? 'default' : isActive ? 'secondary' : 'outline'
              }
              className="capitalize"
            >
              {stake.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                ROS: {stake.rosPercentage.toFixed(1)}%
              </span>
              <span className="text-success font-semibold">
                +{formatCurrency(currentEarnings)}
              </span>
            </div>

            <div className="space-y-1">
              <Progress value={progress} className="bg-muted h-2" />
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{Math.round(progress)}% Complete</span>
                <span>{isCompleted ? '✓ Done' : `${daysRemaining}d left`}</span>
              </div>
            </div>
          </div>

          {/* Hover Arrow */}
          <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />

      {/* Animated Blob */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-12 -right-12 h-40 w-40 rounded-full ${
          isCompleted
            ? 'bg-green-500'
            : isActive
              ? 'bg-purple-500'
              : 'bg-gray-500'
        } opacity-20 blur-3xl`}
      />

      <CardContent className="relative z-10 p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`rounded-xl p-3 ${iconBgClass}`}
            >
              <Target className={`h-6 w-6 ${iconColorClass}`} />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">
                {formatCurrency(stake.amount)}
              </h3>
              <p className="text-muted-foreground text-sm">Stake Amount</p>
            </div>
          </div>
          <Badge
            variant={
              isCompleted ? 'default' : isActive ? 'secondary' : 'outline'
            }
            className="capitalize"
          >
            {stake.status}
          </Badge>
        </div>

        {/* Progress Section */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="bg-muted h-3" />
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">ROS</span>
            </div>
            <p className="text-lg font-bold">
              {stake.rosPercentage.toFixed(1)}%
            </p>
          </div>

          <div className="bg-success/10 rounded-xl p-3">
            <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              <span className="text-xs">Expected</span>
            </div>
            <p className="text-success text-lg font-bold">
              +{formatCurrency(expectedEarnings)}
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Start Date</span>
            </div>
            <p className="text-sm font-semibold">{formatDate(startDate)}</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <div className="text-muted-foreground mb-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">
                {isCompleted ? 'Completed' : 'Time Left'}
              </span>
            </div>
            <p className="text-sm font-semibold">
              {isCompleted ? formatDate(endDate) : `${daysRemaining} days`}
            </p>
          </div>
        </div>

        {/* Current Value - Featured */}
        <div className="border-border/50 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Current Value</span>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCurrency(stake.currentValue)}
              </p>
              <p className="text-success text-sm font-semibold">
                +{formatCurrency(currentEarnings)} (
                {pct4((currentEarnings / stake.amount) * 100)})
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
