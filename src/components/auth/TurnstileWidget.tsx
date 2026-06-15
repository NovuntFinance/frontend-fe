'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Loader2 } from 'lucide-react';
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
function TurnstileWidgetComponent({
  widgetRef,
  onToken,
  onError,
  size = 'normal',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { resolvedTheme } = useTheme();

  // Use refs to prevent re-renders when callbacks change
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);

  // Keep refs in sync
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Capture theme at mount time - don't remount if it changes during verification
  const initialThemeRef = useRef<'light' | 'dark' | 'auto'>(
    resolvedTheme === 'dark'
      ? 'dark'
      : resolvedTheme === 'light'
        ? 'light'
        : 'auto'
  );

  const theme = initialThemeRef.current;

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

  // Load Turnstile script once, with a timeout + error handling so a slow or
  // blocked Cloudflare CDN doesn't leave the user stuck on "Verifying..." forever.
  useEffect(() => {
    if (!SITE_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[TurnstileWidget] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set; widget will not render.'
        );
      }
      return;
    }

    setLoadFailed(false);

    // Already available (script loaded earlier on another page/instance).
    if (typeof window !== 'undefined' && window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const markLoaded = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setScriptLoaded(true);
    };
    const markFailed = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setLoadFailed(true);
    };

    const existing = document.querySelector(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.turnstile) {
        markLoaded();
      } else {
        existing.addEventListener('load', markLoaded);
        existing.addEventListener('error', markFailed);
      }
    } else {
      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = markLoaded;
      script.onerror = markFailed;
      document.head.appendChild(script);
    }

    // If the script hasn't loaded within 12s (slow/blocked network), surface a
    // retry instead of an endless spinner.
    timeoutId = setTimeout(() => {
      if (!window.turnstile) setLoadFailed(true);
    }, 12000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (existing) {
        existing.removeEventListener('load', markLoaded);
        existing.removeEventListener('error', markFailed);
      }
    };
    // reloadKey lets the user manually retry a failed load.
  }, [reloadKey]);

  // Render widget when script is loaded and container is ready.
  useEffect(() => {
    if (!SITE_KEY || !scriptLoaded || !containerRef.current || widgetId) {
      return;
    }

    const el = containerRef.current;
    let renderedId: string | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const tryRender = (): boolean => {
      if (!window.turnstile || !el) return false;
      try {
        renderedId = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          theme,
          size,
          callback: (token) => onTokenRef.current?.(token),
          'error-callback': () => onErrorRef.current?.(),
          'expired-callback': () => onErrorRef.current?.(),
        });
        setWidgetId(renderedId);
        return true;
      } catch {
        return false;
      }
    };

    // The script may report "loaded" a beat before window.turnstile is usable.
    // Try immediately, then poll briefly instead of giving up silently.
    if (!tryRender()) {
      let attempts = 0;
      pollId = setInterval(() => {
        attempts += 1;
        if (tryRender() || attempts > 40) {
          if (pollId) clearInterval(pollId);
          if (attempts > 40 && !renderedId) setLoadFailed(true);
        }
      }, 150);
    }

    return () => {
      if (pollId) clearInterval(pollId);
      if (window.turnstile && renderedId) {
        try {
          window.turnstile.remove(renderedId);
        } catch {
          // ignore
        }
      }
      setWidgetId(null);
    };
  }, [scriptLoaded, size, reloadKey]);

  // No site key: widget not configured (e.g. missing NEXT_PUBLIC_TURNSTILE_SITE_KEY in production build)
  if (!SITE_KEY) {
    return (
      <div
        className={`rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-center text-sm text-amber-200 ${className}`}
        role="status"
      >
        Security verification is not configured for this site. Please contact
        support or try again later.
      </div>
    );
  }

  const retry = () => {
    setLoadFailed(false);
    setScriptLoaded(false);
    setWidgetId(null);
    setReloadKey((k) => k + 1);
  };

  // Load failed (slow/blocked network) — give the user a clear retry instead of
  // an endless spinner.
  if (loadFailed) {
    return (
      <div
        className={`flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 px-4 py-4 text-center ${className}`}
        role="alert"
      >
        <p className="text-sm text-amber-200">
          The security check couldn&apos;t load. Check your connection and try
          again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="rounded-md bg-amber-500/20 px-4 py-1.5 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  const isLoading = !scriptLoaded || !widgetId;

  return (
    <div
      className={`relative flex min-h-[78px] flex-col items-center justify-center ${className}`}
      aria-label="Security verification"
    >
      {isLoading && (
        <div
          className="border-muted-foreground/30 bg-muted/30 absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
          <p className="text-foreground text-center text-sm">
            Security verification loading...
          </p>
          <p className="text-muted-foreground text-center text-xs">
            This may take a moment on slow connections
          </p>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex min-h-[65px] w-full justify-center [&_.cf-turnstile]:[margin:0]"
      />
    </div>
  );
}

// Memoized so the widget does NOT re-render (and reset mid-verification) when the
// parent form re-renders for unrelated reasons (typing, validation, animations).
// Relies on the parent passing STABLE callbacks (useCallback) and a stable widgetRef.
export const TurnstileWidget = React.memo(TurnstileWidgetComponent);
