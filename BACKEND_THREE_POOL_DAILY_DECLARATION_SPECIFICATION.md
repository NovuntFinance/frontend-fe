# Backend Implementation: Three-Pool Daily Declaration System

**Date**: January 9, 2026  
**Priority**: 🔴 **HIGH** - Core Business Logic Change  
**Status**: ⚠️ **REQUIRES FULL BACKEND IMPLEMENTATION**

---

## 📋 Executive Summary

The current Daily Profit system only declares **one percentage per day** (ROS). The requirement is to declare **THREE percentages per day**:

1. **Premium Pool Percentage** - For premium pool distribution
2. **Performance Pool Percentage** - For performance pool distribution
3. **ROS Percentage** - For daily return on stake

Each day should store all three percentages, persist them, and synchronize with user distributions.

---

## 🎯 Business Requirements

### Current System (Separate Systems):

```javascript
// Pool Declaration (exists on /admin/pool page)
{
  performancePoolAmount: 5000,  // Dollar amount
  premiumPoolAmount: 10000      // Dollar amount
}

// Daily Profit (exists on /admin/daily-profit page)
{
  date: "2026-01-09",
  profitPercentage: 0.55  // ROS percentage only
}
```

### Required System (Integrated):

```javascript
// Single declaration with BOTH pool amounts AND ROS percentage
{
  date: "2026-01-09",
  premiumPoolAmount: 10000,       // Dollar amount (NOT percentage)
  performancePoolAmount: 5000,    // Dollar amount (NOT percentage)
  rosPercentage: 0.55             // Percentage (as it is now)
}
```

**Key Insight:** This is an **integration task**, not a rewrite. The existing Pool Declaration system already handles dollar amounts correctly. We just need to link it with the Daily Profit calendar.

---

## 🗄️ Database Schema Changes

### Current Schema (`DailyProfit` collection):

