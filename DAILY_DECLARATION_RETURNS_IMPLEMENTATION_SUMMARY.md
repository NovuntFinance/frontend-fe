# Daily Declaration Returns - Implementation Summary

**Date**: January 2025  
**Status**: 📋 **READY FOR IMPLEMENTATION**

---

## 📋 Overview

This document summarizes the plan to merge the **Pool Declaration** (`/admin/pool`) and **Daily Profit** (`/admin/daily-profit`) pages into a unified **"Daily Declaration Returns"** page (`/admin/daily-declaration-returns`).

---

## 🎯 Goals

1. **Unified Admin Interface**: Single page for declaring pools + ROS for specific dates
2. **Better UX**: Calendar view showing all declarations (pools + ROS) together
3. **Data Consistency**: Pools and ROS declared together for same date
4. **Simplified Workflow**: One action to declare everything for a date

---

## 📚 Documentation

### For Frontend Team

- **`DAILY_DECLARATION_RETURNS_MERGE_PLAN.md`** - Complete merge plan with UI structure
- **`BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md`** - Detailed backend API requirements

### For Backend Team

- **`BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md`** - Complete API specification with examples

---

## 🔄 Current vs. Proposed

### Current State

**Two Separate Pages**:

1. **Pool Declaration** (`/admin/pool`)
   - Declares pools for "now" (not date-specific)
   - Shows qualifier counts
   - Preview distribution
   - Declare pools

2. **Daily Profit** (`/admin/daily-profit`)
   - Declares ROS + pools for specific dates
   - 30-day calendar view
   - List of declared profits
   - Test distribution

### Proposed State

**One Unified Page** (`/admin/daily-declaration-returns`):

- **Qualifier Counts**: Real-time counts (from pool page)
- **Calendar View**: Shows all declarations (pools + ROS) for 30 days
- **Unified Declaration**: Declare pools + ROS for a specific date in one action
- **Preview**: Preview distribution before declaring
- **List View**: All declared dates with status
- **Distribution**: Trigger distribution per date

---

## 🔌 Backend Requirements

### Option 1: New Unified Endpoints (Recommended)

**New Endpoints**:

- `POST /api/v1/admin/daily-declaration-returns/declare` - Declare pools + ROS for date
- `GET /api/v1/admin/daily-declaration-returns/declared` - Get all declarations
- `PATCH /api/v1/admin/daily-declaration-returns/:date` - Update declaration
- `DELETE /api/v1/admin/daily-declaration-returns/:date` - Delete declaration
- `POST /api/v1/admin/daily-declaration-returns/:date/distribute` - Distribute

**Benefits**:

- Clean API design
- Single source of truth
- Better data consistency

### Option 2: Enhance Existing Endpoints (Alternative)

**Enhancements**:

- Add `date` field to pool declaration endpoint
- Add `rosPercentage` field to pool declaration endpoint
- Add `autoDistributePools` to daily profit declaration endpoint

**Benefits**:

- No new endpoints needed
- Backward compatible
- Faster to implement

**See**: `BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md` for complete details

---

## 🎨 Frontend Implementation Plan

### Phase 1: Create New Page Structure ✅

**Files to Create**:

1. `src/app/(admin)/admin/daily-declaration-returns/page.tsx` - Main page
2. `src/components/admin/dailyDeclarationReturns/DailyDeclarationReturnsManager.tsx` - Main manager
3. `src/components/admin/dailyDeclarationReturns/UnifiedDeclarationCalendar.tsx` - Calendar
4. `src/components/admin/dailyDeclarationReturns/DeclareReturnsModal.tsx` - Declaration modal

**Files to Reuse**:

- `QualifierCounts.tsx` (from pool page)
- `PreviewDistribution.tsx` (from pool page)
- `DistributionStatus.tsx` (from daily profit page)

### Phase 2: Create Service Layer

**File**: `src/services/dailyDeclarationReturnsService.ts`

**Methods**:

- `declareReturns()` - Declare pools + ROS for date
- `getDeclaredReturns()` - Get all declarations
- `updateReturns()` - Update declaration
- `deleteReturns()` - Delete declaration
- `distributeReturns()` - Distribute for date

### Phase 3: Create Types

**File**: `src/types/dailyDeclarationReturns.ts`

**Types**:

- `DeclareReturnsRequest`
- `DeclareReturnsResponse`
- `DailyDeclarationReturn`
- `DistributionStatus`

### Phase 4: Create React Query Hooks

**File**: `src/lib/queries.ts` & `src/lib/mutations.ts`

**Hooks**:

- `useDeclaredReturns()` - Query hook
- `useDeclareReturns()` - Mutation hook
- `useUpdateReturns()` - Mutation hook
- `useDeleteReturns()` - Mutation hook
- `useDistributeReturns()` - Mutation hook

### Phase 5: Update Navigation

**File**: `src/components/admin/AdminSidebar.tsx`

**Changes**:

- Replace "Pool Declaration" with "Daily Declaration Returns"
- Replace "Daily Profit" with "Daily Declaration Returns" (or remove if merged)
- Update route: `/admin/daily-declaration-returns`

**File**: `src/app/(admin)/admin/pool/page.tsx` & `src/app/(admin)/admin/daily-profit/page.tsx`

**Changes**:

- Add redirects to new page (or keep as aliases)

---

## 📊 Page Structure

```
┌─────────────────────────────────────────────────────────┐
│  Daily Declaration Returns                               │
│  Declare and manage pools + ROS for specific dates      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Qualifier Counts                                       │
│  [Performance Pool: 150] [Premium Pool: 75] [Refresh]   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Calendar View (30 days)                                 │
│  [Shows all declared dates with status indicators]      │
│  [Click date to declare/edit]                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Declaration Form                                       │
│  Date: [picker]                                         │
│  Performance Pool: [$]                                  │
│  Premium Pool: [$]                                     │
│  ROS %: [0-2.2]                                         │
│  Description: [text]                                    │
│  [Preview] [Declare] [Declare & Distribute]            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Declared Returns List                                  │
│  [Table showing all declared dates]                     │
│  [Edit] [Delete] [Distribute] actions                   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Backend (See Backend Spec)

- [ ] Review API specification
- [ ] Choose Option 1 (new endpoints) or Option 2 (enhance existing)
- [ ] Implement chosen approach
- [ ] Test all endpoints
- [ ] Update API documentation

### Frontend

- [ ] Create new page route
- [ ] Create unified manager component
- [ ] Create unified calendar component
- [ ] Create unified declaration modal
- [ ] Create service layer
- [ ] Create TypeScript types
- [ ] Create React Query hooks
- [ ] Integrate qualifier counts
- [ ] Integrate preview distribution
- [ ] Integrate distribution status
- [ ] Update navigation
- [ ] Add redirects from old routes
- [ ] Test all workflows
- [ ] Update documentation

---

## 🚀 Next Steps

1. **Backend Team**: Review `BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md` and confirm approach
2. **Frontend Team**: Start implementing page structure (can work with existing APIs initially)
3. **Coordination**: Align on API design and data model
4. **Testing**: Test unified workflow end-to-end
5. **Deployment**: Deploy new page, add redirects, monitor

---

## 📞 Questions & Support

**Frontend Questions**: See `DAILY_DECLARATION_RETURNS_MERGE_PLAN.md`  
**Backend Questions**: See `BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md`  
**Coordination**: Frontend & Backend teams should align on API design before full implementation

---

**Status**: 📋 **READY FOR COORDINATION**  
**Priority**: 🔴 **HIGH** - User-facing feature merge
