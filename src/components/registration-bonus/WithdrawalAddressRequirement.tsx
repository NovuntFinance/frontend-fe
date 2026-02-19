/**
 * Withdrawal Address Requirement Component – Gold Design
 * Shows whether the user has added a BEP20 withdrawal address
 */

'use client';

import React from 'react';
import { Wallet, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { WithdrawalAddressRequirementProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WithdrawalAddressRequirement({
  addressData,
  onComplete,
}: WithdrawalAddressRequirementProps) {
  const router = useRouter();
  const isComplete = addressData.isCompleted;

  const handleAddAddress = () => {
    router.push('/dashboard/wallets');
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isComplete) {
    return (
      <Card className="flex h-full flex-col border-2 border-green-500/30 bg-green-500/5 transition-all duration-300 hover:border-green-500/50">
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-green-500/30 bg-green-500/20 p-2.5">
                <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-foreground mb-0.5 text-sm font-bold">
                  Withdrawal Address
                </h3>
                <p className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {addressData.address
                    ? `${addressData.network || 'BEP20'}: ${truncateAddress(addressData.address)}`
                    : 'Address added'}
                </p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-novunt-gold-500/30 from-novunt-gold-500/5 to-background hover:border-novunt-gold-500/50 hover:shadow-novunt-gold-500/10 group relative flex h-full flex-col overflow-hidden border-2 bg-gradient-to-br transition-all duration-300 hover:shadow-lg">
      <motion.div
        className="via-novunt-gold-500/10 absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      />

      <CardContent className="relative z-10 flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-novunt-gold-500/20 border-novunt-gold-500/30 group-hover:bg-novunt-gold-500/30 rounded-lg border p-2.5 transition-colors">
              <Wallet className="text-novunt-gold-600 dark:text-novunt-gold-500 h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground mb-0.5 text-sm font-bold">
                Withdrawal Address
              </h3>
              <p className="text-muted-foreground text-xs">
                Add a BEP20 (Binance Smart Chain) wallet
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Button
            onClick={handleAddAddress}
            className="from-novunt-gold-500 to-novunt-gold-600 hover:from-novunt-gold-600 hover:to-novunt-gold-700 shadow-novunt-gold-500/20 hover:shadow-novunt-gold-500/30 w-full border-0 bg-gradient-to-r text-white shadow-md transition-all duration-300 hover:shadow-lg"
            size="sm"
          >
            Add Address
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
