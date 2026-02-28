'use client';

import React, { useState } from 'react';
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

/* Featured/Quick Action button colors: default = light blue bg + dark icon; hover = dark bg + light blue icon; labels white */
const ACCENT_BLUE = '#009BF2';
const DARK_NAVY = '#0D162C';
const LABEL_WHITE = 'rgba(255, 255, 255, 0.95)';

/**
 * QuickActions – Neumorphic only: raised by default, inset on press.
 * Default = light blue circle + dark icon; hover = dark circle + light blue icon; labels white.
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
    { id: 'stake', label: 'Stake', icon: TrendingUp },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
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
          <button
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
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
              style={{
                background: isActive ? DARK_NAVY : ACCENT_BLUE,
                boxShadow: isPressed
                  ? 'var(--neu-shadow-inset-press)'
                  : 'var(--neu-shadow-raised)',
                border: '1px solid var(--neu-border)',
                transform:
                  isHovered && !isPressed
                    ? 'translateY(-2px)'
                    : 'translateY(0)',
                transition: `box-shadow ${NEU_TRANSITION}, transform ${NEU_TRANSITION}, background ${NEU_TRANSITION}`,
              }}
            >
              <action.icon
                className="h-6 w-6 sm:h-7 sm:w-7"
                style={{
                  color: isActive ? ACCENT_BLUE : DARK_NAVY,
                }}
              />
            </div>
            <span
              className="text-center text-xs font-medium sm:text-sm"
              style={{ color: LABEL_WHITE }}
            >
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
