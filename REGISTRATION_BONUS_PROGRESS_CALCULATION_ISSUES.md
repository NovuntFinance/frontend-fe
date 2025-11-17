# Registration Bonus Progress Calculation Issues

## Issues Reported

### Issue 1: Profile Completion Showing 33% Instead of 25%

**Expected Behavior:**
- Profile completion should be calculated as: `(completedFields / totalFields) * 100`
- With 4 required fields (dateOfBirth, gender, profilePhoto, address):
  - 1 field completed = 25% (1/4)
  - 2 fields completed = 50% (2/4)
  - 3 fields completed = 75% (3/4)
  - 4 fields completed = 100% (4/4)

**Current Behavior:**
- Showing 33% when 1 field is completed
- This suggests calculation as 1/3 = 33.33%

**Possible Causes:**
1. Backend is checking only 3 fields instead of 4
2. One field is being excluded from the calculation
3. Field filtering logic is incorrect

**Required Fields (Frontend):**
- `dateOfBirth`
- `gender`
- `profilePhoto`
- `address`

**Backend Check:**
Please verify that `updateProfileCompletion` in `registrationBonusService.ts` is checking all 4 fields:
- `dateOfBirth`
- `gender`
- `profilePhoto` (checks both `User.profilePicture` and `UserProfile.profilePhoto`)
- `address`

---

### Issue 2: Overall Progress Showing 0% Instead of Expected Value

**Expected Behavior:**
Overall progress should be calculated as:
- **0%** = No requirements met
- **25%** = Profile complete (1 of 4 requirements)
- **50%** = Profile + Social media verified (2 of 4 requirements)
- **75%** = Profile + Social + First stake (3 of 4 requirements)
- **100%** = All requirements met + Bonus activated

**Current Behavior:**
- Showing 0% even when profile is complete

**Possible Causes:**
1. `progressPercentage` calculation in `getRegistrationBonusStatus` is not working correctly
2. Progress calculation logic is not checking requirement completion status
3. Progress is not being saved/updated correctly

**Backend Check:**
Please verify that `getRegistrationBonusStatus` in `registrationBonusService.ts` calculates `progressPercentage` as:

```typescript
let progress = 0;
if (profileCompletionPercentage >= 100) progress += 25;
if (socialMediaCompleted >= minimumRequired) progress += 25;
if (firstStakeCompleted) progress += 25;
// Bonus activation = 100%
```

---

### Issue 3: Social Media Verification Stuck

**Status:** ✅ **FIXED** (Frontend)

**Fix Applied:**
- Created `socialMediaApi.ts` service
- Updated `SocialMediaRequirement.tsx` to call backend API endpoints:
  - `GET /api/v1/social-media/visit/:platform` - Track platform visit
  - `POST /api/v1/social-media/confirm/:platform` - Confirm verification
- Added loading states and error handling
- Added proper token handling for verification flow

**Backend Requirements:**
- Ensure `/api/v1/social-media/visit/:platform` returns JSON when `?json=1` query param is provided
- Ensure `/api/v1/social-media/confirm/:platform` accepts optional `token` in request body
- Ensure verification updates registration bonus status correctly

---

## Frontend Debugging

The frontend now includes comprehensive debug logging (development mode only):

1. **API Response Debug:**
   - `[registrationBonusApi] Raw response:` - Shows raw backend response
   - `[registrationBonusApi] 🔍 Progress Debug:` - Shows parsed progress values

2. **Component Debug:**
   - `[RegistrationBonusBanner] 🔍 Data Debug:` - Shows all progress values and expected calculations
   - `[ProfileRequirement] 🔍 Profile Debug:` - Shows profile completion details

3. **Expected Values Display:**
   - Shows expected percentage based on completed fields
   - Shows expected overall progress based on requirement completion

---

## Testing Checklist

### Profile Completion
- [ ] Verify backend checks all 4 required fields
- [ ] Verify calculation: 1 field = 25%, 2 fields = 50%, 3 fields = 75%, 4 fields = 100%
- [ ] Check that `profileCompletionPercentage` is saved correctly in database

### Overall Progress
- [ ] Verify `progressPercentage` calculation logic
- [ ] Test with profile complete only (should be 25%)
- [ ] Test with profile + social (should be 50%)
- [ ] Test with profile + social + stake (should be 75%)
- [ ] Test with all requirements + bonus activated (should be 100%)

### Social Media Verification
- [ ] Test `/api/v1/social-media/visit/:platform?json=1` endpoint
- [ ] Test `/api/v1/social-media/confirm/:platform` endpoint
- [ ] Verify registration bonus status updates after verification
- [ ] Check that `socialMediaVerifications` array is updated correctly

---

## Next Steps

1. **Backend Team:**
   - Review `updateProfileCompletion` method to ensure it checks all 4 fields
   - Review `getRegistrationBonusStatus` to ensure `progressPercentage` is calculated correctly
   - Verify social media verification endpoints work correctly
   - Test progress calculation with various completion states

2. **Frontend Team:**
   - Monitor debug logs to see actual backend responses
   - Verify frontend displays match backend calculations
   - Test social media verification flow end-to-end

---

## Files Modified

### Frontend
- `src/services/socialMediaApi.ts` - New service for social media verification
- `src/components/registration-bonus/SocialMediaRequirement.tsx` - Updated to call API
- `src/components/registration-bonus/RegistrationBonusBanner.tsx` - Enhanced debug logging
- `src/components/registration-bonus/ProfileRequirement.tsx` - Enhanced debug logging

### Backend (To Be Verified)
- `src/models/services/registrationBonusService.ts` - Verify field checking and progress calculation
- `src/models/controllers/socialMedia.controller.ts` - Verify endpoints work correctly

---

**Date:** 2025-01-XX  
**Status:** Frontend fixes applied, awaiting backend verification

