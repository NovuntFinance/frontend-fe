# 🔧 Backend Team: Operation-Based 2FA Implementation Request

**Priority:** High  
**Requested By:** Frontend Team  
**Date:** January 9, 2026  
**Status:** 🟡 Awaiting Implementation

---

## 📋 Executive Summary

We need to implement **operation-based 2FA** for all admin endpoints. Currently, 2FA is required for ALL admin operations including read-only GET requests. This creates a poor user experience where admins must enter a 2FA code just to view data.

**The Goal:**

- ✅ GET requests (viewing data) → **No 2FA required**
- ✅ POST/PUT/PATCH/DELETE (modifying data) → **Requires 2FA**

This is an industry-standard pattern used by AWS Console, Google Admin, and other major platforms.

---

## 🎯 The Problem

### **Current Behavior:**

1. Admin logs in with email, password, and 2FA code → Gets JWT token
2. Admin navigates to `/admin/users` page
3. Frontend makes `GET /api/v1/admin/users` request
4. **Backend requires 2FA code for GET request** ❌
5. Frontend prompts user for 2FA code again
6. Admin must enter 2FA code every time they want to view any page

**Issues:**

- ❌ Poor user experience (too many 2FA prompts)
- ❌ Admin can't browse data without repeated authentication
- ❌ 2FA code needed just to read data (not modifying anything)
- ❌ Makes admin dashboard frustrating to use

### **Expected Behavior:**

1. Admin logs in with email, password, and 2FA code → Gets JWT token
2. Admin navigates to `/admin/users` page
3. Frontend makes `GET /api/v1/admin/users` request
4. **Backend allows GET request with just JWT token** ✅ (no 2FA needed)
5. Users list displays immediately
6. Admin browses freely without 2FA prompts
7. Admin clicks "Suspend User" button
8. Frontend makes `PATCH /api/v1/admin/users/:id/status` request with 2FA code
9. **Backend requires 2FA code for PATCH request** ✅
10. Action is performed after 2FA validation

**Benefits:**

- ✅ Better user experience (fewer prompts)
- ✅ Admin can view data freely
- ✅ 2FA only when actually changing something
- ✅ Industry-standard security pattern
- ✅ Security maintained (write operations still protected)

---

## 🛠️ Implementation Requirements

### **1. Create Two Middleware Functions**

You need to create two separate authentication middlewares:

#### **A. Standard Admin Auth (No 2FA)**

For **read-only** operations (GET requests):

```javascript
/**
 * Validates admin authentication with JWT token only
 * No 2FA required - used for GET requests (viewing data)
 */
function validateAdminAuth(req, res, next) {
  try {
    // 1. Extract JWT token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin token required',
        error: { code: 'AUTH_REQUIRED' }
      });
    }

    // 2. Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user is admin
    if (!decoded.role || !['admin', 'superAdmin'].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        error: { code: 'FORBIDDEN' }
      });
    }

    // 4. Get full admin object from database
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
        error: { code: 'INVALID_TOKEN' }
      });
    }

    // 5. Check if admin account is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is not active',
        error: { code: 'ACCOUNT_INACTIVE' }
      });
    }

    // 6. Attach admin to request for route handlers
    req.admin = admin;

    // ✅ Proceed without 2FA requirement
    next();

  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: { code: 'INVALID_TOKEN' }
    });
  }
}
```

#### **B. Admin Auth WITH 2FA (Keep Existing)**

For **write operations** (POST/PUT/PATCH/DELETE):

