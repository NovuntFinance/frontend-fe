# 🔧 Backend Fix Required: Admin 2FA for GET Requests

**Priority:** High  
**Issue:** Admin dashboard metrics endpoint returning 403 Forbidden even with valid 2FA code  
**Date:** January 2025

---

## 🎯 Problem Summary

The frontend is sending 2FA codes for admin GET requests (like `/api/v1/admin/metrics`) in **query parameters**, but the backend is returning **403 Forbidden**. The backend needs to be updated to read and validate 2FA codes from query parameters for GET requests.

---

## 🔍 Current Situation

### **What Frontend is Sending:**

**GET Request Example:**

```
GET /api/v1/admin/metrics?timeframe=30d&twoFACode=968410
Authorization: Bearer <admin-token>
```

**Request Details:**

- ✅ Admin token in `Authorization` header
- ✅ 2FA code in query parameter: `twoFACode=968410`
- ❌ Backend returns: `403 Forbidden`

### **Why Query Parameters?**

1. **GET requests cannot have request body** (HTTP specification)
2. **Headers are blocked by CORS** - `X-2FA-Code` header is not in `Access-Control-Allow-Headers`
3. **Query parameters are the only option** for GET requests

**CORS Headers (Current):**

```
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

Notice: `X-2FA-Code` is **NOT** in this list, so browsers block it.

---

## ✅ Solution Required

The backend needs to accept 2FA codes from **query parameters** for GET requests, in addition to the existing support for request body (POST/PUT/PATCH) and headers.

### **Backend Should Accept 2FA Code From:**

1. **Query Parameters** (for GET requests) - **NEW - NEEDS IMPLEMENTATION**

   ```
   GET /api/v1/admin/metrics?timeframe=30d&twoFACode=123456
   ```

2. **Request Body** (for POST/PUT/PATCH requests) - **ALREADY SUPPORTED**

   ```json
   {
     "value": "new value",
     "twoFACode": "123456"
   }
   ```

3. **Headers** (optional, but CORS blocks it) - **ALREADY SUPPORTED**
   ```
   X-2FA-Code: 123456
   ```

---

## 📋 Implementation Requirements

### **1. Update Admin Middleware/Auth Handler**

The admin authentication middleware should check for 2FA code in this order:

1. **Query parameters** (`req.query.twoFACode`) - **NEW**
2. **Request body** (`req.body.twoFACode`) - Already exists
3. **Headers** (`req.headers['x-2fa-code']`) - Already exists

### **2. Code Example (Node.js/Express)**

```javascript
// Admin authentication middleware
function validateAdmin2FA(req, res, next) {
  const adminToken = req.headers.authorization?.replace('Bearer ', '');

  if (!adminToken) {
    return res.status(401).json({
      success: false,
      message: 'Admin token required',
      error: { code: 'AUTH_REQUIRED' },
    });
  }

  // Extract 2FA code from multiple sources (priority order)
  const twoFACode =
    req.query.twoFACode || // ✅ NEW: Query params (for GET requests)
    req.body?.twoFACode || // Request body (for POST/PUT/PATCH)
    req.headers['x-2fa-code']; // Headers (optional)

  if (!twoFACode) {
    return res.status(403).json({
      success: false,
      message: '2FA code is required for admin operations',
      error: {
        code: '2FA_CODE_REQUIRED',
        message:
          'A 2FA code from your authenticator app is required for all admin operations. Please provide it in the query parameter as "twoFACode" (for GET requests), in the request body as "twoFACode" (for POST/PUT/PATCH), or in the header as "X-2FA-Code".',
      },
    });
  }

  // Validate admin token
  const admin = verifyAdminToken(adminToken);
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin token',
      error: { code: 'INVALID_TOKEN' },
    });
  }

  // Check if 2FA is enabled for admin
  if (!admin.twoFAEnabled) {
    return res.status(403).json({
      success: false,
      message: '2FA is mandatory for admin accounts',
      error: {
        code: '2FA_MANDATORY',
        message:
          'Two-factor authentication is mandatory for all admin accounts. Please enable 2FA in your settings before accessing the admin dashboard.',
        action: 'ENABLE_2FA',
      },
    });
  }

  // Validate 2FA code
  const isValid = validateTOTPCode(admin.twoFASecret, twoFACode);
  if (!isValid) {
    return res.status(403).json({
      success: false,
      message: 'Invalid 2FA code',
      error: {
        code: '2FA_CODE_INVALID',
        message:
          'The 2FA code you provided is invalid or has expired. Please enter the current 6-digit code from your authenticator app.',
      },
    });
  }

  // 2FA validated - proceed
  req.admin = admin;
  next();
}
```

### **3. Route Configuration**

```javascript
// GET routes (use query params)
router.get('/admin/metrics', validateAdmin2FA, getAdminMetrics);
router.get('/admin/settings', validateAdmin2FA, getAdminSettings);
router.get('/admin/users', validateAdmin2FA, getUsers);

