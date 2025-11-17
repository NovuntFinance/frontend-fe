# Backend Progress Calculation Requirements - Registration Bonus

## Overview

This document outlines the **correct** progress calculation logic for the Registration Bonus feature. The current implementation appears to have calculation errors that need to be fixed.

---

## Progress Calculation Logic

### Overall Progress (`progressPercentage`)

The overall progress represents completion of the **4 main requirements** for the registration bonus. Each requirement completion adds **25%** to the overall progress.

#### Calculation Formula:
```typescript
let overallProgress = 0;

// 1. Registration (automatic) = 25%
// This should be set when the RegistrationBonus record is created
overallProgress = 25;

// 2. Profile Complete = +25% (total becomes 50%)
if (profileCompletionPercentage >= 100) {
  overallProgress = 50;
}

// 3. Social Media Follow = +25% (total becomes 75%)
if (socialMediaCompleted >= minimumRequired) {
  overallProgress = 75;
}

// 4. First Stake = +25% (total becomes 100%)
if (firstStakeCompleted && stakeAmount >= 20) {
  overallProgress = 100;
}
```

---

## Detailed Requirements Breakdown

### 1. Registration (25% Overall Progress) ✅ AUTOMATIC

**When:** Immediately upon user registration  
**Overall Progress:** 25%  
**Status:** Should be set automatically when `RegistrationBonus` record is created

**Backend Action:**
- When a new user registers, create `RegistrationBonus` record with:
  - `status: "pending"`
  - `progressPercentage: 25` ← **CRITICAL: Must be 25, not 0**

---

### 2. Complete Profile (25% Overall Progress)

**Requirements:**
- Date of Birth (`dateOfBirth`)
- Gender (`gender`)
- Profile Photo (`profilePhoto` OR `profilePicture`)
- Address (`address` with all required fields)

**Profile Completion Percentage:**
- Each field = 25% of profile completion
- 1 field completed = 25% profile completion
- 2 fields completed = 50% profile completion
- 3 fields completed = 75% profile completion
- 4 fields completed = 100% profile completion

**Overall Progress Impact:**
- When `profileCompletionPercentage` reaches **100%**, add 25% to overall progress
- Overall progress should become: **25% (registration) + 25% (profile) = 50%**

**Backend Action:**
- In `updateProfileCompletion()`:
  - Calculate `profileCompletionPercentage` based on 4 fields (each = 25%)
  - If `profileCompletionPercentage === 100`, update `progressPercentage` to **50**

---

### 3. Social Media Follow (25% Overall Progress)

**Requirements:**
- User must follow at least **1** social media platform (minimumRequired = 1)
- Platforms: Facebook, Instagram, YouTube, TikTok, Telegram

**Overall Progress Impact:**
- When user follows at least 1 platform, add 25% to overall progress
- Overall progress should become: **50% (registration + profile) + 25% (social) = 75%**

**Backend Action:**
- When `/api/v1/social-media/confirm/:platform` is called successfully:
  - Update `socialMediaVerifications` array
  - If `socialMediaCompleted >= minimumRequired`, update `progressPercentage` to **75**

---

### 4. First Stake (25% Overall Progress)

**Requirements:**
- User must create their first stake
- Stake amount must be **≥ 20 USDT**

**Overall Progress Impact:**
- When first stake is created (amount ≥ 20 USDT), add 25% to overall progress
- Overall progress should become: **75% (registration + profile + social) + 25% (stake) = 100%**
- Bonus is now unlocked and can be activated

**Backend Action:**
- When stake is created:
  - Check if it's the user's first stake
  - Check if amount ≥ 20 USDT
  - If both conditions met, update `progressPercentage` to **100**
  - Update `status` to `"requirements_met"` or `"bonus_active"`

---

## Expected Progress Flow

### New User Registration
```
Registration Bonus Created:
├─ progressPercentage: 25% ✅
├─ status: "pending"
└─ requirements:
   ├─ profile: completionPercentage: 0%
   ├─ socialMedia: completed: 0
   └─ firstStake: completed: false
```

### After Profile Completion
```
Profile Updated (all 4 fields):
├─ progressPercentage: 50% ✅ (was 25%, now 50%)
├─ status: "pending"
└─ requirements:
   ├─ profile: completionPercentage: 100% ✅
   ├─ socialMedia: completed: 0
   └─ firstStake: completed: false
```

### After Social Media Follow
```
Social Media Verified (1 platform):
├─ progressPercentage: 75% ✅ (was 50%, now 75%)
├─ status: "pending"
└─ requirements:
   ├─ profile: completionPercentage: 100% ✅
   ├─ socialMedia: completed: 1 ✅
   └─ firstStake: completed: false
```

### After First Stake
```
First Stake Created (≥ 20 USDT):
├─ progressPercentage: 100% ✅ (was 75%, now 100%)
├─ status: "requirements_met" or "bonus_active"
└─ requirements:
   ├─ profile: completionPercentage: 100% ✅
   ├─ socialMedia: completed: 1 ✅
   └─ firstStake: completed: true ✅
```

---

## Current Issues (To Fix)

### Issue 1: Overall Progress Shows 0% for New Users ❌

**Problem:**
- New users see `progressPercentage: 0%` instead of `25%`

**Expected:**
- New users should see `progressPercentage: 25%` immediately after registration

**Fix Required:**
- When creating `RegistrationBonus` record, set `progressPercentage: 25` (not 0)

**File to Check:**
- `src/models/services/registrationBonusService.ts` - `createRegistrationBonus()` method

---

