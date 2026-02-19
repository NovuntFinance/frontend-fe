/**
 * Progress Stepper Component
 * 5-step progress indicator with visual progress bar
 * Adapts grid to the number of steps provided.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ProgressStepperProps } from '@/types/registrationBonus';
import { cn } from '@/lib/utils';

export function ProgressStepper({
  currentStep,
  progressPercentage,
  steps,
}: ProgressStepperProps) {
  const gridCols = steps.length <= 4 ? 'md:grid-cols-4' : 'md:grid-cols-5';

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="text-primary font-semibold">
            {progressPercentage}%
          </span>
        </div>
        <div className="bg-muted relative h-3 overflow-hidden rounded-full">
          <motion.div
            className="from-primary via-primary/90 to-secondary h-full bg-gradient-to-r"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className={cn('grid grid-cols-1 gap-4', gridCols)}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = step.completed;
          const isCurrent = stepNumber === currentStep && !isCompleted;

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex items-start gap-3 rounded-xl border p-4 transition-all duration-300',
                isCompleted
                  ? 'border-green-500/30 bg-green-500/10 dark:bg-green-500/5'
                  : isCurrent
                    ? 'border-primary/30 bg-primary/10 ring-primary/20 dark:bg-primary/5 ring-2'
                    : 'border-border/50 bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 rounded-lg p-2 transition-all duration-300',
                  isCompleted
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : isCurrent
                      ? 'bg-primary/20 text-primary animate-pulse'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isCompleted || isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    Step {step.number}
                  </span>
                </div>
                <h3
                  className={cn(
                    'mb-1 text-sm font-semibold',
                    isCompleted || isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-1/2 -right-2 hidden h-0.5 w-4 -translate-y-1/2 transition-colors duration-300 md:block',
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-primary'
                        : 'bg-muted'
                  )}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
