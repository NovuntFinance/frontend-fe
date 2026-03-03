'use client';

/**
 * QUICK START EXAMPLE
 * Replace the CheckCircle2 icon in DepositModal success screen with this Lottie animation
 */

import LottieIcon from '@/components/LottieIcon';
import successAnimation from '@/assets/lottie/success.json';

export default function DepositSuccessAnimation() {
  return (
    <LottieIcon
      animationData={successAnimation}
      width={120}
      height={120}
      loop={false}
      speed={1.2}
      className="mx-auto"
    />
  );
}

/**
 * HOW TO USE IN DepositModal:
 *
 * Find this code in src/components/wallet/modals/DepositModal.tsx (around line 850):
 *
 * REPLACE THIS:
 * ───────────────────────────────────────────────────────────
 * <motion.div
 *   initial={{ scale: 0 }}
 *   animate={{ scale: 1 }}
 *   transition={{ type: 'spring', duration: 0.5 }}
 *   className="mx-auto inline-flex rounded-full p-6"
 *   style={raisedStyle}
 * >
 *   <CheckCircle2
 *     className="size-12"
 *     style={{ color: NEU_TOKENS.accent }}
 *   />
 * </motion.div>
 * ───────────────────────────────────────────────────────────
 *
 * WITH THIS:
 * ───────────────────────────────────────────────────────────
 * <motion.div
 *   initial={{ scale: 0 }}
 *   animate={{ scale: 1 }}
 *   transition={{ type: 'spring', duration: 0.5 }}
 *   className="mx-auto inline-flex rounded-full p-6"
 *   style={raisedStyle}
 * >
 *   <DepositSuccessAnimation />
 * </motion.div>
 * ───────────────────────────────────────────────────────────
 *
 * Don't forget to add the import at the top:
 * import DepositSuccessAnimation from '@/components/examples/DepositSuccessAnimation';
 */
