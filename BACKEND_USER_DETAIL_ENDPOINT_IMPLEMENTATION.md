# 🔧 Backend: User Detail Endpoint Implementation

**Date:** January 2025  
**Priority:** 🔴 **HIGH** - Required for User Detail Page  
**Status:** ⏳ **NEEDS IMPLEMENTATION**

---

## 🎯 Issue

The frontend is trying to fetch individual user details using:

```
GET /api/v1/admin/users/:userId
```

**Current Error:**

- Status: `404 Not Found`
- Error Message: "The route /api/v1/admin/users/{userId} with the GET method shows Novunt API is running 🚀"
- This indicates the endpoint doesn't exist on the backend

---

## 📋 Required Endpoint

### **GET /api/v1/admin/users/:userId**

**Purpose:** Fetch detailed information about a specific user by ID.

**Authentication:**

- Requires: `Authorization: Bearer <adminToken>`
- Requires: 2FA code (if admin has 2FA enabled) - **Query parameter:** `?twoFACode=123456`
- Requires: `users.read` permission

**URL Parameters:**

- `userId` (string, required) - MongoDB ObjectId of the user

**Query Parameters:**

```typescript
{
  twoFACode?: string;  // Required if admin has 2FA enabled
}
```

**Example Request:**

```typescript
GET /api/v1/admin/users/6938ff57ffbeee122ed0caf6?twoFACode=818169
Headers:
  Authorization: Bearer <adminToken>
```

---

## 📤 Expected Response Structure

**Success Response (200 OK):**

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

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Error Response (403 Forbidden - 2FA Required):**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "2FA code is required for this operation"
  }
}
```

**Error Response (403 Forbidden - Invalid 2FA):**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_INVALID",
    "message": "Invalid 2FA code"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired admin token"
  }
}
```

---

## 🔧 Implementation Details

### **1. Route Definition**

```typescript
// routes/admin/users.ts or similar
router.get(
  '/users/:userId',
  authenticateAdmin, // Middleware: Verify admin token
  requirePermission('users.read'), // Middleware: Check permission
  validate2FA, // Middleware: Validate 2FA if enabled
  getUserById // Controller: Fetch user by ID
);
```

### **2. Controller Function**

```typescript
async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    // Validate userId format (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID format',
        },
      });
    }

    // Fetch user from database
    const user = await User.findById(userId)
      .select('-password -twoFASecret') // Exclude sensitive fields
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

    // Fetch rank information (if available)
    const rankInfo = await getRankInfo(userId); // Your existing rank calculation logic

    // Format response
    const response = {
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          fullName: `${user.fname} ${user.lname}`,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          rank: user.rank || 'Stakeholder',
          rankInfo: rankInfo
            ? {
                currentRank: rankInfo.currentRank,
                qualifiedRank: rankInfo.qualifiedRank,
                performancePoolQualified:
                  rankInfo.performancePoolQualified || false,
                premiumPoolQualified: rankInfo.premiumPoolQualified || false,
                nxp: rankInfo.nxp
                  ? {
                      totalNXP: rankInfo.nxp.totalNXP,
                      nxpLevel: rankInfo.nxp.nxpLevel,
                      totalNxpEarned: rankInfo.nxp.totalNxpEarned,
                    }
                  : undefined,
                requirements: rankInfo.requirements,
              }
            : undefined,
          totalInvested: user.totalInvested || 0,
          totalEarned: user.totalEarned || 0,
          activeStakes: await getActiveStakesCount(userId),
          totalReferrals: await getTotalReferralsCount(userId),
          lastLogin: user.lastLogin || null,
          createdAt: user.createdAt,
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

### **3. Helper Functions**

```typescript
// Get active stakes count
async function getActiveStakesCount(userId: string): Promise<number> {
  return await Stake.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    status: 'active',
  });
}

// Get total referrals count
async function getTotalReferralsCount(userId: string): Promise<number> {
  return await User.countDocuments({
    referredBy: new mongoose.Types.ObjectId(userId),
  });
}

// Get rank information (use your existing rank calculation logic)
async function getRankInfo(userId: string) {
  // Use your existing rank calculation service/function
  // This should return rank info with pool qualifications
  return await rankService.calculateRank(userId);
}
```

---

## 🔐 Security Requirements

1. **Authentication:**
   - Verify admin token is valid and not expired
   - Check admin has `users.read` permission

2. **2FA Validation:**
   - If admin has 2FA enabled, require `twoFACode` in query params
   - Validate 2FA code using your existing 2FA validation logic
   - 2FA codes can be reused within ~90-second validity window

3. **Data Privacy:**
   - Exclude sensitive fields: `password`, `twoFASecret`, etc.
   - Only return data that admins are authorized to see

---

## ✅ Testing Checklist

- [ ] **Valid Request:**
  - GET `/api/v1/admin/users/{validUserId}` with valid token and 2FA
  - Returns 200 with complete user data

- [ ] **Invalid User ID:**
  - GET `/api/v1/admin/users/invalidId`
  - Returns 400 with "INVALID_USER_ID" error

- [ ] **User Not Found:**
  - GET `/api/v1/admin/users/{nonExistentId}`
  - Returns 404 with "USER_NOT_FOUND" error

- [ ] **Missing Authentication:**
  - GET `/api/v1/admin/users/{userId}` without token
  - Returns 401 with "UNAUTHORIZED" error

- [ ] **Missing 2FA (when required):**
  - GET `/api/v1/admin/users/{userId}` without 2FA code (admin has 2FA enabled)
  - Returns 403 with "2FA_CODE_REQUIRED" error

- [ ] **Invalid 2FA:**
  - GET `/api/v1/admin/users/{userId}?twoFACode=000000` with invalid code
  - Returns 403 with "2FA_CODE_INVALID" error

- [ ] **Permission Check:**
  - GET `/api/v1/admin/users/{userId}` with admin without `users.read` permission
  - Returns 403 with "FORBIDDEN" error

---

## 🔗 Related Endpoints

This endpoint should follow the same patterns as:

- `GET /api/v1/admin/users` - List users (already implemented)
- `POST /api/v1/admin/users` - Create user (already implemented)
- `PATCH /api/v1/admin/users/:userId/status` - Update user status (if implemented)

---

## 📝 Notes

1. **Response Format:** Should match the structure used in `GET /api/v1/admin/users` for consistency
2. **Rank Information:** Should include full rank details with pool qualifications (Performance/Premium)
3. **Stakes Count:** Should return the actual count of active stakes, not just a boolean
4. **Performance:** Consider caching rank information if calculation is expensive

---

## 🚨 Current Status

**Frontend Status:** ✅ **READY**

- User detail page is implemented and waiting for this endpoint
- Error handling is in place
- Will redirect to users list if endpoint returns 404

**Backend Status:** ❌ **NOT IMPLEMENTED**

- Endpoint doesn't exist
- Returns 404 with generic "API is running" message

---

## ✅ After Implementation

Once this endpoint is implemented, the frontend user detail page will:

1. ✅ Load user information correctly
2. ✅ Display rank with pool qualifications
3. ✅ Show financial information (staked, earned, active stakes)
4. ✅ Display all user details in a formatted view

---

**Please implement this endpoint as soon as possible to enable the user detail page functionality!**
