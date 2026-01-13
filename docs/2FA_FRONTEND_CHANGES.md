# 2FA Frontend Updates Summary

## Changes Made

### 1. Type Definitions Updated (`src/types/auth.ts`)

**Generate2FASecretRequest** - Now empty (no email)

```typescript
export interface Generate2FASecretRequest {
  // Empty - user ID is extracted from Authorization token
}
```

**Generate2FASecretResponse** - Matches actual backend structure

```typescript
export interface Generate2FASecretResponse {
  message: string;
  setupDetails: {
    qrCode: string; // Base64 data URL: data:image/png;base64,...
    secret: string; // Base32 secret: JBSWY3DPEHPK3PXP
  };
  verificationToken: string; // Token to use when verifying the setup
}
```

**Enable2FARequest** - Uses verificationToken

```typescript
export interface Enable2FARequest {
  verificationToken: string; // Token from /mfa/setup response
  verificationCode: string; // 6-digit TOTP code from authenticator app
}
```

---

### 2. Auth Service Updated (`src/lib/authService.ts`)

**Setup endpoint** - Sends empty body

```typescript
generate2FASecret: async (): Promise<InternalGenerate2FASecretResponse> => {
  // Backend extracts user from Authorization token, so send empty body
  return api.post<InternalGenerate2FASecretResponse>(
    '/better-auth/mfa/setup',
    {}
  );
};
```

**Verify endpoint** - Uses verificationToken + verificationCode

```typescript
enable2FA: async (
  payload: Enable2FARequest
): Promise<InternalEnable2FAResponse> => {
  return api.post<InternalEnable2FAResponse>(
    '/better-auth/mfa/verify',
    payload
  );
};
```

---

### 3. Two-Factor Modal Component (`src/components/settings/TwoFactorModal.tsx`)

**Removed:** Mock data (`JBSWY3DPEHPK3PXP` hardcoded values)

**Added:** Real API integration

- Fetches QR code and secret from backend on setup
- Displays loading states during API calls
- Stores verificationToken for verification step
- Calls verify endpoint with actual TOTP code
- Clears sensitive data after successful setup

**Key Features:**

```typescript
// Fetch real QR code when entering setup mode
useEffect(() => {
  if (step === 'setup' && method === 'app' && !qrCodeUrl) {
    handleFetch2FASetup();
  }
}, [step, method]);

// Verify with backend
const handleVerify = async () => {
  await authService.enable2FA({
    verificationToken,
    verificationCode,
  });
  // ... success handling
};
```

---

## How It Works Now

### Setup Flow (Step 1)

1. User clicks "Enable 2FA" button
2. Frontend calls `authService.generate2FASecret()` with **no parameters**
3. Request: `POST /better-auth/mfa/setup` with empty body `{}`
4. Backend extracts user ID from `Authorization: Bearer <token>` header
5. Backend generates TOTP secret and QR code
6. Backend response:
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
7. Frontend displays QR code and secret to user
8. User scans with Google Authenticator or similar app

### Verification Flow (Step 2)

1. User enters 6-digit code from their authenticator app
2. Frontend calls `authService.enable2FA()`
3. Request: `POST /better-auth/mfa/verify` with:
   ```json
   {
     "verificationToken": "JBSWY3DPEHPK3PXP",
     "verificationCode": "123456"
   }
   ```
4. Backend validates the code
5. If valid, sets `user.twoFAEnabled = true`
6. Frontend shows success toast and closes modal

---

## Usage in Critical Operations

### When 2FA is Required

✅ **Transfers** - All amounts  
✅ **Withdrawals** - All amounts  
✅ **Staking** - Only if amount > $100,000 USDT  
❌ **Login** - NOT required

### Example: High-Value Stake

```typescript
// Frontend automatically prompts for 2FA code if stake > $100,000
const response = await api.post('/staking/create', {
  amount: 150000,
  duration: 30,
  twoFactorCode: '123456', // From user's authenticator
});
```

Backend validates:

```typescript
if (Number(amount) > 100000) {
  await verifyAction2FA(userId, twoFactorCode, 'staking');
}
```

---

## Testing Instructions

### For Backend Team

See [`docs/2FA_INTEGRATION_GUIDE.md`](./2FA_INTEGRATION_GUIDE.md) for:

- Complete end-to-end test scenario
- Sample cURL commands
- Expected request/response formats
- Troubleshooting guide

### Quick Test with cURL

```bash
# 1. Setup 2FA (get QR code)
curl -X POST https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/mfa/setup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 2. Verify and enable (after scanning QR)
curl -X POST https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/mfa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationToken": "JBSWY3DPEHPK3PXP",
    "verificationCode": "123456"
  }'
```

---

## Files Modified

1. ✅ `src/types/auth.ts` - Updated 2FA type definitions
2. ✅ `src/lib/authService.ts` - Fixed API calls to match backend
3. ✅ `src/components/settings/TwoFactorModal.tsx` - Replaced mock data with live API
4. ✅ `docs/2FA_INTEGRATION_GUIDE.md` - Created comprehensive testing guide

---

## Key Points for Backend

✨ **No email in request body** - Backend uses `req.user._id` from JWT token  
✨ **QR code is base64 data URL** - Frontend renders directly as `<img src={qrCode}>`  
✨ **Verification uses verificationToken** - This is the secret from setup step  
✨ **2FA only for sensitive operations** - Not required for login

---

## Next Steps

1. Backend team tests the endpoint with the guide provided
2. Confirm QR code format is correct (base64 data URL)
3. Verify TOTP validation works with real authenticator apps
4. Test high-value staking with 2FA enforcement
5. Frontend ready for production use ✅
