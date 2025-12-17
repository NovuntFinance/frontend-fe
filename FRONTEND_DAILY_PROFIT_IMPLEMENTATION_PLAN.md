# 🚀 Frontend Daily Profit System - Implementation Plan

**Date:** January 2025  
**Status:** 📋 **PLANNING**  
**Backend Status:** ✅ **READY FOR INTEGRATION**

---

## 📋 Executive Summary

The backend has migrated from a **weekly profit system** to a **daily profit system**. This document outlines the frontend implementation plan to integrate the new daily profit endpoints.

**Key Changes:**

- ✅ Backend now uses daily profit declarations (replaces weekly)
- ✅ Admin can declare up to 30 days ahead
- ✅ Users can only see today's profit (privacy feature)
- ✅ Test endpoint available for manual distribution

---

## 🔍 Current Frontend State

### **Existing Weekly ROS Implementation:**

1. **User Components:**
   - `src/components/dashboard/WeeklyROSCard.tsx` - Weekly ROS display
   - `src/components/dashboard/DailyROSPerformance.tsx` - Daily earnings chart
   - `src/components/dashboard/TodayROSCard.tsx` - Today's ROS card
   - `src/hooks/useTodayRos.ts` - Hook for today's ROS

2. **Admin Components:**
   - `src/components/admin/ros/CalendarManagement.tsx` - Weekly calendar management
   - `src/app/(admin)/admin/ros/page.tsx` - Admin ROS page

3. **Services:**
   - `src/services/rosApi.ts` - Weekly ROS API service
   - `src/lib/queries.ts` - React Query hooks for weekly ROS

4. **Endpoints Currently Used:**
   - `GET /api/analytics/weekly-summary` - Weekly summary
   - `GET /api/analytics/daily-earnings` - Daily earnings
   - `GET /api/v1/ros/today` - Today's ROS
   - `GET /api/v1/admin/ros-calendar` - Admin calendar (weekly)

---

## 🎯 Migration Strategy

### **Phase 1: Create New Daily Profit Service** ✅ Priority 1

**Create:** `src/services/dailyProfitService.ts`

**New Endpoints to Implement:**

#### **Admin Endpoints:**

- `POST /api/v1/admin/daily-profit/declare` - Declare single day
- `POST /api/v1/admin/daily-profit/declare-bulk` - Declare multiple days
- `GET /api/v1/admin/daily-profit/declared` - View all declared
- `PATCH /api/v1/admin/daily-profit/:date` - Update future profit
- `DELETE /api/v1/admin/daily-profit/:date` - Delete future profit
- `POST /api/v1/admin/daily-profit/test-distribute` - Test distribution

#### **User Endpoints:**

- `GET /api/v1/daily-profit/today` - Get today's profit
- `GET /api/v1/daily-profit/history` - Get profit history

**Implementation:**

- Use `adminService.createAdminApi()` for admin endpoints (handles 2FA automatically)
- Use regular axios for user endpoints (no 2FA)
- Follow same patterns as `adminService.ts`

---

### **Phase 2: Create React Query Hooks** ✅ Priority 1

**Create:** Add to `src/lib/queries.ts` or create `src/lib/queries/dailyProfitQueries.ts`

**Hooks Needed:**

#### **Admin Hooks:**

```typescript
- useDeclaredDailyProfits(filters) - Get all declared profits
- useDeclareDailyProfit() - Declare single day (mutation)
- useDeclareBulkDailyProfit() - Declare bulk (mutation)
- useUpdateDailyProfit() - Update profit (mutation)
- useDeleteDailyProfit() - Delete profit (mutation)
- useTestDistributeDailyProfit() - Test distribution (mutation)
```

#### **User Hooks:**

```typescript
- useTodayProfit() - Get today's profit
- useProfitHistory(limit, offset) - Get profit history
```

---

### **Phase 3: Update User Components** ✅ Priority 2

#### **3.1 Update TodayROSCard Component**

**File:** `src/components/dashboard/TodayROSCard.tsx`

**Changes:**

- Replace `useTodayRos()` hook with `useTodayProfit()`
- Update to use new endpoint: `GET /api/v1/daily-profit/today`
- Update data structure (new response format)
- Handle 404 gracefully (no profit declared for today)

#### **3.2 Update WeeklyROSCard Component**

