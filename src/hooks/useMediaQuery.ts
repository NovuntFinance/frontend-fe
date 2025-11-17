/**
 * useMediaQuery Hook
 * Responsive design utility for breakpoint detection
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Create listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
}

// Preset breakpoint hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsLargeScreen() {
  return useMediaQuery('(min-width: 1440px)');
}

export function useIs4K() {
  return useMediaQuery('(min-width: 2560px)');
}

// Dark mode detection
export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// Reduced motion preference
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
