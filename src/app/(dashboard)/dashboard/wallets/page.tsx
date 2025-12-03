'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { WalletDashboard, TransactionHistory } from '@/components/wallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-foreground mb-2 text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds, deposits, and withdrawals
          </p>
        </motion.div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'overview' | 'transactions')
          }
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <WalletDashboard />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