```javascript
/**
 * Validates admin authentication with JWT token + 2FA code
 * 2FA required - used for POST/PUT/PATCH/DELETE requests (modifying data)
 */
function validateAdmin2FA(req, res, next) {
  try {
    // 1. First validate admin auth (same as above)
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin token required',
        error: { code: 'AUTH_REQUIRED' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token',
        error: { code: 'INVALID_TOKEN' }
      });
    }

    req.admin = admin;

    // 2. Extract 2FA code from request
    // Frontend sends 2FA code in different places depending on HTTP method:
    // - GET requests: query parameter (?twoFACode=123456)
    // - POST/PUT/PATCH: request body ({ twoFACode: "123456" })
    const twoFACode =
      req.query.twoFACode ||      // Query params (for GET if needed)
      req.body?.twoFACode ||      // Request body (for POST/PUT/PATCH)
      req.headers['x-2fa-code'];  // Headers (optional)

    // 3. Check if 2FA code was provided
    if (!twoFACode) {
      return res.status(403).json({
        success: false,
        message: '2FA code is required for this operation',
        error: {
          code: '2FA_CODE_REQUIRED',
          message: 'A 2FA code from your authenticator app is required for write operations. Please provide it in the request body as "twoFACode".'
        }
      });
    }

    // 4. Check if 2FA is enabled for this admin
    if (!admin.twoFAEnabled || !admin.twoFASecret) {
      return res.status(403).json({
        success: false,
        message: '2FA is mandatory for admin accounts',
        error: {
          code: '2FA_MANDATORY',
          message: 'Two-factor authentication is mandatory for all admin accounts. Please enable 2FA before performing write operations.',
          action: 'ENABLE_2FA'
        }
      });
    }

    // 5. Validate 2FA code using TOTP
    const isValid = speakeasy.totp.verify({
      secret: admin.twoFASecret,
      encoding: 'base32',
      token: twoFACode,
      window: 2  // Allow ±2 time steps (~90 seconds window)
    });

    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: 'Invalid 2FA code',
        error: {
          code: '2FA_CODE_INVALID',
          message: 'The 2FA code you provided is invalid or has expired. Please enter the current 6-digit code from your authenticator app.'
        }
      });
    }

    // ✅ 2FA validated - proceed with operation
    next();

  } catch (error) {
    console.error('Admin 2FA validation error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: { code: 'AUTH_FAILED' }
    });
  }
}
```

### **2. Update Route Definitions**

Update all admin routes to use the appropriate middleware:

```javascript
const express = require('express');
const router = express.Router();

// ========================================
// READ OPERATIONS - No 2FA Required
// ========================================

// Settings
router.get('/admin/settings', validateAdminAuth, getAllSettings);
router.get(
  '/admin/settings/category/:category',
  validateAdminAuth,
  getSettingsByCategory
);
router.get('/admin/settings/:key', validateAdminAuth, getSetting);

// Users
router.get('/admin/users', validateAdminAuth, getUsers);
router.get('/admin/users/:id', validateAdminAuth, getUserById);
router.get('/admin/users-balances', validateAdminAuth, getUsersWithBalances);

// Transactions
router.get('/admin/transactions', validateAdminAuth, getTransactions);

// Dashboard & Profile
router.get('/admin/ui/dashboard', validateAdminAuth, getDashboardMetrics);
router.get('/admin/profile', validateAdminAuth, getAdminProfile);

// ========================================
// WRITE OPERATIONS - 2FA Required
// ========================================

// Settings (Write)
router.put('/admin/settings/:key', validateAdmin2FA, updateSetting);
router.patch('/admin/settings/:key', validateAdmin2FA, patchSetting);
router.delete('/admin/settings/:key', validateAdmin2FA, deleteSetting);
router.post('/admin/settings/bulk', validateAdmin2FA, updateMultipleSettings);

// Users (Write)
router.post('/admin/users', validateAdmin2FA, createUser);
router.put('/admin/users/:id', validateAdmin2FA, updateUser);
router.patch('/admin/users/:id/status', validateAdmin2FA, updateUserStatus);
router.patch('/admin/users/:id/password', validateAdmin2FA, changeUserPassword);
router.delete('/admin/users/:id', validateAdmin2FA, deleteUser);

// Admins (Write)
router.post('/admin/admins', validateAdmin2FA, createAdmin);

// Transactions (Write)
router.patch('/admin/withdrawal/:id', validateAdmin2FA, approveWithdrawal);

// Password/Security (Write)
router.patch('/admin/password', validateAdmin2FA, updateAdminPassword);

module.exports = router;
```

---

## 🧪 Testing Instructions

### **Test Case 1: GET Request Without 2FA (Should Work)**

**Request:**

```bash
curl -X GET \
  'https://your-api.com/api/v1/admin/users?page=1&limit=10' \
  -H 'Authorization: Bearer <admin-jwt-token>'
```

