# Registration Bonus Progress Calculation Issue

## Issue Summary

**Priority:** High  
**Status:** ✅ **RESOLVED** - Backend Fix Complete  
**Date:** 2025-01-XX  
**Resolution Date:** 2025-01-XX

~~The registration bonus progress percentage is not updating correctly after profile completion. The frontend displays stale progress data even after users complete their profile requirements.~~

**✅ RESOLVED:** Backend team has fixed the issue. Profile completion and progress percentage now update correctly in real-time. See `REGISTRATION_BONUS_PROGRESS_FIX_VERIFIED.md` for details.

---

## Current Behavior

### What Users See:
1. **Profile Completion:** Shows `0%` even after completing all required profile fields
2. **Overall Progress:** Shows `25%` instead of `50%` after completing profile
3. **Profile Fields:** Individual fields show as completed (✅) but `completionPercentage` remains at 0%

### Expected Behavior:
1. **Profile Completion:** Should show `100%` after completing all required fields
2. **Overall Progress:** Should show `50%` after completing profile (25% per requirement: Profile, Social Media, Stake, Bonus Activation)
3. **Real-time Updates:** Progress should update immediately after profile update

---

## Technical Details

### API Endpoint
```
GET /api/v1/registration-bonus/status
```

### Expected Response Structure

```typescript
{
  "success": true,
  "data": {
    "status": "pending" | "requirements_met" | "bonus_active" | "expired" | "completed" | "cancelled",
    "progressPercentage": 0 | 25 | 50 | 75 | 100,  // ⚠️ NOT UPDATING
    "currentStep": 1 | 2 | 3 | 4,
    "requirements": {
      "profile": {
        "completionPercentage": 0-100,  // ⚠️ SHOWING 0% WHEN SHOULD BE 100%
        "details": [
          {
            "fieldName": "dateOfBirth" | "gender" | "profilePhoto" | "address",
            "isCompleted": true | false,
            "completedAt": "2025-01-XX..." | null,
            "value": "..." | null
          }
        ]
      },
      "socialMedia": {
        "completed": 0-5,
        "total": 5,
        "minimumRequired": 1,
        "details": [...]
      },
      "firstStake": {
        "completed": true | false,
        "amount": number | null,
        "stakeId": string | null
      }
    }
  }
}
```

---

## Progress Calculation Logic

### Expected Progress Breakdown:

The `progressPercentage` should be calculated based on completed requirements:

```
Progress = (Completed Requirements / Total Requirements) × 100

Where:
- Total Requirements = 4 (Profile, Social Media, Stake, Bonus Activation)
- Each requirement = 25% (25, 50, 75, 100)

Calculation:
- Profile Complete = 25%
- Profile + Social Media Complete = 50%
- Profile + Social Media + Stake Complete = 75%
- All Complete = 100%
```

### Profile Completion Calculation:

The `requirements.profile.completionPercentage` should be calculated as:

```
Profile Completion = (Completed Fields / Required Fields) × 100

Required Fields:
1. dateOfBirth
2. gender
3. profilePhoto
4. address

If all 4 fields are completed → 100%
If 2 fields are completed → 50%
If 0 fields are completed → 0%
```

---

## Root Cause Analysis

### Issue 1: Profile Completion Not Updating

**Problem:** When a user updates their profile via `PATCH /api/v1/users/profile`, the registration bonus record is not being updated.

**Expected Flow:**
1. User updates profile → `PATCH /api/v1/users/profile`
2. Backend updates user profile
3. Backend checks if user has registration bonus record
4. Backend recalculates `profileCompletion` array and `profileCompletionPercentage`
5. Backend updates `progressPercentage` based on new completion status
6. Frontend fetches updated status → Shows correct progress

**Current Flow:**
1. User updates profile → `PATCH /api/v1/users/profile`
2. Backend updates user profile ✅
3. Backend does NOT update registration bonus record ❌
4. Frontend fetches status → Gets stale data ❌

### Issue 2: Progress Percentage Not Recalculating

**Problem:** The `progressPercentage` field is not being recalculated when profile completion changes.

**Expected Behavior:**
- When `profileCompletionPercentage` changes from 0% → 100%
- `progressPercentage` should update from 0% → 25%

**Current Behavior:**
- `profileCompletionPercentage` remains at 0%
- `progressPercentage` remains at 0% or shows incorrect value

