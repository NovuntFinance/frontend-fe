# 🔧 Backend Implementation: Suspend/Activate User Endpoint

**Date:** January 2025  
**Priority:** 🔴 **HIGH** - Required for User Management  
**Status:** ⏳ **NEEDS IMPLEMENTATION**

---

## 🎯 Issue

The frontend is trying to suspend/activate users using:

```
PATCH /api/v1/admin/users/:userId/status
```

**Current Error:**

- Status: `404 Not Found`
- Error Message: "The route /api/v1/admin/users/{userId}/status with the PATCH method shows Novunt API is running 🚀"
- This indicates the endpoint doesn't exist on the backend

---

## 📋 Required Endpoint

### **PATCH /api/v1/admin/users/:userId/status**

**Purpose:** Update a user's status (suspend, activate, or set to inactive).

**Authentication:**

- Requires: `Authorization: Bearer <adminToken>`
- Requires: 2FA code (if admin has 2FA enabled) - **Request body:** `{ twoFACode: "123456", status: "suspended" }`
- Requires: `users.update` permission

**URL Parameters:**

- `userId` (string, required) - MongoDB ObjectId of the user

**Request Body:**

```typescript
{
  status: 'active' | 'suspended' | 'inactive';  // Required
  twoFACode?: string;  // Required if admin has 2FA enabled
  reason?: string;     // Optional reason for status change
}
```

**Example Request:**

```typescript
PATCH /api/v1/admin/users/6937ed97ffbeee122ecd6501/status
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "status": "suspended",
  "twoFACode": "123456",
  "reason": "Violation of terms of service"
}
```

---

## 📤 Expected Response Structure

### **Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "user": {
      "id": "6937ed97ffbeee122ecd6501",
      "status": "suspended",
      "previousStatus": "active",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

### **Error Responses:**

#### **400 Bad Request - Invalid Status:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS",
    "message": "Invalid status. Must be one of: active, suspended, inactive"
  }
}
```

#### **400 Bad Request - Invalid User ID:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_USER_ID",
    "message": "Invalid user ID format"
  }
}
```

#### **404 Not Found - User Doesn't Exist:**

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

#### **403 Forbidden - Cannot Suspend Self:**

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_SUSPEND_SELF",
    "message": "You cannot suspend your own account"
  }
}
```

#### **403 Forbidden - 2FA Required:**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "2FA code is required for this operation"
  }
}
```

#### **403 Forbidden - Invalid 2FA:**

```json
{
  "success": false,
  "error": {
    "code": "2FA_CODE_INVALID",
    "message": "Invalid 2FA code"
  }
}
```

#### **403 Forbidden - Missing Permission:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to update user status"
  }
}
```

---

## 🔧 Implementation Guide

### **Step 1: Add Route Definition**

Add the route to your admin routes file (e.g., `routes/admin/users.ts`):

```typescript
import { Router } from 'express';
import { authenticateAdmin } from '@/middleware/adminAuth';
import { requirePermission } from '@/middleware/rbac';
import { validate2FA } from '@/middleware/2fa';
import { updateUserStatus } from '@/controllers/admin/users';

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
router.get(
  '/users/:userId',
  authenticateAdmin,
  requirePermission('users.read'),
  validate2FA,
  getUserById
);

// NEW ROUTE - Add this
router.patch(
  '/users/:userId/status',
  authenticateAdmin,
  requirePermission('users.update'),
  validate2FA,
  updateUserStatus
);

export default router;
```

### **Step 2: Create Controller Function**

Create or update the controller file (e.g., `controllers/admin/users.ts`):

```typescript
import { Request, Response } from 'express';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * Update user status (suspend/activate)
 * PATCH /api/v1/admin/users/:userId/status
 */
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user?._id || req.user?.id; // Get current admin ID

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID format',
        },
      });
    }

    // Validate status
    const validStatuses = ['active', 'suspended', 'inactive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Prevent admin from suspending themselves
    if (adminId && userId === adminId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CANNOT_SUSPEND_SELF',
          message: 'You cannot suspend your own account',
        },
      });
    }

    // Store previous status
    const previousStatus = user.isActive ? 'active' : user.status || 'inactive';

    // Update user status
    if (status === 'active') {
      user.isActive = true;
      user.status = 'active';
    } else if (status === 'suspended') {
      user.isActive = false;
      user.status = 'suspended';
    } else if (status === 'inactive') {
      user.isActive = false;
      user.status = 'inactive';
    }

    // Store reason if provided
    if (reason) {
      user.statusChangeReason = reason;
      user.statusChangedAt = new Date();
      user.statusChangedBy = adminId;
    }

    await user.save();

    // Format response
    const response = {
      success: true,
      message: `User status updated to ${status} successfully`,
      data: {
        user: {
          id: user._id.toString(),
          status: user.status,
          previousStatus,
          updatedAt: user.updatedAt || user.updated_at,
        },
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[updateUserStatus] Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user status',
      },
    });
  }
}
```

### **Step 3: Update User Model (if needed)**

Ensure your User model has these fields:

```typescript
{
  isActive: boolean;
  status?: 'active' | 'suspended' | 'inactive';
  statusChangeReason?: string;
  statusChangedAt?: Date;
  statusChangedBy?: mongoose.Types.ObjectId;
}
```

---

## 🔐 Security Requirements

1. **Authentication:**
   - Verify admin token is valid and not expired
   - Check admin has `users.update` permission

2. **2FA Validation:**
   - If admin has 2FA enabled, require `twoFACode` in request body
   - Validate 2FA code using your existing 2FA validation logic

3. **Business Rules:**
   - Admin cannot suspend themselves
   - Validate status value (only allow: active, suspended, inactive)
   - Log status changes for audit trail

---

## ✅ Testing Checklist

- [ ] **Valid Request:**
  - PATCH `/api/v1/admin/users/{validUserId}/status` with `{ status: "suspended" }`
  - Returns 200 with updated user data

- [ ] **Invalid Status:**
  - PATCH with `{ status: "invalid" }`
  - Returns 400 with "INVALID_STATUS" error

- [ ] **User Not Found:**
  - PATCH with non-existent userId
  - Returns 404 with "USER_NOT_FOUND" error

- [ ] **Suspend Self:**
  - Admin tries to suspend their own account
  - Returns 403 with "CANNOT_SUSPEND_SELF" error

- [ ] **Missing 2FA (when required):**
  - PATCH without 2FA code (admin has 2FA enabled)
  - Returns 403 with "2FA_CODE_REQUIRED" error

- [ ] **Invalid 2FA:**
  - PATCH with invalid 2FA code
  - Returns 403 with "2FA_CODE_INVALID" error

---

## 🔄 Consistency

This endpoint should follow the **exact same patterns** as other admin endpoints:

- ✅ Same authentication flow
- ✅ Same 2FA handling (request body for PATCH)
- ✅ Same permission checking
- ✅ Same response structure
- ✅ Same error codes and messages

---

## 📝 Files to Modify

1. **`routes/admin/users.ts`** (or similar)
   - Add `PATCH /users/:userId/status` route

2. **`controllers/admin/users.ts`** (or similar)
   - Add `updateUserStatus()` controller function

3. **`models/User.ts`** (if needed)
   - Add status-related fields if not already present

---

## ✅ After Implementation

Once implemented, the frontend suspend/activate button will:

1. ✅ Call the endpoint with user ID and new status
2. ✅ Show success message
3. ✅ Refresh user list to show updated status
4. ✅ Handle all error cases gracefully

---

**Status:** ⏳ **WAITING FOR BACKEND IMPLEMENTATION**

The frontend is ready and waiting for this endpoint!
