'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Circle,
  TrendingUp,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Users,
  Gift,
  Star,
  Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePlatformActivity } from '@/hooks/usePlatformActivity';
import type { PlatformActivity } from '@/types/platformActivity';

const ROTATE_INTERVAL_MS = 5000;

function getActivityIcon(type: PlatformActivity['type']) {
  const map: Record<string, typeof TrendingUp> = {
    deposit: ArrowDownRight,
    withdraw: ArrowUpRight,
    stake: TrendingUp,
    referral: Users,
    ros: DollarSign,
    rank: Gift,
    promotion: Star,
    transfer: Send,
    registration_bonus: Gift,
    stake_completion: TrendingUp,
    bonus_activation: Star,
    new_signup: Users,
  };
  return map[type] || Circle;
}

function getActivityTitle(type: PlatformActivity['type']): string {
  const map: Record<string, string> = {
    deposit: 'Deposit',
    withdraw: 'Withdrawal',
    stake: 'Staked',
    referral: 'Referral',
    ros: 'Earned ROS',
    rank: 'Rank',
    promotion: 'Promotion',
    transfer: 'Transfer',
    registration_bonus: 'Bonus',
    stake_completion: 'Stake completed',
    bonus_activation: 'Bonus',
    new_signup: 'New signup',
  };
  return map[type] || type;
}

/** Theme-aware neumorphic */
const NEU_CARD_SHADOW = `
  inset 8px 8px 16px var(--app-shadow-dark),
  inset -8px -8px 16px var(--app-shadow-light),
  inset 2px 2px 4px rgba(0, 0, 0, 0.15),
  inset -2px -2px 4px var(--app-shadow-light),
  0 0 0 1px var(--app-border)
`;

/**
 * Live Platform Activity card. Renders beside Live Trading Signals, below Active Stakes.
 * Fetches from /platform/activity and shows real-time user activities (stakes, ROS, deposits, etc.).
 */
export function LivePlatformActivities() {
  const { activities, loading } = usePlatformActivity({
    limit: 8,
    pollInterval: 30000,
    enabled: true,
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const activitiesKey = useMemo(() => activities.map((a) => a.id).join(','), [activities]);
  useEffect(() => {
    if (activities.length > 0) setCurrentIndex(0);
  }, [activitiesKey, activities.length]);

  useEffect(() => {
    if (activities.length === 0 || activities.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activities.length]);

  const currentActivity = activities.length > 0 ? activities[currentIndex] : null;

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border-0 transition-shadow duration-300 hover:shadow-xl"
      style={{ background: 'var(--app-surface)', boxShadow: NEU_CARD_SHADOW }}
    >
      <CardContent className="relative p-5 sm:p-6">
        <div className="min-h-[80px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-sm" style={{ color: 'var(--app-text-muted)' }}>
              <div className="mb-2 h-6 w-6 animate-pulse rounded-lg" style={{ background: 'rgba(0, 155, 242, 0.3)' }} />
              <p>Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-sm" style={{ color: 'var(--app-text-muted)' }}>
              <p>No activities found</p>
            </div>
          ) : currentActivity ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentActivity.id}-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                    style={{ background: 'var(--app-overlay)' }}
                  >
                    {(() => {
                      const Icon = getActivityIcon(currentActivity.type);
                      return (
                        <Icon
                          className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                          style={{ color: 'var(--app-text-primary)' }}
                        />
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-medium capitalize sm:text-sm lg:text-xs"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      {getActivityTitle(currentActivity.type)}
                    </p>
                    <p
                      className="text-[10px] sm:text-xs lg:text-[10px]"
                      style={{ color: 'var(--app-text-muted)' }}
                    >
                      {currentActivity.timeAgo} • {currentActivity.user}
                    </p>
                  </div>
                </div>
                {currentActivity.amount != null ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                    style={{ color: '#22c55e' }}
                  >
                    +${currentActivity.amount.toLocaleString()}
                  </motion.div>
                ) : null}
                <p
                  className="mt-1.5 text-[10px] font-medium capitalize sm:text-xs lg:text-[10px]"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  Activity
                </p>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
