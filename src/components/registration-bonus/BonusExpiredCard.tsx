/**
 * Bonus Expired Card Component
 * Shows when registration bonus deadline has passed
 * Follows Novunt design system
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Gift, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BonusExpiredCardProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Bonus Expired Card Component
 * Shows expired message with alternative options
 */
export function BonusExpiredCard({ bonusData }: BonusExpiredCardProps) {
  const router = useRouter();

  return (
    <Card className="border-muted bg-muted/30">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Expired Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted border-2 border-border"
          >
            <Clock className="h-8 w-8 text-muted-foreground" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ⏰ Time's Up
            </h2>
            <p className="text-sm text-muted-foreground">
              The registration bonus deadline has passed
            </p>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-card border border-border/50"
          >
            <p className="text-sm text-foreground mb-2">
              Don't worry! You can still earn rewards through:
            </p>
            <ul className="text-left text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Our referral program</li>
              <li>Regular staking rewards</li>
              <li>Weekly profit distributions</li>
            </ul>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/team')}
            >
              <Gift className="mr-2 h-4 w-4" />
              Referral Program
            </Button>
            <Button
              onClick={() => router.push('/dashboard/stakes')}
            >
              View Stakes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