// POST/PUT/PATCH routes (use request body)
router.post('/admin/settings', validateAdmin2FA, updateSettings);
router.put('/admin/users/:id', validateAdmin2FA, updateUser);
router.patch('/admin/withdrawal/:id', validateAdmin2FA, approveWithdrawal);
```

---

## 🧪 Testing Instructions

### **Test Case 1: GET Request with Query Parameter**

**Request:**

```bash
curl -X GET \
  'https://api.novunt.com/api/v1/admin/metrics?timeframe=30d&twoFACode=123456' \
  -H 'Authorization: Bearer <admin-token>'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "metrics": { ... },
    "charts": { ... }
  }
}
```

**If 2FA code is missing:**

```json
{
  "success": false,
  "message": "2FA code is required for admin operations",
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "..."
  }
}
```

**If 2FA code is invalid:**

```json
{
  "success": false,
  "message": "Invalid 2FA code",
  "error": {
    "code": "2FA_CODE_INVALID",
    "message": "The 2FA code you provided is invalid or has expired..."
  }
}
```

### **Test Case 2: POST Request with Request Body**

**Request:**

```bash
curl -X POST \
  'https://api.novunt.com/api/v1/admin/settings' \
  -H 'Authorization: Bearer <admin-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "key": "setting_key",
    "value": "new_value",
    "twoFACode": "123456"
  }'
```

**Expected:** Should work (already supported)

### **Test Case 3: GET Request Without 2FA Code**

**Request:**

```bash
curl -X GET \
  'https://api.novunt.com/api/v1/admin/metrics?timeframe=30d' \
  -H 'Authorization: Bearer <admin-token>'
```

**Expected Response:**

```json
{
  "success": false,
  "message": "2FA code is required for admin operations",
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "..."
  }
}
```

---

## 📝 Affected Endpoints

All admin GET endpoints need to support 2FA code in query parameters:

- ✅ `GET /api/v1/admin/metrics` - **CRITICAL** (dashboard)
- ✅ `GET /api/v1/admin/settings` - Settings page
- ✅ `GET /api/v1/admin/settings/:key` - Single setting
- ✅ `GET /api/v1/admin/settings/category/:category` - Category settings
- ✅ `GET /api/v1/admin/users` - User list
- ✅ `GET /api/v1/admin/users-balances` - User balances
- ✅ `GET /api/v1/admin/transactions` - Transactions
- ✅ Any other admin GET endpoints

---

## 🔄 Backward Compatibility

This change should be **backward compatible**:

- ✅ POST/PUT/PATCH requests continue to work with `twoFACode` in request body
- ✅ Headers continue to work (if CORS allows)
- ✅ GET requests now also work with `twoFACode` in query params

**No breaking changes** - existing functionality remains intact.

---

## 🚨 Important Notes

1. **Security:** 2FA codes in query parameters are visible in:
   - Browser history
   - Server logs
   - URL bar

   **This is acceptable** because:
   - Codes expire in 30 seconds
   - Codes are single-use (if backend implements rate limiting)
   - GET requests are idempotent (no data modification)

2. **CORS:** The `X-2FA-Code` header cannot be used because it's not in the allowed headers list. Query parameters bypass CORS restrictions.

3. **TOTP Validation:** Ensure the backend validates TOTP codes with a **time window** (typically ±1 period = ±30 seconds) to account for clock drift.

---

## ✅ Acceptance Criteria

The fix is complete when:

- [ ] GET requests with `twoFACode` in query params work
- [ ] POST/PUT/PATCH requests with `twoFACode` in body still work
- [ ] Proper error messages returned for missing/invalid codes
- [ ] All admin GET endpoints support query parameter 2FA
- [ ] Backward compatibility maintained
- [ ] Tests pass for all scenarios

---

## 📞 Questions?

If you need clarification on:

- TOTP validation implementation
- Error response formats
- Security considerations
- Testing scenarios

Please contact the frontend team.

---

## 🎯 Summary

**Problem:** Backend doesn't read 2FA code from query parameters for GET requests  
**Solution:** Update admin auth middleware to check `req.query.twoFACode`  
**Priority:** High (blocks admin dashboard access)  
**Estimated Effort:** 1-2 hours

---

**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Frontend Status:** ✅ **READY** (sending 2FA code in query params)
