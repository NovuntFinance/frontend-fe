# 🔍 2FA Modal Still Appearing - Debugging Guide

**Issue:** 2FA modal still appears on page load even after frontend fixes  
**Date:** January 9, 2026  
**Status:** 🔴 Needs Investigation

---

## ✅ Changes Already Made

The following files have been updated to NOT prompt for 2FA on GET requests:

1. **`src/services/adminService.ts`**
   - ✅ `getUsers()` - Uses `const get2FACode = async () => null;`
   - ✅ `getUserById()` - Uses `const get2FACode = async () => null;`
   - ✅ `getUsersWithBalances()` - Uses `const get2FACode = async () => null;`
   - ✅ `getTransactions()` - Uses `const get2FACode = async () => null;`
   - ✅ `getDashboardMetrics()` - Uses `const get2FACode = async () => null;`
   - ✅ `getProfile()` - Uses `const get2FACode = async () => null;`

2. **`src/services/adminSettingsService.ts`**
   - ✅ `getAllSettings()` - Uses `const get2FACode = async () => null;`
   - ✅ `getSettingsByCategory()` - Uses `const get2FACode = async () => null;`
   - ✅ `getSetting()` - Uses `const get2FACode = async () => null;`

3. **`src/hooks/useAdminSettings.ts`**
   - ✅ Removed automatic 2FA prompt from `fetchSettings()`

---

## 🐛 Troubleshooting Steps

### **Step 1: Clear Browser Cache & Restart Dev Server**

The issue might be cached code or stale dev server:

```bash
# Kill the dev server (Ctrl+C in terminal)
# Then restart:
pnpm run dev
```

**In Browser:**

1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear cache: DevTools → Application → Clear storage → Clear site data
3. Close and reopen the browser tab

### **Step 2: Check Console Logs**

Open browser DevTools (F12) and navigate to `/admin/users`. Look for these logs:

**Expected logs (GOOD):**

```
[AdminService] Added admin token to Authorization header
[AdminService] 2FA is not enabled, skipping 2FA requirement
```

OR

```
[AdminService] ✅ Token has is2FAVerified flag, skipping 2FA for GET request
```

OR

```
[AdminService] Checking if 2FA code is needed...
[AdminService] 2FA code not required for this request (GET operation)
```

**Problem logs (BAD):**

```
[TwoFAContext] Opening 2FA modal...
[AdminService] Requesting fresh 2FA code...
```

### **Step 3: Verify Code Changes Were Saved**

Check if the changes are actually in the file:

**Open:** `src/services/adminService.ts`  
**Find:** `async getUsers(params?:` (around line 376)  
**Should see:**

```typescript
async getUsers(params?: {
  // ...
}) {
  // For GET requests, don't prompt for 2FA - let backend handle it
  const get2FACode = async () => null;  // ← THIS LINE SHOULD BE HERE
  const api = createAdminApi(get2FACode);
  const response = await api.get('/admin/users', { params });
  return response.data;
}
```

**If this line is missing:** The file wasn't saved or changes were reverted. Re-apply the changes.

### **Step 4: Check if TypeScript/Build Errors Exist**

Sometimes build errors prevent code from being compiled:

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Or check the terminal where pnpm run dev is running
# Look for compilation errors
```

**If there are errors:** Fix them first, then test again.

### **Step 5: Verify React Query isn't Caching Old Behavior**

React Query might be caching the old API call pattern:

**In Browser DevTools Console:**

```javascript
// Clear React Query cache
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🔬 Advanced Debugging

### **Add Debug Logs to Trace the Issue**

If the problem persists, add temporary debug logs:

**In `src/services/adminService.ts`**, update `getUsers()`:

```typescript
async getUsers(params?: { /*...*/ }) {
  console.log('🔍 [DEBUG] getUsers called'); // ADD THIS

  const get2FACode = async () => {
    console.log('🔍 [DEBUG] get2FACode called, returning null'); // ADD THIS
    return null;
  };

  console.log('🔍 [DEBUG] Creating API instance'); // ADD THIS
  const api = createAdminApi(get2FACode);

  console.log('🔍 [DEBUG] Making GET request to /admin/users'); // ADD THIS
  const response = await api.get('/admin/users', { params });

  console.log('🔍 [DEBUG] Response received:', response.data); // ADD THIS
  return response.data;
}
```

**Expected Console Output:**

```
🔍 [DEBUG] getUsers called
🔍 [DEBUG] Creating API instance
[AdminService] Added admin token to Authorization header
🔍 [DEBUG] get2FACode called, returning null
[AdminService] Checking if 2FA code is needed...
[AdminService] 2FA code not required for this request (GET operation)
🔍 [DEBUG] Making GET request to /admin/users
🔍 [DEBUG] Response received: { users: [...], pagination: {...} }
```

