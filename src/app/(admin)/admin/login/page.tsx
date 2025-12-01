'use client';

import React, { useState, useEffect } from 'react';
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
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  // Check if already logged in
  useEffect(() => {
    if (adminAuthService.isAuthenticated()) {
      const admin = adminAuthService.getCurrentAdmin();
      if (admin) {
        // Check if 2FA is enabled - only check twoFAEnabled, not twoFASecret
        if (admin.twoFAEnabled === true) {
          router.push('/admin/overview');
        } else {
          router.push('/admin/setup-2fa');
        }
      }
    }
  }, [router]);

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await adminAuthService.login({
        identifier: data.identifier.trim(),
        password: data.password,
      });

      // Log response for debugging
      console.log('[AdminLogin] Login response:', response);

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
        console.error('[AdminLogin] Invalid response structure:', {
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

      // Verify token was stored before redirecting
      let retryCount = 0;
      const maxRetries = 10; // Maximum 10 retries (1 second total)

      const verifyAndRedirect = () => {
        const token = adminAuthService.getToken();
        const admin = adminAuthService.getCurrentAdmin();

        console.log('[AdminLogin] Verifying auth before redirect:', {
          hasToken: !!token,
          hasAdmin: !!admin,
          tokenPreview: token ? token.substring(0, 30) + '...' : 'null',
          retryCount,
        });

        // If we have a token, we can proceed (even without full admin data)
        if (token) {
          // If we have admin data, check 2FA status
          if (admin) {
            // Only check twoFAEnabled - twoFASecret is not needed after initial setup
            if (admin.twoFAEnabled === true) {
              // Redirect to admin dashboard
              const redirectTo =
                searchParams.get('redirect') || '/admin/overview';
              console.log('[AdminLogin] Redirecting to:', redirectTo);
              router.push(redirectTo);
              return;
            } else {
              // Redirect to 2FA setup
              console.log('[AdminLogin] Redirecting to 2FA setup');
              router.push('/admin/setup-2fa');
              return;
            }
          } else {
            // We have token but no admin data - redirect to setup-2fa anyway
            // AdminGuard will handle showing the proper page
            console.log(
              '[AdminLogin] Token present but no admin data, redirecting to setup-2fa'
            );
            router.push('/admin/setup-2fa');
            return;
          }
        }

        // No token yet - retry with limit
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `[AdminLogin] Token not stored yet, retrying... (${retryCount}/${maxRetries})`
          );
          setTimeout(verifyAndRedirect, 100);
        } else {
          console.error(
            '[AdminLogin] Max retries reached, token still not available'
          );
          setError('Login failed. Token was not stored properly.');
          toast.error('Login failed. Please try again.');
        }
      };

      // Start verification after a brief delay
      setTimeout(verifyAndRedirect, 200);
    } catch (err: any) {
      // Error occurred - definitely not a success
      console.error('Admin login error:', err);

      // Extract detailed error message from backend response
      let errorMessage = 'Login failed. Please check your credentials.';

      if (err.response?.data) {
        const errorData = err.response.data;

        // Try different possible error message formats
        errorMessage =
          errorData.message ||
          errorData.error?.message ||
          errorData.error ||
          (typeof errorData === 'string' ? errorData : null) ||
          errorMessage;

        // Log full error response for debugging
        console.error('Backend error response:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
        });
      } else if (err.message && !err.message.includes('status code')) {
        // Only use error message if it's not the generic axios error
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
