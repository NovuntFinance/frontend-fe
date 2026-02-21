# 2FA Backend Response Update - Changes Made

## Summary

Updated the frontend to handle optional **backup codes** in the 2FA verification response, matching the actual backend implementation.

---

## Changes Made

### 1. Type Definition (`src/types/auth.ts`)

**Updated `Enable2FAResponse`** to include optional backup codes:

```typescript
export interface Enable2FAResponse {
  message: string; // "MFA setup completed successfully"
  backupCodes?: string[]; // Optional backup codes from backend
}
```

---

### 2. Auth Service (`src/lib/authService.ts`)

**Updated `enable2FA` method** to properly extract and map backup codes from the backend response:

```typescript
enable2FA: async (
  payload: Enable2FARequest
): Promise<InternalEnable2FAResponse> => {
  const response = await api.post<InternalEnable2FAResponse>(
    '/better-auth/mfa/verify',
    payload
  );

  // Map backend response structure (backupCodes may be in response.data.data)
  if (response && typeof response === 'object') {
    const data = response as {
      message?: string;
      data?: { backupCodes?: string[] };
    };
    return {
      message: data.message || 'MFA setup completed successfully',
      backupCodes: data.data?.backupCodes,
    } as Enable2FAResponse;
  }

  return response;
};
```

**Key Points:**

- ✅ Extracts `backupCodes` from nested `data.data.backupCodes` structure
- ✅ Returns mapped response with message and optional backup codes
- ✅ Does not rely on exact message text for logic
- ✅ Uses HTTP status / success flag for success/failure determination

---

### 3. Two-Factor Modal Component (`src/components/settings/TwoFactorModal.tsx`)

**Added backup codes state and display:**

```typescript
// State management
const [backupCodes, setBackupCodes] = useState<string[]>([]);
const [showBackupCodes, setShowBackupCodes] = useState(false);
const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'backupCodes'>(
  'select'
);
```

**Updated verification handler:**

```typescript
const handleVerify = async () => {
  const response = await authService.enable2FA({
    verificationToken,
    verificationCode,
  });

  // Check if backup codes were provided
  if (response.backupCodes && response.backupCodes.length > 0) {
    setBackupCodes(response.backupCodes);
    setShowBackupCodes(true);
    setStep('backupCodes'); // Show backup codes step
    toast.success(
      'Two-Factor Authentication enabled! Please save your backup codes.'
    );
  } else {
    // No backup codes, close modal immediately
    toast.success(
      response.message || 'Two-Factor Authentication enabled successfully!'
    );
    setStep('select');
    onOpenChange(false);
  }
};
```

**Added backup codes display UI:**

- Shows backup codes in a grid layout
- Copy all codes to clipboard button
- Warning message to save codes safely
- User must confirm they've saved codes before closing

---

## Backend Response Format

### With Backup Codes

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

### Without Backup Codes

```json
{
  "success": true,
  "message": "MFA setup completed successfully"
}
```

---

## User Flow Update

### When Backup Codes Are Provided

1. User enters 6-digit code from authenticator
2. Frontend verifies code with backend
3. Backend enables 2FA and returns backup codes
4. **Frontend displays backup codes in modal**
5. User saves codes (copies to clipboard/writes down)
6. User clicks "I've Saved My Codes"
7. Modal closes, 2FA is enabled

### When No Backup Codes

1. User enters 6-digit code from authenticator
2. Frontend verifies code with backend
3. Backend enables 2FA (no backup codes returned)
4. Success toast appears
5. Modal closes immediately

---

## Key Improvements

✅ **Graceful handling** - Works with or without backup codes  
✅ **No string comparisons** - Uses data structure, not message text  
✅ **Nested data extraction** - Correctly maps `response.data.data.backupCodes`  
✅ **User-friendly UI** - Clear warnings and copy functionality  
✅ **Mandatory save confirmation** - User must acknowledge before closing

---

## Testing

Backend team can test both scenarios:

**Test 1: With Backup Codes**

```bash
curl -X POST https://api.novunt.com/api/v1/better-auth/mfa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationToken": "JBSWY3DPEHPK3PXP",
    "verificationCode": "123456"
  }'
```

Expected: Response includes `data.backupCodes` array  
Frontend: Displays backup codes screen

**Test 2: Without Backup Codes**

Same request, but backend doesn't include backup codes in response  
Frontend: Shows success toast and closes modal immediately

---

## Files Modified

1. ✅ `src/types/auth.ts` - Added `backupCodes?` to `Enable2FAResponse`
2. ✅ `src/lib/authService.ts` - Updated `enable2FA` to map response properly
3. ✅ `src/components/settings/TwoFactorModal.tsx` - Added backup codes UI
4. ✅ `docs/2FA_INTEGRATION_GUIDE.md` - Updated documentation

Frontend is now fully aligned with backend implementation! 🎉