### Issue 2: Overall Progress Not Updating After Profile Completion ❌

**Problem:**
- After completing profile (100% profile completion), overall progress remains at 25% instead of updating to 50%

**Expected:**
- When `profileCompletionPercentage` reaches 100%, `progressPercentage` should become 50%

**Fix Required:**
- In `updateProfileCompletion()` method, after calculating profile completion:
  ```typescript
  if (profileCompletionPercentage >= 100) {
    registrationBonus.progressPercentage = 50;
  }
  ```

**File to Check:**
- `src/models/services/registrationBonusService.ts` - `updateProfileCompletion()` method

---

### Issue 3: Profile Completion Showing 33% Instead of 25% ❌

**Problem:**
- When 1 profile field is completed, `completionPercentage` shows 33% instead of 25%

**Expected:**
- 1 field completed = 25% (1/4 fields)
- 2 fields completed = 50% (2/4 fields)
- 3 fields completed = 75% (3/4 fields)
- 4 fields completed = 100% (4/4 fields)

**Possible Cause:**
- Backend might be checking only 3 fields instead of 4
- Or calculation is using wrong denominator

**Fix Required:**
- Ensure `checkFieldCompletion()` checks all 4 fields:
  1. `dateOfBirth`
  2. `gender`
  3. `profilePhoto` (checks both `User.profilePicture` AND `UserProfile.profilePhoto`)
  4. `address`
- Calculate: `(completedFields / 4) * 100`

**File to Check:**
- `src/models/services/registrationBonusService.ts` - `checkFieldCompletion()` and `updateProfileCompletion()` methods

---

### Issue 4: Overall Progress Not Updating After Social Media Follow ❌

**Problem:**
- After following social media, overall progress doesn't update to 75%

**Expected:**
- When `socialMediaCompleted >= minimumRequired`, `progressPercentage` should become 75%

**Fix Required:**
- In social media confirmation endpoint, after updating verification:
  ```typescript
  if (socialMediaCompleted >= minimumRequired) {
    registrationBonus.progressPercentage = 75;
  }
  ```

**File to Check:**
- `src/models/controllers/socialMedia.controller.ts` - `confirmSocialPlatform()` method

---

### Issue 5: Overall Progress Not Updating After First Stake ❌

**Problem:**
- After creating first stake (≥ 20 USDT), overall progress doesn't update to 100%

**Expected:**
- When first stake is created (amount ≥ 20 USDT), `progressPercentage` should become 100%

**Fix Required:**
- In stake creation endpoint, check if it's first stake and amount ≥ 20:
  ```typescript
  if (isFirstStake && stakeAmount >= 20) {
    registrationBonus.progressPercentage = 100;
    registrationBonus.status = "requirements_met";
  }
  ```

**File to Check:**
- Stake creation endpoint/controller

---

## Testing Checklist

### Test 1: New User Registration
- [ ] Create new user account
- [ ] Check `RegistrationBonus` record
- [ ] Verify `progressPercentage: 25`
- [ ] Verify `status: "pending"`

### Test 2: Profile Completion
- [ ] Complete all 4 profile fields (DoB, Gender, Avatar, Address)
- [ ] Verify `profileCompletionPercentage: 100`
- [ ] Verify `progressPercentage: 50` (updated from 25)
- [ ] Verify `status: "pending"` (still pending, not complete)

### Test 3: Social Media Follow
- [ ] Follow at least 1 social media platform
- [ ] Verify `socialMediaCompleted >= minimumRequired`
- [ ] Verify `progressPercentage: 75` (updated from 50)
- [ ] Verify `status: "pending"` (still pending)

### Test 4: First Stake
- [ ] Create stake with amount ≥ 20 USDT
- [ ] Verify `firstStakeCompleted: true`
- [ ] Verify `progressPercentage: 100` (updated from 75)
- [ ] Verify `status: "requirements_met"` or `"bonus_active"`

---

## API Response Format

The `/api/v1/registration-bonus/status` endpoint should return:

```json
{
  "success": true,
  "data": {
    "status": "pending",
    "progressPercentage": 25,  // ← Must be 25 for new users, 50 after profile, 75 after social, 100 after stake
    "bonusPercentage": 10,
    "requirements": {
      "profile": {
        "completionPercentage": 0,  // 0-100 based on 4 fields (each = 25%)
        "details": [
          { "fieldName": "dateOfBirth", "isCompleted": false },
          { "fieldName": "gender", "isCompleted": false },
          { "fieldName": "profilePhoto", "isCompleted": false },
          { "fieldName": "address", "isCompleted": false }
        ]
      },
      "socialMedia": {
        "completed": 0,
        "minimumRequired": 1,
        "details": [...]
      },
      "firstStake": {
        "completed": false
      }
    }
  }
}
```

---

## Summary

**Critical Fixes Required:**

1. ✅ Set `progressPercentage: 25` when creating RegistrationBonus (not 0)
2. ✅ Update `progressPercentage: 50` when profile completion reaches 100%
3. ✅ Update `progressPercentage: 75` when social media follow is verified
4. ✅ Update `progressPercentage: 100` when first stake (≥ 20 USDT) is created
5. ✅ Fix profile completion calculation to use 4 fields (not 3), each = 25%

**Progress Calculation Formula:**
```
progressPercentage = 25 (registration)
                   + 25 (if profile complete)
                   + 25 (if social media verified)
                   + 25 (if first stake created)
```

---

**Date:** 2025-01-XX  
**Priority:** HIGH  
**Status:** Awaiting Backend Fix