---

## Required Backend Fixes

### Fix 1: Update Registration Bonus on Profile Update

**Location:** Profile update endpoint handler  
**Action:** After successfully updating user profile, trigger registration bonus recalculation

```javascript
// Pseudo-code for profile update endpoint
async function updateProfile(userId, profileData) {
  // 1. Update user profile
  const updatedUser = await User.findByIdAndUpdate(userId, profileData);
  
  // 2. Check if user has registration bonus record
  const bonusRecord = await RegistrationBonus.findOne({ userId });
  
  if (bonusRecord) {
    // 3. Recalculate profile completion
    const profileCompletion = calculateProfileCompletion(updatedUser);
    const profileCompletionPercentage = calculateCompletionPercentage(profileCompletion);
    
    // 4. Update bonus record
    bonusRecord.profileCompletion = profileCompletion;
    bonusRecord.profileCompletionPercentage = profileCompletionPercentage;
    
    // 5. Recalculate overall progress
    bonusRecord.progressPercentage = calculateOverallProgress(bonusRecord);
    bonusRecord.currentStep = calculateCurrentStep(bonusRecord);
    
    // 6. Update status if all requirements met
    if (allRequirementsMet(bonusRecord)) {
      bonusRecord.status = 'requirements_met';
    }
    
    await bonusRecord.save();
  }
  
  return updatedUser;
}
```

### Fix 2: Implement Profile Completion Calculation

**Required Fields for Registration Bonus:**
1. `dateOfBirth` (from user profile)
2. `gender` (from user profile)
3. `profilePhoto` (from user profile)
4. `address` (from user profile)

**Calculation Logic:**
```javascript
function calculateProfileCompletion(user) {
  const requiredFields = [
    { fieldName: 'dateOfBirth', value: user.dateOfBirth },
    { fieldName: 'gender', value: user.gender },
    { fieldName: 'profilePhoto', value: user.profilePicture || user.avatar },
    { fieldName: 'address', value: user.address }
  ];
  
  return requiredFields.map(field => ({
    fieldName: field.fieldName,
    isCompleted: !!field.value,
    completedAt: field.value ? new Date() : null,
    value: field.value || null
  }));
}

function calculateCompletionPercentage(profileCompletion) {
  const completed = profileCompletion.filter(f => f.isCompleted).length;
  const total = profileCompletion.length;
  return Math.round((completed / total) * 100);
}
```

### Fix 3: Implement Overall Progress Calculation

**Calculation Logic:**
```javascript
function calculateOverallProgress(bonusRecord) {
  let progress = 0;
  
  // Profile completion (25%)
  if (bonusRecord.profileCompletionPercentage === 100) {
    progress += 25;
  }
  
  // Social media verification (25%)
  const socialCompleted = bonusRecord.socialMediaVerifications.filter(v => v.isVerified).length;
  const socialRequired = bonusRecord.socialMediaVerifications.length || 1;
  if (socialCompleted >= socialRequired) {
    progress += 25;
  }
  
  // First stake (25%)
  if (bonusRecord.firstStakeCompleted) {
    progress += 25;
  }
  
  // Bonus activation (25%)
  if (bonusRecord.status === 'bonus_active' || bonusRecord.status === 'completed') {
    progress += 25;
  }
  
  return progress; // 0, 25, 50, 75, 100
}

function calculateCurrentStep(bonusRecord) {
  if (bonusRecord.profileCompletionPercentage < 100) return 1;
  if (bonusRecord.socialMediaVerifications.filter(v => v.isVerified).length < 1) return 2;
  if (!bonusRecord.firstStakeCompleted) return 3;
  return 4;
}
```

---

## Testing Checklist

### Test Case 1: Profile Update Triggers Progress Update
- [ ] User completes profile (dateOfBirth, gender, profilePhoto, address)
- [ ] Backend updates registration bonus record
- [ ] `profileCompletionPercentage` = 100%
- [ ] `progressPercentage` = 25%
- [ ] API response reflects updated values

### Test Case 2: Partial Profile Completion
- [ ] User completes 2 out of 4 profile fields
- [ ] `profileCompletionPercentage` = 50%
- [ ] `progressPercentage` = 0% (no requirement fully complete)
- [ ] API response reflects correct percentages

### Test Case 3: Multiple Requirements Complete
- [ ] User completes profile (25%)
- [ ] User verifies social media (25%)
- [ ] `progressPercentage` = 50%
- [ ] API response reflects correct progress