**Expected Response:** ✅ Success (200)

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "pagination": { "page": 1, "limit": 10, "total": 50 }
  }
}
```

---

### **Test Case 2: GET Request With Invalid Token (Should Fail)**

**Request:**

```bash
curl -X GET \
  'https://your-api.com/api/v1/admin/users' \
  -H 'Authorization: Bearer invalid-token'
```

**Expected Response:** ❌ Unauthorized (401)

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": { "code": "INVALID_TOKEN" }
}
```

---

### **Test Case 3: PUT Request Without 2FA (Should Fail)**

**Request:**

```bash
curl -X PUT \
  'https://your-api.com/api/v1/admin/settings/referral_bonus' \
  -H 'Authorization: Bearer <admin-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "value": 50,
    "reason": "Updating referral bonus"
  }'
```

**Expected Response:** ❌ Forbidden (403)

```json
{
  "success": false,
  "message": "2FA code is required for this operation",
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "A 2FA code from your authenticator app is required..."
  }
}
```

---

### **Test Case 4: PUT Request With Valid 2FA (Should Work)**

**Request:**

```bash
curl -X PUT \
  'https://your-api.com/api/v1/admin/settings/referral_bonus' \
  -H 'Authorization: Bearer <admin-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "value": 50,
    "reason": "Updating referral bonus",
    "twoFACode": "123456"
  }'
```

**Expected Response:** ✅ Success (200)

```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "key": "referral_bonus",
    "value": 50,
    "updatedAt": "2026-01-09T12:34:56.789Z"
  }
}
```

---

### **Test Case 5: PUT Request With Invalid 2FA (Should Fail)**

**Request:**

```bash
curl -X PUT \
  'https://your-api.com/api/v1/admin/settings/referral_bonus' \
  -H 'Authorization: Bearer <admin-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "value": 50,
    "twoFACode": "000000"
  }'
```

**Expected Response:** ❌ Forbidden (403)

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

---

### **Test Case 6: PATCH User Status With 2FA (Should Work)**

**Request:**

```bash
curl -X PATCH \
  'https://your-api.com/api/v1/admin/users/user123/status' \
  -H 'Authorization: Bearer <admin-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "suspended",
    "twoFACode": "123456"
  }'
```

