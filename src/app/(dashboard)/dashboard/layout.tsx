'use client';
// Force Vercel rebuild - All linting errors fixed (commit cc93df0)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
// Framer Motion removed - no longer needed for navigation
import {
  TrendingDown,
  Users,
  Bell,
  LogOut,
  User,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useDashboardOverview } from '@/lib/queries';
import { useDisable2FA } from '@/lib/mutations';
import { Avatar } from '@/components/ui/avatar';
import { BadgeAvatar } from '@/components/ui/BadgeAvatar';
import { getUserAvatarUrl, isBadgeIcon } from '@/lib/avatar-utils';
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
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { DateFilteredNotificationList } from '@/components/notifications/DateFilteredNotificationList';
import { TwoFactorModal } from '@/components/settings/TwoFactorModal';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '@/store/uiStore';
import { CreateStakeModal } from '@/components/stake/CreateStakeModal';
import { DepositModal } from '@/components/wallet/modals/DepositModal';
import { WithdrawModal } from '@/components/wallet/modals/WithdrawModal';
import { TransferModal } from '@/components/wallet/modals/TransferModal';
import { InfoMarquee } from '@/components/ui/info-marquee';
import { HorizontalNav } from '@/components/navigation/HorizontalNav';

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

  // Get weekly profit percentage
  const overviewData = overview as
    | { analytics?: { lastWeekProfit?: number; lastWeekProfitChange?: number } }
    | undefined;
  const lastWeekProfitChange =
    overviewData?.analytics?.lastWeekProfitChange ?? 0;
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  // Initialize twoFactorEnabled from user's actual 2FA status
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    () => user?.twoFAEnabled || false
  );

  // 2FA disable mutation
  const disable2FAMutation = useDisable2FA();

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
      <div className="from-background via-background to-background min-h-screen bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950">
        {/* Secondary Header Bar (Profile Icon + Info Marquee) */}
        <header className="sticky top-0 z-30 h-14 border-b border-white/20 bg-gradient-to-b from-white/10 via-white/5 to-white/2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/2">
          <div className="flex h-full items-center gap-4 px-4">
            {/* Profile Icon - Left side */}
            <div className="flex shrink-0 items-center">
              <DropdownMenu
                open={profileDropdownOpen}
                onOpenChange={setProfileDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full p-0"
                  >
                    {(() => {
                      const avatarUrl = getUserAvatarUrl(user);
                      const isBadge = avatarUrl && isBadgeIcon(avatarUrl);

                      if (isBadge && avatarUrl) {
                        return (
                          <BadgeAvatar
                            badgeIcon={avatarUrl}
                            size="md"
                            className="h-10 w-10"
                          />
                        );
                      }

                      return (
                        <Avatar className="h-10 w-10">
                          <img
                            src={avatarUrl || ''}
                            alt={user?.firstName || 'User'}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </Avatar>
                      );
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/8"
                >
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-foreground text-sm font-medium dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs dark:text-white/60">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border my-1 dark:bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="text-foreground focus:bg-accent focus:text-foreground cursor-pointer rounded-md dark:text-white/90 dark:focus:bg-white/10 dark:focus:text-white"
                  >
                    <User className="text-muted-foreground mr-2 h-4 w-4 dark:text-white/70" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      // Small delay to ensure dropdown closes before opening notification center
                      setTimeout(() => {
                        setNotificationCenterOpen(true);
                      }, 100);
                    }}
                    className="text-foreground focus:bg-accent focus:text-foreground relative cursor-pointer rounded-md dark:text-white/90 dark:focus:bg-white/10 dark:focus:text-white"
                  >
                    <Bell className="text-muted-foreground mr-2 h-4 w-4 dark:text-white/70" />
                    <span className="flex-1">Notifications</span>
                    <NotificationBadge className="!static !h-5 !min-w-[20px] !px-1.5" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="text-foreground focus:bg-accent focus:text-foreground cursor-pointer rounded-md dark:text-white/90 dark:focus:bg-white/10 dark:focus:text-white"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        {theme === 'dark' ? (
                          <Moon className="text-muted-foreground mr-2 h-4 w-4 dark:text-white/70" />
                        ) : (
                          <Sun className="text-muted-foreground mr-2 h-4 w-4 dark:text-white/70" />
                        )}
                        <span>Theme</span>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => {
                          setTheme(checked ? 'dark' : 'light');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-white/20"
                      />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="text-foreground focus:bg-accent focus:text-foreground cursor-pointer rounded-md dark:text-white/90 dark:focus:bg-white/10 dark:focus:text-white"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="text-muted-foreground mr-2 h-4 w-4 dark:text-white/70" />
                        <span>2FA Auth</span>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTwoFactorModalOpen(true);
                          } else {
                            // Disable 2FA via API
                            disable2FAMutation.mutate(undefined, {
                              onSuccess: () => {
                                setTwoFactorEnabled(false);
                              },
                              onError: () => {
                                // Revert toggle on error
                                setTwoFactorEnabled(
                                  user?.twoFAEnabled || false
                                );
                              },
                            });
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={disable2FAMutation.isPending}
                        className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-white/20"
                      />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border my-1 dark:bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-md text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Information Marquee - shown on all views */}
            <div className="min-w-0 flex-1">
              <InfoMarquee speed={45} className="h-full" />
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

        {/* Page content */}
        <main className="p-4 pb-20 sm:p-6 lg:p-8">{children}</main>

        {/* Horizontal Navigation - Fixed at bottom */}
        <HorizontalNav />

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
