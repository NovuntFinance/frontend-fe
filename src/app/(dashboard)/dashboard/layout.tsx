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
import { RegistrationBonusModal } from '@/components/registration-bonus/RegistrationBonusModal';
import { HorizontalNav } from '@/components/navigation/HorizontalNav';
import { NovuntAssistant } from '@/components/assistant/NovuntAssistant';
import { IoHeadsetOutline } from 'react-icons/io5';
import neuStyles from '@/styles/neumorphic.module.css';

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
        className="flex min-h-full flex-col lg:h-full"
        style={{
          background: '#0d162c',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Header: light blue container; sticky top uses safe-area so PWA/notch doesn't clip */}
        <header
          className="sticky z-30 shrink-0 py-2"
          style={{
            top: 'env(safe-area-inset-top, 0px)',
            background: 'rgba(0, 155, 242, 0.4)',
            borderTop: '2px solid rgba(0, 155, 242, 0.6)',
            borderBottom: '2px solid rgba(0, 155, 242, 0.6)',
            boxShadow:
              '0 4px 20px rgba(0, 155, 242, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex flex-shrink-0 items-center justify-between gap-4 px-3 pr-16 sm:pr-20">
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
                          background: 'rgba(13, 22, 44, 0.35)',
                          border: '1px solid rgba(13, 22, 44, 0.55)',
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
                                color: 'rgba(255, 255, 255, 0.95)',
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
                    <div className="flex flex-col items-start gap-0.5">
                      <span
                        className="text-sm font-medium"
                        style={{ color: '#0D162C', filter: 'none' }}
                      >
                        Hello, {displayName}.
                      </span>
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                        style={{
                          background: '#0D162C',
                          color: 'rgba(255, 255, 255, 0.95)',
                          filter: 'none',
                        }}
                      >
                        {user?.rank || 'Stakeholder'}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 border p-2"
                  style={{
                    background: '#0D162C',
                    borderColor: 'rgba(0, 155, 242, 0.35)',
                    boxShadow:
                      '8px 8px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(0, 155, 242, 0.15)',
                  }}
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="cursor-pointer rounded-md focus:bg-[rgba(0,155,242,0.15)]"
                    style={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      filter: 'none',
                    }}
                  >
                    <User
                      className="mr-2 h-4 w-4"
                      style={{ color: '#009BF2', filter: 'none' }}
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
                    className="relative cursor-pointer rounded-md focus:bg-[rgba(0,155,242,0.15)]"
                    style={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      filter: 'none',
                    }}
                  >
                    <Bell
                      className="mr-2 h-4 w-4"
                      style={{ color: '#009BF2', filter: 'none' }}
                    />
                    <span className="flex-1">Notifications</span>
                    <NotificationBadge className="!static !h-5 !min-w-[20px] !px-1.5" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator
                    className="my-1"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
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

            {/* Support - Right side (same look as theme controller: neumorphic + accent color) */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setAssistantOpen(true)}
                className={`flex items-center justify-center rounded-full ${neuStyles['neu-icon-button']}`}
                style={{ color: 'var(--neu-accent)', filter: 'none' }}
                aria-label="Open customer support"
              >
                <IoHeadsetOutline className="h-5 w-5" />
              </button>
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
                    <span className="whitespace-nowrap">All Notifications</span>
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

        {/* Compliance & Registration Bonus Banners - only render wrapper when at least one banner is shown */}
        {!isOnboardingPage &&
          ((progress >= 40 && progress < 60) ||
            (progress >= 60 && progress < 100 && !!bonusData)) && (
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
              {/* Wallet Setup Banner (40% <= Progress < 60%) */}
              {progress >= 40 && progress < 60 && (
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
                        Whitelist your BEP20 withdrawal address to unlock
                        transfers & withdrawals.
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
              )}

              {/* Registration Bonus Progress Banner (Unlocked but active) */}
              {progress >= 60 && progress < 100 && bonusData && (
                <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 backdrop-blur-xl transition-all hover:bg-emerald-500/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest text-emerald-500/80 uppercase">
                          Registration Bonus: {progress}%
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-emerald-500/10">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Complete social follows and first stake to activate your
                        10% bonus.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <span className="block text-[10px] leading-tight text-slate-500 uppercase">
                        Time Left
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {bonusData.daysRemaining}d left
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push('/dashboard/onboarding')}
                      className="h-8 rounded-lg px-2 text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                    >
                      Complete
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Page content - standard app spacing; on lg fill remaining height, no scroll */}
        <main
          id="main-content"
          className="px-3 pt-6 pb-24 sm:px-4 sm:pt-6 sm:pb-24 md:px-5 md:pt-8 md:pb-24 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-6 lg:pt-8 lg:pb-0"
        >
          {children}
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
