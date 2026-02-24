'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Users, Star } from 'lucide-react';

const ACCENT = '#009BF2'; /* platform light blue — used for menu items and accent */
const BAR_BG = 'var(--app-surface)';

const NAV_ITEMS: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}[] = [
  { name: 'Stake', href: '/dashboard/stakes', icon: TrendingUp },
  { name: 'Wallet', href: '/dashboard/wallets', icon: Wallet },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'NXP', href: '/dashboard/achievements', icon: Star },
];

const NOTCH_MASK =
  'radial-gradient(circle at 50% 16px, transparent 42px, #000 44px)';

export function HorizontalNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderNavItem = (item: (typeof NAV_ITEMS)[0]) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={(e) => handleClick(e, item.href)}
        className="group relative flex items-center justify-center p-1"
        aria-label={`Go to ${item.name}`}
      >
        <motion.div
          className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 sm:h-12 sm:w-12"
          style={{
            background: active ? ACCENT : 'var(--app-surface)',
            boxShadow: active
              ? `inset 2px 2px 4px rgba(0,0,0,0.25), inset -1px -1px 2px rgba(255,255,255,0.1), 0 0 12px rgba(0,155,242,0.3)`
              : `4px 4px 8px var(--app-shadow-dark), -4px -4px 8px var(--app-shadow-light), 0 0 0 1px var(--app-border)`,
          }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{
            scale: 0.92,
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              color: active ? '#fff' : ACCENT,
              filter: active ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none',
            }}
          >
            <Icon className="h-[20px] w-[20px] sm:h-[22px] sm:w-[22px]" />
          </span>
        </motion.div>
      </Link>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 px-3"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="relative mx-auto max-w-lg">
        {/* Shadow wrapper — drop-shadow follows the masked notch shape */}
        <div
          style={{
            filter:
              'drop-shadow(0 -4px 10px rgba(0,0,0,0.4)) drop-shadow(0 0 1px rgba(255,255,255,0.05))',
          }}
        >
          {/* Single continuous bar with circular notch mask */}
          <div
            style={{
              height: 66,
              background: BAR_BG,
              borderRadius: '20px 20px 8px 8px',
              WebkitMask: NOTCH_MASK,
              mask: NOTCH_MASK,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex h-full items-center px-3 sm:px-4">
              <div className="flex flex-1 justify-around">
                {NAV_ITEMS.slice(0, 2).map(renderNavItem)}
              </div>
              <div className="w-[84px] flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-1 justify-around">
                {NAV_ITEMS.slice(2, 4).map(renderNavItem)}
              </div>
            </div>
          </div>
        </div>

        {/* Floating center button — sits inside the notch */}
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2"
          style={{ top: -16 }}
        >
          <Link
            href="/dashboard"
            onClick={(e) => {
              if (pathname === '/dashboard') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="relative block focus-visible:ring-2 focus-visible:ring-[#009BF2]/50 focus:outline-none"
            aria-label="Go to dashboard"
          >
            <motion.div
              className="relative h-[62px] w-[62px] sm:h-[68px] sm:w-[68px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="absolute inset-[-8px]"
                style={{
                  backgroundColor: ACCENT,
                  maskImage: 'url(/icons/novunt_short.png)',
                  WebkitMaskImage: 'url(/icons/novunt_short.png)',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  animation: 'spin 8s linear infinite',
                }}
              />
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
