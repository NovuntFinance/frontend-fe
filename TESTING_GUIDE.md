# 🧪 Registration Bonus System - Testing Guide

## Prerequisites

1. **Backend API Running**: Ensure your backend is running and accessible
2. **Database**: Make sure you have test users or can create new ones
3. **Browser**: Use Chrome/Edge with DevTools open (F12) to see console logs

---

## 🚀 Quick Start

### 1. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 📋 Testing Scenarios

### Test 1: New User Registration (0% → 25%)

**Goal**: Verify new registrations automatically get 25% progress

**Steps**:
1. Create a new account (or use a fresh test account)
2. Complete email verification
3. Log in to dashboard
4. **Check**: Registration bonus banner should appear
5. **Verify**:
   - ✅ Progress shows **25%**
   - ✅ Timer shows ~7 days remaining
   - ✅ Next step description shows "Complete your profile"
   - ✅ Status is `PENDING`
   - ✅ Profile completion shows 0/4 fields
   - ✅ Social media shows 0/5 verified
   - ✅ First stake shows as incomplete

**Expected Console Log**:
```
[RegistrationBonusBanner] Bonus data: {
  status: 'PENDING',
  progressPercentage: 25,
  ...
}
```

---

### Test 2: Profile Completion (25% → 50%)

**Goal**: Verify profile completion updates progress to 50%

**Steps**:
1. Click "Complete Profile" or navigate to profile page
2. Fill in all 4 required fields:
   - Date of Birth
   - Gender
   - Profile Photo (upload)
   - Address
3. Save profile
4. Return to dashboard
5. **Check**: Banner should update automatically
6. **Verify**:
   - ✅ Progress jumps to **50%**
   - ✅ Profile completion shows 4/4 ✅
   - ✅ Next step shows "Verify all 5 social media platforms"
   - ✅ Timer still counting down

**Expected Behavior**:
- Banner refetches after profile save
- Progress bar animates to 50%
- Profile section shows all checkmarks

---

### Test 3: Social Media Verification (50% → 75%)

**Goal**: Verify social media verification updates progress

**Steps**:
1. In the banner, click "Connect Social Media" or verify buttons
2. For each platform (Facebook, Instagram, YouTube, TikTok, Telegram):
   - Click "Verify" button
   - Wait for 30 seconds (dwell time requirement)
   - Click "Confirm Verification"
3. After each verification:
   - **Check**: Banner should refetch and update
   - **Verify**: Progress counter updates (1/5, 2/5, etc.)
4. After all 5 platforms verified:
   - **Check**: Progress should jump to **75%**
   - **Verify**:
     - ✅ Social media shows 5/5 ✅
     - ✅ Next step shows "Make your first stake (minimum 20 USDT)"
     - ✅ "Stake Now" button appears with pulsing animation

**Expected Behavior**:
- Each verification triggers a refetch
- Progress updates incrementally
- All platforms show checkmarks when complete

---

### Test 4: First Stake Creation (75% → 100%)

**Goal**: Verify stake creation activates bonus and shows celebration

**Steps**:
1. Navigate to "Create New Stake" page (`/dashboard/stakes/new`)
2. **Check**: Bonus preview should appear if eligible
3. **Verify**:
   - ✅ Green banner: "Great News! You're Eligible for a 10% Bonus!"
   - ✅ Bonus breakdown shows:
     - Your Stake: [amount] USDT
     - Bonus (10%): [bonus amount] USDT
     - Total Working Capital: [total] USDT
     - Earnings breakdown with 200% and 100% ROI targets
4. Enter stake amount (minimum $20, but use $100 for testing)
5. Click "Create Stake"
6. **After stake creation**:
   - **Check**: Should redirect to stakes page
   - **Check**: Confetti animation should appear
   - **Check**: Celebration modal should open
7. **Verify Modal**:
   - ✅ "🎊 Congratulations! 🎊" header
   - ✅ Animated sparkles and gift icon
   - ✅ Shows Your Stake: 100 USDT
   - ✅ Shows Bonus Stake: 10 USDT
   - ✅ Earnings Breakdown:
     - Main Stake: 100 USDT → Target: 200 USDT (200% ROI)
     - Bonus Stake: 10 USDT → Target: 10 USDT (100% ROI)
     - Total Expected Profit: 110 USDT
   - ✅ Info box explains what it means
   - ✅ "View My Stakes →" button works

**Expected Behavior**:
- Confetti rains for 5 seconds
- Modal appears with smooth animation
- All calculations are correct
- Clicking "View My Stakes" navigates correctly

---

### Test 5: Banner After Activation

**Goal**: Verify banner behavior after bonus is activated

**Steps**:
1. After bonus activation, return to dashboard
2. **Check**: Banner should NOT appear
3. **Check**: Celebration modal should NOT appear again (only once)
4. **Verify**: Status is now `ACTIVE` or `BONUS_ACTIVE`

**Expected Behavior**:
- Banner is hidden
- No duplicate celebrations
- User can still see bonus in their stakes list

---

### Test 6: Timer Countdown

**Goal**: Verify timer updates correctly

**Steps**:
1. View banner with active timer
2. Wait 1 minute
3. **Check**: Timer should update (minutes decrease)
4. **Check**: Days/hours/minutes format correctly
5. Test with different time remaining:
   - 6 days 12 hours → Shows "6d 12h 00m"
   - 1 day 0 hours → Shows "1d 00h 00m"
   - 12 hours → Shows "00d 12h 00m"
   - 30 minutes → Shows "00d 00h 30m"

