'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Users, Award, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

// Navigation items in order: Achievements, Wallets, Stakes, Team, Pools, Knowledge Base
// Dashboard is in the center as logo
// Distribution: Left (3) - Center (Logo) - Right (3)
const navigation: NavItem[] = [
  {
    name: 'Achievements',
    href: '/dashboard/achievements',
    icon: Award,
    iconColor: 'from-amber-500 to-yellow-600',
  },
  {
    name: 'Wallets',
    href: '/dashboard/wallets',
    icon: Wallet,
    iconColor: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Stakes',
    href: '/dashboard/stakes',
    icon: TrendingUp,
    iconColor: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    iconColor: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Knowledge Base',
    href: '/dashboard/knowledge-base',
    icon: FileText,
    iconColor: 'from-indigo-500 to-blue-600',
  },
];

// Chat item removed - will be a floating button on the right side

// Premium Icon Component with 3D/Glassmorphism effect
function PremiumIcon({
  Icon,
  isActive,
  iconColor = 'from-indigo-500 to-purple-600',
  className,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  iconColor?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'transition-all duration-300',
        isActive && 'scale-110',
        className
      )}
    >
      {/* Outer glow effect - only when active */}
      {isActive && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl opacity-50 blur-xl sm:rounded-2xl',
            `bg-gradient-to-br ${iconColor}`
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Icon container - no border, icon fills container - mobile first */}
      <div
        className={cn(
          'relative flex items-center justify-center transition-all duration-300',
          // Size matches icon size - mobile first
          'h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10',
          // Transform for 3D tilt effect when active
          isActive && 'rotate-[-2deg]'
        )}
      >
        {/* Outer glow effect - only when active */}
        {isActive && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-lg opacity-50 blur-xl sm:rounded-xl md:rounded-2xl',
              `bg-gradient-to-br ${iconColor}`
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Icon - larger size, fills container - mobile first sizing */}
        <div className="relative z-10 flex items-center justify-center">
          <Icon
            className={cn(
              'h-full w-full transition-all duration-300',
              isActive
                ? 'text-indigo-500 drop-shadow-lg dark:text-indigo-400'
                : 'text-gray-700 dark:text-white'
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

export function HorizontalNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 flex w-full items-center justify-center overflow-visible rounded-t-2xl border-t border-white/20 bg-gradient-to-t from-white/10 via-white/5 to-white/2 shadow-2xl backdrop-blur-2xl sm:rounded-t-3xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/2"
      role="navigation"
      aria-label="Main navigation"
      aria-orientation="horizontal"
    >
      {/* Navigation container - mobile first sizing with evenly spaced items */}
      <div className="relative flex h-16 w-full items-center overflow-visible px-1 sm:h-20 sm:px-2 md:h-24 md:px-4 lg:px-6">
        {/* All navigation items in a single evenly-spaced container */}
        <div className="flex w-full items-center justify-evenly">
          {/* Left Navigation Items: Achievements, Wallets, Stakes (3 items) */}
          {navigation.slice(0, 3).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={cn(
                  'group relative flex shrink-0 items-center justify-center transition-all duration-300',
                  'focus-visible:ring-primary rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  active ? 'scale-110' : 'hover:scale-105 active:scale-95'
                )}
                aria-label={`Navigate to ${item.name}`}
              >
                <PremiumIcon
                  Icon={item.icon}
                  isActive={active}
                  iconColor={item.iconColor}
                />
              </Link>
            );
          })}

          {/* Right Navigation Items: Team, Pools, Knowledge Base (3 items) */}
          {navigation.slice(3).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={cn(
                  'group relative flex shrink-0 items-center justify-center transition-all duration-300',
                  'focus-visible:ring-primary rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  active ? 'scale-110' : 'hover:scale-105 active:scale-95'
                )}
                aria-label={`Navigate to ${item.name}`}
              >
                <PremiumIcon
                  Icon={item.icon}
                  isActive={active}
                  iconColor={item.iconColor}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
