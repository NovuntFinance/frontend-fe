# 🔧 Backend Implementation Prompt: User Detail Endpoint

**Priority:** 🔴 **HIGH** - Required for Admin User Detail Page  
**Estimated Time:** 2-4 hours  
**Status:** ⏳ **TO BE IMPLEMENTED**

---

## 📋 Executive Summary

The frontend admin panel has a "View" button on the users list page that should display detailed information about a specific user. Currently, clicking this button results in a **404 error** because the backend endpoint doesn't exist.

**Required Endpoint:** `GET /api/v1/admin/users/:userId`

**Current Status:**

- ❌ Endpoint doesn't exist (returns 404)
- ✅ Frontend is ready and waiting for this endpoint
- ✅ All other admin user endpoints are working (`GET /api/v1/admin/users`, `POST /api/v1/admin/users`, etc.)

---

## 🎯 What Needs to Be Implemented

### **Endpoint Specification**

```
GET /api/v1/admin/users/:userId
```

**Purpose:** Fetch detailed information about a specific user by their MongoDB ObjectId.

**Authentication & Authorization:**

- ✅ Requires valid admin JWT token in `Authorization: Bearer <token>` header
- ✅ Requires 2FA code if admin has 2FA enabled (query parameter: `?twoFACode=123456`)
- ✅ Requires `users.read` permission
- ✅ Should follow the same authentication pattern as `GET /api/v1/admin/users`

**URL Parameters:**

- `userId` (string, required) - MongoDB ObjectId of the user to fetch

**Query Parameters:**

- `twoFACode` (string, optional) - Required if admin has 2FA enabled

**Example Request:**

```http
GET /api/v1/admin/users/6938ff57ffbeee122ed0caf6?twoFACode=818169
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📤 Expected Response Format

### **Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6938ff57ffbeee122ed0caf6",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user",
      "status": "active",
      "rank": "Principal Strategist",
      "rankInfo": {
        "currentRank": "Principal Strategist",
        "qualifiedRank": "Principal Strategist",
        "performancePoolQualified": true,
        "premiumPoolQualified": false,
        "nxp": {
          "totalNXP": 1250,
          "nxpLevel": 5,
          "totalNxpEarned": 1250
        },
        "requirements": {
          "personalStake": 100,
          "teamStake": 10000,
          "directDownlines": 10,
          "rankBonusPercent": 17.5
        }
      },
      "totalInvested": 25000,
      "totalEarned": 5200,
      "activeStakes": 2,
      "totalReferrals": 5,
      "lastLogin": "2025-01-15T10:30:00.000Z",
      "createdAt": "2023-01-10T08:15:00.000Z"
    }
  }
}
```

### **Error Responses**

#### **404 Not Found - User Doesn't Exist**

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

#### **400 Bad Request - Invalid User ID Format**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_USER_ID",
    "message": "Invalid user ID format"
  }
}
```

#### **401 Unauthorized - Missing/Invalid Token**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired admin token"
  }
}
```

#### **403 Forbidden - 2FA Required**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "2FA code is required for this operation"
  }
}
```

#### **403 Forbidden - Invalid 2FA Code**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_INVALID",
    "message": "Invalid 2FA code"
  }
}
```

#### **403 Forbidden - Missing Permission**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to view user details"
  }
}
```

---

## 🔧 Step-by-Step Implementation Guide

### **Step 1: Add Route Definition**

Add the route to your admin routes file (e.g., `routes/admin/users.ts` or `routes/admin/index.ts`):

```typescript
import { Router } from 'express';
import { authenticateAdmin } from '@/middleware/adminAuth';
import { requirePermission } from '@/middleware/rbac';
import { validate2FA } from '@/middleware/2fa';
import { getUserById } from '@/controllers/admin/users';

const router = Router();

// Existing routes...
router.get(
  '/users',
  authenticateAdmin,
  requirePermission('users.read'),
  validate2FA,
  getUsers
);
router.post(
  '/users',
  authenticateAdmin,
  requirePermission('users.create'),
  validate2FA,
  createUser
);

// NEW ROUTE - Add this
router.get(
  '/users/:userId',
  authenticateAdmin,
  requirePermission('users.read'),
  validate2FA,
  getUserById
);

