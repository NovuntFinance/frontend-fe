# Complete User Flow Guide

## 📋 Overview

This guide provides step-by-step user flows for all implemented features:

- Admin Authentication & 2FA Setup
- RBAC Permission System
- Dynamic Configuration Management
- Admin Operations

---

## 🔐 Flow 1: Admin Login & 2FA Setup

### Step 1: Admin Login

**User Action:**

1. Navigate to `/admin/login` (or `/login` with admin credentials)
2. Enter admin email/username and password
3. Click "Login"

**What Happens:**

```typescript
// Frontend calls:
await adminAuthService.login({
  identifier: "admin@novunt.com",
  password: "SecurePassword123!"
});

// Backend returns:
{
  success: true,
  data: {
    user: {
      _id: "...",
      email: "admin@novunt.com",
      role: "admin",
      twoFAEnabled: false,  // ← Not enabled yet
      twoFASecret: null
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Result:**

- Token stored in `localStorage` as `adminToken`
- User data stored in `localStorage` as `adminUser`
- Redirect to admin dashboard

---

### Step 2: 2FA Check (Automatic)

**What Happens Automatically:**

```typescript
// Admin layout checks 2FA status
const admin = adminAuthService.getCurrentAdmin();
if (!admin.twoFAEnabled || !admin.twoFASecret) {
  // Redirect to 2FA setup
  router.push('/admin/setup-2fa');
}
```

**User Experience:**

- If 2FA not enabled → Automatically redirected to `/admin/setup-2fa`
- If 2FA enabled → Proceed to admin dashboard

---

### Step 3: 2FA Setup Flow

**User Action:**

1. Land on `/admin/setup-2fa` page
2. Click "Generate QR Code" button

**What Happens:**

```typescript
// Frontend calls:
const response = await twoFAService.generateSecret(admin.email);

// Backend returns:
{
  success: true,
  data: {
    secret: "JBSWY3DPEHPK3PXP",
    qrCode: "data:image/png;base64,iVBORw0KGgo...",
    manualEntryKey: "JBSW Y3DP EHPK 3PXP"
  }
}
```

**User Action:** 3. Open Google Authenticator (or similar app) on phone 4. Scan QR code OR manually enter the key 5. Enter the 6-digit code from the app 6. Click "Enable 2FA"

**What Happens:**

```typescript
// Frontend calls:
await twoFAService.enable2FA(
  admin.email,
  secret,
  verificationCode // e.g., "123456"
);

// Backend verifies code and enables 2FA
// Frontend updates local user data:
adminAuthService.updateUser({
  twoFAEnabled: true,
  twoFASecret: secret,
});
```

**Result:**

- 2FA enabled successfully
- Page refreshes
- User redirected to admin dashboard
- All future admin operations require 2FA code

---

## 🛡️ Flow 2: Using RBAC Permissions

### Scenario: Viewing Users List

**User Action:**

1. Navigate to `/admin/users` page

**What Happens:**

```typescript
// Component checks permissions
const { hasPermission, loading } = usePermissions();

// Fetch permissions from backend
const response = await rbacService.getUserPermissions();
// Returns: { permissions: ["users.read", "users.update", ...] }

if (hasPermission('users.read')) {
  // Show user list
} else {
  // Show "No permission" message
}
```

**User Experience:**

- If has `users.read` permission → User list displays
- If no permission → Error message: "You don't have permission to access this resource. Required: users.read"

---

### Scenario: Using Permission Guard

**Component Code:**

```tsx
<PermissionGuard permission="users.read">
  <UserList />
</PermissionGuard>
```

**What Happens:**

1. `PermissionGuard` fetches user permissions
2. Checks if user has `users.read` permission
3. If yes → Renders `<UserList />`
4. If no → Shows error alert

---

### Scenario: Multiple Permissions (ANY)

**Component Code:**

```tsx
<PermissionGuard
  permissions={['users.read', 'users.update']}
  requireAll={false}
>
  <UserEditor />
</PermissionGuard>
```

**What Happens:**

- User needs EITHER `users.read` OR `users.update`
- If user has at least one → Component renders
- If user has neither → Error message shown

---

### Scenario: Multiple Permissions (ALL)

**Component Code:**

```tsx
<PermissionGuard permissions={['users.read', 'users.delete']} requireAll={true}>
  <UserDeleter />
