'use client';

import { useLayoutEffect } from 'react';

const LAYOUT_DEBUG =
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_LAYOUT_DEBUG === '1';

const SELECTORS = [
  { key: 'viewport-cap', selector: '.dashboard-viewport-cap' },
  { key: 'main-content', selector: '#main-content' },
  { key: 'dashboard-header', selector: '.dashboard-viewport-cap > header' },
] as const;

function getComputedLayout(el: Element) {
  const s = getComputedStyle(el);
  return {
    height: s.height,
    minHeight: s.minHeight,
    maxHeight: s.maxHeight,
    padding: s.padding,
    margin: s.margin,
    gap: s.gap,
    lineHeight: s.lineHeight,
    fontFamily: s.fontFamily,
    overflow: s.overflow,
    overflowY: s.overflowY,
    boxSizing: s.boxSizing,
  };
}

export function LayoutDebug() {
  useLayoutEffect(() => {
    if (!LAYOUT_DEBUG || typeof document === 'undefined') return;

    const entries: Record<
      string,
      ReturnType<typeof getComputedLayout> & { tag: string }
    > = {};
    const cleanup: (() => void)[] = [];

    SELECTORS.forEach(({ key, selector }) => {
      const el = document.querySelector(selector);
      if (!el) {
        console.log(`[LayoutDebug] ${key}: element not found (${selector})`);
        return;
      }
      const computed = getComputedLayout(el);
      entries[key] = { ...computed, tag: el.tagName };
      console.log(`[LayoutDebug] ${key} (${el.tagName})`, computed);

      // Outline for visual debugging (non-intrusive)
      const prevOutline = (el as HTMLElement).style.outline;
      const colors: Record<string, string> = {
        'viewport-cap': '2px solid rgba(0, 155, 242, 0.8)',
        'main-content': '2px solid rgba(16, 185, 129, 0.8)',
        'dashboard-header': '2px solid rgba(245, 158, 11, 0.8)',
      };
      (el as HTMLElement).style.outline = colors[key] ?? '2px solid magenta';
      cleanup.push(() => {
        (el as HTMLElement).style.outline = prevOutline;
      });
    });

    if (Object.keys(entries).length > 0) {
      console.log(
        '[LayoutDebug] Summary (copy for local vs production comparison):',
        entries
      );
    }

    return () => cleanup.forEach((fn) => fn());
  }, []);

  if (!LAYOUT_DEBUG) return null;

  return (
    <div
      aria-hidden
      className="fixed bottom-2 left-2 z-[9999] rounded bg-black/90 px-2 py-1 font-mono text-[10px] text-green-400"
    >
      Layout debug ON — check console for computed values
    </div>
  );
}
