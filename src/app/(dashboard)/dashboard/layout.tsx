'use client';
// Force Vercel rebuild - All linting errors fixed (commit cc93df0)

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Clock, Wallet, Bell, LogOut, User } from 'lucide-react';
import { useRegistrationBonusStatus } from '@/lib/queries/registrationBonusQueries';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useDashboardOverview } from '@/lib/queries';
import { useDisable2FA } from '@/lib/mutations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeAvatar } from '@/components/ui/BadgeAvatar';
import { getUserAvatarUrl, isBadgeIcon } from '@/lib/avatar-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardGuard } from '@/components/auth/DashboardGuard';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { NotificationsModal } from '@/components/settings/NotificationsModal';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { DateFilteredNotificationList } from '@/components/notifications/DateFilteredNotificationList';
import { TwoFactorModal } from '@/components/settings/TwoFactorModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { CreateStakeModal } from '@/components/stake/CreateStakeModal';
import { DepositModal } from '@/components/wallet/modals/DepositModal';
import { WithdrawModal } from '@/components/wallet/modals/WithdrawModal';
import { TransferModal } from '@/components/wallet/modals/TransferModal';
import { WalletModal } from '@/components/wallet/WalletModal';
import { RegistrationBonusModal } from '@/components/registration-bonus/RegistrationBonusModal';
import { HorizontalNav } from '@/components/navigation/HorizontalNav';
import { NovuntAssistant } from '@/components/assistant/NovuntAssistant';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import neuStyles from '@/styles/neumorphic.module.css';

