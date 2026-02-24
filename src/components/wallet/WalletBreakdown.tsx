/**
 * Wallet Breakdown – Compact FUNDED WALLET / EARNING WALLET cards
 * Neumorphic style to match wallet page reference
 */

'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/wallet';
import type { UserWallet } from '@/services/walletApi';
import neuStyles from '@/styles/neumorphic.module.css';

const NEU_ACCENT = 'rgba(0,155,242,0.95)';

interface WalletBreakdownProps {
  wallet: UserWallet;
  balanceVisible: boolean;
}

export function WalletBreakdown({
  wallet,
  balanceVisible,
}: WalletBreakdownProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className={`rounded-[18px] p-4 ${neuStyles['neu-card']}`}>
        <p
          className="mb-1 text-[10px] font-semibold tracking-wider uppercase sm:text-xs"
          style={{ color: 'rgba(0,155,242,0.55)' }}
        >
          Funded Wallet
        </p>
        <p
          className="text-lg font-bold sm:text-xl"
          style={{ color: NEU_ACCENT }}
        >
          {balanceVisible
            ? `$${formatCurrency(wallet.fundedWallet, { showCurrency: false })}`
            : '••••'}
        </p>
      </div>

      <div className={`rounded-[18px] p-4 ${neuStyles['neu-card']}`}>
        <p
          className="mb-1 text-[10px] font-semibold tracking-wider uppercase sm:text-xs"
          style={{ color: 'rgba(0,155,242,0.55)' }}
        >
          Earning Wallet
        </p>
        <p
          className="text-lg font-bold sm:text-xl"
          style={{ color: NEU_ACCENT }}
        >
          {balanceVisible
            ? `$${formatCurrency(wallet.earningWallet, { showCurrency: false })}`
            : '••••'}
        </p>
      </div>
    </div>
  );
}
