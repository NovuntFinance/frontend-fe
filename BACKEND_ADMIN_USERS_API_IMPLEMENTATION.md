# Backend Implementation Guide: Admin Users Management API

**Priority:** 🔴 **URGENT** - Frontend is ready, waiting for backend endpoints

**Date:** January 2025

---

## 📋 Overview

The frontend has been fully implemented for the Admin Users Management page. The backend needs to implement **3 critical endpoints** to make this feature functional:

1. **GET /api/v1/admin/users** - Fetch paginated list of users with filters
2. **POST /api/v1/admin/users** - Create new user accounts
3. **POST /api/v1/admin/admins** - Create new admin accounts (Super Admin only)

---

## 🔐 Authentication & Authorization

### Requirements:

- ✅ **All endpoints require admin authentication** via `Authorization: Bearer <adminToken>` header
- ✅ **2FA code required** for all admin endpoints (if 2FA is enabled for the admin)
- ✅ **2FA code location:**
  - **GET requests:** Query parameter `?twoFACode=123456`
  - **POST/PUT/PATCH requests:** Request body `{ twoFACode: "123456", ... }`
- ✅ **Super Admin check:** Only `superAdmin` role can create other admins

---

## 📡 Endpoint 1: GET /api/v1/admin/users

### Purpose

Fetch paginated list of all users (both regular users and admins) with filtering, searching, and sorting capabilities.

### Request

**Method:** `GET`  
**Path:** `/api/v1/admin/users`  
**Headers:**

```
Authorization: Bearer <adminToken>
```

**Query Parameters:**

```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10
  search?: string;         // Search by name, email, or user ID
  role?: string;           // Filter by role: 'user', 'admin', 'superAdmin'
  status?: string;         // Filter by status: 'active', 'inactive', 'suspended', 'pending_verification'
  rank?: string;           // Filter by rank name (optional)
  hasActiveStakes?: boolean; // Filter users with active stakes (optional)
  twoFACode?: string;      // Required if admin has 2FA enabled (query param for GET)
}
```

**Example Request:**

```
GET /api/v1/admin/users?page=1&limit=10&search=john&role=user&status=active&twoFACode=123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Structure

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
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
        "kycStatus": "approved",
        "totalInvested": 25000,
        "totalEarned": 5200,
        "activeStakes": 2,
        "totalReferrals": 5,
        "lastLogin": "2025-01-15T10:30:00Z",
        "createdAt": "2023-01-10T08:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

### Response Field Details

#### User Object (`AdminUser`)

```typescript
{
  id: string;                    // MongoDB _id as string
  fullName: string;              // Concatenated fname + lname
  email: string;
  phoneNumber?: string;          // Optional
  avatar?: string;               // Profile picture URL (optional)
  role: string;                  // 'user' | 'admin' | 'superAdmin'
  status: string;                // 'active' | 'inactive' | 'suspended' | 'pending_verification'
  rank: string;                  // Current rank name (e.g., "Stakeholder", "Principal Strategist")
  rankInfo?: {                   // OPTIONAL but HIGHLY RECOMMENDED
    currentRank: string;
    qualifiedRank: string;
    performancePoolQualified: boolean;  // Blue tick indicator
    premiumPoolQualified: boolean;      // Green tick indicator
    nxp?: {
      totalNXP: number;
      nxpLevel: number;
      totalNxpEarned: number;
    };
    requirements?: {
      personalStake: number;
      teamStake: number;
      directDownlines: number;
      rankBonusPercent: number;
    };
  };
  kycStatus: string;            // 'not_submitted' | 'pending' | 'approved' | 'rejected'
  totalInvested: number;         // Total amount invested in USDT
  totalEarned: number;           // Total earnings in USDT
  activeStakes: number;         // Count of active stakes
  totalReferrals: number;        // Total number of referrals
  lastLogin?: string;           // ISO 8601 timestamp (optional)
  createdAt: string;            // ISO 8601 timestamp
}
```

#### Pagination Object

```typescript
{
  page: number; // Current page number
  limit: number; // Items per page
  total: number; // Total number of users matching filters
  totalPages: number; // Total number of pages (Math.ceil(total / limit))
}
```

### Error Responses

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired admin token"
  }
}
```

**403 Forbidden (2FA Required):**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "2FA code is required for this operation"
  }
}
```

**403 Forbidden (Invalid 2FA):**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_INVALID",
    "message": "Invalid 2FA code"
  }
}
```

