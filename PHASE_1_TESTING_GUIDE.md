# Phase 1: Testing Guide 🧪

## 🚀 Pre-Testing Setup

### 1. Environment Configuration

**Important:** According to Phase 1 documentation, backend runs on `http://localhost:5000/api/v1`

Create/update `.env.local` in project root:

```bash
# Phase 1 Backend URL (Local Development)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Disable proxy
NEXT_PUBLIC_USE_PROXY=false
```

**Quick Setup (PowerShell):**
```powershell
cd C:\Users\Hp\Desktop\novunt-frontend
@"
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_PROXY=false
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

### 2. Start Backend Server

Ensure Phase 1 backend is running:
```bash
# Backend should be running on:
http://localhost:5000
```

### 3. Start Frontend Dev Server

```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

### 4. Open Browser Console

Keep browser DevTools open (F12) to monitor:
- API requests
- Console logs
- Network errors

---

## ✅ Testing Checklist

### 🔐 Authentication Flow

#### Test 1: User Registration
**Path:** `/signup` or `/auth/register`

**Steps:**
1. Navigate to registration page
2. Fill in form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser@example.com` (use unique email each test)
   - Username: `testuser123` (unique)
   - Password: `Test@1234`
   - Confirm Password: `Test@1234`
   - Phone: `+1234567890`
   - Country Code: `+1`
   - Referral Code: (optional)
3. Submit form

**Expected Results:**
- ✅ Success message: "Verification code sent!"
- ✅ Redirect to `/verify-email?email=testuser@example.com`
- ✅ Console log: `[useSignup] Registration initiated`
- ✅ Network tab: `POST /auth/register` → 200

**Check Network Request:**
```json
Request: POST /auth/register
Body: {
  "fname": "Test",
  "lname": "User",
  "email": "testuser@example.com",
  "username": "testuser123",
  "password": "Test@1234",
  "confirmPassword": "Test@1234",
  "phoneNumber": "1234567890",
  "countryCode": "+1"
}

Response: {
  "message": "Verification code sent to email",
  "nextStep": "/verify-email"
}
```

---

#### Test 2: Resend Verification Code
**Path:** `/verify-email`

**Steps:**
1. On verify-email page (after registration)
2. Wait for timer to reach 0 (or if code not received)
3. Click "Resend Code" button

**Expected Results:**
- ✅ Success message: "Code sent!"
- ✅ Timer resets to 60 seconds
- ✅ Network tab: `POST /auth/verify-email` → 200

**Check Network Request:**
```json
Request: POST /auth/verify-email
Body: {
  "email": "testuser@example.com"
}

Response: {
  "message": "New verification code sent to your email."
}
```

---

#### Test 3: Complete Registration
**Path:** `/verify-email`

**Steps:**
1. On verify-email page
2. Enter 6-digit verification code (check email or backend console)
3. Code auto-submits when 6 digits entered

**Expected Results:**
- ✅ Success message: "Registration complete!"
- ✅ Redirect to `/dashboard`
- ✅ User logged in (check auth store)
- ✅ Network tab: `POST /auth/complete-registration` → 201

**Check Network Request:**
```json
Request: POST /auth/complete-registration
Body: {
  "email": "testuser@example.com",
  "verificationCode": "123456"
}

Response: {
  "message": "Registration complete!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "fname": "Test",
    "lname": "User",
    "email": "testuser@example.com",
    "username": "testuser123",
    "referralCode": "XYZ789",
    "referralLink": "https://novunt.com/register?ref=XYZ789"
  },
  "nextStep": "/dashboard"
}
```

**Check localStorage:**
- `accessToken` should be set
- `novunt-auth-storage` should contain user data

---

#### Test 4: Login (Without 2FA)
**Path:** `/login`

**Steps:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: `testuser@example.com` (or username: `testuser123`)
   - Password: `Test@1234`
3. Click "Login"

**Expected Results:**
- ✅ Success message: "Welcome back!"
- ✅ Redirect to `/dashboard`
- ✅ Network tab: `POST /auth/login` → 200

**Check Network Request:**
```json
Request: POST /auth/login
Body: {
  "email": "testuser@example.com",
  "password": "Test@1234"
}

