'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { hoverAnimation } from '@/design-system/animations';
import {
  Download,
  Upload,
  Send,
  TrendingUp,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * QuickActions Component
 * Modern gradient buttons for primary wallet actions
 */
export function QuickActions() {
  const router = useRouter();
  const { openModal } = useUIStore();

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
      label: 'Create Stake',
      icon: TrendingUp,
      color: 'text-novunt-blue-600 dark:text-novunt-blue-400',
      bgColor: 'bg-novunt-blue-50 dark:bg-novunt-blue-900/20',
      borderColor: 'border-novunt-blue-200 dark:border-novunt-blue-800',
    },
    {
      id: 'deposit',
      label: 'Deposit',
      icon: ArrowDownLeft,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: ArrowUpRight,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: ArrowRightLeft,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          {...(hoverAnimation() as any)}
          onClick={() => handleAction(action.id)}
          className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200 ${action.bgColor} ${action.borderColor} hover:shadow-lg`}
        >
          <div
            className={`mb-3 rounded-full bg-white p-3 shadow-sm dark:bg-gray-800 ${action.color}`}
          >
            <action.icon className="h-6 w-6" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
