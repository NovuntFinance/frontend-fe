'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/lib/api';

export default function AuthDebugPage() {
  const { user, token, refreshToken, isAuthenticated } = useAuthStore();
  const [lsToken, setLsToken] = useState<string | null>(null);
  const [lsRefresh, setLsRefresh] = useState<string | null>(null);
  const [lsZustand, setLsZustand] = useState<string | null>(null);

  useEffect(() => {
    // Read from localStorage
    setLsToken(localStorage.getItem('novunt_token'));
    setLsRefresh(localStorage.getItem('novunt_refresh_token'));
    setLsZustand(localStorage.getItem('novunt-auth-storage'));
  }, []);

  const testSetTokens = () => {
    const testToken = 'test-token-' + Date.now();
    const testRefresh = 'test-refresh-' + Date.now();
    
    console.log('Testing setTokens with:', { testToken, testRefresh });
    useAuthStore.getState().setTokens(testToken, testRefresh);
    
    // Re-read after 200ms
    setTimeout(() => {
      setLsToken(localStorage.getItem('novunt_token'));
      setLsRefresh(localStorage.getItem('novunt_refresh_token'));
      setLsZustand(localStorage.getItem('novunt-auth-storage'));
    }, 200);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Auth Debug Page</h1>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h2>Zustand Store State:</h2>
        <pre>{JSON.stringify({ user: user?._id, token: token?.substring(0, 20), refreshToken: refreshToken?.substring(0, 20), isAuthenticated }, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h2>localStorage (novunt_token):</h2>
        <pre>{lsToken ? lsToken.substring(0, 50) + '...' : 'null'}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h2>localStorage (novunt_refresh_token):</h2>
        <pre>{lsRefresh ? lsRefresh.substring(0, 50) + '...' : 'null'}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h2>localStorage (novunt-auth-storage):</h2>
        <pre style={{ fontSize: '10px' }}>{lsZustand ? lsZustand.substring(0, 200) + '...' : 'null'}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h2>tokenManager.getToken():</h2>
        <pre>{tokenManager.getToken()?.substring(0, 50) || 'null'}</pre>
      </div>

      <button onClick={testSetTokens} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Test setTokens()
      </button>

      <button onClick={() => window.location.reload()} style={{ marginTop: '20px', marginLeft: '10px', padding: '10px 20px', fontSize: '16px' }}>
        Reload Page
      </button>
    </div>
  );
}