Response: {
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "fname": "Test",
    "lname": "User",
    "email": "testuser@example.com",
    "username": "testuser123"
  }
}
```

---

#### Test 5: Login (With 2FA Enabled)
**Path:** `/login`

**Prerequisites:** User must have 2FA enabled (see Test 12-13)

**Steps:**
1. Navigate to `/login`
2. Enter credentials
3. Submit

**Expected Results:**
- ✅ Message: "2FA Required"
- ✅ 2FA input field appears
- ✅ Network tab: `POST /auth/login` → 200 (with `mfaRequired: true`)

**Check Network Request:**
```json
Response: {
  "message": "MFA verification required",
  "mfaRequired": true,
  "mfaToken": "mfa_temp_token_here",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "testuser@example.com"
  }
}
```

---

#### Test 6: Verify 2FA During Login
**Path:** `/login` (after 2FA prompt)

**Steps:**
1. After login shows 2FA required
2. Enter 6-digit code from authenticator app
3. Submit

**Expected Results:**
- ✅ Success message: "Welcome back!"
- ✅ Redirect to `/dashboard`
- ✅ Network tab: `POST /auth/verify-2fa` → 200

**Check Network Request:**
```json
Request: POST /auth/verify-2fa
Body: {
  "userID": "507f1f77bcf86cd799439011",
  "token": "123456"
}

Response: {
  "message": "2FA verification successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... },
  "nextStep": "/dashboard"
}
```

---

### 🔑 2FA Setup Flow

#### Test 7: Generate 2FA Secret
**Path:** Settings or Security page (requires authentication)

**Steps:**
1. Log in
2. Navigate to 2FA setup page
3. Click "Setup 2FA" or similar
4. Enter email

**Expected Results:**
- ✅ QR code displayed
- ✅ Manual entry option available
- ✅ Secret key shown
- ✅ Network tab: `POST /auth/generate-2fa-secret` → 200

**Check Network Request:**
```json
Request: POST /auth/generate-2fa-secret
Body: {
  "email": "testuser@example.com"
}

Response: {
  "message": "Setup Google Authenticator using one of the methods below",
  "setupMethods": {
    "qrCode": {
      "method": "QR Code Scan",
      "qrImageUrl": "data:image/png;base64,iVBORw0KGgo...",
      "instructions": [...]
    },
    "manualEntry": {
      "method": "Manual Entry",
      "secretKey": "JBSWY3DPEHPK3PXP",
      "accountName": "Novunt Goal Staking (testuser@example.com)",
      "instructions": [...]
    }
  },
  "secret": "JBSWY3DPEHPK3PXP",
  "nextStep": "After setup, enter a 6-digit code..."
}
```

---

#### Test 8: Enable 2FA
**Path:** Same page (after generating secret)

**Steps:**
1. Scan QR code with authenticator app OR enter secret manually
2. Enter 6-digit code from authenticator
3. Submit

**Expected Results:**
- ✅ Success message: "2FA Enabled!"
- ✅ User's `twoFAEnabled` flag set to `true`
- ✅ Network tab: `POST /auth/enable-2fa` → 200

**Check Network Request:**
```json
Request: POST /auth/enable-2fa
Body: {
  "email": "testuser@example.com",
  "token": "123456",
  "secret": "JBSWY3DPEHPK3PXP"
}

Response: {
  "message": "2FA successfully enabled"
}
```

---

### 🔐 Password Management

#### Test 9: Update Password
**Path:** Settings or Profile page (requires authentication)

**Steps:**
1. Log in
2. Navigate to password settings
3. Enter:
   - Current Password: `Test@1234`
   - New Password: `NewPass@5678`
   - Confirm Password: `NewPass@5678`
4. Submit

**Expected Results:**
- ✅ Success message: "Password changed!"
- ✅ Network tab: `PATCH /auth/password` → 200

**Check Network Request:**
```json
Request: PATCH /auth/password
Body: {
  "currentPassword": "Test@1234",
  "newPassword": "NewPass@5678",
  "confirmPassword": "NewPass@5678"
}

Response: {
  "message": "Password updated successfully"
}
```

---

#### Test 10: Request Password Reset
**Path:** `/forgot-password`

**Steps:**
1. Navigate to forgot password page
2. Enter email: `testuser@example.com`
3. Submit

**Expected Results:**
- ✅ Success message: "Reset code sent!"
- ✅ Network tab: `POST /auth/reset-password/request` → 200

**Check Network Request:**
```json
Request: POST /auth/reset-password/request
Body: {
  "email": "testuser@example.com"
}

Response: {
  "message": "Password reset code sent to your email"
}
```

---

#### Test 11: Reset Password with OTP
**Path:** `/reset-password`

**Steps:**
1. After requesting reset, navigate to reset password page
2. Enter:
   - Email: `testuser@example.com`
   - OTP Code: (from email or backend console)
   - New Password: `NewSecure@1234`
   - Confirm Password: `NewSecure@1234`
3. Submit

**Expected Results:**
- ✅ Success message: "Password reset!"
- ✅ Redirect to login
- ✅ Network tab: `POST /auth/reset-password` → 200

**Check Network Request:**
```json
Request: POST /auth/reset-password
Body: {
  "email": "testuser@example.com",
  "otpCode": "123456",
  "newPassword": "NewSecure@1234",
  "confirmPassword": "NewSecure@1234"
}

