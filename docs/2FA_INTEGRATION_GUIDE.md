# 2FA Integration Guide - Frontend to Backend

## Overview

This document provides a complete end-to-end guide for testing the Two-Factor Authentication (2FA) setup and usage flow between the frontend and backend.

---

## Backend Requirements

### Authentication

All 2FA endpoints require authentication via `Authorization: Bearer <access_token>` header. The backend extracts the user ID from the JWT token, not from the request body.

### Middleware

The `betterAuthMiddleware` validates the token and attaches `req.user` to the request object.

---

## 2FA Setup Flow

### Step 1: Generate 2FA Secret & QR Code

**Frontend Call:**

```typescript
// Called when user clicks "Enable 2FA" and enters setup mode
const response = await authService.generate2FASecret();
```

**HTTP Request:**

```http
POST /api/v1/better-auth/mfa/setup
Authorization: Bearer <access_token>
Content-Type: application/json

{}
```

**Backend Handler:**

- Route: `POST /better-auth/mfa/setup`
- Controller: `setupMFA` in `betterAuth.controller.ts`
- Service: `betterAuthService.setupMFA({ userId: req.user._id.toString() })`
- Adapter: `mfa.setup` in `betterAuthAdapter.ts`

**Backend Response:**

```json
{
  "success": true,
  "message": "MFA setup initiated",
  "data": {
    "setupDetails": {
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "secret": "JBSWY3DPEHPK3PXP"
    },
    "verificationToken": "JBSWY3DPEHPK3PXP"
  }
}
```

**Frontend Processing:**

```typescript
// Map response to component state
setQrCodeUrl(response.setupDetails.qrCode);
setSecretKey(response.setupDetails.secret);
setVerificationToken(response.verificationToken);
```

**What Happens:**

1. Frontend makes authenticated POST request with empty body
2. Backend extracts user ID from JWT token
3. Backend generates a new TOTP secret using `speakeasy`
4. Backend generates QR code image as base64 data URL
5. Backend saves `twoFASecret` to user document (but doesn't enable 2FA yet)
6. Backend returns QR code, secret, and verification token
7. Frontend displays QR code for user to scan with authenticator app

---

### Step 2: Verify TOTP Code & Enable 2FA

**User Action:**
User scans QR code with Google Authenticator or similar app, then enters the 6-digit code displayed in their app.

**Frontend Call:**

```typescript
await authService.enable2FA({
  verificationToken: 'JBSWY3DPEHPK3PXP', // From Step 1
  verificationCode: '123456', // From user's authenticator app
});
```

**HTTP Request:**

```http
POST /api/v1/better-auth/mfa/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "verificationToken": "JBSWY3DPEHPK3PXP",
  "verificationCode": "123456"
}
```

**Backend Handler:**

- Route: `POST /better-auth/mfa/verify`
- Controller: `completeMFASetup` in `betterAuth.controller.ts`
- Service: `betterAuthService.verifyAndEnableMFA({ userId, verificationToken, verificationCode })`

**Backend Response (Success):**

```json
{
  "success": true,
  "message": "MFA setup completed successfully",
  "data": {
    "backupCodes": [
      "ABC123DEF456",
      "GHI789JKL012",
      "MNO345PQR678",
      "STU901VWX234",
      "YZ567ABC890"
    ]
  }
}
```

**Backend Response (Success - No Backup Codes):**

```json
{
  "success": true,
  "message": "MFA setup completed successfully"
}
```

**Backend Response (Invalid Code):**

```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**What Happens:**

1. Frontend sends verification token (the secret) and user's TOTP code
2. Backend verifies the code using `speakeasy.totp.verify()`
3. If valid, backend sets `user.twoFAEnabled = true`
4. Backend may optionally return backup codes in `data.backupCodes`
5. User's account now has 2FA enabled
6. Frontend shows success toast
7. If backup codes are provided, frontend displays them for user to save
8. User confirms they've saved the codes and modal closes

---

## 2FA Usage in Critical Operations

### When is 2FA Required?

2FA is **NOT required for login**. It is only enforced for:

1. **Transfers** - Any amount
2. **Withdrawals** - Any amount
3. **Staking** - Only if amount > $500 USDT

### Example: Staking > $500

**Frontend Call:**

```typescript
// When creating a stake > $500
const response = await api.post('/staking/create', {
  amount: 750,
  duration: 30,
  twoFactorCode: '123456', // 6-digit code from user's authenticator
});
```

**HTTP Request:**

```http
POST /api/v1/staking/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 750,
  "duration": 30,
  "twoFactorCode": "123456"
}
```

**Backend Validation:**

```typescript
// In staking.controller.ts
if (Number(amount) > 500) {
  const { twoFactorCode } = req.body;
  const { verifyAction2FA } = await import('../utils/twoFactorHelper');

  await verifyAction2FA(userId, twoFactorCode, 'staking');
  // Throws error if code is invalid or user has no 2FA enabled
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Stake created successfully",
  "data": { ... }
}
```

**Error Response (Invalid 2FA):**

```json
{
  "success": false,
  "message": "Invalid 2FA code"
}
```

---

## Sample End-to-End Test Scenario

### Test Case: Complete 2FA Setup and Use for High-Value Stake

**Prerequisites:**

- User account with valid access token
- Google Authenticator or similar TOTP app installed

**Steps:**

1. **Login to frontend**
   - Navigate to Settings > Security
   - Click "Enable Two-Factor Authentication"

2. **Generate QR Code**
   - Frontend calls `POST /better-auth/mfa/setup`
   - Backend generates secret: `JBSWY3DPEHPK3PXP`
   - Frontend displays QR code

3. **Scan QR Code**
   - Open Google Authenticator
   - Scan the displayed QR code
   - App shows 6-digit code (e.g., `123456`)

4. **Verify and Enable**
   - Enter `123456` in frontend modal
   - Frontend calls `POST /better-auth/mfa/verify` with:
     ```json
     {
       "verificationToken": "JBSWY3DPEHPK3PXP",
       "verificationCode": "123456"
     }
     ```
   - Backend verifies code and sets `twoFAEnabled = true`
   - Success toast appears

5. **Test 2FA in Staking**
   - Navigate to Staking page
   - Create stake with amount = $750
   - Modal prompts for 2FA code
   - Enter current code from Google Authenticator (e.g., `789012`)
   - Frontend calls `POST /staking/create` with:
     ```json
     {
       "amount": 750,
       "duration": 30,
       "twoFactorCode": "789012"
     }
     ```
   - Backend validates 2FA code before creating stake
   - Stake created successfully

6. **Verify No 2FA for Small Stakes**
   - Create stake with amount = $100
   - No 2FA prompt appears
   - Stake created without 2FA check

---

## Testing with cURL

### 1. Setup 2FA

```bash
# Replace YOUR_TOKEN with actual access token
curl -X POST https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/mfa/setup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Output:**

