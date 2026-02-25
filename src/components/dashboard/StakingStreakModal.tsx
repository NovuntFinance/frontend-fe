'use client';

/**
 * Staking Streak modal – mobile-first neumorphic redesign.
 * Strict palette: #0D162C (all surfaces), #009BF2 (accent only), #FFFFFF (low opacity only).
 * Hierarchy via opacity, spacing, and neumorphic depth. All content, data, and interactions unchanged.
 */

import React from 'react';
import { Check, TrendingUp, Shield } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoadingStates } from '@/components/ui/loading-states';
import { useStakingStreak } from '@/lib/queries';
import { cn } from '@/lib/utils';
import {
  NEU_TOKENS,
  neuModalRaised,
  neuInset,
  neuSpacing,
  neuRaised,
  neuPressed,
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
    background: NEU_TOKENS.bg,
    boxShadow: neuInset,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.lg,
    padding: 6,
  };
  const todayChipGlow = `0 0 0 2px ${NEU_TOKENS.accent}, 0 0 14px rgba(0, 155, 242, 0.4)`;
  const textGlow =
    '0 0 12px rgba(0, 155, 242, 0.9), 0 0 24px rgba(0, 155, 242, 0.5)';
  const textGlowStrong =
    '0 0 16px rgba(0, 155, 242, 0.95), 0 0 32px rgba(0, 155, 242, 0.5)';
  const circleInsetStyle: React.CSSProperties = {
    background: 'rgba(16, 21, 47, 0.98)',
    boxShadow: neuInset,
    border: `1px solid ${NEU_TOKENS.border}`,
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
          background: `linear-gradient(165deg, #0f1930 0%, ${NEU_TOKENS.bg} 45%, #0b1222 100%)`,
          boxShadow: neuModalRaised,
          border: `1px solid ${NEU_TOKENS.border}`,
          borderRadius: neuRadius.lg,
        }}
      >
        <div className="relative min-w-0">
          <style>{`
            .staking-streak-neu-inner {
              padding: clamp(16px, 4vw, 24px) clamp(18px, 4.5vw, 28px);
            }
            .staking-streak-neu-modal [data-slot="dialog-close"] {
              background: ${NEU_TOKENS.bg};
              box-shadow: ${neuRaised};
              border: 1px solid ${NEU_TOKENS.border};
              color: ${NEU_TOKENS.accent};
              border-radius: ${neuRadius.md};
              transition: box-shadow 0.2s ease;
            }
            .staking-streak-neu-modal [data-slot="dialog-close"]:hover {
              box-shadow: 8px 8px 16px rgba(0,0,0,0.4), -4px -4px 12px rgba(255,255,255,0.05);
            }
            .staking-streak-neu-modal [data-slot="dialog-close"]:active {
              box-shadow: ${neuPressed};
            }
            .staking-streak-neu-modal [data-slot="dialog-close"]:focus-visible {
              outline: 2px solid ${NEU_TOKENS.focusRing};
              outline-offset: 2px;
            }
            .cta-streak:hover {
              box-shadow: 8px 8px 18px rgba(0,0,0,0.45), -5px -5px 14px rgba(255,255,255,0.05);
            }
            .cta-streak:active {
              box-shadow: ${neuPressed};
            }
            .cta-streak:focus-visible {
              outline: 2px solid ${NEU_TOKENS.focusRing};
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
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    Current Activity
                  </p>
                  <h2
                    className="mt-1 text-lg font-bold sm:text-xl"
                    style={{ color: NEU_TOKENS.white80 }}
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
                        color: NEU_TOKENS.accent,
                        textShadow: textGlowStrong,
                        fontSize: 'clamp(2rem, 7vmin, 2.75rem)',
                      }}
                    >
                      {streakData?.currentStreak ?? 0}
                    </span>
                    <span
                      className="mt-1.5 font-semibold tracking-wide uppercase"
                      style={{
                        color: NEU_TOKENS.accent,
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
                                  ? NEU_TOKENS.accent
                                  : NEU_TOKENS.white60,
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
                      background: NEU_TOKENS.bg,
                      boxShadow: neuInset,
                      border: `1px solid ${NEU_TOKENS.border}`,
                      borderRadius: neuRadius.lg,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield
                        className="h-4 w-4 shrink-0"
                        style={{ color: NEU_TOKENS.accent }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: NEU_TOKENS.accent }}
                      >
                        Milestone Progress
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full"
                      style={{
                        background: NEU_TOKENS.bg,
                        boxShadow: neuInset,
                        border: `1px solid ${NEU_TOKENS.border}`,
                        height: 8,
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${milestonePercent(streakData)}%`,
                          background: NEU_TOKENS.accent,
                          boxShadow: neuProgressFillHighlight,
                        }}
                      />
                    </div>
                    <p
                      className="text-right text-xs break-words"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      {streakData.daysUntilNextMilestone} days remaining
                    </p>
                    <p
                      className="min-w-0 text-xs leading-snug break-words"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Stake for{' '}
                      <strong style={{ color: NEU_TOKENS.white80 }}>
                        {streakData.daysUntilNextMilestone} more days
                      </strong>{' '}
                      to unlock the{' '}
                      <span style={{ color: NEU_TOKENS.accent }}>
                        {streakData.nextMilestone} Day Milestone Reward Pool.
                      </span>
                    </p>
                  </div>
                )}
                <Link
                  href="/dashboard/stakes/new"
                  className="cta-streak flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase transition-all focus:outline-none sm:py-3.5 sm:text-[15px]"
                  style={{
                    background: NEU_TOKENS.bg,
                    boxShadow: neuRaised,
                    border: `1px solid ${NEU_TOKENS.border}`,
                    color: NEU_TOKENS.accent,
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
        background: NEU_TOKENS.bg,
        boxShadow: neuInset,
        border: `1px solid ${NEU_TOKENS.border}`,
        borderRadius: neuRadius.md,
      }
    : {
        background: NEU_TOKENS.bg,
        boxShadow: neuRaised,
        border:
          isToday && todayGlow ? undefined : `1px solid ${NEU_TOKENS.border}`,
        borderRadius: neuRadius.md,
        ...(isToday && todayGlow
          ? { boxShadow: `${neuRaised}, ${todayGlow}` }
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
            style={{ color: NEU_TOKENS.accent }}
            strokeWidth={2.5}
          />
        </span>
      )}
      {state === 'lightning' && (
        <span style={{ filter: 'drop-shadow(0 0 6px rgba(0,155,242,0.7))' }}>
          <TrendingUp
            className="h-4 w-4"
            style={{ color: NEU_TOKENS.accent }}
          />
        </span>
      )}
      {state === 'today' && todayLabel != null && (
        <span
          className="text-xs font-bold"
          style={{
            color: NEU_TOKENS.accent,
            textShadow:
              '0 0 10px rgba(0,155,242,0.8), 0 0 20px rgba(0,155,242,0.4)',
          }}
        >
          {todayLabel}
        </span>
      )}
      {state === 'empty' && futureLabel != null && (
        <span className="text-[10px]" style={{ color: NEU_TOKENS.white40 }}>
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
