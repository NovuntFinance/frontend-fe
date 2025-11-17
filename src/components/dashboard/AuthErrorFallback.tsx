'use client';

import React from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * AuthErrorFallback Component
 * Shown when authentication fails (401 errors)
 * Provides options to re-authenticate or logout
 */
export function AuthErrorFallback() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRetry = () => {
    // Force logout and redirect to login to get fresh token
    logout();
    router.push('/login?reason=session_expired&message=Please log in again');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Authentication Error</CardTitle>
              <CardDescription>
                Your session is invalid or has expired
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The backend is rejecting your authentication token. This might happen if:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Your session has expired</li>
                <li>The backend configuration has changed</li>
                <li>There&apos;s a token validation issue</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Log In Again
            </Button>
            
            <Button
              onClick={handleLogout}
              className="w-full"
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-semibold">Troubleshooting:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click &quot;Log In Again&quot; to get a fresh token</li>
              <li>If that doesn&apos;t work, clear your browser cache</li>
              <li>Contact support if the issue persists</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Technical Details:</strong>
              <br />
              Backend: <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {typeof window !== 'undefined' 
                  ? (window as any).__NOVUNT_API_URL__ || process.env.NEXT_PUBLIC_API_URL || 'Not configured'
                  : 'Server-side'}
              </code>
              <br />
              Error: <code className="text-xs bg-muted px-1 py-0.5 rounded">401 Unauthorized - Invalid token</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

