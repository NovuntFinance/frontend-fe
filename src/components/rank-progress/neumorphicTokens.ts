/**
 * Neumorphic design tokens for the rank/progress modal.
 * Strict palette: #0D162C (primary), #009BF2 (accent), #FFFFFF (low opacity only).
 * Hierarchy via opacity, spacing, and neumorphic depth only.
 */

export const NEU_TOKENS = {
  /** Primary background – overlay, modal surface, all internal panels */
  bg: '#0D162C',
  /** Only secondary/accent – headings, primary text, icons, progress fills, highlights, subtle borders */
  accent: '#009BF2',
  /** White only at low opacity – soft light reflections, secondary text (use opacity steps: 1, 0.8, 0.6, 0.4) */
  white: '#FFFFFF',
  white80: 'rgba(255, 255, 255, 0.8)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white06: 'rgba(255, 255, 255, 0.06)',
  /** Subtle border when needed – accent at low opacity */
  border: 'rgba(0, 155, 242, 0.15)',
  borderStrong: 'rgba(0, 155, 242, 0.25)',
  /** Focus ring */
  focusRing: 'rgba(0, 155, 242, 0.35)',
} as const;

/** Single light-source direction: top-left. Dark shadow bottom-right, light highlight top-left. */
const SHADOW_DARK = 'rgba(0, 0, 0, 0.45)';
const SHADOW_LIGHT = 'rgba(255, 255, 255, 0.04)';
const INSET_DARK = 'rgba(0, 0, 0, 0.35)';
const INSET_LIGHT = 'rgba(255, 255, 255, 0.03)';

/** Modal container – softly raised from background */
export const neuModalRaised = `12px 12px 28px ${SHADOW_DARK}, -8px -8px 20px ${SHADOW_LIGHT}`;

/** Internal content blocks – slightly inset into modal surface */
export const neuInset = `inset 4px 4px 10px ${INSET_DARK}, inset -4px -4px 10px ${INSET_LIGHT}`;

/** Interactive elements (icon containers, chips, buttons) – gently raised */
export const neuRaised = `6px 6px 12px ${SHADOW_DARK}, -4px -4px 10px ${SHADOW_LIGHT}`;

/** Pressed/active state – inset */
export const neuPressed = `inset 3px 3px 6px ${INSET_DARK}, inset -2px -2px 4px ${INSET_LIGHT}`;

/** Progress bar fill – subtle soft highlight (no neon) */
export const neuProgressFillHighlight = `0 0 12px rgba(0, 155, 242, 0.25)`;

/** Border radius: 16–24px */
export const neuRadius = {
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
} as const;

/** Responsive spacing: mobile ~16px, tablet ~24px, desktop ~32px */
export const neuSpacing = {
  mobile: '16px',
  tablet: '24px',
  desktop: '32px',
} as const;