### Test Case 4: Real-time Updates
- [ ] User updates profile
- [ ] Frontend immediately fetches status
- [ ] Progress updates without page refresh
- [ ] No stale data displayed

---

## API Response Examples

### Before Profile Completion:
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "progressPercentage": 0,
    "currentStep": 1,
    "requirements": {
      "profile": {
        "completionPercentage": 0,
        "details": [
          { "fieldName": "dateOfBirth", "isCompleted": false },
          { "fieldName": "gender", "isCompleted": false },
          { "fieldName": "profilePhoto", "isCompleted": false },
          { "fieldName": "address", "isCompleted": false }
        ]
      }
    }
  }
}
```

### After Profile Completion (Expected):
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "progressPercentage": 25,
    "currentStep": 2,
    "requirements": {
      "profile": {
        "completionPercentage": 100,
        "details": [
          { "fieldName": "dateOfBirth", "isCompleted": true, "completedAt": "2025-01-XX..." },
          { "fieldName": "gender", "isCompleted": true, "completedAt": "2025-01-XX..." },
          { "fieldName": "profilePhoto", "isCompleted": true, "completedAt": "2025-01-XX..." },
          { "fieldName": "address", "isCompleted": true, "completedAt": "2025-01-XX..." }
        ]
      }
    }
  }
}
```

### After Profile + Social Media Completion (Expected):
```json
{
  "success": true,
  "data": {
    "status": "requirements_met",
    "progressPercentage": 50,
    "currentStep": 3,
    "requirements": {
      "profile": {
        "completionPercentage": 100
      },
      "socialMedia": {
        "completed": 1,
        "minimumRequired": 1
      }
    }
  }
}
```

---

## Frontend Integration

### Frontend Query Invalidation

The frontend already invalidates the registration bonus query after profile updates:

```typescript
// src/lib/mutations.ts
onSuccess: async (data) => {
  // ... profile update logic ...
  
  // Invalidate registration bonus to refresh progress
  queryClient.invalidateQueries({ queryKey: queryKeys.registrationBonus });
}
```

### Frontend Auto-Refresh

The frontend polls the status endpoint every 30 seconds when status is `pending`:

```typescript
// src/hooks/useRegistrationBonus.ts
refetchInterval: (query) => {
  const status = query.state.data?.data?.status;
  switch (status) {
    case 'pending':
    case 'requirements_met':
      return 30000; // 30 seconds
    // ...
  }
}
```

**Note:** The frontend is correctly configured to fetch updates. The issue is that the backend is not updating the registration bonus record when profiles are updated.

---

## Additional Notes

### Field Mapping

The frontend sends profile updates with these field names:
- `firstName` / `fname`
- `lastName` / `lname`
- `dateOfBirth`
- `gender`
- `profilePhoto` / `profilePicture` / `avatar`
- `address`
- `phoneNumber`
- `countryCode`

The backend should map these to the registration bonus `profileCompletion` array using the field names:
- `dateOfBirth` → `dateOfBirth`
- `gender` → `gender`
- `profilePhoto` → `profilePhoto` (check `profilePicture` or `avatar` as fallback)
- `address` → `address`

### Status Transitions

When `progressPercentage` reaches certain thresholds, the status should update:
- `progressPercentage = 0%` → `status = "pending"`
- `progressPercentage = 25%` → `status = "pending"` (profile complete)
- `progressPercentage = 50%` → `status = "pending"` (profile + social complete)
- `progressPercentage = 75%` → `status = "requirements_met"` (all requirements met, waiting for stake)
- `progressPercentage = 100%` → `status = "bonus_active"` (bonus activated)

---

## Contact & Support

**Frontend Team:** Ready to test once backend fixes are deployed  
**Expected Fix Timeline:** ASAP (blocking user experience)  
**Priority:** High (users cannot see their progress correctly)

---

## Summary

**The Issue:** Registration bonus progress is not updating after profile completion.

**Root Cause:** Backend is not recalculating `profileCompletionPercentage` and `progressPercentage` when user profiles are updated.

**Required Fix:** Implement profile completion calculation and progress recalculation in the profile update endpoint handler.

**Expected Result:** Progress updates immediately after profile completion, showing correct percentages (0% → 25% → 50% → 75% → 100%).

