/**
 * Responsive Design Utilities Hook
 * Provides consistent responsive breakpoints and utilities
 */

import { useMediaQuery } from './useMediaQuery';

/**
 * Hook to get current responsive breakpoint
 */
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isLargeScreen = useMediaQuery('(min-width: 1440px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    // Convenience helpers
    isSmallScreen: isMobile || isTablet,
    isWideScreen: isDesktop || isLargeScreen,
    // Breakpoint string for conditional rendering
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large',
  };
}

/**
 * Hook to get responsive grid columns
 * Returns appropriate column count based on screen size
 */
export function useResponsiveGrid(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  large: number = 4
) {
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet) return tablet;
  if (isLargeScreen) return large;
  return desktop;
}

/**
 * Hook to get responsive spacing
 * Returns appropriate spacing based on screen size
 */
export function useResponsiveSpacing(
  mobile: string = '1rem',
  tablet: string = '1.5rem',
  desktop: string = '2rem'
) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
}

/**
 * Hook to conditionally render based on screen size
 */
export function useResponsiveRender() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return {
    mobile: (component: React.ReactNode) => isMobile ? component : null,
    tablet: (component: React.ReactNode) => isTablet ? component : null,
    desktop: (component: React.ReactNode) => isDesktop ? component : null,
    mobileOrTablet: (component: React.ReactNode) => (isMobile || isTablet) ? component : null,
    desktopOnly: (component: React.ReactNode) => isDesktop ? component : null,
  };
}

