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
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import { openShareModal } from '@/store/shareModalStore';
import { useWalletBalance } from '@/lib/queries';
import { formatCurrency } from '@/lib/utils/wallet';

/* Welcome card: all text white in both light and dark mode for consistency on dark/blue surfaces */
const WELCOME_TEXT_WHITE = '#ffffff';

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
  const openModal = useUIStore((s) => s.openModal);
  const { data: walletBalance } = useWalletBalance();

  const depositBalance = walletBalance?.funded?.availableBalance ?? 0;
  const earningsBalance = walletBalance?.earnings?.availableBalance ?? 0;
  const totalAssets = depositBalance + earningsBalance;

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
                style={{ color: 'var(--neu-accent)' }}
                aria-label="Total Assets. Tap for details."
              >
                Total Assets
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="max-w-[260px] shadow-lg"
              style={{
                borderColor: 'var(--neu-border)',
                background: 'var(--neu-bg)',
                color: WELCOME_TEXT_WHITE,
              }}
            >
              <p
                className="text-xs opacity-90"
                style={{ color: WELCOME_TEXT_WHITE }}
              >
                Combined Value of your Deposit Asset and Earnings Asset
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
              style={{ color: 'var(--neu-text-primary)', filter: 'none' }}
            >
              $
              {totalAssets.toLocaleString('en-US', {
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
              style={{ color: 'var(--neu-text-primary)', filter: 'none' }}
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
                  background: 'var(--neu-accent)',
                  color: WELCOME_TEXT_WHITE,
                  border: '1px solid var(--neu-border)',
                  boxShadow:
                    '0 2px 8px var(--neu-shadow-dark), inset 0 1px 0 var(--neu-shadow-light)',
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
              background: 'var(--neu-accent)',
              color: WELCOME_TEXT_WHITE,
              border: '1px solid var(--neu-border)',
              boxShadow:
                '0 2px 8px var(--neu-shadow-dark), inset 0 1px 0 var(--neu-shadow-light)',
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

      {/* Embedded sub-cards: Deposit Wallet + Earnings Wallet (light blue, white text) */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
        <button
          type="button"
          onClick={() => openModal('wallet')}
          className="rounded-xl p-5 text-left transition-all duration-200 sm:p-6"
          style={{
            background: 'var(--neu-accent)',
            boxShadow: 'var(--neu-shadow-raised)',
            border: '1px solid var(--neu-border)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
          }}
        >
          <p
            className="mb-1 text-[10px] font-medium tracking-wide sm:text-xs"
            style={{ color: WELCOME_TEXT_WHITE }}
          >
            Deposit Wallet
          </p>
          {balanceVisible ? (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: WELCOME_TEXT_WHITE, filter: 'none' }}
            >
              ${formatCurrency(depositBalance, { showCurrency: false })}
            </p>
          ) : (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: WELCOME_TEXT_WHITE }}
            >
              ••••••
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => openModal('wallet')}
          className="rounded-xl p-5 text-left transition-all duration-200 sm:p-6"
          style={{
            background: 'var(--neu-accent)',
            boxShadow: 'var(--neu-shadow-raised)',
            border: '1px solid var(--neu-border)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
          }}
        >
          <p
            className="mb-1 text-[10px] font-medium tracking-wide sm:text-xs"
            style={{ color: WELCOME_TEXT_WHITE }}
          >
            Earnings Wallet
          </p>
          {balanceVisible ? (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: WELCOME_TEXT_WHITE, filter: 'none' }}
            >
              ${formatCurrency(earningsBalance, { showCurrency: false })}
            </p>
          ) : (
            <p
              className="text-base font-bold sm:text-lg"
              style={{ color: WELCOME_TEXT_WHITE }}
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
      className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: 'var(--neu-bg)',
        boxShadow: 'var(--neu-shadow-raised)',
        border: '1px solid var(--neu-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
      }}
    >
      {content}
    </div>
  );
}
