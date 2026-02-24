'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingStates } from '@/components/ui/loading-states';
import { useStakingStreak } from '@/lib/queries';
import { cn } from '@/lib/utils';

const NEU_BG = '#131B2E';
const NEU_BG_PRIMARY = '#0D162C';
const NEU_SHADOW_DARK = 'rgba(0, 0, 0, 0.5)';
const NEU_SHADOW_LIGHT = 'rgba(255, 255, 255, 0.05)';

interface StakingStreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StakingStreakModal({ open, onOpenChange }: StakingStreakModalProps) {
  const { data: streakData, isLoading: streakLoading } = useStakingStreak();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          'border-white/10 p-0 overflow-hidden',
          'bg-transparent shadow-none',
          'max-w-[calc(100%-2rem)] sm:max-w-md'
        )}
        style={{
          background: NEU_BG,
          boxShadow: `
            16px 16px 32px ${NEU_SHADOW_DARK},
            -16px -16px 32px ${NEU_SHADOW_LIGHT},
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        <div className="relative p-5 sm:p-6">
          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, rgba(0, 155, 242, 0.08) 0%, transparent 50%)`,
            }}
          />

          <DialogHeader className="relative mb-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: `inset 4px 4px 8px ${NEU_SHADOW_DARK}, inset -4px -4px 8px ${NEU_SHADOW_LIGHT}`,
                }}
              >
                <Clock
                  className="h-5 w-5"
                  style={{ color: '#009BF2', filter: 'none' }}
                />
              </div>
              <div>
                <DialogTitle
                  className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
                  style={{ filter: 'none' }}
                >
                  Staking Streak
                </DialogTitle>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  Consecutive active days
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="relative">
            {streakLoading ? (
              <div className="space-y-4 py-4">
                <LoadingStates.Text lines={1} className="h-10 w-24" />
                <div className="flex gap-1.5">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 flex-1 rounded-lg animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-baseline gap-2">
                  <motion.span
                    key={streakData?.currentStreak ?? 0}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-black sm:text-4xl"
                    style={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      background: 'linear-gradient(135deg, #009BF2, #06b6d4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {streakData?.currentStreak ?? 0}
                  </motion.span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    days
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {(
                    streakData?.weeklyProgress ??
                    Array.from({ length: 7 }, () => ({ hasActiveStake: false }))
                  ).map((day, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.05, type: 'spring' }}
                      whileHover={{ scaleY: 1.1 }}
                      className={cn(
                        'h-10 flex-1 rounded-lg transition-all',
                        day.hasActiveStake
                          ? 'bg-gradient-to-t from-blue-500 to-cyan-500 shadow-lg'
                          : 'bg-white/5'
                      )}
                      style={
                        day.hasActiveStake
                          ? { boxShadow: '0 4px 14px rgba(0, 155, 242, 0.35)' }
                          : undefined
                      }
                      title={day.hasActiveStake ? 'Active stake' : 'No active stake'}
                    />
                  ))}
                </div>

                {streakData?.nextMilestone &&
                  streakData.daysUntilNextMilestone > 0 && (
                    <p
                      className="mt-3 text-center text-xs"
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      {streakData.daysUntilNextMilestone} days until{' '}
                      {streakData.nextMilestone} day milestone
                    </p>
                  )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
