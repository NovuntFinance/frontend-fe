'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BalanceCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  isVisible?: boolean;
  isLoading?: boolean;
  delay?: number;
}

/**
 * BalanceCard Component
 * Animated card showing balance with icon and change indicator
 */
export function BalanceCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  bgColor,
  isVisible = true,
  isLoading = false,
  delay = 0,
}: BalanceCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    if (!isVisible || isLoading) return;

    let start = 0;
    const end = value;
    const duration = 1500; // 1.5 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isVisible, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          </div>

          {/* Value */}
          <div className="space-y-1">
            <motion.p
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              key={displayValue}
            >
              {isVisible ? (
                formatCurrency(displayValue)
              ) : (
                <span className="text-muted-foreground">••••••</span>
              )}
            </motion.p>

            {/* Change indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : changeType === 'negative'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                }`}
              >
                {change}
              </span>
              {changeType !== 'neutral' && (
                <span className="text-xs text-muted-foreground">
                  vs last month
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