export default router;
```

### **Step 2: Create Controller Function**

Create or update the controller file (e.g., `controllers/admin/users.ts`):

```typescript
import { Request, Response } from 'express';
import User from '@/models/User';
import Stake from '@/models/Stake';
import mongoose from 'mongoose';
// Import your existing rank calculation service
import { calculateUserRank, getRankInfo } from '@/services/rankService';

/**
 * Get user by ID
 * GET /api/v1/admin/users/:userId
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    // Step 1: Validate userId format (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID format',
        },
      });
    }

    // Step 2: Fetch user from database
    const user = await User.findById(userId)
      .select('-password -twoFASecret -refreshToken') // Exclude sensitive fields
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Step 3: Fetch additional data
    const [activeStakesCount, totalReferrals, rankInfo] = await Promise.all([
      // Count active stakes
      Stake.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'active',
      }),

      // Count total referrals
      User.countDocuments({
        referredBy: new mongoose.Types.ObjectId(userId),
      }),

      // Get rank information (use your existing rank calculation logic)
      getRankInfo(userId), // This should return rank info with pool qualifications
    ]);

    // Step 4: Format response
    const response = {
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          fullName:
            `${user.fname || ''} ${user.lname || ''}`.trim() ||
            user.username ||
            user.email,
          email: user.email,
          phoneNumber: user.phoneNumber || null,
          avatar: user.avatar || user.profilePicture || null,
          role: user.role || 'user',
          status:
            user.isActive !== false ? 'active' : user.status || 'inactive',
          rank: user.rank || rankInfo?.currentRank || 'Stakeholder',
          rankInfo: rankInfo
            ? {
                currentRank: rankInfo.currentRank || user.rank || 'Stakeholder',
                qualifiedRank:
                  rankInfo.qualifiedRank ||
                  rankInfo.currentRank ||
                  user.rank ||
                  'Stakeholder',
                performancePoolQualified:
                  rankInfo.performancePoolQualified || false,
                premiumPoolQualified: rankInfo.premiumPoolQualified || false,
                nxp: rankInfo.nxp
                  ? {
                      totalNXP: rankInfo.nxp.totalNXP || 0,
                      nxpLevel: rankInfo.nxp.nxpLevel || 0,
                      totalNxpEarned: rankInfo.nxp.totalNxpEarned || 0,
                    }
                  : undefined,
                requirements: rankInfo.requirements || undefined,
              }
            : undefined,
          totalInvested: user.totalInvested || user.totalStaked || 0,
          totalEarned: user.totalEarned || user.totalROI || 0,
          activeStakes: activeStakesCount,
          totalReferrals: totalReferrals,
          lastLogin: user.lastLogin || null,
          createdAt: user.createdAt || user.created_at,
        },
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[getUserById] Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user details',
      },
    });
  }
}
```

### **Step 3: Implement Rank Info Helper (if not already exists)**

If you don't have a `getRankInfo` function, create one in your rank service:

```typescript
// services/rankService.ts or similar

import User from '@/models/User';
import Stake from '@/models/Stake';
import mongoose from 'mongoose';

export async function getRankInfo(userId: string) {
  try {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    // Calculate rank based on your existing business logic
    // This should match the logic used in GET /api/v1/admin/users

    // Example: Calculate based on stakes, referrals, etc.
    const totalStaked = user.totalInvested || user.totalStaked || 0;
    const directReferrals = await User.countDocuments({
      referredBy: new mongoose.Types.ObjectId(userId),
    });

    // Use your existing rank calculation logic here
    // This is just an example - replace with your actual logic
    const rank = calculateUserRank({
      totalStaked,
      directReferrals,
      // ... other criteria
    });

    // Check pool qualifications
    const performancePoolQualified = checkPerformancePoolQualification(userId);
    const premiumPoolQualified = checkPremiumPoolQualification(userId);

    // Get NXP data if available
    const nxp = user.nxp
      ? {
          totalNXP: user.nxp.totalNXP || 0,
          nxpLevel: user.nxp.level || 0,
          totalNxpEarned: user.nxp.totalEarned || 0,
        }
      : undefined;

    return {
      currentRank: rank.name || user.rank || 'Stakeholder',
      qualifiedRank:
        rank.qualifiedName || rank.name || user.rank || 'Stakeholder',
      performancePoolQualified,
      premiumPoolQualified,
      nxp,
      requirements: rank.requirements || undefined,
    };
  } catch (error) {
    console.error('[getRankInfo] Error:', error);
    return null;
  }
}
```

### **Step 4: Ensure Middleware is Applied**

Make sure your middleware stack includes:

1. `authenticateAdmin` - Verifies admin token
2. `requirePermission('users.read')` - Checks RBAC permission
3. `validate2FA` - Validates 2FA code if admin has 2FA enabled

These should already exist since `GET /api/v1/admin/users` uses them.

---

## 🔐 Security Requirements

### **1. Authentication**

- ✅ Verify admin JWT token is valid and not expired
- ✅ Token must be in `Authorization: Bearer <token>` header
- ✅ Return 401 if token is missing or invalid

### **2. Authorization**

- ✅ Check admin has `users.read` permission
- ✅ Return 403 if permission is missing
- ✅ Use your existing RBAC middleware

### **3. 2FA Validation**

- ✅ If admin has `twoFAEnabled: true`, require `twoFACode` in query params
- ✅ Validate 2FA code using your existing 2FA validation logic
- ✅ 2FA codes can be reused within ~90-second validity window
- ✅ Return 403 with `2FA_CODE_REQUIRED` if code is missing
- ✅ Return 403 with `2FA_CODE_INVALID` if code is wrong

### **4. Data Privacy**

- ✅ **NEVER** return sensitive fields:
  - `password` (hashed or plain)
  - `twoFASecret`
  - `refreshToken`
  - Any other sensitive authentication data
- ✅ Only return data that admins are authorized to see
- ✅ Validate `userId` format to prevent injection attacks

---

## 📊 Data Field Mapping

Map your database fields to the expected response format:

| Response Field   | Database Field(s)                        | Notes                 |
| ---------------- | ---------------------------------------- | --------------------- |
| `id`             | `_id`                                    | Convert to string     |
| `fullName`       | `fname + lname` or `username` or `email` | Fallback chain        |
| `email`          | `email`                                  | Direct mapping        |
| `phoneNumber`    | `phoneNumber`                            | Can be null           |
| `avatar`         | `avatar` or `profilePicture`             | Can be null           |
| `role`           | `role`                                   | Default to 'user'     |
| `status`         | `isActive` or `status`                   | Map boolean to string |
| `rank`           | `rank` or calculated                     | Use rank service      |
| `rankInfo`       | Calculated                               | Use rank service      |
| `totalInvested`  | `totalInvested` or `totalStaked`         | Default to 0          |
| `totalEarned`    | `totalEarned` or `totalROI`              | Default to 0          |
| `activeStakes`   | Count from Stake model                   | Count query           |
| `totalReferrals` | Count from User model                    | Count query           |
| `lastLogin`      | `lastLogin`                              | Can be null           |
| `createdAt`      | `createdAt` or `created_at`              | ISO string            |

---

## ✅ Testing Checklist

### **Manual Testing**

1. **✅ Valid Request**

   ```
   GET /api/v1/admin/users/{validUserId}?twoFACode=123456
   Authorization: Bearer <validAdminToken>
   ```

   - Should return 200 with complete user data
   - Verify all fields are present and correctly formatted

2. **✅ Invalid User ID Format**

   ```
   GET /api/v1/admin/users/invalidId?twoFACode=123456
   ```

   - Should return 400 with "INVALID_USER_ID" error

3. **✅ User Not Found**

   ```
   GET /api/v1/admin/users/507f1f77bcf86cd799439011?twoFACode=123456
   ```

   - Should return 404 with "USER_NOT_FOUND" error

4. **✅ Missing Authentication**

   ```
   GET /api/v1/admin/users/{userId}?twoFACode=123456
   (No Authorization header)
   ```

   - Should return 401 with "UNAUTHORIZED" error

5. **✅ Missing 2FA (when required)**

   ```
   GET /api/v1/admin/users/{userId}
   Authorization: Bearer <token>
   (Admin has 2FA enabled, but no twoFACode)
   ```

   - Should return 403 with "2FA_CODE_REQUIRED" error

6. **✅ Invalid 2FA Code**

   ```
   GET /api/v1/admin/users/{userId}?twoFACode=000000
   Authorization: Bearer <token>
   ```

   - Should return 403 with "2FA_CODE_INVALID" error

7. **✅ Missing Permission**
   ```
   GET /api/v1/admin/users/{userId}?twoFACode=123456
   Authorization: Bearer <tokenWithoutUsersReadPermission>
   ```

   - Should return 403 with "FORBIDDEN" error

### **Automated Testing**

Create unit tests and integration tests:

```typescript
describe('GET /api/v1/admin/users/:userId', () => {
  it('should return user details for valid user ID', async () => {
    // Test implementation
  });

  it('should return 404 for non-existent user', async () => {
    // Test implementation
  });

  it('should return 400 for invalid user ID format', async () => {
    // Test implementation
  });

  it('should require authentication', async () => {
    // Test implementation
  });

  it('should require 2FA if admin has 2FA enabled', async () => {
    // Test implementation
  });

  it('should require users.read permission', async () => {
    // Test implementation
  });
});
```

---

## 🔄 Consistency with Existing Endpoints

This endpoint should follow the **exact same patterns** as your existing `GET /api/v1/admin/users` endpoint:

1. ✅ Same authentication flow
2. ✅ Same 2FA handling (query params for GET requests)
3. ✅ Same permission checking
4. ✅ Same response structure (`success`, `data`, `error`)
5. ✅ Same error codes and messages
6. ✅ Same rank calculation logic
7. ✅ Same data formatting

**Reference:** Look at how `GET /api/v1/admin/users` is implemented and follow the same pattern.

---

## 🚨 Important Notes

1. **Response Structure:** Must match the structure used in `GET /api/v1/admin/users` for consistency. The `user` object in the list endpoint should have the same fields as the `user` object in the detail endpoint.

2. **Rank Information:** Should include full rank details with pool qualifications (Performance/Premium). Use the same rank calculation logic as the list endpoint.

3. **Stakes Count:** Should return the **actual count** of active stakes, not just a boolean. Use a count query on the Stake model.

4. **Performance:** Consider caching rank information if calculation is expensive, but ensure data is fresh.

5. **Error Handling:** Always return consistent error format with `success: false` and `error` object containing `code` and `message`.

---

## 📝 Implementation Checklist

- [ ] Add route definition to admin routes
- [ ] Create `getUserById` controller function
- [ ] Validate `userId` format (MongoDB ObjectId)
- [ ] Fetch user from database (exclude sensitive fields)
- [ ] Handle user not found (404)
- [ ] Count active stakes
- [ ] Count total referrals
- [ ] Get rank information (with pool qualifications)
- [ ] Format response to match expected structure
- [ ] Add error handling for all edge cases
- [ ] Test with valid user ID
- [ ] Test with invalid user ID format
- [ ] Test with non-existent user ID
- [ ] Test authentication requirements
- [ ] Test 2FA requirements
- [ ] Test permission requirements
- [ ] Verify response matches frontend expectations
- [ ] Update API documentation

---

## 🎯 Success Criteria

The endpoint is successfully implemented when:

1. ✅ Returns 200 with complete user data for valid requests
2. ✅ Returns appropriate error codes for invalid requests
3. ✅ Follows same authentication/authorization pattern as other admin endpoints
4. ✅ Response structure matches `GET /api/v1/admin/users` user object format
5. ✅ Frontend can successfully load user detail page
6. ✅ All tests pass
7. ✅ No sensitive data is exposed

---

## 📞 Questions or Issues?

If you encounter any issues during implementation:

1. **Check existing endpoints:** Look at `GET /api/v1/admin/users` implementation for reference
2. **Verify middleware:** Ensure authentication, RBAC, and 2FA middleware are working
3. **Test incrementally:** Test each part (auth, data fetch, formatting) separately
4. **Check database:** Verify user exists and has expected fields
5. **Review logs:** Check server logs for detailed error messages

---

## ✅ After Implementation

Once implemented, please:

1. ✅ Test the endpoint with Postman/curl
2. ✅ Verify frontend can load user details
3. ✅ Update API documentation
4. ✅ Deploy to staging environment
5. ✅ Notify frontend team that endpoint is ready

---

**This endpoint is critical for the admin user management feature. Please prioritize its implementation.**

**Estimated Implementation Time:** 2-4 hours (depending on existing rank calculation logic)

**Priority:** 🔴 **HIGH** - Blocks user detail page functionality
