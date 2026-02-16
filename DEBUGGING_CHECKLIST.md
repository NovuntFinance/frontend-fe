# CRITICAL: Login Loop Debugging - Step by Step

**Status:** Backend is 100% working. Frontend has the code but issue persists.  
**Next Step:** Find the EXACT configuration issue

---

## 🚨 STOP - Do This First

The backend endpoints are working perfectly. If you have the token refresh code but the loop persists, there's a **specific configuration issue**. Let's find it.

---

## 📋 Step 1: Run Diagnostic Tool

1. Open **https://www.novunt.com/login** in Chrome/Firefox
2. Open DevTools (F12) → Console tab
3. Copy the entire content of `frontend-diagnostic-tool.js`
4. Paste into console and press Enter
5. **Send the full output to backend team**

This will tell us EXACTLY what's wrong.

---

## 🔍 Step 2: Manual Checks (While Reproducing the Loop)

### Test A: Check What Happens During Login

1. Open DevTools → Network tab → Clear all requests
2. Login with valid credentials
3. Watch the requests in order

**Expected Sequence:**
```
POST /better-auth/login → 200 OK
  ✅ Response contains: { token, refreshToken, user }
  ✅ Redirects to /dashboard
GET /dashboard (or API call) → 200 OK
  ✅ Request includes: Authorization: Bearer <token>
```

**If you see this instead:**
```
POST /better-auth/login → 200 OK
Redirect to /dashboard
GET /dashboard → 401 TOKEN_EXPIRED (IMMEDIATELY!)
❌ NO call to /better-auth/refresh-token
Redirect back to /login
```

**Then the problem is:** Token not being stored OR token expired immediately

---

### Test B: Check Token Storage After Login

Right after successful login, run in console:
```javascript
console.log({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: localStorage.getItem('user')
});
```

**Expected:** All three should have values  
**If null:** Your login handler is NOT saving tokens

---

### Test C: Check If Refresh Is Actually Called

1. Login successfully
2. Open Network tab
3. Navigate around the site
4. Wait a few minutes
5. Look for requests to `/better-auth/refresh-token`

**Expected:** You should see this when token expires  
**If missing:** Your axios interceptor is NOT working

---

### Test D: Force Token Expiry Test

```javascript
// In console after login:
// 1. Corrupt the access token
localStorage.setItem('accessToken', 'invalid_token_12345');

// 2. Try to access any protected page or make an API call
// Expected: Should call /better-auth/refresh-token automatically
// If it redirects to login instead: Interceptor not working
```

---

## 🎯 Common Issues & Solutions

### Issue 1: Tokens Not Being Stored
**Symptom:** `localStorage` is empty after login  
**Cause:** Login handler not saving tokens properly

**Fix:**
```typescript
// In your login function, make sure you have:
const { token, refreshToken, user } = response.data.data;

// NOT response.data (missing .data)
// Store them:
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

---

### Issue 2: Wrong Token Key Name
**Symptom:** Token is stored but axios doesn't find it  
**Cause:** Mismatch between storage key and retrieval key

**Check:**
```javascript
// Make sure these match everywhere:
localStorage.setItem('accessToken', token);  // ← Storing
const token = localStorage.getItem('accessToken');  // ← Retrieving
```

**NOT:**
```javascript
localStorage.setItem('token', token);  // ← Different key!
const token = localStorage.getItem('accessToken');  // ← Won't find it
```

---

### Issue 3: Multiple Axios Instances
**Symptom:** Interceptor exists but doesn't trigger  
**Cause:** Using different axios instance for API calls

**Check:**
```typescript
// Are you doing this?
import axios from 'axios';  // ← Default axios (no interceptor)
axios.post('/api/endpoint');

// You should do this:
import apiClient from '@/lib/axios';  // ← Your configured instance
apiClient.post('/api/endpoint');
```

**Fix:** Use the SAME axios instance everywhere

---

### Issue 4: Interceptor Not Checking Error Code
**Symptom:** Gets 401 but redirects instead of refreshing  
**Cause:** Not checking for `TOKEN_EXPIRED` code

**Check your interceptor:**
```typescript
// ❌ WRONG:
if (error.response?.status === 401) {
  // Redirects on ANY 401
  window.location.href = '/login';
}

