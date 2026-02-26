'use client';

import React from 'react';
import { Eye, EyeOff, Share2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { openShareModal } from '@/store/shareModalStore';
import { useActiveStakes } from '@/lib/queries';
import { useStakeDashboard } from '@/lib/queries/stakingQueries';
import neuStyles from '@/styles/neumorphic.module.css';

// Platform neumorphic tokens (match Quick Actions, Stats, etc.)
const NEU_RAISED_SHADOW =
  '8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)';
const NEU_RAISED_HOVER =
  '10px 10px 24px rgba(4, 8, 18, 0.75), -10px -10px 24px rgba(25, 40, 72, 0.55)';
const NEU_BORDER = '1px solid rgba(0, 155, 242, 0.08)';

// Welcome banner (inverted): main card = dark blue; sub-cards = light blue with dark text
const MAIN_CARD_BG = '#0D162C';
const MAIN_LABEL = 'rgba(255, 255, 255, 0.9)';
const MAIN_VALUE = '#009BF2';
const SUB_CARD_BG = '#009BF2';
const SUB_LABEL = 'rgba(13, 22, 44, 0.85)';
const SUB_VALUE = '#0D162C';
const SUB_BORDER = '1px solid rgba(13, 22, 44, 0.2)';

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
      {/* Top row: Total Assets + Share + Eye (neumorphic icon buttons) */}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="mb-1 block cursor-help text-left text-xs font-medium sm:mb-1.5 sm:text-sm"
                style={{ color: MAIN_LABEL }}
                aria-label="Total Assets. Tap for details."
              >
                Total Assets
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="max-w-[260px] border-[#0D162C] bg-[#0D162C] text-white shadow-lg"
            >
              <p className="text-xs text-white/90">
                Combined value of your wallet balance and all staked amounts
              </p>
            </PopoverContent>
          </Popover>
          {balanceVisible ? (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl leading-tight font-black sm:text-3xl md:text-4xl lg:text-2xl xl:text-3xl"
              style={{ color: MAIN_VALUE, filter: 'none' }}
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
              className="text-2xl leading-tight font-black sm:text-3xl md:text-4xl lg:text-2xl xl:text-3xl"
              style={{ color: MAIN_LABEL, filter: 'none' }}
            >
              ••••••••
            </motion.div>
          )}
        </div>

        {/* Share + Eye: inverted (light blue circle, dark icon) to match card */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  openShareModal('profit', {
                    title: 'Share Your Success!',
                    message: `🎉 I'm earning on Novunt!\nJoin me and start earning too.`,
                    amount: totalEarnings,
                  });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:opacity-90 active:scale-95 sm:h-11 sm:w-11"
                style={{
                  background: '#009BF2',
                  color: '#0D162C',
                  border: '1px solid rgba(13, 22, 44, 0.2)',
                  boxShadow:
                    '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share your success</p>
            </TooltipContent>
          </Tooltip>
          <button
            type="button"
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:opacity-90 active:scale-95 sm:h-11 sm:w-11"
            style={{
              background: '#009BF2',
              color: '#0D162C',
              border: '1px solid rgba(13, 22, 44, 0.2)',
              boxShadow:
                '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
            aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
          >
            {balanceVisible ? (
              <Eye className="h-5 w-5" strokeWidth={2} />
            ) : (
              <EyeOff className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Embedded sub-cards: light blue with dark text (inverted) */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
        <button
          type="button"
          onClick={() => {
            const handleScroll = () => {
              const element = document.getElementById('daily-ros');
              if (element)
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            if (window.location.pathname === '/dashboard') {
              handleScroll();
            } else {
              router.push('/dashboard#daily-ros');
              setTimeout(handleScroll, 300);
            }
          }}
          className="rounded-xl p-5 text-left transition-all duration-200 sm:p-6"
          style={{
            background: SUB_CARD_BG,
            boxShadow: NEU_RAISED_SHADOW,
            border: SUB_BORDER,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
          }}
        >
          <p
            className="mb-1 text-[10px] font-medium tracking-wide sm:text-xs"
            style={{ color: SUB_LABEL }}
          >
            Today&apos;s Return on Stake
          </p>
          {balanceVisible ? (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: SUB_VALUE, filter: 'none' }}
            >
              $
              {dailyROS.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          ) : (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: SUB_LABEL }}
            >
              ••••••
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard/stakes')}
          className="rounded-xl p-5 text-left transition-all duration-200 sm:p-6"
          style={{
            background: SUB_CARD_BG,
            boxShadow: NEU_RAISED_SHADOW,
            border: SUB_BORDER,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
          }}
        >
          <p
            className="mb-1 text-[10px] font-medium tracking-wide sm:text-xs"
            style={{ color: SUB_LABEL }}
          >
            Active Asset(s)
          </p>
          {balanceVisible ? (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: SUB_VALUE, filter: 'none' }}
            >
              {activeStakesCount} {activeStakesCount === 1 ? 'Asset' : 'Assets'}
            </p>
          ) : (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: SUB_LABEL }}
            >
              ••••••
            </p>
          )}
        </button>
      </div>
    </div>
  );

  if (noCard) {
    return content;
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 lg:max-w-md"
      style={{
        background: MAIN_CARD_BG,
        boxShadow: NEU_RAISED_SHADOW,
        border: NEU_BORDER,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
      }}
    >
      {content}
    </div>
  );
}
