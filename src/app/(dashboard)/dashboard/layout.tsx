'use client';
// Force Vercel rebuild - All linting errors fixed (commit cc93df0)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  FileText,
  Gift,
  Shield,
  Fingerprint,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useDashboardOverview } from '@/lib/queries';
import { Avatar } from '@/components/ui/avatar';
import { getUserAvatarUrl } from '@/lib/avatar-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DashboardGuard } from '@/components/auth/DashboardGuard';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { NotificationsModal } from '@/components/settings/NotificationsModal';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { TwoFactorModal } from '@/components/settings/TwoFactorModal';
import { BiometricModal } from '@/components/settings/BiometricModal';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useUIStore } from '@/store/uiStore';
import { CreateStakeModal } from '@/components/stake/CreateStakeModal';
import { DepositModal } from '@/components/wallet/modals/DepositModal';
import { WithdrawModal } from '@/components/wallet/modals/WithdrawModal';
import { TransferModal } from '@/components/wallet/modals/TransferModal';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Wallets', href: '/dashboard/wallets', icon: Wallet },
  { name: 'Stakes', href: '/dashboard/stakes', icon: TrendingUp },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Pools', href: '/dashboard/pools', icon: Gift },
];

/**
 * Dashboard Layout
 * Persistent layout for all dashboard pages with sidebar navigation
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isModalOpen, closeModal } = useUIStore();

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Listen for profile modal open event from registration bonus components
  useEffect(() => {
    const handleOpenProfileModal = () => {
      setProfileModalOpen(true);
    };

    window.addEventListener('openProfileModal', handleOpenProfileModal);
    return () => {
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { user } = useUser();
  const { data: overview } = useDashboardOverview();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get weekly profit percentage
  const overviewData = overview as
    | { analytics?: { lastWeekProfit?: number; lastWeekProfitChange?: number } }
    | undefined;
  const lastWeekProfitChange =
    overviewData?.analytics?.lastWeekProfitChange ?? 0;
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Check if route is active
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <DashboardGuard>
      <div className="bg-background min-h-screen">
        {/* Mobile sidebar backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/30 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-out lg:translate-x-0 dark:border-white/10 dark:bg-gray-900/80 dark:shadow-black/20 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-white/20 px-4 dark:border-white/10">
              <Link href="/dashboard" className="group flex items-center gap-2">
                <span className="text-foreground text-3xl leading-none font-black tracking-tight">
                  NOVUNT
                </span>
                <div className="relative h-12 w-12 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src="/icons/novunt_short.png"
                    alt="Novunt Logo"
                    fill
                    className="object-contain invert dark:invert-0"
                  />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`relative flex touch-manipulation items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                      active
                        ? 'from-primary to-primary/90 text-primary-foreground shadow-primary/30 bg-gradient-to-r shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 hover:shadow-md hover:backdrop-blur-sm dark:hover:bg-gray-800/50'
                    } `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 px-1 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User profile card */}
            <div className="border-t border-white/20 p-4 dark:border-white/10">
              <div className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/40 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/60 dark:border-white/10 dark:bg-gray-800/40 dark:hover:bg-gray-800/60">
                <Avatar className="h-10 w-10">
                  <img
                    src={getUserAvatarUrl(user) || ''}
                    alt={user?.firstName || 'User'}
                    className="h-full w-full rounded-full object-cover"
                  />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </p>
                  {/* Weekly Profit Percentage - Strategically Placed on Profile Card */}
                  {lastWeekProfitChange !== 0 && (
                    <div
                      className={`mt-1.5 flex items-center gap-1 ${
                        lastWeekProfitChange >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {lastWeekProfitChange >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="text-xs font-semibold">
                        {lastWeekProfitChange >= 0 ? '+' : ''}
                        {lastWeekProfitChange.toFixed(2)}% this week
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 border-b border-white/30 bg-white/80 shadow-sm shadow-black/5 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-gray-900/80 dark:shadow-black/10">
            <div className="flex h-full items-center justify-between px-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Page title - hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    'Dashboard'}
                </h1>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </Button>

                {/* Notifications */}
                <NotificationCenter />

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full p-0"
                    >
                      <Avatar className="h-10 w-10">
                        <img
                          src={getUserAvatarUrl(user) || ''}
                          alt={user?.firstName || 'User'}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setNotificationsModalOpen(true)}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          2FA Auth
                        </div>
                        <Switch
                          checked={twoFactorEnabled}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTwoFactorModalOpen(true);
                            } else {
                              setTwoFactorEnabled(false);
                              toast.success(
                                'Two-Factor Authentication disabled'
                              );
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <Fingerprint className="mr-2 h-4 w-4" />
                          Biometric Auth
                        </div>
                        <Switch
                          checked={biometricEnabled}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBiometricModalOpen(true);
                            } else {
                              setBiometricEnabled(false);
                              toast.success(
                                'Biometric Authentication disabled'
                              );
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>

        {/* Modals */}
        <ProfileEditModal
          open={profileModalOpen}
          onOpenChange={(open) => {
            setProfileModalOpen(open);
            // Refetch registration bonus when modal closes to update progress
            if (!open) {
              // Small delay to ensure profile update mutation completes
              setTimeout(() => {
                window.dispatchEvent(
                  new CustomEvent('refetchRegistrationBonus')
                );
              }, 500);
            }
          }}
        />
        <NotificationsModal
          open={notificationsModalOpen}
          onOpenChange={setNotificationsModalOpen}
        />
        <TwoFactorModal
          open={twoFactorModalOpen}
          onOpenChange={setTwoFactorModalOpen}
          onEnable={() => setTwoFactorEnabled(true)}
        />
        <BiometricModal
          open={biometricModalOpen}
          onOpenChange={setBiometricModalOpen}
          onEnable={() => setBiometricEnabled(true)}
        />

        {/* Global Wallet Modals */}
        <CreateStakeModal />

        <DepositModal
          isOpen={isModalOpen('deposit')}
          onClose={() => closeModal('deposit')}
        />
        <WithdrawModal
          isOpen={isModalOpen('withdraw')}
          onClose={() => closeModal('withdraw')}
        />
        <TransferModal
          isOpen={isModalOpen('transfer')}
          onClose={() => closeModal('transfer')}
        />
      </div>
    </DashboardGuard>
  );
}
