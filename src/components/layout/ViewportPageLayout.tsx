'use client';

import type { ReactNode } from 'react';

export interface ViewportPageLayoutProps {
  /** Main content (lives in the single scroll area). Use app-no-overflow on wide content. */
  children: ReactNode;
  /** Optional sticky header (flex-shrink-0). Use for nav, back link, title. */
  header?: ReactNode;
  /** Optional sticky footer (flex-shrink-0). Use for CTAs, links. */
  footer?: ReactNode;
  /** Extra class for the outer wrapper (e.g. for background or padding). */
  className?: string;
  /** Extra class for the scrollable main area. */
  mainClassName?: string;
}

/**
 * Reusable layout for any page that must stay within the viewport (PWA / mobile app style).
 * Use for: terms, privacy, about, contact, or any future standalone page.
 *
 * - Outer: flex column, fills viewport, no overflow.
 * - One scroll region: only the main area scrolls.
 * - Header/footer are optional and stay fixed; content in between scrolls.
 */
export function ViewportPageLayout({
  children,
  header,
  footer,
  className = '',
  mainClassName = '',
}: ViewportPageLayoutProps) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${className}`.trim()}
    >
      {header != null ? (
        <header className="flex-shrink-0" role="banner">
          {header}
        </header>
      ) : null}
      <main
        id="main-content"
        className={`app-scroll app-no-overflow min-h-0 flex-1 ${mainClassName}`.trim()}
        role="main"
      >
        {children}
      </main>
      {footer != null ? (
        <footer className="flex-shrink-0" role="contentinfo">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
