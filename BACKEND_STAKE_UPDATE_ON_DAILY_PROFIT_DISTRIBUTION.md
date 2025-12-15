# 🔴 CRITICAL: Backend Fix Required - Stake Card Not Updating After Daily Profit Distribution

**Date**: December 14, 2025  
**Priority**: 🔴 **CRITICAL** - User-facing data not updating  
**Issue**: Stake cards show $0.00 earned and 0.00% progress even after daily profit is distributed

---

## 📋 Problem Summary

When daily profit is declared and distributed, the individual stake cards on the user dashboard are **NOT updating** to reflect the new earnings. The cards continue to show:

- **Total Earned**: $0.00
- **Progress to 200% ROS**: 0.00%
- **Remaining**: Full target amount (e.g., $18,000.00)

However, the **Total Earned ROS** summary card (which uses `summary.totalEarnedFromROS`) may be updating correctly, indicating the backend is calculating totals but not updating individual stake records.

---

## 🔍 Root Cause Analysis

### Current Behavior

1. **Admin declares daily profit** (e.g., 1.5% for today)
2. **Cron job runs at 23:59:59** to distribute profit
3. **Backend distributes profit** to user's earning wallet
4. **❌ Backend does NOT update individual stake fields:**
   - `stake.totalEarned` remains 0
   - `stake.progressToTarget` remains "0%"
   - `stake.remainingToTarget` remains full target amount

### Expected Behavior

When daily profit is distributed, the backend MUST:

