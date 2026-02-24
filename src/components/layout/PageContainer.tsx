'use client';

import type { ReactNode } from 'react';

export interface PageContainerProps {
  /** Page content; will be constrained to max-width and responsive gutters */
  children: ReactNode;
  /** Extra class names (e.g. for section spacing or layout) */
  className?: string;
  /** When true, add vertical section spacing (padding-top/bottom) for rhythm between major blocks */
  sectionSpacing?: boolean;
  /** HTML element to render (default: div) */
  as?: 'div' | 'section' | 'article' | 'main';
}

/**
 * Centered max-width container for page content.
 * Prevents edge-to-edge stretching on desktop: content stays within a defined max-width
 * (e.g. 1200?1400px) with responsive left/right gutters (16px mobile ? 24px tablet ? 32?48px desktop).
 * Use for all primary sections so the UI feels consistent and intentionally spaced.
 * For full-bleed backgrounds (e.g. hero), keep the background on the parent and wrap only
 * the inner content in PageContainer.
 */
export function PageContainer({
  children,
  className = '',
  sectionSpacing = false,
  as: Component = 'div',
}: PageContainerProps) {
  const spacingClass = sectionSpacing ? ' page-container--section-spacing' : '';
  return (
    <Component className={`page-container${spacingClass} ${className}`.trim()}>
      {children}
    </Component>
  );
}
