'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Upload, Send, TrendingUp, ArrowRight } from 'lucide-react';
import { DepositModal } from '@/components/wallet/modals/DepositModal';
import { WithdrawModal } from '@/components/wallet/modals/WithdrawModal';
import { TransferModal } from '@/components/wallet/modals/TransferModal';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: 'deposit' | 'withdraw' | 'transfer' | 'stake';
  variant: 'primary' | 'secondary' | 'accent' | 'success';
}

const actions: QuickAction[] = [
  {
    title: 'Deposit',
    description: 'Add USDT funds',
    icon: Download,
    action: 'deposit',
    variant: 'primary',
  },
  {
    title: 'Withdraw',
    description: 'Cash out earnings',
    icon: Upload,
    action: 'withdraw',
    variant: 'secondary',
  },
  {
    title: 'Transfer',
    description: 'Send to users',
    icon: Send,
    action: 'transfer',
    variant: 'accent',
  },
  {
    title: 'Create Stake',
    description: 'Earn weekly ROS',
    icon: TrendingUp,
    action: 'stake',
    variant: 'primary',
  },
];

interface QuickActionButtonProps {
  action: QuickAction;
  index: number;
  onClick: () => void;
}

function QuickActionButton({ action, index, onClick }: QuickActionButtonProps) {
  const Icon = action.icon;

  const variants = {
    primary: 'from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white dark:text-primary-foreground',
    secondary: 'from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-white dark:text-secondary-foreground',
    accent: 'from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-white',
    success: 'from-success to-success/80 hover:from-success/90 hover:to-success text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          relative overflow-hidden w-full rounded-2xl p-6 
          bg-gradient-to-br ${variants[action.variant]}
          border-0
          shadow-lg hover:shadow-xl
          transition-all duration-300
          group
        `}
      >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-3">
            {/* Icon */}
            <div className="p-3 rounded-xl bg-white/30 group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-6 w-6" />
            </div>

            {/* Text */}
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {action.title}
              </h3>
              <p className="text-sm opacity-90">
                {action.description}
              </p>
            </div>

            {/* Arrow Icon */}
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          {/* Shine Effect */}
          <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          style={{ width: '50%' }}
        />
      </motion.button>
    </motion.div>
  );
}

/**
 * QuickActions Component
 * Modern gradient buttons for primary wallet actions
 */
export function QuickActions() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState<string | null>(null);

  const handleAction = (actionType: string) => {
    if (actionType === 'stake') {
      router.push('/dashboard/stakes/new');
    } else {
      setModalOpen(actionType);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <QuickActionButton 
            key={action.title} 
            action={action} 
            index={index}
            onClick={() => handleAction(action.action)}
          />
        ))}
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={modalOpen === 'deposit'}
        onClose={() => setModalOpen(null)}
      />
      <WithdrawModal
        isOpen={modalOpen === 'withdraw'}
        onClose={() => setModalOpen(null)}
      />
      <TransferModal
        isOpen={modalOpen === 'transfer'}
        onClose={() => setModalOpen(null)}
      />
    </>
  );
}
