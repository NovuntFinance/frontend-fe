# Staking Dashboard Data Issues - Backend Fix Required

**Date**: November 19, 2025  
**Status**: 🔴 Critical - Data Integrity Issues  
**Priority**: HIGH

---

## Issue Summary

The `/staking/dashboard` endpoint is returning incorrect and duplicate data:

1. ❌ Same stakes appearing in both `activeStakes` and `stakeHistory` arrays
2. ❌ Missing or malformed `createdAt` dates (showing as "Invalid Date")
3. ❌ Missing `status` field (showing as "Unknown")
4. ❌ Missing `progressToTarget` field (showing as 0%)
5. ❌ Completed stakes have incorrect `targetReturn` ($0 instead of actual amount)

---

## Current Behavior

### What Frontend is Receiving

```json
{
  "success": true,
  "data": {
    "activeStakes": [
      {
        "_id": "stake_1",
        "amount": 250,
        "targetReturn": 500,
        "totalEarned": 0,
        "createdAt": null,  // ❌ Should be a date string
        "status": null,     // ❌ Should be "active"
        "progressToTarget": null,  // ❌ Should be "0%"
        "goal": "housing"
      },
      {
        "_id": "stake_2",
        "amount": 30,
        "targetReturn": 60,
        "totalEarned": 0,
        "createdAt": null,  // ❌ Missing
        "status": null,     // ❌ Missing
        "progressToTarget": null,  // ❌ Missing
        "goal": "other"
      }
    ],
    "stakeHistory": [
      {
        "_id": "stake_1",  // ❌ DUPLICATE - Same as activeStakes[0]
        "amount": 250,
        "targetReturn": 0,  // ❌ Should be 500
        "totalEarned": 0,
        "createdAt": null,
        "status": null,
        "goal": "housing"
      },
      {
        "_id": "stake_2",  // ❌ DUPLICATE - Same as activeStakes[1]
        "amount": 30,
        "targetReturn": 0,  // ❌ Should be 60
        "totalEarned": 0,
        "createdAt": null,
        "status": null,
        "goal": "other"
      }
    ]
  }
}
```

---

## Expected Behavior

### Correct Response Format

```json
{
  "success": true,
  "data": {
    "activeStakes": [
      {
        "_id": "673c123abc...",
        "amount": 250,
        "targetReturn": 500,
        "totalEarned": 0,
        "remainingToTarget": 500,
        "createdAt": "2025-11-19T10:30:00.000Z",  // ✅ Valid ISO date
        "status": "active",                        // ✅ Valid status
        "progressToTarget": "0%",                  // ✅ Calculated percentage
        "goal": "housing",
        "weeklyPayouts": []
      },
      {
        "_id": "673c124xyz...",
        "amount": 30,
        "targetReturn": 60,
        "totalEarned": 0,
        "remainingToTarget": 60,
        "createdAt": "2025-11-19T10:45:00.000Z",  // ✅ Valid ISO date
        "status": "active",                        // ✅ Valid status
        "progressToTarget": "0%",                  // ✅ Calculated percentage
        "goal": "other",
        "weeklyPayouts": []
      }
    ],
    "stakeHistory": []  // ✅ Empty because no stakes are completed yet
  }
}
```

---

## Issues Breakdown

### Issue 1: Duplicate Stakes

**Problem**: Same stake IDs appearing in both `activeStakes` and `stakeHistory`

**Root Cause**: Backend query logic is not filtering properly by status

**Fix Required**:
```typescript
// In your dashboard controller

// ❌ WRONG - Returns all stakes twice
const activeStakes = await Stake.find({ userId });
const stakeHistory = await Stake.find({ userId });

// ✅ CORRECT - Filter by status
const activeStakes = await Stake.find({ 
  userId, 
  status: 'active' 
}).sort({ createdAt: -1 });

const stakeHistory = await Stake.find({ 
  userId, 
  status: { $in: ['completed', 'cancelled'] }
}).sort({ createdAt: -1 });
```

