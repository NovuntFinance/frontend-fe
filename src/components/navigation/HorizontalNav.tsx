'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Users,
  Gift,
  Award,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

// Navigation items in order: Achievements, Wallets, Stakes, Team, Pools
// Dashboard is in the center as logo
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
    name: 'Pools',
    href: '/dashboard/pools',
    icon: Gift,
    iconColor: 'from-amber-500 to-orange-600',
  },
];

// Chat item (separate, opens chat widget/modal)
const chatItem: NavItem = {
  name: 'NovuntAI Chat',
  href: '#', // Will be handled by onClick
  icon: HelpCircle,
  iconColor: 'from-cyan-500 to-blue-600',
};

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

      {/* Glassmorphism container with 3D effect */}
      <div
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl',
          'border backdrop-blur-2xl transition-all duration-300',
          'shadow-lg',
          // Enhanced glassmorphism base - more transparent
          isActive
            ? 'border-white/25 bg-white/15 dark:border-white/15 dark:bg-white/8'
            : 'border-white/15 bg-white/8 dark:border-white/8 dark:bg-white/4',
          // Enhanced 3D depth effect with stronger glass
          isActive
            ? 'shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(255,255,255,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.05)]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(255,255,255,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.03)]',
          // Transform for 3D tilt effect
          isActive && 'rotate-[-2deg]'
        )}
      >
        {/* Inner gradient overlay when active */}
        {isActive && (
          <div
            className={cn(
              'absolute inset-0 rounded-xl opacity-20 sm:rounded-2xl',
              `bg-gradient-to-br ${iconColor}`
            )}
          />
        )}

        {/* Icon with gradient text - ensure visibility */}
        <div className="relative z-10 flex items-center justify-center">
          {isActive ? (
            <Icon
              className={cn(
                'h-4 w-4 transition-all duration-300 sm:h-6 sm:w-6',
                `bg-gradient-to-br bg-clip-text text-transparent ${iconColor} drop-shadow-lg`
              )}
              aria-hidden="true"
            />
          ) : (
            <Icon
              className="h-4 w-4 text-gray-700 transition-all duration-300 sm:h-6 sm:w-6 dark:text-white"
              aria-hidden="true"
            />
          )}
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

  const handleClick = (e: React.MouseEvent, href: string, name: string) => {
    if (name === 'NovuntAI Chat') {
      e.preventDefault();
      // Trigger chat widget/modal - you can customize this
      const chatEvent = new CustomEvent('openChat');
      window.dispatchEvent(chatEvent);
      return;
    }

    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed bottom-2 left-1/2 z-50 mx-1 flex max-w-[calc(100vw-0.5rem)] -translate-x-1/2 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-t from-white/10 via-white/5 to-white/2 shadow-2xl backdrop-blur-2xl sm:mx-2 dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/2"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 w-full items-center justify-evenly overflow-hidden px-3 sm:h-20 sm:px-6 md:px-8 lg:px-10">
        {/* Left Navigation Items: Achievements, Wallets, Stakes */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-6 md:gap-8">
          {navigation.slice(0, 3).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item.href, item.name)}
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

        {/* Center Logo - Dashboard (Always Visible) */}
        <div className="mx-2 flex-shrink-0 sm:mx-8">
          <Link
            href="/dashboard"
            onClick={(e) => handleClick(e, '/dashboard', 'Dashboard')}
            className={cn(
              'group relative flex items-center justify-center transition-all duration-300',
              'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none',
              'hover:scale-105 active:scale-95'
            )}
            aria-label="Navigate to Dashboard"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur-xl dark:opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Ring highlight */}
            <motion.div
              className="border-primary/50 absolute -inset-1 rounded-full border-2 dark:border-indigo-400/50"
              animate={{
                borderColor: [
                  'rgba(129, 140, 248, 0.5)',
                  'rgba(168, 85, 247, 0.5)',
                  'rgba(236, 72, 153, 0.5)',
                  'rgba(129, 140, 248, 0.5)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Premium Logo Container with Enhanced Glassmorphism - Smaller on mobile */}
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/25 bg-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:h-20 sm:w-20 md:h-[6.5rem] md:w-[6.5rem] dark:border-white/15 dark:bg-white/6 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.05)]">
              <div className="relative h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16">
                <Image
                  src="/icons/novunt_short.png"
                  alt="Novunt Logo"
                  fill
                  className="object-contain brightness-0 dark:brightness-0 dark:invert"
                  priority
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Right Navigation Items: Team, Pools, Chat */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-6 md:gap-8">
          {navigation.slice(3).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(e, item.href, item.name)}
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

          {/* Chat Icon - NovuntAI */}
          <Link
            href="#"
            onClick={(e) => handleClick(e, '#', chatItem.name)}
            className={cn(
              'group relative flex shrink-0 items-center justify-center transition-all duration-300',
              'focus-visible:ring-primary rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              'hover:scale-105 active:scale-95'
            )}
            aria-label={chatItem.name}
          >
            <PremiumIcon
              Icon={chatItem.icon}
              isActive={false}
              iconColor={chatItem.iconColor}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
