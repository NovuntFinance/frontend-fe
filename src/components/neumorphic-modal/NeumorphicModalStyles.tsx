'use client';

/**
 * Injects global styles for any element with class "neu-modal".
 * Ensures Deposit, Withdraw, Transfer, and Stakes modals share identical
 * neumorphic interaction states and input styling.
 */

import React from 'react';
import {
  NEU_TOKENS,
  neuRaised,
  neuInset,
  neuPressed,
  neuRadius,
  neuCloseHover,
  neuErrorColor,
} from './tokens';

const FOCUS_RING = NEU_TOKENS.focusRing;

export function NeumorphicModalStyles() {
  return (
    <style>{`
      .neu-modal [data-slot="dialog-close"],
      .neu-modal .neu-close-btn {
        background: ${NEU_TOKENS.bg};
        box-shadow: ${neuRaised};
        border: 1px solid ${NEU_TOKENS.border};
        color: ${NEU_TOKENS.accent};
        border-radius: ${neuRadius.md};
        transition: box-shadow 0.2s ease;
      }
      .neu-modal [data-slot="dialog-close"]:hover,
      .neu-modal .neu-close-btn:hover {
        box-shadow: ${neuCloseHover};
      }
      .neu-modal [data-slot="dialog-close"]:active,
      .neu-modal .neu-close-btn:active {
        box-shadow: ${neuPressed};
      }
      .neu-modal [data-slot="dialog-close"]:focus-visible,
      .neu-modal .neu-close-btn:focus-visible {
        outline: 2px solid ${FOCUS_RING};
        outline-offset: 2px;
      }
      .neu-modal .neu-input {
        background: ${NEU_TOKENS.bg};
        box-shadow: ${neuInset};
        border: 1px solid ${NEU_TOKENS.border};
        border-radius: ${neuRadius.md};
        color: ${NEU_TOKENS.white80};
      }
      .neu-modal .neu-input::placeholder {
        color: ${NEU_TOKENS.white40};
      }
      .neu-modal .neu-input:focus {
        outline: none;
        border-color: ${NEU_TOKENS.accent};
        box-shadow: ${neuInset}, 0 0 0 2px ${FOCUS_RING};
      }
      .neu-modal .neu-input-inner {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
      .neu-modal .neu-input-inner:focus {
        box-shadow: 0 0 0 2px ${FOCUS_RING} !important;
      }
      .neu-modal .neu-btn-primary:hover {
        box-shadow: ${neuCloseHover};
      }
      .neu-modal .neu-btn-primary:active {
        box-shadow: ${neuPressed};
      }
      .neu-modal .neu-btn-primary:focus-visible {
        outline: 2px solid ${FOCUS_RING};
        outline-offset: 2px;
      }
      .neu-modal .neu-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .neu-modal .neu-error {
        color: ${neuErrorColor};
      }
      .neu-modal::-webkit-scrollbar { width: 6px; }
      .neu-modal::-webkit-scrollbar-track { background: transparent; }
      .neu-modal::-webkit-scrollbar-thumb { border-radius: 9999px; background: var(--neu-text-muted); }
    `}</style>
  );
}