---

### Issue 2: Missing createdAt Field

**Problem**: `createdAt: null` or missing entirely

**Root Cause**: Either:
1. Field not being saved during stake creation
2. Field not being selected in the query
3. Schema doesn't have `timestamps: true`

**Fix Required**:

**Option A - Ensure Schema Has Timestamps:**
```typescript
const StakeSchema = new Schema({
  // ... fields
}, {
  timestamps: true  // ✅ Automatically adds createdAt and updatedAt
});
```

**Option B - Manually Set in Controller:**
```typescript
const stake = await Stake.create({
  userId,
  amount,
  targetReturn: amount * 2,
  status: 'active',
  createdAt: new Date(),  // ✅ Explicitly set
  // ...
});
```

---

### Issue 3: Missing status Field

**Problem**: `status: null` or undefined

**Root Cause**: Status not being set during stake creation

**Fix Required**:
```typescript
// In staking controller - createStake function
const stake = await Stake.create({
  userId: req.user.id,
  amount,
  targetReturn: amount * 2,
  status: 'active',  // ✅ Always set status on creation
  totalEarned: 0,
  remainingToTarget: amount * 2,
  duration: 0,
  endDate: null,
  goal,
  weeklyPayouts: []
});
```

---

### Issue 4: Missing progressToTarget

**Problem**: `progressToTarget: null` or missing

**Root Cause**: Not being calculated or saved

**Fix Required**:

**Option A - Calculate in Schema Virtual:**
```typescript
StakeSchema.virtual('progressToTarget').get(function() {
  if (this.targetReturn === 0) return '0%';
  const progress = (this.totalEarned / this.targetReturn) * 100;
  return `${progress.toFixed(2)}%`;
});

// Make sure virtuals are included in JSON
StakeSchema.set('toJSON', { virtuals: true });
StakeSchema.set('toObject', { virtuals: true });
```

**Option B - Calculate in Controller:**
```typescript
const stakes = await Stake.find({ userId, status: 'active' });

const stakesWithProgress = stakes.map(stake => ({
  ...stake.toObject(),
  progressToTarget: stake.targetReturn > 0 
    ? `${((stake.totalEarned / stake.targetReturn) * 100).toFixed(2)}%`
    : '0%',
  remainingToTarget: stake.targetReturn - stake.totalEarned
}));
```

---

### Issue 5: Completed Stakes Wrong targetReturn

**Problem**: Completed stakes showing `targetReturn: 0` instead of actual amount

**Root Cause**: Likely being set to 0 when stake is marked complete

**Fix Required**:
```typescript
// When marking stake as completed
const stake = await Stake.findById(stakeId);

stake.status = 'completed';
stake.completedAt = new Date();
// ✅ DO NOT reset targetReturn to 0
// stake.targetReturn should remain at original amount * 2

await stake.save();
```

---

## Required Fields Checklist

Every stake returned by `/staking/dashboard` must have:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `_id` | ObjectId | ✅ Yes | "673c123abc..." |
| `userId` | ObjectId | ✅ Yes | "69187fb8ab..." |
| `amount` | Number | ✅ Yes | 250 |
| `targetReturn` | Number | ✅ Yes | 500 |
| `totalEarned` | Number | ✅ Yes | 0 |
| `remainingToTarget` | Number | ✅ Yes | 500 |
| `status` | String | ✅ Yes | "active" / "completed" / "cancelled" |
| `createdAt` | Date String | ✅ Yes | "2025-11-19T10:30:00.000Z" |
| `updatedAt` | Date String | ✅ Yes | "2025-11-19T10:30:00.000Z" |
| `progressToTarget` | String | ✅ Yes | "0%" / "45.5%" / "100%" |
| `duration` | Number | ✅ Yes | 0 (for permanent) |
| `endDate` | Date/null | ✅ Yes | null (for permanent) |
| `goal` | String | ⚠️ Optional | "housing" / "vehicle" / etc. |
| `weeklyPayouts` | Array | ✅ Yes | [] or [{week, amount, date, status}] |

