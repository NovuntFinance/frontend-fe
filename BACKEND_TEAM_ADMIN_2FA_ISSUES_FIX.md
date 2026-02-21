# 🔧 Backend Team - Admin 2FA Issues Fix Required

**Date:** January 2025  
**Priority:** 🔴 **HIGH**  
**Status:** ⚠️ **REQUIRES BACKEND FIX**

---

## 📋 Executive Summary

The frontend has been fully updated to support admin 2FA authentication with query parameters for GET requests. However, there are **critical backend issues** preventing the admin dashboard from working correctly:

1. **404 Error**: `/admin/ui/dashboard` endpoint doesn't exist (or returns 404)
2. **2FA Code Validation**: Valid 2FA codes are being rejected
3. **Endpoint Mismatch**: Backend documentation mentions `/admin/ui/dashboard` but it's not implemented

---

## 🎯 Issue 1: Missing Dashboard Endpoint (404 Error)

### **Problem**

Frontend is calling `/api/v1/admin/ui/dashboard` as specified in your `FRONTEND_SYNC_SUMMARY.md`, but the endpoint returns **404 Not Found**.

**Error from Frontend:**

```
GET https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=574846
Status: 404 (Not Found)
Error: ROUTE_NOT_FOUND - The route does not exist
```

**Backend Documentation Says:**

- `FRONTEND_SYNC_SUMMARY.md` line 286: `/api/v1/admin/ui/dashboard` - Dashboard data (use query param for 2FA)

**Frontend Implementation:**

- Frontend is correctly using `/admin/ui/dashboard`
- Frontend is correctly sending `twoFACode` in query parameters
- Frontend has fallback to `/admin/metrics` but that also returns 404

### **Required Fix**

**Option A: Implement `/admin/ui/dashboard` Endpoint**

```typescript
// GET /api/v1/admin/ui/dashboard
// Query Parameters:
//   - timeframe: string (e.g., "30d", "7d", "90d")
//   - twoFACode: string (6-digit code from authenticator app)

// Response Structure:
{
  "success": true,
  "data": {
    "metrics": {
      "users": {
        "total": number,
        "active": number,
        "new24h": number,
        "new7d": number,
        "growthPercentage": number
      },
      "stakes": {
        "total": number,
        "active": number,
        "completed": number,
        "totalValue": number,
        "averageStake": number
      },
      "transactions": {
        "total": number,
        "volume24h": number,
        "volume7d": number,
        "volumeTotal": number
      },
      "withdrawals": {
        "pending": number,
        "processing": number,
        "completed24h": number,
        "totalPending": number
      },
      "platform": {
        "totalBalance": number,
        "totalPaidROI": number,
        "totalBonusesPaid": number,
        "profit": number
      }
    },
    "charts": {
      "revenue": Array<{ date: string, value: number }>,
      "userGrowth": Array<{ date: string, value: number }>,
      "stakes": Array<{ date: string, value: number }>
    },
    "recentActivity": Array<{
      "id": string,
      "type": string,
      "description": string,
      "timestamp": string
    }>,
    "timeframe": "30d",
    "lastUpdated": "ISO timestamp"
  }
}
```

**Option B: Confirm Existing Endpoint**

If you have a different endpoint for dashboard data, please:

1. Confirm the correct endpoint path
2. Update `FRONTEND_SYNC_SUMMARY.md` with the correct endpoint
3. Ensure it accepts `twoFACode` in query parameters

### **Testing**

```bash
# Test with 2FA code in query params
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=123456" \
  -H "Authorization: Bearer <adminToken>"

# Expected: 200 OK with dashboard data
# Not Expected: 404 Not Found
```

---

## 🎯 Issue 2: 2FA Code Validation Problems

### **Problem**

User sets up 2FA successfully, but when they try to use the 2FA code:

1. **First use**: Code works (2FA setup completes)
2. **Second use**: Same code (within 30 seconds) is **rejected with 403 Forbidden**

**Error from Frontend:**

```
GET /api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=574846
Status: 403 (Forbidden)
Error: Invalid 2FA code or 2FA code required
```

**User Experience:**

- User sets up 2FA → Success ✅
- User enters code to access dashboard → Works ✅
- User navigates to another admin page → Prompted for 2FA again
- User enters **current code** from authenticator app → **Rejected** ❌

### **Possible Causes**

1. **TOTP Window Too Narrow**
   - Backend might only accept codes within a very small time window
   - TOTP codes are valid for 30 seconds, but backend might only accept ±1 time step

2. **Code Already Used**
   - Backend might be marking codes as "used" and rejecting them on second use
   - TOTP codes should be reusable within their 30-second window

3. **Time Synchronization**
   - Backend server time might be out of sync with authenticator app
   - TOTP requires accurate time synchronization

4. **2FA Secret Mismatch**
   - Backend might be using a different secret than what was set up
   - Secret might not be properly stored/retrieved

### **Required Fix**

**1. Verify TOTP Validation Logic**

