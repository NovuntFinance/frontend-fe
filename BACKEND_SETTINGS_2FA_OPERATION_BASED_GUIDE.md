# Backend Implementation Guide: Operation-Based 2FA for Admin Endpoints

**Priority:** High  
**Issue:** Admin pages require 2FA for read-only operations  
**Expected Behavior:** 2FA only required for write operations (save, delete, update)  
**Date:** January 9, 2026

---

## 🎯 Problem Summary

Currently, admin pages (settings, users, transactions, dashboard) require 2FA authentication immediately upon page load. This creates a poor user experience where admins must enter a 2FA code just to view data.

**Current Behavior:**

- ❌ GET `/api/v1/admin/settings` → Requires 2FA
- ❌ GET `/api/v1/admin/users` → Requires 2FA
- ❌ GET `/api/v1/admin/transactions` → Requires 2FA
- ❌ Admin prompted for 2FA code immediately on page load
- ❌ Cannot view data without entering 2FA code

**Expected Behavior:**

- ✅ GET requests (view data) → **No 2FA required** (read-only)
- ✅ PUT/POST/DELETE requests (modify data) → **Requires 2FA** (write operations)
- ✅ Admin can browse all pages without 2FA
- ✅ 2FA prompted only when making changes

---

## 📋 Implementation Requirements

### **1. Update All Admin GET Endpoints**

Remove 2FA requirement from **read-only** GET endpoints:

```javascript
// ❌ REMOVE 2FA validation from GET endpoints
// router.get('/admin/settings', validateAdmin2FA, getAllSettings);
// router.get('/admin/users', validateAdmin2FA, getUsers);

// ✅ ADD standard admin auth only (no 2FA)
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

// Dashboard
router.get('/admin/ui/dashboard', validateAdminAuth, getDashboardMetrics);
router.get('/admin/profile', validateAdminAuth, getProfile);
```

### **2. Keep 2FA for Write Operations**

Maintain 2FA requirement for **write operations**:

```javascript
// ✅ KEEP 2FA validation for write endpoints

// Settings
router.put('/admin/settings/:key', validateAdmin2FA, updateSetting);
router.patch('/admin/settings/:key', validateAdmin2FA, patchSetting);
router.delete('/admin/settings/:key', validateAdmin2FA, deleteSetting);
router.post('/admin/settings/bulk', validateAdmin2FA, updateMultipleSettings);

// Users
router.post('/admin/users', validateAdmin2FA, createUser);
router.put('/admin/users/:id', validateAdmin2FA, updateUser);
router.patch('/admin/users/:id/status', validateAdmin2FA, updateUserStatus);
router.delete('/admin/users/:id', validateAdmin2FA, deleteUser);
router.post('/admin/admins', validateAdmin2FA, createAdmin);

// Transactions
router.patch('/admin/withdrawal/:id', validateAdmin2FA, approveWithdrawal);
router.post(
  '/admin/transactions/:id/approve',
  validateAdmin2FA,
  approveTransaction
);

// Password/Security
router.patch('/admin/password', validateAdmin2FA, updatePassword);
```

---

## 🔧 Middleware Implementation

### **Option 1: Two Separate Middlewares (Recommended)**

Create two distinct middleware functions:

