/**
 * Dynamic Component Imports
 * Lazy-loaded components for better performance
 */

import dynamic from 'next/dynamic';
import { ShimmerCard } from '@/components/ui/shimmer';

/**
 * Loading fallback for modals
 */
const ModalSkeleton = () => (
  <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
    <ShimmerCard className="h-64 w-full max-w-lg" />
  </div>
);

/**
 * Modal Components (Heavy - lazy load)
 */
export const CreateStakeModal = dynamic(
  () =>
    import('@/components/stake/CreateStakeModal').then((mod) => ({
      default: mod.CreateStakeModal,
    })),
  {
    loading: () => <ModalSkeleton />,
    ssr: false,
  }
);

export const WithdrawalModal = dynamic(
  () =>
    import('@/components/wallet/WithdrawalModal').then((mod) => ({
      default: mod.WithdrawalModal,
    })),
  {
    loading: () => <ModalSkeleton />,
    ssr: false,
  }
);

export const TransferModal = dynamic(
  () =>
    import('@/components/wallet/modals/TransferModal').then((mod) => ({
      default: mod.TransferModal,
    })),
  {
    loading: () => <ModalSkeleton />,
    ssr: false,
  }
);

/**
 * Heavy Dashboard Components (Lazy load for better initial page load)
 */
export const LiveTradingSignals = dynamic(
  () =>
    import('@/components/dashboard/LiveTradingSignals').then((mod) => ({
      default: mod.LiveTradingSignals,
    })),
  {
    loading: () => <ShimmerCard className="h-64" />,
    ssr: false,
  }
);