**Expected Response:** ✅ Success (200)

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "userId": "user123",
    "status": "suspended",
    "updatedAt": "2026-01-09T12:34:56.789Z"
  }
}
```

---

## 📊 Complete Endpoint List

### **✅ No 2FA Required (GET Requests)**

| Endpoint                            | Description              | Middleware          |
| ----------------------------------- | ------------------------ | ------------------- |
| `GET /admin/settings`               | Get all settings         | `validateAdminAuth` |
| `GET /admin/settings/category/:cat` | Get settings by category | `validateAdminAuth` |
| `GET /admin/settings/:key`          | Get single setting       | `validateAdminAuth` |
| `GET /admin/users`                  | Get users list           | `validateAdminAuth` |
| `GET /admin/users/:id`              | Get user details         | `validateAdminAuth` |
| `GET /admin/users-balances`         | Get users with balances  | `validateAdminAuth` |
| `GET /admin/transactions`           | Get transactions         | `validateAdminAuth` |
| `GET /admin/ui/dashboard`           | Get dashboard metrics    | `validateAdminAuth` |
| `GET /admin/profile`                | Get admin profile        | `validateAdminAuth` |

### **🔒 2FA Required (Write Operations)**

| Endpoint                    | Method | Description        | Middleware         |
| --------------------------- | ------ | ------------------ | ------------------ |
| `/admin/settings/:key`      | PUT    | Update setting     | `validateAdmin2FA` |
| `/admin/settings/:key`      | PATCH  | Patch setting      | `validateAdmin2FA` |
| `/admin/settings/:key`      | DELETE | Delete setting     | `validateAdmin2FA` |
| `/admin/settings/bulk`      | POST   | Bulk update        | `validateAdmin2FA` |
| `/admin/users`              | POST   | Create user        | `validateAdmin2FA` |
| `/admin/users/:id`          | PUT    | Update user        | `validateAdmin2FA` |
| `/admin/users/:id/status`   | PATCH  | Update status      | `validateAdmin2FA` |
| `/admin/users/:id/password` | PATCH  | Change password    | `validateAdmin2FA` |
| `/admin/users/:id`          | DELETE | Delete user        | `validateAdmin2FA` |
| `/admin/admins`             | POST   | Create admin       | `validateAdmin2FA` |
| `/admin/withdrawal/:id`     | PATCH  | Approve withdrawal | `validateAdmin2FA` |
| `/admin/password`           | PATCH  | Update password    | `validateAdmin2FA` |

---

## ✅ Implementation Checklist

### **Phase 1: Middleware Creation**

- [ ] Create `validateAdminAuth` middleware function
- [ ] Keep existing `validateAdmin2FA` middleware (or update it)
- [ ] Test both middlewares work correctly
- [ ] Ensure error responses match the format above

### **Phase 2: Route Updates**

- [ ] Update all GET routes to use `validateAdminAuth`
- [ ] Verify all POST/PUT/PATCH/DELETE routes use `validateAdmin2FA`
- [ ] Remove any old middleware that might conflict
- [ ] Update route documentation/comments

### **Phase 3: Testing**

- [ ] Test GET requests work without 2FA code
- [ ] Test GET requests fail with invalid token
- [ ] Test PUT/POST/PATCH fail without 2FA code
- [ ] Test write operations work with valid 2FA code
- [ ] Test write operations fail with invalid 2FA code
- [ ] Test all error messages are user-friendly

### **Phase 4: Deployment**

- [ ] Deploy to staging environment
- [ ] Notify frontend team for testing
- [ ] Frontend team verifies all pages work
- [ ] Fix any issues found
- [ ] Deploy to production
- [ ] Monitor error logs for any issues

---

## 🚨 Important Notes

### **Security Considerations:**

1. **Token Security:**
   - JWT tokens should still have short expiration (e.g., 24 hours)
   - Tokens should include admin role in payload
   - Use strong JWT secret

2. **2FA Code Validation:**
   - Use time window of ±2 steps (~90 seconds)
   - Don't cache 2FA codes on backend
   - Rate limit failed 2FA attempts (max 5 per minute)

3. **Error Messages:**
   - Be specific about what's wrong (401 vs 403)
   - Include error codes for frontend handling
   - Don't expose sensitive information in errors

4. **Audit Logging:**
   - Log all write operations with admin ID
   - Include 2FA validation status in logs
   - Track failed 2FA attempts
   - Alert on suspicious patterns

### **Backward Compatibility:**

This change should NOT break existing functionality:

- ✅ Old code using 2FA for GET requests will just work without 2FA
- ✅ Write operations continue to require 2FA as before
- ✅ No breaking changes to request/response formats
- ✅ Frontend is already updated and waiting for this change

---

## 🎉 Expected Outcome

After implementation:

**Better User Experience:**

- Admins can browse all pages without 2FA prompts
- 2FA only appears when making changes
- Faster navigation and workflow
- Less frustration

**Maintains Security:**

- All endpoints require valid JWT token
- Write operations still require 2FA
- No reduction in security posture
- Industry-standard pattern

**Frontend Ready:**

- Frontend code already updated
- Will work immediately after backend deploy
- No frontend changes needed
- Seamless transition

---

## 📞 Questions?

If you have questions or need clarification:

1. **Technical Questions:** Contact frontend team
2. **Security Review:** Discuss with security team
3. **Testing Help:** Frontend team can help test on staging

**Frontend Changes Already Made:**

- ✅ `src/services/adminService.ts` - All GET methods updated
- ✅ `src/services/adminSettingsService.ts` - All GET methods updated
- ✅ `src/hooks/useAdminSettings.ts` - No automatic 2FA prompts
- ✅ All write operations still prompt for 2FA

**References:**

- AWS Console: Viewing resources doesn't need MFA, only modifications do
- Google Admin: Similar pattern
- GitHub Settings: Read without 2FA, confirm with password for changes

---

## 🚀 Let's Make It Happen!

This change will significantly improve the admin experience while maintaining security. The frontend team is ready and waiting. Let's ship this! 🎯