```javascript
// =========================================
// 1. Standard Admin Authentication
// =========================================
function validateAdminAuth(req, res, next) {
  const adminToken = req.headers.authorization?.replace('Bearer ', '');

  if (!adminToken) {
    return res.status(401).json({
      success: false,
      message: 'Admin token required',
      error: { code: 'AUTH_REQUIRED' },
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

  // Check if admin account is active
  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Admin account is inactive',
      error: { code: 'ACCOUNT_INACTIVE' },
    });
  }

  // Attach admin to request
  req.admin = admin;
  next();
}

// =========================================
// 2. Admin Authentication WITH 2FA
// =========================================
function validateAdmin2FA(req, res, next) {
  // First validate admin auth (call the above middleware)
  validateAdminAuth(req, res, (err) => {
    if (err) return next(err);

    const admin = req.admin;

    // Extract 2FA code from multiple sources (priority order)
    const twoFACode =
      req.query.twoFACode || // Query params (for GET requests)
      req.body?.twoFACode || // Request body (for POST/PUT/PATCH)
      req.headers['x-2fa-code']; // Headers (optional)

    if (!twoFACode) {
      return res.status(403).json({
        success: false,
        message: '2FA code is required for this operation',
        error: {
          code: '2FA_CODE_REQUIRED',
          message:
            'A 2FA code from your authenticator app is required for write operations. Please provide it in the query parameter as "twoFACode" (for GET requests), in the request body as "twoFACode" (for POST/PUT/PATCH), or in the header as "X-2FA-Code".',
        },
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
            'Two-factor authentication is mandatory for all admin accounts. Please enable 2FA in your settings before performing write operations.',
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
    next();
  });
}
```

### **Option 2: Single Middleware with Flag (Alternative)**

```javascript
function validateAdmin(options = { require2FA: false }) {
  return (req, res, next) => {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');

    if (!adminToken) {
      return res.status(401).json({
        success: false,
        message: 'Admin token required',
        error: { code: 'AUTH_REQUIRED' },
      });
    }

    const admin = verifyAdminToken(adminToken);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token',
        error: { code: 'INVALID_TOKEN' },
      });
    }

    req.admin = admin;

    // If 2FA not required, proceed
    if (!options.require2FA) {
      return next();
    }

    // Validate 2FA code
    const twoFACode =
      req.query.twoFACode || req.body?.twoFACode || req.headers['x-2fa-code'];

    if (!twoFACode) {
      return res.status(403).json({
        success: false,
        message: '2FA code is required for this operation',
        error: { code: '2FA_CODE_REQUIRED' },
      });
    }

    if (!admin.twoFAEnabled) {
      return res.status(403).json({
        success: false,
        message: '2FA is mandatory for admin accounts',
        error: { code: '2FA_MANDATORY' },
      });
    }

    const isValid = validateTOTPCode(admin.twoFASecret, twoFACode);
    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: 'Invalid 2FA code',
        error: { code: '2FA_CODE_INVALID' },
      });
    }

    next();
  };
}

// Usage:
router.get(
  '/admin/settings',
  validateAdmin({ require2FA: false }),
  getAllSettings
);
router.put(
  '/admin/settings/:key',
  validateAdmin({ require2FA: true }),
  updateSetting
);
```

---

## 🗺️ Route Configuration

### **Complete Admin Settings Routes**

```javascript
const express = require('express');
const router = express.Router();

// =========================================
// READ ENDPOINTS - No 2FA Required
// =========================================

/**
 * GET /api/v1/admin/settings
 * Get all settings grouped by category
 * Auth: Admin token only
 */
router.get('/admin/settings', validateAdminAuth, getAllSettings);

/**
 * GET /api/v1/admin/settings/category/:category
 * Get settings by category
 * Auth: Admin token only
 */
router.get(
  '/admin/settings/category/:category',
  validateAdminAuth,
  getSettingsByCategory
);

/**
 * GET /api/v1/admin/settings/:key
 * Get single setting by key
 * Auth: Admin token only
 */
router.get('/admin/settings/:key', validateAdminAuth, getSetting);

// =========================================
// WRITE ENDPOINTS - 2FA Required
// =========================================

/**
 * PUT /api/v1/admin/settings/:key
 * Update single setting
 * Auth: Admin token + 2FA code
 * Body: { value: any, reason?: string, twoFACode: string }
 */
router.put('/admin/settings/:key', validateAdmin2FA, updateSetting);

/**
 * PATCH /api/v1/admin/settings/:key
 * Partially update setting
 * Auth: Admin token + 2FA code
 */
router.patch('/admin/settings/:key', validateAdmin2FA, patchSetting);

/**
 * POST /api/v1/admin/settings/bulk
 * Update multiple settings at once
 * Auth: Admin token + 2FA code
 * Body: { updates: Record<string, any>, reason?: string, twoFACode: string }
 */
router.post('/admin/settings/bulk', validateAdmin2FA, updateMultipleSettings);

/**
 * DELETE /api/v1/admin/settings/:key
 * Delete setting (if supported)
 * Auth: Admin token + 2FA code
 */
router.delete('/admin/settings/:key', validateAdmin2FA, deleteSetting);

module.exports = router;
```

