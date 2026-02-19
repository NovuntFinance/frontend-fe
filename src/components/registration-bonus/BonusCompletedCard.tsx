/**
 * Bonus Completed Card Component
 * Celebration state when the bonus has been fully earned (100% return cap reached).
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BonusActivatedCardProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function BonusCompletedCard({ bonusData }: BonusActivatedCardProps) {
  const router = useRouter();

  const totalEarned =
    bonusData.bonus?.paidOut ??
    bonusData.bonus?.bonusPaidOut ??
    bonusData.bonus?.totalAmount ??
    bonusData.bonusAmount ??
    0;

  return (
    <Card className="to-background relative overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 shadow-lg">
      <CardContent className="relative z-10 p-6">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-500/20"
          >
            <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-foreground mb-2 text-2xl font-bold">
              Bonus Fully Earned!
            </h2>
            <p className="text-muted-foreground text-sm">
              Congratulations! Your welcome bonus has been fully paid out.
            </p>
          </motion.div>

          {totalEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
            >
              <p className="text-muted-foreground mb-1 text-sm">Total Earned</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalEarned)}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Button onClick={() => router.push('/dashboard/stakes')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Stakes
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
