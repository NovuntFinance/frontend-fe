'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TokenInfo {
  header: unknown;
  payload: unknown;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  error?: string;
}

function decodeJWT(token: string): TokenInfo {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: '',
        isValid: false,
        isExpired: true,
        error: 'Invalid JWT format - should have 3 parts'
      };
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];

    const now = Date.now();
    const exp = payload.exp * 1000;
    const isExpired = now >= exp;
    const expiresAt = new Date(exp);

    return {
      header,
      payload,
      signature,
      isValid: true,
      isExpired,
      expiresAt
    };
  } catch (error) {
    return {
      header: null,
      payload: null,
      signature: '',
      isValid: false,
      isExpired: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default function DebugTokenPage() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [storageData, setStorageData] = useState<{
    localStorage: Record<string, string | null>;
    cookies: string;
    zustand: unknown;
  } | null>(null);

  const authStore = useAuthStore();

  const loadData = () => {
    // Get token from store
    const token = authStore.token;
    
    // Decode token
    if (token) {
      setTokenInfo(decodeJWT(token));
    } else {
      setTokenInfo(null);
    }

    // Get all storage data
    if (typeof window !== 'undefined') {
      const lsAuthToken = localStorage.getItem('authToken');
      const lsRefreshToken = localStorage.getItem('refreshToken');
      const zustandData = localStorage.getItem('novunt-auth-storage');
      
      setStorageData({
        localStorage: {
          authToken: lsAuthToken,
          refreshToken: lsRefreshToken,
        },
        cookies: document.cookie,
        zustand: zustandData ? JSON.parse(zustandData) : null
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [authStore.token]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clearAllAuth = () => {
    localStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    authStore.clearAuth();
    toast.success('All auth data cleared!');
    setTimeout(() => loadData(), 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔍 JWT Token Debugger</h1>
          <p className="text-muted-foreground">Debug your authentication issues</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={clearAllAuth} variant="destructive">
            Clear All Auth Data
          </Button>
        </div>
      </div>

      {/* Auth Store Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {authStore.isAuthenticated ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Auth Store Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Authenticated:</p>
              <p className={authStore.isAuthenticated ? "text-green-600" : "text-red-600"}>
                {authStore.isAuthenticated ? "✓ Yes" : "✗ No"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Has User:</p>
              <p className={authStore.user ? "text-green-600" : "text-red-600"}>
                {authStore.user ? "✓ Yes" : "✗ No"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Has Token:</p>
              <p className={authStore.token ? "text-green-600" : "text-red-600"}>
                {authStore.token ? "✓ Yes" : "✗ No"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Has Refresh Token:</p>
              <p className={authStore.refreshToken ? "text-green-600" : "text-red-600"}>
                {authStore.refreshToken ? "✓ Yes" : "✗ No"}
              </p>
            </div>
          </div>
          {authStore.user && (
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm font-medium mb-2">User Info:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(authStore.user, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Analysis */}
      {authStore.token && tokenInfo ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tokenInfo.isValid && !tokenInfo.isExpired ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Token Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tokenInfo.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{tokenInfo.error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Token Status:</p>
                    {tokenInfo.isExpired ? (
                      <span className="text-red-600">❌ Expired</span>
                    ) : (
                      <span className="text-green-600">✓ Valid</span>
                    )}
                  </div>
                  
                  {tokenInfo.expiresAt && (
                    <div>
                      <p className="text-sm font-medium">Expires At:</p>
                      <p className="text-sm text-muted-foreground">
                        {tokenInfo.expiresAt.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({tokenInfo.isExpired ? 'Expired' : 'Valid for'} {
                          Math.abs(Math.round((tokenInfo.expiresAt.getTime() - Date.now()) / 1000 / 60))
                        } minutes)
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Token Header:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(JSON.stringify(tokenInfo.header, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(tokenInfo.header, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Token Payload:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(JSON.stringify(tokenInfo.payload, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(tokenInfo.payload, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Full Token:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(authStore.token || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto break-all">
                    {authStore.token}
                  </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No token found. Please login first.</AlertDescription>
        </Alert>
      )}

      {/* Storage Data */}
      {storageData && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Data</CardTitle>
            <CardDescription>All authentication data in browser storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">LocalStorage authToken:</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto break-all">
                {storageData.localStorage.authToken || '❌ Not found'}
              </pre>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">LocalStorage refreshToken:</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto break-all">
                {storageData.localStorage.refreshToken || '❌ Not found'}
              </pre>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Cookies:</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto break-all">
                {storageData.cookies || '❌ No cookies'}
              </pre>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Zustand Persisted State:</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(storageData.zustand, null, 2) || '❌ Not found'}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Check Token Status:</strong> If token shows as expired, click &quot;Clear All Auth Data&quot; and login again
            </li>
            <li>
              <strong>Verify Token Format:</strong> Token should have header, payload, and signature (3 parts separated by dots)
            </li>
            <li>
              <strong>Check Storage:</strong> Token should exist in localStorage, cookies, and Zustand store
            </li>
            <li>
              <strong>Test API Call:</strong> Open Network tab and check if Authorization header is being sent with Bearer token
            </li>
            <li>
              <strong>Backend Validation:</strong> If token looks valid but still getting 401, backend might not recognize the token format
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