---

## Testing After Fix

### Test Case 1: User with Active Stakes Only

**Request:**
```bash
GET /api/v1/staking/dashboard
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "activeStakes": [
      {
        "_id": "673c123...",
        "amount": 250,
        "targetReturn": 500,
        "totalEarned": 0,
        "remainingToTarget": 500,
        "status": "active",
        "createdAt": "2025-11-19T10:30:00.000Z",
        "progressToTarget": "0%",
        "duration": 0,
        "endDate": null,
        "goal": "housing"
      }
    ],
    "stakeHistory": [],  // ✅ Empty - no completed stakes
    "summary": {
      "totalActiveStakes": 1,
      "totalStakesSinceInception": 1,
      "totalEarnedFromROS": 0,
      "targetTotalReturns": 500,
      "progressToTarget": "0%"
    }
  }
}
```

### Test Case 2: User with Active and Completed Stakes

**Expected:**
- `activeStakes` - Only stakes with `status: 'active'`
- `stakeHistory` - Only stakes with `status: 'completed'` or `'cancelled'`
- NO duplicates between the two arrays

---

## Database Query Examples

### Correct Query for Active Stakes
```typescript
const activeStakes = await Stake.find({
  userId: req.user.id,
  status: 'active'
})
.sort({ createdAt: -1 })
.lean();
```

### Correct Query for Stake History
```typescript
const stakeHistory = await Stake.find({
  userId: req.user.id,
  status: { $in: ['completed', 'cancelled'] }
})
.sort({ completedAt: -1, createdAt: -1 })
.lean();
```

### Add Calculated Fields
```typescript
const enhanceStake = (stake) => ({
  ...stake,
  progressToTarget: stake.targetReturn > 0
    ? `${((stake.totalEarned / stake.targetReturn) * 100).toFixed(2)}%`
    : '0%',
  remainingToTarget: Math.max(0, stake.targetReturn - stake.totalEarned)
});

const activeStakes = (await Stake.find({ userId, status: 'active' }))
  .map(enhanceStake);
```

---

## Summary of Required Fixes

1. ✅ Fix duplicate stakes - Proper status filtering in queries
2. ✅ Fix missing createdAt - Add timestamps to schema or set manually
3. ✅ Fix missing status - Always set status='active' on creation
4. ✅ Fix missing progressToTarget - Calculate and include in response
5. ✅ Fix completed stake targetReturn - Don't reset to 0 on completion
6. ✅ Add remainingToTarget - Calculate: targetReturn - totalEarned

---

## Impact

### Current Impact
❌ **Duplicate data confusing users**  
❌ **"Invalid Date" breaking UI**  
❌ **Cannot distinguish active from completed stakes**  
❌ **Progress tracking not visible**  
❌ **Historical data incorrect**

### After Fix
✅ **Clean separation of active vs completed stakes**  
✅ **Proper date formatting**  
✅ **Accurate status display**  
✅ **Progress tracking visible**  
✅ **Correct historical records**

---

## Priority

**CRITICAL** - This affects:
- User trust (seeing duplicate/incorrect data)
- Dashboard functionality
- Progress tracking
- Historical records
- Data integrity

---

**Status**: 🔴 WAITING ON BACKEND FIX

**Assigned To**: Backend Team

**Expected Fix Time**: ~30 minutes

**Next Action**: 
1. Fix query filtering by status
2. Ensure all required fields are populated
3. Add progress calculation
4. Test with multiple users

---

**Last Updated**: November 19, 2025  
**Related Files**: 
- `src/controllers/staking.controller.ts` (dashboard endpoint)
- `src/models/stake.model.ts` (schema + virtuals)
