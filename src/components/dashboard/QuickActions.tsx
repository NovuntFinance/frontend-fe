'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const NEU_TRANSITION = '250ms cubic-bezier(0.4, 0, 0.2, 1)';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

interface QuickActionsProps {
  /** On desktop (lg), render as 2x2 grid instead of single row */
  gridOnDesktop?: boolean;
}

/* Featured/Quick Action button colors: default = light blue bg + dark icon; hover = dark bg + light blue icon; labels invert with theme (dark in light, white in dark) */
const ACCENT_BLUE = '#009BF2';
const DARK_NAVY = '#0D162C';

/**
 * QuickActions – Neumorphic only: raised by default, inset on press.
 * Labels use --neu-text-primary (dark in light mode, white in dark mode).
 */
export function QuickActions({ gridOnDesktop }: QuickActionsProps = {}) {
  const { openModal } = useUIStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const handleAction = (actionType: string) => {
    if (actionType === 'stake') openModal('create-stake');
    else if (actionType === 'deposit') openModal('deposit');
    else if (actionType === 'withdraw') openModal('withdraw');
    else if (actionType === 'transfer') openModal('transfer');
  };

  const actions: QuickAction[] = [
    { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { id: 'stake', label: 'Stake', icon: TrendingUp },
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
  ];

  return (
    <div
      className={`flex w-full flex-wrap items-start justify-evenly gap-x-2 gap-y-6 sm:gap-x-4 sm:gap-y-2 ${
        gridOnDesktop
          ? 'lg:grid lg:grid-cols-2 lg:justify-stretch lg:gap-4'
          : ''
      }`}
    >
      {actions.map((action, index) => {
        const isHovered = hoveredIndex === index;
        const isPressed = pressedIndex === index;
        const isActive = isHovered || isPressed;

        return (
          <motion.button
            key={action.id}
            type="button"
            onClick={() => handleAction(action.id)}
            className="flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-3 sm:gap-2"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => {
              setHoveredIndex(null);
              setPressedIndex(null);
            }}
            onMouseDown={() => setPressedIndex(index)}
            onMouseUp={() => setPressedIndex(null)}
            onTouchStart={() => setPressedIndex(index)}
            onTouchEnd={() => setPressedIndex(null)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28 dark:hover:bg-[#0D162C]"
              style={{
                background: isActive
                  ? 'var(--neu-hover-bg, #ffffff)'
                  : ACCENT_BLUE,
                boxShadow: isPressed
                  ? 'var(--neu-shadow-inset-press)'
                  : 'var(--neu-shadow-raised)',
                border: isActive
                  ? `2px solid ${ACCENT_BLUE}`
                  : '1px solid var(--neu-border)',
                transform:
                  isHovered && !isPressed
                    ? 'translateY(-2px)'
                    : 'translateY(0)',
                transition: `box-shadow ${NEU_TRANSITION}, transform ${NEU_TRANSITION}, background ${NEU_TRANSITION}, border ${NEU_TRANSITION}`,
              }}
              animate={{
                y: [0, -4, 0, -2, 0],
                scale: [1, 1.02, 1, 1.01, 1],
                boxShadow: isHovered
                  ? [
                      'var(--neu-shadow-raised)',
                      '0 8px 20px rgba(0, 155, 242, 0.3)',
                      'var(--neu-shadow-raised)',
                    ]
                  : [
                      'var(--neu-shadow-raised)',
                      '0 4px 12px rgba(0, 155, 242, 0.15)',
                      'var(--neu-shadow-raised)',
                    ],
              }}
              transition={{
                y: {
                  duration: 3 + index * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: {
                  duration: 2.5 + index * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                boxShadow: {
                  duration: 2 + index * 0.25,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              {/* Ripple effect on click */}
              {isPressed && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(0, 155, 242, 0.3)' }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <motion.div
                animate={{
                  rotate: isHovered ? [0, -10, 10, -10, 0] : [0, -3, 3, -2, 0],
                  scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
                }}
                transition={{
                  rotate: {
                    duration: isHovered ? 0.5 : 4 + index * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  scale: {
                    duration: isHovered ? 0.5 : 3 + index * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              >
                <action.icon
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  style={{ color: isActive ? ACCENT_BLUE : '#ffffff' }}
                />
              </motion.div>
            </motion.div>
            <motion.span
              className="text-center text-sm font-medium sm:text-base"
              style={{ color: 'var(--neu-text-primary)' }}
              animate={{
                y: isHovered ? [-2, 0, -2] : 0,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              {action.label}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
