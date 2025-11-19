# 🎯 Complete Registration Bonus - Final Step Guide

**Current Progress: 75%**  
**Remaining: First Stake (25%)**

---

## ✅ Current Status

- ✅ **Registration Complete** (25%)
- ✅ **Profile Complete** (25%)  
- ✅ **Instagram Verified** (25%)
- ⏳ **First Stake** (25%) ← Next step!

---

## 🚀 How to Complete the Bonus (Step-by-Step)

### Step 1: Ensure You Have Funds

**Minimum Required:** $20 USDT

**Check Your Balance:**
1. Go to Dashboard
2. Look at your wallet cards
3. Check **Deposit Wallet** balance

**If balance is low:**
- Click "Deposit" button
- Follow deposit instructions
- Wait for funds to arrive

### Step 2: Navigate to Stakes Page

**Two ways:**

**Option A:** From Registration Bonus Banner
- Click "Get Started" button on the stake requirement

**Option B:** From Navigation
- Click on "Stakes" in the sidebar/menu
- Or go to: `http://localhost:3000/dashboard/stakes`

### Step 3: Create Your First Stake

1. **Click "Create Stake" button** (top right)

2. **Enter Amount**
   - Minimum: $20
   - Maximum: Your available balance
   - Example: $50

3. **Select Source**
   - **Both Wallets (Recommended)**: Uses Deposit + Earnings
   - **Deposit Wallet Only**: Uses only deposit funds
   - **Earnings Wallet Only**: Uses only earnings

4. **2FA Code** (if required)
   - Only needed if amount > $500
   - Enter your 2FA code from authenticator app

5. **Click "Continue"** → Review details

6. **Click "Confirm Stake"**

### Step 4: Wait for Automatic Processing

**Backend automatically:**
1. ✅ Creates your stake
2. ✅ Detects it's your first stake
3. ✅ Checks all requirements (profile ✅, Instagram ✅)
4. ✅ Calculates 10% bonus (e.g., $50 stake = $5 bonus)
5. ✅ Creates bonus stake
6. ✅ Updates bonus status to `BONUS_ACTIVE`

**Frontend automatically:**
1. ✅ Refetches registration bonus status
2. ✅ Updates progress from 75% → 100%
3. ✅ Shows success notification
4. ✅ Banner changes to "Bonus Activated!" state
5. ✅ Displays your bonus amount

---

## 🎉 What Happens After Activation

### Your Stakes:

**1. Your Original Stake** ($50 example)
- Status: Active
- Target Return: $100 (200% ROI)
- Weekly Payouts: ~$2.08/week for 48 weeks

**2. Your Bonus Stake** ($5 example)
- Status: Active
- Target Return: $10 (200% ROI, capped at 100% of original)
- Weekly Payouts: Included with your regular stake

### Registration Bonus Banner:

**Before:**
```
Welcome Bonus: 10% on First Stake!
Progress: 75%
⏰ Time Remaining: 3d 19h 21m
```

**After:**
```
🎉 Bonus Activated!
You received $5.00 bonus stake!
Total Bonus Stake: $5.00
View Stakes →
```

### Your Dashboard Updates:

- ✅ Total Staked: Increased by stake amount + bonus
- ✅ Active Stakes: Shows 2 stakes (original + bonus)
- ✅ Target Returns: Updated with both stakes
- ✅ Weekly ROI: Includes both stakes

---

## 🔍 How to Verify It Worked

### Check #1: Console Logs

After creating stake, you should see:
```
[Staking Mutation] ✅ Stake created successfully
[Staking Mutation] 🎁 Registration bonus status will be refetched
[registrationBonusApi] Raw response: { ...progressPercentage: 100... }
[RegistrationBonusBanner] Progress updated to 100%
```

### Check #2: Banner State

The banner should change from:
- Progress bar (75%) → Success card
- Shows bonus amount
- Shows "Bonus Activated" message

### Check #3: Stakes List

Navigate to Stakes page, you should see:
- **2 active stakes** (your stake + bonus stake)
- Bonus stake has "Bonus" badge/label
- Both stakes show in active stakes list

### Check #4: API Response

