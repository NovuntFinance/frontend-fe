/**
 * Bonus Activated Card Component
 * Success state when bonus is activated
 * Follows Novunt design system with celebration animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Gift, TrendingUp, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BonusActivatedCardProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

/**
 * Bonus Activated Card Component
 * Shows success message with bonus amount
 */
export function BonusActivatedCard({ bonusData }: BonusActivatedCardProps) {
  const router = useRouter();

  return (
    <Card className="relative overflow-hidden border-2 border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/10 via-novunt-gold-500/5 to-background shadow-lg shadow-novunt-gold-500/10">
      {/* Animated gold shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-novunt-gold-500/20 via-transparent to-novunt-gold-500/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Sparkle decorations */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          <Star className="h-4 w-4 text-novunt-gold-500/50 fill-novunt-gold-500/20" />
        </motion.div>
      ))}

      <CardContent className="relative z-10 p-6">
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-novunt-gold-500/20 border-4 border-novunt-gold-500/30"
          >
            <CheckCircle2 className="h-10 w-10 text-novunt-gold-600 dark:text-novunt-gold-500" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              🎉 Bonus Activated!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your registration bonus is now active
            </p>
          </motion.div>

          {/* Bonus Amount */}
          {bonusData.bonusAmount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="p-6 rounded-xl bg-gradient-to-br from-novunt-gold-500/20 to-novunt-gold-600/20 border-2 border-novunt-gold-500/30 shadow-md shadow-novunt-gold-500/20"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-novunt-gold-600 dark:text-novunt-gold-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  You Received
                </span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-novunt-gold-600 dark:text-novunt-gold-500 mb-1">
                {formatCurrency(bonusData.bonusAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Bonus stake earning weekly profits
              </p>
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-sm text-foreground">
              Your bonus stake is now active and earning weekly profits!
            </p>
            <p className="text-xs text-muted-foreground">
              You can view all your stakes, including the bonus stake, in your staking dashboard.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => router.push('/dashboard/stakes')}
              size="lg"
              className="w-full md:w-auto"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View My Stakes
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

