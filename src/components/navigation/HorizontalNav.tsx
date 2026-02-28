'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, HelpCircle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

/* Bar and icon use theme tokens from globals.css (--neu-*) */
const BAR_NEU_SHADOW =
  '0 -8px 16px var(--neu-shadow-dark), 0 8px 16px var(--neu-shadow-light), inset 0 -1px 0 var(--neu-shadow-light)';
const BAR_NEU_SHADOW_HOVER =
  '0 -10px 20px var(--neu-shadow-dark), 0 10px 20px var(--neu-shadow-light), inset 0 -1px 0 var(--neu-shadow-light)';
const ICON_EXTRUDE =
  'drop-shadow(2px 2px 4px var(--neu-shadow-dark)) drop-shadow(-2px -2px 4px var(--neu-shadow-light))';
const ICON_EXTRUDE_ACTIVE =
  'drop-shadow(2px 2px 4px var(--neu-shadow-dark)) drop-shadow(-2px -2px 4px var(--neu-shadow-light)) drop-shadow(0 0 10px rgba(var(--neu-accent-rgb), 0.3))';

const NAV_ITEMS: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  /** If set, opens this modal instead of navigating to href */
  modalId?: string;
}[] = [
  { name: 'Stake', href: '/dashboard/stakes', icon: TrendingUp },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'NXP', href: '/dashboard/achievements', icon: Star },
  {
    name: 'Knowledge base',
    href: '/dashboard/knowledge-base',
    icon: HelpCircle,
  },
];

const NOTCH_MASK =
  'radial-gradient(circle at 50% 16px, transparent 42px, black 44px)';

interface HorizontalNavProps {
  barsVisible?: boolean;
}

export function HorizontalNav({ barsVisible = true }: HorizontalNavProps) {
  const pathname = usePathname();
  const openModal = useUIStore((s) => s.openModal);
  const isModalOpen = useUIStore((s) => s.isModalOpen);

  const isActive = (href: string, item: (typeof NAV_ITEMS)[0]) => {
    if (item.modalId) return isModalOpen(item.modalId);
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
    const active = isActive(item.href, item);
    const Icon = item.icon;
    if (item.modalId) {
      return (
        <button
          key={item.name}
          type="button"
          onClick={() => openModal(item.modalId!)}
          className="group relative flex items-center justify-center p-1"
          aria-label={`Open ${item.name}`}
        >
          <motion.span
            className="flex items-center justify-center transition-colors duration-200"
            style={{
              color: active ? 'var(--neu-accent)' : 'var(--nav-inactive-icon)',
              filter: active ? ICON_EXTRUDE_ACTIVE : ICON_EXTRUDE,
            }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </motion.span>
        </button>
      );
    }
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
            color: active ? 'var(--neu-accent)' : 'var(--nav-inactive-icon)',
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
      className="horizontal-nav fixed right-0 bottom-0 left-0 z-50 w-full transition-transform duration-150 ease-out"
      style={{
        transform: barsVisible ? 'translateY(0)' : 'translateY(100%)',
      }}
    >
      <div className="relative w-full">
        {/* Shadow wrapper — soft drop-shadow follows the masked notch */}
        <div
          style={{
            filter: 'drop-shadow(0 -4px 12px rgba(0,0,0,0.35))',
          }}
        >
          {/* Bar — neumorphic raised (design system: dual shadow + subtle border) */}
          <div
            className="transition-shadow duration-200"
            style={{
              minHeight: 'calc(66px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--neu-bg)',
              border: 'none',
              borderTop: '1px solid var(--neu-border)',
              borderRadius: '20px 20px 0 0',
              WebkitMask: NOTCH_MASK,
              mask: NOTCH_MASK,
              boxShadow: BAR_NEU_SHADOW,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = BAR_NEU_SHADOW_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = BAR_NEU_SHADOW;
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
            className="focus-visible:ring-opacity-50 relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)]"
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
                  backgroundColor: 'var(--neu-accent)',
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
