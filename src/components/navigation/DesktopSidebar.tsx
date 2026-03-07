'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, HelpCircle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const ICON_EXTRUDE =
  'drop-shadow(2px 2px 4px var(--neu-shadow-dark)) drop-shadow(-2px -2px 4px var(--neu-shadow-light))';
const ICON_EXTRUDE_ACTIVE =
  'drop-shadow(2px 2px 4px var(--neu-shadow-dark)) drop-shadow(-2px -2px 4px var(--neu-shadow-light)) drop-shadow(0 0 10px rgba(var(--neu-accent-rgb), 0.3))';

const NAV_ITEMS: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  modalId?: string;
}[] = [
  { name: 'Dashboard', href: '/dashboard', icon: () => null }, // placeholder, rendered separately as logo
  { name: 'Stake', href: '/dashboard/stakes', icon: TrendingUp },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'NXP', href: '/dashboard/achievements', icon: Star },
  {
    name: 'Knowledge base',
    href: '/dashboard/knowledge-base',
    icon: HelpCircle,
  },
];

export function DesktopSidebar() {
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

  return (
    <aside
      className="desktop-sidebar fixed top-0 bottom-0 left-0 z-40 hidden w-[72px] flex-col items-center py-4 lg:flex"
      style={{
        background: 'var(--neu-bg)',
        borderRight: '1px solid var(--neu-border)',
        boxShadow:
          '4px 0 16px var(--neu-shadow-dark), -2px 0 8px var(--neu-shadow-light)',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
      }}
    >
      {/* Logo / Dashboard link */}
      <Link
        href="/dashboard"
        onClick={(e) => handleClick(e, '/dashboard')}
        className="mb-6 flex h-[48px] w-[48px] items-center justify-center"
        aria-label="Go to dashboard"
      >
        <motion.div
          className="relative h-[42px] w-[42px]"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: 360 }}
          transition={{
            rotate: { repeat: Infinity, duration: 8, ease: 'linear' },
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: isActive('/dashboard', NAV_ITEMS[0])
                ? 'var(--neu-accent)'
                : 'var(--nav-inactive-icon)',
              maskImage: 'url(/icons/novunt_short.png)',
              WebkitMaskImage: 'url(/icons/novunt_short.png)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
          />
        </motion.div>
      </Link>

      {/* Divider */}
      <div
        className="mx-auto mb-4 h-px w-10"
        style={{ background: 'var(--neu-border)' }}
      />

      {/* Nav items */}
      <nav
        className="flex flex-1 flex-col items-center gap-5"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.slice(1).map((item) => {
          const active = isActive(item.href, item);
          const Icon = item.icon;

          const content = (
            <motion.div
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active ? 'is-active' : ''
              }`}
              style={{
                background: active
                  ? 'rgba(var(--neu-accent-rgb), 0.12)'
                  : 'transparent',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="icon-wrapper flex items-center justify-center">
                <Icon className="h-7 w-7" />
              </span>
              {/* Tooltip */}
              <span
                className="pointer-events-none absolute left-full ml-3 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: 'var(--neu-bg)',
                  color: 'var(--neu-text-primary)',
                  border: '1px solid var(--neu-border)',
                  boxShadow: '0 2px 8px var(--neu-shadow-dark)',
                }}
              >
                {item.name}
              </span>
            </motion.div>
          );

          if (item.modalId) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => openModal(item.modalId!)}
                aria-label={`Open ${item.name}`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              aria-label={`Go to ${item.name}`}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
