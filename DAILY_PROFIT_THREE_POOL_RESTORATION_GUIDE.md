# Daily Profit Management - Three-Pool System Restoration

**Date**: January 9, 2026  
**Status**: 🔴 **REQUIRES BOTH FRONTEND & BACKEND WORK**  
**Current State**: Daily Profit page partially working but only supports single percentage

---

## 📋 Quick Answer

**Q: Should work start on frontend or backend?**  
**A: BACKEND FIRST, then Frontend.**

Both need work, but backend must go first because:

1. Backend needs to link Pool Declaration (dollar amounts) with Daily Profit (ROS percentage)
2. Backend needs to update API endpoints to accept/return both pool amounts AND ROS percentage
3. Frontend depends on backend API changes
4. Frontend work is blocked until backend is complete

---

## 🎯 Your Requirements

You want the Daily Profit system to declare **THREE separate values per day**:

1. **Premium Pool Amount** - **Dollar amount** (e.g., $10,000) shared among qualified users
2. **Performance Pool Amount** - **Dollar amount** (e.g., $5,000) shared among qualified users
3. **ROS Percentage** - **Percentage** (e.g., 0.55%) applied to all active stakes

**Current System:**

- Pool Declaration (separate page) - declares dollar amounts for pools
- Daily Profit (separate page) - declares ROS percentage
- **These are disconnected**

**Required System:**

- **Integrate both systems** - declare pool amounts AND ROS percentage together on one page

---

## 📂 Documentation Created

I've created two comprehensive guides:

### 1. Backend Specification (START HERE)

**File:** [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)

**Contents:**

- Database schema changes (add 3 new fields)
- API endpoint updates (6 endpoints)
- Distribution logic (split into 3 separate distributions)
- Testing requirements
- Implementation steps
- Example code

**Timeline:** 2-3 days

---

### 2. Frontend Implementation Plan (WAIT FOR BACKEND)

**File:** [FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md](./FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md)

**Contents:**

- TypeScript type updates
- Component changes (7 components)
- UI mockups for three-percentage inputs
- Calendar display updates
- User dashboard updates
- Implementation checklist

**Timeline:** 1-2 days (after backend complete)

---

## 🚀 Implementation Roadmap

### Phase 1: Backend Implementation (2-3 days)

**Owner:** Backend Team  
**File:** [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)

```
Step 1: Update Database Schema
├── Add premiumPoolPercentage field (Number, 0-100)
├── Add performancePoolPercentage field (Number, 0-100)
├── Add rosPercentage field (Number, 0-100)
└── Migrate existing data

Step 2: Update API Endpoints
├── POST /api/v1/admin/daily-profit/declare
├── POST /api/v1/admin/daily-profit/declare-bulk
├── GET /api/v1/admin/daily-profit/declared
├── GET /api/v1/daily-profit/today
├── PATCH /api/v1/admin/daily-profit/:date
└── POST /api/v1/admin/daily-profit/test-distribute

Step 3: Update Distribution Logic
├── distributePremiumPool() - New function
├── distributePerformancePool() - New function
├── distributeROS() - Update to use rosPercentage
└── Cron job - Call all three distributions

Step 4: Testing
├── Unit tests for endpoints
├── Distribution logic tests
└── Integration tests
```

---

### Phase 2: Frontend Implementation (1-2 days)

**Owner:** Frontend Team  
**File:** [FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md](./FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md)

```
Step 1: Update Types
└── src/types/dailyProfit.ts (add 3 new fields)

Step 2: Update Admin Components
├── DeclareProfitModal.tsx (3 input fields instead of 1)
├── BulkDeclareModal.tsx (3 input fields)
├── DailyProfitCalendar.tsx (show 3 percentages per day)
├── DeclaredProfitsList.tsx (3 columns for percentages)
└── DistributionStatus.tsx (show 3 percentage breakdown)

Step 3: Update User Components
├── TodayROSCard.tsx (display 3 percentages)
└── DailyROSPerformance.tsx (tooltip with 3 percentages)

Step 4: Testing
├── Test declaration with 3 percentages
├── Test calendar display
└── Test user dashboard
```

---

## 🎨 Visual Changes

### Admin Declare Modal

**Before (Current):**

```
┌─────────────────────────────┐
│  Declare Daily Profit       │
├─────────────────────────────┤
│  Date: 2026-01-09           │
│  Profit Percentage: [50.0]% │  ← Single input
│  Description: [...........]  │
│  [Cancel]  [Declare]        │
└─────────────────────────────┘
```

**After (Required):**

```
┌─────────────────────────────────┐
│  Declare Daily Profit           │
├─────────────────────────────────┤
│  Date: 2026-01-09               │
│  Premium Pool:      [$10,000]   │  ← Dollar amount
│  Performance Pool:  [$5,000]    │  ← Dollar amount
│  ROS Percentage:    [0.55]%     │  ← Percentage
│  ────────────────────────       │
│  Total Pool Amount: $15,000     │  ← Sum of pools
│  Description: [...............]  │
│  [Cancel]  [Declare]            │
└─────────────────────────────────┘
```

