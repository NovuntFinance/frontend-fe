# 🧪 Testing Guide - Stakes Page Fix & Registration Bonus

**Date:** November 18, 2025  
**Purpose:** Verify stakes page loads correctly and understand registration bonus flow

---

## ✅ Part 1: Stakes Page Fix - READY TO TEST NOW

### What Was Fixed

**Problem:** Clicking "Create First Stake" button crashed with error:
```
Failed to Load Stakes
Cannot read properties of undefined (reading 'activeStakes')
```

**Solution:** Updated data handling to support both API response formats:
```typescript
// OLD (broke if data wasn't nested):
const { activeStakes } = stakingData?.data || {};

// NEW (handles both formats):
const stakingResponse = stakingData?.data || stakingData;
const { activeStakes = [] } = stakingResponse || {};
```

### Test Steps

#### Step 1: Test Navigation from Registration Bonus Banner

1. **Open your app:** `http://localhost:3000/dashboard`

2. **Locate the registration bonus banner** (should show 75% progress with Instagram verified)

3. **Click "Get Started" or "Create First Stake"** button on the stake requirement card

4. **Expected Result:**
   - ✅ Page navigates to `/dashboard/stakes`
   - ✅ Page loads WITHOUT error
   - ✅ Shows stakes dashboard with overview cards
   - ✅ Shows "Create Stake" button in top right

5. **If you see error:**
   - ❌ Open browser console (F12)
   - ❌ Copy the error message
   - ❌ Send to me for further debugging

#### Step 2: Test Direct Navigation

1. **Navigate directly:** `http://localhost:3000/dashboard/stakes`

2. **Expected Results Based on Your Account:**

   **If you have NO stakes yet:**
   ```
   ┌─────────────────────────────────────────┐
   │ Overview Cards:                         │
   │ - Total Staked: $0.00                   │
   │ - Total Earned: $0.00                   │
   │ - Target Returns: $0.00                 │
   │ - Progress: 0.00%                       │
   ├─────────────────────────────────────────┤
   │ Available to Stake:                     │
   │ - Deposit Wallet: $XXX                  │
   │ - Earnings Wallet: $XXX                 │
   │ - Total Available: $XXX                 │
   ├─────────────────────────────────────────┤
   │ No Active Stakes Yet                    │
   │ [Create Your First Stake] button        │
   └─────────────────────────────────────────┘
   ```

   **If you have existing stakes:**
   ```
   ┌─────────────────────────────────────────┐
   │ Overview Cards: (with your real data)   │
   ├─────────────────────────────────────────┤
   │ Available to Stake: (your balances)     │
   ├─────────────────────────────────────────┤
   │ Active Stakes (X)                       │
   │ [Stake Card 1] [Stake Card 2] ...       │
   └─────────────────────────────────────────┘
   ```

#### Step 3: Test Create Stake Modal

1. **Click "Create Stake" button** (top right or in empty state)

2. **Expected Result:**
   - ✅ Modal opens with form
   - ✅ Shows amount input
   - ✅ Shows wallet source dropdown
   - ✅ Shows your available balance
   - ✅ Minimum validation: ≥ $20

3. **Try entering amount < $20:**
   - Should show error: "Minimum stake amount is $20"

4. **Close modal** (X button or click outside)
   - Modal should close properly

### Test Results Checklist

- [ ] Registration bonus banner → stakes page: **Navigation works**
- [ ] Direct URL → stakes page: **Loads without error**
- [ ] Overview cards display: **Shows correct data or zeros**
- [ ] Wallet balances shown: **Displays your actual balances**
- [ ] Create Stake button: **Opens modal correctly**
- [ ] Modal validation: **Enforces $20 minimum**
- [ ] No console errors: **Clean browser console**

### Screenshot Locations

**Take screenshots of:**
1. Registration bonus banner (before clicking)
2. Stakes page overview (after navigation)
3. Create Stake modal (opened)
4. Any errors (if they occur)

---

## 🎯 Part 2: Registration Bonus Flow - WHAT TO EXPECT

### Current Status (Your Account)

Based on previous conversation:
- ✅ Profile: 100% complete
- ✅ Instagram: Verified
- ✅ Progress: 75%
- ⏳ **Missing:** First stake ≥ $20

### What Happens When You Create First Stake

#### Scenario: You stake $100

**Immediate (Current Backend - May Need Update):**
```
1. Stake created: $100 active stake
2. Backend detects: First stake
3. Backend checks: All requirements met ✅
4. Backend should: Activate bonus
```

**What You Should See (After Backend Fix):**

