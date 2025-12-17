# 🔍 Console Debugging Instructions - Stake Cards

**Date**: December 14, 2025  
**Issue**: Stake cards showing $0.00 - Need to check console logs

---

## 📋 Step-by-Step Instructions

### Step 1: Open Browser Console

1. Go to `/dashboard/stakes` page
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. **Clear console** (click 🚫 icon or press Ctrl+L)

### Step 2: Look for These Logs

After the page loads, you should see logs in this order:

#### Log 1: API Call Started

```
🔍 [useStakeDashboard] Starting API call to /staking/dashboard
```

#### Log 2: API Response Received

```
🔍 [useStakeDashboard] ✅ API Response Received:
  {
    status: 200,
    hasData: true,
    responseStructure: {...}
  }
```

#### Log 3: Extracted Data (MOST IMPORTANT)

```
🔍 [useStakeDashboard] 📊 Extracted Dashboard Data:
  {
    activeStakesCount: 6,
    firstStake: {
      amount: 9000,
      totalEarned: 0,              // ⚠️ CHECK THIS VALUE
      progressToTarget: "0.00%",   // ⚠️ CHECK THIS VALUE
      remainingToTarget: 18000,    // ⚠️ CHECK THIS VALUE
      ...
    }
  }
```

#### Log 4: Warning (if totalEarned is 0)

```
⚠️ [useStakeDashboard] ⚠️ WARNING: First stake has totalEarned = 0
```

#### Log 5: Page Component Log

```
[Stakes Page] 🔍 stakingData received:
  {
    firstStakeDetails: {
      totalEarned: 0,              // ⚠️ CHECK THIS VALUE
      ...
    }
  }
```

#### Log 6: Component Rendering (for each stake card)

```
[StakeCard] 🔍 Rendering stake:
  {
    totalEarned: 0,                // ⚠️ CHECK THIS VALUE
    ...
  }
```

---

## 🔍 What to Look For

### Critical Check: `totalEarned` Value

**In Log 3** (`[useStakeDashboard] 📊 Extracted Dashboard Data`), check:

```javascript
firstStake: {
  totalEarned: ???  // ⚠️ What value is here?
}
```

**If `totalEarned: 0`:**

- ❌ Backend is still sending 0
- Backend fix not working or not deployed
- Share this log with backend team

**If `totalEarned: 135.00` (or any number > 0):**

- ✅ Backend is sending correct data
- But frontend might not be displaying it
- Check Log 5 and Log 6 to see if value is lost

---

## 📊 Expected vs Actual

### If Backend is Working ✅

```
🔍 [useStakeDashboard] 📊 Extracted Dashboard Data:
  firstStake: {
    amount: 9000,
    totalEarned: 135.00,        // ✅ > 0
    progressToTarget: "0.75%",  // ✅ > "0.00%"
    remainingToTarget: 17865.00 // ✅ < 18000
  }
```

### If Backend is NOT Working ❌

```
🔍 [useStakeDashboard] 📊 Extracted Dashboard Data:
  firstStake: {
    amount: 9000,
    totalEarned: 0,              // ❌ Still 0
    progressToTarget: "0.00%",  // ❌ Still "0.00%"
    remainingToTarget: 18000.00 // ❌ Still full amount
  }
```

---

## 🐛 If Logs Don't Appear

### Check 1: Is Query Running?

Look for:

- `🔍 [useStakeDashboard] Starting API call` - Should appear immediately
- If not, query might not be running

### Check 2: Filter Console

1. In console, use filter box
2. Type: `useStakeDashboard` or `🔍`
3. This will show only relevant logs

### Check 3: Check Network Tab

1. DevTools → **Network** tab
2. Filter: `dashboard`
3. Find: `/api/v1/staking/dashboard`
4. Click on it
5. Check **Response** tab
6. Look for `totalEarned` in JSON

---

## 📝 What to Share

### Screenshot or Copy:

1. **Log 3** - `[useStakeDashboard] 📊 Extracted Dashboard Data`
   - Shows what backend is sending
   - Most important log

2. **Network Tab** - Response from `/api/v1/staking/dashboard`
   - Raw API response
   - Shows exact JSON structure

3. **Any warnings** - `⚠️ WARNING: First stake has totalEarned = 0`
   - Confirms backend is sending 0

---

## 🔧 Quick Fixes

### Fix 1: Clear Cache and Refresh

1. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear browser cache
3. Check logs again

### Fix 2: Check Network Tab Directly

1. DevTools → Network tab
2. Find `/api/v1/staking/dashboard` request
3. Check Response tab
4. Look for `"totalEarned"` field
5. What value does it show?

---

## ✅ Next Steps

1. **Open console** and look for `🔍` logs
2. **Find Log 3** - `[useStakeDashboard] 📊 Extracted Dashboard Data`
3. **Check `firstStake.totalEarned`** value
4. **Share the value** you see:
   - If `0` → Backend issue (share with backend team)
   - If `> 0` → Frontend display issue (we'll fix it)

---

**Priority**: 🔴 **URGENT**  
**Action**: Check console logs and share `totalEarned` value from Log 3
