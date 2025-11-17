/**
 * Wallet Breakdown Component
 * Shows funded and earning wallet breakdown
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/wallet';
import type { UserWallet } from '@/services/walletApi';

interface WalletBreakdownProps {
  wallet: UserWallet;
  balanceVisible: boolean;
}

export function WalletBreakdown({ wallet, balanceVisible }: WalletBreakdownProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Funded Wallet */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Funded Wallet</span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {balanceVisible ? formatCurrency(wallet.fundedWallet, { showCurrency: false }) : '••••'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">For staking only</p>
      </motion.div>

      {/* Earning Wallet */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-gradient-to-br from-success/10 via-success/5 to-transparent border border-success/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-muted-foreground">Earning Wallet</span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {balanceVisible ? formatCurrency(wallet.earningWallet, { showCurrency: false }) : '••••'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Withdrawable</p>
      </motion.div>
    </div>
  );
}

