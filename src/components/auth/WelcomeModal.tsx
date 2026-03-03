'use client';

/**
 * Welcome modal – mobile-first neumorphic design.
 * Theme-aware: uses --neu-modal-bg, --neu-bg, --neu-accent, --neu-border, etc.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Star,
  TrendingUp,
  Gift,
  Shield,
  Heart,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  email: string;
}

/* ── Shared inline neumorphic helpers ─────────────────────── */
const neuRadius = { sm: '16px', md: '18px', lg: '24px' };

const neuCardInsetStyle: React.CSSProperties = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-inset)',
  border: '1px solid var(--neu-border)',
  borderRadius: neuRadius.md,
};

const neuCardRaisedStyle: React.CSSProperties = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
  borderRadius: neuRadius.md,
};

const neuIconCircleStyle: React.CSSProperties = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
  borderRadius: '50%',
};

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
            showCloseButton
            overlayClassName={cn(
              '!bg-transparent',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            )}
            className={cn(
              'welcome-neu-modal',
              'border-0 p-0 shadow-none',
              /* Mobile-first: fill viewport minus safe-area, cap at 460px wide */
              'max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)]',
              'w-[calc(100vw-2rem)] max-w-[460px]',
              /* Scrollable */
              'overflow-x-hidden overflow-y-auto overscroll-contain',
              '-webkit-overflow-scrolling-touch',
              /* Animations */
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:duration-200 data-[state=open]:duration-300',
              /* Custom thin scrollbar */
              '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
              '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10'
            )}
            style={{
              background: 'var(--neu-modal-bg)',
              boxShadow: 'var(--neu-shadow-raised)',
              border: '1px solid var(--neu-border)',
              borderRadius: neuRadius.lg,
            }}
          >
            <DialogTitle className="sr-only">Welcome to Novunt</DialogTitle>

            {/* Scoped neumorphic overrides for close button */}
            <style>{`
              .welcome-neu-modal [data-slot="dialog-close"] {
                background: var(--neu-bg);
                box-shadow: var(--neu-shadow-raised);
                border: 1px solid var(--neu-border);
                color: var(--neu-accent);
                border-radius: ${neuRadius.md};
                transition: box-shadow 0.2s ease;
              }
              .welcome-neu-modal [data-slot="dialog-close"]:hover {
                box-shadow: var(--neu-shadow-raised-hover);
              }
              .welcome-neu-modal [data-slot="dialog-close"]:active {
                box-shadow: var(--neu-shadow-inset-press);
              }
              .welcome-neu-inner {
                padding: clamp(16px, 4vw, 28px) clamp(18px, 4.5vw, 28px);
              }
            `}</style>

            <div className="welcome-neu-inner relative min-w-0 space-y-4 sm:space-y-5">
              {/* ── Header ─────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex flex-col items-center text-center"
              >
                {/* Raised icon circle */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
                  style={neuIconCircleStyle}
                >
                  <Star
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    style={{
                      color: 'var(--neu-accent)',
                      fill: 'var(--neu-accent)',
                    }}
                  />
                </motion.div>

                <h2
                  className="mb-1 text-2xl font-black sm:text-3xl"
                  style={{ color: 'var(--neu-accent)' }}
                >
                  Welcome to Novunt, {firstName}! 🎉
                </h2>
                <p
                  className="text-sm sm:text-base"
                  style={{ color: 'var(--neu-text-secondary)' }}
                >
                  Your journey to financial freedom starts now
                </p>
              </motion.div>

              {/* ── Personalized welcome (inset card) ─────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="p-4 sm:p-5"
                style={neuCardInsetStyle}
              >
                <p
                  className="text-sm leading-relaxed sm:text-base"
                  style={{ color: 'var(--neu-text-primary)' }}
                >
                  Dear{' '}
                  <span
                    style={{ color: 'var(--neu-accent)' }}
                    className="font-bold"
                  >
                    {firstName} {lastName}
                  </span>
                  ,
                </p>
                <p
                  className="mt-3 text-sm leading-relaxed sm:text-base"
                  style={{ color: 'var(--neu-text-primary)' }}
                >
                  We are{' '}
                  <span className="font-semibold">absolutely thrilled</span> to
                  welcome you to the Novunt family! Your decision to join us
                  today is more than just creating an account—it&apos;s a{' '}
                  <span
                    className="font-bold"
                    style={{ color: 'var(--neu-accent)' }}
                  >
                    bold declaration
                  </span>{' '}
                  of your commitment to building lasting wealth and achieving
                  true financial independence.
                </p>
              </motion.div>

              {/* ── Feature cards (raised) ────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="space-y-3"
              >
                {/* Card 1 – Vision */}
                <div
                  className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4"
                  style={neuCardRaisedStyle}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10"
                    style={neuIconCircleStyle}
                  >
                    <Heart
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: 'var(--neu-accent)' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="mb-1 text-sm font-bold sm:text-base"
                      style={{ color: 'var(--neu-text-primary)' }}
                    >
                      Your Vision Inspires Us
                    </h3>
                    <p
                      className="text-xs leading-relaxed sm:text-sm"
                      style={{ color: 'var(--neu-text-secondary)' }}
                    >
                      We recognize the{' '}
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--neu-text-primary)' }}
                      >
                        courage and financial tenacity
                      </span>{' '}
                      it takes to pursue your dreams. By choosing Novunt,
                      you&apos;ve chosen a partner that believes in your vision
                      as much as you do.
                    </p>
                  </div>
                </div>

                {/* Card 2 – Promise */}
                <div
                  className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4"
                  style={neuCardRaisedStyle}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10"
                    style={neuIconCircleStyle}
                  >
                    <Shield
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: 'var(--neu-accent)' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="mb-1 text-sm font-bold sm:text-base"
                      style={{ color: 'var(--neu-text-primary)' }}
                    >
                      Your Financial Freedom is Our Promise
                    </h3>
                    <p
                      className="text-xs leading-relaxed sm:text-sm"
                      style={{ color: 'var(--neu-text-secondary)' }}
                    >
                      Rest assured, your financial freedom is not just a
                      goal—it&apos;s our{' '}
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--neu-text-primary)' }}
                      >
                        sacred commitment
                      </span>{' '}
                      to you. We&apos;ve built a platform where your stakes
                      grow, your earnings compound, and your dreams become
                      reality.
                    </p>
                  </div>
                </div>

                {/* Card 3 – Future */}
                <div
                  className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4"
                  style={neuCardRaisedStyle}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10"
                    style={neuIconCircleStyle}
                  >
                    <TrendingUp
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: 'var(--neu-accent)' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="mb-1 text-sm font-bold sm:text-base"
                      style={{ color: 'var(--neu-text-primary)' }}
                    >
                      What&apos;s Ahead: The Next Few Years
                    </h3>
                    <p
                      className="text-xs leading-relaxed sm:text-sm"
                      style={{ color: 'var(--neu-text-secondary)' }}
                    >
                      In the coming months and years, you&apos;ll witness your
                      portfolio flourish. You&apos;ll earn consistent returns,
                      build passive income streams, and create generational
                      wealth. This is just the beginning of your{' '}
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--neu-text-primary)' }}
                      >
                        transformation story
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ── Registration Bonus (accent inset card) ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="p-4 sm:p-5"
                style={{
                  background: 'var(--neu-accent)',
                  borderRadius: neuRadius.md,
                  boxShadow: 'var(--neu-shadow-raised)',
                  border: '1px solid var(--neu-border)',
                  color: '#ffffff',
                }}
              >
                <div className="mb-3 flex items-center gap-3 sm:mb-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                    }}
                  >
                    <Gift className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black sm:text-lg">
                      Your Registration Bonus Awaits!
                    </h3>
                    <p className="text-xs text-white/90 sm:text-sm">
                      A special gift to kickstart your journey
                    </p>
                  </div>
                </div>

                <div
                  className="space-y-2.5 p-3 sm:p-4"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: neuRadius.sm,
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                    <div>
                      <p className="text-xs font-bold sm:text-sm">
                        Create Your First Stake Within 7 Days
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/90 sm:text-xs">
                        Make your first stake and we&apos;ll add a bonus on top!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                    <div>
                      <p className="text-xs font-bold sm:text-sm">
                        Receive 10% Bonus of Your First Stake
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/90 sm:text-xs">
                        Stake $1,000? Get $100 bonus. Stake $5,000? Get $500
                        bonus!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                    <p className="text-[11px] text-white/90 sm:text-xs">
                      Used to create more stakes and withdrawn as earnings!
                    </p>
                  </div>
                </div>

                <div
                  className="mt-3 p-2.5 text-center sm:mt-4 sm:p-3"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: neuRadius.sm,
                  }}
                >
                  <p className="text-xs font-bold sm:text-sm">
                    ⏰ Create your first stake within 7 days to claim this
                    bonus!
                  </p>
                </div>
              </motion.div>

              {/* ── Closing message (inset card) ──────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.35 }}
                className="p-4 text-center sm:p-5"
                style={neuCardInsetStyle}
              >
                <p
                  className="mb-1.5 text-sm font-medium sm:text-base"
                  style={{ color: 'var(--neu-text-primary)' }}
                >
                  <span
                    className="font-black"
                    style={{ color: 'var(--neu-accent)' }}
                  >
                    {firstName}
                  </span>
                  , we believe in you.
                </p>
                <p
                  className="text-xs leading-relaxed sm:text-sm"
                  style={{ color: 'var(--neu-text-secondary)' }}
                >
                  Your success is inevitable when you combine your vision with
                  our platform. Let&apos;s build your financial empire together,
                  one stake at a time.
                </p>
                <p
                  className="mt-3 text-xs font-bold sm:text-sm"
                  style={{ color: 'var(--neu-text-primary)' }}
                >
                  Welcome to a future of abundance. Welcome to Novunt. 🌟
                </p>
              </motion.div>

              {/* ── CTA button (raised neumorphic) ────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.35 }}
              >
                <button
                  onClick={onClose}
                  className="welcome-cta flex w-full items-center justify-center gap-2 py-3.5 text-base font-bold sm:py-4 sm:text-lg"
                  style={{
                    background: 'var(--neu-accent)',
                    color: '#ffffff',
                    borderRadius: neuRadius.md,
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      'var(--neu-shadow-raised-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      'var(--neu-shadow-raised)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Let&apos;s Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
