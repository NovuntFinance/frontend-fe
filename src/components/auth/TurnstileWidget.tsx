'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTheme } from 'next-themes';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      getResponse: (widgetId: string) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileWidgetHandle {
  getToken: () => string | null;
  reset: () => void;
}

export interface TurnstileWidgetProps {
  /** Optional ref to call getToken() and reset() */
  widgetRef?: React.Ref<TurnstileWidgetHandle | null>;
  /** Called when token is ready (user passed challenge) */
  onToken?: (token: string) => void;
  /** Called on error or expiry */
  onError?: () => void;
  /** Size: normal, compact, or flexible */
  size?: 'normal' | 'compact' | 'flexible';
  /** Optional container class name */
  className?: string;
}

const SITE_KEY =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string)
    : '';

/**
 * Cloudflare Turnstile widget for login/register forms.
 * Loads the script once and renders the widget with explicit API.
 * Use widgetRef to get token on submit and reset on TURNSTILE_FAILED.
 */
export function TurnstileWidget({
  widgetRef,
  onToken,
  onError,
  size = 'normal',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  const theme =
    resolvedTheme === 'dark'
      ? 'dark'
      : resolvedTheme === 'light'
        ? 'light'
        : 'auto';

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined' || !window.turnstile || !widgetId) {
      return null;
    }
    return window.turnstile.getResponse(widgetId) || null;
  }, [widgetId]);

  const reset = useCallback(() => {
    if (typeof window === 'undefined' || !window.turnstile || !widgetId) {
      return;
    }
    window.turnstile.reset(widgetId);
  }, [widgetId]);

  useImperativeHandle(
    widgetRef,
    () => ({
      getToken,
      reset,
    }),
    [getToken, reset]
  );

  // Load Turnstile script once
  useEffect(() => {
    if (!SITE_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[TurnstileWidget] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set; widget will not render.'
        );
      }
      return;
    }

    const existing = document.querySelector(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`
    );
    if (existing) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
    return () => {
      // Don't remove script; other instances may use it
    };
  }, []);

  // Render widget when script is loaded and container is ready
  useEffect(() => {
    if (!SITE_KEY || !scriptLoaded || !containerRef.current || widgetId) {
      return;
    }

    const el = containerRef.current;
    if (!window.turnstile) {
      return;
    }

    const id = window.turnstile.render(el, {
      sitekey: SITE_KEY,
      theme,
      size,
      callback: (token) => {
        onToken?.(token);
      },
      'error-callback': () => {
        onError?.();
      },
      'expired-callback': () => {
        onError?.();
      },
    });
    setWidgetId(id);

    return () => {
      if (window.turnstile && id) {
        try {
          window.turnstile.remove(id);
        } catch {
          // ignore
        }
      }
      setWidgetId(null);
    };
  }, [scriptLoaded, theme, size, onToken, onError]);

  // No site key: widget not configured (e.g. missing NEXT_PUBLIC_TURNSTILE_SITE_KEY in production build)
  if (!SITE_KEY) {
    return (
      <div
        className={`rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-center text-sm text-amber-200 ${className}`}
        role="status"
      >
        Security verification is not configured for this site. Please contact support or try again later.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex justify-center [&_.cf-turnstile]:[margin:0] ${className}`}
      aria-label="Security verification"
    />
  );
}