Response: {
  "message": "Password reset successfully"
}
```

---

### 👤 Profile Management

#### Test 12: Get User Profile
**Path:** Profile page (requires authentication)

**Steps:**
1. Log in
2. Navigate to profile page
3. Profile should load automatically

**Expected Results:**
- ✅ Profile data displayed
- ✅ Network tab: `GET /users/profile` → 200

**Check Network Request:**
```json
Request: GET /users/profile
Headers: {
  "Authorization": "Bearer <token>"
}

Response: {
  "success": true,
  "data": {
    "userId": "...",
    "email": "testuser@example.com",
    "username": "testuser123",
    "fname": "Test",
    "lname": "User",
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "completionPercentage": 25,
      ...
    }
  }
}
```

---

#### Test 13: Update User Profile
**Path:** Profile page (requires authentication)

**Steps:**
1. Log in
2. Navigate to profile edit page
3. Update fields:
   - First Name: `Updated`
   - Last Name: `Name`
   - Date of Birth: `1990-01-01`
   - Gender: `male`
   - Address: (optional)
4. Submit

**Expected Results:**
- ✅ Success message: "Profile updated"
- ✅ Profile data refreshed
- ✅ Network tab: `PUT /users/profile` → 200

**Check Network Request:**
```json
Request: PUT /users/profile
Body: {
  "fname": "Updated",
  "lname": "Name",
  "firstName": "Updated",
  "lastName": "Name",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}

Response: {
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fname": "Updated",
    "lname": "Name",
    "profile": {
      "completionPercentage": 85,
      "completedFields": [...],
      "missingFields": [...]
    }
  }
}
```

---

### 📋 KYC Management

#### Test 14: Upload KYC Documents
**Path:** KYC page (requires authentication)

**Steps:**
1. Log in
2. Navigate to KYC upload page
3. Upload:
   - Document Type: `passport`
   - Document Image URL: (upload to Cloudinary/S3 first, use URL)
   - Selfie Image URL: (upload to Cloudinary/S3 first, use URL)
4. Submit

**Expected Results:**
- ✅ Success message: "Documents uploaded"
- ✅ KYC status updated to "pending"
- ✅ Network tab: `POST /users/kyc/upload` → 201

**Check Network Request:**
```json
Request: POST /users/kyc/upload
Body: {
  "documentType": "passport",
  "documentImageUrl": "https://cloudinary.com/document.jpg",
  "selfieImageUrl": "https://cloudinary.com/selfie.jpg"
}