```typescript
// Backend should accept codes within ±1 time step (30 seconds each)
// This means codes are valid for ~90 seconds total (current ±1 step)

import { authenticator } from 'otplib';

function validate2FACode(secret: string, code: string): boolean {
  // Accept codes within ±1 time step
  const isValid = authenticator.check(code, secret, {
    window: 1, // Accept current step ±1 (total 3 steps = ~90 seconds)
  });

  return isValid;
}
```

**2. Don't Mark Codes as "Used"**

- TOTP codes should **NOT** be stored as "used" tokens
- Same code should work multiple times within its validity window
- Only reject codes that are outside the time window

**3. Check Time Synchronization**

```typescript
// Ensure server time is synchronized
// Use NTP or system time sync
// Log time differences if validation fails
```

**4. Verify Secret Storage**

```typescript
// When user sets up 2FA:
// 1. Store secret in database
// 2. Verify it's stored correctly
// 3. When validating, retrieve the SAME secret

// Example:
const user = await User.findById(userId);
const secret = user.twoFASecret; // Should match what was set up
const isValid = validate2FACode(secret, providedCode);
```

### **Testing**

```bash
# Test 2FA code validation
# 1. Get current code from authenticator app
# 2. Use it immediately
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=CURRENT_CODE" \
  -H "Authorization: Bearer <adminToken>"

# 3. Use same code again within 30 seconds (should work)
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=SAME_CODE" \
  -H "Authorization: Bearer <adminToken>"

# Expected: Both requests should succeed
# Not Expected: Second request rejected with 403
```

---

## 🎯 Issue 3: 2FA Code in Query Parameters

### **Current Status**

✅ **Frontend is correctly sending 2FA codes in query parameters for GET requests**

**Example Request:**

```
GET /api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=123456
Authorization: Bearer <adminToken>
```

### **Backend Requirements**

**For GET Requests:**

- Read `twoFACode` from query parameters: `req.query.twoFACode`
- Validate the code using TOTP
- Return 403 if code is missing or invalid

**For POST/PUT/PATCH Requests:**

- Read `twoFACode` from request body: `req.body.twoFACode`
- Validate the code using TOTP
- Return 403 if code is missing or invalid

**Example Backend Implementation:**

```typescript
// Middleware: requireAdmin2FA
function requireAdmin2FA(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();

  // Get 2FA code from appropriate source
  let twoFACode: string | undefined;

  if (method === 'GET') {
    // GET requests: from query parameters
    twoFACode = req.query.twoFACode as string;
  } else {
    // POST/PUT/PATCH: from request body
    twoFACode = req.body?.twoFACode;
  }

  // Also check header (if CORS allows)
  if (!twoFACode) {
    twoFACode = req.headers['x-2fa-code'] as string;
  }

  if (!twoFACode) {
    return res.status(403).json({
      success: false,
      message: '2FA code is required for admin operations',
      error: {
        code: '2FA_CODE_REQUIRED',
        message: 'A 2FA code from your authenticator app is required',
        acceptedFormats: {
          queryParameter: '?twoFACode=123456 (for GET requests)',
          requestBody:
            '{ "twoFACode": "123456" } (for POST/PUT/PATCH requests)',
          header: 'X-2FA-Code: 123456 (for any request)',
        },
      },
    });
  }

  // Validate 2FA code
  const admin = req.user; // From auth middleware
  const secret = admin.twoFASecret;

  if (!secret) {
    return res.status(403).json({
      success: false,
      message: '2FA is not set up for this account',
      error: {
        code: '2FA_SETUP_INCOMPLETE',
        message: 'Please set up 2FA before accessing admin endpoints',
      },
    });
  }

  const isValid = validate2FACode(secret, twoFACode);

  if (!isValid) {
    return res.status(403).json({
      success: false,
      message: 'Invalid 2FA code',
      error: {
        code: '2FA_CODE_INVALID',
        message:
          'Invalid 2FA code. Please enter the 6-digit code from your authenticator app.',
      },
    });
  }

  // Code is valid, proceed
  next();
}
```

---

## 📋 Complete Checklist for Backend Team

### **Priority 1: Critical (Blocks Admin Dashboard)**

- [ ] **Implement `/admin/ui/dashboard` endpoint**
  - Accept `timeframe` query parameter
  - Accept `twoFACode` query parameter
  - Return dashboard metrics, charts, and activity data
  - Test with valid 2FA code

- [ ] **Fix 2FA code validation**
  - Accept codes within ±1 time step (90-second window)
  - Don't mark codes as "used"
  - Verify time synchronization
  - Test same code multiple times within 30 seconds

- [ ] **Verify query parameter reading**
  - Ensure `req.query.twoFACode` is read correctly
  - Log the received code for debugging
  - Test with various code formats

### **Priority 2: Important (Improves UX)**

- [ ] **Update error messages**
  - Provide clear error messages for invalid codes
  - Include hints about time windows
  - Suggest checking authenticator app time sync

- [ ] **Add logging**
  - Log 2FA validation attempts
  - Log time differences if validation fails
  - Log which code was received vs. expected

