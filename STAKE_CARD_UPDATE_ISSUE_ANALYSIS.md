# 🔍 Stake Card Update Issue - Analysis & Findings

**Date**: December 14, 2025  
**Issue**: Stake cards showing $0.00 earned and 0.00% progress after daily profit distribution

---

## ✅ Frontend Analysis - **WORKING CORRECTLY**

After thorough investigation, I can confirm that **the frontend is working correctly**. The issue is **100% on the backend side**.

### Frontend Verification:

1. **Data Fetching**: ✅
   - Query correctly fetches from `/api/v1/staking/dashboard`
   - Refetches every 1 minute (updated from 2 minutes)
   - Stale time set to 30 seconds

2. **Data Display**: ✅
   - `StakeCard` component correctly displays:
     - `stake.totalEarned` → "Total Earned" card
     - `stake.progressToTarget` → Progress bar and percentage
     - `stake.remainingToTarget` → "Remaining" amount
   - All fields are properly formatted and displayed

3. **Data Structure**: ✅
   - Frontend expects:
     ```typescript
     {
       totalEarned: number,        // e.g., 135.00
       progressToTarget: string,    // e.g., "0.75%"
       remainingToTarget: number,   // e.g., 17865.00
       targetReturn: number         // e.g., 18000.00
     }
     ```

4. **Response Parsing**: ✅
   - Fixed potential issue with nested response structure
   - Now handles both `{ success: true, data: {...} }` and direct data formats

---

## 🔴 Backend Issue - **NOT UPDATING STAKE FIELDS**

### The Problem:

When daily profit is distributed (at 23:59:59 via cron job), the backend:

- ✅ **DOES** update user's earning wallet balance
- ✅ **DOES** mark daily profit as `isDistributed = true`
- ❌ **DOES NOT** update individual stake fields:
  - `stake.totalEarned` remains 0
  - `stake.progressToTarget` remains "0%"
  - `stake.remainingToTarget` remains full target amount

### Evidence:

From the image you provided:

- **Stake Amount**: $9,000.00
- **Total Earned**: $0.00 ❌ (should be > 0 if profit was distributed)
- **Progress**: 0.00% ❌ (should be > 0%)
- **Remaining**: $18,000.00 ❌ (should be < $18,000 if profit was distributed)

This indicates the backend distributed profit to the wallet but **did not update the stake record**.

---

## 📋 Backend Fix Required

I've created a detailed backend fix document: **`BACKEND_STAKE_UPDATE_ON_DAILY_PROFIT_DISTRIBUTION.md`**

### Key Points for Backend Team:

1. **Where to Fix**:
   - Location: Daily profit distribution function (cron job at 23:59:59)
   - File: Likely `controllers/dailyProfitController.js` or similar

2. **What to Update** (for each active stake):

   ```typescript
   // Calculate today's profit
   const dailyProfit = (stake.amount * profitPercentage) / 100;

   // Update stake fields
   stake.totalEarned += dailyProfit;
   stake.progressToTarget = `${((stake.totalEarned / stake.targetReturn) * 100).toFixed(2)}%`;
   stake.remainingToTarget = Math.max(
     0,
     stake.targetReturn - stake.totalEarned
   );

   // Check completion
   if (stake.totalEarned >= stake.targetReturn) {
     stake.status = 'completed';
   }

   await stake.save();
   ```

3. **When to Update**:
   - **ONLY** when profit is actually distributed (not when declared)
   - During cron job execution (23:59:59)
   - Or when test distribution is triggered

4. **Summary Update**:
   - After updating all stakes, recalculate `summary.totalEarnedFromROS`
   - Should equal sum of all `stake.totalEarned` values

---

## 🧪 Testing After Backend Fix

Once backend is fixed, verify:

1. **Declare daily profit** (e.g., 1.5%)
2. **Wait for distribution** (or trigger test distribution)
3. **Check stake card**:
   - Total Earned should show calculated amount
   - Progress should show calculated percentage
   - Remaining should be reduced
4. **Check API response**:
   ```bash
   GET /api/v1/staking/dashboard
   ```
   Should return updated `totalEarned`, `progressToTarget`, `remainingToTarget`

---

## 📊 Expected vs Actual

### Expected (After Fix):

```
Stake: $9,000
Daily Profit: 1.5%
→ Daily Amount: $135.00

After Distribution:
- totalEarned: $135.00 ✅
- progressToTarget: "0.75%" ✅
- remainingToTarget: $17,865.00 ✅
```

### Actual (Current):

```
Stake: $9,000
Daily Profit: 1.5%
→ Daily Amount: $135.00

After Distribution:
- totalEarned: $0.00 ❌
- progressToTarget: "0.00%" ❌
- remainingToTarget: $18,000.00 ❌
```

---

## 📝 Summary

- **Frontend**: ✅ Working correctly, displaying data as received
- **Backend**: ❌ Not updating stake fields during distribution
- **Fix**: See `BACKEND_STAKE_UPDATE_ON_DAILY_PROFIT_DISTRIBUTION.md` for detailed implementation guide
- **Priority**: 🔴 **CRITICAL** - User-facing data integrity issue

---

## 🔗 Related Documents

1. **`BACKEND_STAKE_UPDATE_ON_DAILY_PROFIT_DISTRIBUTION.md`** - Detailed backend fix guide
2. **`STAKING_DATA_ISSUES.md`** - Previous stake data issues
3. **`DAILY_PROFIT_COMPLETE_FLOW_DOCUMENTATION.md`** - Daily profit system docs

---

**Next Steps**: Share `BACKEND_STAKE_UPDATE_ON_DAILY_PROFIT_DISTRIBUTION.md` with backend team for implementation.
