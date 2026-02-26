'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Users, Star } from 'lucide-react';

const ACCENT = '#009BF2'; /* platform light blue */

/* Bar: light blue container (full fill) */
const BAR_GLASS_BG = 'rgba(0, 155, 242, 0.4)';
const BAR_GLASS_BLUR = 'blur(12px)';
const BAR_GLASS_BORDER = '2px solid rgba(0, 155, 242, 0.6)';
const BAR_NEU_SHADOW =
  '0 -4px 20px rgba(0, 155, 242, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)';

/* Icon extrude: neumorphic drop-shadows so icon looks raised */
const ICON_EXTRUDE =
  'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.5)) drop-shadow(-2px -2px 6px rgba(255, 255, 255, 0.08))';
const ICON_EXTRUDE_ACTIVE =
  'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.5)) drop-shadow(-2px -2px 6px rgba(255, 255, 255, 0.12)) drop-shadow(0 0 12px rgba(0, 155, 242, 0.5))';

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
        <motion.span
          className="flex items-center justify-center transition-colors duration-200"
          style={{
            color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.82)',
            filter: active ? ICON_EXTRUDE_ACTIVE : ICON_EXTRUDE,
          }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </motion.span>
      </Link>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed right-0 bottom-0 left-0 z-50 w-full"
    >
      <div className="relative w-full">
        {/* Shadow wrapper — drop-shadow follows the masked notch shape */}
        <div
          style={{
            filter:
              'drop-shadow(0 -4px 10px rgba(0,0,0,0.4)) drop-shadow(0 0 1px rgba(255,255,255,0.05))',
          }}
        >
          {/* Bar — glassy; height includes safe area, content centered vertically */}
          <div
            style={{
              minHeight: 'calc(66px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: BAR_GLASS_BG,
              backdropFilter: BAR_GLASS_BLUR,
              WebkitBackdropFilter: BAR_GLASS_BLUR,
              borderRadius: '20px 20px 0 0',
              WebkitMask: NOTCH_MASK,
              mask: NOTCH_MASK,
              boxShadow: BAR_NEU_SHADOW,
              border: BAR_GLASS_BORDER,
            }}
          >
            <div className="flex w-full items-center px-3 sm:px-4">
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
            className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#009BF2]/50"
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
