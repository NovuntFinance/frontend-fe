# 🚨 Backend: Missing Endpoint - Suspend/Activate User

**Priority:** HIGH  
**Status:** NEEDS IMPLEMENTATION

---

## Issue

Frontend is calling `PATCH /api/v1/admin/users/:userId/status` but getting **404 Not Found**.

---

## Required Endpoint

**PATCH /api/v1/admin/users/:userId/status**

**Request Body:**

```json
{
  "status": "suspended", // "active" | "suspended" | "inactive"
  "twoFACode": "123456", // Required if admin has 2FA enabled
  "reason": "Optional reason"
}
```

**Response (200 OK):**

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

**Error Codes:**

- `400` - `INVALID_STATUS` | `INVALID_USER_ID`
- `404` - `USER_NOT_FOUND`
- `403` - `CANNOT_SUSPEND_SELF` | `2FA_CODE_REQUIRED` | `2FA_CODE_INVALID` | `FORBIDDEN`

**Requirements:**

- ✅ Auth: `Authorization: Bearer <adminToken>`
- ✅ 2FA: Validate 2FA code if admin has 2FA enabled
- ✅ Permission: `users.update`
- ✅ Business Rule: Admin cannot suspend themselves

**Route:**

```typescript
router.patch(
  '/users/:userId/status',
  authenticateAdmin,
  requirePermission('users.update'),
  validate2FA,
  updateUserStatus
);
```

---

**Full details:** See `BACKEND_SUSPEND_ACTIVATE_ENDPOINT_IMPLEMENTATION.md`

**Frontend is ready and waiting!** 🚀
