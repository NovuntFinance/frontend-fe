/**
 * Progress Stepper Component
 * 4-step progress indicator with visual progress bar
 * Follows Novunt design system
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ProgressStepperProps, Step } from '@/types/registrationBonus';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * Progress Stepper Component
 * Shows 4 steps with completion status and progress bar
 */
export function ProgressStepper({
  currentStep,
  progressPercentage,
  steps,
}: ProgressStepperProps) {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-semibold text-primary">{progressPercentage}%</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = step.completed;
          const isCurrent = stepNumber === currentStep && !isCompleted;
          const isPending = stepNumber > currentStep;

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300',
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30 dark:bg-green-500/5'
                  : isCurrent
                  ? 'bg-primary/10 border-primary/30 dark:bg-primary/5 ring-2 ring-primary/20'
                  : 'bg-muted/50 border-border/50'
              )}
            >
              {/* Step Icon */}
              <div
                className={cn(
                  'flex-shrink-0 p-2 rounded-lg transition-all duration-300',
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

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
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
                    'text-sm font-semibold mb-1',
                    isCompleted || isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {step.description}
                </p>
              </div>

              {/* Connector Line (not for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-1/2 -right-2 w-4 h-0.5 -translate-y-1/2 transition-colors duration-300',
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