// ✅ CORRECT:
if (error.response?.status === 401 && 
    error.response?.data?.error?.code === 'TOKEN_EXPIRED') {
  // Only refresh on TOKEN_EXPIRED
  await refreshToken();
}
```

---

### Issue 5: API Base URL Mismatch
**Symptom:** Refresh works locally but not in production  
**Cause:** Wrong API URL in production

**Check `.env` or `.env.production`:**
```bash
NEXT_PUBLIC_API_URL=https://api.novunt.com  # ← Must be this

# NOT:
NEXT_PUBLIC_API_URL=http://localhost:5001  # ← Wrong for prod
NEXT_PUBLIC_API_URL=http://13.60.171.166:5001  # ← Wrong for prod
```

---

### Issue 6: Redirect Happens Before Interceptor
**Symptom:** Redirects to login immediately, interceptor never runs  
**Cause:** Route guard checking auth before API call completes

**Check your protected route component:**
```typescript
// ❌ WRONG - checks immediately on render:
useEffect(() => {
  if (!localStorage.getItem('accessToken')) {
    router.push('/login');  // ← Too early!
  }
}, []);

// ✅ CORRECT - only redirects if refresh also fails:
// Let axios interceptor handle token refresh first
// Only redirect if that fails
```

---

### Issue 7: Refresh Function Not Async/Await
**Symptom:** Refresh called but request fails immediately  
**Cause:** Not waiting for refresh to complete

**Check:**
```typescript
// ❌ WRONG:
refreshToken();  // ← Doesn't wait
return apiClient(originalRequest);  // ← Uses old token

// ✅ CORRECT:
const newToken = await refreshToken();  // ← Waits
if (newToken) {
  originalRequest.headers.Authorization = `Bearer ${newToken}`;
  return apiClient(originalRequest);  // ← Uses new token
}
```

---

## 🔧 Quick Fixes to Try

### Fix 1: Clear Everything and Start Fresh
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then login again and watch Network tab
```

### Fix 2: Check if Token is Actually Expired
```javascript
// Decode your access token (in console):
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires at:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
  console.log('Is expired?', Date.now() > payload.exp * 1000);
}
```

### Fix 3: Test Refresh Manually
```javascript
// In console:
const refreshToken = localStorage.getItem('refreshToken');
fetch('https://api.novunt.com/better-auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
})
.then(r => r.json())
.then(d => console.log('Refresh result:', d));
```

---

## 📞 What to Send to Backend Team

1. **Output from diagnostic tool** (frontend-diagnostic-tool.js)
2. **Screenshot of Network tab** showing:
   - Login request and response
   - The 401 error
   - Whether /refresh-token was called
3. **Console logs** showing any errors
4. **Your axios configuration file** (the one with interceptors)
5. **Your login handler code** (where tokens are stored)

---

## 🎯 Expected Behavior (Working Correctly)

```
User logs in
└─> POST /better-auth/login → 200 OK
    ├─> Stores: accessToken, refreshToken
    └─> Redirects to /dashboard

User browses site
└─> GET /api/dashboard → 200 OK (with valid token)

15 minutes pass...

User clicks another page
└─> GET /api/profile → 401 TOKEN_EXPIRED
    └─> Axios interceptor catches this
        └─> POST /better-auth/refresh-token → 200 OK
            ├─> Stores new accessToken
            └─> Retries: GET /api/profile → 200 OK
                └─> Page loads normally (no redirect!)
```

**NO LOGIN PAGE SHOULD BE INVOLVED AFTER INITIAL LOGIN**

---

## ✅ Once This is Fixed

You should be able to:
1. Login once
2. Browse the site for hours
3. Never see the login page again (until you logout or refresh token expires after 7 days)
4. Token refreshes happen silently in the background

---

**Run the diagnostic tool and send results. We'll identify the exact problem within minutes.**
