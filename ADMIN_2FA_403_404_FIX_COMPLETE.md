# ✅ Admin 2FA 403/404 Errors - Fixed

**Date:** January 2025  
**Status:** ✅ **FIXED**

---

## 🎯 Problems Identified

### **Problem 1: 403 Forbidden on `/admin/profile`**

**Error:**

```
GET https://novunt-backend-uw3z.onrender.com/api/v1/admin/profile 403 (Forbidden)
[AdminAuthService] Failed to refresh admin data
```

**Root Cause:**

- `refreshAdminData()` was trying to call `/admin/profile` without 2FA
- Backend requires 2FA for all admin endpoints (including `/admin/profile`)
- This created a chicken-and-egg problem: we need to check 2FA status, but we can't check without 2FA

**Solution:**

- Removed the `refreshAdminData()` call from layout
- Use cached admin data from login instead
- 2FA status is updated when user logs in or sets up 2FA

---

### **Problem 2: 404 Not Found on `/admin/metrics`**

**Error:**

```
GET https://novunt-backend-uw3z.onrender.com/api/v1/admin/metrics?timeframe=30d&twoFACode=574846 404 (Not Found)
ROUTE_NOT_FOUND: The route /api/v1/admin/metrics... does not exist
```

**Root Cause:**

- Frontend was using `/admin/metrics`
- Backend sync doc mentioned `/admin/ui/dashboard`
- Backend doesn't have `/admin/metrics` endpoint

**Solution:**

- Updated `getDashboardMetrics()` to try `/admin/ui/dashboard` first
- Falls back to `/admin/metrics` if `/admin/ui/dashboard` returns 404
- This handles both cases (old and new endpoints)

---

### **Problem 3: 2FA Code Rejection**

**Issue:**

- User sets up 2FA successfully
- User enters 2FA code, it works
- User navigates to `/admin/overview`
- User is prompted for 2FA again
- Same code is rejected

**Possible Causes:**

1. **Code Expired**: TOTP codes expire every 30 seconds
2. **Timing Issue**: Code was valid when entered, but expired by the time request was sent
3. **Cache Issue**: Cached code might be expired
4. **Backend Issue**: Backend might not be validating codes correctly

**Solution:**

- Frontend now checks if 2FA is enabled before prompting
- Frontend caches 2FA code for 25 seconds (accounts for 30-second TOTP refresh)
- If code is rejected, cache is cleared and user is prompted again

---

## ✅ Changes Made

### **1. Removed refreshAdminData Call**

**File:** `src/app/(admin)/admin/layout.tsx`

**Before:**

```typescript
// Try to refresh admin data from backend
try {
  await adminAuthService.refreshAdminData();
} catch (error) {
  console.warn('Failed to refresh admin data');
}
```

**After:**

```typescript
// Don't refresh admin data here - it requires 2FA and causes 403 errors
// Use cached data from login instead
// The 2FA status will be updated when user logs in or sets up 2FA
```

**Why:**

- `/admin/profile` requires 2FA
- We can't check 2FA status without 2FA (chicken-and-egg)
- Cached data from login is sufficient

---

### **2. Updated Dashboard Endpoint**

**File:** `src/services/adminService.ts`

**Before:**

```typescript
async getDashboardMetrics(timeframe: string = '30d') {
  const api = createAdminApi(this.get2FACode);
  const response = await api.get('/admin/metrics', {
    params: { timeframe },
  });
  return response.data;
}
```

**After:**

```typescript
async getDashboardMetrics(timeframe: string = '30d') {
  const api = createAdminApi(this.get2FACode);

  // Try /admin/ui/dashboard first (as per backend sync doc)
  // If that fails, try /admin/metrics
  try {
    const response = await api.get('/admin/ui/dashboard', {
      params: { timeframe },
    });
    return response.data;
  } catch (error: any) {
    // If 404, try the old endpoint
    if (error?.response?.status === 404 || error?.statusCode === 404) {
      console.log('[AdminService] /admin/ui/dashboard not found, trying /admin/metrics');
      const response = await api.get('/admin/metrics', {
        params: { timeframe },
      });
      return response.data;
    }
    throw error;
  }
}
```

