/**
 * Stake Requirement Component - Gold Design
 * Modern card with CTA button
 */

'use client';

import React from 'react';
import { TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StakeRequirementProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Stake Requirement Component
 * Shows first stake requirement with navigation CTA
 */
export function StakeRequirement({
  stakeData,
  onComplete,
}: StakeRequirementProps) {
  const router = useRouter();
  const isComplete = stakeData.completed;

  const handleStakeClick = () => {
    router.push('/dashboard/stakes');
  };

  if (isComplete) {
    return (
      <Card className="border-2 border-green-500/30 bg-green-500/5 hover:border-green-500/50 transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/20 border border-green-500/30">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">
                  Create First Stake
                </h3>
                {stakeData.amount && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Staked {formatCurrency(stakeData.amount)}
                  </p>
                )}
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-2 border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/5 to-background hover:border-novunt-gold-500/50 hover:shadow-lg hover:shadow-novunt-gold-500/10 transition-all duration-300 group h-full flex flex-col">
      {/* Gold shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-novunt-gold-500/10 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />

      <CardContent className="relative z-10 p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-novunt-gold-500/20 border border-novunt-gold-500/30 group-hover:bg-novunt-gold-500/30 transition-colors">
              <TrendingUp className="h-5 w-5 text-novunt-gold-600 dark:text-novunt-gold-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-0.5">
                Create First Stake
              </h3>
              <p className="text-xs text-muted-foreground">
                Deposit to create your first stake
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Button
            onClick={handleStakeClick}
            className="w-full bg-gradient-to-r from-novunt-gold-500 to-novunt-gold-600 hover:from-novunt-gold-600 hover:to-novunt-gold-700 text-white border-0 shadow-md shadow-novunt-gold-500/20 hover:shadow-lg hover:shadow-novunt-gold-500/30 transition-all duration-300"
            size="sm"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
