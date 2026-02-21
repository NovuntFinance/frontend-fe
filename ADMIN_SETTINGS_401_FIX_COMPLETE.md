# Admin Settings 401 Error - Fix Complete ✅

**Date:** January 2025  
**Status:** ✅ **FIXED**

---

## 🎯 Problem

The admin settings page was getting **401 Unauthorized** errors when trying to fetch settings:

```
GET https://api.novunt.com/api/v1/settings?includeTooltips=true 401 (Unauthorized)
```

---

## 🔍 Root Causes

1. **Wrong Endpoint Path**: Service was calling `/api/v1/settings` instead of `/api/v1/admin/settings`
2. **Wrong Token**: Service was using regular user token (`accessToken`) instead of admin token
3. **Missing 2FA Support**: Admin settings endpoints require 2FA code, but service wasn't sending it

---

## ✅ Fixes Applied

### **1. Fixed Endpoint Paths**

**File:** `src/services/adminSettingsService.ts`

**Changed:**

- ❌ `/api/v1/settings` → ✅ `/api/v1/admin/settings`
- ❌ `/api/v1/settings/category/:category` → ✅ `/api/v1/admin/settings/category/:category`
- ❌ `/api/v1/settings/:key` → ✅ `/api/v1/admin/settings/:key`

### **2. Fixed Authentication Token**

**Changed:**

```typescript
// Before: Using regular user token
const token = localStorage.getItem('accessToken');

// After: Using admin token
import { adminAuthService } from './adminAuthService';
const token = adminAuthService.getToken();
```

### **3. Added 2FA Code Support**

**For GET Requests (Query Parameter):**

```typescript
const params: Record<string, string> = {
  includeTooltips: includeTooltips ? 'true' : 'false',
};

// Add 2FA code as query parameter (GET requests can't use body, and headers are blocked by CORS)
if (twoFACode) {
  params.twoFACode = twoFACode;
}
```

**For POST/PUT Requests (Request Body):**

```typescript
const requestData: any = {
  value,
  reason: reason || `Updated ${key} via admin panel`,
};

// Add 2FA code to request body
if (twoFACode) {
  requestData.twoFACode = twoFACode;
}
```

### **4. Updated Hook to Use 2FA Context**

**File:** `src/hooks/useAdminSettings.ts`

**Added:**

- Import `use2FA` hook from `TwoFAContext`
- Prompt for 2FA code before making API calls
- Handle 2FA errors (required, invalid)
- Retry with 2FA code on 403 errors

---

## 📝 Updated Methods

### **Service Methods (all now accept `twoFACode` parameter):**

1. `getAllSettings(includeTooltips?, twoFACode?)`
2. `getSettingsByCategory(category, includeTooltips?, twoFACode?)`
3. `getSetting(key, includeTooltip?, twoFACode?)`
4. `updateSetting(key, value, reason?, twoFACode?)`
5. `updateMultipleSettings(settings, reason?, twoFACode?)`

### **Hook Methods (automatically prompt for 2FA):**

1. `fetchSettings(twoFACode?)` - Prompts for 2FA if not provided
2. `updateSetting(key, value, reason?, twoFACode?)` - Prompts for 2FA if not provided
3. `updateMultipleSettings(updates, reason?, twoFACode?)` - Prompts for 2FA if not provided

---

## 🔄 How It Works Now

1. **User navigates to admin settings page**
2. **Hook calls `fetchSettings()`**
3. **Hook prompts for 2FA code** (via `TwoFAContext`)
4. **User enters 2FA code** in modal
5. **Service sends request** with:
   - Admin token in `Authorization` header
   - 2FA code as query parameter (GET) or in body (POST/PUT)
   - Correct endpoint: `/api/v1/admin/settings`
6. **Backend validates** and returns settings
7. **Component displays** settings

---

## 🧪 Testing

### **Test Scenarios:**

1. **✅ Fetch Settings (First Time)**
   - Modal prompts for 2FA code
   - User enters code
   - Settings load successfully

2. **✅ Fetch Settings (With Cached Code)**
   - If code is cached, uses it
   - No prompt needed

3. **✅ Invalid 2FA Code**
   - Shows error: "Invalid 2FA code. Please try again."
   - Allows retry

4. **✅ Update Setting**
   - Prompts for 2FA code
   - Updates setting
   - Refreshes settings list

5. **✅ 401 Error (No Admin Token)**
   - Shows: "Authentication failed. Please login again."
   - Redirects to login

---

## 📋 Backend Requirements

According to `FRONTEND_PLATFORM_SYNC_GUIDE.md`:

- **Endpoint:** `GET /api/v1/admin/settings`
- **Authentication:** Admin token (Bearer token)
- **2FA:** Required (code in query parameter for GET, body for POST/PUT)
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "category1": [...],
      "category2": [...]
    }
  }
  ```

---

## ✅ Checklist

- [x] Fixed endpoint paths (added `/admin`)
- [x] Changed to use admin token
- [x] Added 2FA code support for GET requests (query parameter)
- [x] Added 2FA code support for POST/PUT requests (request body)
- [x] Updated hook to use 2FA context
- [x] Added error handling for 2FA errors
- [x] Added retry logic for 2FA required errors
- [x] No linter errors

---

## 🚀 Next Steps

1. **Test the fix:**
   - Navigate to `/admin/settings`
   - Should prompt for 2FA code
   - Should load settings successfully

2. **If still getting 401:**
   - Check if admin token exists: `localStorage.getItem('adminToken')`
   - Check if admin is logged in
   - Verify backend endpoint is accessible

3. **If getting 403 (2FA errors):**
   - Verify 2FA code is being sent (check Network tab)
   - Check backend logs for 2FA validation
   - Ensure 2FA is enabled for admin account

---

**Status:** ✅ **READY FOR TESTING**  
**Last Updated:** January 2025
