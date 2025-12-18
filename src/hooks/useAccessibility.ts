/**
 * Accessibility Utilities Hook
 * Provides accessibility helpers for components
 */

import { useEffect, useRef } from 'react';
import { announceToScreenReader } from '@/lib/accessibility';

/**
 * Hook to announce changes to screen readers
 */
export function useAnnounce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  useEffect(() => {
    if (message) {
      announceToScreenReader(message, priority);
    }
  }, [message, priority]);
}

/**
 * Hook to manage focus for modals/dialogs
 */
export function useFocusManagement(isOpen: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the container
      setTimeout(() => {
        containerRef.current?.focus();
      }, 100);
    } else {
      // Restore focus when closed
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  return containerRef;
}

/**
 * Hook to trap focus within an element
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to generate unique IDs for form elements
 */
let idCounter = 0;
export function useId(prefix = 'id'): string {
  const idRef = useRef<string | null>(null);

  if (!idRef.current) {
    idCounter++;
    idRef.current = `${prefix}-${idCounter}`;
  }

  return idRef.current;
}