/** Theme toggle for dashboard header */
function DashboardThemeToggle({
  neuStyles: ns,
}: {
  neuStyles: Record<string, string>;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === 'dark';
  if (!mounted) {
    return (
      <div
        className={`h-10 w-10 shrink-0 rounded-full sm:h-11 sm:w-11 ${ns['neu-icon-button']}`}
        aria-hidden
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${ns['neu-icon-button']} ${ns['neu-icon-button-accent-default']}`}
      style={{ filter: 'none' }}
      aria-label="Toggle theme"
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}

/**
 * Dashboard Layout
 * Persistent layout for all dashboard pages with horizontal top navigation
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
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'system'>(
    'all'
  );
  const [assistantOpen, setAssistantOpen] = useState(false);

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

  // Listen for assistant open event (e.g. from featured Support button on dashboard)
  useEffect(() => {
    const handleOpenAssistant = () => setAssistantOpen(true);
    window.addEventListener('openAssistant', handleOpenAssistant);
    return () =>
      window.removeEventListener('openAssistant', handleOpenAssistant);
  }, []);

  // Listen for 2FA modal open event from registration bonus components
  useEffect(() => {
    const handleOpenTwoFactorModal = () => {
      setTwoFactorModalOpen(true);
    };

    window.addEventListener('openTwoFactorModal', handleOpenTwoFactorModal);
    return () => {
      window.removeEventListener(
        'openTwoFactorModal',
        handleOpenTwoFactorModal
      );
    };
  }, []);
  const { logout } = useAuth();
  const { user } = useUser();
  const displayName = user?.firstName || user?.fname || 'User';
  const { data: overview } = useDashboardOverview();
  const { data: bonusResponse } = useRegistrationBonusStatus();

  const bonusData = bonusResponse?.data;
  const progress = bonusData?.progressPercentage || 0;
  const _isLocked = progress < 60;
  const isOnboardingPage = pathname === '/dashboard/onboarding';

  // Get weekly profit percentage
  const overviewData = overview as
    | { analytics?: { lastWeekProfit?: number; lastWeekProfitChange?: number } }
    | undefined;
  const _lastWeekProfitChange =
    overviewData?.analytics?.lastWeekProfitChange ?? 0;
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  // Initialize twoFactorEnabled from user's actual 2FA status
  const [_twoFactorEnabled, setTwoFactorEnabled] = useState(
    () => user?.twoFAEnabled || false
  );

  // 2FA disable mutation
  const _disable2FAMutation = useDisable2FA();

  // Sync twoFactorEnabled with user's 2FA status from backend
  useEffect(() => {
    setTwoFactorEnabled(user?.twoFAEnabled || false);
  }, [user?.twoFAEnabled]);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <DashboardGuard>
      <div
        className="dashboard-layout flex h-[100dvh] max-h-[100dvh] min-h-screen flex-col overflow-hidden"
        style={{
          background: 'var(--neu-bg)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Header: fixed, always visible; insets so it doesn't sit under notch/status bar on real devices */}
        <div
          className="fixed right-0 left-0 z-30"
          style={{
            top: '0',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          <header
            className="shrink-0 py-3 transition-shadow duration-200"
            style={{
              background: 'var(--neu-bg)',
              borderBottom: '1px solid var(--neu-border)',
              boxShadow: 'var(--neu-shadow-raised)',
              paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
            }}
          >
            <div className="flex flex-shrink-0 items-center justify-between gap-4 px-3 pr-4 sm:px-4">
              {/* Profile Section - Left side */}
              <div className="flex shrink-0 items-center gap-3">
                <DropdownMenu
                  open={profileDropdownOpen}
                  onOpenChange={setProfileDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 rounded-full px-2 py-1.5 transition-all">
                      <div className="relative shrink-0">
                        <div
                          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full"
                          style={{
                            background: 'rgba(var(--neu-accent-rgb), 0.15)',
                            border: '1px solid var(--neu-border)',
                            boxShadow:
                              'inset 2px 2px 6px var(--neu-shadow-dark), inset -2px -2px 6px var(--neu-shadow-light)',
                          }}
                        >
                          {user?.avatar && isBadgeIcon(user.avatar) ? (
                            <BadgeAvatar
                              badgeIcon={user.avatar}
                              size="md"
                              className="shrink-0"
                            />
                          ) : (
                            <Avatar className="h-full w-full overflow-hidden rounded-full">
                              <AvatarImage
                                src={getUserAvatarUrl(user) ?? undefined}
                                alt={`${displayName}`}
                              />
                              <AvatarFallback
                                className="text-sm font-medium"
                                style={{
                                  background: 'transparent',
                                  color: 'var(--neu-text-primary)',
                                }}
                              >
                                {displayName[0]?.toUpperCase()}
                                {user?.lastName?.[0] || user?.lname?.[0] || ''}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <NotificationBadge className="-top-0.5 right-0" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: 'var(--neu-text-primary)',
                            filter: 'none',
                          }}
                        >
                          Hello, {displayName}.
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 border p-2"
                    style={{
                      background: 'var(--neu-bg)',
                      borderColor: 'var(--neu-border)',
                      boxShadow: 'var(--neu-shadow-raised)',
                    }}
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="cursor-pointer rounded-md focus:bg-[rgba(var(--neu-accent-rgb),0.15)]"
                      style={{
                        color: 'var(--neu-text-primary)',
                        filter: 'none',
                      }}
                    >
                      <User
                        className="mr-2 h-4 w-4"
                        style={{
                          color: 'var(--neu-text-primary)',
                          filter: 'none',
                        }}
                      />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setTimeout(() => {
                          setNotificationCenterOpen(true);
                        }, 100);
                      }}
                      className="relative cursor-pointer rounded-md focus:bg-[rgba(var(--neu-accent-rgb),0.15)]"
                      style={{
                        color: 'var(--neu-text-primary)',
                        filter: 'none',
                      }}
                    >
                      <Bell
                        className="mr-2 h-4 w-4"
                        style={{
                          color: 'var(--neu-text-primary)',
                          filter: 'none',
                        }}
                      />
                      <span className="flex-1">Notifications</span>
                      <NotificationBadge className="!static !h-5 !min-w-[20px] !px-1.5" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator
                      className="my-1"
                      style={{ background: 'var(--neu-border)' }}
                    />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-md focus:bg-red-500/15"
                      style={{
                        color: '#f87171',
                      }}
                    >
                      <LogOut
                        className="mr-2 h-4 w-4"
                        style={{ color: 'inherit' }}
                      />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Theme toggle - Right side */}
              <div className="flex shrink-0 items-center gap-2">
                <DashboardThemeToggle neuStyles={neuStyles} />
              </div>
            </div>

            {/* Notification Center Dropdown - positioned at top-right, controlled via state */}
            <DropdownMenu
              open={notificationCenterOpen}
              onOpenChange={setNotificationCenterOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="pointer-events-none absolute top-1/2 right-4 h-0 w-0 -translate-y-1/2 opacity-0"
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="flex h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden p-0 sm:h-[600px] sm:w-[420px]"
                sideOffset={8}
              >
                {/* Fixed Header */}
                <div className="flex shrink-0 items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3">
                  <h3 className="text-sm font-semibold sm:text-base">
                    Notifications
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                {/* Scrollable Content Area */}
                <Tabs
                  value={notificationTab}
                  onValueChange={(value) =>
                    setNotificationTab(value as 'all' | 'system')
                  }
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <TabsList className="w-full shrink-0 justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:border-primary shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs sm:px-4 sm:text-sm"
                    >
                      <span className="whitespace-nowrap">
                        All Notifications
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="system"
                      className="data-[state=active]:border-primary shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs sm:px-4 sm:text-sm"
                    >
                      <span className="whitespace-nowrap">System & Alerts</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="all"
                    className="m-0 min-h-0 flex-1 overflow-hidden"
                  >
                    <DateFilteredNotificationList
                      dateFilter="all"
                      maxHeight="100%"
                      showHeader={false}
                      className="h-full"
                    />
                  </TabsContent>

                  <TabsContent
                    value="system"
                    className="m-0 min-h-0 flex-1 overflow-hidden"
                  >
                    <DateFilteredNotificationList
                      includeTypes={[
                        'system',
                        'security',
                        'alert',
                        'bonus',
                        'referral',
                        'info',
                      ]}
                      dateFilter="all"
                      maxHeight="100%"
                      showHeader={false}
                      className="h-full"
                    />
                  </TabsContent>
                </Tabs>

                {/* Fixed Footer */}
                <div className="bg-background shrink-0 border-t p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sm"
                    onClick={() => {
                      setNotificationCenterOpen(false);
                      router.push('/dashboard/notifications');
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
        </div>

        {/* Spacer so content starts below fixed header (match header top offset) */}
        <div
          aria-hidden="true"
          className="shrink-0"
          style={{
            minHeight: 'calc(5rem + env(safe-area-inset-top, 0px))',
          }}
        />

        {/* Wallet Setup Banner (40% <= Progress < 60%) - only when not on onboarding */}
        {!isOnboardingPage && progress >= 40 && progress < 60 && (
          <div className="dashboard-page-container py-4">
            <div className="group relative flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-xl transition-all hover:bg-amber-500/15 sm:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-500">
                    WALLET SETUP REQUIRED
                  </h4>
                  <p className="text-xs text-amber-400/80">
                    Whitelist your BEP20 withdrawal address to unlock transfers
                    & withdrawals.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => router.push('/dashboard/onboarding')}
                className="w-full rounded-xl bg-amber-500 font-bold text-slate-900 hover:bg-amber-600 sm:w-auto"
              >
                Whitelist
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Page content - scrolls here so bottom nav does not block; generous bottom padding so last item is never under nav on real devices */}
        <main
          id="main-content"
          className="dashboard-main-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pt-6 sm:pt-6 md:pt-8 lg:pt-8"
          style={{
            paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 12px))',
          }}
        >
          <div className="dashboard-page-container">{children}</div>
        </main>

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
          onEnable={() => {
            setTwoFactorEnabled(true);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('refetchRegistrationBonus'));
            }, 500);
          }}
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
        <WalletModal
          isOpen={isModalOpen('wallet')}
          onClose={() => closeModal('wallet')}
        />
        <RegistrationBonusModal
          isOpen={isModalOpen('registration-bonus')}
          onClose={() => closeModal('registration-bonus')}
        />

        {/* Customer Support Assistant Modal */}
        <NovuntAssistant
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
        />

        {/* Bottom navigation — Stake, Wallet, Dashboard (logo), Team, NXP */}
        <HorizontalNav />
      </div>
    </DashboardGuard>
  );
}
