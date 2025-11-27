/**
 * Dynamic Component Imports
 * Lazy-loaded components for better performance
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Loading fallback for modals
 */
const ModalSkeleton = () => (
  <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
    <Card className="w-full max-w-lg">
      <CardContent className="p-6">
        <Skeleton className="mb-4 h-8 w-3/4" />
        <Skeleton className="mb-4 h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
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
    loading: () => (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);
