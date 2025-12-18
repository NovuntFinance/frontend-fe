/**
 * Standardized Animation System
 * Consistent animation timings and easing across the platform
 */

import { designTokens } from './tokens';
import { prefersReducedMotion } from '@/lib/accessibility';
import type { HTMLMotionProps } from 'framer-motion';

/**
 * Animation configuration based on design tokens
 */
export const animations = {
  duration: {
    fast: designTokens.animation.duration.fast,
    normal: designTokens.animation.duration.normal,
    slow: designTokens.animation.duration.slow,
    slower: designTokens.animation.duration.slower,
  },
  easing: {
    ease: designTokens.animation.easing.ease,
    easeIn: designTokens.animation.easing.easeIn,
    easeOut: designTokens.animation.easing.easeOut,
    easeInOut: designTokens.animation.easing.easeInOut,
  },
} as const;

/**
 * Get animation config respecting user preferences
 */
export function getAnimationConfig(
  duration: keyof typeof animations.duration = 'normal',
  easing: keyof typeof animations.easing = 'easeOut'
) {
  const prefersReduced = prefersReducedMotion();

  if (prefersReduced) {
    return {
      duration: 0,
      ease: 'linear',
    };
  }

  return {
    duration: parseFloat(animations.duration[duration]) / 1000, // Convert ms to seconds
    ease: animations.easing[easing],
  };
}

/**
 * Standard fade in animation
 */
export function fadeIn(delay = 0) {
  const config = getAnimationConfig();
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ...config, delay },
  };
}

/**
 * Standard slide up animation
 */
export function slideUp(delay = 0): Partial<HTMLMotionProps<'div'>> {
  const config = getAnimationConfig();
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...config, delay } as any,
  };
}

/**
 * Standard slide down animation
 */
export function slideDown(delay = 0) {
  const config = getAnimationConfig();
  return {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...config, delay },
  };
}

/**
 * Standard scale animation
 */
export function scale(delay = 0, from = 0.95) {
  const config = getAnimationConfig();
  return {
    initial: { opacity: 0, scale: from },
    animate: { opacity: 1, scale: 1 },
    transition: { ...config, delay },
  };
}

/**
 * Stagger children animation
 */
export function staggerChildren(delay = 0.1) {
  const config = getAnimationConfig();
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0,
      },
    },
  };
}

/**
 * Page transition animation
 */
export function pageTransition() {
  const config = getAnimationConfig('normal', 'easeInOut');
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: config,
  };
}

/**
 * Modal/Dialog animation
 */
export function modalAnimation() {
  const config = getAnimationConfig('normal', 'easeOut');
  return {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: config,
  };
}

/**
 * Toast notification animation
 */
export function toastAnimation() {
  const config = getAnimationConfig('fast', 'easeOut');
  return {
    initial: { opacity: 0, y: -20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: config,
  };
}

/**
 * List item animation
 */
export function listItemAnimation(index: number) {
  const config = getAnimationConfig();
  return {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { ...config, delay: index * 0.05 },
  };
}

/**
 * Hover animation for interactive elements
 */
export function hoverAnimation(): Partial<HTMLMotionProps<'div'>> {
  if (prefersReducedMotion()) {
    return {};
  }
  return {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: getAnimationConfig('fast') as any,
  };
}

/**
 * Pulse animation for loading states
 */
export function pulseAnimation() {
  if (prefersReducedMotion()) {
    return { opacity: 0.7 };
  }
  return {
    animate: {
      opacity: [0.7, 1, 0.7],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };
}

