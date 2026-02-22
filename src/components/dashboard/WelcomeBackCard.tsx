'use client';

import React from 'react';
import { Eye, EyeOff, TrendingUp, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { pct4 } from '@/utils/formatters';
import { openShareModal } from '@/store/shareModalStore';
import { useActiveStakes } from '@/lib/queries';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';

const CARD_BG = '#009BF2';
const CARD_TEXT = '#0D162C';
const CARD_TEXT_MUTED = 'rgba(13, 22, 44, 0.75)';
const DARK_BG = '#0D162C';
const LIGHT_BLUE = '#009BF2';
const LIGHT_BLUE_MUTED = 'rgba(0, 155, 242, 0.85)';
/* Match auth/onboarding neumorphic system (onboarding.module.css, auth.module.css) */
const NEU_SHADOW_DARK = 'rgba(4, 8, 18, 0.7)';
const NEU_SHADOW_LIGHT = 'rgba(25, 40, 72, 0.5)';
const NEU_GLOW = 'rgba(0, 155, 242, 0.35)';

interface WelcomeBackCardProps {
  user: any;
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  refetch: () => void;
  isRefetching: boolean;
  totalPortfolioValue: number;
  lastWeekProfitChange: number;
  totalEarnings?: number;
  noCard?: boolean; // If true, removes the outer card wrapper
}

export function WelcomeBackCard({
  user,
  balanceVisible,
  setBalanceVisible,
  refetch,
  isRefetching,
  totalPortfolioValue,
  lastWeekProfitChange,
  totalEarnings = 0,
  noCard = false,
}: WelcomeBackCardProps) {
  const router = useRouter();
  const { data: stakingDashboard } = useStakeDashboard();
  const { data: activeStakes } = useActiveStakes();

  // Get accurate active stakes count
  const activeStakesArray = Array.isArray(activeStakes)
    ? activeStakes
    : (activeStakes as any)?.data?.activeStakes ||
      (activeStakes as any)?.activeStakes ||
      [];
  const activeStakesCount = activeStakesArray.length;

  // Get daily ROS (today's profit amount) from staking dashboard summary
  const dailyROS = Number(stakingDashboard?.summary?.todaysProfit || 0);

  const greetingName = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : 'Stakeholder';

  const content = (
    <div className="relative z-10 p-5 sm:p-6">
      {/* Balance and actions aligned horizontally */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-3">
        {/* Portfolio value - Left side */}
        <div className="min-w-0 flex-1">
          <p
            className="mb-1.5 text-xs font-bold sm:mb-2 sm:text-sm lg:mb-1.5 lg:text-xs"
            style={{ color: CARD_TEXT_MUTED }}
          >
            Total Portfolio Value
          </p>
          {balanceVisible ? (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-black sm:text-3xl md:text-4xl lg:text-xl xl:text-2xl"
              style={{ color: CARD_TEXT, filter: 'none' }}
            >
              $
              {totalPortfolioValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </motion.div>
          ) : (
            <motion.div
              key="hidden"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-black sm:text-3xl md:text-4xl lg:text-xl xl:text-2xl"
              style={{ color: CARD_TEXT_MUTED, filter: 'none' }}
            >
              ••••••••
            </motion.div>
          )}
        </div>

        {/* Right side: % badge + Share + Eye */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 lg:gap-2">
          {/* Extruded neumorphic % badge */}
          {lastWeekProfitChange !== 0 && (
            <div
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 lg:px-3 lg:py-1.5"
              style={{
                background: DARK_BG,
                boxShadow: `
                    6px 6px 14px ${NEU_SHADOW_DARK},
                    -6px -6px 14px ${NEU_SHADOW_LIGHT},
                    0 0 10px ${NEU_GLOW},
                    inset 1px 1px 0 rgba(255, 255, 255, 0.05)
                  `,
                border: 'none',
                color: LIGHT_BLUE,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <TrendingUp
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-3 lg:w-3 ${(lastWeekProfitChange ?? 0) < 0 ? 'rotate-180' : ''}`}
              />
              <span className="lg:text-xs">
                {(lastWeekProfitChange ?? 0) >= 0 ? '+' : ''}
                {pct4(lastWeekProfitChange ?? 0)}
              </span>
            </div>
          )}

          {/* Share + Eye */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    openShareModal('profit', {
                      title: 'Share Your Success!',
                      message: `🎉 I'm earning on Novunt!\nJoin me and start earning too.`,
                      amount: totalEarnings,
                    });
                  }}
                  className="h-9 w-9 rounded-full transition-all duration-200 sm:h-11 sm:w-11 lg:h-8 lg:w-8"
                  style={{
                    background: DARK_BG,
                    color: LIGHT_BLUE,
                    boxShadow: `
                        8px 8px 20px ${NEU_SHADOW_DARK},
                        -8px -8px 20px ${NEU_SHADOW_LIGHT},
                        0 0 12px ${NEU_GLOW},
                        inset 1px 1px 0 rgba(255, 255, 255, 0.06)
                      `,
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `
                        10px 10px 24px ${NEU_SHADOW_DARK},
                        -10px -10px 24px ${NEU_SHADOW_LIGHT},
                        0 0 16px ${NEU_GLOW},
                        inset 1px 1px 0 rgba(255, 255, 255, 0.08)
                      `;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `
                        8px 8px 20px ${NEU_SHADOW_DARK},
                        -8px -8px 20px ${NEU_SHADOW_LIGHT},
                        0 0 12px ${NEU_GLOW},
                        inset 1px 1px 0 rgba(255, 255, 255, 0.06)
                      `;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = `
                        6px 6px 12px ${NEU_SHADOW_DARK},
                        -6px -6px 12px ${NEU_SHADOW_LIGHT},
                        0 0 10px ${NEU_GLOW},
                        inset 1px 1px 0 rgba(255, 255, 255, 0.04)
                      `;
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = `
                        10px 10px 24px ${NEU_SHADOW_DARK},
                        -10px -10px 24px ${NEU_SHADOW_LIGHT},
                        0 0 16px ${NEU_GLOW},
                        inset 1px 1px 0 rgba(255, 255, 255, 0.08)
                      `;
                  }}
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-3 lg:w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share your success</p>
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="h-9 w-9 rounded-full transition-all duration-200 sm:h-11 sm:w-11 lg:h-8 lg:w-8"
              style={{
                background: DARK_BG,
                color: LIGHT_BLUE,
                boxShadow: `
                    8px 8px 20px ${NEU_SHADOW_DARK},
                    -8px -8px 20px ${NEU_SHADOW_LIGHT},
                    0 0 12px ${NEU_GLOW},
                    inset 1px 1px 0 rgba(255, 255, 255, 0.06)
                  `,
                border: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `
                    10px 10px 24px ${NEU_SHADOW_DARK},
                    -10px -10px 24px ${NEU_SHADOW_LIGHT},
                    0 0 16px ${NEU_GLOW},
                    inset 1px 1px 0 rgba(255, 255, 255, 0.08)
                  `;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `
                    8px 8px 20px ${NEU_SHADOW_DARK},
                    -8px -8px 20px ${NEU_SHADOW_LIGHT},
                    0 0 12px ${NEU_GLOW},
                    inset 1px 1px 0 rgba(255, 255, 255, 0.06)
                  `;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = `
                    6px 6px 12px ${NEU_SHADOW_DARK},
                    -6px -6px 12px ${NEU_SHADOW_LIGHT},
                    0 0 10px ${NEU_GLOW},
                    inset 1px 1px 0 rgba(255, 255, 255, 0.04)
                  `;
                e.currentTarget.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = `
                    10px 10px 24px ${NEU_SHADOW_DARK},
                    -10px -10px 24px ${NEU_SHADOW_LIGHT},
                    0 0 16px ${NEU_GLOW},
                    inset 1px 1px 0 rgba(255, 255, 255, 0.08)
                  `;
              }}
            >
              {balanceVisible ? (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-3 lg:w-3" />
              ) : (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 lg:h-3 lg:w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Daily ROS and Active Stakes - Bottom section */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Daily ROS - Clickable */}
        <button
          onClick={() => {
            const handleScroll = () => {
              const element = document.getElementById('daily-ros');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            };

            // Check if we're already on the dashboard page
            if (window.location.pathname === '/dashboard') {
              // Already on dashboard, just scroll
              handleScroll();
            } else {
              // Navigate first, then scroll
              router.push('/dashboard#daily-ros');
              // Wait for navigation to complete
              setTimeout(handleScroll, 300);
            }
          }}
          className="rounded-xl p-4 text-left transition-all duration-200 sm:p-5"
          style={{
            background: DARK_BG,
            boxShadow: `
                8px 8px 20px ${NEU_SHADOW_DARK},
                -8px -8px 20px ${NEU_SHADOW_LIGHT},
                0 0 12px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.06)
              `,
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
                10px 10px 24px ${NEU_SHADOW_DARK},
                -10px -10px 24px ${NEU_SHADOW_LIGHT},
                0 0 16px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.08)
              `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
                8px 8px 20px ${NEU_SHADOW_DARK},
                -8px -8px 20px ${NEU_SHADOW_LIGHT},
                0 0 12px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.06)
              `;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = `
                6px 6px 12px ${NEU_SHADOW_DARK},
                -6px -6px 12px ${NEU_SHADOW_LIGHT},
                0 0 10px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.04)
              `;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = `
                10px 10px 24px ${NEU_SHADOW_DARK},
                -10px -10px 24px ${NEU_SHADOW_LIGHT},
                0 0 16px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.08)
              `;
          }}
        >
          <p
            className="mb-1.5 text-[10px] font-medium sm:mb-2 sm:text-xs lg:mb-1.5 lg:text-[10px]"
            style={{ color: LIGHT_BLUE_MUTED }}
          >
            DAILY ROS
          </p>
          {balanceVisible ? (
            <p
              className="text-base font-bold sm:text-lg lg:text-sm xl:text-base"
              style={{ color: LIGHT_BLUE, filter: 'none' }}
            >
              $
              {dailyROS.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          ) : (
            <p
              className="text-base font-bold sm:text-lg lg:text-sm xl:text-base"
              style={{ color: LIGHT_BLUE_MUTED, filter: 'none' }}
            >
              ••••••
            </p>
          )}
        </button>

        {/* Active Stakes - Clickable */}
        <button
          onClick={() => router.push('/dashboard/stakes')}
          className="rounded-xl p-4 text-left transition-all duration-200 sm:p-5"
          style={{
            background: DARK_BG,
            boxShadow: `
                8px 8px 20px ${NEU_SHADOW_DARK},
                -8px -8px 20px ${NEU_SHADOW_LIGHT},
                0 0 12px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.06)
              `,
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
                10px 10px 24px ${NEU_SHADOW_DARK},
                -10px -10px 24px ${NEU_SHADOW_LIGHT},
                0 0 16px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.08)
              `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
                8px 8px 20px ${NEU_SHADOW_DARK},
                -8px -8px 20px ${NEU_SHADOW_LIGHT},
                0 0 12px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.06)
              `;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = `
                6px 6px 12px ${NEU_SHADOW_DARK},
                -6px -6px 12px ${NEU_SHADOW_LIGHT},
                0 0 10px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.04)
              `;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = `
                10px 10px 24px ${NEU_SHADOW_DARK},
                -10px -10px 24px ${NEU_SHADOW_LIGHT},
                0 0 16px ${NEU_GLOW},
                inset 1px 1px 0 rgba(255, 255, 255, 0.08)
              `;
          }}
        >
          <p
            className="mb-1.5 text-[10px] font-medium sm:mb-2 sm:text-xs lg:mb-1.5 lg:text-[10px]"
            style={{ color: LIGHT_BLUE_MUTED }}
          >
            ACTIVE STAKES
          </p>
          <p
            className="text-base font-bold sm:text-lg lg:text-sm xl:text-base"
            style={{ color: LIGHT_BLUE, filter: 'none' }}
          >
            {activeStakesCount} {activeStakesCount === 1 ? 'Asset' : 'Assets'}
          </p>
        </button>
      </div>
    </div>
  );

  if (noCard) {
    return content;
  }

  return (
    <div
      className="group relative overflow-hidden rounded-3xl transition-all duration-300 lg:max-w-md lg:rounded-2xl"
      style={{
        background: CARD_BG,
        boxShadow: `
          8px 8px 24px ${NEU_SHADOW_DARK},
          -8px -8px 24px ${NEU_SHADOW_LIGHT},
          0 0 18px ${NEU_GLOW},
          inset 1px 1px 0 rgba(255, 255, 255, 0.12)
        `,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          10px 10px 28px ${NEU_SHADOW_DARK},
          -10px -10px 28px ${NEU_SHADOW_LIGHT},
          0 0 24px ${NEU_GLOW},
          inset 1px 1px 0 rgba(255, 255, 255, 0.15)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          8px 8px 24px ${NEU_SHADOW_DARK},
          -8px -8px 24px ${NEU_SHADOW_LIGHT},
          0 0 18px ${NEU_GLOW},
          inset 1px 1px 0 rgba(255, 255, 255, 0.12)
        `;
      }}
    >
      {content}
    </div>
  );
}