</PermissionGuard>
```

**What Happens:**

- User needs BOTH `users.read` AND `users.delete`
- If user has both → Component renders
- If user missing any → Error message shown

---

### Scenario: Super Admin

**What Happens:**

```typescript
// Super admin automatically has all permissions
const admin = adminAuthService.getCurrentAdmin();
if (admin.role === 'superAdmin') {
  // All permission checks return true
  hasPermission('any.permission'); // → true
  hasAnyPermission(['perm1', 'perm2']); // → true
  hasAllPermissions(['perm1', 'perm2']); // → true
}
```

**User Experience:**

- Super admin sees ALL UI elements
- All permission checks pass
- Can access all admin operations

---

## ⚙️ Flow 3: Dynamic Configuration Management

### Scenario: Viewing Settings (Admin)

**User Action:**

1. Navigate to `/admin/settings` page

**What Happens:**

```typescript
// Component uses SettingsManager
<SettingsManager />

// SettingsManager fetches settings:
const { settings, loading } = useAdminSettings();

// Backend returns:
{
  status: "success",
  data: {
    financial: [
      {
        key: "min_withdrawal_amount",
        value: 10,
        displayName: "Minimum Withdrawal Amount",
        description: "Smallest withdrawal amount...",
        tooltip: { ... },
        isEditable: true,
        minValue: 1,
        maxValue: 10000
      },
      ...
    ],
    staking: [...],
    features: [...]
  }
}
```

**User Experience:**

- Settings displayed grouped by category (Financial, Staking, Features)
- Each setting shows:
  - Display name
  - Current value
  - Description
  - Tooltip (with info icon)
  - Input field (number, boolean, string, select)
  - Save button

---

### Scenario: Updating a Setting

**User Action:**

1. Change value in input field (e.g., change `min_withdrawal_amount` from 10 to 20)
2. Click "Save" button

**What Happens:**

```typescript
// Component calls:
await updateSetting('min_withdrawal_amount', 20, 'Updated minimum withdrawal');

// Frontend automatically:
// 1. Prompts for 2FA code
const twoFACode = await promptFor2FA(); // Shows modal

// 2. Sends request with 2FA code
await adminSettingsService.updateSetting(
  'min_withdrawal_amount',
  20,
  'Updated minimum withdrawal'
);
// Request includes: { value: 20, reason: "...", twoFACode: "123456" }

// 3. Backend verifies 2FA and updates setting
// 4. Frontend clears config cache
configService.clearCache();

// 5. Refreshes settings list
await fetchSettings();
```

**User Experience:**

1. User changes value → "Save" button becomes active
2. User clicks "Save" → 2FA modal appears
3. User enters 6-digit code → Request sent
4. Success → Toast notification: "Setting 'min_withdrawal_amount' updated successfully"
5. Settings list refreshes with new value

---

### Scenario: Using Config Values in App

**Component Code:**

```tsx
import { useConfig } from '@/contexts/ConfigContext';

function WithdrawalForm() {
  const { getValue, loading } = useConfig();

  // Get config values
  const minWithdrawal = getValue('min_withdrawal_amount') || 10;
  const withdrawalFee = getValue('withdrawal_fee_percentage') || 2.5;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Minimum withdrawal: {minWithdrawal} USDT</p>
      <p>Fee: {withdrawalFee}%</p>
      {/* Form fields */}
    </div>
  );
}
```

**What Happens:**

1. On app load → `ConfigProvider` fetches public configs
2. Configs cached for 5 minutes
3. Components use `getValue()` to access configs
4. If config missing → Uses fallback value

**User Experience:**

- User sees current config values in UI
- Values update automatically when admin changes settings
- No page refresh needed (configs refresh every 5 minutes)

---

## 🔧 Flow 4: Admin Operations with 2FA

### Scenario: Approving a Withdrawal

**User Action:**

1. Navigate to `/admin/transactions` page
2. Find pending withdrawal
3. Click "Approve" button

**What Happens:**

```typescript
// Component calls:
await adminService.approveWithdrawal(
  transactionId,
  'approved',
  'User verified'
);

// Frontend automatically:
// 1. Gets 2FA code from context
const twoFACode = await promptFor2FA(); // Shows modal

// 2. Adds 2FA code to request
// Request body: {
//   status: "approved",
//   reason: "User verified",
//   twoFACode: "123456"
// }

// 3. Backend verifies 2FA and processes withdrawal
// 4. Success response
```

**User Experience:**

1. User clicks "Approve" → 2FA modal appears
2. User enters 6-digit code → Request sent
3. Success → Toast: "Withdrawal approved successfully"
4. Transaction list refreshes

---

### Scenario: Changing User Password

**User Action:**

1. Navigate to user profile
2. Click "Reset Password"
3. Enter new password
4. Click "Save"

**What Happens:**

```typescript
// Component calls:
await adminService.changeUserPassword(
  userId,
  newPassword,
  'User requested password reset'
);

