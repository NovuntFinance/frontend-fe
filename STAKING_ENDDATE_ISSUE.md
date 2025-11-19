# Staking endDate Schema Issue - Backend Fix Required

**Date**: November 19, 2025  
**Status**: 🔴 Blocking Issue - Backend Schema Problem  
**Priority**: HIGH

---

## Issue Summary

Stake creation is failing with a Mongoose validation error:

```
Stake validation failed: endDate: Path `endDate` is required.
```

---

## Problem Description

Your database schema currently **requires** the `endDate` field for all stakes. However, **permanent stakes** (duration: 0) should NOT have a fixed end date because:

1. They run indefinitely until 200% ROS (Return on Stake) is achieved
2. The completion time is unpredictable and depends on weekly payout performance
3. Setting an arbitrary end date would be incorrect and misleading

---

## Current Request (Correct Payload)

```json
{
  "amount": 20,
  "sourceWallet": "auto",
  "duration": 0,
  "goal": "vehicle"
}
```

**Note**: We're NOT sending `endDate` because permanent stakes don't have one.

---

## Backend Error Response

```json
{
  "success": false,
  "message": "Failed to create stake",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Stake validation failed: endDate: Path `endDate` is required."
  }
}
```

---

## Root Cause

Your Mongoose Stake schema likely has:

```typescript
// ❌ CURRENT (INCORRECT)
const StakeSchema = new Schema({
  userId: { type: ObjectId, required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, // ❌ This is the problem
  targetReturn: { type: Number, required: true },
  status: { type: String, required: true },
  // ...
});
```

---

## Solution 1: Make endDate Optional in Schema

**File**: Your Stake model (e.g., `models/Stake.js` or `models/Stake.ts`)

### Change This:

```typescript
endDate: {
  type: Date,
  required: true, // ❌ Forces all stakes to have an end date
}
```

### To This:

```typescript
endDate: {
  type: Date,
  required: false, // ✅ Optional - not needed for permanent stakes
  default: null,   // ✅ Default to null for permanent stakes
}
```

---

## Solution 2: Handle in Controller Logic

**File**: Your staking controller (e.g., `controllers/staking.controller.ts`)

### Add Logic to Set endDate Based on Duration:

```typescript
const createStake = async (req, res, next) => {
  const { amount, duration, sourceWallet, goal } = req.body;
  
  // Calculate end date only for time-limited stakes
  let endDate = null;
  if (duration > 0) {
    // For fixed-duration stakes, calculate end date
    endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
  }
  // For duration === 0 (permanent), endDate stays null
  
  const stakeData = {
    userId: req.user.id,
    amount,
    duration,
    sourceWallet,
    startDate: new Date(),
    endDate, // ✅ null for permanent stakes, Date for fixed-duration
    status: 'active',
    targetReturn: amount * 2, // 200% ROS
    totalReturnsEarned: 0,
    maxReturnMultiplier: 2,
    progress: '0%',
    goal: goal || 'none',
  };
  
  const stake = await Stake.create(stakeData);
  
  // ...
};
```

---

## Recommended Approach

**Use BOTH solutions** for robustness:

1. ✅ **Update Schema** - Make `endDate` optional (Solution 1)
2. ✅ **Update Controller** - Explicitly set `endDate: null` for permanent stakes (Solution 2)

This ensures:
- The schema allows optional end dates
- The logic explicitly handles permanent vs fixed-duration stakes
- Future developers understand the intent

---

## Business Logic Explanation

### Permanent Stakes (duration: 0)

| Field | Value | Reasoning |
|-------|-------|-----------|
| `duration` | `0` | Indicates permanent stake |
| `startDate` | `new Date()` | When stake was created |
| `endDate` | `null` | No fixed end - runs until 200% achieved |
| `targetReturn` | `amount * 2` | Goal is 200% ROS |
| `status` | `active` | Stake is active until completed |

**Completion Condition**: Stake ends when `totalReturnsEarned >= targetReturn` (200% of initial amount)

### Fixed-Duration Stakes (duration > 0)

| Field | Value | Reasoning |
|-------|-------|-----------|
| `duration` | `30`, `60`, `90`, etc. | Number of days |
| `startDate` | `new Date()` | When stake was created |
| `endDate` | `startDate + duration` | Fixed completion date |
| `targetReturn` | Varies by duration | Calculated based on duration |
| `status` | `active` | Stake is active until endDate |

**Completion Condition**: Stake ends on `endDate` or when manually withdrawn

---

## Testing After Fix

### Test Case 1: Permanent Stake (duration: 0)

**Request:**
```json
{
  "amount": 100,
  "sourceWallet": "auto",
  "duration": 0,
  "goal": "vehicle"
}
```

**Expected Database Record:**
```json
{
  "_id": "...",
  "userId": "69187fb8ab4c6ad4fe15332b",
  "amount": 100,
  "duration": 0,
  "startDate": "2025-11-19T...",
  "endDate": null, // ✅ Should be null
  "targetReturn": 200,
  "status": "active",
  "totalReturnsEarned": 0,
  "progress": "0%"
}
```

### Test Case 2: Fixed-Duration Stake (duration: 30)

**Request:**
```json
{
  "amount": 100,
  "sourceWallet": "auto",
  "duration": 30,
  "goal": "travel"
}
```

**Expected Database Record:**
```json
{
  "_id": "...",
  "userId": "69187fb8ab4c6ad4fe15332b",
  "amount": 100,
  "duration": 30,
  "startDate": "2025-11-19T...",
  "endDate": "2025-12-19T...", // ✅ 30 days from start
  "targetReturn": 120, // Example based on duration
  "status": "active"
}
```

---

## Impact of Current Bug

❌ **Cannot create any permanent stakes**  
❌ **200% ROS model is completely broken**  
❌ **Core business functionality is blocked**  

This is the primary staking mechanism for your platform - users expect to stake indefinitely until they reach 200% returns.

---

## Documentation Reference

According to your API documentation (`v0/staking-endpoints.json`):

```json
{
  "duration": {
    "required": true,
    "type": "number",
    "value": 0,
    "description": "Must be 0 (permanent stake)"
  }
}
```

And from `v0/database-schemas.json`:

```json
{
  "duration": {
    "type": "Number",
    "required": true,
    "description": "Duration in days. 0 = permanent stake until 200% achieved"
  }
}
```

Your own documentation confirms that `duration: 0` means **permanent stake** with no fixed end date.

---

## Related Files to Update

1. **Stake Model Schema** - Make `endDate` optional
   - Path: `src/models/Stake.ts` or `models/Stake.js`
   
2. **Staking Controller** - Set `endDate: null` for permanent stakes
   - Path: `src/controllers/staking.controller.ts`
   
3. **Type Definitions** (if using TypeScript)
   - Update `endDate?: Date | null` (make it optional)

---

## Expected Timeline

This should be a quick fix:
- Schema change: 2 minutes
- Controller update: 5 minutes
- Testing: 5 minutes
- Deploy: 5 minutes

**Total**: ~15-20 minutes

---

## Next Steps

1. ✅ Update Stake schema to make `endDate` optional
2. ✅ Update controller to set `endDate: null` for `duration === 0`
3. ✅ Test with the payload above
4. ✅ Notify frontend team when deployed
5. ✅ Frontend will test and confirm stake creation works

---

## Status Updates

- **Initial Report**: November 19, 2025
- **Assigned To**: Backend Team
- **Waiting On**: Schema update + controller logic fix

---

**Priority**: 🔴 CRITICAL - Blocking all stake creation

**Severity**: HIGH - Core business functionality broken

**Estimated Fix Time**: 15-20 minutes
