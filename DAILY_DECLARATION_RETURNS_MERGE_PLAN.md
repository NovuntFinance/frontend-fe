# Daily Declaration Returns - Merge Plan

**Date**: January 2025  
**Status**: 📋 **PLANNING** - Frontend & Backend Coordination Required

---

## 📋 Overview

Merge the **Pool Declaration** page (`/admin/pool`) and **Daily Profit** page (`/admin/daily-profit`) into a single unified **"Daily Declaration Returns"** page (`/admin/daily-declaration-returns`).

This unified page will allow admins to:

1. **Declare pools + ROS for specific dates** (combining both functionalities)
2. **View qualifier counts** (real-time)
3. **Calendar view** showing all declarations (pools + ROS)
4. **Preview and distribute** pools for specific dates
5. **Manage daily returns** (ROS percentages) alongside pool amounts

---

## 🎯 Goals

### Primary Goal

Create a single admin interface that combines:

- **Pool Declaration**: Performance Pool + Premium Pool amounts
- **Daily Profit/ROS**: ROS percentage + pool amounts for specific dates

### Key Benefits

- ✅ **Unified workflow**: Declare pools + ROS in one action per date
- ✅ **Better UX**: Single calendar view showing all declarations
- ✅ **Data consistency**: Pools and ROS declared together for same date
- ✅ **Simplified admin flow**: One page instead of two separate pages

---

## 📊 Current State Analysis

### Pool Declaration Page (`/admin/pool`)

**Purpose**: Declare and distribute Performance Pool + Premium Pool amounts

**Features**:

- Qualifier counts (Performance + Premium pools)
- Pool amount inputs
- Preview distribution
- Declare pools (with optional auto-distribute)
- **Date**: Not date-specific (declares for "now")

**APIs Used**:

- `GET /api/v1/admin/pool/qualifiers` - Get qualifier counts
- `POST /api/v1/admin/pool/preview` - Preview distribution
- `POST /api/v1/admin/pool/declare` - Declare pools
- `POST /api/v1/admin/pool/distribute` - Distribute pools

**Data Structure**:

```typescript
{
  performancePoolAmount: number;
  premiumPoolAmount: number;
  autoDistribute?: boolean;
  notes?: string;
}
```

---

### Daily Profit Page (`/admin/daily-profit`)

**Purpose**: Declare daily profit percentages (ROS) and pool amounts for specific dates

**Features**:

- 30-day calendar view
- Declare ROS percentage + pool amounts per date
- Bulk declare multiple dates
- List of declared profits
- Test distribution
- **Date**: Date-specific (declares for specific dates)

**APIs Used**:

- `GET /api/v1/admin/daily-profit/declared` - Get declared profits
- `POST /api/v1/admin/daily-profit/declare` - Declare single day
- `POST /api/v1/admin/daily-profit/declare-bulk` - Declare multiple days
- `PATCH /api/v1/admin/daily-profit/:date` - Update profit
- `DELETE /api/v1/admin/daily-profit/:date` - Delete profit
- `POST /api/v1/admin/daily-profit/test-distribute` - Test distribution

**Data Structure**:

```typescript
{
  date: string; // YYYY-MM-DD
  premiumPoolAmount: number;
  performancePoolAmount: number;
  rosPercentage: number; // 0-2.2
  description?: string;
}
```

---

## 🔄 Proposed Unified Structure

### New Page: "Daily Declaration Returns" (`/admin/daily-declaration-returns`)

**Combined Features**:

1. **Qualifier Counts Section** (from Pool Declaration)
   - Real-time qualifier counts
   - Breakdown by rank
   - Refresh button

2. **Calendar View** (from Daily Profit, enhanced)
   - 30-day lookahead
   - Shows both pool declarations AND ROS declarations
   - Color coding:
     - **Green**: Fully declared (pools + ROS) and distributed
     - **Yellow**: Declared but not distributed
     - **Blue**: Today
     - **Gray**: Past dates
     - **White**: Not declared

3. **Declaration Modal** (unified)
   - Date selector (future dates only, up to 30 days)
   - **Pool Amounts**:
     - Performance Pool Amount ($)
     - Premium Pool Amount ($)
   - **ROS Percentage** (0-2.2%)
   - Description (optional)
   - **Distribution Options**:
     - Declare only
     - Declare & Distribute pools immediately
     - Declare & Schedule ROS distribution

4. **Preview Section** (from Pool Declaration)
   - Preview distribution before declaring
   - Shows per-qualifier amounts
   - Breakdown by rank

5. **Declared Returns List** (from Daily Profit, enhanced)
   - Shows all declared dates
   - Columns:
     - Date
     - Performance Pool Amount
     - Premium Pool Amount
     - ROS Percentage
     - Total Pool Amount
     - Status (Declared/Distributed)
     - Actions (Edit/Delete/Distribute)

