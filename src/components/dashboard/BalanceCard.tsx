'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ShimmerCard } from '@/components/ui/shimmer';

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
    return <ShimmerCard className="h-full" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          {/* Header with icon */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <div className={`rounded-lg p-2 ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          </div>

          {/* Value */}
          <div className="space-y-1">
            <motion.p
              className="text-2xl font-bold tracking-tight sm:text-3xl"
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
                <span className="text-muted-foreground text-xs">
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
