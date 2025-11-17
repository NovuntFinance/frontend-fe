'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  startAmount?: number;
  multiplier?: number; // target = start * multiplier
  duration?: number; // ms
};

type ConfettiPiece = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
};

export default function ProgressDeposit({ startAmount: initialAmount = 1000, multiplier = 2, duration = 6000 }: Props) {
  // Generate random amount between 1,000 and 50,000 (in increments of 500)
  const getRandomAmount = () => {
    const min = 1000;
    const max = 50000;
    const step = 500;
    const steps = Math.floor((max - min) / step);
    return min + Math.floor(Math.random() * (steps + 1)) * step;
  };

  const [startAmount, setStartAmount] = useState(initialAmount);
  const [current, setCurrent] = useState(startAmount);
  const [progress, setProgress] = useState(0); // 0..1
  const reduceMotion = useReducedMotion();
  // coinTargets holds positions (relative to container) where coins should fly to
  const [coinTargets, setCoinTargets] = useState<{ x: number; y: number }[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const walletRef = useRef<HTMLDivElement | null>(null);

  const start = async (baseAmount?: number) => {
    const amount = baseAmount ?? startAmount;
    const targetAmount = Math.round(amount * multiplier);
    
    // Reset states
    setProgress(0);
    setCurrent(amount);

    const startTime = performance.now();

    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        setProgress(t);
        
        // Calculate current value based on progress
        const value = Math.round(amount + (targetAmount - amount) * t);
        setCurrent(value);
        
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          // Reached 100% - trigger confetti and coin animation (with longer pause)
          setTimeout(() => void onComplete(), 1000);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  };

  const onComplete = async () => {
    // Show confetti rain - always show, not just when motion is enabled
    const colors = ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#f87171', '#fb923c', '#a855f7'];
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
    }));
    setConfetti(pieces);
    
    // Clear confetti after animation (longer duration)
    setTimeout(() => setConfetti([]), 5000);

    // Animate coins to wallet
    const container = containerRef.current;
    const wallet = walletRef.current;
    const num = 8;
    if (container && wallet && !reduceMotion) {
      const cRect = container.getBoundingClientRect();
      const wRect = wallet.getBoundingClientRect();
      const targetCenterX = wRect.left + wRect.width / 2 - cRect.left;
      const targetCenterY = wRect.top + wRect.height / 2 - cRect.top;

      // Create coin animations flying to wallet
      const targets = Array.from({ length: num }).map((_, i) => ({
        x: targetCenterX + (i - num / 2) * 6,
        y: targetCenterY + (i % 2 === 0 ? -4 : 4) + i * 1,
      }));
      setCoinTargets(targets);
      
      // Wait for animation to complete (slower)
      await new Promise((r) => setTimeout(r, 2500));
      setCoinTargets([]);
    } else {
      await new Promise((r) => setTimeout(r, 800));
    }

    // Reset and restart cycle with new random amount (longer pause)
    setTimeout(() => {
      const newAmount = getRandomAmount();
      setStartAmount(newAmount);
      setProgress(0);
      // Use a longer delay to ensure state is updated
      setTimeout(() => {
        setCurrent(newAmount);
        void start(newAmount);
      }, 500);
    }, 2000);
  };

  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  // auto-start animation on mount with random amount
  useEffect(() => {
    const randomAmount = getRandomAmount();
    setStartAmount(randomAmount);
    setCurrent(randomAmount);
    setTimeout(() => void start(randomAmount), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="relative rounded-2xl bg-white/6 p-6 shadow-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="text-xs sm:text-sm text-indigo-200">Projected Balance</div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">${current.toLocaleString()}</div>
        </div>
        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative flex-shrink-0">
          <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle 
              cx="60" 
              cy="60" 
              r={radius} 
              fill="transparent" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth={8} 
            />
            {/* Progress circle - fills clockwise from top */}
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              strokeLinecap="round"
              strokeWidth={8}
              stroke="url(#progressGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-base sm:text-lg font-semibold text-white">{Math.round(progress * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Wallet icon where money goes */}
      <div className="mt-4 sm:mt-6 flex items-center justify-center">
        <motion.div
          ref={walletRef}
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
          animate={coinTargets.length > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3, repeat: coinTargets.length > 0 ? 3 : 0 }}
        >
          <svg width="24" height="24" className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </motion.div>
      </div>

      {/* Coin animations flying to wallet */}
      {coinTargets.length > 0 && (
        <div className="absolute left-0 top-0 z-50 pointer-events-none w-full h-full">
          {coinTargets.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, x: 60, y: 60 }}
              animate={{ opacity: 1, scale: 1, x: t.x, y: t.y }}
              transition={{ duration: 1.5, delay: i * 0.12, ease: 'easeInOut' }}
              className="absolute"
              style={{ transformOrigin: 'center' }}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-sm lg:text-base">$</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confetti rain when reaching 100% */}
      {confetti.length > 0 && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute rounded-sm shadow-lg"
              style={{
                backgroundColor: piece.color,
                left: `${piece.x}%`,
                width: '6px',
                height: '6px',
                top: '-20px',
              }}
              initial={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={{ 
                y: 400, 
                rotate: piece.rotation + 720,
                opacity: [1, 1, 1, 0.5, 0],
                scale: [1, 1.2, 1, 0.8],
              }}
              transition={{
                duration: 4.2,
                delay: piece.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