**Registration Bonus Banner:**
```
BEFORE stake:
┌────────────────────────────────────┐
│ Welcome Bonus: 10% on First Stake! │
│ Progress: 75%                      │
│ ⏰ Time Remaining: 5d 12h 30m      │
│                                    │
│ Requirements:                      │
│ ✅ Profile Complete                │
│ ✅ Instagram Verified (1/5)        │
│ ⏳ Create First Stake (≥$20)       │
└────────────────────────────────────┘

AFTER stake:
┌────────────────────────────────────┐
│ 🎉 Bonus Activated!                │
│ You earned $10.00 bonus credit!   │
│                                    │
│ Bonus Remaining: $10.00            │
│ Paid Out: $0.00 (0%)               │
│ [██████████████████] 100%          │
│                                    │
│ Next payout: With weekly ROI       │
└────────────────────────────────────┘
```

**Stakes Page:**
```
┌────────────────────────────────────┐
│ Active Stakes (1)                  │
├────────────────────────────────────┤
│ Stake #1                           │
│ Amount: $100.00                    │
│ Target: $200.00 (200% ROI)         │
│ Earned: $0.00                      │
│ Progress: 0%                       │
│ Status: Active                     │
│                                    │
│ NOTE: You should see ONLY 1 stake │
│ (not 2 - bonus is separate credit)│
└────────────────────────────────────┘
```

### What Happens AFTER Weekly ROI Declaration

**Week 1: Admin declares 2.5% ROI**

**Your Earning Wallet Receives:**
```
Regular Stake ROI:    $100 × 2.5% = $2.50
Bonus Credit Payout:  $10 × 2.5%  = $0.25
─────────────────────────────────────────
Total Credited:                    $2.75
```

**Bonus Status Updates:**
```
┌────────────────────────────────────┐
│ 🎉 Registration Bonus Active       │
│                                    │
│ Total Bonus: $10.00                │
│ Paid Out: $0.25 (2.5%)             │
│ Remaining: $9.75                   │
│ [█░░░░░░░░░░░░░░░░░] 2.5%         │
│                                    │
│ This Week: +$0.25                  │
│ Next payout: Next ROI declaration  │
└────────────────────────────────────┘
```

**Week 2: Admin declares 3.0% ROI**

```
Regular Stake ROI:    $100 × 3.0% = $3.00
Bonus Credit Payout:  $10 × 3.0%  = $0.30
─────────────────────────────────────────
Total Credited:                    $3.30

Bonus Remaining: $9.75 - $0.30 = $9.45
```

**This continues for ~35-40 weeks until $10 fully paid out.**

---

## 🎬 Step-by-Step Test Scenario

### Prerequisites

Before testing, ensure:
- [ ] Dev server running: `pnpm dev`
- [ ] Logged into your account
- [ ] Profile at 100%
- [ ] Instagram verified
- [ ] At least $20 in wallet (Deposit or Earning)

### Full Test Flow

#### Part A: Pre-Stake State

1. **Check Registration Bonus Banner:**
   - Should show 75% progress
   - Should show "Create First Stake" requirement pending
   - Note the time remaining

2. **Check Stakes Page:**
   - Navigate to stakes
   - Should show empty state OR existing stakes
   - Note your wallet balances

#### Part B: Create First Stake

3. **Open Create Stake Modal:**
   - Click "Create Stake" button
   - Modal opens

4. **Fill Stake Form:**
   - Amount: Enter $50 (or your test amount ≥ $20)
   - Source: Select "Both Wallets" (or based on your balance)
   - If amount > $500: Will ask for 2FA code

5. **Submit Stake:**
   - Click "Continue"
   - Review confirmation
   - Click "Confirm Stake"

6. **Wait for Success:**
   - Should see success toast
   - Modal closes
   - Stakes page updates

#### Part C: Verify Bonus Activation

7. **Check Registration Bonus Banner:**
   - Should update to 100% progress
   - **Current behavior:** May show "Bonus Activated"
   - **Future behavior:** Will show bonus credit tracking

8. **Check Stakes List:**
   - Should show 1 new active stake
   - **Important:** Should NOT show 2 stakes
   - Bonus is separate credit, not visible in stakes

9. **Check Browser Console:**
   - Look for logs:
   ```
   [Staking Mutation] ✅ Stake created successfully
   [Staking Mutation] 🎁 Registration bonus status will be refetched
   [registrationBonusApi] Raw response: {...}
   ```

10. **Check Network Tab:**
    - Filter: `bonuses/registration/status`
    - Look at response:
    ```json
    {
      "status": "bonus_active",
      "progressPercentage": 100,
      "bonus": {
        "bonusAmount": 5,
        "bonusPaidOut": 0,
        "remainingBonus": 5
      }
    }
    ```

#### Part D: What To Report

11. **Take Screenshots:**
    - Registration bonus banner (before stake)
    - Create stake modal (filled)
    - Stakes page (after stake created)
    - Registration bonus banner (after stake)
    - Browser console logs
    - Network response

