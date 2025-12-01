'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Setup2FA } from '@/components/admin/Setup2FA';
import { TwoFAProvider } from '@/contexts/TwoFAContext';
import { adminAuthService } from '@/services/adminAuthService';
import { rbacService } from '@/services/rbacService';
import { adminService } from '@/services/adminService';
import { use2FA } from '@/contexts/TwoFAContext';

// Initialize services with 2FA context
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking2FA, setChecking2FA] = useState(true);
  const [needs2FA, setNeeds2FA] = useState(false);
  const { promptFor2FA } = use2FA();

  // Skip all authentication checks for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip service initialization for login page
    if (isLoginPage) {
      setChecking2FA(false);
      return;
    }

    // Initialize services with 2FA context
    const get2FACode = async () => {
      return await promptFor2FA();
    };

    rbacService.set2FACodeGetter(get2FACode);
    adminService.set2FACodeGetter(get2FACode);
  }, [promptFor2FA, isLoginPage]);

  useEffect(() => {
    // Skip auth checks for login page
    if (isLoginPage) {
      return;
    }

    const checkAuth = async () => {
      const admin = adminAuthService.getCurrentAdmin();

      if (!admin) {
        router.push('/admin/login');
        return;
      }

      // Check if 2FA is enabled
      // Only check twoFAEnabled - twoFASecret is not needed after initial setup
      const is2FAEnabled = admin.twoFAEnabled === true;

      // Reset needs2FA state
      setNeeds2FA(false);

      // If 2FA is already enabled and we're on the setup page, redirect to dashboard
      if (is2FAEnabled && pathname === '/admin/setup-2fa') {
        router.push('/admin/overview');
        return;
      }

      // Only require 2FA setup if it's not enabled and we're not on the setup page
      if (!is2FAEnabled && pathname !== '/admin/setup-2fa') {
        setNeeds2FA(true);
      }

      setChecking2FA(false);
    };

    checkAuth();
  }, [router, pathname, isLoginPage]);

  // Render login page without any wrapper (no sidebar, no guard)
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (needs2FA && pathname !== '/admin/setup-2fa') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Setup2FA />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TwoFAProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </TwoFAProvider>
  );
}