**Expected Behavior**:
- Timer updates every minute
- Format is readable and correct
- Negative time shows "EXPIRED"

---

### Test 7: Expired Bonus

**Goal**: Verify expired bonus displays correctly

**Steps**:
1. Use a test account with expired bonus (or wait 7 days)
2. **Check**: Banner should show "EXPIRED" status
3. **Verify**:
   - ✅ Red "EXPIRED" badge
   - ✅ Shows progress achieved (e.g., "You achieved: 50% progress")
   - ✅ Message explains bonus expired
   - ✅ Dismiss button works

**Expected Behavior**:
- Banner still visible but shows expired state
- User can dismiss it
- No celebration for expired bonuses

---

### Test 8: Refetching After Actions

**Goal**: Verify banner updates after each action

**Steps**:
1. Open browser DevTools → Network tab
2. Filter by "registration" or "bonus"
3. Perform actions:
   - Update profile → Should see refetch
   - Verify social media → Should see refetch
   - Create stake → Should see refetch
4. **Check**: Each action triggers a refetch
5. **Check**: Banner updates without page refresh

**Expected Behavior**:
- Automatic refetch after each mutation
- No manual refresh needed
- Updates are smooth and immediate

---

### Test 9: Edge Cases

#### 9a. User with No Bonus (404)
- **Test**: User registered before bonus system
- **Expected**: Banner doesn't appear (404 handled gracefully)

#### 9b. Partial Progress
- **Test**: User completes only some requirements
- **Expected**: Progress reflects partial completion correctly

#### 9c. Network Error
- **Test**: Disconnect network, try to verify social media
- **Expected**: Error toast appears, user can retry

#### 9d. Minimum Stake Amount
- **Test**: Try to stake $19 (below $20 minimum)
- **Expected**: Error message, bonus not activated

#### 9e. Multiple Stakes
- **Test**: Create second stake
- **Expected**: Bonus only applies to first stake

---

## 🔍 Debugging Tips

### Check Console Logs

Open DevTools Console and look for:
```
[RegistrationBonusBanner] Bonus data: { ... }
[useVerifySocialMedia] Verification successful: { ... }
[Staking Mutation] ✅ Stake created, invalidating queries...
```

### Check Network Tab

Filter by:
- `/bonuses/registration/status` - Status checks
- `/bonuses/registration/verify-social` - Social verification
- `/stakes/create` - Stake creation

### Check React Query DevTools

If installed, check:
- Query cache state
- Refetch triggers
- Invalidation events

---

## ✅ Testing Checklist

- [ ] New registration shows 25% progress
- [ ] Profile completion updates to 50%
- [ ] Social media verification updates to 75%
- [ ] All 5 platforms can be verified
- [ ] Stake creation shows bonus preview
- [ ] Bonus preview calculations are correct
- [ ] Confetti animation appears on activation
- [ ] Celebration modal shows correct breakdown
- [ ] Banner hides after activation
- [ ] Timer counts down correctly
- [ ] Expired status displays correctly
- [ ] Refetching works after each action
- [ ] No duplicate celebrations
- [ ] Edge cases handled gracefully

---

## 🐛 Common Issues & Solutions

### Issue: Banner not showing
**Solution**: 
- Check if user has bonus (check API response)
- Check console for errors
- Verify user completed email verification

### Issue: Progress stuck at 0%
**Solution**:
- Check backend API response
- Verify 25% fallback is working
- Check console logs for bonus data

### Issue: Confetti not appearing
**Solution**:
- Check if `react-confetti` is installed
- Verify `showConfetti` state is true
- Check browser console for errors

### Issue: Modal not showing
**Solution**:
- Check if `Dialog` component is imported
- Verify `showCelebrationModal` state
- Check if bonus status is ACTIVE

### Issue: Refetch not working
**Solution**:
- Check React Query DevTools
- Verify mutations invalidate queries
- Check network tab for API calls

---

## 📊 Expected API Responses

### New Registration (25%)
```json
{
  "status": "PENDING",
  "progressPercentage": 25,
  "currentStep": 1,
  "nextStepDescription": "Complete your profile (age, gender, avatar, address)",
  "timeRemaining": 604800000
}
```

### After Profile (50%)
```json
{
  "status": "PENDING",
  "progressPercentage": 50,
  "currentStep": 2,
  "nextStepDescription": "Verify all 5 social media platforms"
}
```

### After Social Media (75%)
```json
{
  "status": "PENDING",
  "progressPercentage": 75,
  "currentStep": 3,
  "nextStepDescription": "Make your first stake (minimum 20 USDT)"
}
```

### After Stake (100%)
```json
{
  "status": "ACTIVE",
  "progressPercentage": 100,
  "bonusAmount": 10,
  "firstStakeAmount": 100
}
```

---

## 🎯 Success Criteria

The registration bonus system is working correctly if:

1. ✅ All 5 states display correctly (0% → 25% → 50% → 75% → 100%)
2. ✅ Progress updates automatically after each action
3. ✅ Timer counts down accurately
4. ✅ Confetti appears on activation
5. ✅ Celebration modal shows correct calculations
6. ✅ Bonus preview appears on stake creation page
7. ✅ All edge cases are handled gracefully
8. ✅ No console errors or warnings
9. ✅ UI is responsive and smooth
10. ✅ All buttons and links work correctly

---

**Happy Testing! 🚀**