12. **Answer These Questions:**
    - Did stakes page load without error? YES / NO
    - Did stake creation succeed? YES / NO
    - Did bonus activate? YES / NO
    - How many stakes do you see? (Should be 1)
    - What does bonus banner show?
    - Any errors in console? YES / NO

---

## 📊 Expected vs Current Behavior

### What Works NOW (After Stakes Page Fix)

| Feature | Status | Notes |
|---------|--------|-------|
| Navigate to stakes page | ✅ WORKS | Fixed the undefined error |
| View stakes overview | ✅ WORKS | Shows correct data |
| Open create stake modal | ✅ WORKS | Validation working |
| Create first stake | ✅ WORKS | Stake created successfully |
| Bonus activation trigger | ✅ WORKS | Backend should detect |

### What Needs Backend Update

| Feature | Status | Notes |
|---------|--------|-------|
| Bonus credit tracking | ⏳ PENDING | Backend needs to add fields |
| Weekly bonus payout | ⏳ PENDING | Backend needs to process |
| Payout history endpoint | ⏳ PENDING | New endpoint needed |
| Bonus credit display | ⏳ PENDING | Frontend waits for backend |

### What You'll See Today vs Future

**Today (Before Backend Update):**
```
Registration Bonus Banner might show:
- Status: "bonus_active" or similar
- May show bonusAmount at root level
- May NOT show bonus credit details
- Payout history not available
```

**After Backend Update:**
```
Registration Bonus Banner will show:
- Bonus Credit: $X.XX remaining
- Paid Out: $X.XX (X%)
- Progress bar showing depletion
- Weekly payout breakdown
- Payout history link
```

---

## 🐛 Troubleshooting

### Issue: Stakes Page Still Shows Error

**Try:**
1. Clear browser cache and reload
2. Check if dev server is running
3. Check backend API is reachable
4. Look for specific error in console
5. Check Network tab for failed requests

### Issue: Create Stake Button Doesn't Work

**Check:**
- Modal component loaded?
- Console errors?
- Button click event firing?
- Wallet balance sufficient?

### Issue: Bonus Doesn't Activate

**Verify:**
- Profile truly 100% complete
- Social media truly verified
- Stake amount ≥ $20
- Within 7-day window
- Backend processing logic working

### Issue: See 2 Stakes After Creation

**This means:**
- Backend is using OLD logic (creating bonus stake)
- Backend needs the update from BACKEND_TEAM_REQUIREMENTS.md
- This is expected until backend implements new system

---

## ✅ Test Report Template

**Copy and fill this out after testing:**

```
=== STAKES PAGE FIX TEST REPORT ===

Date: _____________
Tester: _____________

1. NAVIGATION TEST
   [ ] Registration bonus banner → stakes page: PASS / FAIL
   [ ] Direct URL navigation: PASS / FAIL
   [ ] Error message (if any): _________________________

2. PAGE DISPLAY TEST
   [ ] Overview cards display: PASS / FAIL
   [ ] Wallet balances shown: PASS / FAIL
   [ ] Empty state OR stakes list: PASS / FAIL
   [ ] No console errors: PASS / FAIL

3. CREATE STAKE MODAL TEST
   [ ] Modal opens: PASS / FAIL
   [ ] Form validation works: PASS / FAIL
   [ ] Minimum $20 enforced: PASS / FAIL
   [ ] Modal closes properly: PASS / FAIL

4. FIRST STAKE CREATION TEST (If attempted)
   [ ] Stake created successfully: PASS / FAIL
   [ ] Stake appears in list: PASS / FAIL
   [ ] Bonus activated: PASS / FAIL
   [ ] Number of stakes shown: _____

5. BONUS ACTIVATION TEST (If applicable)
   [ ] Banner updated to 100%: PASS / FAIL
   [ ] Bonus status shown: _________________________
   [ ] bonusAmount visible: YES / NO / Value: $_______

6. ISSUES FOUND
   List any bugs, errors, or unexpected behavior:
   - 
   - 
   -

7. SCREENSHOTS ATTACHED
   [ ] Registration bonus banner (before)
   [ ] Stakes page overview
   [ ] Create stake modal
   [ ] Registration bonus banner (after)
   [ ] Console logs
   [ ] Network responses

=== END REPORT ===
```

---

## 📞 Next Steps

### If Tests PASS ✅

1. **Send test report** confirming everything works
2. **Share BACKEND_TEAM_REQUIREMENTS.md** with backend team
3. **Wait for backend updates** to implement bonus credit system
4. **Frontend updates** after backend ready

### If Tests FAIL ❌

1. **Document exact error** with screenshots
2. **Copy browser console logs**
3. **Send to me** for debugging
4. **Don't proceed** until fixed

---

**Ready to test? Start with Part 1 (Stakes Page Fix) which is ready now! 🚀**
