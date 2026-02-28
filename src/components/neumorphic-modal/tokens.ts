/**
 * Neumorphic modal design tokens – theme-aware via CSS variables (--neu-*).
 * Light/dark resolved from globals.css :root and .dark.
 */

import { neuRadius, neuSpacing } from '@/components/rank-progress/neumorphicTokens';

/** Theme-aware tokens for modals (use in inline styles and injected CSS) */
export const NEU_TOKENS = {
  bg: 'var(--neu-bg)',
  accent: 'var(--neu-accent)',
  white80: 'var(--neu-text-primary)',
  white60: 'var(--neu-text-secondary)',
  white40: 'var(--neu-text-muted)',
  white20: 'rgba(var(--neu-accent-rgb), 0.12)',
  white10: 'rgba(var(--neu-accent-rgb), 0.08)',
  white06: 'rgba(var(--neu-accent-rgb), 0.06)',
  border: 'var(--neu-border)',
  borderStrong: 'rgba(var(--neu-accent-rgb), 0.25)',
  focusRing: 'var(--neu-focus-ring)',
} as const;

/** Modal surface – solid in light, gradient in dark (from globals) */
export const neuModalBackground = 'var(--neu-modal-bg)';

/** Modal container shadow – same as dashboard cards */
export const neuModalRaised = 'var(--neu-shadow-raised)';

/** Inset shadow – form fields, pressed state (from neumorphic module) */
export const neuInset = 'var(--neu-shadow-inset)';

/** Raised buttons/close button */
export const neuRaised = 'var(--neu-shadow-raised)';

/** Pressed/active state */
export const neuPressed = 'var(--neu-shadow-inset-press)';

/** Close button / primary button hover */
export const neuCloseHover = 'var(--neu-shadow-raised-hover)';

/** Re-export from rank-progress (theme-invariant) */
export { neuRadius, neuSpacing };

/** Progress bar fill highlight */
export const neuProgressFillHighlight =
  '0 0 12px rgba(var(--neu-accent-rgb), 0.25)';

/** Error/validation text */
export const neuErrorColor = '#f87171';

/** Legacy alias for compatibility */
export const neuRaisedHover = neuCloseHover;
