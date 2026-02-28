'use client';

/**
 * Staking Streak modal – mobile-first neumorphic redesign.
 * Theme-aware: uses --neu-modal-bg, --neu-bg, --neu-accent, --neu-border, etc. (light/dark from globals).
 */

import React from 'react';
import { Check, TrendingUp, Shield } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoadingStates } from '@/components/ui/loading-states';
import { useStakingStreak } from '@/lib/queries';
import { cn } from '@/lib/utils';
import {
  neuSpacing,
  neuRadius,
  neuProgressFillHighlight,
} from '@/components/rank-progress/neumorphicTokens';
import Link from 'next/link';
import type { StakingStreakData } from '@/services/stakingStreakApi';

interface StakingStreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MILESTONE_PROGRESS_MAX = 25;

export function StakingStreakModal({
  open,
  onOpenChange,
}: StakingStreakModalProps) {
  const { data: streakData, isLoading: streakLoading } = useStakingStreak();

  const trackInsetStyle: React.CSSProperties = {
    background: 'var(--neu-bg)',
    boxShadow: 'var(--neu-shadow-inset)',
    border: '1px solid var(--neu-border)',
    borderRadius: neuRadius.lg,
    padding: 6,
  };
  const todayChipGlow = '0 0 0 2px var(--neu-accent), 0 0 14px rgba(var(--neu-accent-rgb), 0.4)';
  const textGlow =
    '0 0 12px rgba(var(--neu-accent-rgb), 0.9), 0 0 24px rgba(var(--neu-accent-rgb), 0.5)';
  const textGlowStrong =
    '0 0 16px rgba(var(--neu-accent-rgb), 0.95), 0 0 32px rgba(var(--neu-accent-rgb), 0.5)';
  const circleInsetStyle: React.CSSProperties = {
    background: 'var(--neu-bg)',
    boxShadow: 'var(--neu-shadow-inset)',
    border: '1px solid var(--neu-border)',
    borderRadius: '50%',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName={cn(
          '!bg-transparent',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        )}
        className={cn(
          'staking-streak-neu-modal',
          'border-0 p-0 shadow-none',
          'max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[440px]',
          'overflow-x-hidden overflow-y-auto',
          'box-border',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:duration-200 data-[state=open]:duration-300',
          '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10'
        )}
        style={{
          background: 'var(--neu-modal-bg)',
          boxShadow: 'var(--neu-shadow-raised)',
          border: '1px solid var(--neu-border)',
          borderRadius: neuRadius.lg,
        }}
      >
        <div className="relative min-w-0">
          <style>{`
            .staking-streak-neu-inner {
              padding: clamp(16px, 4vw, 24px) clamp(18px, 4.5vw, 28px);
            }
            .staking-streak-neu-modal [data-slot="dialog-close"] {
              background: var(--neu-bg);
              box-shadow: var(--neu-shadow-raised);
              border: 1px solid var(--neu-border);
              color: var(--neu-accent);
              border-radius: ${neuRadius.md};
              transition: box-shadow 0.2s ease;
            }
            .staking-streak-neu-modal [data-slot="dialog-close"]:hover {
              box-shadow: var(--neu-shadow-raised-hover);
            }
            .staking-streak-neu-modal [data-slot="dialog-close"]:active {
              box-shadow: var(--neu-shadow-inset-press);
            }
            .staking-streak-neu-modal [data-slot="dialog-close"]:focus-visible {
              outline: 2px solid var(--neu-focus-ring);
              outline-offset: 2px;
            }
            .cta-streak:hover {
              box-shadow: var(--neu-shadow-raised-hover);
            }
            .cta-streak:active {
              box-shadow: var(--neu-shadow-inset-press);
            }
            .cta-streak:focus-visible {
              outline: 2px solid var(--neu-focus-ring);
              outline-offset: 2px;
            }
          `}</style>

          <div className="staking-streak-neu-inner relative min-w-0 space-y-4 sm:space-y-5">
            {streakLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <LoadingStates.Text lines={1} className="h-10 w-24" />
              </div>
            ) : (
              <>
                <header>
                  <p
                    className="text-xs font-semibold tracking-wider uppercase sm:text-[13px]"
                    style={{ color: 'var(--neu-text-secondary)' }}
                  >
                    Current Activity
                  </p>
                  <h2
                    className="mt-1 text-lg font-bold sm:text-xl"
                    style={{ color: 'var(--neu-text-primary)' }}
                  >
                    Staking Streak
                  </h2>
                </header>
                <div className="flex w-full flex-col items-center justify-center">
                  <div
                    className="flex flex-shrink-0 flex-col items-center justify-center rounded-full"
                    style={{
                      ...circleInsetStyle,
                      width: 'clamp(100px, 28vmin, 160px)',
                      height: 'clamp(100px, 28vmin, 160px)',
                    }}
                  >
                    <span
                      className="leading-none font-black"
                      style={{
                        color: 'var(--neu-accent)',
                        textShadow: textGlowStrong,
                        fontSize: 'clamp(2rem, 7vmin, 2.75rem)',
                      }}
                    >
                      {streakData?.currentStreak ?? 0}
                    </span>
                    <span
                      className="mt-1.5 font-semibold tracking-wide uppercase"
                      style={{
                        color: 'var(--neu-accent)',
                        textShadow: textGlow,
                        fontSize: 'clamp(0.75rem, 2.5vmin, 0.875rem)',
                      }}
                    >
                      Days
                    </span>
                  </div>
                </div>
                <div
                  style={trackInsetStyle}
                  className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch]"
                >
                  <div className="flex min-w-min flex-nowrap justify-center gap-2 sm:gap-2.5">
                    {(
                      streakData?.weeklyProgress ??
                      Array.from({ length: 7 }, (_, i) => ({
                        date: '',
                        hasActiveStake: i < (streakData?.currentStreak ?? 0),
                      }))
                    )
                      .slice(0, 7)
                      .map((day, i) => {
                        const isToday = i === 3;
                        const completed = day.hasActiveStake;
                        const active = completed || isToday;
                        return (
                          <div
                            key={i}
                            className="flex flex-shrink-0 flex-col items-center gap-1"
                          >
                            <DayChip
                              state={
                                completed && !isToday
                                  ? 'check'
                                  : isToday
                                    ? 'today'
                                    : 'empty'
                              }
                              todayLabel={
                                isToday
                                  ? String(streakData?.currentStreak ?? 0)
                                  : undefined
                              }
                              futureLabel={
                                !active && !isToday
                                  ? streakData?.currentStreak != null
                                    ? streakData.currentStreak + i + 1
                                    : i + 1
                                  : undefined
                              }
                              todayGlow={isToday ? todayChipGlow : undefined}
                            />
                            <span
                              className="text-[10px] font-medium"
                              style={{
                                color: isToday
                                  ? 'var(--neu-accent)'
                                  : 'var(--neu-text-secondary)',
                                ...(i === 0 || isToday || i === 6
                                  ? { textShadow: textGlow }
                                  : {}),
                              }}
                            >
                              {i === 0
                                ? 'Week 1'
                                : i === 3
                                  ? 'Today'
                                  : i === 6
                                    ? 'Next week'
                                    : ''}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                {streakData?.nextMilestone != null && (
                  <div
                    className="min-w-0 space-y-2.5 p-3 sm:p-4"
                    style={{
                      background: 'var(--neu-bg)',
                      boxShadow: 'var(--neu-shadow-inset)',
                      border: '1px solid var(--neu-border)',
                      borderRadius: neuRadius.lg,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield
                        className="h-4 w-4 shrink-0"
                        style={{ color: 'var(--neu-accent)' }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--neu-accent)' }}
                      >
                        Milestone Progress
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full"
                      style={{
                        background: 'var(--neu-bg)',
                        boxShadow: 'var(--neu-shadow-inset)',
                        border: '1px solid var(--neu-border)',
                        height: 8,
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${milestonePercent(streakData)}%`,
                          background: 'var(--neu-accent)',
                          boxShadow: neuProgressFillHighlight,
                        }}
                      />
                    </div>
                    <p
                      className="text-right text-xs break-words"
                      style={{ color: 'var(--neu-text-secondary)' }}
                    >
                      {streakData.daysUntilNextMilestone} days remaining
                    </p>
                    <p
                      className="min-w-0 text-xs leading-snug break-words"
                      style={{ color: 'var(--neu-text-secondary)' }}
                    >
                      Stake for{' '}
                      <strong style={{ color: 'var(--neu-text-primary)' }}>
                        {streakData.daysUntilNextMilestone} more days
                      </strong>{' '}
                      to unlock the{' '}
                      <span style={{ color: 'var(--neu-accent)' }}>
                        {streakData.nextMilestone} Day Milestone Reward Pool.
                      </span>
                    </p>
                  </div>
                )}
                <Link
                  href="/dashboard/stakes/new"
                  className="cta-streak flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase transition-all focus:outline-none sm:py-3.5 sm:text-[15px]"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
                    color: 'var(--neu-accent)',
                    borderRadius: neuRadius.lg,
                  }}
                >
                  <TrendingUp className="h-4 w-4" /> Continue Staking
                </Link>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Day chip: first image style.
 * Completed = softly raised surface + accent checkmark only.
 * Today = raised + soft accent border + number in accent.
 * Future = inset + muted number.
 */
function DayChip({
  state,
  todayLabel,
  futureLabel,
  todayGlow,
}: {
  state: 'check' | 'lightning' | 'today' | 'empty';
  todayLabel?: string;
  futureLabel?: number;
  todayGlow?: string;
}) {
  const isFuture = state === 'empty';
  const isToday = state === 'today';

  const baseStyle: React.CSSProperties = isFuture
    ? {
        background: 'var(--neu-bg)',
        boxShadow: 'var(--neu-shadow-inset)',
        border: '1px solid var(--neu-border)',
        borderRadius: neuRadius.md,
      }
    : {
        background: 'var(--neu-bg)',
        boxShadow: 'var(--neu-shadow-raised)',
        border:
          isToday && todayGlow ? undefined : '1px solid var(--neu-border)',
        borderRadius: neuRadius.md,
        ...(isToday && todayGlow
          ? { boxShadow: `var(--neu-shadow-raised), ${todayGlow}` }
          : {}),
      };

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center px-2 sm:px-3"
      style={{
        ...baseStyle,
        height: 'clamp(36px, 10vmin, 40px)',
        minWidth: 'clamp(44px, 12vmin, 56px)',
      }}
    >
      {state === 'check' && (
        <span style={{ filter: 'drop-shadow(0 0 6px rgba(0,155,242,0.7))' }}>
          <Check
            className="h-4 w-4"
            style={{ color: 'var(--neu-accent)' }}
            strokeWidth={2.5}
          />
        </span>
      )}
      {state === 'lightning' && (
        <span style={{ filter: 'drop-shadow(0 0 6px rgba(0,155,242,0.7))' }}>
          <TrendingUp
            className="h-4 w-4"
            style={{ color: 'var(--neu-accent)' }}
          />
        </span>
      )}
      {state === 'today' && todayLabel != null && (
        <span
          className="text-xs font-bold"
          style={{
            color: 'var(--neu-accent)',
            textShadow:
              '0 0 10px rgba(0,155,242,0.8), 0 0 20px rgba(0,155,242,0.4)',
          }}
        >
          {todayLabel}
        </span>
      )}
      {state === 'empty' && futureLabel != null && (
        <span className="text-[10px]" style={{ color: 'var(--neu-text-muted)' }}>
          {futureLabel}
        </span>
      )}
    </div>
  );
}

function milestonePercent(data: StakingStreakData): number {
  const next = data?.nextMilestone ?? MILESTONE_PROGRESS_MAX;
  const current = data?.currentStreak ?? 0;
  if (next <= 0) return 100;
  return Math.min(100, Math.round((current / next) * 100));
}
