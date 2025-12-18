/**
 * Responsive Component Utilities
 * Components for conditional rendering based on screen size
 */

'use client';

import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop' | 'large';
}

/**
 * Responsive wrapper component
 * Conditionally renders children based on screen size
 */
export function Responsive({ children, mobile, tablet, desktop, breakpoint }: ResponsiveProps) {
  const { isMobile, isTablet, isDesktop, breakpoint: currentBreakpoint } = useResponsive();

  if (breakpoint) {
    return currentBreakpoint === breakpoint ? <>{children}</> : null;
  }

  if (mobile && isMobile) return <>{children}</>;
  if (tablet && isTablet) return <>{children}</>;
  if (desktop && isDesktop) return <>{children}</>;

  return null;
}

/**
 * Mobile-only component
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <Responsive mobile>{children}</Responsive>;
}

/**
 * Desktop-only component
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <Responsive desktop>{children}</Responsive>;
}

/**
 * Tablet and up component
 */
export function TabletAndUp({ children }: { children: React.ReactNode }) {
  const { isTablet, isDesktop } = useResponsive();
  return (isTablet || isDesktop) ? <>{children}</> : null;
}