**If you see:**

```
[TwoFAContext] Opening 2FA modal...
```

This means something else is calling `promptFor2FA()` that we haven't found yet.

### **Check Admin Layout Initialization**

The admin layout sets a global 2FA getter. Verify it's not interfering:

**Open:** `src/app/(admin)/admin/layout.tsx`  
**Find:** `rbacService.set2FACodeGetter(get2FACode);` (around line 39)

**This is OK** - The global getter is set, but our GET methods override it with a local getter that returns null.

---

## 🎯 Possible Root Causes

### **1. Dev Server Not Hot-Reloading**

**Solution:** Restart dev server (`pnpm run dev`)

### **2. Browser Cache**

**Solution:** Hard refresh (`Ctrl + Shift + R`)

### **3. TypeScript Compilation Error**

**Solution:** Check terminal for errors, fix them

### **4. Changes Not Saved**

**Solution:** Re-save the files, verify changes are in the file

### **5. React Query Caching**

**Solution:** Clear localStorage/sessionStorage

### **6. Old Token Without `is2FAVerified` Flag**

If your JWT token was issued before the backend update, it won't have the `is2FAVerified` flag.

**Solution:** Log out and log back in to get a new token:

1. Navigate to `/admin/login`
2. Click "Logout"
3. Login again with email, password, and 2FA code
4. New token will have `is2FAVerified: true`
5. No more 2FA prompts for GET requests!

### **7. Backend Still Requires 2FA for GET**

If backend hasn't been updated yet:

**Check Backend Response:**

```bash
# Make a direct API call
curl -X GET \
  'http://localhost:5000/api/v1/admin/users' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**If response is 403 with `2FA_CODE_REQUIRED`:** Backend not updated yet. Frontend will work once backend is deployed.

**If response is 200 with users data:** Backend is updated, issue is frontend only.

---

## ✅ Verification Checklist

After troubleshooting, verify:

- [ ] Dev server restarted
- [ ] Browser cache cleared (hard refresh)
- [ ] No TypeScript compilation errors
- [ ] Changes are saved in `src/services/adminService.ts`
- [ ] Console shows debug logs from the service
- [ ] No `[TwoFAContext] Opening 2FA modal...` log
- [ ] Users page loads without 2FA modal
- [ ] Settings page loads without 2FA modal
- [ ] No errors in browser console

---

## 🆘 If Problem Persists

### **Option 1: Nuclear Approach - Force Refresh Everything**

```bash
# Stop dev server (Ctrl+C)

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
pnpm run dev
```

**In Browser:**

```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('react-query');

// Hard reload
location.reload(true);
```

### **Option 2: Check if Another Service is Calling 2FA**

Search for any other code that might be prompting for 2FA:

```bash
# Search for promptFor2FA calls
grep -r "promptFor2FA" src/
```

**Expected results:**

- `src/contexts/TwoFAContext.tsx` - The context provider (OK)
- `src/hooks/useAdminSettings.ts` - Only for write operations (OK)
- `src/app/(admin)/admin/layout.tsx` - Global setter (OK)

**Unexpected results:**

- Any hooks or pages directly calling `promptFor2FA()` for GET requests

### **Option 3: Temporary Workaround - Comment Out Auto-Prompt**

If you need to demo immediately and can't debug further:

**In `src/contexts/TwoFAContext.tsx`**, temporarily disable the modal:

```typescript
const promptFor2FA = useCallback((): Promise<string | null> => {
  // TEMPORARY: Return null immediately without showing modal
  console.warn('[TwoFAContext] promptFor2FA called but disabled for debugging');
  return Promise.resolve(null);

  // Original code commented out:
  // return new Promise((resolve, reject) => {
  //   resolveRef.current = resolve;
  //   rejectRef.current = reject;
  //   setIsPrompting(true);
  //   setIsModalOpen(true);
  // });
}, []);
```

**⚠️ WARNING:** This is a temporary workaround! It will break write operations that need 2FA. Only use for debugging.

---

## 📞 Next Steps

1. **Try Step 1-5 first** (restart server, clear cache, verify code)
2. **If still not working:** Add debug logs (Advanced Debugging section)
3. **Check console output** to trace where 2FA prompt is triggered
4. **Share console logs** with the team for further help

---

## 🎉 Expected Behavior After Fix

- ✅ Navigate to `/admin/users` → Page loads immediately, no modal
- ✅ Navigate to `/admin/settings` → Page loads immediately, no modal
- ✅ Click "Edit User" → Make changes → Click "Save" → 2FA modal appears NOW
- ✅ Click "Update Setting" → 2FA modal appears NOW

**Remember:** 2FA should only appear when you're WRITING data, not reading it! 🔒