1. ✅ Calculate daily profit for each active stake
2. ✅ Update each stake's `totalEarned` field
3. ✅ Recalculate `progressToTarget` percentage
4. ✅ Recalculate `remainingToTarget` amount
5. ✅ Update `summary.totalEarnedFromROS` (sum of all stakes' totalEarned)

---

## 🎯 Required Fix: Update Stake Fields During Distribution

### Distribution Function Location

The fix needs to be implemented in the **daily profit distribution function** that runs at 23:59:59 (cron job) or when manually triggered via test distribution.

**Expected location**: `controllers/dailyProfitController.js` or similar, in the `distributeDailyProfit()` function.

---

## 📐 Calculation Formulas

### For Each Active Stake:

```typescript
// 1. Calculate today's profit for this stake
const dailyProfitAmount = (stake.amount * dailyProfitPercentage) / 100;

// 2. Update totalEarned (add today's profit)
stake.totalEarned = stake.totalEarned + dailyProfitAmount;

// 3. Recalculate progressToTarget (as percentage string)
const progressPercent = (stake.totalEarned / stake.targetReturn) * 100;
stake.progressToTarget = `${progressPercent.toFixed(2)}%`;

// 4. Recalculate remainingToTarget
stake.remainingToTarget = Math.max(0, stake.targetReturn - stake.totalEarned);

// 5. Check if stake is completed (reached 200%)
if (stake.totalEarned >= stake.targetReturn) {
  stake.status = 'completed';
  stake.completedAt = new Date();
}

// 6. Save the stake
await stake.save();
```

### For Summary Calculation:

```typescript
// After updating all stakes, recalculate summary
const allActiveStakes = await Stake.find({
  userId: user._id,
  status: 'active',
});

const summary = {
  totalActiveStakes: allActiveStakes.length,
  totalEarnedFromROS: allActiveStakes.reduce(
    (sum, stake) => sum + stake.totalEarned,
    0
  ),
  targetTotalReturns: allActiveStakes.reduce(
    (sum, stake) => sum + stake.targetReturn,
    0
  ),
  progressToTarget: calculateOverallProgress(allActiveStakes),
};

function calculateOverallProgress(stakes) {
  const totalEarned = stakes.reduce((sum, s) => sum + s.totalEarned, 0);
  const totalTarget = stakes.reduce((sum, s) => sum + s.targetReturn, 0);
  if (totalTarget === 0) return '0.00%';
  const progress = (totalEarned / totalTarget) * 100;
  return `${progress.toFixed(2)}%`;
}
```

---

## 🔧 Implementation Guide

### Step 1: Locate Distribution Function

Find the function that distributes daily profit. It should:

- Run at 23:59:59 (cron job)
- Or be callable via `POST /api/v1/admin/daily-profit/test-distribute`
- Currently updates user's earning wallet balance
- Currently sets `isDistributed = true` on the daily profit record

### Step 2: Add Stake Update Logic

**Before distributing to wallet**, update each active stake:

```typescript
async function distributeDailyProfit(dailyProfitRecord) {
  const { date, profitPercentage, userId } = dailyProfitRecord;

  // Get all users with active stakes (or iterate through users)
  const users = await User.find({
    /* active users */
  });

  for (const user of users) {
    // Get all active stakes for this user
    const activeStakes = await Stake.find({
      userId: user._id,
      status: 'active',
    });

    let totalDistributed = 0;

    // Update each stake
    for (const stake of activeStakes) {
      // Calculate daily profit for this stake
      const dailyProfitAmount = (stake.amount * profitPercentage) / 100;

      // Update stake fields
      stake.totalEarned = (stake.totalEarned || 0) + dailyProfitAmount;

      // Recalculate progress
      const progressPercent =
        stake.targetReturn > 0
          ? (stake.totalEarned / stake.targetReturn) * 100
          : 0;
      stake.progressToTarget = `${progressPercent.toFixed(2)}%`;

      // Recalculate remaining
      stake.remainingToTarget = Math.max(
        0,
        stake.targetReturn - stake.totalEarned
      );

      // Check completion
      if (stake.totalEarned >= stake.targetReturn) {
        stake.status = 'completed';
        stake.completedAt = new Date();
      }

      // Save stake
      await stake.save();

      totalDistributed += dailyProfitAmount;
    }

    // Update user's earning wallet
    await updateUserWallet(user._id, totalDistributed);
  }

  // Mark daily profit as distributed
  dailyProfitRecord.isDistributed = true;
  dailyProfitRecord.distributedAt = new Date();
  await dailyProfitRecord.save();
}
```

### Step 3: Ensure Fields Are Returned in API

Verify that `/api/v1/staking/dashboard` endpoint returns these fields for each stake:

```typescript
// In staking controller - getDashboard function
const activeStakes = await Stake.find({ userId: req.user.id, status: 'active' })
  .select(
    '_id userId amount createdAt updatedAt status source targetReturn totalEarned progressToTarget remainingToTarget goal weeklyPayouts'
  )
  .lean();

// Ensure progressToTarget and remainingToTarget are calculated if missing
const stakesWithCalculatedFields = activeStakes.map((stake) => ({
  ...stake,
  progressToTarget: stake.progressToTarget || calculateProgress(stake),
  remainingToTarget:
    stake.remainingToTarget !== undefined
      ? stake.remainingToTarget
      : Math.max(0, stake.targetReturn - (stake.totalEarned || 0)),
}));

function calculateProgress(stake) {
  if (!stake.targetReturn || stake.targetReturn === 0) return '0.00%';
  const progress = ((stake.totalEarned || 0) / stake.targetReturn) * 100;
  return `${progress.toFixed(2)}%`;
}
```

---

## ✅ Testing Checklist

After implementing the fix, test the following:

### Test Case 1: Single Stake Distribution

1. **Setup**: User has 1 active stake of $9,000
2. **Action**: Admin declares 1.5% daily profit
3. **Wait**: Cron job runs (or trigger test distribution)
4. **Verify**:
   - ✅ `stake.totalEarned` = $135.00 (9000 \* 0.015)
   - ✅ `stake.progressToTarget` = "0.75%" (135 / 18000 \* 100)
   - ✅ `stake.remainingToTarget` = $17,865.00 (18000 - 135)
   - ✅ User's earning wallet increased by $135.00

### Test Case 2: Multiple Stakes Distribution

1. **Setup**: User has 3 active stakes: $5,000, $3,000, $1,000
2. **Action**: Admin declares 2.0% daily profit
3. **Wait**: Cron job runs
4. **Verify**:
   - ✅ Stake 1: `totalEarned` = $100.00, `progressToTarget` = "1.00%"
   - ✅ Stake 2: `totalEarned` = $60.00, `progressToTarget` = "1.00%"
   - ✅ Stake 3: `totalEarned` = $20.00, `progressToTarget` = "1.00%"
   - ✅ `summary.totalEarnedFromROS` = $180.00
   - ✅ User's earning wallet increased by $180.00

### Test Case 3: Stake Completion

1. **Setup**: User has stake with `totalEarned` = $17,900 (almost at $18,000 target)
2. **Action**: Admin declares 1.0% daily profit
3. **Wait**: Cron job runs
4. **Verify**:
   - ✅ `stake.totalEarned` = $17,990.00 (should not exceed target)
   - ✅ `stake.status` = 'completed'
   - ✅ `stake.completedAt` is set
   - ✅ `stake.progressToTarget` = "99.94%" or "100.00%"
   - ✅ Stake moved from `activeStakes` to `stakeHistory` in dashboard response

### Test Case 4: API Response Verification

1. **Request**: `GET /api/v1/staking/dashboard`
2. **Verify Response Structure**:

```json
{
  "success": true,
  "data": {
    "activeStakes": [
      {
        "_id": "...",
        "amount": 9000,
        "targetReturn": 18000,
        "totalEarned": 135.0, // ✅ Must be updated
        "progressToTarget": "0.75%", // ✅ Must be calculated
        "remainingToTarget": 17865.0, // ✅ Must be calculated
        "status": "active",
        "createdAt": "2025-12-13T...",
        "updatedAt": "2025-12-14T..." // ✅ Should be recent
      }
    ],
    "summary": {
      "totalEarnedFromROS": 135.0, // ✅ Must match sum of all stakes
      "progressToTarget": "0.75%", // ✅ Must be calculated
      "targetTotalReturns": 18000
    }
  }
}
```

---

## 🚨 Critical Points

1. **Field Updates Must Happen During Distribution**
   - Not when profit is declared
   - Not when user views dashboard
   - **ONLY when profit is actually distributed** (23:59:59 or test distribution)

2. **All Fields Must Be Updated Together**
   - `totalEarned` (add today's profit)
   - `progressToTarget` (recalculate percentage)
   - `remainingToTarget` (recalculate remaining)
   - `updatedAt` (automatic with save)

3. **Summary Must Match Individual Stakes**
   - `summary.totalEarnedFromROS` = sum of all `stake.totalEarned`
   - `summary.progressToTarget` = overall progress across all stakes

4. **Handle Edge Cases**
   - Stake completion (totalEarned >= targetReturn)
   - Zero or negative profit percentage
   - Stakes with missing fields
   - Multiple distributions on same day (should not happen, but handle gracefully)

---

## 📊 Data Flow Diagram

```
Admin Declares Profit (1.5%)
         │
         ▼
Daily Profit Record Created
  - date: "2025-12-14"
  - profitPercentage: 1.5
  - isDistributed: false
         │
         ▼
Cron Job Runs (23:59:59)
         │
         ▼
For Each User with Active Stakes:
         │
         ├─→ For Each Active Stake:
         │      │
         │      ├─→ Calculate: dailyProfit = (stake.amount * 1.5) / 100
         │      ├─→ Update: stake.totalEarned += dailyProfit
         │      ├─→ Recalculate: stake.progressToTarget
         │      ├─→ Recalculate: stake.remainingToTarget
         │      └─→ Save: await stake.save()
         │
         └─→ Update: user.earningWallet += totalDistributed
         │
         ▼
Mark Daily Profit as Distributed
  - isDistributed: true
  - distributedAt: timestamp
         │
         ▼
User Dashboard Refreshes
  - GET /api/v1/staking/dashboard
  - Returns updated stake data
  - Frontend displays new values
```

---

## 🔗 Related Files (Frontend Reference)

The frontend expects these exact field names and formats:

- **File**: `src/lib/queries/stakingQueries.ts`
- **Interface**: `Stake`

  ```typescript
  {
    totalEarned: number; // Must be updated
    progressToTarget: string; // Must be "X.XX%" format
    remainingToTarget: number; // Must be updated
    targetReturn: number; // Should remain constant
  }
  ```

- **File**: `src/components/stake/StakeCard.tsx`
- **Displays**:
  - `stake.totalEarned` → "Total Earned" card
  - `stake.progressToTarget` → Progress bar and percentage
  - `stake.remainingToTarget` → "Remaining" amount

---

## 📝 Summary

**The Problem**: Backend distributes profit to wallets but doesn't update individual stake records.

**The Solution**: Update `totalEarned`, `progressToTarget`, and `remainingToTarget` for each active stake during distribution.

**The Impact**: Users will see real-time updates on their stake cards after daily profit distribution.

**Priority**: 🔴 **CRITICAL** - This is a user-facing data integrity issue that affects trust and user experience.

---

**Questions or need clarification?** Please refer to:

- `STAKING_DATA_ISSUES.md` - Previous stake data issues
- `DAILY_PROFIT_COMPLETE_FLOW_DOCUMENTATION.md` - Daily profit system documentation
- Frontend code: `src/lib/queries/stakingQueries.ts` - Expected data structure
