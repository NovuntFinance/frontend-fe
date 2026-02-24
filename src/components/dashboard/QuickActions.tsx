'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const NEU_BG = '#0D162C';
const NEU_ACCENT = '#009BF2';
const NEU_SHADOW_DARK = 'rgba(0, 0, 0, 0.45)';
const NEU_SHADOW_LIGHT = 'rgba(255, 255, 255, 0.04)';
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

/**
 * QuickActions – Neumorphic only: raised by default, inset on press.
 * No glow; dual shadows only. #0D162C surface, #009BF2 accent.
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
                background: isActive ? NEU_ACCENT : NEU_BG,
                boxShadow: isPressed
                  ? 'inset 6px 6px 12px rgba(0,0,0,0.45), inset -6px -6px 12px rgba(255,255,255,0.04)'
                  : '8px 8px 16px ' +
                    NEU_SHADOW_DARK +
                    ', -8px -8px 16px ' +
                    NEU_SHADOW_LIGHT,
                border: '1px solid rgba(0,155,242,0.08)',
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
                  color: isActive ? NEU_BG : NEU_ACCENT,
                }}
              />
            </div>
            <span
              className="text-center text-xs font-medium sm:text-sm"
              style={{ color: NEU_ACCENT }}
            >
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