Response: {
  "success": true,
  "message": "KYC documents uploaded successfully",
  "data": {
    "documentId": "...",
    "type": "passport",
    "status": "pending",
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Test 15: Get KYC Status
**Path:** KYC page (requires authentication)

**Steps:**
1. Log in
2. Navigate to KYC status page
3. Status should load automatically

**Expected Results:**
- ✅ KYC status displayed
- ✅ Network tab: `GET /users/kyc/status` → 200

**Check Network Request:**
```json
Request: GET /users/kyc/status

Response: {
  "success": true,
  "data": {
    "status": "pending",
    "documentType": "passport",
    "uploadedAt": "2025-01-01T00:00:00.000Z",
    "reviewedAt": null,
    "rejectionReason": null
  }
}
```

---

### 🔍 User Search

#### Test 16: Search Users by Username
**Path:** Transfer or search page (requires authentication)

**Steps:**
1. Log in
2. Navigate to user search (e.g., in transfer flow)
3. Enter username: `testuser`
4. Search

**Expected Results:**
- ✅ Search results displayed
- ✅ Network tab: `GET /users/search?query=testuser` → 200

**Check Network Request:**
```json
Request: GET /users/search?query=testuser

Response: {
  "message": "User search completed successfully",
  "results": [
    {
      "_id": "...",
      "username": "testuser123",
      "email": "t***r@example.com",
      "fullName": "Test User",
      "memberSince": "2025-01-01"
    }
  ],
  "totalFound": 1,
  "query": "testuser"
}
```

---

### 🔗 Referral Management

#### Test 17: Validate Referral Code
**Path:** Registration page (public)

**Steps:**
1. Navigate to registration page
2. Enter referral code in field (if real-time validation)
3. OR submit form with referral code

**Expected Results:**
- ✅ Referral code validated (if real-time)
- ✅ Network tab: `GET /referral/validate?referralCode=ABC123` → 200

**Check Network Request:**
```json
Request: GET /referral/validate?referralCode=ABC123

Response: {
  "success": true,
  "message": "Valid referral code",
  "data": {
    "isValid": true,
    "referrerName": "Jane Smith"
  }
}
```

---

#### Test 18: Get Referral Info
**Path:** Referrals page (requires authentication)

**Steps:**
1. Log in
2. Navigate to referrals page
3. Info should load automatically

**Expected Results:**
- ✅ Referral code and link displayed
- ✅ Network tab: `GET /auth/referral-info` → 200

**Check Network Request:**
```json
Request: GET /auth/referral-info

Response: {
  "success": true,
  "data": {
    "referralCode": "XYZ789",
    "referralLink": "https://novunt.com/register?ref=XYZ789",
    "totalReferrals": 5,
    "totalEarnings": 250.50
  }
}
```

---

## 🐛 Common Issues & Troubleshooting

### Issue: Backend not responding
**Symptoms:** Network errors, CORS errors, 404s

**Solutions:**
1. ✅ Verify backend is running: `http://localhost:5000`
2. ✅ Check `.env.local` has correct URL: `http://localhost:5000/api/v1`
3. ✅ Restart frontend dev server
4. ✅ Clear browser cache
5. ✅ Check backend logs for errors

---

### Issue: 401 Unauthorized
**Symptoms:** All requests return 401

**Solutions:**
1. ✅ Verify token is stored in localStorage: `accessToken`
2. ✅ Check Authorization header is being sent: `Bearer <token>`
3. ✅ Try logging in again
4. ✅ Clear localStorage and cookies
5. ✅ Check token expiration (should refresh automatically)

---

### Issue: Registration fails
**Symptoms:** Form submission errors, validation failures

**Solutions:**
1. ✅ Check email is unique (not already registered)
2. ✅ Check username is unique (case-insensitive)
3. ✅ Verify password meets requirements: 8+ chars, upper, lower, number, special
4. ✅ Check phone number format
5. ✅ Check backend logs for detailed error

---

### Issue: Verification code not received
**Symptoms:** Can't complete registration

**Solutions:**
1. ✅ Check email inbox (including spam)
2. ✅ Check backend console (dev mode may log code)
3. ✅ Use "Resend Code" button (60-second cooldown)
4. ✅ Verify email address is correct

---

### Issue: 2FA not working
**Symptoms:** QR code not generating, enable fails

**Solutions:**
1. ✅ Verify email matches logged-in user
2. ✅ Check secret is copied correctly (if manual entry)
3. ✅ Verify TOTP code is valid (30-second windows)
4. ✅ Try generating new secret
5. ✅ Check authenticator app time sync

---

## 📊 Testing Results Template

```markdown
## Phase 1 Testing Results
Date: [DATE]
Tester: [NAME]
Environment: Development (localhost:5000)

### Authentication
- [ ] Registration: [PASS/FAIL] - Notes: [...]
- [ ] Resend Verification: [PASS/FAIL] - Notes: [...]
- [ ] Complete Registration: [PASS/FAIL] - Notes: [...]
- [ ] Login (no 2FA): [PASS/FAIL] - Notes: [...]
- [ ] Login (with 2FA): [PASS/FAIL] - Notes: [...]
- [ ] Verify 2FA: [PASS/FAIL] - Notes: [...]

### 2FA Setup
- [ ] Generate Secret: [PASS/FAIL] - Notes: [...]
- [ ] Enable 2FA: [PASS/FAIL] - Notes: [...]

### Password Management
- [ ] Update Password: [PASS/FAIL] - Notes: [...]
- [ ] Request Reset: [PASS/FAIL] - Notes: [...]
- [ ] Reset Password: [PASS/FAIL] - Notes: [...]

### Profile Management
- [ ] Get Profile: [PASS/FAIL] - Notes: [...]
- [ ] Update Profile: [PASS/FAIL] - Notes: [...]

### KYC
- [ ] Upload KYC: [PASS/FAIL] - Notes: [...]
- [ ] Get KYC Status: [PASS/FAIL] - Notes: [...]

### User Search
- [ ] Search Users: [PASS/FAIL] - Notes: [...]

### Referrals
- [ ] Validate Code: [PASS/FAIL] - Notes: [...]
- [ ] Get Referral Info: [PASS/FAIL] - Notes: [...]

### Issues Found
1. [ISSUE DESCRIPTION]
2. [ISSUE DESCRIPTION]

### Overall Status
[PASS/FAIL] - Ready for production
```

---

## 🎯 Quick Test Commands

```bash
# Check environment
cat .env.local | grep API_URL

# Check backend is running
curl http://localhost:5000/api/v1

# Check frontend
curl http://localhost:3000

# Clear browser storage (in console)
localStorage.clear()
sessionStorage.clear()
```

---

## ✅ Success Criteria

All tests pass when:
1. ✅ All API endpoints return expected responses
2. ✅ No console errors
3. ✅ No network errors (except expected 401s before login)
4. ✅ User data persists after refresh
5. ✅ Redirects work correctly
6. ✅ Error messages are user-friendly
7. ✅ Loading states display properly
8. ✅ Success toasts appear

---

**Ready to test!** Start with Test 1 and work through systematically. Document any issues you find.