---

## 🧪 Testing Instructions

### **Test Case 1: GET Settings Without 2FA (Should Work)**

**Request:**

```bash
curl -X GET \
  'https://novunt-backend-uw3z.onrender.com/api/v1/admin/settings' \
  -H 'Authorization: Bearer <admin-token>'
```

**Expected Response:** ✅ Success (200)

```json
{
  "success": true,
  "message": "Settings retrieved successfully",
  "data": {
    "general": [...],
    "security": [...],
    "staking": [...]
  }
}
```

### **Test Case 2: GET Settings with Invalid Token (Should Fail)**

**Request:**

```bash
curl -X GET \
  'https://novunt-backend-uw3z.onrender.com/api/v1/admin/settings' \
  -H 'Authorization: Bearer invalid-token'
```

**Expected Response:** ❌ Unauthorized (401)

```json
{
  "success": false,
  "message": "Invalid admin token",
  "error": { "code": "INVALID_TOKEN" }
}
```

### **Test Case 3: PUT Setting Without 2FA (Should Fail)**

**Request:**

```bash
curl -X PUT \
  'https://novunt-backend-uw3z.onrender.com/api/v1/admin/settings/referral_bonus' \
  -H 'Authorization: Bearer <admin-token>' \
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

### **Test Case 4: PUT Setting With Valid 2FA (Should Work)**

**Request:**

```bash
curl -X PUT \
  'https://novunt-backend-uw3z.onrender.com/api/v1/admin/settings/referral_bonus' \
  -H 'Authorization: Bearer <admin-token>' \
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

### **Test Case 5: PUT Setting With Invalid 2FA (Should Fail)**

**Request:**

```bash
curl -X PUT \
  'https://novunt-backend-uw3z.onrender.com/api/v1/admin/settings/referral_bonus' \
  -H 'Authorization: Bearer <admin-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "value": 50,
    "reason": "Updating referral bonus",
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

## 📝 Affected Endpoints Summary

### **✅ NO 2FA Required (Read-Only)**

| Method | Endpoint                               | Description              |
| ------ | -------------------------------------- | ------------------------ |
| GET    | `/api/v1/admin/settings`               | Get all settings         |
| GET    | `/api/v1/admin/settings/category/:cat` | Get settings by category |
| GET    | `/api/v1/admin/settings/:key`          | Get single setting       |

### **🔒 2FA Required (Write Operations)**

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| PUT    | `/api/v1/admin/settings/:key` | Update setting           |
| PATCH  | `/api/v1/admin/settings/:key` | Partially update setting |
| POST   | `/api/v1/admin/settings/bulk` | Update multiple settings |
| DELETE | `/api/v1/admin/settings/:key` | Delete setting           |

---

## 🎨 Apply This Pattern to Other Admin Endpoints

This operation-based 2FA pattern should be applied to other admin modules:

### **General Pattern:**

```javascript
// ✅ READ operations - No 2FA
GET /admin/users              → validateAdminAuth (no 2FA)
GET /admin/users/:id          → validateAdminAuth (no 2FA)
GET /admin/transactions       → validateAdminAuth (no 2FA)
GET /admin/metrics            → validateAdminAuth (no 2FA)

