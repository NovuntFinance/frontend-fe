# Backend Fix Request: Categorize referral_bonus as "earnings" instead of "bonus"

## Issue Description

Currently, transactions with `type: "referral_bonus"` are being categorized as `category: "bonus"` in the API response. However, referral bonuses should be categorized as `category: "earnings"` instead, since they represent earnings from referral activities.

## Current Behavior

When a referral bonus transaction is returned from the API, it has:

```json
{
  "_id": "692b3733250004259e8cc32b",
  "type": "referral_bonus",
  "typeLabel": "Referral Bonus",
  "category": "bonus",  // ❌ Currently "bonus"
  "direction": "in",
  "amount": 5000,
  "description": "Level 1 referral bonus from test's earnings",
  ...
}
```

## Expected Behavior

Referral bonuses should be categorized as "earnings":

```json
{
  "_id": "692b3733250004259e8cc32b",
  "type": "referral_bonus",
  "typeLabel": "Referral Bonus",
  "category": "earnings",  // ✅ Should be "earnings"
  "direction": "in",
  "amount": 5000,
  "description": "Level 1 referral bonus from test's earnings",
  ...
}
```

## Rationale

1. **Referral bonuses are earnings**: They represent money earned through referral activities, similar to ROS payouts and pool payouts
2. **Business logic consistency**: Users earn referral bonuses, so they should be grouped with other earnings in the transaction history
3. **UI consistency**: In the frontend, referral bonuses are displayed in the "Earnings" category breakdown, not in a separate "Bonus" category
4. **User expectation**: Users expect referral bonuses to show up under their total earnings

## Transaction Types That Should Be Categorized as "earnings"

All of these should have `category: "earnings"`:

- `ros_payout` ✅
- `stake_pool_payout` ✅
- `performance_pool_payout` ✅
- `premium_pool_payout` ✅
- `stake_roi` ✅
- `pool_distribution` ✅
- `referral_bonus` ❌ **Needs to be changed to "earnings"**

## Transaction Types That Should Remain as "bonus"

These should continue to have `category: "bonus"`:

- `registration_bonus` (one-time welcome bonus)
- `bonus_activation` (bonus activation events)
- `ranking_bonus` (rank advancement bonuses)

## API Endpoints Affected

The following endpoints should return `category: "earnings"` for referral_bonus transactions:

1. **GET /api/v1/enhanced-transactions/history**
   - Individual transaction objects
   - Category breakdown aggregation
   - Summary totals

2. **Any other endpoints that return transaction data with categories**

## Category Breakdown Impact

In the `categoryBreakdown` response, referral bonuses should be included in the `earnings` totals, not in the `bonus` totals:

```json
{
  "categoryBreakdown": {
    "earnings": {
      "count": 5, // Should include referral_bonus transactions
      "totalAmount": 15000 // Should include referral bonus amounts
    },
    "bonus": {
      "count": 1, // Should NOT include referral_bonus
      "totalAmount": 5000 // Should NOT include referral bonus amounts
    }
  }
}
```

## Summary Totals Impact

In the `summary.earnings` response, referral bonuses should be included:

```json
{
  "summary": {
    "earnings": {
      "rosPayouts": 10000,
      "poolPayouts": 3000,
      "referralBonuses": 2000, // Should be tracked separately but included in earnings
      "rosCount": 5
    }
  }
}
```

## Frontend Status

The frontend has already been updated to categorize `referral_bonus` as "earnings" on the client side as a workaround. However, it would be better for consistency if the backend also returns the correct category.

## Testing Checklist

After implementing this change, please verify:

- [ ] `referral_bonus` transactions have `category: "earnings"` in API responses
- [ ] Category breakdown correctly includes referral bonuses in `earnings` totals
- [ ] Category breakdown correctly excludes referral bonuses from `bonus` totals
- [ ] Summary totals correctly include referral bonuses in earnings calculations
- [ ] Filtering by `category=earnings` returns referral_bonus transactions
- [ ] Filtering by `category=bonus` does NOT return referral_bonus transactions
- [ ] Other bonus types (registration_bonus, ranking_bonus) still have `category: "bonus"`

## Priority

**Medium Priority** - This is a categorization fix that improves data consistency and user experience, but the frontend is already handling it correctly as a workaround.

Thank you! Let me know if you need any clarification or additional context.
