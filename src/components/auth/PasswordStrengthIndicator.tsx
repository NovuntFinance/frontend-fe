'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldCheck } from 'lucide-react';
import styles from '@/styles/auth.module.css';

interface PasswordStrengthResult {
  score: number;
  color: string;
  text: string;
  suggestions: string[];
}

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrengthResult;
}

/**
 * PasswordStrengthIndicator — Neumorphic variant
 * Inset trough with segmented fill bar
 */
export function PasswordStrengthIndicator({
  strength,
}: PasswordStrengthIndicatorProps) {
  const { score, color, text, suggestions } = strength;
  const percentage = (score / 4) * 100;

  return (
    <div className="mt-2 space-y-2">
      {/* Neumorphic inset bar */}
      <div className="flex items-center gap-2">
        <div className={styles.neuStrengthTrough}>
          <motion.div
            className={styles.neuStrengthFill}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ backgroundColor: color }}
          />
        </div>
        <span
          className="text-xs font-semibold tracking-wide whitespace-nowrap"
          style={{ color }}
        >
          {text}
        </span>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="space-y-1 pl-1">
          {suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex items-start gap-2 text-xs ${styles.neuTextMuted}`}
            >
              <X
                className="mt-0.5 h-3 w-3 flex-shrink-0"
                style={{ color: '#f87171' }}
              />
              <span>{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Strong password */}
      {score === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center gap-2 text-xs font-semibold"
          style={{ color: '#34d399' }}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Strong password</span>
        </motion.div>
      )}
    </div>
  );
}
