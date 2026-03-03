'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Wallet } from 'lucide-react';
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
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import { useWalletBalance } from '@/lib/queries';
import { formatCurrency, formatAddress } from '@/lib/utils/wallet';
import { useDefaultWithdrawalAddress } from '@/hooks/useWallet';
import { copyToClipboard } from '@/lib/utils';
import { toast } from '@/components/ui/enhanced-toast';

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
  const openModal = useUIStore((s) => s.openModal);
  const { data: walletBalance } = useWalletBalance();
  const { data: addressData, isLoading: addressLoading } =
    useDefaultWithdrawalAddress();
  const [addressCopied, setAddressCopied] = useState(false);

  const savedAddress =
    addressData?.address ??
    (addressData as { data?: { address?: string } })?.data?.address ??
    '';
  const hasWithdrawalAddress = savedAddress.length > 0;

  const depositBalance = walletBalance?.funded?.availableBalance ?? 0;
  const earningsBalance = walletBalance?.earnings?.availableBalance ?? 0;
  const totalAssets = depositBalance + earningsBalance;

  const greetingName = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : 'Stakeholder';

  const content = (
    <div className="relative z-10 p-5 sm:p-6">
      {/* Top row: Total Assets + Eye (neumorphic icon buttons) */}
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

        {/* Eye + Rank badge: stacked, right-aligned */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setBalanceVisible(!balanceVisible)}
            data-welcome-eye
            className="flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
            style={{ color: 'var(--neu-accent)' }}
            aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
          >
            {balanceVisible ? (
              <Eye className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
            ) : (
              <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
            )}
          </button>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
            style={{
              background: 'rgba(var(--neu-accent-rgb), 0.35)',
              color: 'var(--neu-accent)',
              border: '1px solid var(--neu-border)',
            }}
          >
            {user?.rank || 'Stakeholder'}
          </span>
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

      {/* Withdrawal address: show when set, or CTA when not set */}
      <div className="mt-4 sm:mt-5">
        {addressLoading ? (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5"
            style={{
              background: 'var(--neu-accent)',
              border: '1px solid var(--neu-border)',
              boxShadow: 'var(--neu-shadow-inset)',
            }}
          >
            <div
              className="h-4 w-24 animate-pulse rounded bg-white/30 sm:w-32"
              style={{ color: WELCOME_TEXT_WHITE }}
            />
          </div>
        ) : hasWithdrawalAddress ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => openModal('wallet')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal('wallet');
              }
            }}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 sm:px-5 sm:py-3.5"
            style={{
              background: 'var(--neu-accent)',
              boxShadow: 'var(--neu-shadow-raised)',
              border: '1px solid var(--neu-border)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                'var(--neu-shadow-raised-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
            }}
          >
            <span
              className="text-[10px] font-medium tracking-wide sm:text-xs"
              style={{ color: WELCOME_TEXT_WHITE }}
            >
              Withdrawal address
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="truncate font-mono text-xs font-medium sm:text-sm"
                style={{ color: WELCOME_TEXT_WHITE }}
                title={savedAddress}
              >
                {formatAddress(savedAddress)}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(savedAddress);
                      setAddressCopied(true);
                      setTimeout(() => setAddressCopied(false), 2000);
                      toast.success('Address copied to clipboard');
                    }}
                    className="flex-shrink-0 rounded p-1.5 transition hover:bg-white/20"
                    aria-label="Copy address"
                  >
                    <Copy
                      className="h-4 w-4"
                      style={{ color: WELCOME_TEXT_WHITE }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{addressCopied ? 'Copied!' : 'Copy full address'}</p>
                </TooltipContent>
              </Tooltip>
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openModal('wallet')}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-left transition-all duration-200 sm:px-5 sm:py-4"
            style={{
              background: 'rgba(0,155,242,0.08)',
              borderColor: 'var(--neu-accent)',
              color: 'var(--neu-accent)',
              cursor: 'pointer',
            }}
          >
            <Wallet
              className="h-5 w-5 flex-shrink-0 opacity-90"
              strokeWidth={2}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm">
                Withdrawal address not set
              </p>
              <p className="mt-0.5 text-[10px] opacity-90 sm:text-xs">
                Set your whitelisted BEP20 address to enable withdrawals
              </p>
            </div>
          </button>
        )}
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
