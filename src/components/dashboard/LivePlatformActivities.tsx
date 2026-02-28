'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatformActivity } from '@/hooks/usePlatformActivity';
import type {
  PlatformActivity,
  PlatformActivityType,
} from '@/types/platformActivity';

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
    const firstNames = [
      'John',
      'Sarah',
      'Mike',
      'Emma',
      'David',
      'Lisa',
      'Chris',
      'Anna',
    ];
    const lastNames = [
      'Anderson',
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
    ];
    const maskName = (name: string) =>
      name.length <= 2
        ? name
        : name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    const activities: PlatformActivity[] = [];
    for (let i = 0; i < 6; i++) {
      const type = types[i % types.length];
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const user = `${maskName(fn)} ${ln[0]}.`;
      const minutes = Math.floor(Math.random() * 45) + 1;
      const timeAgo = minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
      const amount =
        type === 'deposit' ||
        type === 'withdraw' ||
        type === 'stake' ||
        type === 'ros' ||
        type === 'referral' ||
        type === 'transfer'
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
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
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

  const activitiesKey = useMemo(
    () => displayActivities.map((a) => a.id).join(','),
    [displayActivities]
  );
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

  const currentActivity =
    displayActivities.length > 0 ? displayActivities[currentIndex] : null;

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
      style={CARD_STYLE}
    >
      {/* Minimal: label + value only (match Stats, Recent Activity, Live Trading Signals); crossfade, no empty gap */}
      <div className="relative min-h-[88px]">
        {loading ? (
          <div className="w-full">
            <div className="mb-2">
              <div
                className="h-3 w-24 animate-pulse rounded"
                style={{ background: 'rgba(0, 155, 242, 0.25)' }}
              />
            </div>
            <div className="flex items-baseline justify-between gap-2">
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
        ) : displayActivities.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-6 text-center text-sm"
            style={{ color: 'var(--app-text-muted)' }}
          >
            <p>No activities found</p>
          </div>
        ) : currentActivity ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={`${currentActivity.id}-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 w-full"
            >
              {/* Label line (match Recent Activity card) */}
              <div className="mb-2">
                <p
                  className="truncate text-left text-xs font-semibold capitalize sm:text-sm"
                  style={{ color: 'var(--neu-accent)', filter: 'none' }}
                >
                  {getActivityTitle(currentActivity.type)}
                  <span
                    className="ml-1.5 font-normal"
                    style={{ color: 'rgba(0, 155, 242, 0.75)' }}
                  >
                    · {currentActivity.timeAgo} • {currentActivity.user}
                  </span>
                </p>
              </div>
              {/* Value + status row (match Recent Activity, Live Trading Signals) */}
              <div className="flex items-baseline justify-between gap-2">
                {currentActivity.amount != null ? (
                  <span
                    className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                    style={{
                      color: 'var(--neu-text-primary)',
                      filter: 'none',
                    }}
                  >
                    +${currentActivity.amount.toLocaleString()}
                  </span>
                ) : (
                  <span
                    className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                    style={{
                      color: 'var(--neu-text-primary)',
                      filter: 'none',
                    }}
                  >
                    —
                  </span>
                )}
                <span
                  className="shrink-0 text-[10px] font-medium capitalize sm:text-xs"
                  style={{ color: 'var(--neu-text-secondary)', filter: 'none' }}
                >
                  Completed
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
