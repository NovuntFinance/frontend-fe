'use client';

import type { ReactNode } from 'react';

export interface DashboardPageContainerProps {
  /** Content to constrain to desktop max-width and gutters */
  children: ReactNode;
  /** Extra class names (e.g. for section spacing or layout) */
  className?: string;
  /** When true, add vertical section spacing (24–40px) between major blocks */
  sectionSpacing?: boolean;
  /** HTML element to render (default: div) */
  as?: 'div' | 'section' | 'article';
}

/**
 * Desktop-only centered max-width container for dashboard content.
 * On desktop (lg+): max-width 1320px, centered, gutters 32px (xl: 48px).
 * Below desktop: full width with responsive padding (16px / 24px).
 * Use for inner content when a section has a full-bleed background; the layout
 * already wraps each page in this container, so this is for nested use.
 */
export function DashboardPageContainer({
  children,
  className = '',
  sectionSpacing = false,
  as: Component = 'div',
}: DashboardPageContainerProps) {
  const spacingClass = sectionSpacing
    ? ' dashboard-page-container--section-spacing'
    : '';
  return (
    <Component
      className={`dashboard-page-container${spacingClass} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
