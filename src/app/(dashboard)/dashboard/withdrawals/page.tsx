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
    router.replace('/dashboard/wallets');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
          <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Loader2 className="h-12 w-12 text-primary" />
          </motion.div>
                  <div>
          <h2 className="text-xl font-semibold mb-2">Redirecting to Wallets...</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
            <ArrowUpRight className="h-4 w-4" />
            Withdrawal functionality is now in the Wallets page
                  </p>
                </div>
          </motion.div>
    </div>
  );
}
