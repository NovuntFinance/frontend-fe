'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';

/**
 * Withdrawals Page - Redirects to Wallets
 *
 * This page has been deprecated. All withdrawal functionality
 * is now available on the Wallets page for better UX.
 */
export default function WithdrawalsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to wallets page
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Loader2 className="text-primary h-12 w-12" />
        </motion.div>
        <div>
          <h2 className="mb-2 text-xl font-semibold">
            Redirecting to Wallets...
          </h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <ArrowUpRight className="h-4 w-4" />
            Withdrawal functionality is now in the Wallets page
          </p>
        </div>
      </motion.div>
    </div>
  );
}
