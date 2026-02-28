'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface NovuntSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const pixelSize = {
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128,
} as const;

const PRIMARY = '#009BF2';

/**
 * Latest Novunt loader: concentric blue arcs (incomplete circles) with center dot.
 * Single element spins 360° continuously.
 */
function NovuntLoaderSvg({ size, filterId }: { size: keyof typeof pixelSize; filterId: string }) {
  const px = pixelSize[size];
  const r = px / 2;
  const stroke = Math.max(2, px / 20);
  // Arc from bottom-left upward (large sweep) — 3 concentric arcs + center
  const arc = (radius: number) => {
    const R = radius;
    return `M ${r} ${r + R} A ${R} ${R} 0 0 1 ${r - R} ${r}`;
  };
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer arc */}
      <path
        d={arc(r * 0.88)}
        stroke={PRIMARY}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        opacity={0.92}
        filter={`url(#${filterId})`}
      />
      {/* Middle arc */}
      <path
        d={arc(r * 0.62)}
        stroke={PRIMARY}
        strokeWidth={stroke * 0.95}
        strokeLinecap="round"
        fill="none"
        opacity={0.97}
        filter={`url(#${filterId})`}
      />
      {/* Inner arc */}
      <path
        d={arc(r * 0.36)}
        stroke={PRIMARY}
        strokeWidth={stroke * 0.9}
        strokeLinecap="round"
        fill="none"
        opacity={1}
        filter={`url(#${filterId})`}
      />
      {/* Center dot */}
      <circle cx={r} cy={r} r={stroke} fill={PRIMARY} filter={`url(#${filterId})`} />
    </svg>
  );
}

export function NovuntSpinner({ size = 'md', className = '' }: NovuntSpinnerProps) {
  const filterId = React.useId().replace(/:/g, '');
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`flex items-center justify-center ${sizeMap[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <NovuntLoaderSvg size={size} filterId={filterId} />
      </motion.div>
    </div>
  );
}

// Full page loading component
export function NovuntPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <NovuntSpinner size="xl" />
      {message && (
        <motion.p
          className="mt-8 text-lg font-medium text-foreground"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