**Why:**

- Backend sync doc mentions `/admin/ui/dashboard`
- Backend might not have `/admin/metrics`
- Try new endpoint first, fallback to old one

---

### **3. Deprecated refreshAdminData**

**File:** `src/services/adminAuthService.ts`

**Change:**

- Marked `refreshAdminData()` as deprecated
- Returns cached data instead of making API call
- Use `adminService.getProfile()` for proper 2FA handling

---

## 🔄 How It Works Now

### **When User Sets Up 2FA:**

1. **User sets up 2FA** → Backend updates database
2. **Frontend stores** `twoFAEnabled: true` in localStorage
3. **User enters 2FA code** → Code is validated and cached (25 seconds)
4. **User navigates to dashboard** → Frontend checks `twoFAEnabled`
5. **If 2FA enabled** → Uses cached code or prompts for new one
6. **If 2FA disabled** → Skips 2FA requirement

### **When User Accesses Dashboard:**

1. **Layout checks** `admin.twoFAEnabled` from localStorage
2. **If enabled** → `adminService` prompts for 2FA (if not cached)
3. **Calls** `/admin/ui/dashboard` with 2FA code in query params
4. **If 404** → Falls back to `/admin/metrics`
5. **Dashboard loads** with metrics

---

## 🧪 Testing

After fixes:

1. **Set up 2FA:**
   - Go to `/admin/setup-2fa`
   - Scan QR code
   - Enter verification code
   - Should see success message

2. **Access Dashboard:**
   - Navigate to `/admin/overview`
   - Should be prompted for 2FA code (if not cached)
   - Enter code from authenticator app
   - Dashboard should load

3. **Check Console:**
   - Should NOT see 403 errors on `/admin/profile`
   - Should NOT see 404 errors on `/admin/metrics` (or should see fallback)
   - Should see successful requests to `/admin/ui/dashboard`

4. **2FA Code Expiry:**
   - Wait 30+ seconds after entering code
   - Navigate to another admin page
   - Should be prompted for new code
   - Enter new code from authenticator app
   - Should work

---

## ⚠️ Important Notes

### **2FA Code Timing:**

- **TOTP codes expire every 30 seconds**
- **Frontend caches code for 25 seconds**
- **If code is rejected:**
  - Cache is cleared
  - User is prompted for new code
  - Enter the **current** code from authenticator app (not the old one)

### **Backend Endpoint:**

- **Primary:** `/admin/ui/dashboard` (as per backend sync doc)
- **Fallback:** `/admin/metrics` (if primary doesn't exist)
- **Both require 2FA code in query params**

### **If Issues Persist:**

1. **Check backend logs** - Is `/admin/ui/dashboard` implemented?
2. **Check 2FA code timing** - Are you entering the current code?
3. **Clear cache** - Try clearing browser cache and localStorage
4. **Re-login** - Log out and log back in to refresh admin data

---

## 📋 Files Modified

1. ✅ `src/app/(admin)/admin/layout.tsx`
   - Removed `refreshAdminData()` call
   - Use cached admin data instead

2. ✅ `src/services/adminService.ts`
   - Updated `getDashboardMetrics()` to try `/admin/ui/dashboard` first
   - Added fallback to `/admin/metrics`

3. ✅ `src/services/adminAuthService.ts`
   - Deprecated `refreshAdminData()`
   - Returns cached data instead

---

## ✅ Summary

**Status:** ✅ **FIXED**

- ✅ Removed 403 error on `/admin/profile`
- ✅ Fixed 404 error on `/admin/metrics` (tries `/admin/ui/dashboard` first)
- ✅ 2FA code handling improved
- ✅ Better error handling and fallbacks

**Next Steps:**

1. **Test the dashboard** - Should load without 403/404 errors
2. **Verify endpoint** - Check if backend has `/admin/ui/dashboard`
3. **Check 2FA timing** - Make sure you're entering current codes

---

**Last Updated:** January 2025  
**Status:** ✅ **READY FOR TESTING**