// 🔒 WRITE operations - Require 2FA
POST /admin/users             → validateAdmin2FA (2FA required)
PUT /admin/users/:id          → validateAdmin2FA (2FA required)
DELETE /admin/users/:id       → validateAdmin2FA (2FA required)
PATCH /admin/transactions/:id → validateAdmin2FA (2FA required)
POST /admin/withdrawals/:id/approve → validateAdmin2FA (2FA required)
```

### **Exceptions (Critical Read Operations):**

Some read operations may still require 2FA if they access highly sensitive data:

```javascript
// Sensitive data - may still require 2FA
GET /admin/user/:id/password-reset-token → validateAdmin2FA
GET /admin/financial-reports              → validateAdmin2FA
GET /admin/api-keys                       → validateAdmin2FA
```

---

## 🔄 Migration Strategy

### **Phase 1: Update Settings Endpoints (This Task)**

1. ✅ Create `validateAdminAuth` middleware (no 2FA)
2. ✅ Keep existing `validateAdmin2FA` middleware
3. ✅ Update settings GET routes to use `validateAdminAuth`
4. ✅ Keep settings PUT/PATCH/DELETE routes with `validateAdmin2FA`
5. ✅ Test all endpoints
6. ✅ Deploy to production

### **Phase 2: Apply to Other Modules (Future)**

1. Review all admin endpoints
2. Identify read vs write operations
3. Apply appropriate middleware
4. Test and deploy incrementally

---

## ✅ Implementation Checklist

### **Backend Tasks:**

- [ ] Create `validateAdminAuth` middleware (standard admin auth)
- [ ] Update `validateAdmin2FA` middleware (if needed)
- [ ] Update settings GET routes to use `validateAdminAuth`
- [ ] Verify settings PUT/PATCH/DELETE routes use `validateAdmin2FA`
- [ ] Test GET endpoints without 2FA → Should succeed
- [ ] Test GET endpoints with invalid token → Should fail (401)
- [ ] Test PUT endpoints without 2FA → Should fail (403)
- [ ] Test PUT endpoints with valid 2FA → Should succeed
- [ ] Test PUT endpoints with invalid 2FA → Should fail (403)
- [ ] Update API documentation
- [ ] Deploy to staging
- [ ] Verify frontend integration
- [ ] Deploy to production

### **Frontend Tasks (After Backend Deployed):**

- [ ] Remove automatic 2FA prompt from `useAdminSettings` hook
- [ ] Keep 2FA prompt for `updateSetting` and `updateMultipleSettings`
- [ ] Test settings page loads without 2FA prompt
- [ ] Test saving settings prompts for 2FA
- [ ] Test invalid 2FA shows error message
- [ ] Update user documentation

---

## 🚨 Important Security Notes

1. **Authentication vs Authorization:**
   - All endpoints require valid admin authentication (token)
   - Write operations additionally require 2FA
   - This maintains security while improving UX

2. **2FA Code Caching:**
   - Consider implementing 2FA code caching (85 seconds) on backend
   - Reduces number of 2FA prompts within short time windows
   - Maintains security while improving UX

3. **Rate Limiting:**
   - Implement rate limiting on 2FA validation
   - Prevent brute force attacks on 2FA codes
   - Lock account after 5 failed attempts

4. **Audit Logging:**
   - Log all write operations with admin user ID
   - Include 2FA validation status in logs
   - Track failed 2FA attempts

---

## 📞 Questions?

If you have questions or need clarification, contact the frontend team or refer to:

- Frontend implementation: `src/hooks/useAdminSettings.ts`
- Frontend service: `src/services/adminSettingsService.ts`
- Frontend component: `src/components/admin/SettingsManager.tsx`

---

## 🎉 Expected Outcome

After implementing this change:

✅ **Better User Experience:**

- Admins can browse settings without entering 2FA code
- 2FA only prompted when making changes
- Reduces friction in daily admin workflows

✅ **Maintains Security:**

- All endpoints still require admin authentication
- Write operations still require 2FA
- No reduction in security posture

✅ **Industry Best Practice:**

- Follows common pattern (read vs write permissions)
- Similar to AWS Console, Google Admin, etc.
- Balances security with usability
