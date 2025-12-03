# Backend Requirement: Total Earned Field in Wallet Statistics

## ⚠️ BACKEND ACTION REQUIRED

**Status**: The frontend "Total Earned" card is showing **0.00** because the backend doesn't provide a `totalEarned` field in wallet statistics.

**Solution**: Backend should add `statistics.totalEarned` field to the `/api/v1/wallets/info` endpoint response.

**Priority**: HIGH - This is a core user metric.

---

## Problem Statement

The frontend "Total Earned" card on the wallet dashboard (`/dashboard/wallets`) is showing **0.00** even when users have earned money from:

- ROS (Return on Stake) payouts
- Pool distributions
- Referral bonuses
- Registration bonuses
- Other bonuses

Currently, the frontend is trying to calculate this from multiple sources, but the data isn't available or isn't aggregated properly.

## Current Frontend Implementation

The frontend is trying to calculate "Total Earned" from multiple sources:

```typescript
Total Earned = ROS Earnings + Pool Earnings + Bonuses + Referral Earnings + Registration Bonus
```

### Data Sources Currently Used:

1. **Transaction History Summary** (`/api/v1/enhanced-transactions/history`)
   - `summary.earnings.rosPayouts` - ROS earnings
   - `summary.earnings.poolPayouts` - Pool earnings
   - `summary.bonuses.total` - All bonuses

2. **Dashboard Overview** (`/api/v1/dashboard/overview`)
   - `staking.totalEarnings` - Staking earnings
   - `referrals.referralEarnings` - Referral earnings

3. **Wallet Statistics** (`/api/v1/wallets/info`)
   - `statistics.totalStakeReturns` - Only ROS returns (NOT total earned)

4. **Registration Bonus API** (`/api/v1/bonuses/registration/status`)
   - `bonus.bonusPaidOut` - Registration bonus paid out via ROS

## Recommended Backend Solution

### Option 1: Add `totalEarned` to Wallet Statistics (RECOMMENDED)

The backend should add a `totalEarned` field to the wallet statistics that aggregates ALL earnings:

**Endpoint**: `GET /api/v1/wallets/info`

**Current Response**:

```json
{
  "success": true,
  "wallet": {
    "statistics": {
      "totalDeposited": 73490.0,
      "totalWithdrawn": 768.87,
      "totalStaked": 5800.0,
      "totalStakeReturns": 150.25 // ❌ Only ROS earnings, not total
    }
  }
}
```

**Recommended Response**:

```json
{
  "success": true,
  "wallet": {
    "statistics": {
      "totalDeposited": 73490.0,
      "totalWithdrawn": 768.87,
      "totalStaked": 5800.0,
      "totalStakeReturns": 150.25, // ROS earnings from stakes
      "totalEarned": 350.75 // ✨ NEW: Total of ALL earnings (ROS + pools + bonuses + referrals + registration bonus)
    }
  }
}
```

### Option 2: Ensure Transaction History Summary Includes All Earnings

If the backend already provides transaction history summary, ensure it includes:

- ROS payouts (including registration bonus portions paid via ROS)
- Pool distributions
- All bonuses (including registration bonus if tracked separately)
- Referral bonuses (if not already in earnings)

## What `totalEarned` Should Include

The `totalEarned` field should be the sum of **ALL** earnings the user has received on the platform:

1. **ROS Earnings** (`totalStakeReturns`)
   - Weekly ROS payouts from active stakes
   - Includes registration bonus portions paid via ROS

2. **Pool Distributions**
   - Performance pool payouts
   - Premium pool payouts
   - Stake pool payouts

3. **Bonuses**
   - Registration bonuses (total paid out)
   - Ranking bonuses
   - Promotional bonuses
   - Any other bonus types

4. **Referral Earnings**
   - All referral bonuses earned from downlines
   - Multi-level referral commissions

5. **Other Earnings**
   - Any other income sources on the platform

## Implementation Notes

### Calculation Logic

```javascript
totalEarned =
  totalStakeReturns + // ROS from stakes
  totalPoolDistributions + // All pool payouts
  totalBonuses + // All bonuses (including registration)
  totalReferralEarnings; // All referral commissions
```

### Data Aggregation

The backend should aggregate this from:

- Transaction history (sum of all earnings transactions)
- Staking records (ROS payouts)
- Bonus records (registration, ranking, etc.)
- Referral records (referral bonuses)

### Considerations

- **Registration Bonus**: If registration bonus is paid gradually via ROS, it's already included in `totalStakeReturns`. Don't double-count it.
- **Time Period**: This should be **all-time total**, not a time-limited period.
- **Currency**: All values should be in USDT.

## Current Frontend Workaround

The frontend is currently trying to calculate this from multiple sources as a workaround, but it's failing because:

1. Transaction history summary may not be loading
2. Data sources may not include all earnings types
3. Registration bonus tracking may be inconsistent

Having a single authoritative `totalEarned` field from the backend would be much more reliable.

## Testing Checklist

After backend implementation:

- [ ] `GET /api/v1/wallets/info` returns `statistics.totalEarned` field
- [ ] `totalEarned` includes ROS earnings
- [ ] `totalEarned` includes pool distributions
- [ ] `totalEarned` includes all bonuses (registration, ranking, promotional)
- [ ] `totalEarned` includes referral earnings
- [ ] `totalEarned` is accurate for users with earnings history
- [ ] `totalEarned` is 0.00 for new users (correct)
- [ ] `totalEarned` updates correctly when new earnings are received

## Alternative: Use Transaction History Summary

If adding a new field is not feasible immediately, ensure the transaction history summary (`/api/v1/enhanced-transactions/history`) returns complete data:

```json
{
  "summary": {
    "earnings": {
      "rosPayouts": 150.25,
      "poolPayouts": 50.0,
      "rosCount": 12
    },
    "bonuses": {
      "total": 200.5, // Should include registration bonus if tracked separately
      "count": 3
    }
  }
}
```

And ensure referral earnings are included in the summary or available from overview endpoint.

## Priority

**HIGH** - This is a core metric that users expect to see accurately displayed.

---

**Status**: ⚠️ **Backend Action Required**
**Frontend Status**: ✅ Ready to use `statistics.totalEarned` when backend provides it
