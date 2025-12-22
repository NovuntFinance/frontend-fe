# Backend Fix Required: Stakes Dashboard Calculations

**Date**: December 19, 2024  
**Priority**: HIGH  
**Status**: 🔴 Critical - Data Accuracy Issue  
**Endpoint**: `GET /api/v1/staking/dashboard`

---

## Issue Summary

The Stakes Dashboard page is displaying incorrect or zero values for:

1. **Total Earned (ROS)** - Should show cumulative earnings from all stakes
2. **Overall Progress** - Should show progress percentage toward target returns

The frontend is currently using workarounds to calculate these values, but the backend should be the single source of truth for accurate calculations.

---

## Current Frontend Behavior

### Total Earned (ROS) Calculation

The frontend is currently:

1. **Primary**: Using `summary.totalEarnedFromROS` from the API response
2. **Fallback**: Summing `totalEarned` from all `activeStakes` and `stakeHistory` if summary is missing or 0

**Problem**: This fallback calculation may not be accurate because:

- Individual stake `totalEarned` values may not be updated correctly
- The calculation should include all historical earnings, not just current stake values
- The backend should provide the authoritative total

### Overall Progress Calculation

The frontend is currently:

- Using `summary.progressToTarget` directly from the API

**Problem**: This value may be:

- Missing or showing "0.00%"
- Not calculated correctly based on actual earnings vs target returns

---

## Expected Backend Response Structure

The `/api/v1/staking/dashboard` endpoint should return:

```json
{
  "success": true,
  "data": {
    "wallets": {
      "fundedWallet": 0,
      "earningWallet": 0,
      "totalAvailableBalance": 0,
      "description": {
        "fundedWallet": "Deposit wallet description",
        "earningWallet": "Earnings wallet description"
      }
    },
    "activeStakes": [
      {
        "_id": "stake_id",
        "userId": "user_id",
        "amount": 250,
        "createdAt": "2024-12-01T10:00:00.000Z",
        "updatedAt": "2024-12-19T14:30:00.000Z",
        "status": "active",
        "source": "funded",
        "targetReturn": 500,
        "totalEarned": 125.5, // ✅ MUST be accurate - cumulative ROS earned for this stake
        "progressToTarget": "25.10%", // ✅ MUST be accurate - (totalEarned / targetReturn) * 100
        "remainingToTarget": 374.5, // ✅ MUST be accurate - targetReturn - totalEarned
        "goal": "housing",
        "weeklyPayouts": [
          {
            "week": 1,
            "amount": 12.5,
            "date": "2024-12-08T10:00:00.000Z",
            "status": "paid"
          }
        ]
      }
    ],
    "stakeHistory": [
      // Completed stakes with accurate totalEarned values
    ],
    "summary": {
      "totalActiveStakes": 3,
      "totalStakesSinceInception": 5,
      "totalEarnedFromROS": 456.75, // ✅ CRITICAL: Must be accurate sum of ALL earnings
      "targetTotalReturns": 1000.0, // ✅ Total of all targetReturns for active stakes
      "progressToTarget": "45.68%", // ✅ CRITICAL: Must be accurate overall progress
      "stakingModel": "Daily ROS based on Novunt trading performance until 200% returns",
      "note": "Stakes are permanent commitments..."
    }
  }
}
```

---

## Required Backend Fixes

### 1. Fix `summary.totalEarnedFromROS` Calculation

**Current Issue**: This value is likely 0 or incorrect.

**Required Calculation**:

```javascript
// Pseudo-code for backend calculation
const totalEarnedFromROS =
  // Sum of totalEarned from ALL stakes (active + completed)
  activeStakes.reduce((sum, stake) => sum + (stake.totalEarned || 0), 0) +
  stakeHistory.reduce((sum, stake) => sum + (stake.totalEarned || 0), 0);
```

**Important Notes**:

- This should include earnings from **both active and completed stakes**
- Use the `totalEarned` field from each stake document
- Ensure `totalEarned` is updated correctly after each ROS distribution
- This is the **cumulative total** of all ROS earnings the user has ever received

### 2. Fix `summary.progressToTarget` Calculation

**Current Issue**: This value may be missing, "0.00%", or incorrect.

**Required Calculation**:

```javascript
// Pseudo-code for backend calculation
const totalEarned = summary.totalEarnedFromROS; // From fix #1
const totalTargetReturns = activeStakes.reduce(
  (sum, stake) => sum + (stake.targetReturn || 0),
  0
);

const progressToTarget =
  totalTargetReturns > 0
    ? ((totalEarned / totalTargetReturns) * 100).toFixed(2) + '%'
    : '0.00%';
```

**Important Notes**:

