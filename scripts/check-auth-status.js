#!/usr/bin/env node

/**
 * Auth Status Checker
 * Run this script in the browser console to debug authentication issues
 * 
 * Usage:
 * 1. Open your site
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 */

(function checkAuthStatus() {
  console.log('\n%c🔍 NOVUNT AUTH STATUS CHECK', 'background: #2563eb; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
  console.log('═'.repeat(60));

  // Check localStorage
  console.log('\n%c📦 localStorage:', 'color: #0ea5e9; font-weight: bold;');
  const authToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const zustandData = localStorage.getItem('novunt-auth-storage');

  console.log('├─ authToken:', authToken ? `✅ EXISTS (${authToken.length} chars)` : '❌ NOT FOUND');
  if (authToken) {
    console.log('│  └─ Preview:', authToken.substring(0, 50) + '...');
    
    // Try to decode JWT
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      console.log('│  └─ Token Data:');
      console.log('│     ├─ User ID:', payload.userId || payload.id || 'N/A');
      console.log('│     ├─ Email:', payload.email || 'N/A');
      console.log('│     ├─ Username:', payload.username || 'N/A');
      console.log('│     ├─ Role:', payload.role || 'N/A');
      console.log('│     ├─ Issued:', payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A');
      console.log('│     ├─ Expires:', payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A');
      
      const isExpired = payload.exp && Date.now() >= payload.exp * 1000;
      console.log('│     └─ Status:', isExpired ? '❌ EXPIRED' : '✅ VALID');
      
      if (isExpired) {
        const expiredAgo = Math.floor((Date.now() - payload.exp * 1000) / (1000 * 60 * 60 * 24));
        console.log('│        └─ Expired', expiredAgo, 'days ago');
      } else {
        const expiresIn = Math.floor((payload.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        console.log('│        └─ Expires in', expiresIn, 'days');
      }
    } catch (e) {
      console.log('│  └─ ⚠️ Failed to decode token:', e.message);
    }
  }

  console.log('├─ refreshToken:', refreshToken ? `✅ EXISTS (${refreshToken.length} chars)` : '❌ NOT FOUND');
  console.log('└─ zustandData:', zustandData ? '✅ EXISTS' : '❌ NOT FOUND');

  if (zustandData) {
    try {
      const parsed = JSON.parse(zustandData);
      console.log('   └─ Zustand State:');
      console.log('      ├─ isAuthenticated:', parsed.state?.isAuthenticated ? '✅ true' : '❌ false');
      console.log('      ├─ User:', parsed.state?.user ? '✅ EXISTS' : '❌ NULL');
      if (parsed.state?.user) {
        console.log('      │  ├─ Email:', parsed.state.user.email);
        console.log('      │  ├─ Username:', parsed.state.user.username);
        console.log('      │  └─ ID:', parsed.state.user._id || parsed.state.user.id);
      }
      console.log('      ├─ Token:', parsed.state?.token ? '✅ EXISTS' : '❌ NULL');
      console.log('      └─ RefreshToken:', parsed.state?.refreshToken ? '✅ EXISTS' : '❌ NULL');
    } catch (e) {
      console.log('   └─ ⚠️ Failed to parse Zustand data');
    }
  }

  // Check cookies
  console.log('\n%c🍪 Cookies:', 'color: #f59e0b; font-weight: bold;');
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const cookieKeys = ['auth_token', 'authToken', 'refreshToken'];
  cookieKeys.forEach((key, i) => {
    const prefix = i === cookieKeys.length - 1 ? '└─' : '├─';
    const value = cookies[key];
    console.log(`${prefix} ${key}:`, value ? `✅ EXISTS (${value.length} chars)` : '❌ NOT FOUND');
  });

  // Check API connectivity
  console.log('\n%c🌐 API Connectivity:', 'color: #10b981; font-weight: bold;');
  const apiUrl = 'https://api.novunt.com/api/v1';
  console.log('├─ Backend URL:', apiUrl);
  console.log('└─ Testing connection...');

  fetch(apiUrl + '/health', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      console.log('   └─ Connection:', response.ok ? '✅ SUCCESS' : '⚠️ FAILED');
      console.log('      ├─ Status:', response.status, response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('      └─ Response:', data);
    })
    .catch(err => {
      console.log('   └─ ❌ Connection Failed:', err.message);
    });

  // Test authenticated endpoint
  if (authToken) {
    console.log('\n%c🔐 Testing Authenticated Request:', 'color: #8b5cf6; font-weight: bold;');
    console.log('└─ Testing /auth/profile...');

    fetch(apiUrl + '/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      credentials: 'include',
    })
      .then(response => {
        console.log('   └─ Auth Check:', response.ok ? '✅ VALID TOKEN' : '❌ INVALID TOKEN');
        console.log('      ├─ Status:', response.status, response.statusText);
        if (!response.ok) {
          console.log('      └─ ⚠️ Token is invalid or expired - please log in again');
        }
        return response.json();
      })
      .then(data => {
        console.log('      └─ Response:', data);
      })
      .catch(err => {
        console.log('   └─ ❌ Request Failed:', err.message);
      });
  }

  // Summary
  console.log('\n%c📋 SUMMARY', 'background: #059669; color: white; padding: 8px; font-weight: bold;');
  console.log('═'.repeat(60));

  const hasToken = !!authToken;
  const hasRefresh = !!refreshToken;
  const hasZustand = !!zustandData;
  const hasCookies = !!(cookies['authToken'] || cookies['auth_token']);

  if (hasToken && hasRefresh && hasZustand) {
    console.log('✅ Authentication data is present');
    console.log('   If you\'re still getting 401 errors:');
    console.log('   1. Your token may be expired (check expiry above)');
    console.log('   2. Backend may be rejecting the token');
    console.log('   3. Try logging in again for a fresh token');
  } else {
    console.log('❌ Authentication data is incomplete or missing');
    console.log('   Missing:');
    if (!hasToken) console.log('   - authToken in localStorage');
    if (!hasRefresh) console.log('   - refreshToken in localStorage');
    if (!hasZustand) console.log('   - Zustand persisted state');
    if (!hasCookies) console.log('   - Auth cookies');
    console.log('\n   Action: Please log in again');
  }

  console.log('\n%c💡 Quick Actions:', 'color: #3b82f6; font-weight: bold;');
  console.log('├─ To clear all auth data and start fresh:');
  console.log('│  └─ Run: clearAuth()');
  console.log('└─ To go to login page:');
  console.log('   └─ Run: window.location.href = "/login"');

  console.log('\n═'.repeat(60));

  // Define helper function
  window.clearAuth = function() {
    console.log('\n%c🧹 Clearing all authentication data...', 'background: #ef4444; color: white; padding: 8px; font-weight: bold;');
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('novunt-auth-storage');
    console.log('✅ localStorage cleared');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log('✅ Cookies cleared');
    
    console.log('\n✅ All auth data cleared successfully!');
    console.log('🔄 Redirecting to login...\n');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  console.log('\n%c Helper functions available:', 'color: #8b5cf6; font-weight: bold;');
  console.log('• clearAuth() - Clear all auth data and redirect to login');

})();

