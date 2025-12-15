# 🔍 Field Name Mismatch Investigation

**Date**: December 14, 2025  
**Issue**: Backend might be using `totalReturnsEarned` but frontend expects `totalEarned`

---

## 🔍 Evidence

### Backend Document Says:

From `FRONTEND_SYNC_STAKE_UPDATE_FIX.md`:

> **Root Cause**: Backend was updating wallet balances but not persisting the `totalReturnsEarned` field to the database.

This suggests backend uses `totalReturnsEarned` internally.

### But Backend Document Also Says:

> **API Response** should have:
>
> ```json
> {
>   "totalEarned": 135.0 // ✅ Field name in API response
> }
> ```

### Frontend Expects:

```typescript
export interface Stake {
  totalEarned: number; // Frontend expects this field name
}
```

---

## 🔧 Frontend Fix Applied

I've added field mapping to handle both field names:

```typescript
// Map totalReturnsEarned to totalEarned if needed
if (stake.totalReturnsEarned !== undefined && stake.totalEarned === undefined) {
  stake.totalEarned = stake.totalReturnsEarned;
}
```

This ensures frontend works whether backend sends:

- `totalEarned` ✅
- `totalReturnsEarned` ✅ (mapped to `totalEarned`)

---

## 🔍 Enhanced Logging

Added logging to detect field name mismatches:

```typescript
console.log('🔍 First Stake - ALL Fields:', {
  allFields: Object.keys(firstStake),
  fieldValues: {
    totalEarned: firstStake.totalEarned,
    totalReturnsEarned: firstStake.totalReturnsEarned,
    totalEarnings: firstStake.totalEarnings,
    returnsEarned: firstStake.returnsEarned,
  },
});
```

This will show:

- What fields backend is actually sending
- What values are in each field
- If there's a field name mismatch

---

## 📋 What to Check

### In Console Logs:

Look for: `🔍 [useStakeDashboard] 🔬 First Stake - ALL Fields`

**Check:**

- Does `totalEarned` exist? What value?
- Does `totalReturnsEarned` exist? What value?
- Are there other field names?

### Possible Scenarios:

#### Scenario 1: Backend Sends `totalReturnsEarned` ✅

```javascript
{
  totalReturnsEarned: 135.00,  // Backend field name
  totalEarned: undefined        // Frontend expects this
}
```

**Solution**: Frontend mapping will fix this ✅

#### Scenario 2: Backend Sends `totalEarned` ✅

```javascript
{
  totalEarned: 135.00,  // Matches frontend
}
```

**Solution**: Already working ✅

#### Scenario 3: Backend Sends Neither ❌

```javascript
{
  totalEarned: undefined,
  totalReturnsEarned: undefined,
  // Field doesn't exist at all
}
```

**Solution**: Backend not including field in response - backend issue

#### Scenario 4: Both Fields Exist

```javascript
{
  totalEarned: 0,
  totalReturnsEarned: 135.00,  // Backend updated this but not totalEarned
}
```

**Solution**: Backend updating wrong field - backend issue

---

## ✅ Next Steps

1. **Check console logs** - Look for `🔬 First Stake - ALL Fields`
2. **Identify field names** - See what backend is actually sending
3. **Report findings** - Share with backend team if field name mismatch

---

**Status**: 🔍 **INVESTIGATING**  
**Action**: Check console logs to see actual field names backend is sending
