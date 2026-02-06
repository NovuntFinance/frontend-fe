'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminAuthService } from '@/services/adminAuthService';
import { toast } from 'sonner';
import Loading from '@/components/ui/loading';

const adminLoginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  twoFACode: z
    .string()
    .length(6, '2FA code must be 6 digits')
    .regex(/^[0-9]+$/, '2FA code must contain only numbers'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  // Clear any stale error state on mount
  useEffect(() => {
    setError(null);

    // SECURITY: Remove credentials from URL if present (should never be there)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('identifier') || urlParams.has('password')) {
      console.warn(
        '[AdminLogin] ⚠️ SECURITY: Credentials found in URL! Removing...'
      );
      urlParams.delete('identifier');
      urlParams.delete('password');
      const newUrl =
        window.location.pathname +
        (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Optional: Check if user is already logged in (just for UI, not for redirect)
  useEffect(() => {
    const isAuthenticated = adminAuthService.isAuthenticated();
    const admin = adminAuthService.getCurrentAdmin();
    setIsAlreadyLoggedIn(isAuthenticated && !!admin);
  }, []);

  // ✅ REMOVED: Auto-redirect check
  // The login page should always be accessible, even if user is already authenticated.
  // This allows users to:
  // - Explicitly log in as a different user
  // - Log out and log back in
  // - See the login form regardless of auth status
  // Protected routes (like /admin/overview) will handle redirecting unauthenticated users.

  const handleLogout = () => {
    adminAuthService.logout();
    setIsAlreadyLoggedIn(false);
    setError(null);
    toast.success('Logged out successfully');
  };

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    // SECURITY: Ensure credentials are never in URL
    // Clear any existing credentials from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('identifier') || urlParams.has('password')) {
      console.warn(
        '[AdminLogin] ⚠️ SECURITY: Credentials found in URL! Removing...'
      );
      urlParams.delete('identifier');
      urlParams.delete('password');
      const newUrl =
        window.location.pathname +
        (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }

    try {
      const response = await adminAuthService.login({
        identifier: data.identifier.trim(),
        password: data.password,
        twoFACode: data.twoFACode.trim(),
      });

      // Validate response structure - must have success, data, and token
      if (!response) {
        setError('No response received from server. Please try again.');
        toast.error('Login failed. Please try again.');
        return;
      }

      // Check if response indicates success AND has valid token
      const hasValidToken = response.success && response.data?.token;

      if (!hasValidToken) {
        // Response indicates failure or missing token
        const errorMsg =
          response.message || 'Login failed. Please check your credentials.';
        // Invalid response structure
        console.error('[AdminLogin] Unexpected response shape:', {
          success: response.success,
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          message: response.message,
        });

        // Never set "Login successful" as an error
        if (errorMsg.toLowerCase().includes('success')) {
          setError('Login failed. Invalid response from server.');
        } else {
          setError(errorMsg);
        }
        toast.error(
          errorMsg.includes('success')
            ? 'Login failed. Please check your credentials.'
            : errorMsg
        );
        return;
      }

      // SUCCESS - clear any errors and redirect
      setError(null);
      toast.success('Login successful!');

      // Determine redirect destination based on response
      const determineRedirect = () => {
        const admin = adminAuthService.getCurrentAdmin();
        const redirectParam = searchParams.get('redirect');

        // If we have admin data, check 2FA status
        if (admin) {
          if (admin.twoFAEnabled === true) {
            // 2FA enabled - go to dashboard
            return redirectParam || '/admin/overview';
          } else {
            // 2FA not enabled - go to setup
            return '/admin/setup-2fa';
          }
        }

        // No admin data yet - default to dashboard (AdminGuard will handle)
        return redirectParam || '/admin/overview';
      };

      // Verify token was stored and redirect
      let retryCount = 0;
      const maxRetries = 20; // 2 seconds total

      const verifyAndRedirect = () => {
        const token = adminAuthService.getToken();

        // If we have a token, proceed with redirect
        if (token) {
          const redirectTo = determineRedirect();

          // Use multiple redirect methods for reliability
          try {
            // Method 1: router.replace (preferred)
            router.replace(redirectTo);

            // Method 2: Fallback after short delay if still on login page
            setTimeout(() => {
              if (window.location.pathname === '/admin/login') {
                router.push(redirectTo);
              }
            }, 300);

            // Method 3: Final fallback using window.location
            setTimeout(() => {
              if (window.location.pathname === '/admin/login') {
                window.location.href = redirectTo;
              }
            }, 1000);
          } catch {
            // Immediate fallback
            window.location.href = redirectTo;
          }
          return;
        }

        // No token yet - retry with limit
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(verifyAndRedirect, 100);
        } else {
          // Even if token check fails, try redirecting (token might be in cookie)
          const redirectTo = determineRedirect();
          window.location.href = redirectTo;
        }
      };

      // Start verification immediately (token should be stored synchronously)
      verifyAndRedirect();
    } catch (err: any) {
      // Extract error message from backend response (no sensitive data logged)
      let errorMessage = 'Login failed. Please check your credentials.';

      if (err?.response?.data) {
        const errorData = err.response.data;
        errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error?.code ||
          (typeof errorData === 'string' ? errorData : null) ||
          errorMessage;
      } else if (err?.message && !err.message.includes('status code')) {
        errorMessage = err.message;
      }

      // Ensure we never set "success" as error message
      if (errorMessage.toLowerCase().includes('success')) {
        errorMessage = 'Login failed. Please check your credentials.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAlreadyLoggedIn && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-200">
                  You are already logged in.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Logout
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent default form submission (which would use GET)
              handleSubmit(onSubmit)(e);
            }}
            method="post" // Explicitly set to POST (though handleSubmit prevents submission)
            className="space-y-4"
          >
            {error && error.trim() && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="admin@novunt.com"
                  className="pl-10"
                  autoComplete="username"
                  {...register('identifier')}
                  disabled={isLoading}
                />
              </div>
              {errors.identifier && (
                <p className="text-sm text-red-500">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pr-10 pl-10"
                  autoComplete="current-password"
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFACode">2FA Code</Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  id="twoFACode"
                  type="text"
                  placeholder="123456"
                  className="pl-10"
                  maxLength={6}
                  autoComplete="one-time-code"
                  {...register('twoFACode')}
                  disabled={isLoading}
                />
              </div>
              {errors.twoFACode && (
                <p className="text-sm text-red-500">
                  {errors.twoFACode.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Note: Admin credentials are managed by the backend team. Contact
            your administrator if you need access.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loading className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