```json
{
  "success": true,
  "message": "MFA setup initiated",
  "data": {
    "setupDetails": {
      "qrCode": "data:image/png;base64,...",
      "secret": "JBSWY3DPEHPK3PXP"
    },
    "verificationToken": "JBSWY3DPEHPK3PXP"
  }
}
```

### 2. Verify and Enable 2FA

```bash
# Get current TOTP code from authenticator app after scanning QR
curl -X POST https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/mfa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationToken": "JBSWY3DPEHPK3PXP",
    "verificationCode": "123456"
  }'
```

### 3. Test High-Value Stake with 2FA

```bash
curl -X POST https://novunt-backend-uw3z.onrender.com/api/v1/staking/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 750,
    "duration": 30,
    "twoFactorCode": "789012"
  }'
```

---

## TypeScript Type Definitions

### Request Types

```typescript
// Setup request - empty body
export interface Generate2FASecretRequest {
  // Empty - user ID extracted from Authorization token
}

// Verification request
export interface Enable2FARequest {
  verificationToken: string; // From /mfa/setup response
  verificationCode: string; // 6-digit TOTP from app
}
```

### Response Types

```typescript
// Setup response
export interface Generate2FASecretResponse {
  message: string;
  setupDetails: {
    qrCode: string; // Base64 data URL
    secret: string; // Base32 secret
  };
  verificationToken: string;
}

// Verification response
export interface Enable2FAResponse {
  message: string; // "MFA setup completed successfully"
  backupCodes?: string[]; // Optional backup codes from backend
}
```

---

## Frontend Service Methods

```typescript
// Located in src/lib/authService.ts

// Call to generate QR code (no parameters needed)
const response = await authService.generate2FASecret();

// Call to verify and enable 2FA (may return backup codes)
const result = await authService.enable2FA({
  verificationToken: 'JBSWY3DPEHPK3PXP',
  verificationCode: '123456',
});

// Display backup codes if provided
if (result.backupCodes) {
  console.log('Save these backup codes:', result.backupCodes);
}
```

---

## Common Issues & Troubleshooting

### Issue: "Invalid verification code"

- **Cause:** TOTP codes expire every 30 seconds
- **Solution:** Ensure you enter the code quickly after it appears in your app

### Issue: "AUTH_REQUIRED" on setup

- **Cause:** No valid access token in Authorization header
- **Solution:** Ensure user is logged in and token is fresh

### Issue: "User not found"

- **Cause:** Invalid or expired JWT token
- **Solution:** Refresh token or re-login

### Issue: QR code not displaying

- **Cause:** Backend returned invalid base64 image
- **Solution:** Check backend logs and ensure `qrcode.toDataURL()` is working

---

## Summary

The frontend now correctly:

1. ✅ Sends empty body to `/better-auth/mfa/setup` (user ID from token)
2. ✅ Displays real QR code and secret from backend
3. ✅ Stores verification token for the verify step
4. ✅ Calls `/better-auth/mfa/verify` with `verificationToken` + `verificationCode`
5. ✅ Handles optional backup codes from backend response
6. ✅ Uses 2FA codes for high-value operations (staking > $500, transfers, withdrawals)
7. ✅ Does NOT require 2FA for login

The backend team can now test the complete flow end-to-end using this guide.
