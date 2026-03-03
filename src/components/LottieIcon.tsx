'use client';

import Lottie from 'lottie-react';
import { CSSProperties } from 'react';

interface LottieIconProps {
  animationData: any; // The JSON animation data
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: CSSProperties;
  speed?: number; // Animation speed (1 = normal, 2 = 2x speed, etc.)
  onComplete?: () => void;
}

/**
 * Reusable Lottie animation component
 *
 * @example
 * ```tsx
 * import successAnimation from '@/assets/lottie/success.json';
 *
 * <LottieIcon
 *   animationData={successAnimation}
 *   width={100}
 *   height={100}
 *   loop={false}
 * />
 * ```
 */
export default function LottieIcon({
  animationData,
  width = 100,
  height = 100,
  loop = true,
  autoplay = true,
  className = '',
  style,
  speed = 1,
  onComplete,
}: LottieIconProps) {
  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
        {...(speed !== 1 ? { speed: speed as any } : {})}
      />
    </div>
  );
}
