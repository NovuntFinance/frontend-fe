/**
 * LOTTIE ANIMATIONS USAGE GUIDE
 * ==============================
 *
 * How to use Lottie animations in this project
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. GET FREE LOTTIE ANIMATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Download FREE Lottie animations from:
 *
 * 🎨 LottieFiles: https://lottiefiles.com/
 * 🎨 IconScout: https://iconscout.com/lottie-animations
 * 🎨 Lordicon: https://lordicon.com/
 *
 * Save JSON files to: src/assets/lottie/
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. BASIC USAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Step 1: Create src/assets/lottie/ folder
 * Step 2: Place your .json animation files there
 * Step 3: Import and use them
 */

// Example: Using in a component
import LottieIcon from '@/components/LottieIcon';
import successAnimation from '@/assets/lottie/success.json';

function SuccessModal() {
  return (
    <div>
      <LottieIcon
        animationData={successAnimation}
        width={200}
        height={200}
        loop={false}
      />
      <p>Success!</p>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ADVANCED USAGE EXAMPLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Loading animation (loops)
import loadingAnimation from '@/assets/lottie/loading.json';

<LottieIcon
  animationData={loadingAnimation}
  width={80}
  height={80}
  loop={true}
  autoplay={true}
/>;

// Success checkmark (plays once)
import checkAnimation from '@/assets/lottie/check.json';

<LottieIcon
  animationData={checkAnimation}
  width={100}
  height={100}
  loop={false}
  speed={1.5}
  onComplete={() => console.log('Animation done!')}
/>;

// Error animation
import errorAnimation from '@/assets/lottie/error.json';

<LottieIcon
  animationData={errorAnimation}
  width={120}
  height={120}
  loop={false}
/>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. REAL-WORLD USE CASES IN YOUR PROJECT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// USE CASE 1: Deposit Success Modal
function DepositSuccessExample() {
  return (
    <div className="text-center">
      <LottieIcon
        animationData={successAnimation}
        width={150}
        height={150}
        loop={false}
      />
      <h3 className="mt-4 text-xl font-bold">Deposit Confirmed!</h3>
      <p className="text-white-60">20 USDT credited to your wallet</p>
    </div>
  );
}

// USE CASE 2: Empty State Illustrations
import emptyBoxAnimation from '@/assets/lottie/empty-box.json';

function EmptyTransactionsExample() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LottieIcon animationData={emptyBoxAnimation} width={200} height={200} />
      <p className="text-white-60 mt-4">No transactions yet</p>
    </div>
  );
}

// USE CASE 3: Loading States
import loaderAnimation from '@/assets/lottie/loader.json';

function LoadingStateExample() {
  return (
    <div className="flex justify-center">
      <LottieIcon
        animationData={loaderAnimation}
        width={60}
        height={60}
        loop={true}
      />
    </div>
  );
}

// USE CASE 4: Button with Animation
function AnimatedButtonExample() {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <button onClick={() => setIsSuccess(true)}>
      {isSuccess ? (
        <LottieIcon
          animationData={checkAnimation}
          width={24}
          height={24}
          loop={false}
        />
      ) : (
        'Submit'
      )}
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. USING LOTTIE DIRECTLY (Without LottieIcon component)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Lottie from 'lottie-react';
import coinAnimation from '@/assets/lottie/coin.json';

function DirectUsageExample() {
  return (
    <Lottie
      animationData={coinAnimation}
      loop={true}
      style={{ width: 100, height: 100 }}
    />
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. CONTROLLING ANIMATIONS PROGRAMMATICALLY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useRef } from 'react';

function ControlledAnimationExample() {
  const lottieRef = useRef();

  return (
    <div>
      <Lottie
        lottieRef={lottieRef}
        animationData={successAnimation}
        loop={false}
        autoplay={false}
      />
      <button onClick={() => lottieRef.current?.play()}>Play Animation</button>
      <button onClick={() => lottieRef.current?.pause()}>Pause</button>
      <button onClick={() => lottieRef.current?.stop()}>Stop</button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. RECOMMENDED ANIMATIONS FOR YOUR PROJECT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Suggested animations to download:
 *
 * 💰 Financial/Crypto:
 * - Coin flip/spin
 * - Money transfer
 * - Wallet animation
 * - Chart/graph growing
 * - Piggy bank
 *
 * ✅ Status Indicators:
 * - Success checkmark
 * - Error/warning
 * - Loading spinner
 * - Processing/pending
 *
 * 📊 Dashboard:
 * - Empty state illustrations
 * - No data found
 * - Maintenance mode
 * - Coming soon
 *
 * 🎉 Celebrations:
 * - Confetti
 * - Trophy/achievement
 * - Level up
 * - Milestone reached
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. PERFORMANCE TIPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 1. Keep JSON files small (<100KB for best performance)
 * 2. Use loop={false} for one-time animations
 * 3. Lazy load animations that aren't immediately visible:
 */

import dynamic from 'next/dynamic';

const LottieIcon = dynamic(() => import('@/components/LottieIcon'), {
  ssr: false,
  loading: () => (
    <div className="h-20 w-20 animate-pulse rounded bg-gray-700" />
  ),
});

/**
 * 4. Consider using react-intersection-observer for scroll-triggered animations
 */

import { useInView } from 'react-intersection-observer';

function ScrollAnimationExample() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref}>
      {inView && (
        <LottieIcon animationData={successAnimation} width={100} height={100} />
      )}
    </div>
  );
}

export {};