Open browser DevTools → Network tab:
```
GET /bonuses/registration/status
Response:
{
  "status": "bonus_active",  ← Changed!
  "progressPercentage": 100,  ← Updated!
  "bonusAmount": 5,  ← Your bonus!
  "requirements": {
    "profileCompletion": { "completed": true },
    "socialMediaVerification": { "completed": true },
    "firstStake": { "completed": true }  ← Now true!
  }
}
```

---

## ⚠️ Troubleshooting

### Issue 1: Stake Created but Progress Didn't Update

**Possible Causes:**
1. Backend didn't detect it as first stake
2. Requirements not fully met
3. Frontend didn't refetch

**Solution:**
- Refresh the page
- Check browser console for errors
- Verify all requirements are truly complete

### Issue 2: "Insufficient Balance" Error

**Cause:** Not enough funds in selected wallet(s)

**Solution:**
- Deposit more funds
- Or select different source wallet
- Or reduce stake amount

### Issue 3: Progress Shows 100% but No Bonus Stake

**Cause:** Backend processed bonus but stake creation failed

**Solution:**
- Check stakes list for bonus stake
- Contact support if missing
- Backend logs will show what happened

### Issue 4: 2FA Code Required

**Cause:** Staking amount > $500 and 2FA is enabled

**Solution:**
- Enter 2FA code from authenticator app
- Or reduce amount to ≤ $500
- Or disable 2FA (not recommended)

---

## 📊 Example Scenarios

### Scenario 1: $20 Stake (Minimum)

**Your Stake:**
- Amount: $20
- Target: $40 (200% ROI)
- Weekly: ~$0.83

**Bonus Stake:**
- Amount: $2 (10% of $20)
- Target: $4 (200% ROI, capped at 100%)
- Weekly: Included

**Total Returns:**
- Your stake returns: $40
- Bonus returns: $4
- **Total: $44** (from $20 investment!)

### Scenario 2: $100 Stake (Recommended)

**Your Stake:**
- Amount: $100
- Target: $200 (200% ROI)
- Weekly: ~$4.17

**Bonus Stake:**
- Amount: $10 (10% of $100)
- Target: $20 (200% ROI, capped at 100%)
- Weekly: Included

**Total Returns:**
- Your stake returns: $200
- Bonus returns: $20
- **Total: $220** (from $100 investment!)

### Scenario 3: $500 Stake (Maximum without 2FA)

**Your Stake:**
- Amount: $500
- Target: $1,000 (200% ROI)
- Weekly: ~$20.83

**Bonus Stake:**
- Amount: $50 (10% of $500)
- Target: $100 (200% ROI, capped at 100%)
- Weekly: Included

**Total Returns:**
- Your stake returns: $1,000
- Bonus returns: $100
- **Total: $1,100** (from $500 investment!)

---

## 🎯 Important Notes

### About the Bonus Stake:

1. **Automatic Creation:** You don't create it manually
2. **Same Terms:** 200% ROI, weekly payouts
3. **Capped at 100%:** Bonus returns max out at 100% of original bonus amount
4. **Permanent:** Like all stakes, cannot withdraw principal
5. **Shows in Stakes:** Appears as separate stake with "Bonus" label

### About Timing:

- **Stake Creation:** Instant
- **Bonus Processing:** Automatic (within seconds)
- **First Payout:** Next scheduled payout date (usually Friday/Monday)
- **Banner Update:** Real-time (30-second polling or immediate)

### About Requirements:

All requirements MUST be complete:
- ✅ Profile: 100% (all 4 fields)
- ✅ Social: At least 1 verified platform
- ✅ Stake: Minimum $20
- ✅ Within 7 days: Deadline not passed

---

## 🚀 Ready to Complete!

**You're 75% done!** Just one more step:

1. Make sure you have ≥ $20 USDT in your wallet
2. Go to Stakes page
3. Click "Create Stake"
4. Enter amount and confirm
5. **Watch the magic happen!** 🎉

---

## 📞 Need Help?

**Frontend Integration:**
- File: `src/lib/mutations/stakingMutations.ts`
- Hook: `useCreateStake()`
- Query invalidation: ✅ Added for registration bonus

**Backend Processing:**
- Automatic detection of first stake
- Bonus calculation and creation
- Status update to `BONUS_ACTIVE`

**Issues?**
- Check browser console
- Check Network tab for API responses
- Verify wallet balance
- Ensure all requirements met

---

**Good luck! You're one stake away from completing the registration bonus! 🎯**
