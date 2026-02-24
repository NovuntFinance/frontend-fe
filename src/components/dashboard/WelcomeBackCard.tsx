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

const NEU_BG = '#0D162C';
const NEU_SURFACE = '#131B2E';
const NEU_TEXT = '#009BF2';
const NEU_TEXT_MUTED = 'rgba(0, 155, 242, 0.7)';
const NEU_SHADOW_DARK = 'rgba(0, 0, 0, 0.5)';
const NEU_SHADOW_LIGHT = 'rgba(255, 255, 255, 0.05)';

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
    <div className="relative z-10 p-3 sm:p-4 lg:p-3 xl:p-4">
      {/* Balance and actions aligned horizontally */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-3">
        {/* Portfolio value - Left side */}
        <div className="min-w-0 flex-1">
          <p
            className="mb-1.5 text-xs font-bold sm:mb-2 sm:text-sm lg:mb-1.5 lg:text-xs"
            style={{ color: NEU_TEXT_MUTED }}
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
              style={{ color: NEU_TEXT, filter: 'none' }}
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
              style={{ color: NEU_TEXT_MUTED, filter: 'none' }}
            >
              ••••••••
            </motion.div>
          )}
        </div>

        {/* Right side: % badge + Share + Eye */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 lg:gap-2">
          {/* Inset neumorphic % badge with double border */}
          {lastWeekProfitChange !== 0 && (
            <div
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 lg:px-3 lg:py-1.5"
              style={{
                background: NEU_SURFACE,
                boxShadow: `
                    inset 8px 8px 16px ${NEU_SHADOW_DARK},
                    inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                    inset 2px 2px 4px rgba(0, 0, 0, 0.4),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.03)
                  `,
                border: 'none',
                color: NEU_TEXT,
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
                    background: NEU_SURFACE,
                    color: NEU_TEXT,
                    boxShadow: `
                        8px 8px 16px ${NEU_SHADOW_DARK},
                        -8px -8px 16px ${NEU_SHADOW_LIGHT},
                        0 0 0 1px rgba(255, 255, 255, 0.05)
                      `,
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `
                        10px 10px 20px ${NEU_SHADOW_DARK},
                        -10px -10px 20px ${NEU_SHADOW_LIGHT},
                        0 0 0 1px rgba(255, 255, 255, 0.08),
                        0 0 20px rgba(0, 155, 242, 0.2)
                      `;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `
                        8px 8px 16px ${NEU_SHADOW_DARK},
                        -8px -8px 16px ${NEU_SHADOW_LIGHT},
                        0 0 0 1px rgba(255, 255, 255, 0.05)
                      `;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = `
                        inset 4px 4px 8px ${NEU_SHADOW_DARK},
                        inset -4px -4px 8px ${NEU_SHADOW_LIGHT}
                      `;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = `
                        10px 10px 20px ${NEU_SHADOW_DARK},
                        -10px -10px 20px ${NEU_SHADOW_LIGHT},
                        0 0 0 1px rgba(255, 255, 255, 0.08),
                        0 0 20px rgba(0, 155, 242, 0.2)
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
                background: NEU_SURFACE,
                color: NEU_TEXT,
                boxShadow: `
                    8px 8px 16px ${NEU_SHADOW_DARK},
                    -8px -8px 16px ${NEU_SHADOW_LIGHT},
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `,
                border: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `
                    10px 10px 20px ${NEU_SHADOW_DARK},
                    -10px -10px 20px ${NEU_SHADOW_LIGHT},
                    0 0 0 1px rgba(255, 255, 255, 0.08),
                    0 0 20px rgba(0, 155, 242, 0.2)
                  `;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `
                    8px 8px 16px ${NEU_SHADOW_DARK},
                    -8px -8px 16px ${NEU_SHADOW_LIGHT},
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = `
                    inset 4px 4px 8px ${NEU_SHADOW_DARK},
                    inset -4px -4px 8px ${NEU_SHADOW_LIGHT}
                  `;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = `
                    10px 10px 20px ${NEU_SHADOW_DARK},
                    -10px -10px 20px ${NEU_SHADOW_LIGHT},
                    0 0 0 1px rgba(255, 255, 255, 0.08),
                    0 0 20px rgba(0, 155, 242, 0.2)
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
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 lg:mt-3 lg:gap-4">
        {/* Daily ROS - Clickable with double border inset */}
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
          className="rounded-xl p-3.5 text-left transition-all duration-200 sm:p-4 lg:p-4"
          style={{
            background: NEU_SURFACE,
            boxShadow: `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.4),
                inset -2px -2px 4px rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `,
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 10px 10px 20px ${NEU_SHADOW_DARK},
                inset -10px -10px 20px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.5),
                inset -2px -2px 4px rgba(255, 255, 255, 0.12),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.4),
                inset -2px -2px 4px rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 12px 12px 24px ${NEU_SHADOW_DARK},
                inset -12px -12px 24px ${NEU_SHADOW_LIGHT},
                inset 3px 3px 6px rgba(0, 0, 0, 0.6),
                inset -3px -3px 6px rgba(255, 255, 255, 0.15)
              `;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 10px 10px 20px ${NEU_SHADOW_DARK},
                inset -10px -10px 20px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.5),
                inset -2px -2px 4px rgba(255, 255, 255, 0.12),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `;
          }}
        >
          <p
            className="mb-1.5 text-[10px] font-medium sm:mb-2 sm:text-xs lg:mb-1.5 lg:text-[10px]"
            style={{ color: NEU_TEXT_MUTED }}
          >
            DAILY ROS
          </p>
          {balanceVisible ? (
            <p
              className="text-base font-bold sm:text-lg lg:text-sm xl:text-base"
              style={{ color: NEU_TEXT, filter: 'none' }}
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
              style={{ color: NEU_TEXT_MUTED, filter: 'none' }}
            >
              ••••••
            </p>
          )}
        </button>

        {/* Active Stakes - Clickable with double border inset */}
        <button
          onClick={() => router.push('/dashboard/stakes')}
          className="rounded-xl p-3.5 text-left transition-all duration-200 sm:p-4 lg:p-4"
          style={{
            background: NEU_SURFACE,
            boxShadow: `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.4),
                inset -2px -2px 4px rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `,
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 10px 10px 20px ${NEU_SHADOW_DARK},
                inset -10px -10px 20px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.5),
                inset -2px -2px 4px rgba(255, 255, 255, 0.12),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 8px 8px 16px ${NEU_SHADOW_DARK},
                inset -8px -8px 16px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.4),
                inset -2px -2px 4px rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.03)
              `;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 12px 12px 24px ${NEU_SHADOW_DARK},
                inset -12px -12px 24px ${NEU_SHADOW_LIGHT},
                inset 3px 3px 6px rgba(0, 0, 0, 0.6),
                inset -3px -3px 6px rgba(255, 255, 255, 0.15)
              `;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = `
                inset 10px 10px 20px ${NEU_SHADOW_DARK},
                inset -10px -10px 20px ${NEU_SHADOW_LIGHT},
                inset 2px 2px 4px rgba(0, 0, 0, 0.5),
                inset -2px -2px 4px rgba(255, 255, 255, 0.12),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `;
          }}
        >
          <p
            className="mb-1.5 text-[10px] font-medium sm:mb-2 sm:text-xs lg:mb-1.5 lg:text-[10px]"
            style={{ color: NEU_TEXT_MUTED }}
          >
            ACTIVE STAKES
          </p>
          <p
            className="text-base font-bold sm:text-lg lg:text-sm xl:text-base"
            style={{ color: NEU_TEXT, filter: 'none' }}
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
        background: NEU_SURFACE,
        boxShadow: `
          12px 12px 24px ${NEU_SHADOW_DARK},
          -12px -12px 24px ${NEU_SHADOW_LIGHT},
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          14px 14px 28px ${NEU_SHADOW_DARK},
          -14px -14px 28px ${NEU_SHADOW_LIGHT},
          0 0 0 1px rgba(255, 255, 255, 0.08)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          12px 12px 24px ${NEU_SHADOW_DARK},
          -12px -12px 24px ${NEU_SHADOW_LIGHT},
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `;
      }}
    >
      {content}
    </div>
  );
}