- [ ] **Test edge cases**
  - Code at start of 30-second window
  - Code at end of 30-second window
  - Code from previous/next time step
  - Multiple rapid requests with same code

### **Priority 3: Nice to Have**

- [ ] **Document endpoint**
  - Update API documentation
  - Include request/response examples
  - Document error codes

- [ ] **Add monitoring**
  - Track 2FA validation success/failure rates
  - Alert on high failure rates
  - Monitor time sync issues

---

## 🧪 Testing Instructions

### **Test 1: Dashboard Endpoint Exists**

```bash
# Should return 200 OK with dashboard data
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=123456" \
  -H "Authorization: Bearer <adminToken>"

# Expected: 200 OK
# Not Expected: 404 Not Found
```

### **Test 2: 2FA Code Validation**

```bash
# Step 1: Get current code from authenticator app
CURRENT_CODE="123456"  # Replace with actual code

# Step 2: Use code immediately
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=$CURRENT_CODE" \
  -H "Authorization: Bearer <adminToken>"

# Expected: 200 OK

# Step 3: Use same code again within 30 seconds
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=$CURRENT_CODE" \
  -H "Authorization: Bearer <adminToken>"

# Expected: 200 OK (same code should work)
# Not Expected: 403 Forbidden
```

### **Test 3: Query Parameter Reading**

```bash
# Test that backend reads twoFACode from query params
curl -X GET "https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=123456" \
  -H "Authorization: Bearer <adminToken>" \
  -v

# Check backend logs to confirm:
# - twoFACode is received: "123456"
# - Code is validated correctly
# - No errors about missing code
```

---

## 📊 Expected vs. Actual Behavior

### **Expected Behavior**

1. **User sets up 2FA** → Backend stores secret ✅
2. **User enters code** → Backend validates code ✅
3. **User uses code again (within 30s)** → Backend accepts same code ✅
4. **User calls `/admin/ui/dashboard`** → Backend returns dashboard data ✅

### **Actual Behavior (Current Issues)**

1. **User sets up 2FA** → Backend stores secret ✅
2. **User enters code** → Backend validates code ✅
3. **User uses code again (within 30s)** → Backend **rejects code** ❌
4. **User calls `/admin/ui/dashboard`** → Backend returns **404 Not Found** ❌

---

## 🔍 Debugging Information

### **Frontend Request Details**

**Request URL:**

```
GET https://api.novunt.com/api/v1/admin/ui/dashboard?timeframe=30d&twoFACode=574846
```

**Headers:**

```
Authorization: Bearer <adminToken>
Content-Type: application/json
```

**Query Parameters:**

- `timeframe`: "30d"
- `twoFACode`: "574846" (6-digit code from authenticator app)

### **Backend Should Log**

```typescript
// Recommended logging in backend
console.log('[2FA Validation]', {
  userId: admin._id,
  receivedCode: twoFACode,
  secretExists: !!admin.twoFASecret,
  validationResult: isValid,
  timeStep: currentTimeStep,
  serverTime: new Date(),
  codeAge: 'N/A', // If tracking code age
});
```

---

## 📞 Next Steps

1. **Backend Team:**
   - Review this document
   - Implement `/admin/ui/dashboard` endpoint
   - Fix 2FA code validation logic
   - Test with provided test cases
   - Update documentation if endpoint changes

2. **Frontend Team:**
   - Wait for backend fixes
   - Test after backend deployment
   - Report any remaining issues

3. **Testing:**
   - Test complete flow: Setup → Use → Reuse
   - Test dashboard loading
   - Test error handling

---

## 📝 Additional Notes

### **TOTP Code Validity**

- **Standard TOTP**: Codes are valid for 30 seconds
- **Time Step**: Usually 30 seconds
- **Window**: Backend should accept ±1 time step (total ~90 seconds)
- **Reusability**: Same code should work multiple times within its window

### **Common TOTP Issues**

1. **Time Sync**: Server and authenticator app must be synchronized
2. **Secret Mismatch**: Secret used for validation must match setup secret
3. **Window Too Narrow**: Backend might only accept exact current step
4. **Code Marking**: Backend shouldn't mark codes as "used"

### **Recommended Libraries**

- **Node.js**: `otplib` or `speakeasy`
- **Validation**: Use `window: 1` for ±1 time step tolerance
- **Time Sync**: Use NTP or system time sync

---

## ✅ Summary

**Critical Issues:**

1. ❌ `/admin/ui/dashboard` endpoint returns 404
2. ❌ Valid 2FA codes are being rejected on second use

**Frontend Status:**

- ✅ Correctly sending 2FA codes in query parameters
- ✅ Correctly handling errors
- ✅ Ready for backend fixes

**Backend Action Required:**

- 🔴 Implement `/admin/ui/dashboard` endpoint
- 🔴 Fix 2FA code validation (accept ±1 time step, don't mark as used)
- 🔴 Test with provided test cases

---

**Last Updated:** January 2025  
**Priority:** 🔴 **HIGH**  
**Status:** ⚠️ **AWAITING BACKEND FIX**

---

**Contact:** Frontend team is ready to test once backend fixes are deployed.
