'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NovuntPremiumCardProps {
  /**
   * The main title of the card
   */
  title: string;
  /**
   * The subtitle or description text
   */
  subtitle?: string;
  /**
   * Optional tooltip text to display next to the title
   */
  tooltip?: string;
  /**
   * The icon component to display in the header
   */
  icon?: React.ElementType;
  /**
   * The primary color theme for the card (default: orange)
   */
  colorTheme?: 'orange' | 'blue' | 'emerald' | 'purple';
  /**
   * The content of the card
   */
  children: React.ReactNode;
  /**
   * Optional CSS class overrides
   */
  className?: string;
  /**
   * Optional click handler for the card
   */
  onClick?: () => void;
}

/**
 * NovuntPremiumCard
 *
 * A reusable card component that implements the "Journey" design language:
 * - Dark glassmorphism background
 * - Subtle gradient glows
 * - Distinctive header with icon container
 * - Premium border styling
 */
export function NovuntPremiumCard({
  title,
  subtitle,
  tooltip,
  icon: Icon,
  colorTheme = 'orange',
  children,
  className,
  onClick,
}: NovuntPremiumCardProps) {
  // Color theme maps
  const themeStyles = {
    orange: {
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-500',
      glowFrom: 'from-orange-500/10',
      glowTo: 'to-emerald-500/10',
      border: 'border-orange-500/20',
    },
    blue: {
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-500',
      glowFrom: 'from-blue-500/10',
      glowTo: 'to-purple-500/10',
      border: 'border-blue-500/20',
    },
    emerald: {
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-500',
      glowFrom: 'from-emerald-500/10',
      glowTo: 'to-blue-500/10',
      border: 'border-emerald-500/20',
    },
    purple: {
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-500',
      glowFrom: 'from-purple-500/10',
      glowTo: 'to-pink-500/10',
      border: 'border-purple-500/20',
    },
  };

  const theme = themeStyles[colorTheme];

  return (
    <Card
      className={cn(
        'border-border/50 from-card via-card to-muted/20 relative overflow-hidden bg-gradient-to-br transition-all duration-300',
        onClick && 'hover:border-opacity-50 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Background Glow Effect */}
      <div
        className={cn(
          'pointer-events-none absolute top-0 left-0 h-full w-full bg-gradient-to-br opacity-50',
          theme.glowFrom,
          'via-transparent',
          theme.glowTo
        )}
      />

      <CardContent className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          {Icon && (
            <motion.div
              className={cn(
                'rounded-xl border p-2.5 backdrop-blur-sm',
                theme.iconBg,
                theme.border
              )}
              animate={{
                x: [0, 5, 0, -5, 0],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon className={cn('h-5 w-5', theme.iconColor)} />
            </motion.div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn('text-lg font-bold', theme.iconColor)}>
                {title}
              </h3>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="text-muted-foreground/60 hover:text-foreground h-4 w-4 cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}
