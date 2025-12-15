# 🚨 Backend Team: Urgent - Missing Endpoint Implementation

**Priority:** 🔴 **HIGH**  
**Status:** ⏳ **NEEDS IMPLEMENTATION**  
**Date:** January 2025

---

## 📋 Issue

The frontend is trying to suspend/activate users, but the backend endpoint is **missing** (404 error).

**Error:**

```
PATCH /api/v1/admin/users/:userId/status
Status: 404 Not Found
Message: "The route /api/v1/admin/users/{userId}/status with the PATCH method shows Novunt API is running 🚀"
```

---

## ✅ Required Endpoint

### **PATCH /api/v1/admin/users/:userId/status**

**Purpose:** Update a user's status (suspend, activate, or set to inactive).

---

## 📝 Implementation Requirements

### **1. Route Definition**

Add this route to your admin users routes:

```typescript
router.patch(
  '/users/:userId/status',
  authenticateAdmin,
  requirePermission('users.update'),
  validate2FA,
  updateUserStatus
);
```

### **2. Request Details**

**URL:** `PATCH /api/v1/admin/users/:userId/status`

**URL Parameters:**

- `userId` (string, required) - MongoDB ObjectId

**Request Body:**

```json
{
  "status": "suspended", // Required: "active" | "suspended" | "inactive"
  "twoFACode": "123456", // Required if admin has 2FA enabled
  "reason": "Violation of terms" // Optional
}
```

**Authentication:**

- ✅ Requires `Authorization: Bearer <adminToken>`
- ✅ Requires 2FA code in request body (if admin has 2FA enabled)
- ✅ Requires `users.update` permission

---

### **3. Response Structure**

**Success (200 OK):**

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

**Error Responses:**

| Status | Error Code            | Message                                                       |
| ------ | --------------------- | ------------------------------------------------------------- |
| 400    | `INVALID_STATUS`      | "Invalid status. Must be one of: active, suspended, inactive" |
| 400    | `INVALID_USER_ID`     | "Invalid user ID format"                                      |
| 404    | `USER_NOT_FOUND`      | "User not found"                                              |
| 403    | `CANNOT_SUSPEND_SELF` | "You cannot suspend your own account"                         |
| 403    | `2FA_CODE_REQUIRED`   | "2FA code is required for this operation"                     |
| 403    | `2FA_CODE_INVALID`    | "Invalid 2FA code"                                            |
| 403    | `FORBIDDEN`           | "You do not have permission to update user status"            |

---

### **4. Controller Function Example**

```typescript
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user?._id || req.user?.id;

    // Validate userId
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

    // Prevent self-suspension
    if (adminId && userId === adminId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CANNOT_SUSPEND_SELF',
          message: 'You cannot suspend your own account',
        },
      });
    }

    // Update status
    const previousStatus = user.isActive ? 'active' : user.status || 'inactive';

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

    return res.status(200).json({
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
    });
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

---

## 🔐 Security Requirements

1. ✅ **Authentication:** Verify admin token is valid
2. ✅ **2FA:** Validate 2FA code if admin has 2FA enabled (use existing 2FA middleware)
3. ✅ **Permission:** Check admin has `users.update` permission
4. ✅ **Business Rule:** Admin cannot suspend themselves
5. ✅ **Validation:** Validate status value and userId format

---

## ✅ Testing Checklist

Please test these scenarios:

- [ ] **Valid Request:** PATCH with valid userId and status → Returns 200
- [ ] **Invalid Status:** PATCH with `status: "invalid"` → Returns 400
- [ ] **Invalid User ID:** PATCH with invalid userId format → Returns 400
- [ ] **User Not Found:** PATCH with non-existent userId → Returns 404
- [ ] **Suspend Self:** Admin tries to suspend own account → Returns 403
- [ ] **Missing 2FA:** PATCH without 2FA code (admin has 2FA enabled) → Returns 403
- [ ] **Invalid 2FA:** PATCH with wrong 2FA code → Returns 403
- [ ] **No Permission:** Admin without `users.update` permission → Returns 403

---

## 🔄 Consistency

This endpoint should follow the **exact same patterns** as your other admin endpoints:

- ✅ Same authentication flow (`authenticateAdmin` middleware)
- ✅ Same 2FA handling (`validate2FA` middleware)
- ✅ Same permission checking (`requirePermission('users.update')`)
- ✅ Same response structure (`{ success, message, data }`)
- ✅ Same error codes and messages

---

## 📋 User Model Fields Needed

Ensure your User model has:

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

## 🚀 Frontend Status

✅ **Frontend is ready and waiting:**

- UI button implemented
- API call implemented (`adminService.updateUserStatus()`)
- Error handling implemented
- Mutation hook ready (`useUpdateUserStatus()`)

**Once you implement this endpoint, the suspend/activate feature will work immediately!**

---

## 📞 Questions?

If you need more details, see the full implementation guide:

- `BACKEND_SUSPEND_ACTIVATE_ENDPOINT_IMPLEMENTATION.md` (detailed guide)

Or contact the frontend team for clarification.

---

**Status:** ⏳ **WAITING FOR BACKEND IMPLEMENTATION**

Please implement this endpoint as soon as possible. The frontend is ready and waiting! 🚀
