'use client';

import React from 'react';
import Image from 'next/image';
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

export function NovuntSpinner({ size = 'md', className = '' }: NovuntSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: size === 'sm' ? '48px' : size === 'md' ? '80px' : size === 'lg' ? '112px' : '144px',
            height: size === 'sm' ? '48px' : size === 'md' ? '80px' : size === 'lg' ? '112px' : '144px',
          }}
        />

        {/* Middle rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-b-blue-500 border-l-purple-500"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: size === 'sm' ? '40px' : size === 'md' ? '64px' : size === 'lg' ? '96px' : '128px',
            height: size === 'sm' ? '40px' : size === 'md' ? '64px' : size === 'lg' ? '96px' : '128px',
            margin: size === 'sm' ? '4px' : size === 'md' ? '8px' : size === 'lg' ? '8px' : '8px',
          }}
        />

        {/* Novunt logo in the center */}
        <motion.div
          className={`flex items-center justify-center ${sizeMap[size]}`}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/icons/novunt_short.png"
            alt="Loading"
            width={size === 'sm' ? 32 : size === 'md' ? 64 : size === 'lg' ? 96 : 128}
            height={size === 'sm' ? 32 : size === 'md' ? 64 : size === 'lg' ? 96 : 128}
            className="invert dark:invert-0"
            priority
          />
        </motion.div>

        {/* Glowing pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: size === 'sm' ? '48px' : size === 'md' ? '80px' : size === 'lg' ? '112px' : '144px',
            height: size === 'sm' ? '48px' : size === 'md' ? '80px' : size === 'lg' ? '112px' : '144px',
          }}
        />
      </div>
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