// Frontend automatically:
// 1. Prompts for 2FA code
// 2. Sends request with 2FA code
// 3. Backend verifies 2FA and updates password
```

**User Experience:**

- 2FA modal appears
- User enters code
- Password updated successfully

---

### Scenario: Viewing Admin Profile

**User Action:**

1. Click on profile icon in admin top bar

**What Happens:**

```typescript
// Component calls:
const profile = await adminService.getProfile();

// Frontend automatically:
// 1. Gets 2FA code from context
// 2. Adds to request
// 3. Backend returns profile data
```

**User Experience:**

- Profile data displays
- 2FA code required (handled automatically)

---

## 🚨 Flow 5: Error Handling

### Scenario: 2FA Not Enabled

**What Happens:**

```typescript
// User tries to access admin endpoint
await adminService.getProfile();

// Backend returns:
{
  success: false,
  error: {
    code: "2FA_MANDATORY",
    message: "2FA is mandatory for admin accounts"
  }
}
```

**User Experience:**

- Toast error: "2FA is required. Please set it up first."
- Action button: "Setup 2FA"
- Clicking button → Redirects to `/admin/setup-2fa`

---

### Scenario: Invalid 2FA Code

**What Happens:**

```typescript
// User enters wrong 2FA code
await adminService.approveWithdrawal(transactionId, 'approved');

// Backend returns:
{
  success: false,
  error: {
    code: "2FA_CODE_INVALID",
    message: "Invalid 2FA code"
  }
}
```

**User Experience:**

- Toast error: "Invalid 2FA code. Please try again."
- 2FA modal stays open
- User can try again with new code

---

### Scenario: Missing Permission

**What Happens:**

```typescript
// User without permission tries to access protected resource
<PermissionGuard permission="users.delete">
  <UserDeleter />
</PermissionGuard>

// Permission check fails
hasPermission('users.delete') // → false
```

**User Experience:**

- Error alert displays:
  ```
  ⚠️ You don't have permission to access this resource.
  Required: users.delete
  ```
- Component doesn't render
- User can't perform the action

---

### Scenario: Not Authenticated

**What Happens:**

```typescript
// User tries to access admin route without token
// Middleware checks:
const token = adminAuthService.getToken();
if (!token) {
  router.push('/admin/login');
}
```

**User Experience:**

- Automatically redirected to `/admin/login`
- Login page shows message: "Please login to continue"

---

## 📊 Flow 6: Complete Admin Dashboard Journey

### Full User Journey

**Step 1: Login**

```
User → /admin/login
Enter credentials → Click "Login"
→ Token stored → Redirect to dashboard
```

**Step 2: 2FA Check**

```
Dashboard loads → Check 2FA status
If not enabled → Redirect to /admin/setup-2fa
If enabled → Show dashboard
```

**Step 3: 2FA Setup (if needed)**

```
Setup page → Generate QR code
Scan with app → Enter code → Enable
→ Redirect to dashboard
```

**Step 4: Dashboard Access**

```
Dashboard loads → Fetch permissions
Check permissions → Show/hide UI elements
User sees only what they have access to
```

**Step 5: Performing Actions**

```
User clicks action → 2FA modal appears
Enter code → Request sent → Success
→ UI updates → Toast notification
```

**Step 6: Managing Settings**

```
Navigate to /admin/settings
View settings → Change value → Save
→ 2FA prompt → Update → Cache cleared
→ Settings refresh → UI updates
```

---

## 🎯 Quick Reference

### For Developers

**Check Permissions:**

```typescript
const { hasPermission } = usePermissions();
if (hasPermission('users.read')) {
  // Show component
}
```

**Protect Component:**

```tsx
<PermissionGuard permission="users.read">
  <UserList />
</PermissionGuard>
```

**Get Config Value:**

```typescript
const { getValue } = useConfig();
const minWithdrawal = getValue('min_withdrawal_amount') || 10;
```

**Admin Operation:**

```typescript
// 2FA handled automatically
await adminService.approveWithdrawal(id, 'approved');
```

**Handle Errors:**

```typescript
try {
  await adminService.someOperation();
} catch (error) {
  handleApiError(error); // Handles all error types
}
```

---

## ✅ Summary

### What Users See:

1. **Login** → Enter credentials → Get token
2. **2FA Setup** → Scan QR → Enter code → Enabled
3. **Dashboard** → See only permitted features
4. **Actions** → 2FA prompt → Enter code → Success
5. **Settings** → View/Edit → 2FA prompt → Save

### What Happens Behind the Scenes:

1. **Authentication** → Token stored → User data cached
2. **2FA Check** → Automatic on every admin route
3. **Permission Check** → Fetched on load → Cached
4. **Config Fetch** → On app load → Cached 5 minutes
5. **2FA Injection** → Automatic in all admin requests
6. **Error Handling** → Automatic redirects and messages

---

**Last Updated**: December 2024  
**Status**: ✅ Complete User Flow Guide
