'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

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
 * PasswordStrengthIndicator Component
 * Visual feedback for password strength
 */
export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const { score, color, text, suggestions } = strength;

  // Calculate percentage (score 0-4 to 0-100)
  const percentage = (score / 4) * 100;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-colors"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-medium whitespace-nowrap" style={{ color }}>
          {text}
        </span>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Strong password checkmark */}
      {score === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400"
        >
          <Check className="h-4 w-4" />
          <span>Strong password!</span>
        </motion.div>
      )}
    </div>
  );
}