---

### Calendar View

**Before (Current):**

```
┌──────────┐
│    9     │
│  50.0%   │  ← Single percentage
│[Pending] │
└──────────┘
```

**After (Required):**

```
┌──────────────┐
│      9       │
│ P:  $10k     │  ← Premium (dollars)
│ Pf: $5k      │  ← Performance (dollars)
│ R:  0.55%    │  ← ROS (percentage)
│  [Pending]   │
└──────────────┘
```

---

### User Dashboard

**Before (Current):**

```
┌─────────────────────┐
│ Today's Profit      │
├─────────────────────┤
│      50.0%          │  ← Single big number
│   [Pending]         │
└─────────────────────┘
```

**After (Required):**

```
┌──────────────────────────────────────────┐
│ Today's Profit                           │
├──────────────────────────────────────────┤
│         0.55%                            │  ← ROS %
│       Daily ROS                          │
│                                          │
│ ┌────────────┐  ┌────────────┐         │
│ │  $10,000   │  │  $5,000    │         │  ← Pool amounts
│ │  Premium   │  │  Perf. Pool│         │
│ │   Pool     │  │            │         │
│ └────────────┘  └────────────┘         │
│          [Pending Distribution]         │
└──────────────────────────────────────────┘
```

---

## 📊 API Changes Summary

### Request Body Changes

**Before:**

```json
{
  "date": "2026-01-09",
  "profitPercentage": 0.55
}
```

**After:**

```json
{
  "date": "2026-01-09",
  "premiumPoolAmount": 10000,
  "performancePoolAmount": 5000,
  "rosPercentage": 0.55
}
```

### Response Body Changes

**Before:**

```json
{
  "success": true,
  "data": {
    "date": "2026-01-09",
    "profitPercentage": 0.55
  }
}
```

**After:**

```json
{
  "success": true,
  "data": {
    "date": "2026-01-09",
    "premiumPoolAmount": 10000,
    "performancePoolAmount": 5000,
    "rosPercentage": 0.55,
    "totalPoolAmount": 15000
  }
}
```

---

## ⚡ Quick Start

### For Backend Team:

1. **Read:** [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)
2. **Update Database Schema:** Add 3 new fields to `DailyProfit` collection
3. **Update API Endpoints:** Modify 6 endpoints to accept/return 3 percentages
4. **Update Distribution Logic:** Split into 3 separate distribution functions
5. **Test:** Verify all endpoints and distributions work correctly
6. **Deploy:** Push to staging for frontend team to test

### For Frontend Team:

1. **Wait:** Backend must be deployed to staging first
2. **Read:** [FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md](./FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md)
3. **Update Types:** Add 3 new percentage fields
4. **Update Components:** 7 components need updates
5. **Test:** Verify calendar, modals, and dashboard work correctly
6. **Deploy:** Push to production

---

## ⏱️ Timeline

```
Week 1:
├── Day 1-2: Backend schema + API changes
├── Day 3: Backend distribution logic
└── Day 4: Backend testing

Week 2:
├── Day 5: Backend deploy to staging
├── Day 6-7: Frontend implementation
└── Day 8: Integration testing + Production deploy

Total: ~8 days
```

---

## ✅ Success Criteria

1. ✅ Admin can declare three separate percentages per day
2. ✅ Calendar shows all three percentages for each day
3. ✅ Distribution correctly splits into three separate pools
4. ✅ Users see breakdown of three percentages on dashboard
5. ✅ Transactions have correct types (`premium_pool_payout`, `performance_pool_payout`, `ros_payout`)
6. ✅ Historical data handled correctly
7. ✅ No breaking changes for existing functionality

---

## 🔗 Related Files

- [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md) - **Backend guide**
- [FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md](./FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md) - **Frontend guide**
- Current Page: [src/app/(admin)/admin/daily-profit/page.tsx](<src/app/(admin)/admin/daily-profit/page.tsx>)
- Current Types: [src/types/dailyProfit.ts](src/types/dailyProfit.ts)
- Current Service: [src/services/dailyProfitService.ts](src/services/dailyProfitService.ts)

---

## 🎯 Next Actions

### Immediate (Today):

1. **Backend Team:** Review [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)
2. **Backend Team:** Provide feedback/questions
3. **Backend Team:** Start implementation

### After Backend Complete:

1. **Frontend Team:** Review [FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md](./FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md)
2. **Frontend Team:** Start implementation
3. **Both Teams:** Integration testing

---

## 📞 Questions?

If you have questions about:

- **Backend implementation** → See [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)
- **Frontend implementation** → See [FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md](./FRONTEND_THREE_POOL_DAILY_DECLARATION_PLAN.md)
- **Timeline/priorities** → This document

---

**Summary:** Backend work MUST come first (database + API changes), then frontend can implement UI changes. Both are fully documented and ready to implement.
