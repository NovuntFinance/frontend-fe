# Backend Password Validation Issue - Critical Bug Report

**Date:** January 13, 2026  
**Reporter:** Frontend Team  
**Priority:** HIGH  
**Impact:** Users cannot register with previously valid passwords

---

## 🔴 Issue Summary

Users are receiving password validation errors during signup, even when using passwords that meet all stated requirements. The error message appears to be coming from the backend API, not frontend validation.

**Error Message Displayed:**

```
Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.
```

**User Report:**

- User was using the same password that worked before: `Novunt_2026`
- This password meets ALL requirements but is now being rejected
- Error appears to be triggered by backend validation, not frontend

---

## 🔍 Root Cause Analysis

### Frontend Password Validation (Current Implementation)

The frontend uses the following password schema (`src/lib/validation.ts`):

```typescript
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );
```

**Frontend Requirements:**

- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (ANY non-alphanumeric: `/[^A-Za-z0-9]/`)

### Backend Password Validation (Expected)

According to frontend documentation (`src/types/auth.ts`), backend should use:

```typescript
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&])[A-Za-z\d@_$!%*?&]{8,}$/;
```

**Backend Requirements (Per Frontend Spec):**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character from: `@_$!%*?&` (RESTRICTED SET)

---

## ⚠️ The Problem

### Password Test Case: `Novunt_2026`

**Breakdown:**

- Length: 11 characters ✅
- Uppercase: N ✅
- Lowercase: o, v, u, n, t ✅
- Numbers: 2, 0, 2, 6 ✅
- Special character: `_` (underscore) ✅

**Frontend Validation Result:** ✅ PASSES  
**Backend Validation Result:** ❌ FAILS

### Issue Identified

The backend error message format doesn't match frontend error messages:

| Source       | Error Message                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Frontend** | Individual messages per missing requirement (e.g., "Password must contain at least one uppercase letter") |
| **Backend**  | Combined message listing all requirements at once                                                         |

**This confirms the error is coming from the BACKEND, not frontend.**

### Possible Backend Issues

1. **Special Character Mismatch:**
   - Frontend accepts ANY non-alphanumeric character: `/[^A-Za-z0-9]/`
   - Backend might only accept: `@_$!%*?&`
   - Underscore `_` IS in the backend's allowed list, so it should work
   - **However, the backend validation might have a bug or was recently changed**

2. **Regex Pattern Bug:**
   - Backend regex might have been modified incorrectly
   - Possible syntax error in the lookahead assertions
   - Character class `[A-Za-z\d@_$!%*?&]` might be too restrictive

3. **Validation Library Update:**
   - Backend might have updated a validation library (e.g., validator.js, joi, zod)
   - New version could have stricter rules

---

## 🎯 Requested Backend Investigation

### 1. Locate Password Validation Code

Please check these files/locations:

- User signup route handler (e.g., `/api/v1/auth/signup`, `/api/v1/users/register`)
- User model schema/validation (e.g., `User.model.js`, `user.schema.js`)
- Authentication middleware/validators
- Any shared validation utilities

### 2. Review Password Regex Pattern

**Current Expected Pattern (Per Frontend Docs):**

```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&])[A-Za-z\d@_$!%*?&]{8,}$/;
```

**Test this pattern against:** `Novunt_2026`

If it fails, the pattern is incorrect. The underscore `_` is in the allowed character class `[@_$!%*?&]`.

### 3. Check for Recent Changes

- Review git history for password validation changes in the last 30 days
- Check if any dependencies (validation libraries) were updated
- Verify if environment variables or config files changed

### 4. Test These Passwords

Run backend validation against these test cases:

| Password       | Should Pass? | Contains                  |
| -------------- | ------------ | ------------------------- |
| `Novunt_2026`  | ✅ YES       | All requirements with `_` |
| `MyPass123!`   | ✅ YES       | All requirements with `!` |
| `Secure@2026`  | ✅ YES       | All requirements with `@` |
| `Test$Pass99`  | ✅ YES       | All requirements with `$` |
| `Welcome&2026` | ✅ YES       | All requirements with `&` |
| `Pass*word8`   | ✅ YES       | All requirements with `*` |
| `Strong?123`   | ✅ YES       | All requirements with `?` |
| `MyPassword#1` | ❌ NO        | `#` not in allowed set    |
| `password123`  | ❌ NO        | No uppercase              |
| `PASSWORD123`  | ❌ NO        | No lowercase              |
| `MyPassword`   | ❌ NO        | No number                 |
| `MyPass123`    | ❌ NO        | No special char           |

---

## 💡 Recommended Solution

### Option 1: Fix Backend Regex (RECOMMENDED)

**Problem:** Backend regex might have a bug or was modified incorrectly.

**Solution:** Ensure backend uses this exact pattern:

