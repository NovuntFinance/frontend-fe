# Admin 2FA 403 Error - Debugging Guide

**Issue:** Getting 403 Forbidden even with 2FA code in query params

**Error:**

```
GET https://api.novunt.com/api/v1/admin/metrics?timeframe=30d&twoFACode=968410 403 (Forbidden)
```

---

## 🔍 Current Status

✅ **2FA code is being sent** in query params: `?twoFACode=968410`  
❌ **Backend still returns 403** Forbidden

---

## 🚨 Possible Causes

### **1. Backend Doesn't Read Query Params for GET Requests**

The backend might only accept 2FA code in:

- Request body (but GET requests can't have body)
- Headers (but CORS blocks `X-2FA-Code` header)

**Solution:** Backend needs to read `twoFACode` from query params for GET requests.

### **2. Admin Token Invalid/Expired**

The admin token might be expired or invalid, causing 403 before 2FA validation.

**Check:**

- Open DevTools → Application → Local Storage
- Look for `adminToken`
- Check if token exists and is valid

**Solution:** Re-login as admin to get fresh token.

### **3. 2FA Code Validation Failing**

The backend might be validating the 2FA code but it's failing:

- Code expired (entered after 30-second window)
- Time sync issue (authenticator app time is wrong)
- Wrong code format

**Solution:**

- Enter the **current** code from authenticator app
- Ensure authenticator app time is synced
- Try entering code immediately when it refreshes

### **4. Backend Expects Different Format**

The backend might expect:

- `twoFACode` vs `twoFA` vs `code`
- Different parameter name

**Solution:** Check backend documentation or logs.

---

## 🧪 Debugging Steps

### **Step 1: Check Console Logs**

Look for these logs in the browser console:

```
[AdminService] Added admin token to Authorization header
[AdminService] Requesting fresh 2FA code...
[AdminService] Cached new 2FA code
[AdminService] GET request with 2FA code in query params: {...}
```

If you see these, the frontend is working correctly.

### **Step 2: Check Network Tab**

1. Open DevTools → Network tab
2. Find the failed request to `/admin/metrics`
3. Click on it to see details
4. Check:
   - **Headers tab:** Is `Authorization: Bearer <token>` present?
   - **Query String Parameters:** Is `twoFACode` present?
   - **Response tab:** What error message does backend return?

### **Step 3: Check Backend Response**

Look at the **Response** tab in Network:

```json
{
  "success": false,
  "message": "...",
  "error": {
    "code": "2FA_CODE_INVALID" | "2FA_CODE_REQUIRED" | "2FA_MANDATORY" | ...,
    "message": "..."
  }
}
```

This will tell us exactly what the backend is complaining about.

### **Step 4: Verify Admin Token**

1. Open DevTools → Console
2. Run:
   ```javascript
   localStorage.getItem('adminToken');
   ```
3. If `null`, you need to login again
4. If token exists, check if it's expired

### **Step 5: Test with Fresh 2FA Code**

1. Clear the 2FA cache (refresh page)
2. Wait for authenticator app code to refresh (new 6-digit code)
3. Enter the **new** code immediately
4. Try again

---

## 🔧 Quick Fixes to Try

### **Fix 1: Re-login as Admin**

1. Log out from admin panel
2. Log back in
3. This will get a fresh admin token
4. Try accessing dashboard again

### **Fix 2: Clear 2FA Cache**

1. Open DevTools → Console
2. Run:
   ```javascript
   // This will clear the cached 2FA code
   location.reload();
   ```
3. Enter fresh 2FA code when prompted

### **Fix 3: Check Authenticator App Time**

1. Open your authenticator app (Google Authenticator, Authy, etc.)
2. Check if time is synced
3. Some apps have a "Sync time" option in settings
4. Sync time if needed

### **Fix 4: Enter Code Immediately**

1. Watch your authenticator app
2. When the code refreshes (new 6-digit number)
3. Enter it **immediately** (within 5-10 seconds)
4. Don't wait - codes expire after 30 seconds

---

## 📋 Backend Requirements Check

The backend should:

1. ✅ Accept `twoFACode` in query params for GET requests
2. ✅ Accept `twoFACode` in request body for POST/PUT/PATCH
3. ✅ Validate admin token from `Authorization` header
4. ✅ Validate 2FA code against admin's TOTP secret
5. ✅ Return proper error codes:
   - `2FA_CODE_REQUIRED` - Code not provided
   - `2FA_CODE_INVALID` - Code is wrong
   - `2FA_MANDATORY` - 2FA not enabled

---

## 🎯 Next Steps

1. **Check Network tab** for exact error response
2. **Verify admin token** is valid
3. **Try fresh 2FA code** (wait for new code in authenticator)
4. **Check backend logs** if you have access
5. **Contact backend team** if issue persists

---

## 📝 What to Report to Backend Team

If the issue persists, provide:

1. **Request URL:** `GET /api/v1/admin/metrics?timeframe=30d&twoFACode=968410`
2. **Request Headers:** `Authorization: Bearer <token>`
3. **Response Status:** `403 Forbidden`
4. **Response Body:** (from Network tab Response)
5. **Console Logs:** (from browser console)
6. **Admin Token:** (verify it exists and is valid)

---

**Status:** 🔍 **DEBUGGING IN PROGRESS**  
**Priority:** High