**403 Forbidden (Not Admin):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only admins can access this endpoint"
  }
}
```

---

## 📡 Endpoint 2: POST /api/v1/admin/users

### Purpose

Create a new regular user account. This endpoint should create a user with the same structure as the registration endpoint, but bypasses email verification (or marks email as verified).

### Request

**Method:** `POST`  
**Path:** `/api/v1/admin/users`  
**Headers:**

```
Authorization: Bearer <adminToken>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  email: string;              // Required, must be unique
  username: string;           // Required, must be unique, min 3 chars
  password: string;           // Required, min 8 characters
  fname: string;              // Required, first name
  lname: string;              // Required, last name
  phoneNumber?: string;       // Optional
  countryCode?: string;       // Optional (e.g., "+1")
  referralCode?: string;      // Optional, if provided, link to referrer
  twoFACode?: string;         // Required if admin has 2FA enabled (in body for POST)
}
```

**Example Request:**

```json
{
  "email": "newuser@example.com",
  "username": "newuser123",
  "password": "SecurePass123!",
  "fname": "Jane",
  "lname": "Smith",
  "phoneNumber": "1234567890",
  "countryCode": "+1",
  "referralCode": "ABC123",
  "twoFACode": "123456"
}
```

### Response Structure

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "newuser@example.com",
      "username": "newuser123",
      "fname": "Jane",
      "lname": "Smith",
      "fullName": "Jane Smith",
      "phoneNumber": "1234567890",
      "countryCode": "+1",
      "role": "user",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

### Error Responses

**400 Bad Request (Validation Error):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email is already registered",
      "username": "Username must be at least 3 characters"
    }
  }
}
```

**403 Forbidden (2FA Required/Invalid):**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "2FA code is required for this operation"
  }
}
```

---

## 📡 Endpoint 3: POST /api/v1/admin/admins

### Purpose

Create a new admin account. **ONLY accessible by Super Admins**. Regular admins cannot create other admins.

### Request

**Method:** `POST`  
**Path:** `/api/v1/admin/admins`  
**Headers:**

```
Authorization: Bearer <adminToken>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  email: string;              // Required, must be unique
  username: string;           // Required, must be unique, min 3 chars
  password: string;           // Required, min 8 characters
  fname: string;              // Required, first name
  lname: string;              // Required, last name
  role: 'admin' | 'superAdmin'; // Required, role to assign
  phoneNumber?: string;       // Optional
  twoFACode?: string;         // Required if admin has 2FA enabled (in body for POST)
}
```

**Example Request:**

```json
{
  "email": "newadmin@example.com",
  "username": "newadmin",
  "password": "SecureAdminPass123!",
  "fname": "Admin",
  "lname": "User",
  "role": "admin",
  "phoneNumber": "1234567890",
  "twoFACode": "123456"
}
```

### Response Structure

**Success Response (201):**

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "_id": "507f1f77bcf86cd799439013",
      "email": "newadmin@example.com",
      "username": "newadmin",
      "fname": "Admin",
      "lname": "User",
      "role": "admin",
      "isActive": true,
      "emailVerified": true,
      "twoFAEnabled": false,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

### Error Responses

**403 Forbidden (Not Super Admin):**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only super admins can create admin accounts"
  }
}
```

**400 Bad Request (Validation Error):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email is already registered",
      "role": "Invalid role. Must be 'admin' or 'superAdmin'"
    }
  }
}
```

---

## 🔍 Implementation Details

### 1. User Data Aggregation

For the **GET /api/v1/admin/users** endpoint, you need to aggregate data from multiple sources:

```typescript
// Pseudocode for user aggregation
const users = await User.find(filters)
  .populate('rankInfo') // Get rank information
  .populate('nxp') // Get NXP data
  .populate('stakes') // Count active stakes
  .populate('referrals') // Count referrals
  .select(
    '_id email username fname lname phoneNumber avatar role status createdAt'
  );

// Calculate derived fields
users.forEach((user) => {
  user.id = user._id.toString();
  user.fullName = `${user.fname} ${user.lname}`;
  user.totalInvested = calculateTotalInvested(user.stakes);
  user.totalEarned = calculateTotalEarned(user.stakes, user.referrals);
  user.activeStakes = countActiveStakes(user.stakes);
  user.totalReferrals = countReferrals(user.referrals);
  user.rank = user.rankInfo?.currentRank || 'Stakeholder';
  user.rankInfo = {
    currentRank: user.rankInfo?.currentRank,
    qualifiedRank: user.rankInfo?.qualifiedRank,
    performancePoolQualified: checkPerformancePool(user.rankInfo),
    premiumPoolQualified: checkPremiumPool(user.rankInfo),
    nxp: {
      totalNXP: user.nxp?.totalNXP || 0,
      nxpLevel: calculateNXPLevel(user.nxp?.totalNXP || 0),
      totalNxpEarned: user.nxp?.totalNxpEarned || 0,
    },
    requirements: user.rankInfo?.requirements,
  };
});
```

### 2. Rank Information

The `rankInfo` object should be populated from your rank/team system. If you have a rank API endpoint, you can call it internally:

```typescript
// Example: Get rank info for each user
const rankInfo = await getRankInfo(userId);
user.rankInfo = {
  currentRank: rankInfo.currentRank,
  qualifiedRank: rankInfo.qualifiedRank,
  performancePoolQualified: rankInfo.performancePoolQualified,
  premiumPoolQualified: rankInfo.premiumPoolQualified,
  nxp: {
    totalNXP: user.nxp?.totalNXP || 0,
    nxpLevel: calculateNXPLevel(user.nxp?.totalNXP || 0),
    totalNxpEarned: user.nxp?.totalNxpEarned || 0,
  },
  requirements: rankInfo.requirements,
};
```

### 3. Search Functionality

The `search` parameter should search across:

- User's full name (`fname + lname`)
- Email address
- Username
- User ID (`_id`)

```typescript
// Example search implementation
if (search) {
  query.$or = [
    { email: { $regex: search, $options: 'i' } },
    { username: { $regex: search, $options: 'i' } },
    { fname: { $regex: search, $options: 'i' } },
    { lname: { $regex: search, $options: 'i' } },
    { _id: search }, // Exact match for ID
  ];
}
```

### 4. Filtering

```typescript
// Role filter
if (role && role !== 'all') {
  query.role = role;
}

