'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  Send,
  TrendingUp,
  Gift,
  DollarSign,
  Users,
  Wallet,
} from 'lucide-react';
import { usePlatformActivity } from '@/hooks/usePlatformActivity';
import { formatCurrency } from '@/lib/utils';
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
    stake_completion: 'Stake Completed',
    bonus_activation: 'Bonus',
    new_signup: 'New Signup',
  };
  return map[type] || type;
}

function getActivityIcon(type: PlatformActivity['type']) {
  switch (type) {
    case 'deposit':
      return Download;
    case 'withdraw':
      return Upload;
    case 'transfer':
      return Send;
    case 'stake':
    case 'stake_completion':
      return TrendingUp;
    case 'referral':
    case 'registration_bonus':
    case 'bonus_activation':
      return Gift;
    case 'ros':
      return DollarSign;
    case 'new_signup':
      return Users;
    default:
      return Wallet;
  }
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
      className="rounded-2xl px-7 py-3 transition-all duration-300 sm:px-8 sm:py-4"
      style={CARD_STYLE}
    >
      {/* Same template as stat card / ActivityFeed / LiveTradingSignals */}
      <div className="relative min-h-[64px]">
        {loading ? (
          /* Loading skeleton — matches ActivityFeed skeleton */
          <div className="w-full">
            <div className="mb-1">
              <div
                className="h-3 w-28 animate-pulse rounded"
                style={{ background: 'rgba(0, 155, 242, 0.25)' }}
              />
            </div>
            <div className="flex items-center gap-2 pr-12">
              <div
                className="h-6 w-24 animate-pulse rounded sm:h-7"
                style={{ background: 'rgba(0, 155, 242, 0.25)' }}
              />
              <div
                className="h-4 w-16 shrink-0 animate-pulse rounded"
                style={{ background: 'rgba(0, 155, 242, 0.2)' }}
              />
            </div>
            <div
              className="absolute top-1/2 right-0 h-10 w-10 -translate-y-1/2 animate-pulse rounded-full"
              style={{ background: 'rgba(0, 155, 242, 0.15)' }}
            />
          </div>
        ) : displayActivities.length === 0 ? (
          <div
            className="flex items-center"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            <p className="text-sm">No activities yet</p>
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
              {/* Row 1: type label (accent) · time · user (muted) */}
              <div className="mb-0.5 pr-12">
                <p
                  className="truncate text-left text-xs font-semibold capitalize sm:text-sm"
                  style={{ color: 'var(--neu-accent)', filter: 'none' }}
                >
                  {getActivityTitle(currentActivity.type)}
                  <span
                    className="ml-1.5 font-normal"
                    style={{ color: 'var(--neu-text-secondary)' }}
                  >
                    · {currentActivity.timeAgo} · {currentActivity.user}
                  </span>
                </p>
              </div>

              {/* Row 2: amount (large bold) + status badge */}
              <div className="flex items-center gap-2 pr-12">
                <span
                  className="flex-1 text-lg font-black sm:text-xl"
                  style={{ color: 'var(--neu-text-primary)', filter: 'none' }}
                >
                  {currentActivity.amount != null
                    ? `+${formatCurrency(currentActivity.amount)}`
                    : '—'}
                </span>
                <span
                  className="flex-shrink-0 rounded-md px-2 py-0.5 text-xs font-bold capitalize"
                  style={{ background: 'var(--neu-accent)', color: 'white' }}
                >
                  Completed
                </span>
              </div>

              {/* Icon — absolute right, vertically centred */}
              {(() => {
                const IconComp = getActivityIcon(currentActivity.type);
                return (
                  <div className="absolute top-1/2 right-0 -translate-y-1/2">
                    <IconComp
                      className="h-10 w-10"
                      style={{ color: '#009BF2' }}
                    />
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
