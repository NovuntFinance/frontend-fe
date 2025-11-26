/**
 * Focus Management Utilities
 * For accessible modal and overlay focus handling
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Trap focus within a container (for modals/dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Store the previously focused element
  const previouslyFocused = document.activeElement as HTMLElement;

  // Focus the first element
  firstElement?.focus();

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (focusableElements.length === 1) {
      e.preventDefault();
      return;
    }

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
  }

  // Add event listener
  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
    // Restore focus to previously focused element
    previouslyFocused?.focus();
  };
}

/**
 * React hook for focus trap
 */
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

/**
 * Focus the first element with error in a form
 */
export function focusFirstError(formElement: HTMLElement) {
  const errorElement = formElement.querySelector(
    '[aria-invalid="true"]'
  ) as HTMLElement;
  errorElement?.focus();
}

/**
 * Manage focus announcement for screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * React hook for focus management in modals
 */
export function useModalFocus(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isOpen) {
      // Store currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Focus modal
      if (modalRef.current) {
        cleanup = trapFocus(modalRef.current);
      }
    } else {
      // Restore focus when modal closes
      previouslyFocusedElement.current?.focus();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isOpen]);

  return modalRef;
}

/**
 * Handle Escape key to close modal
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape, isActive]);
}

/**
 * Lock body scroll when modal is open
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isLocked]);
}
