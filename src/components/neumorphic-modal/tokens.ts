/**
 * Neumorphic modal design tokens.
 * Single source of truth: #0D162C (background), #009BF2 (accent), #FFFFFF (low opacity only).
 * Re-exports and extends rank-progress neumorphic tokens for modal system.
 */

export {
  NEU_TOKENS,
  neuModalRaised,
  neuInset,
  neuRaised,
  neuPressed,
  neuRadius,
  neuSpacing,
  neuProgressFillHighlight,
} from '@/components/rank-progress/neumorphicTokens';

/** Modal surface gradient (matches Stakes modal) */
export const neuModalBackground = `linear-gradient(165deg, #0f1930 0%, #0D162C 45%, #0b1222 100%)`;

/** Error/validation text – red that fits dark theme */
export const neuErrorColor = '#f87171';

/** Hover elevation for raised buttons */
export const neuRaisedHover = `8px 8px 18px rgba(0,0,0,0.45), -5px -5px 14px rgba(255,255,255,0.05)`;

/** Close button hover */
export const neuCloseHover = `8px 8px 16px rgba(0,0,0,0.4), -4px -4px 12px rgba(255,255,255,0.05)`;
