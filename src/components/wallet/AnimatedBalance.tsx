/**
 * Animated Balance Component
 * Counter animation for displaying wallet balance
 */

'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils/wallet';
import { prefersReducedMotion } from '@/lib/accessibility';

interface AnimatedBalanceProps {
    value: number;
    isLoading: boolean;
}

/**
 * Animated balance counter
 * Counts up from 0 to target value
 * Respects prefers-reduced-motion
 */
export const AnimatedBalance = memo(function AnimatedBalance({
    value,
    isLoading
}: AnimatedBalanceProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const reducedMotion = prefersReducedMotion();

    useEffect(() => {
        if (isLoading) {
            setDisplayValue(0);
            return;
        }

        // If reduced motion is preferred, show value immediately
        if (reducedMotion) {
            setDisplayValue(value);
            return;
        }

        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const increment = value / steps;
        const stepDuration = duration / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(current);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [value, isLoading, reducedMotion]);

    return (
        <motion.span
            key={value}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
        >
            ${formatCurrency(displayValue, { showCurrency: false })}
        </motion.span>
    );
});
