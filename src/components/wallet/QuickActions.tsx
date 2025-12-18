'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Send, TrendingUp } from 'lucide-react';
import { useWalletBalance } from '@/lib/queries';
import { DepositModal } from './modals/DepositModal';
import { WithdrawModal } from './modals/WithdrawModal';
import { TransferModal } from './modals/TransferModal';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

const QuickActionButton: React.FC<QuickActionProps> = ({
  icon,
  label,
  description,
  onClick,
  disabled = false,
  variant = 'default',
}) => {
  const variants = {
    default:
      'from-card to-card/50 hover:from-card/80 hover:to-card text-foreground',
    primary:
      'from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground',
    secondary:
      'from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-secondary-foreground',
    success:
      'from-success to-success/80 hover:from-success/90 hover:to-success text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 ${variants[variant]} border-border/50 group border shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        {/* Icon */}
        <div
          className={`rounded-xl p-3 ${variant === 'default' ? 'bg-primary/10' : 'bg-white/20'} transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>

        {/* Text */}
        <div>
          <h3 className="mb-1 text-lg font-semibold">{label}</h3>
          <p
            className={`text-sm ${
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
        style={{ width: '50%' }}
      />
    </motion.button>
  );
};

/**
 * Quick Actions Component
 * Modern glass-morphism buttons for primary wallet actions
 */
export function QuickActions() {
  const { data: wallet } = useWalletBalance();
  const canWithdraw = (wallet?.earnings?.balance || 0) > 0;

  const [modalOpen, setModalOpen] = React.useState<string | null>(null);

  const actions = [
    {
      icon: <Download className="h-6 w-6" />,
      label: 'Deposit',
      description: 'Add USDT funds',
      onClick: () => setModalOpen('deposit'),
      variant: 'primary' as const,
    },
    {
      icon: <Upload className="h-6 w-6" />,
      label: 'Withdraw',
      description: 'Cash out earnings',
      onClick: () => setModalOpen('withdraw'),
      disabled: !canWithdraw,
      variant: 'secondary' as const,
    },
    {
      icon: <Send className="h-6 w-6" />,
      label: 'Send',
      description: 'Transfer to users',
      onClick: () => setModalOpen('transfer'),
      disabled: !canWithdraw,
      variant: 'default' as const,
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: 'Stake',
      description: 'Earn weekly ROS',
      onClick: () => setModalOpen('stake'),
      variant: 'success' as const,
    },
  ];

  return (
    <>
      <motion.div
        {...slideUp(0.1)}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {actions.map((action, index) => (
          <motion.div key={action.label} {...slideUp(0.1 + index * 0.05)}>
            <QuickActionButton {...action} />
          </motion.div>
        ))}
      </motion.div>

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
