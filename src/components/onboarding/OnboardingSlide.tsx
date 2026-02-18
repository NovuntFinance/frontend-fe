'use client';

import { motion } from 'framer-motion';
import styles from '@/styles/onboarding.module.css';

export interface SlideData {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

interface OnboardingSlideProps {
  slide: SlideData;
  direction: number;
  isAnimating?: boolean;
}

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 280 : -280,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -280 : 280,
    opacity: 0,
    scale: 0.92,
  }),
};

export default function OnboardingSlide({
  slide,
  direction,
}: OnboardingSlideProps) {
  return (
    <motion.div
      className={styles.card}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.35 },
      }}
    >
      {/* Raised Icon Container */}
      <div className={styles.iconContainer}>
        {/* Inset Icon Socket */}
        <div className={styles.iconSocket}>{slide.icon}</div>
      </div>

      {/* Text */}
      <div className={styles.slideText}>
        <h1 className={styles.title}>{slide.title}</h1>
        <p className={styles.subtitle}>{slide.subtitle}</p>
      </div>
    </motion.div>
  );
}