// Status filter
if (status && status !== 'all') {
  query.status = status;
}

// Active stakes filter
if (hasActiveStakes === true) {
  query['stakes.status'] = 'active';
  query['stakes.0'] = { $exists: true }; // Has at least one stake
}
```

### 5. Pagination

```typescript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const users = await User.find(query).skip(skip).limit(limit).sort(sortOptions);

const total = await User.countDocuments(query);
const totalPages = Math.ceil(total / limit);

return {
  users,
  pagination: {
    page,
    limit,
    total,
    totalPages,
  },
};
```

---

## ✅ Testing Checklist

### GET /api/v1/admin/users

- [ ] Returns paginated users list
- [ ] Supports `page` and `limit` parameters
- [ ] Supports `search` parameter (name, email, username, ID)
- [ ] Supports `role` filter (user, admin, superAdmin)
- [ ] Supports `status` filter (active, inactive, suspended)
- [ ] Returns `rankInfo` with Performance/Premium pool flags
- [ ] Returns NXP information in `rankInfo.nxp`
- [ ] Returns correct pagination metadata
- [ ] Requires admin authentication
- [ ] Requires 2FA code if admin has 2FA enabled
- [ ] Returns 403 if non-admin tries to access

### POST /api/v1/admin/users

- [ ] Creates new user successfully
- [ ] Validates email uniqueness
- [ ] Validates username uniqueness
- [ ] Validates password strength (min 8 chars)
- [ ] Links referral if `referralCode` provided
- [ ] Marks email as verified (or sends verification)
- [ ] Requires admin authentication
- [ ] Requires 2FA code if admin has 2FA enabled
- [ ] Returns 201 with created user data

### POST /api/v1/admin/admins

- [ ] Creates new admin successfully
- [ ] Only accessible by superAdmin
- [ ] Validates email uniqueness
- [ ] Validates username uniqueness
- [ ] Validates role (admin or superAdmin only)
- [ ] Requires admin authentication
- [ ] Requires 2FA code if admin has 2FA enabled
- [ ] Returns 403 if regular admin tries to access
- [ ] Returns 201 with created admin data

---

## 🚨 Critical Notes

1. **2FA Code Handling:**
   - GET requests: `?twoFACode=123456` in query params
   - POST requests: `{ twoFACode: "123456" }` in request body
   - Validate 2FA code using the same logic as other admin endpoints

2. **Rank Information:**
   - The `rankInfo` field is **OPTIONAL** but **HIGHLY RECOMMENDED**
   - If rank info is not available, at minimum return the `rank` field
   - Frontend will gracefully handle missing `rankInfo`

3. **Data Transformation:**
   - Backend uses `_id` (MongoDB ObjectId)
   - Frontend expects `id` (string)
   - Transform: `id: user._id.toString()`

4. **Full Name:**
   - Backend stores `fname` and `lname` separately
   - Frontend expects `fullName`
   - Transform: `fullName: `${user.fname} ${user.lname}``

5. **Date Formats:**
   - All dates should be ISO 8601 strings: `"2025-01-15T10:30:00Z"`

6. **NXP Data:**
   - If NXP system is not implemented yet, you can return:
     ```json
     "nxp": {
       "totalNXP": 0,
       "nxpLevel": 0,
       "totalNxpEarned": 0
     }
     ```

---

## 📝 Response Format Consistency

All endpoints should follow this response structure:

**Success:**

```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }  // Optional, for validation errors
  }
}
```

---

## 🔗 Related Endpoints

If you need to fetch rank information, you may need to call:

- `GET /api/v1/users/:userId/rank` (if exists)
- Or use internal rank calculation service

If you need NXP information:

- `GET /api/v1/users/:userId/nxp` (if exists)
- Or query NXP collection directly

---

## 📞 Frontend Contact

If you have questions about the expected structure or need clarification, the frontend implementation is in:

- `src/services/adminService.ts` - API calls
- `src/lib/queries.ts` - React Query hooks
- `src/types/admin.ts` - TypeScript interfaces
- `src/app/(admin)/admin/users/page.tsx` - UI component

---

**Status:** ⏳ **Waiting for Backend Implementation**

Once these endpoints are implemented, the frontend will automatically start displaying real data!
