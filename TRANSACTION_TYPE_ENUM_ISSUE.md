# Transaction Type Enum Issue - Backend Fix Required

**Date**: November 19, 2025  
**Status**: 🔴 Blocking Issue - Transaction Schema Missing 'stake' Type  
**Priority**: HIGH

---

## Issue Summary

Stake creation is now progressing further but failing at the transaction record creation step with:

```
Transaction validation failed: type: `stake` is not a valid enum value for path `type`.
```

---

## Progress Update

✅ Validation fixed - `duration: 0` accepted  
✅ Schema fixed - `endDate: null` allowed  
✅ Stake document created successfully  
✅ Wallet deduction working  
❌ **Transaction record creation failing** ← Current issue

---

## Problem Description

Your Transaction model has an enum for the `type` field, but it doesn't include `'stake'` as a valid transaction type.

When the staking controller tries to create a transaction record for the stake, it fails validation because `'stake'` is not in the allowed enum values.

---

## Current Error

```json
{
  "success": false,
  "message": "Failed to create stake",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Transaction validation failed: type: `stake` is not a valid enum value for path `type`."
  }
}
```

---

## Root Cause

Your Transaction schema likely has something like:

```typescript
// ❌ CURRENT (INCOMPLETE)
const TransactionSchema = new Schema({
  userId: { type: ObjectId, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'deposit',
      'withdrawal',
      'transfer',
      // ❌ 'stake' is missing from this list
    ]
  },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  // ...
});
```

---

## Solution: Update Transaction Type Enum

**File**: Your Transaction model (e.g., `src/models/transaction.model.ts` or `models/Transaction.js`)

### Find This:

```typescript
type: {
  type: String,
  required: true,
  enum: [
    'deposit',
    'withdrawal',
    'transfer',
    // etc.
  ]
}
```

### Update To:

```typescript
type: {
  type: String,
  required: true,
  enum: [
    'deposit',
    'withdrawal',
    'transfer',
    'stake',           // ✅ ADD THIS - for creating stakes
    'unstake',         // ✅ ADD THIS - for withdrawing stakes early (future)
    'ros_payout',      // ✅ ADD THIS - for weekly ROS payments (future)
    'stake_completion', // ✅ ADD THIS - for when stake reaches 200% (future)
    // ... any other existing types
  ]
}
```

---

## Required Transaction Types for Staking

### Current Need

| Type | Purpose | When Created |
|------|---------|--------------|
| `stake` | Record stake creation | When user creates a stake |

### Future Needs (Recommended to Add Now)

| Type | Purpose | When Created |
|------|---------|--------------|
| `unstake` | Record early withdrawal | When user withdraws stake before 200% |
| `ros_payout` | Record weekly returns | Every week when ROS is distributed |
| `stake_completion` | Record stake completion | When stake reaches 200% target |

---

## How It's Being Used in Controller

Your staking controller is likely doing something like:

```typescript
// Step 13 in your debug logs: Creating transaction record
const transaction = await Transaction.create({
  userId: req.user.id,
  type: 'stake',  // ❌ This needs to be in the enum!
  amount: amount,
  sourceWallet: sourceWallet,
  destinationWallet: 'staked',
  status: 'completed',
  description: `Stake created: ${amount} USDT`,
  metadata: {
    stakeId: stake._id,
    goal: goal,
    targetReturn: amount * 2,
  }
});
```

---

## TypeScript Interface Update (if applicable)

If you're using TypeScript, also update the interface:

```typescript
// Before
interface ITransaction {
  type: 'deposit' | 'withdrawal' | 'transfer';
  // ...
}

// After
interface ITransaction {
  type: 'deposit' | 'withdrawal' | 'transfer' | 'stake' | 'unstake' | 'ros_payout' | 'stake_completion';
  // ...
}
```

---

## Alternative Quick Fix (Not Recommended)

If you don't want to update the enum immediately, you could temporarily use an existing type in your controller:

```typescript
// ⚠️ TEMPORARY WORKAROUND (not ideal)
const transaction = await Transaction.create({
  userId: req.user.id,
  type: 'transfer',  // Use existing enum value
  amount: amount,
  description: 'Stake created',  // Make it clear it's actually a stake
  // ...
});
```

**However, this is NOT recommended** because:
- It makes transaction records unclear
- It breaks reporting and analytics
- It's confusing for future developers
- It's harder to filter stake-specific transactions

**Proper fix**: Update the enum to include `'stake'`

---

## Testing After Fix

### Test Case: Create Stake and Verify Transaction

**Request:**
```json
{
  "amount": 20,
  "sourceWallet": "auto",
  "duration": 0,
  "goal": "vehicle"
}
```

**Expected Stake Record:**
```json
{
  "_id": "stake_id_123",
  "userId": "69187fb8ab4c6ad4fe15332b",
  "amount": 20,
  "duration": 0,
  "endDate": null,
  "status": "active",
  "targetReturn": 40
}
```