```javascript
{
  _id: ObjectId,
  date: String,              // YYYY-MM-DD
  profitPercentage: Number,  // Single percentage
  description: String,
  isActive: Boolean,
  isDistributed: Boolean,
  distributedAt: Date,
  distributedBy: ObjectId,
  declaredBy: ObjectId,
  declaredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Required Schema (ADD TWO NEW FIELDS):

```javascript
{
  _id: ObjectId,
  date: String,              // YYYY-MM-DD

  // NEW FIELDS (REQUIRED):
  premiumPoolAmount: Number,      // Dollar amount (e.g., 10000), required
  performancePoolAmount: Number,  // Dollar amount (e.g., 5000), required
  rosPercentage: Number,          // 0-100 percentage (e.g., 0.55), required

  // DEPRECATED (Keep for backward compatibility):
  profitPercentage: Number,  // Legacy field, can default to rosPercentage

  description: String,
  isActive: Boolean,
  isDistributed: Boolean,
  distributedAt: Date,
  distributedBy: ObjectId,
  declaredBy: ObjectId,
  declaredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Migration Strategy:**

- For existing records without the new fields, set:
  - `rosPercentage = profitPercentage` (keep existing ROS value)
  - `premiumPoolAmount = 0`
  - `performancePoolAmount = 0`

---

## 📍 API Endpoints to Update

### 1. Declare Single Day Profit

**Endpoint:** `POST /api/v1/admin/daily-profit/declare`

**Current Request Body:**

```json
{
  "date": "2026-01-09",
  "profitPercentage": 50.0,
  "description": "Daily profit"
}
```

**NEW Request Body (REQUIRED):**

```json
{
  "date": "2026-01-09",
  "premiumPoolAmount": 10000,
  "performancePoolAmount": 5000,
  "rosPercentage": 0.55,
  "description": "Daily profit with pool amounts and ROS percentage"
}
```

**Response (UPDATE):**

```json
{
  "success": true,
  "message": "Daily profit declared successfully",
  "data": {
    "dailyProfit": {
      "id": "65f8a...",
      "date": "2026-01-09",
      "premiumPoolAmount": 10000,
      "performancePoolAmount": 5000,
      "rosPercentage": 0.55,
      "profitPercentage": 0.55, // Same as rosPercentage for backward compatibility
      "description": "Daily profit with pool amounts and ROS percentage",
      "isActive": true,
      "isDistributed": false,
      "declaredBy": {
        "_id": "admin123",
        "email": "admin@example.com",
        "username": "admin"
      },
      "declaredAt": "2026-01-09T10:00:00.000Z",
      "createdAt": "2026-01-09T10:00:00.000Z",
      "updatedAt": "2026-01-09T10:00:00.000Z"
    }
  }
}
```

**Validation Rules:**

- `premiumPoolAmount`: Required, >= 0 (dollar amount, e.g., 10000)
- `performancePoolAmount`: Required, >= 0 (dollar amount, e.g., 5000)
- `rosPercentage`: Required, 0-100 (percentage, e.g., 0.55)
- `date`: Required, must be today or future date (no past dates)
- `description`: Optional string

---

### 2. Declare Bulk Profits

**Endpoint:** `POST /api/v1/admin/daily-profit/declare-bulk`

**NEW Request Body:**

```json
{
  "declarations": [
    {
      "date": "2026-01-09",
      "premiumPoolPercentage": 20.0,
      "performancePoolPercentage": 15.0,
      "rosPercentage": 15.0,
      "description": "Day 1"
    },
    {
      "date": "2026-01-10",
      "premiumPoolPercentage": 18.0,
      "performancePoolPercentage": 16.0,
      "rosPercentage": 16.0,
      "description": "Day 2"
    }
  ]
}
```

---

### 3. Get Declared Profits (Admin)

**Endpoint:** `GET /api/v1/admin/daily-profit/declared`

**Response (UPDATE):**

```json
{
  "success": true,
  "data": {
    "dailyProfits": [
      {
        "id": "65f8a...",
        "date": "2026-01-09",
        "premiumPoolPercentage": 20.0,
        "performancePoolPercentage": 15.0,
        "rosPercentage": 15.0,
        "profitPercentage": 50.0,
        "description": "Daily profit",
        "isActive": true,
        "isDistributed": false,
        "declaredBy": { ... },
        "declaredAt": "2026-01-09T10:00:00.000Z",
        "createdAt": "2026-01-09T10:00:00.000Z",
        "updatedAt": "2026-01-09T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 30,
      "limit": 30,
      "offset": 0
    }
  }
}
```

---

### 4. Get Today's Profit (User)

**Endpoint:** `GET /api/v1/daily-profit/today`

**Response (UPDATE):**

```json
{
  "success": true,
  "data": {
    "date": "2026-01-09",
    "premiumPoolPercentage": 20.0,
    "performancePoolPercentage": 15.0,
    "rosPercentage": 15.0,
    "profitPercentage": 50.0, // Total or primary value
    "isDistributed": false
  }
}
```

**Security Note:** Users should only see percentages for **today**, not future dates.

---

### 5. Update Profit Declaration

**Endpoint:** `PATCH /api/v1/admin/daily-profit/:date`

**NEW Request Body:**

```json
{
  "premiumPoolPercentage": 22.0,
  "performancePoolPercentage": 16.0,
  "rosPercentage": 16.0,
  "description": "Updated declaration"
}
```

**Validation:**

- Can only update future or today's declarations
- Cannot update if `isDistributed: true`

---

## 🔄 Distribution Logic Changes

### Current Distribution:

```javascript
// Single percentage distribution
const dailyProfit = await DailyProfit.findOne({ date: today });
const profitPercentage = dailyProfit.profitPercentage;

// Distribute using single percentage
await distributeToStakes(profitPercentage);
```

### Required Distribution (THREE SEPARATE DISTRIBUTIONS):

```javascript
// Get today's declaration with pool amounts and ROS percentage
const dailyProfit = await DailyProfit.findOne({ date: today });

// 1. Distribute Premium Pool (DOLLAR AMOUNT)
await distributePremiumPool(
  dailyProfit.premiumPoolAmount, // e.g., $10,000
  qualifiedPremiumUsers
);

// 2. Distribute Performance Pool (DOLLAR AMOUNT)
await distributePerformancePool(
  dailyProfit.performancePoolAmount, // e.g., $5,000
  qualifiedPerformanceUsers
);

// 3. Distribute ROS to all active stakes (PERCENTAGE)
await distributeROS(
  dailyProfit.rosPercentage, // e.g., 0.55%
  activeStakes
);

// Mark as distributed
dailyProfit.isDistributed = true;
dailyProfit.distributedAt = new Date();
await dailyProfit.save();
```

### Distribution Breakdown:

#### 1. Premium Pool Distribution (DOLLAR AMOUNT)

```javascript
/**
 * Distribute premium pool DOLLAR AMOUNT to qualified users
 * This is the SAME logic as existing /admin/pool declaration
 */
async function distributePremiumPool(dollarAmount, qualifiedUsers) {
  // $10,000 / 10 qualified users = $1,000 per user

  if (qualifiedUsers.length === 0) {
    console.log('No premium pool qualifiers');
    return;
  }

  // Distribute dollar amount equally or by rank
  const perUserAmount = dollarAmount / qualifiedUsers.length;

  for (const user of qualifiedUsers) {
    await createTransaction({
      userId: user._id,
      type: 'premium_pool_payout',
      amount: perUserAmount,
      description: `Premium Pool distribution - $${dollarAmount} total`,
      date: new Date(),
    });

    await updateUserBalance(user._id, perUserAmount);
  }
}
```

#### 2. Performance Pool Distribution (DOLLAR AMOUNT)

```javascript
/**
 * Distribute performance pool DOLLAR AMOUNT to qualified users
 * This is the SAME logic as existing /admin/pool declaration
 */
async function distributePerformancePool(dollarAmount, qualifiedUsers) {
  // $5,000 / 5 qualified users = $1,000 per user

  if (qualifiedUsers.length === 0) {
    console.log('No performance pool qualifiers');
    return;
  }

  // Distribute dollar amount equally or by rank
  const perUserAmount = dollarAmount / qualifiedUsers.length;

  for (const user of qualifiedUsers) {
    await createTransaction({
      userId: user._id,
      type: 'performance_pool_payout',
      amount: perUserAmount,
      description: `Performance Pool distribution - $${dollarAmount} total`,
      date: new Date(),
    });

    await updateUserBalance(user._id, perUserAmount);
  }
}
```

#### 3. ROS Distribution (PERCENTAGE)

```javascript
/**
 * Distribute ROS PERCENTAGE to all active stakes
 * This is the EXISTING logic - no changes needed
 */
async function distributeROS(percentage, activeStakes) {
  // 0.55% of each stake amount

  for (const stake of activeStakes) {
    const rosAmount = (stake.amount * percentage) / 100;

    await createTransaction({
      userId: stake.userId,
      type: 'ros_payout',
      amount: rosAmount,
      description: `Daily ROS distribution - ${percentage}%`,
      date: new Date(),
      relatedStake: stake._id,
    });

    await updateStakeBalance(stake._id, rosAmount);
  }
}
```

---

## 🎨 Frontend Integration Requirements

### TypeScript Types (Frontend will update):

```typescript
// New type definition
export interface DailyProfit {
  id: string;
  date: string; // YYYY-MM-DD

  // Three separate percentages
  premiumPoolPercentage: number;
  performancePoolPercentage: number;
  rosPercentage: number;

  // Deprecated (kept for backward compatibility)
  profitPercentage: number; // Sum or total

  description?: string;
  isActive: boolean;
  isDistributed: boolean;
  distributedAt?: string;
  distributedBy?: {...};
  declaredBy: {...};
  declaredAt: string;
  createdAt: string;
  updatedAt: string;
}
```

### API Request Type:

```typescript
export interface DeclareProfitRequest {
  date: string;
  premiumPoolPercentage: number;
  performancePoolPercentage: number;
  rosPercentage: number;
  description?: string;
  twoFACode: string;
}
```

---

## ✅ Testing Requirements

### Unit Tests:

1. **Test Declaration with Three Percentages:**

```bash
# Declare with all three percentages
POST /api/v1/admin/daily-profit/declare
{
  "date": "2026-01-15",
  "premiumPoolPercentage": 20.0,
  "performancePoolPercentage": 15.0,
  "rosPercentage": 15.0,
  "description": "Test declaration"
}

# Verify response contains all three percentages
```

2. **Test Validation:**

```bash
# Test missing premiumPoolPercentage
POST /api/v1/admin/daily-profit/declare
{
  "date": "2026-01-15",
  "performancePoolPercentage": 15.0,
  "rosPercentage": 15.0
}
# Should return 400 with validation error

# Test negative percentage
POST /api/v1/admin/daily-profit/declare
{
  "date": "2026-01-15",
  "premiumPoolPercentage": -5.0,
  "performancePoolPercentage": 15.0,
  "rosPercentage": 15.0
}
# Should return 400 with validation error

# Test percentage > 100
POST /api/v1/admin/daily-profit/declare
{
  "date": "2026-01-15",
  "premiumPoolPercentage": 150.0,
  "performancePoolPercentage": 15.0,
  "rosPercentage": 15.0
}
# Should return 400 with validation error
```

3. **Test Distribution:**

```bash
# Declare profit for today
POST /api/v1/admin/daily-profit/declare
{
  "date": "2026-01-09",
  "premiumPoolPercentage": 20.0,
  "performancePoolPercentage": 15.0,
  "rosPercentage": 15.0
}

# Trigger distribution
POST /api/v1/admin/daily-profit/test-distribute
{
  "date": "2026-01-09"
}

# Verify:
# - Premium pool users received premium_pool_payout transactions
# - Performance pool users received performance_pool_payout transactions
# - All stake users received ros_payout transactions
# - Amounts match the declared percentages
```

---

## 🚀 Implementation Steps

### Phase 1: Database Schema Update

1. ✅ Add three new fields to `DailyProfit` schema
2. ✅ Create migration script for existing records
3. ✅ Update indexes if needed

### Phase 2: API Endpoint Updates

1. ✅ Update `POST /admin/daily-profit/declare` to accept three percentages
2. ✅ Update `POST /admin/daily-profit/declare-bulk` to accept three percentages
3. ✅ Update `GET /admin/daily-profit/declared` response format
4. ✅ Update `GET /daily-profit/today` response format
5. ✅ Update `PATCH /admin/daily-profit/:date` to accept three percentages

### Phase 3: Distribution Logic

1. ✅ Implement `distributePremiumPool()` function
2. ✅ Implement `distributePerformancePool()` function
3. ✅ Update `distributeROS()` function to use `rosPercentage` instead of `profitPercentage`
4. ✅ Update cron job to call all three distribution functions

### Phase 4: Testing

1. ✅ Unit tests for declaration endpoints
2. ✅ Integration tests for distribution logic
3. ✅ End-to-end tests with real data
4. ✅ Verify transactions are created correctly

### Phase 5: Deployment

1. ✅ Deploy to staging
2. ✅ Run migration script
3. ✅ Test with frontend team
4. ✅ Deploy to production
5. ✅ Monitor logs for errors

---

## 📊 Success Criteria

1. ✅ Admin can declare two pool amounts (dollars) and one ROS percentage per day
2. ✅ Calendar shows pool amounts and ROS percentage for each day
3. ✅ Distribution correctly splits into three separate distributions (2 pools + ROS)
4. ✅ Transactions have correct types (`premium_pool_payout`, `performance_pool_payout`, `ros_payout`)
5. ✅ Pool amounts are distributed to qualified users only
6. ✅ ROS percentage is applied to all active stakes
7. ✅ Historical data migrated correctly
8. ✅ No breaking changes for existing functionality

---

## 🔒 Security Considerations

1. **Admin Authentication:** All declaration endpoints require admin role + 2FA
2. **Validation:** Pool amounts must be >= 0, ROS percentage must be 0-100
3. **Authorization:** Only admins can declare profits
4. **Audit Trail:** Track who declared/updated each value
5. **Distribution Safety:** Prevent duplicate distributions with `isDistributed` flag

---

## 📞 Questions for Backend Team

1. **Integration:** Should we reuse the existing pool distribution logic from `/admin/pool`, or create new functions?
2. **Qualification:** Is the pool qualification logic already implemented and working?
3. **Backward Compatibility:** Should we keep `profitPercentage` field equal to `rosPercentage` for old clients?
4. **Validation:** Should there be any limits on pool amounts (e.g., max $100,000)?
5. **Cron Job:** Should the cron job handle all three distributions automatically?

---

## 🎯 Next Steps

1. **Backend Team:** Review this specification and provide feedback
2. **Backend Team:** Implement schema changes (add 2 fields: premiumPoolAmount, performancePoolAmount)
3. **Backend Team:** Update API endpoints to accept/return new fields
4. **Backend Team:** Update distribution logic to handle both pool amounts and ROS percentage
5. **Frontend Team:** Wait for backend completion, then update UI components
6. **Both Teams:** Coordinate testing and deployment

---

**Note:** This is a **simple integration** between two existing systems (Pool Declaration + Daily Profit). The pool distribution logic already exists and works correctly. We just need to store pool amounts alongside ROS percentage in the Daily Profit system.
