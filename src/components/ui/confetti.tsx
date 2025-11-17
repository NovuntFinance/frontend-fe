/**
 * Confetti Animation Component
 * Ultra-modern success celebration animation
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    // Create confetti particles
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    const particleCount = 50;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      const startX = Math.random() * 100;
      const startY = -10;
      const rotation = Math.random() * 360;
      const duration = Math.random() * 2 + 2;

      particle.style.position = 'fixed';
      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      particle.style.opacity = '0';

      document.body.appendChild(particle);
      particles.push(particle);

      // Animate particle
      const animation = particle.animate(
        [
          {
            transform: `translateY(0) rotate(0deg)`,
            opacity: 1,
          },
          {
            transform: `translateY(${window.innerHeight + 100}px) rotate(${rotation + 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
        }
      );

      animation.onfinish = () => {
        particle.remove();
        if (particles.every((p) => !document.body.contains(p))) {
          onComplete?.();
        }
      };
    }

    return () => {
      particles.forEach((particle) => {
        if (document.body.contains(particle)) {
          particle.remove();
        }
      });
    };
  }, [trigger, onComplete]);

  return null;
}

/**
 * Confetti Burst Component (Simpler version using Framer Motion)
 */
export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const particles = Array.from({ length: 30 });

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((_, i) => {
        const angle = (360 / particles.length) * i;
        const distance = 200 + Math.random() * 100;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;
        const color = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'][
          Math.floor(Math.random() * 5)
        ];
        const size = Math.random() * 8 + 4;
        const delay = Math.random() * 0.5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              backgroundColor: color,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x,
              y,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1.5,
              delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

