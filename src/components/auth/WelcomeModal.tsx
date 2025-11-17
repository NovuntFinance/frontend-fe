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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden border-none bg-gradient-to-br from-background via-background to-primary/5">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.1, scale: 2 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary to-success rounded-full blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.1, scale: 2 }}
                transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
                className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary to-primary rounded-full blur-3xl"
              />
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              {/* Header with Animation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary to-success shadow-2xl"
                >
                  <Star className="h-10 w-10 text-white fill-white" />
                </motion.div>

                <DialogHeader>
                  <DialogTitle className="text-4xl font-black bg-gradient-to-r from-primary via-success to-secondary bg-clip-text text-transparent mb-3">
                    Welcome to Novunt, {firstName}! 🎉
                  </DialogTitle>
                  <DialogDescription className="text-lg text-muted-foreground">
                    Your journey to financial freedom starts now
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              {/* Main Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6 mb-8"
              >
                {/* Personalized Welcome */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-success/10 to-secondary/10 backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-lg">
                  <p className="text-base leading-relaxed text-foreground">
                    Dear <span className="font-bold text-primary">{firstName} {lastName}</span>,
                  </p>
                  <p className="text-base leading-relaxed text-foreground mt-4">
                    We are <span className="font-semibold">absolutely thrilled</span> to welcome you to the Novunt family! 
                    Your decision to join us today is more than just creating an account—it&apos;s a{' '}
                    <span className="font-bold text-success">bold declaration</span> of your commitment to building 
                    lasting wealth and achieving true financial independence.
                  </p>
                </div>

                {/* Vision & Promise */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-success/5 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-success/10 transition-all duration-200 shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">Your Vision Inspires Us</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We recognize the <span className="font-semibold text-foreground">courage and financial tenacity</span> it takes 
                        to pursue your dreams. By choosing Novunt, you&apos;ve chosen a partner that believes in your vision as much as you do.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-primary/10 transition-all duration-200 shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">Your Financial Freedom is Our Promise</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Rest assured, your financial freedom is not just a goal—it&apos;s our{' '}
                        <span className="font-semibold text-foreground">sacred commitment</span> to you. 
                        We&apos;ve built a platform where your stakes grow, your earnings compound, and your dreams become reality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/5 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-secondary/10 transition-all duration-200 shadow-md">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">What&apos;s Ahead: The Next Few Years</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        In the coming months and years, you&apos;ll witness your portfolio flourish. You&apos;ll earn consistent returns, 
                        build passive income streams, and create generational wealth. This is just the beginning of your{' '}
                        <span className="font-semibold text-foreground">transformation story</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Bonus Highlight */}
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="p-6 rounded-2xl bg-gradient-to-r from-success to-emerald-600 text-white shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl">Your Registration Bonus Awaits!</h3>
                      <p className="text-white/90 text-sm">A special gift to kickstart your journey</p>
                    </div>
                  </div>
                  <div className="space-y-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold">Create Your First Stake Within 7 Days</p>
                        <p className="text-xs text-white/90 mt-1">Make your first stake and we&apos;ll add a bonus on top!</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold">Receive 10% Bonus of Your First Stake</p>
                        <p className="text-xs text-white/90 mt-1">
                          Stake $1,000? Get $100 bonus. Stake $5,000? Get $500 bonus!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/90 mt-1">
                          Used to create more stakes and withdrawn as earnings!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-bold text-center">
                      ⏰ Create your first stake within 7 days to claim this bonus!
                    </p>
                  </div>
                </motion.div>

                {/* Closing Message */}
                <div className="text-center p-6 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border">
                  <p className="text-base font-medium text-foreground mb-2">
                    <span className="font-black text-primary">{firstName}</span>, we believe in you.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your success is inevitable when you combine your vision with our platform. 
                    Let&apos;s build your financial empire together, one stake at a time.
                  </p>
                  <p className="text-sm font-bold text-foreground mt-4">
                    Welcome to a future of abundance. Welcome to Novunt. 🌟
                  </p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={onClose}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary via-success to-secondary hover:opacity-90 text-white shadow-2xl text-lg font-bold"
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

