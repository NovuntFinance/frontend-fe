'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { neuModalBackground } from './tokens';
import { NEU_TOKENS, neuModalRaised, neuRadius } from './tokens';
import { NeumorphicModalStyles } from './NeumorphicModalStyles';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Prevent close (e.g. during submit). Still allow if undefined/false. */
  preventClose?: boolean;
  /** Optional z-index for overlay and content (default 100/101) */
  zIndex?: number;
}

/**
 * Shared neumorphic modal shell: overlay + centered container.
 * Use with ModalHeader, ModalBody, InfoCallout, ModalFooter.
 * Add class "neu-modal" to the inner container so NeumorphicModalStyles apply.
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  className,
  preventClose,
  zIndex = 100,
}: BaseModalProps) {
  const handleOverlayClick = () => {
    if (!preventClose) onClose();
  };

  return (
    <>
      <NeumorphicModalStyles />
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm"
              style={{
                zIndex,
                background: 'rgba(0,0,0,0.6)',
              }}
              onClick={handleOverlayClick}
            />
            <div
              className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-y-auto p-4"
              style={{ zIndex: zIndex + 1 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'neu-modal pointer-events-auto w-full max-w-lg overflow-hidden lg:max-w-xl',
                  'max-h-[calc(100vh-2rem)] lg:max-h-none',
                  className
                )}
                style={{
                  background: neuModalBackground,
                  boxShadow: neuModalRaised,
                  border: `1px solid ${NEU_TOKENS.border}`,
                  borderRadius: neuRadius.lg,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