- Calculate based on **active stakes only** (completed stakes don't count toward progress)
- Format as a string with 2 decimal places and '%' symbol (e.g., "45.68%")
- Handle division by zero (when no active stakes or targetReturns is 0)

### 3. Ensure Individual Stake `totalEarned` is Accurate

**Current Issue**: Individual stakes may have `totalEarned: 0` even after ROS distributions.

**Required Fix**:

- **Update `totalEarned` field** on each stake document after every ROS distribution
- **Increment** the value, don't replace it (cumulative total)
- Ensure the field is saved to the database after each distribution

**Example Update Logic**:

```javascript
// When distributing ROS for a stake
stake.totalEarned = (stake.totalEarned || 0) + distributionAmount;
stake.progressToTarget =
  ((stake.totalEarned / stake.targetReturn) * 100).toFixed(2) + '%';
stake.remainingToTarget = stake.targetReturn - stake.totalEarned;
await stake.save(); // ✅ CRITICAL: Must save to database
```

### 4. Ensure `summary.targetTotalReturns` is Accurate

**Current Issue**: May be 0 or incorrect.

**Required Calculation**:

```javascript
const targetTotalReturns = activeStakes.reduce(
  (sum, stake) => sum + (stake.targetReturn || 0),
  0
);
```

**Important Notes**:

- Only include **active stakes** (not completed ones)
- `targetReturn` should be 200% of `amount` (i.e., `amount * 2`)

---

## Field Update Requirements

### After Each ROS Distribution:

1. **Update Individual Stake**:

   ```javascript
   stake.totalEarned += distributionAmount;
   stake.progressToTarget = calculateProgress(
     stake.totalEarned,
     stake.targetReturn
   );
   stake.remainingToTarget = stake.targetReturn - stake.totalEarned;
   stake.updatedAt = new Date();
   await stake.save(); // ✅ MUST save
   ```

2. **Recalculate Summary** (or calculate on-the-fly in the dashboard endpoint):
   ```javascript
   summary.totalEarnedFromROS = calculateTotalEarned(
     activeStakes,
     stakeHistory
   );
   summary.progressToTarget = calculateOverallProgress(
     summary.totalEarnedFromROS,
     activeStakes
   );
   ```

---

## Testing Requirements

### Test Cases:

1. **New User (No Stakes)**:
   - `totalEarnedFromROS` should be `0`
   - `progressToTarget` should be `"0.00%"`
   - `targetTotalReturns` should be `0`

2. **User with Active Stakes (No Earnings Yet)**:
   - `totalEarnedFromROS` should be `0`
   - `progressToTarget` should be `"0.00%"`
   - `targetTotalReturns` should be sum of all active stake `targetReturn` values

3. **User with Active Stakes (Has Earnings)**:
   - `totalEarnedFromROS` should be sum of all `totalEarned` from active + completed stakes
   - `progressToTarget` should be calculated as: `(totalEarnedFromROS / targetTotalReturns) * 100`
   - Example: If totalEarned = 456.75 and targetTotalReturns = 1000, progress = "45.68%"

4. **User with Completed Stakes**:
   - Completed stakes should have `totalEarned` equal to their `targetReturn` (or close to it)
   - Completed stakes should be included in `totalEarnedFromROS` calculation
   - Completed stakes should NOT be included in `targetTotalReturns` or `progressToTarget` calculation

---

## Data Consistency Checks

### Backend Should Verify:

1. ✅ `stake.totalEarned` is updated after every ROS distribution
2. ✅ `stake.totalEarned` never exceeds `stake.targetReturn`
3. ✅ `stake.progressToTarget` is calculated correctly: `(totalEarned / targetReturn) * 100`
4. ✅ `stake.remainingToTarget` = `targetReturn - totalEarned`
5. ✅ `summary.totalEarnedFromROS` = sum of all `totalEarned` from active + completed stakes
6. ✅ `summary.progressToTarget` = `(totalEarnedFromROS / targetTotalReturns) * 100`
7. ✅ `summary.targetTotalReturns` = sum of `targetReturn` from active stakes only

---

## Frontend Expectations

Once the backend fixes are implemented, the frontend will:

1. **Remove fallback calculations** - Trust the backend `summary` values
2. **Display backend values directly** - No client-side calculations needed
3. **Show accurate data** - Users will see correct earnings and progress

### Current Frontend Code (Will be simplified after backend fix):

```typescript
// Current (with fallback)
const totalEarnedROS =
  summary?.totalEarnedFromROS && summary.totalEarnedFromROS > 0
    ? Number(summary.totalEarnedFromROS) || 0
    : totalEarnedFromStakes || 0; // ❌ This fallback should not be needed

// After backend fix (simplified)
const totalEarnedROS = Number(summary?.totalEarnedFromROS || 0); // ✅ Trust backend
```

---

## Priority Actions for Backend Team

1. **🔴 CRITICAL**: Fix `summary.totalEarnedFromROS` calculation
2. **🔴 CRITICAL**: Fix `summary.progressToTarget` calculation
3. **🟡 HIGH**: Ensure `stake.totalEarned` is updated after each ROS distribution
4. **🟡 HIGH**: Verify `stake.progressToTarget` is calculated correctly for each stake
5. **🟢 MEDIUM**: Add validation to ensure data consistency

---

## Questions for Backend Team

1. Is the ROS distribution job/cron running correctly?
2. Is `stake.save()` being called after each distribution?
3. Are there any field name mismatches (e.g., `totalReturnsEarned` vs `totalEarned`)?
4. Is there a database migration needed to update existing stakes?
5. Should we add database indexes on `totalEarned` for performance?

---

## Contact

If you have questions about the frontend implementation or need clarification on any requirements, please reach out to the frontend team.

**Expected Completion**: As soon as possible - this affects user trust and data accuracy.

---

## Additional Notes

- The frontend is currently working around these issues, but users may see incorrect values
- This fix is critical for user trust and accurate financial reporting
- All calculations should be done server-side for security and accuracy
- Consider adding unit tests for these calculations
