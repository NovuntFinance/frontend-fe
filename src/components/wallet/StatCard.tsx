/**
 * Wallet Stat Card Component
 * Displays wallet statistics using Staking Streak template design
 */

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/wallet';
import { prefersReducedMotion } from '@/lib/accessibility';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorTheme?: 'purple' | 'orange' | 'emerald' | 'blue';
  className?: string;
}

/**
 * Stat Card Component - Staking Streak Template
 * Memoized for performance with hover animations
 */
export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  colorTheme = 'blue',
  className,
}: StatCardProps) {
  const reducedMotion = prefersReducedMotion();

  // Color theme mappings matching dashboard pattern
  const colorConfigs: Record<
    string,
    {
      gradient: string;
      blob: string;
      iconBg: string;
      textGradient: string;
      iconColor: string;
    }
  > = {
    purple: {
      gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      blob: 'bg-purple-500/30',
      iconBg: 'from-purple-500/30 to-indigo-500/20',
      textGradient: 'from-purple-600 to-indigo-600',
      iconColor: 'text-purple-500',
    },
    orange: {
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      blob: 'bg-amber-500/30',
      iconBg: 'from-amber-500/30 to-orange-500/20',
      textGradient: 'from-amber-600 to-orange-600',
      iconColor: 'text-amber-500',
    },
    emerald: {
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      blob: 'bg-emerald-500/30',
      iconBg: 'from-emerald-500/30 to-green-500/20',
      textGradient: 'from-emerald-600 to-green-600',
      iconColor: 'text-emerald-500',
    },
    blue: {
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      blob: 'bg-blue-500/30',
      iconBg: 'from-blue-500/30 to-cyan-500/20',
      textGradient: 'from-blue-600 to-cyan-600',
      iconColor: 'text-blue-500',
    },
  };

  const colors = colorConfigs[colorTheme] || colorConfigs.blue;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
        {/* Animated Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}
        />

        {/* Animated Floating Blob */}
        {!reducedMotion && (
          <motion.div
            animate={{
              x: [0, -15, 0],
              y: [0, 10, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute -bottom-8 -left-12 h-24 w-24 rounded-full ${colors.blob} blur-2xl`}
          />
        )}

        <CardHeader className="relative p-4 sm:p-6">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className={`rounded-xl bg-gradient-to-br ${colors.iconBg} p-2 shadow-lg backdrop-blur-sm sm:p-3`}
            >
              <div className={colors.iconColor}>{icon}</div>
            </motion.div>
            <div className="min-w-0 flex-1">
              <CardTitle
                className={`bg-gradient-to-r ${colors.textGradient} bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg`}
              >
                {label}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="mb-2 flex w-full min-w-0 items-baseline gap-2 sm:mb-4 sm:gap-3">
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
              animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              key={value}
              className={`bg-gradient-to-r ${colors.textGradient} overflow-visible bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl`}
              style={{ wordBreak: 'keep-all' }}
            >
              ${formatCurrency(value, { showCurrency: false })}
            </motion.span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