6. **Distribution Status** (from Daily Profit)
   - Test distribution for specific dates
   - Distribution results

---

## 🔌 Backend API Requirements

### New Unified Endpoint (Recommended)

**POST `/api/v1/admin/daily-declaration-returns/declare`**

**Purpose**: Declare pools + ROS for a specific date in one operation

**Request Body**:

```typescript
{
  date: string; // YYYY-MM-DD format
  premiumPoolAmount: number;
  performancePoolAmount: number;
  rosPercentage: number; // 0-2.2
  description?: string;
  autoDistributePools?: boolean; // Distribute pools immediately
  autoDistributeROS?: boolean; // Schedule ROS distribution
  twoFACode?: string;
}
```

**Response**:

```typescript
{
  success: boolean;
  message: string;
  data: {
    declaration: {
      date: string;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      rosPercentage: number;
      description?: string;
      declaredBy: { _id: string; email: string; username: string };
      declaredAt: string;
    };
    poolDistribution?: {
      distributed: boolean;
      distributedAt?: string;
      performancePool?: { distributed: number; totalDistributed: number };
      premiumPool?: { distributed: number; totalDistributed: number };
      totalDistributed?: number;
    };
    rosDistribution?: {
      scheduled: boolean;
      scheduledFor: string; // date
    };
    qualifiers: {
      performancePool: { totalQualifiers: number; byRank: Record<string, number> };
      premiumPool: { totalQualifiers: number; byRank: Record<string, number> };
    };
  };
}
```

---

### Alternative: Keep Separate Endpoints (Simpler)

If backend prefers to keep endpoints separate, frontend can:

1. Call `POST /api/v1/admin/daily-profit/declare` for ROS + pool amounts
2. Call `POST /api/v1/admin/pool/declare` for pool distribution (if auto-distribute)
3. Handle both responses in UI

**Pros**: No backend changes needed  
**Cons**: Two API calls, potential race conditions

---

### Enhanced Get Endpoint

**GET `/api/v1/admin/daily-declaration-returns/declared`**

**Purpose**: Get all declarations (pools + ROS) for date range

**Query Params**:

- `startDate` (optional)
- `endDate` (optional)
- `includeDistributed` (optional, boolean)

**Response**:

```typescript
{
  success: boolean;
  data: {
    declarations: Array<{
      date: string;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      rosPercentage: number;
      description?: string;
      poolsDistributed: boolean;
      poolsDistributedAt?: string;
      rosDistributed: boolean;
      rosDistributedAt?: string;
      declaredBy: { _id: string; email: string; username: string };
      declaredAt: string;
    }>;
    summary: {
      totalDates: number;
      totalPoolAmount: number;
      totalROSDeclared: number;
      distributedDates: number;
    }
  }
}
```

---

## 🎨 Frontend Implementation Plan

### Phase 1: Create New Page Structure

1. Create `/admin/daily-declaration-returns/page.tsx`
2. Create unified component: `DailyDeclarationReturnsManager.tsx`
3. Merge calendar component: `UnifiedDeclarationCalendar.tsx`
4. Create unified declaration modal: `DeclareReturnsModal.tsx`

### Phase 2: Integrate Existing Components

1. Reuse `QualifierCounts` from pool page
2. Reuse `PreviewDistribution` from pool page
3. Enhance `DeclaredProfitsList` to show both pools + ROS
4. Integrate `DistributionStatus` from daily profit page

### Phase 3: Update Services & Types

1. Create `dailyDeclarationReturnsService.ts` (or enhance existing services)
2. Update TypeScript types
3. Create React Query hooks

### Phase 4: Update Navigation

1. Update admin sidebar: Replace "Pool Declaration" and "Daily Profit" with "Daily Declaration Returns"
2. Update routes
3. Add redirects from old routes to new route

---

## 📝 Backend Prompt (Detailed)

See `BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md` for complete backend requirements.

---

## ✅ Success Criteria

- [ ] Single page combines pool declaration + daily profit declaration
- [ ] Calendar shows all declarations (pools + ROS) in one view
- [ ] Can declare pools + ROS for a date in one action
- [ ] Qualifier counts update automatically
- [ ] Preview distribution works before declaring
- [ ] List view shows all declared dates with status
- [ ] Distribution can be triggered per date
- [ ] Old routes redirect to new route
- [ ] No breaking changes to existing APIs (backward compatible)

---

## 🔄 Migration Path

1. **Phase 1**: Create new page alongside existing pages (no breaking changes)
2. **Phase 2**: Update navigation to point to new page
3. **Phase 3**: Add redirects from old routes
4. **Phase 4**: (Optional) Deprecate old pages after testing period

---

**Status**: 📋 Ready for Backend Coordination
