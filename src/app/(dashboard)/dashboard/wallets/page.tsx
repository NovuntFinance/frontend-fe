'use client';

import React from 'react';
import { WalletDashboard, TransactionHistory } from '@/components/wallet';
import walletStyles from '@/styles/wallet-page.module.css';

/**
 * Wallet page – Neumorphic dark layout, centered max-width container.
 * Balance, actions, whitelist, and full transaction history.
 */
export default function WalletPage() {
  return (
    <div className={walletStyles.walletPage}>
      <div className={walletStyles.pageContainer}>
        <div className={walletStyles.pageContainerInner}>
          <WalletDashboard />

          <section id="transaction-history" className="scroll-mt-4">
            <TransactionHistory />
          </section>
        </div>
      </div>
    </div>
  );
}