```javascript
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&])[A-Za-z\d@_$!%*?&]{8,}$/;

function validatePassword(password) {
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@_$!%*?&).'
    );
  }
  return true;
}
```

**Testing:**

```javascript
// All should return true
console.log(PASSWORD_REGEX.test('Novunt_2026')); // true
console.log(PASSWORD_REGEX.test('MyPass123!')); // true
console.log(PASSWORD_REGEX.test('Secure@2026')); // true
console.log(PASSWORD_REGEX.test('Test$Pass99')); // true

// All should return false
console.log(PASSWORD_REGEX.test('password123')); // false (no uppercase)
console.log(PASSWORD_REGEX.test('PASSWORD123')); // false (no lowercase)
console.log(PASSWORD_REGEX.test('MyPassword')); // false (no number)
console.log(PASSWORD_REGEX.test('MyPass123')); // false (no special)
```

### Option 2: Align Backend with Frontend

**Problem:** Frontend accepts ANY special character, backend restricts to specific set.

**Solution:** Update backend to accept any special character (match frontend):

```javascript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]{8,}$/;

function validatePassword(password) {
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    );
  }
  return true;
}
```

**Note:** `[^\w\s]` matches any non-alphanumeric character except whitespace.

### Option 3: Update Error Message (TEMPORARY FIX)

If regex is correct but error message is confusing:

**Current Error:**

```
Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.
```

**Better Error:**

```
Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@_$!%*?&).
```

---

## 🧪 Verification Steps

After implementing the fix, please test:

### 1. Unit Tests

```javascript
describe('Password Validation', () => {
  it('should accept Novunt_2026', () => {
    expect(validatePassword('Novunt_2026')).toBe(true);
  });

  it('should accept MyPass123!', () => {
    expect(validatePassword('MyPass123!')).toBe(true);
  });

  it('should accept all allowed special characters', () => {
    const passwords = [
      'Test@Pass1',
      'Test_Pass1',
      'Test$Pass1',
      'Test!Pass1',
      'Test%Pass1',
      'Test*Pass1',
      'Test?Pass1',
      'Test&Pass1',
    ];
    passwords.forEach((pwd) => {
      expect(validatePassword(pwd)).toBe(true);
    });
  });

  it('should reject passwords missing requirements', () => {
    expect(() => validatePassword('password123')).toThrow();
    expect(() => validatePassword('PASSWORD123')).toThrow();
    expect(() => validatePassword('MyPassword')).toThrow();
    expect(() => validatePassword('MyPass123')).toThrow();
    expect(() => validatePassword('Short1!')).toThrow();
  });
});
```

### 2. Integration Test

```bash
# Test signup endpoint
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Novunt_2026",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "phoneNumber": "+1234567890"
  }'

# Expected: 200/201 Success
# Actual: Should not return password validation error
```

### 3. Manual Testing

- Try registering with `Novunt_2026` on staging environment
- Verify error message is clear if password fails
- Test with all special characters: `@_$!%*?&`

---

## 📋 Implementation Checklist

- [ ] Located password validation code in backend
- [ ] Reviewed and tested password regex pattern
- [ ] Verified `Novunt_2026` passes validation
- [ ] Added/updated unit tests for password validation
- [ ] Tested all special characters: `@_$!%*?&`
- [ ] Updated error messages to be more descriptive
- [ ] Tested signup endpoint with valid passwords
- [ ] Verified existing users can still log in
- [ ] Deployed fix to staging environment
- [ ] Confirmed fix with frontend team

---

## 🚨 Critical Notes

1. **DO NOT** change password hashing algorithm or existing password storage
2. **DO NOT** invalidate existing user passwords
3. **ONLY** modify the validation rules for NEW password creation/updates
4. Ensure existing users with valid passwords can still log in
5. Test thoroughly to avoid breaking authentication flow

---

## 📞 Contact

**Frontend Team:**

- Repository: `NovuntFinance/frontend-fe`
- Branch: `main`
- Validation File: `src/lib/validation.ts`
- Auth Types: `src/types/auth.ts`

**Questions?** Contact the frontend team for clarification on expected behavior.

---

## 🔗 Related Files

Frontend files for reference:

- `src/lib/validation.ts` - Password validation schema
- `src/types/auth.ts` - Password regex and requirements
- `src/app/(auth)/signup/page.tsx` - Signup page implementation

Backend files to check (estimated):

- User signup route handler
- User model/schema
- Authentication middleware
- Validation utilities

---

## ✅ Expected Outcome

After fix:

- ✅ `Novunt_2026` should successfully pass validation
- ✅ All passwords with allowed special characters should work
- ✅ Error messages should be clear and helpful
- ✅ No existing functionality should break
- ✅ Users can register with strong, secure passwords

---

**Thank you for addressing this issue promptly!** 🙏
