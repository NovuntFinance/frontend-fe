/**
 * Test Utilities
 * Common helpers for testing React components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

/**
 * Create a test query client with safe defaults
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Custom render with providers
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Render component with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Create a wrapper component for React Testing Library's renderHook
 * so hooks can be tested with all providers.
 */
export function createWrapper() {
  // Use a dedicated query client for this wrapper to avoid cross-test leakage
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    );
  };
}

/**
 * Setup a simple in-memory localStorage mock for tests that rely on it.
 */
export function setupLocalStorageMock() {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
}

/**
 * Mock API response helper
 */
export function createMockApiResponse<T>(
  data: T,
  success = true
): { success: boolean; data: T } {
  return { success, data };
}

/**
 *  Mock API error helper
 */
export function createMockApiError(
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>
) {
  return {
    success: false,
    message,
    statusCode,
    errors,
  };
}

/**
 * Wait for async updates
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
