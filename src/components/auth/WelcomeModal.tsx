'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Star,
  TrendingUp,
  Gift,
  Shield,
  Heart,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  email: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  firstName,
  lastName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className="from-background via-background to-primary/5 max-h-[90vh] overflow-hidden border-none bg-gradient-to-br p-0 sm:max-w-2xl"
            showCloseButton={false}
          >
            {/* Custom Close Button - positioned above content */}
            <button
              onClick={onClose}
              className="focus:ring-primary/30 absolute top-4 right-4 z-50 flex size-10 touch-manipulation items-center justify-center rounded-xl border border-white/30 bg-white/80 text-gray-600 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white hover:text-gray-900 focus:ring-2 focus:outline-none active:scale-95 sm:size-9 dark:border-white/10 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:border-white/20 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label="Close"
            >
              <X className="size-5 sm:size-4" />
            </button>

            {/* Animated Background Effects */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.1, scale: 2 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="from-primary to-success absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-br blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.1, scale: 2 }}
                transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
                className="from-secondary to-primary absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-tr blur-3xl"
              />
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              {/* Header with Animation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="from-primary to-success mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl"
                >
                  <Star className="h-10 w-10 fill-white text-white" />
                </motion.div>

                <DialogHeader>
                  <DialogTitle className="from-primary via-success to-secondary mb-3 bg-gradient-to-r bg-clip-text text-4xl font-black text-transparent">
                    Welcome to Novunt, {firstName}! 🎉
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-lg">
                    Your journey to financial freedom starts now
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              {/* Main Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 space-y-6"
              >
                {/* Personalized Welcome */}
                <div className="from-primary/10 via-success/10 to-secondary/10 rounded-2xl border border-white/30 bg-gradient-to-r p-6 shadow-lg backdrop-blur-sm dark:border-white/10">
                  <p className="text-foreground text-base leading-relaxed">
                    Dear{' '}
                    <span className="text-primary font-bold">
                      {firstName} {lastName}
                    </span>
                    ,
                  </p>
                  <p className="text-foreground mt-4 text-base leading-relaxed">
                    We are{' '}
                    <span className="font-semibold">absolutely thrilled</span>{' '}
                    to welcome you to the Novunt family! Your decision to join
                    us today is more than just creating an account—it&apos;s a{' '}
                    <span className="text-success font-bold">
                      bold declaration
                    </span>{' '}
                    of your commitment to building lasting wealth and achieving
                    true financial independence.
                  </p>
                </div>

                {/* Vision & Promise */}
                <div className="space-y-4">
                  <div className="bg-success/5 hover:bg-success/10 flex items-start gap-4 rounded-xl border border-white/30 p-4 shadow-md backdrop-blur-sm transition-all duration-200 dark:border-white/10">
                    <div className="bg-success/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <Heart className="text-success h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2 font-bold">
                        Your Vision Inspires Us
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        We recognize the{' '}
                        <span className="text-foreground font-semibold">
                          courage and financial tenacity
                        </span>{' '}
                        it takes to pursue your dreams. By choosing Novunt,
                        you&apos;ve chosen a partner that believes in your
                        vision as much as you do.
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 hover:bg-primary/10 flex items-start gap-4 rounded-xl border border-white/30 p-4 shadow-md backdrop-blur-sm transition-all duration-200 dark:border-white/10">
                    <div className="bg-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <Shield className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2 font-bold">
                        Your Financial Freedom is Our Promise
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Rest assured, your financial freedom is not just a
                        goal—it&apos;s our{' '}
                        <span className="text-foreground font-semibold">
                          sacred commitment
                        </span>{' '}
                        to you. We&apos;ve built a platform where your stakes
                        grow, your earnings compound, and your dreams become
                        reality.
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary/5 hover:bg-secondary/10 flex items-start gap-4 rounded-xl border border-white/30 p-4 shadow-md backdrop-blur-sm transition-all duration-200 dark:border-white/10">
                    <div className="bg-secondary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <TrendingUp className="text-secondary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2 font-bold">
                        What&apos;s Ahead: The Next Few Years
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        In the coming months and years, you&apos;ll witness your
                        portfolio flourish. You&apos;ll earn consistent returns,
                        build passive income streams, and create generational
                        wealth. This is just the beginning of your{' '}
                        <span className="text-foreground font-semibold">
                          transformation story
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Bonus Highlight */}
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="from-success rounded-2xl bg-gradient-to-r to-emerald-600 p-6 text-white shadow-2xl"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">
                        Your Registration Bonus Awaits!
                      </h3>
                      <p className="text-sm text-white/90">
                        A special gift to kickstart your journey
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                      <div>
                        <p className="text-sm font-bold">
                          Create Your First Stake Within 7 Days
                        </p>
                        <p className="mt-1 text-xs text-white/90">
                          Make your first stake and we&apos;ll add a bonus on
                          top!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                      <div>
                        <p className="text-sm font-bold">
                          Receive 10% Bonus of Your First Stake
                        </p>
                        <p className="mt-1 text-xs text-white/90">
                          Stake $1,000? Get $100 bonus. Stake $5,000? Get $500
                          bonus!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
                      <div>
                        <p className="mt-1 text-xs text-white/90">
                          Used to create more stakes and withdrawn as earnings!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                    <p className="text-center text-sm font-bold">
                      ⏰ Create your first stake within 7 days to claim this
                      bonus!
                    </p>
                  </div>
                </motion.div>

                {/* Closing Message */}
                <div className="from-muted/50 to-muted/30 border-border rounded-xl border bg-gradient-to-r p-6 text-center">
                  <p className="text-foreground mb-2 text-base font-medium">
                    <span className="text-primary font-black">{firstName}</span>
                    , we believe in you.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your success is inevitable when you combine your vision with
                    our platform. Let&apos;s build your financial empire
                    together, one stake at a time.
                  </p>
                  <p className="text-foreground mt-4 text-sm font-bold">
                    Welcome to a future of abundance. Welcome to Novunt. 🌟
                  </p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-4"
              >
                <Button
                  onClick={onClose}
                  size="lg"
                  className="from-primary via-success to-secondary w-full bg-gradient-to-r text-lg font-bold text-white shadow-2xl hover:opacity-90"
                >
                  Let&apos;s Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
