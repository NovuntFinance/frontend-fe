# Stakes Page Loading Issue - Quick Fix

## Problem

The stakes page (`/dashboard/stakes`) is not loading and hangs indefinitely.

## Root Cause

**Your authentication token has expired** at 14:32:55, but it's now 17:00+ (over 2 hours later). The middleware detects the expired token but the page is stuck in a loading state because:

1. The expired token causes API requests to fail
2. The React Query (`useStakeDashboard`) is waiting for a response that never comes
3. The page stays in loading state indefinitely

## Immediate Fix (Do This Now)

### Step 1: Clear Browser Data

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Storage** → **Clear site data**
4. Click **Clear** button

### Step 2: Hard Refresh

- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Step 3: Login Again

1. You'll be redirected to `/login`
2. Login with your credentials
3. Navigate to Stakes page again

## Expected Behavior After Fix

- Page should load within 2-3 seconds
- You'll see your stakes dashboard with:
  - Total stakes count
  - Total amount staked
  - This week's profit
  - Active stakes cards

---

## Technical Details (For Future Reference)

### Token Expiration Log

```
[Middleware] Token expired at: 2025-11-26T14:32:55.000Z
Current time: ~17:00 (2+ hours after expiration)
```

### Page Load Times (Slow)

```
Dashboard compilation: 60.6s (should be <5s)
Dashboard response: 64.3s (should be <2s)
Stakes page: Not compiling (hanging)
```

### Why It's Slow

1. **Large bundle size** - 5502 modules being compiled
2. **Development mode** - No optimization
3. **Expired token** - Causing failed/retrying requests

### Performance Improvements Needed

1. Code splitting for faster compilation
2. Reduce module count
3. Better token expiry handling in queries
4. Add request timeouts to prevent infinite hangs

---

## If Problem Persists

### Check Browser Console

Look for errors like:

- `401 Unauthorized`
- `Network request failed`
- `Token expired`

### Check Network Tab

1. Open DevTools → Network tab
2. Click Stakes menu item
3. Look for failing API requests to `/staking/dashboard` or similar
4. Check if requests are stuck in "Pending" status

### Force Logout

If clearing data doesn't work:

1. Open browser console (F12)
2. Run: `localStorage.clear(); sessionStorage.clear();`
3. Refresh page
4. Login again

---

## Prevention

### Enable Auto-Refresh

The app should automatically refresh tokens before they expire. Check if this is working in `src/lib/api.ts` interceptors.

### Add Request Timeout

Add timeout to React Query:

```typescript
useStakeDashboard({
  staleTime: 0,
  gcTime: 0,
  retry: 1,
  retryDelay: 1000,
  // Add timeout
  queryFn: async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const result = await fetchStakingDashboard();
      clearTimeout(timeout);
      return result;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  },
});
```

This prevents indefinite hanging on failed requests.
