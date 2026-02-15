# 🚀 QUICK FIX: Login Reload Loop - Emergency Patch

**Estimated Time**: 5 minutes  
**Difficulty**: Easy  
**Impact**: Stops infinite loop, allows login to work

---

## 🎯 Problem

Users get stuck in infinite reload loop when trying to login.

**Root Cause**: API interceptor clears auth and redirects when it receives 401 from any dashboard API call.

---

## 🔧 Emergency Fix (Apply Now)

### Option 1: Comment Out Auto-Clear Logic (Recommended)

**File**: `src/lib/api.ts`

**Find this code** (around line 435-450):

```typescript
} catch (refreshError: any) {
  console.error('[API] Token refresh failed:', {
    message: refreshError?.message,
    status: refreshError?.response?.status,
    data: refreshError?.response?.data,
  });

  processQueue(refreshError);

  // Clear all auth data
  tokenManager.clearTokens();
  if (typeof window !== 'undefined') {
    const { useAuthStore } = await import('@/store/authStore');
    const store = useAuthStore.getState();
    store.clearAuth();

    // Redirect to login with error message
    const errorMessage =
      refreshError?.response?.data?.message || 'Session expired';
    window.location.href = `/login?error=session_expired&message=${encodeURIComponent(errorMessage)}`;
  }

  return Promise.reject(refreshError);
}
```

**Replace with**:

```typescript
} catch (refreshError: any) {
  console.error('[API] Token refresh failed:', {
    message: refreshError?.message,
    status: refreshError?.response?.status,
    data: refreshError?.response?.data,
  });

  processQueue(refreshError);

  // 🔥 EMERGENCY FIX: Don't auto-clear auth on 401
  // This prevents the infinite redirect loop
  // TODO: Implement proper retry logic with backoff
  console.error('⚠️ [API] 401 detected but NOT clearing auth (emergency fix active)');
  console.error('⚠️ [API] Dashboard may show errors - backend needs investigation');
  
  // Just reject the promise, let UI handle the error
  return Promise.reject(refreshError);
}
```

**Save the file** and restart dev server:

```bash
pnpm dev
```

---

### Option 2: Disable All Dashboard Queries Temporarily

**File**: `src/app/(dashboard)/dashboard/page.tsx`

**Find these hooks** (around line 20-30):

```typescript
const { data: streakData, isLoading: streakLoading } = useStakingStreak();
// Add enabled: false to disable
const { data: streakData, isLoading: streakLoading } = useStakingStreak({
  enabled: false, // 🔥 TEMPORARY: Disable query
});
```

**Apply to all queries**:

```typescript
const { data: balance } = useWalletBalance({ enabled: false });
const { data: stakes } = useActiveStakes({ enabled: false });
const { data: overview } = useDashboardOverview({ enabled: false });
const { data: streakData } = useStakingStreak({ enabled: false });
```

This allows login to work but dashboard will show "no data" placeholders.

---

## 📊 Verify Fix Worked

1. **Clear browser cache/cookies**
2. **Attempt login**
3. **Check console** - you should see:
   ```
   ✅ Login successful
   ✅ Redirecting to dashboard
   ⚠️ [API] 401 detected but NOT clearing auth
   ```
4. **Dashboard should load** (may show errors but no redirect loop)

---

## 🐞 Debug While Fixed

With the loop stopped, gather data:

### 1. Open DevTools Network Tab

- Filter by "XHR" or "Fetch"
- Attempt login
- **Find which request returns 401 first**
- Screenshot it

### 2. Check Request Headers

For the 401 request:
- Is `Authorization: Bearer {token}` header present?
- Is the token valid format (JWT)?

### 3. Check Response Body

What error message is backend returning?

```json
{
  "success": false,
  "message": "??",
  "code": "??"
}
```

### 4. Run This in Console

```javascript
// After login, check auth state
console.log('=== AUTH STATE ===');
console.log('isAuthenticated:', useAuthStore.getState().isAuthenticated);
console.log('token:', localStorage.getItem('accessToken')?.substring(0, 30) + '...');
console.log('user:', useAuthStore.getState().user?.email);
```

---

## 📞 Share Findings

After applying fix and gathering data, create GitHub issue with:

1. ✅ Which fix you applied (Option 1 or 2)
2. ✅ Screenshot of Network tab showing 401
3. ✅ Console logs
4. ✅ Backend error message
5. ✅ Request headers (without full token)

---

## 🎯 Next Steps (Backend Team)

Based on findings:

1. **If 401 is from `/wallet/balance`** → Check wallet endpoint authentication
2. **If 401 is from `/dashboard/overview`** → Check dashboard endpoint
3. **If ALL requests return 401** → Check token validation logic
4. **If CORS error** → Check CORS configuration

---

## ⚠️ Limitations of Emergency Fix

- Dashboard may show error messages
- 401 errors won't trigger logout (user must logout manually)
- Not a permanent solution
- Proper fix requires backend investigation

---

## 🔄 Revert Fix Later

When proper solution is implemented:

1. Remove the emergency fix code
2. Uncomment original `clearAuth()` logic
3. Re-enable dashboard queries
4. Test thoroughly

---

**Fix Applied**: ___________ (date/time)  
**Applied By**: ___________  
**Status**: Emergency patch active, proper fix in progress
