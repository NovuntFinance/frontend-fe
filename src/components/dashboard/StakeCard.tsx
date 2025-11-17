'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Stake } from '@/types/stake';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  const estimatedEndDate = stake.estimatedCompletionDate ? new Date(stake.estimatedCompletionDate) : null;
  const completedDate = stake.completionDate ? new Date(stake.completionDate) : null;
  const endDate = completedDate || estimatedEndDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  const progress = stake.rosPercentage;
  const daysRemaining = estimatedEndDate ? Math.ceil((estimatedEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
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
        className="relative overflow-hidden p-4 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all duration-300 group cursor-pointer"
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50`} />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${iconBgClass} group-hover:scale-110 transition-transform duration-300`}>
                <Target className={`h-4 w-4 ${iconColorClass}`} />
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(stake.amount)}
              </span>
            </div>
            <Badge 
              variant={isCompleted ? 'default' : isActive ? 'secondary' : 'outline'}
              className="capitalize"
            >
              {stake.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">ROS: {stake.rosPercentage.toFixed(1)}%</span>
              <span className="font-semibold text-success">
                +{formatCurrency(currentEarnings)}
              </span>
            </div>
            
            <div className="space-y-1">
              <Progress 
                value={progress} 
                className="h-2 bg-muted"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}% Complete</span>
                <span>{isCompleted ? '✓ Done' : `${daysRemaining}d left`}</span>
              </div>
            </div>
          </div>

          {/* Hover Arrow */}
          <ArrowRight className="h-4 w-4 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 group">
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
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${
          isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-500' : 'bg-gray-500'
        } blur-3xl opacity-20`}
      />

      <CardContent className="relative p-6 z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`p-3 rounded-xl ${iconBgClass}`}
            >
              <Target className={`h-6 w-6 ${iconColorClass}`} />
            </motion.div>
            <div>
              <h3 className="font-bold text-xl">
                {formatCurrency(stake.amount)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Stake Amount
              </p>
            </div>
          </div>
          <Badge
            variant={isCompleted ? 'default' : isActive ? 'secondary' : 'outline'}
            className="capitalize"
          >
            {stake.status}
          </Badge>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">ROS</span>
            </div>
            <p className="font-bold text-lg">{stake.rosPercentage.toFixed(1)}%</p>
          </div>

          <div className="p-3 rounded-xl bg-success/10">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Target className="h-3.5 w-3.5" />
              <span className="text-xs">Expected</span>
            </div>
            <p className="font-bold text-lg text-success">
              +{formatCurrency(expectedEarnings)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Start Date</span>
            </div>
            <p className="text-sm font-semibold">{formatDate(startDate)}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
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
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Value</span>
            <div className="text-right">
              <p className="font-bold text-2xl">
                {formatCurrency(stake.currentValue)}
              </p>
              <p className="text-sm text-success font-semibold">
                +{formatCurrency(currentEarnings)} ({((currentEarnings / stake.amount) * 100).toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
