/**
 * Floating Assistant Button
 * Customer service icon positioned on the right side of the screen
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { NovuntAssistant } from './NovuntAssistant';
import { cn } from '@/lib/utils';

export function FloatingAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button - Mobile First */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed right-3 bottom-20 z-40 flex h-12 w-12 items-center justify-center',
          'rounded-full border-2 border-white/30 bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-pink-500/90',
          'shadow-[0_4px_16px_rgba(99,102,241,0.4),inset_0_1.5px_0_rgba(255,255,255,0.3),inset_0_-1.5px_0_rgba(255,255,255,0.1)]',
          'backdrop-blur-xl transition-all duration-300',
          'sm:right-4 sm:bottom-24 sm:h-14 sm:w-14 sm:shadow-[0_8px_32px_rgba(99,102,241,0.4),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(255,255,255,0.1)]',
          'md:right-6 md:bottom-28 md:h-16 md:w-16 md:hover:shadow-[0_12px_40px_rgba(99,102,241,0.5),inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(255,255,255,0.15)]',
          'dark:border-white/20 dark:from-indigo-600/90 dark:via-purple-600/90 dark:to-pink-600/90',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none'
        )}
        aria-label="Open Novunt Assistant"
      >
        {/* Pulsing glow effect - Mobile optimized */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-25 blur-lg sm:opacity-30 sm:blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Icon - Mobile First Sizing */}
        <HelpCircle className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6 md:h-7 md:w-7" />

        {/* Notification badge (optional - can be removed if not needed) */}
        {/* <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900" /> */}
      </motion.button>

      {/* Assistant Modal */}
      <NovuntAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