**File:** `src/components/dashboard/WeeklyROSCard.tsx`

**Decision Needed:**

- **Option A:** Keep weekly display but use daily data aggregated
- **Option B:** Replace with daily profit card
- **Option C:** Show both (weekly summary + daily breakdown)

**Recommendation:** Option C - Show daily breakdown with weekly summary

#### **3.3 Update DailyROSPerformance Component**

**File:** `src/components/dashboard/DailyROSPerformance.tsx`

**Changes:**

- Update to use `useProfitHistory()` hook
- Use new endpoint: `GET /api/v1/daily-profit/history`
- Ensure only past dates are shown (privacy check)

---

### **Phase 4: Create Admin Daily Profit Management** ✅ Priority 2

#### **4.1 Create Daily Profit Calendar Component**

**Create:** `src/components/admin/dailyProfit/DailyProfitCalendar.tsx`

**Features:**

- 30-day calendar view
- Color coding:
  - Green: Declared, not distributed
  - Blue: Distributed
  - Gray: Past dates (read-only)
  - White: Not declared
- Click date to declare/edit profit
- Bulk selection for multiple days

#### **4.2 Create Declare Profit Modal**

**Create:** `src/components/admin/dailyProfit/DeclareProfitModal.tsx`

**Features:**

- Date picker (max 30 days ahead)
- Percentage input (0-100)
- Description field (optional)
- 2FA input (handled automatically by service)
- Validation

#### **4.3 Create Bulk Declaration Component**

**Create:** `src/components/admin/dailyProfit/BulkDeclareModal.tsx`

**Features:**

- Multi-date selection
- Set percentage for selected dates
- Preview before submission
- Validate max 30 days

#### **4.4 Create Distribution Status Component**

**Create:** `src/components/admin/dailyProfit/DistributionStatus.tsx`

**Features:**

- Show distribution status for each date
- Display distribution results:
  - Total stakes processed
  - Total amount distributed
  - Completed stakes count
- Test distribution button

#### **4.5 Update Admin ROS Page**

**File:** `src/app/(admin)/admin/ros/page.tsx`

**Changes:**

- Replace `CalendarManagement` with new daily profit components
- Or create new page: `src/app/(admin)/admin/daily-profit/page.tsx`
- Add navigation link in sidebar

---

### **Phase 5: Type Definitions** ✅ Priority 1

**Create/Update:** `src/types/dailyProfit.ts`

**Types Needed:**

```typescript
- DailyProfit (admin view)
- DailyProfitUser (user view - today only)
- DailyProfitHistory (user view - past dates)
- DeclareProfitRequest
- DeclareBulkProfitRequest
- UpdateProfitRequest
- DistributionResult
```

---

### **Phase 6: Migration & Cleanup** ✅ Priority 3

#### **6.1 Deprecate Old Weekly Endpoints**

**Files to Update:**

- `src/services/rosApi.ts` - Mark weekly endpoints as deprecated
- Keep for backward compatibility during transition
- Add console warnings

#### **6.2 Update Navigation**

**Files:**

- `src/components/admin/AdminSidebar.tsx` - Update ROS link to Daily Profit
- `src/components/admin/AdminTopBar.tsx` - Update mobile menu

#### **6.3 Remove Old Components (After Migration)**

**After confirming new system works:**

- Remove `CalendarManagement.tsx` (or keep as backup)
- Clean up unused weekly ROS code

---

## 📝 Implementation Checklist

### **Phase 1: Service Layer** ⏳

- [ ] Create `src/services/dailyProfitService.ts`
- [ ] Implement all admin endpoints
- [ ] Implement all user endpoints
- [ ] Add proper error handling
- [ ] Add TypeScript types
- [ ] Test with backend

### **Phase 2: React Query Hooks** ⏳

- [ ] Create admin query hooks
- [ ] Create user query hooks
- [ ] Add proper cache invalidation
- [ ] Add error handling
- [ ] Test hooks

### **Phase 3: User Components** ⏳

- [ ] Update `TodayROSCard.tsx`
- [ ] Update `WeeklyROSCard.tsx` (or create new)
- [ ] Update `DailyROSPerformance.tsx`
- [ ] Test user-facing components
- [ ] Verify privacy (no future dates shown)

### **Phase 4: Admin Components** ⏳

