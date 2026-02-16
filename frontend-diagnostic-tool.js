/**
 * FRONTEND DEBUG DIAGNOSTIC TOOL
 *
 * Instructions:
 * 1. Open https://www.novunt.com in browser
 * 2. Open DevTools Console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Copy ALL the output and send to backend team
 *
 * This will identify the EXACT problem causing the login loop
 */

(function () {
  console.clear();
  console.log('🔍 NOVUNT LOGIN LOOP DIAGNOSTIC TOOL');
  console.log('====================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    issues: [],
    checks: {},
  };

  // CHECK 1: LocalStorage Tokens
  console.log('✅ CHECK 1: Token Storage');
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');

  results.checks.tokenStorage = {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    accessTokenLength: accessToken?.length || 0,
    refreshTokenLength: refreshToken?.length || 0,
  };

  console.log(
    '  - Access Token:',
    accessToken ? `✅ Present (${accessToken.length} chars)` : '❌ MISSING'
  );
  console.log(
    '  - Refresh Token:',
    refreshToken ? `✅ Present (${refreshToken.length} chars)` : '❌ MISSING'
  );
  console.log('  - User Data:', user ? '✅ Present' : '❌ MISSING');

  if (!accessToken) {
    results.issues.push('CRITICAL: No accessToken in localStorage after login');
  }
  if (!refreshToken) {
    results.issues.push(
      'CRITICAL: No refreshToken in localStorage after login'
    );
  }

  // CHECK 2: API Configuration
  console.log('\n✅ CHECK 2: API Configuration');
  const envVars = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  results.checks.apiConfig = envVars;
  console.log('  - API URL:', envVars.NEXT_PUBLIC_API_URL || '❌ NOT SET');
  console.log('  - Environment:', envVars.NODE_ENV);

  if (!envVars.NEXT_PUBLIC_API_URL) {
    results.issues.push(
      'WARNING: NEXT_PUBLIC_API_URL not set - using default?'
    );
  }

  // CHECK 3: Axios Instance Check
  console.log('\n✅ CHECK 3: Axios Interceptors');

  // Try to access axios if it's globally available
  if (typeof window.axios !== 'undefined') {
    const requestInterceptors =
      window.axios.interceptors?.request?.handlers?.length || 0;
    const responseInterceptors =
      window.axios.interceptors?.response?.handlers?.length || 0;

    results.checks.axiosInterceptors = {
      request: requestInterceptors,
      response: responseInterceptors,
    };

    console.log('  - Request Interceptors:', requestInterceptors);
    console.log('  - Response Interceptors:', responseInterceptors);

    if (responseInterceptors === 0) {
      results.issues.push(
        'CRITICAL: No response interceptors found - token refresh will not work!'
      );
    }
  } else {
    console.log('  - ⚠️ Cannot access axios instance globally');
    results.checks.axiosInterceptors = 'not accessible';
  }

  // CHECK 4: Recent Network Requests
  console.log('\n✅ CHECK 4: Recent API Calls (check Network tab manually)');
  console.log('  Look for these in Network tab:');
  console.log('  - POST /better-auth/login → Should return both tokens');
  console.log('  - POST /better-auth/refresh-token → Should be called on 401');
  console.log('  - Any 401 responses → Should trigger refresh, not redirect');

  // CHECK 5: Test Token Refresh Function
  console.log('\n✅ CHECK 5: Token Refresh Test');

  if (refreshToken) {
    console.log('  Testing refresh endpoint...');

    fetch(
      `${envVars.NEXT_PUBLIC_API_URL || 'https://api.novunt.com'}/better-auth/refresh-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        results.checks.refreshTest = {
          success: data.success,
          hasNewToken: !!data.data?.accessToken,
          response: data,
        };

        if (data.success) {
          console.log('  ✅ Refresh endpoint working! New token received.');
          console.log(
            '  New Access Token:',
            data.data?.accessToken?.substring(0, 20) + '...'
          );
        } else {
          console.log('  ❌ Refresh failed:', data.message);
          results.issues.push(
            `Refresh endpoint error: ${data.message || 'Unknown'}`
          );
        }
      })
      .catch((err) => {
        console.log('  ❌ Refresh request failed:', err.message);
        results.issues.push(`Network error calling refresh: ${err.message}`);
        results.checks.refreshTest = { error: err.message };
      });
  } else {
    console.log('  ⚠️ Cannot test - no refresh token available');
    results.issues.push('Cannot test refresh - no refresh token stored');
  }

  // CHECK 6: Auth State Management
  console.log('\n✅ CHECK 6: Auth State');

  // Check cookies as well
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  results.checks.cookies = {
    hasCookies: Object.keys(cookies).length > 0,
    authCookies: Object.keys(cookies).filter(
      (k) => k.includes('auth') || k.includes('token')
    ),
  };

  console.log(
    '  - Auth Cookies:',
    results.checks.cookies.authCookies.length > 0
      ? results.checks.cookies.authCookies.join(', ')
      : 'None'
  );

  // CHECK 7: Current Route
  console.log('\n✅ CHECK 7: Current Route & Redirects');
  results.checks.currentRoute = {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };

  console.log('  - Current Path:', window.location.pathname);

  if (window.location.pathname === '/login' && accessToken) {
    results.issues.push(
      'ISSUE: On login page but has valid access token - should redirect to dashboard'
    );
  }

  // SUMMARY
  console.log('\n====================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('====================================\n');

  if (results.issues.length === 0) {
    console.log('✅ No critical issues detected in configuration');
    console.log('⚠️ Issue might be in the timing or logic of token refresh');
  } else {
    console.log(`❌ Found ${results.issues.length} issue(s):\n`);
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  console.log('\n====================================');
  console.log('📋 COPY THIS OUTPUT TO BACKEND TEAM');
  console.log('====================================\n');
  console.log(JSON.stringify(results, null, 2));

  // Store in window for easy access
  window.NOVUNT_DIAGNOSTIC = results;
  console.log('\n💾 Results saved to: window.NOVUNT_DIAGNOSTIC');
  console.log(
    '📋 Run: copy(JSON.stringify(window.NOVUNT_DIAGNOSTIC, null, 2))'
  );
})();
