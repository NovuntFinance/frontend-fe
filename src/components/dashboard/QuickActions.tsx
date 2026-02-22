'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

/* Theme-aware: use CSS variables (--app-surface, --app-accent, etc.) */

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

/**
 * QuickActions Component
 * Neumorphic circular buttons matching the balance card style
 */
export function QuickActions() {
  const router = useRouter();
  const { openModal } = useUIStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAction = (actionType: string) => {
    if (actionType === 'stake') {
      openModal('create-stake');
    } else if (actionType === 'deposit') {
      openModal('deposit');
    } else if (actionType === 'withdraw') {
      openModal('withdraw');
    } else if (actionType === 'transfer') {
      openModal('transfer');
    } else {
      // Handle other actions or navigation
      console.log('Action:', actionType);
    }
  };

  const actions: QuickAction[] = [
    {
      id: 'stake',
      label: 'Stake',
      icon: TrendingUp,
    },
    {
      id: 'deposit',
      label: 'Deposit',
      icon: ArrowDownLeft,
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: ArrowUpRight,
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: ArrowRightLeft,
    },
  ];

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleAction(action.id)}
          className="flex flex-1 flex-col items-center gap-2"
        >
          {/* Circular neumorphic button */}
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 sm:h-16 sm:w-16"
            style={{
              background: hoveredIndex === index ? 'var(--app-accent)' : 'var(--app-surface)',
              boxShadow: `
                8px 8px 16px var(--app-shadow-dark),
                -8px -8px 16px var(--app-shadow-light),
                0 0 0 1px var(--app-border)
              `,
            }}
            onMouseEnter={(e) => {
              setHoveredIndex(index);
              e.currentTarget.style.boxShadow = `
                10px 10px 20px var(--app-shadow-dark),
                -10px -10px 20px var(--app-shadow-light),
                0 0 0 1px var(--app-border-strong),
                0 0 20px rgba(0, 155, 242, 0.2)
              `;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              setHoveredIndex(null);
              e.currentTarget.style.boxShadow = `
                8px 8px 16px var(--app-shadow-dark),
                -8px -8px 16px var(--app-shadow-light),
                0 0 0 1px var(--app-border)
              `;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 4px 4px 8px var(--app-shadow-dark),
                inset -4px -4px 8px var(--app-shadow-light)
              `;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = `
                10px 10px 20px var(--app-shadow-dark),
                -10px -10px 20px var(--app-shadow-light),
                0 0 0 1px var(--app-border-strong),
                0 0 20px rgba(0, 155, 242, 0.2)
              `;
            }}
          >
            <motion.div
              animate={{
                y: [0, -2, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.3,
              }}
            >
              <action.icon
                className="h-6 w-6 transition-colors duration-200 sm:h-7 sm:w-7"
                style={{
                  color: hoveredIndex === index ? 'var(--primary-foreground)' : 'var(--app-accent)',
                  filter: 'none',
                }}
              />
            </motion.div>
          </div>
          {/* Label */}
          <span
            className="text-xs font-medium sm:text-sm"
            style={{ color: 'var(--app-accent)', filter: 'none' }}
          >
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
