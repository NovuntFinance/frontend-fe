'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { WalletDashboard, TransactionHistory } from '@/components/wallet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Modern Wallet Dashboard Page
 * Premium finance platform design with Novunt branding
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */
export default function WalletPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>(
    (tabParam === 'transactions' ? 'transactions' : 'overview') as
      | 'overview'
      | 'transactions'
  );

  useEffect(() => {
    if (tabParam === 'transactions') {
      setActiveTab('transactions');
    }
  }, [tabParam]);

  return (
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <div className="space-y-4 px-4 sm:space-y-6 sm:px-6">
        {/* Page Header - Matching Dashboard Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">
            Wallet
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your funds, deposits, and withdrawals
          </p>
        </motion.div>

        {/* Main Content - Overview Tab */}
        {activeTab === 'overview' && <WalletDashboard />}

        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TransactionHistory />
          </motion.div>
        )}

        {/* Tab Navigation - Fixed Bottom on Mobile */}
        <div className="bg-background/95 sm:backdrop-blur-0 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-sm sm:relative sm:border-0 sm:bg-transparent">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'overview' | 'transactions')
            }
            className="sm:space-y-6"
          >
            <TabsList className="sm:bg-muted w-full rounded-none border-0 bg-transparent sm:w-fit sm:rounded-lg sm:border">
              <TabsTrigger value="overview" className="flex-1 sm:flex-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1 sm:flex-none">
                Transactions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