- [ ] Create `DailyProfitCalendar.tsx`
- [ ] Create `DeclareProfitModal.tsx`
- [ ] Create `BulkDeclareModal.tsx`
- [ ] Create `DistributionStatus.tsx`
- [ ] Create/update admin page
- [ ] Add navigation links
- [ ] Test admin components

### **Phase 5: Types** ⏳

- [ ] Create `src/types/dailyProfit.ts`
- [ ] Update existing types if needed
- [ ] Ensure type safety

### **Phase 6: Migration** ⏳

- [ ] Deprecate old endpoints
- [ ] Update navigation
- [ ] Test full flow
- [ ] Remove old code (after confirmation)

---

## 🔐 Security & Authentication

### **Admin Endpoints:**

- ✅ Use `adminService.createAdminApi()` (handles 2FA automatically)
- ✅ 2FA code in request body for POST/PATCH/DELETE
- ✅ 2FA code in query params for GET
- ✅ Requires `financial.declare` permission

### **User Endpoints:**

- ✅ Use regular axios with user token
- ✅ No 2FA required
- ✅ Privacy: Only today's and past profits

---

## 🧪 Testing Plan

### **Admin Testing:**

1. Declare profit for today
2. Declare profit for future date (within 30 days)
3. Try to declare for date > 30 days (should fail)
4. Try to declare for past date (should fail)
5. Declare bulk profits
6. Update future profit
7. Delete future profit
8. Test distribution using test endpoint
9. Verify distribution results

### **User Testing:**

1. Get today's profit (should work if declared)
2. Get today's profit when not declared (should return 404)
3. Get profit history (should only show past dates)
4. Verify future dates are never shown

### **Integration Testing:**

1. Declare profit → Test distribution → Check user wallets
2. Declare profit → Check stake dailyReturnsHistory
3. Verify transactions are created
4. Verify referral bonuses are processed

---

## 📊 Data Flow

### **Declare Profit:**

```
Admin UI → DeclareProfitModal → useDeclareDailyProfit()
  → dailyProfitService.declare()
  → POST /api/v1/admin/daily-profit/declare
  → Backend validates & saves
  → Success → Invalidate queries → Update UI
```

### **User View Today's Profit:**

```
User Dashboard → TodayROSCard → useTodayProfit()
  → dailyProfitService.getTodayProfit()
  → GET /api/v1/daily-profit/today
  → Backend returns today's profit (if declared)
  → Display in UI
```

### **Distribution:**

```
Admin clicks "Test Distribution" → useTestDistributeDailyProfit()
  → dailyProfitService.testDistribute()
  → POST /api/v1/admin/daily-profit/test-distribute
  → Backend distributes to all active stakes
  → Returns summary → Display results
```

---

## ⚠️ Important Notes

1. **30-Day Limit:** Frontend must validate date picker (max 30 days ahead)
2. **Privacy:** Users must NEVER see future dates (backend enforces, but frontend should also filter)
3. **2FA:** All admin operations require 2FA (handled automatically by `adminService`)
4. **Test Endpoint:** Use test distribution endpoint for testing (no need to wait for cron)
5. **Backward Compatibility:** Keep old weekly endpoints during transition period

---

## 🚀 Quick Start

1. **Start with Service Layer:**
   - Create `dailyProfitService.ts`
   - Implement all endpoints
   - Test with Postman/backend

2. **Create React Query Hooks:**
   - Add hooks to `queries.ts`
   - Test hooks in isolation

3. **Update User Components:**
   - Start with `TodayROSCard.tsx`
   - Test with real backend

4. **Create Admin Components:**
   - Start with calendar view
   - Add declare modal
   - Test full flow

5. **Integration Testing:**
   - Test complete flow
   - Verify all features work
   - Check error handling

---

## 📞 Questions & Support

**Backend Documentation:**

- `FRONTEND_DAILY_PROFIT_INTEGRATION_GUIDE.md` - Complete guide
- `FRONTEND_DAILY_PROFIT_QUICK_REFERENCE.md` - Quick reference
- `DAILY_PROFIT_IMPLEMENTATION_COMPLETE.md` - Backend implementation

**If Issues:**

- Check error responses for detailed error codes
- Review backend documentation
- Contact backend team for API questions

---

**Status:** 📋 **READY TO START IMPLEMENTATION**

The backend is ready. Frontend can start implementing the daily profit system! 🚀
