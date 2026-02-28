'use client';

import React from 'react';

export interface NeumorphicCarouselDotsProps {
  count: number;
  currentIndex: number;
  onSelect: (index: number) => void;
  /** Optional aria label prefix for each button, e.g. "Go to stat" */
  ariaLabelPrefix?: string;
}

/**
 * Neumorphic carousel indicator: recessed track with glowing active pill and debossed inactive dots.
 * Use for stat card, live activity, trading signals, platform activity, etc.
 */
export function NeumorphicCarouselDots({
  count,
  currentIndex,
  onSelect,
  ariaLabelPrefix = 'Go to item',
}: NeumorphicCarouselDotsProps) {
  if (count <= 0) return null;

  return (
    <div className="mt-4 flex justify-center">
      <div
        className="inline-flex items-center px-1.5 py-1.5"
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 9999,
          boxShadow:
            'inset 3px 3px 8px rgba(0, 0, 0, 0.5), inset -2px -2px 6px rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: count }, (_, index) => {
            const isActive = currentIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(index)}
                className="rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-opacity-50"
                style={{
                  width: isActive ? 32 : 10,
                  height: 10,
                  background: isActive
                    ? 'var(--neu-accent)'
                    : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isActive
                    ? '0 2px 12px rgba(var(--neu-accent-rgb), 0.5), 0 0 16px rgba(var(--neu-accent-rgb), 0.25), inset 0 1px 0 var(--neu-shadow-light)'
                    : 'inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 1px var(--neu-shadow-light)',
                }}
                aria-label={`${ariaLabelPrefix} ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
