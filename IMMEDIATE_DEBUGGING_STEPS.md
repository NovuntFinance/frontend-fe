# 🚨 Immediate Debugging Steps - Stake Cards Not Updating

**Date**: December 14, 2025  
**Status**: 🔴 **URGENT** - Stake cards still showing $0.00  
**Action Required**: Follow these steps to identify the issue

---

## ⚡ Quick Steps (Do This First)

### Step 1: Open Browser Console

1. Go to `/dashboard/stakes` page
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. Look for logs with `🔍` emoji

### Step 2: Check What Backend is Sending

**Look for this log:**

```
[useStakeDashboard] 🔍 Raw API Response
```

**What to check:**

- Does `firstStake.totalEarned` show a number > 0?
- Or does it still show 0?

### Step 3: Check Network Tab

1. In DevTools, click **Network** tab
2. Filter by: `dashboard`
3. Find: `/api/v1/staking/dashboard` request
4. Click on it
5. Go to **Response** tab
6. Look for `totalEarned` in the JSON

**What to look for:**

```json
{
  "data": {
    "activeStakes": [
      {
        "totalEarned": 135.0, // ✅ Should be > 0 if backend fixed
        "progressToTarget": "0.75%",
        "remainingToTarget": 17865.0
      }
    ]
  }
}
```

---

## 🔍 Three Possible Scenarios

### Scenario 1: Backend Still Sending 0 ❌

**Evidence:**

- Network tab shows `totalEarned: 0` in API response
- Console log shows `firstStake.totalEarned: 0`

**Action:**

- Backend fix not deployed or not working
- Share API response with backend team
- Show them the Network tab response

### Scenario 2: Response Parsing Issue ⚠️

**Evidence:**

- Network tab shows `totalEarned: 135.00` ✅
- But console log shows `firstStake.totalEarned: 0` ❌

**Action:**

- Frontend parsing issue
- Check response structure in console
- May need to fix `response.data?.data` parsing

### Scenario 3: Field Name Mismatch ⚠️

**Evidence:**

- Network tab shows different field name (e.g., `totalReturnsEarned`)
- Frontend expects `totalEarned`

**Action:**

- Backend using different field name
- Update TypeScript interface
- Map field names in query function

---

## 📋 What to Share

### If Backend is Sending 0:

**Share with Backend Team:**

1. Screenshot of Network tab → Response
2. Console logs showing `totalEarned: 0`
3. Test case:
   - Stake: $9,000
   - Daily profit: 1.5%
   - Expected: $135.00
   - Actual: $0.00

### If Backend is Sending Correct Values:

**Check Frontend:**

1. Share console logs
2. Check if data is lost during parsing
3. Verify field names match

---

## 🔧 Quick Test Commands

### Test 1: Check API Directly

```javascript
// Paste in browser console
fetch('/api/v1/staking/dashboard', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
})
  .then((r) => r.json())
  .then((data) => {
    console.log('🔍 API Test Result:', {
      firstStake: data.data?.activeStakes?.[0],
      totalEarned: data.data?.activeStakes?.[0]?.totalEarned,
      progressToTarget: data.data?.activeStakes?.[0]?.progressToTarget,
    });
  });
```

### Test 2: Force Refresh

```javascript
// In browser console (if React Query DevTools available)
window.__REACT_QUERY_CLIENT__?.invalidateQueries(['staking', 'dashboard']);
```

---

## 📊 Expected Console Output

### If Everything Works ✅

```
[useStakeDashboard] 🔍 Raw API Response:
  firstStake: {
    totalEarned: 135.00,        // ✅
    progressToTarget: "0.75%",  // ✅
    remainingToTarget: 17865.00 // ✅
  }

[Stakes Page] 🔍 stakingData received:
  firstStakeDetails: {
    totalEarned: 135.00,        // ✅
    progressToTarget: "0.75%",  // ✅
    remainingToTarget: 17865.00 // ✅
  }

[StakeCard] 🔍 Rendering stake:
  totalEarned: 135.00           // ✅
```

### If Backend Issue ❌

```
[useStakeDashboard] 🔍 Raw API Response:
  firstStake: {
    totalEarned: 0,              // ❌
    progressToTarget: "0.00%",    // ❌
    remainingToTarget: 18000.00   // ❌
  }
```

---

## ✅ Next Steps

1. **Open console** and check `🔍` logs
2. **Check Network tab** for API response
3. **Identify scenario** (1, 2, or 3 above)
4. **Take action** based on scenario
5. **Report findings** with screenshots/logs

---

**Priority**: 🔴 **URGENT**  
**Time**: Do this immediately to identify issue
