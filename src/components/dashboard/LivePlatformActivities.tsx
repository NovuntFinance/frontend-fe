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
import type { PlatformActivity, PlatformActivityType } from '@/types/platformActivity';

const ROTATE_INTERVAL_MS = 5000;

/** Generate mock activities when API returns empty (backend down or no data yet) */
function useMockActivities(): PlatformActivity[] {
  return useMemo(() => {
    const types: PlatformActivityType[] = [
      'deposit',
      'withdraw',
      'stake',
      'referral',
      'ros',
      'transfer',
      'registration_bonus',
    ];
    const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna'];
    const lastNames = ['Anderson', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
    const maskName = (name: string) =>
      name.length <= 2 ? name : name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    const activities: PlatformActivity[] = [];
    for (let i = 0; i < 6; i++) {
      const type = types[i % types.length];
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const user = `${maskName(fn)} ${ln[0]}.`;
      const minutes = Math.floor(Math.random() * 45) + 1;
      const timeAgo = minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
      const amount =
        type === 'deposit' || type === 'withdraw' || type === 'stake' || type === 'ros' || type === 'referral' || type === 'transfer'
          ? Math.floor(Math.random() * 300) + 25
          : type === 'registration_bonus'
            ? Math.floor(Math.random() * 50) + 10
            : null;
      const actionMap: Record<string, string> = {
        deposit: 'deposited',
        withdraw: 'withdrew',
        stake: 'staked',
        referral: 'earned referral bonus',
        ros: 'earned ROS',
        transfer: 'transferred',
        registration_bonus: 'earned bonus',
      };
      activities.push({
        id: `mock-${i}-${Date.now()}`,
        type,
        user,
        action: actionMap[type] || type.replace('_', ' '),
        amount,
        timestamp: new Date(Date.now() - minutes * 60 * 1000).toISOString(),
        timeAgo,
      });
    }
    return activities;
  }, []);
}

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

/** Dashboard card style (match Activity Feed, Live Trading Signals) */
const CARD_STYLE = {
  background: '#0D162C',
  boxShadow:
    '8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)',
  border: '1px solid var(--app-border)',
} as const;

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
  const mockActivities = useMockActivities();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use API data when available; fallback to mock when empty (backend down or no data yet)
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const activitiesKey = useMemo(() => displayActivities.map((a) => a.id).join(','), [displayActivities]);
  useEffect(() => {
    if (displayActivities.length > 0) setCurrentIndex(0);
  }, [activitiesKey, displayActivities.length]);

  useEffect(() => {
    if (displayActivities.length === 0 || displayActivities.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayActivities.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [displayActivities.length]);

  const currentActivity = displayActivities.length > 0 ? displayActivities[currentIndex] : null;

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border-0 transition-shadow duration-300"
      style={CARD_STYLE}
    >
      <CardContent className="relative p-5 sm:p-6">
        <div className="min-h-[80px]">
          {loading ? (
            <div className="w-full">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-8 w-8 shrink-0 animate-pulse rounded-lg sm:h-9 sm:w-9"
                  style={{ background: 'rgba(0, 155, 242, 0.2)' }}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div
                    className="h-3 w-24 animate-pulse rounded"
                    style={{ background: 'rgba(0, 155, 242, 0.25)' }}
                  />
                  <div
                    className="h-2.5 w-32 animate-pulse rounded"
                    style={{ background: 'rgba(0, 155, 242, 0.2)' }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div
                  className="h-7 w-28 animate-pulse rounded sm:h-8"
                  style={{ background: 'rgba(0, 155, 242, 0.25)' }}
                />
                <div
                  className="h-3 w-16 shrink-0 animate-pulse rounded"
                  style={{ background: 'rgba(0, 155, 242, 0.2)' }}
                />
              </div>
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
                {/* Header: icon + title + subtitle (match Daily ROS Payout card) */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
                    style={{ background: 'rgba(0, 155, 242, 0.15)' }}
                  >
                    {(() => {
                      const Icon = getActivityIcon(currentActivity.type);
                      return (
                        <Icon
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          style={{ color: '#009BF2', filter: 'none' }}
                        />
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-semibold capitalize sm:text-sm"
                      style={{ color: '#009BF2', filter: 'none' }}
                    >
                      {getActivityTitle(currentActivity.type)}
                    </p>
                    <p
                      className="text-[10px] sm:text-xs"
                      style={{
                        color: 'rgba(0, 155, 242, 0.75)',
                        filter: 'none',
                      }}
                    >
                      {currentActivity.timeAgo} • {currentActivity.user}
                    </p>
                  </div>
                </div>
                {/* Amount and status on one row (match Daily ROS Payout card) */}
                <div className="flex items-baseline justify-between gap-3">
                  {currentActivity.amount != null ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                      style={{
                        color: 'var(--app-text-primary)',
                        filter: 'none',
                      }}
                    >
                      +${currentActivity.amount.toLocaleString()}
                    </motion.div>
                  ) : (
                    <span
                      className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                      style={{
                        color: 'var(--app-text-primary)',
                        filter: 'none',
                      }}
                    >
                      —
                    </span>
                  )}
                  <p
                    className="shrink-0 text-[10px] font-medium capitalize sm:text-xs"
                    style={{
                      color: 'rgba(0, 155, 242, 0.75)',
                      filter: 'none',
                    }}
                  >
                    Completed
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
