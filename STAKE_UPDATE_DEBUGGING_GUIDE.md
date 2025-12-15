# 🔍 Stake Card Update Debugging Guide

**Date**: December 14, 2025  
**Issue**: Stake cards still showing $0.00 after backend fix  
**Status**: 🔴 **INVESTIGATING** - Added comprehensive debugging

---

## 🔍 Debugging Steps Added

I've added comprehensive logging to help identify where the issue is:

### 1. API Response Logging

**Location**: `src/lib/queries/stakingQueries.ts`

Logs:

- Raw API response structure
- Response format detection
- First stake details from API

### 2. Page Component Logging

**Location**: `src/app/(dashboard)/dashboard/stakes/page.tsx`

Logs:

- Full staking data received
- First stake details
- Summary data

### 3. Component Rendering Logging

**Location**: `src/components/stake/StakeCard.tsx`

Logs:

- Individual stake data being rendered
- All field values for each stake card

---

## 🧪 How to Debug

### Step 1: Open Browser Console

1. Open the stakes page (`/dashboard/stakes`)
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for logs prefixed with `🔍`

### Step 2: Check API Response

Look for: `[useStakeDashboard] 🔍 Raw API Response`

**What to check:**

```javascript
{
  fullResponse: {...},           // Full axios response
  responseData: {...},           // response.data
  hasSuccess: true/false,        // Does it have { success: true }?
  hasNestedData: true/false,     // Does it have nested { data: {...} }?
}
```

**Expected structure:**

```json
{
  "success": true,
  "data": {
    "activeStakes": [
      {
        "totalEarned": 135.0, // ✅ Should be > 0
        "progressToTarget": "0.75%", // ✅ Should be > "0.00%"
        "remainingToTarget": 17865.0 // ✅ Should be < targetReturn
      }
    ]
  }
}
```

### Step 3: Check Extracted Data

Look for: `[useStakeDashboard] 🔍 Extracted Dashboard Data`

**What to check:**

- `firstStake.totalEarned` - Is it 0 or > 0?
- `firstStake.progressToTarget` - Is it "0.00%" or something else?
- `firstStake.remainingToTarget` - Is it equal to targetReturn or less?

### Step 4: Check Component Data

Look for: `[StakeCard] 🔍 Rendering stake`

**What to check:**

- Are the values the same as in Step 3?
- Or are they being lost/transformed somewhere?

---

## 🐛 Common Issues to Check

### Issue 1: Backend Still Sending 0

**Symptom**: API response shows `totalEarned: 0`

**Check**: Look at `[useStakeDashboard] 🔍 Raw API Response` → `firstStake.totalEarned`

**Solution**: Backend fix not deployed or not working. Contact backend team with API response.

### Issue 2: Response Parsing Issue

**Symptom**: API has correct values, but extracted data shows 0

**Check**: Compare:

- `[useStakeDashboard] 🔍 Raw API Response` → `firstStake.totalEarned`
- `[useStakeDashboard] 🔍 Extracted Dashboard Data` → `firstStake.totalEarned`

**Solution**: Fix response parsing in `useStakeDashboard()`

### Issue 3: Data Loss in Component

**Symptom**: Extracted data is correct, but component shows 0

**Check**: Compare:

- `[Stakes Page] 🔍 stakingData received` → `firstStakeDetails.totalEarned`
- `[StakeCard] 🔍 Rendering stake` → `totalEarned`

**Solution**: Check data flow from page to component

### Issue 4: Field Name Mismatch

**Symptom**: Backend sends different field names

**Check**: Look at raw API response structure - are fields named:

- `totalEarned` or `totalReturnsEarned` or `totalEarnings`?
- `progressToTarget` or `progress` or `progressPercent`?
- `remainingToTarget` or `remaining` or `remainingAmount`?

**Solution**: Update TypeScript interface to match backend field names

---

## 📊 Expected vs Actual Comparison

### If Backend is Working ✅

**Console Output:**

```
[useStakeDashboard] 🔍 Raw API Response:
  firstStake: {
    totalEarned: 135.00,        // ✅ > 0
    progressToTarget: "0.75%",  // ✅ > "0.00%"
    remainingToTarget: 17865.00 // ✅ < 18000
  }
```

**UI Display:**

- Total Earned: $135.00 ✅
- Progress: 0.75% ✅
- Remaining: $17,865.00 ✅

### If Backend is NOT Working ❌

**Console Output:**

```
[useStakeDashboard] 🔍 Raw API Response:
  firstStake: {
    totalEarned: 0,             // ❌ Still 0
    progressToTarget: "0.00%",  // ❌ Still "0.00%"
    remainingToTarget: 18000.00 // ❌ Still full amount
  }
```

**UI Display:**

- Total Earned: $0.00 ❌
- Progress: 0.00% ❌
- Remaining: $18,000.00 ❌

---

## 🔧 Quick Fixes to Try

### Fix 1: Force Query Refresh

Add this to browser console:

```javascript
// Invalidate and refetch
window.__REACT_QUERY_CLIENT__.invalidateQueries(['staking', 'dashboard']);
```

### Fix 2: Check Network Tab

1. Open DevTools → **Network** tab
2. Filter: `dashboard`
3. Click on `/staking/dashboard` request
4. Check **Response** tab
5. Look for `totalEarned` values

### Fix 3: Manual API Test

Test API directly:

```bash
# In browser console or Postman
fetch('/api/v1/staking/dashboard', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('🔍 Manual API Test:', {
    firstStake: data.data?.activeStakes?.[0],
    totalEarned: data.data?.activeStakes?.[0]?.totalEarned
  });
});
```

---

## 📝 What to Report to Backend Team

If backend is still sending 0 values, share:

1. **API Response** (from Network tab):

   ```json
   {
     "activeStakes": [{
       "totalEarned": 0,  // ❌ Should be > 0
       ...
     }]
   }
   ```

2. **Console Logs**:
   - Copy all `🔍` prefixed logs
   - Show the full API response structure

3. **Distribution Status**:
   - Was profit actually distributed?
   - Check `isDistributed: true` on daily profit record
   - Check `updatedAt` timestamp on stakes

4. **Test Case**:
   - Stake amount: $9,000
   - Daily profit: 1.5%
   - Expected `totalEarned`: $135.00
   - Actual `totalEarned`: $0.00

---

## ✅ Next Steps

1. **Open browser console** and check `🔍` logs
2. **Identify where data is lost** (API → Extraction → Component)
3. **Share findings** with backend team if API is sending 0
4. **Fix frontend** if data is lost during parsing/transformation

---

**Status**: 🔍 **DEBUGGING IN PROGRESS**  
**Action**: Check browser console logs to identify issue location