**Expected Transaction Record:**
```json
{
  "_id": "txn_id_456",
  "userId": "69187fb8ab4c6ad4fe15332b",
  "type": "stake",  // ✅ Should be accepted now
  "amount": 20,
  "status": "completed",
  "createdAt": "2025-11-19T...",
  "metadata": {
    "stakeId": "stake_id_123",
    "goal": "vehicle",
    "targetReturn": 40
  }
}
```

---

## Expected Server Logs

After the fix, you should see all 15 steps complete:

```
🎯 [STAKE-CREATE] Step 1: Request received
🎯 [STAKE-CREATE] Step 2: Validation passed
🎯 [STAKE-CREATE] Step 3: Fetching user wallet...
🎯 [STAKE-CREATE] Step 4: Wallet found
🎯 [STAKE-CREATE] Step 5: Attempting wallet deduction...
🎯 [STAKE-CREATE] Step 6: Deduction successful
🎯 [STAKE-CREATE] Step 7: Checking for existing stakes...
🎯 [STAKE-CREATE] Step 8: Creating stake document...
🎯 [STAKE-CREATE] Step 9: Stake created with ID: ...
🎯 [STAKE-CREATE] Step 10: Saving wallet...
🎯 [STAKE-CREATE] Step 11: Wallet saved successfully
🎯 [STAKE-CREATE] Step 12: Creating transaction record...
🎯 [STAKE-CREATE] Step 13: Transaction created with ID: ...  ✅ Should succeed now
🎯 [STAKE-CREATE] Step 14: Committing transaction...
🎯 [STAKE-CREATE] Step 15: Transaction committed successfully ✅
```

---

## Impact

### Current Impact
❌ **Cannot complete stake creation** - fails at final transaction logging step  
❌ **Stake may be created but transaction rollback occurs**  
❌ **User balance deducted but stake not recorded**  

### After Fix
✅ **Stake creation completes fully**  
✅ **Transaction records created properly**  
✅ **Audit trail maintained**  
✅ **Users can create stakes successfully**

---

## Related Schema Updates Needed

While you're updating the Transaction model, consider adding these fields for better stake tracking:

```typescript
const TransactionSchema = new Schema({
  // ... existing fields ...
  
  // Add these for staking-related transactions
  stakeId: {
    type: Schema.Types.ObjectId,
    ref: 'Stake',
    required: function() {
      return ['stake', 'unstake', 'ros_payout', 'stake_completion'].includes(this.type);
    }
  },
  
  metadata: {
    type: Schema.Types.Mixed,  // Flexible object for extra data
    default: {}
  }
});
```

---

## Database Migration

**Good news**: No migration needed for existing transactions!

- Existing transactions keep their current type values
- New stake transactions will use the new `'stake'` type
- The schema change is backward compatible
- Old reports will continue to work

---

## Previous Fixes (Now Complete)

This is the **third and final** schema issue:

1. ✅ **Validation fix** - `duration: 0` now accepted (commit 96ce9c9)
2. ✅ **Stake schema fix** - `endDate: null` now allowed (commit 75ba371)
3. ⏳ **Transaction enum fix** - Adding `'stake'` type (current issue)

After this fix, stake creation should work end-to-end! 🎉

---

## Estimated Fix Time

- Add `'stake'` to enum: 1 minute
- Test the change: 3 minutes
- Deploy: 5 minutes

**Total**: ~10 minutes

---

## Timeline

- **Issue #1 (Validation)**: Fixed November 19, 2025 ✅
- **Issue #2 (endDate)**: Fixed November 19, 2025 ✅
- **Issue #3 (Transaction type)**: Reported November 19, 2025 ⏳
- **Expected Resolution**: November 19, 2025 (~10 min)

---

## Success Criteria

After this fix, a stake creation request should:

1. ✅ Pass validation (`duration: 0` accepted)
2. ✅ Create stake document (`endDate: null`)
3. ✅ Deduct from wallet (balance reduced)
4. ✅ Create transaction record (`type: 'stake'`)  ← This should work now
5. ✅ Return success response to frontend
6. ✅ Display in user's stakes dashboard

---

## Next Steps

1. ✅ Add `'stake'` to Transaction type enum
2. ✅ Test stake creation with payload above
3. ✅ Verify transaction record created
4. ✅ Notify frontend team
5. ✅ Frontend tests and confirms everything works

---

**Status**: 🔴 WAITING ON BACKEND FIX

**Assigned To**: Backend Team

**Priority**: HIGH - Final blocker for staking feature

**Expected Fix Time**: ~10 minutes

**Next Action**: Update Transaction model enum, then notify frontend team

---

**Last Updated**: November 19, 2025  
**Issue Sequence**: 3 of 3 schema fixes  
**Related Files**: 
- `src/models/transaction.model.ts` or `models/Transaction.js`
- `src/controllers/staking.controller.ts`
