# Earnings Calculation Update - Frontend Notes

**Date**: December 19, 2024  
**Status**: ✅ **UPDATED**  
**Backend Update**: Earnings calculation separation fix

---

## Backend Update Summary

The backend has clarified the difference between two "Total Earned" calculations:

### 1. Staking Page (`/api/v1/staking/dashboard`)

- **Field**: `data.summary.totalEarnedFromROS`
- **What it shows**: Only ROS from regular stakes (excludes bonus stakes)
- **Action**: ✅ No code changes needed - backend now returns correct value
- **Description Updated**: Changed from "Total earnings from all sources" to "Earnings from regular stakes only"

### 2. Dashboard Page (`/api/v1/wallets/info`)

- **Field**: `wallet.statistics.totalEarned`
- **What it shows**: All platform earnings (includes everything)
- **Action**: ✅ No code changes needed - already correct
- **Description**: "Total earnings from all sources" (correct as is)

---

## Frontend Changes Made

### ✅ Updated Stakes Page Description

**File**: `src/app/(dashboard)/dashboard/stakes/page.tsx`

**Before**:

```typescript
<CardDescription className="text-[10px] sm:text-xs">
  Total earnings from all sources
</CardDescription>
```

**After**:

```typescript
<CardDescription className="text-[10px] sm:text-xs">
  Earnings from regular stakes only
</CardDescription>
```

---

## Current Implementation Status

### Staking Page ✅

- **Title**: "Total Earned (ROS)"
- **Description**: "Earnings from regular stakes only"
- **Field Used**: `summary.totalEarnedFromROS`
- **Status**: ✅ Correct - Shows only regular stake ROS

### Dashboard Page ✅

- **Title**: "Total Earned"
- **Description**: "Total earnings from all sources"
- **Field Used**: `wallet.statistics.totalEarned`
- **Status**: ✅ Correct - Shows all platform earnings

---

## What Users Will See

### Staking Page

- Shows only earnings from regular staking ROS
- Excludes bonus stake earnings
- More focused view of staking performance

### Dashboard Page

- Shows comprehensive total of all earnings
- Includes ROS, bonuses, referrals, etc.
- Complete financial overview

---

## No Breaking Changes

✅ **No code changes required** - Backend now returns correct values  
✅ **No field name changes** - All field names remain the same  
✅ **Only UI description updated** - Clarified what each value represents

---

## Testing Checklist

After backend deployment, verify:

- [x] ✅ Stakes page shows "Total Earned (ROS)" with description "Earnings from regular stakes only"
- [x] ✅ Stakes page value matches `summary.totalEarnedFromROS` (regular stakes only)
- [x] ✅ Dashboard page shows "Total Earned" with description "Total earnings from all sources"
- [x] ✅ Dashboard page value matches `wallet.statistics.totalEarned` (all earnings)
- [x] ✅ Both values are accurate and match backend calculations

---

## Summary

✅ **Backend update acknowledged**  
✅ **Description updated for clarity**  
✅ **No code logic changes needed**  
✅ **Ready for production**

The frontend is now aligned with the backend's clarified earnings calculations, providing users with accurate and clear information about their earnings.

---

_Last updated: December 19, 2024_
