# 📋 Daily Profit System - Complete Flow Documentation

**Date:** January 2025  
**Status:** ✅ **FULLY IMPLEMENTED**

---

## 🎯 Overview

This document provides a **complete, detailed flow** of how the Daily Profit system works on the frontend, covering:

- Admin dashboard interactions
- User dashboard display
- Data flow through the system
- API calls and endpoints
- 2FA handling
- Cron job impact
- Error handling
- State management

---

## 📍 Table of Contents

1. [Admin Dashboard Flow](#admin-dashboard-flow)
2. [User Dashboard Flow](#user-dashboard-flow)
3. [Data Flow Architecture](#data-flow-architecture)
4. [API Endpoints & Calls](#api-endpoints--calls)
5. [2FA Handling](#2fa-handling)
6. [Cron Job Integration](#cron-job-integration)
7. [Error Handling](#error-handling)
8. [State Management](#state-management)
9. [UI Components](#ui-components)
10. [Complete User Journey](#complete-user-journey)

---

## 🎛️ Admin Dashboard Flow

### **Location: `/admin/daily-profit`**

### **1. Page Layout**

The admin daily profit page (`src/app/(admin)/admin/daily-profit/page.tsx`) consists of:

```
┌─────────────────────────────────────────────────┐
│  Daily Profit Management                         │
│  (Header with title and description)              │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────┬──────────────────┐   │
│  │  Calendar View        │  Distribution     │   │
│  │  (30-day lookahead)   │  Status          │   │
│  │  (2 columns)          │  (1 column)      │   │
│  └──────────────────────┴──────────────────┘   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │  Declared Profits List                    │   │
│  │  (Filterable list view)                    │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### **2. Calendar View Component**

**File:** `src/components/admin/dailyProfit/DailyProfitCalendar.tsx`

#### **Initial Load:**

1. **Component Mounts:**

   ```typescript
   // Calculate date range (today to +30 days)
   const today = startOfToday();
   const endDate = addDays(today, 30);
   ```

2. **Fetch Declared Profits:**

   ```typescript
   const { data, isLoading } = useDeclaredDailyProfits({
     startDate: format(today, 'yyyy-MM-dd'),
     endDate: format(endDate, 'yyyy-MM-dd'),
   });
   ```

   - **API Call:** `GET /api/v1/admin/daily-profit/declared?startDate=2025-01-15&endDate=2025-02-14&twoFACode=123456`
   - **Hook:** `useDeclaredDailyProfits()` from `src/lib/queries.ts`
   - **Service:** `dailyProfitService.getDeclaredProfits()`

3. **Create Profit Map:**

   ```typescript
   const profitMap = new Map<string, DailyProfit>();
   declaredProfits.forEach((profit) => {
     profitMap.set(profit.date, profit);
   });
   ```

4. **Generate Calendar Days:**
   ```typescript
   const days = Array.from({ length: 30 }, (_, i) => {
     const date = addDays(today, i);
     const dateStr = format(date, 'yyyy-MM-dd');
     const profit = profitMap.get(dateStr);

     return {
       date,
       dateStr,
       profit,
       isToday: isToday(date),
       isPast: isPast(date) && !isToday(date),
     };
   });
   ```

#### **Calendar Display:**

Each day in the calendar shows:

- **Date Number** (e.g., "15")
- **Profit Percentage** (if declared, e.g., "1.5%")
- **Status Badge:**
  - 🟢 **Green "Distributed"** - Profit has been distributed
  - 🟡 **Yellow "Pending"** - Declared but not yet distributed
  - ⚪ **"Not Declared"** - No profit declared for this date
- **Color Coding:**
  - **Blue border** - Today
  - **Green background** - Distributed
  - **Yellow background** - Pending
  - **White/Gray** - Not declared
  - **Gray (disabled)** - Past dates

#### **User Interactions:**

**A. Click on a Date:**

1. **User clicks a date** (not past)
2. **Handler executes:**

   ```typescript
   const handleDateClick = (dateStr: string) => {
     const profit = profitMap.get(dateStr);
     if (profit && !profit.isDistributed) {
       // Edit existing profit
       setEditingDate(dateStr);
       setDeclareModalOpen(true);
     } else {
       // Declare new profit
       setEditingDate(null);
       setDeclareModalOpen(true);
     }
   };
   ```

3. **Modal Opens:**
   - If profit exists → **Edit mode** (pre-filled form)
   - If no profit → **Declare mode** (empty form)

**B. Click "Declare Profit" Button:**

1. Opens modal with **today's date** pre-selected
2. User can change date (up to 30 days ahead)

**C. Click "Bulk Declare" Button:**

1. Opens bulk declaration modal
2. User selects date range
3. Sets profit percentage for all dates in range

### **3. Declare Profit Modal**

**File:** `src/components/admin/dailyProfit/DeclareProfitModal.tsx`

#### **Form Fields:**

1. **Date Input:**
   - Type: HTML5 date picker
   - Min: Today
   - Max: Today + 30 days
   - Validation: Cannot be past, cannot be > 30 days

2. **Profit Percentage:**
   - Type: Number input
   - Range: 0-100
   - Step: 0.01
   - Example: "1.5" for 1.5%

3. **Description (Optional):**
   - Type: Textarea
   - Examples: "Normal day", "Special event", "Holiday"

#### **Submit Flow:**

1. **User fills form and clicks "Declare Profit"**

2. **Frontend Validation:**

   ```typescript
   const validateDate = (dateStr: string): boolean => {
     const date = new Date(dateStr);
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const maxDate = new Date(today);
     maxDate.setDate(maxDate.getDate() + 30);

     if (date < today) {
       toast.error('Cannot declare profit for past dates');
       return false;
     }
     if (date > maxDate) {
       toast.error('Cannot declare profit more than 30 days in advance');
       return false;
     }
     return true;
   };
   ```

3. **2FA Prompt:**

   ```typescript
   const twoFACode = await promptFor2FA();
   if (!twoFACode) {
     toast.error('2FA code is required');
     return;
   }
   ```

   - Uses `use2FA()` context
   - Shows modal to enter 2FA code
   - Code cached for 85 seconds

4. **API Call (New Declaration):**

   ```typescript
   await declareMutation.mutateAsync({
     date: data.date, // "2025-01-15"
     profitPercentage: data.profitPercentage, // 1.5
     description: data.description, // "Normal day"
     twoFACode, // "123456"
   });
   ```

   - **Endpoint:** `POST /api/v1/admin/daily-profit/declare`
   - **Request Body:**
     ```json
     {
       "date": "2025-01-15",
       "profitPercentage": 1.5,
       "description": "Normal day",
       "twoFACode": "123456"
     }
     ```
   - **Service:** `dailyProfitService.declareProfit()`
   - **Mutation:** `useDeclareDailyProfit()` from `src/lib/mutations.ts`

5. **API Call (Update Existing):**

   ```typescript
   await updateMutation.mutateAsync({
     date: editingProfit.date,
     data: {
       profitPercentage: data.profitPercentage,
       description: data.description,
       twoFACode,
     },
   });
   ```

   - **Endpoint:** `PATCH /api/v1/admin/daily-profit/2025-01-15`
   - **Request Body:**
     ```json
     {
       "profitPercentage": 2.0,
       "description": "Updated description",
       "twoFACode": "123456"
     }
     ```
   - **Service:** `dailyProfitService.updateProfit()`
   - **Mutation:** `useUpdateDailyProfit()`

6. **Success Handling:**
   - Toast notification: "Profit declared successfully"
   - Modal closes
   - Calendar refetches data (React Query cache invalidation)
   - Calendar updates to show new profit

7. **Error Handling:**
   - Shows error toast with message
   - Modal stays open
   - User can retry

### **4. Bulk Declare Modal**

**File:** `src/components/admin/dailyProfit/BulkDeclareModal.tsx`

#### **Form Fields:**

1. **Start Date:**
   - Type: HTML5 date picker
   - Min: Today
   - Max: Today + 30 days

2. **End Date:**
   - Type: HTML5 date picker
   - Min: Start date
   - Max: Today + 30 days

3. **Profit Percentage:**
   - Type: Number input
   - Range: 0-100
   - Applied to all dates in range

#### **Submit Flow:**

1. **User selects date range and percentage**

2. **Frontend Validation:**
   - Start date not in past
   - End date not > 30 days ahead
   - End date >= start date
   - Percentage 0-100

3. **2FA Prompt:**
   - Same as single declaration

4. **API Call:**

   ```typescript
   await bulkDeclareMutation.mutateAsync({
     startDate: data.startDate,
     endDate: data.endDate,
     profitPercentage: data.profitPercentage,
     twoFACode,
   });
   ```

   - **Endpoint:** `POST /api/v1/admin/daily-profit/declare-bulk`
   - **Request Body:**
     ```json
     {
       "startDate": "2025-01-15",
       "endDate": "2025-01-20",
       "profitPercentage": 1.5,
       "twoFACode": "123456"
     }
     ```
   - **Service:** `dailyProfitService.declareBulkProfit()`
   - **Mutation:** `useDeclareBulkDailyProfit()`

5. **Success Handling:**
   - Toast: "Bulk profit declared successfully"
   - Modal closes
   - Calendar refetches and shows all new profits

### **5. Declared Profits List**

**File:** `src/components/admin/dailyProfit/DeclaredProfitsList.tsx`

#### **Features:**

1. **Filterable List:**
   - Filter by date range
   - Filter by distribution status (all/distributed/pending)

2. **Display Columns:**
   - Date
   - Profit Percentage
   - Description
   - Distribution Status
   - Actions (Edit/Delete)

3. **Actions:**
   - **Edit:** Opens `DeclareProfitModal` in edit mode
   - **Delete:** Deletes future profit (only if not distributed)

#### **Delete Flow:**

1. **User clicks "Delete" button**

2. **Confirmation:**
   - Shows confirmation dialog
   - Only allowed for future, non-distributed profits

3. **2FA Prompt:**
   - Same as declaration

4. **API Call:**

   ```typescript
   await deleteMutation.mutateAsync({
     date: profit.date,
     twoFACode,
   });
   ```

   - **Endpoint:** `DELETE /api/v1/admin/daily-profit/2025-01-15`
   - **Request Body:**
     ```json
     {
       "twoFACode": "123456"
     }
     ```
   - **Service:** `dailyProfitService.deleteProfit()`
   - **Mutation:** `useDeleteDailyProfit()`

5. **Success:**
   - Toast: "Profit deleted successfully"
   - List refetches
   - Calendar updates

### **6. Distribution Status Component**

**File:** `src/components/admin/dailyProfit/DistributionStatus.tsx`

#### **Features:**

1. **Shows Today's Distribution Status:**
   - Whether today's profit has been distributed
   - Distribution timestamp (if distributed)

2. **Test Distribution Button:**
   - Manual trigger for distribution
   - Useful for testing without waiting for cron job

#### **Test Distribution Flow:**

1. **User clicks "Test Distribution" button**

2. **2FA Prompt:**
   - Same as declaration

3. **API Call:**

   ```typescript
   await testDistributeMutation.mutateAsync({
     date: today,
     twoFACode,
   });
   ```

   - **Endpoint:** `POST /api/v1/admin/daily-profit/test-distribute`
   - **Request Body:**
     ```json
     {
       "date": "2025-01-15",
       "twoFACode": "123456"
     }
     ```
   - **Service:** `dailyProfitService.testDistribute()`
   - **Mutation:** `useTestDistributeDailyProfit()`

4. **Response Display:**
   - Shows distribution results:
     - Total stakes processed
     - Total amount distributed
     - Success/failure status

5. **Success:**
   - Toast: "Distribution completed successfully"
   - Status updates to "Distributed"
   - Calendar updates

---

## 👤 User Dashboard Flow

### **Location: User Dashboard (Main Dashboard)**

### **1. Today's Profit Card**

**File:** `src/components/dashboard/TodayROSCard.tsx`

#### **Component Mount:**

1. **Component Renders:**

   ```typescript
   const { data, isLoading, error, refetch } = useTodayProfit();
   ```

2. **API Call:**
   - **Endpoint:** `GET /api/v1/daily-profit/today`
   - **Headers:**
     ```json
     {
       "Authorization": "Bearer <userToken>"
     }
     ```
   - **Hook:** `useTodayProfit()` from `src/lib/queries.ts`
   - **Service:** `dailyProfitService.getTodayProfit()`
   - **Query Key:** `['daily-profit', 'today']`
   - **Stale Time:** 5 minutes
   - **Refetch Interval:** 5 minutes (auto-refresh)

#### **Data Flow:**

1. **Request Sent:**

   ```
   GET /api/v1/daily-profit/today
   Authorization: Bearer <userToken>
   ```

2. **Backend Response (Success):**

   ```json
   {
     "success": true,
     "data": {
       "date": "2025-01-15",
       "profitPercentage": 1.5,
       "isDistributed": false,
       "distributedAt": null
     }
   }
   ```

3. **Backend Response (No Profit - 404):**

   ```json
   {
     "success": false,
     "error": {
       "code": "NOT_FOUND",
       "message": "No profit declared for today"
     }
   }
   ```

4. **Frontend Handling:**
   ```typescript
   try {
     const response = await axios.get('/api/v1/daily-profit/today');
     return response.data;
   } catch (error) {
     if (axios.isAxiosError(error) && error.response?.status === 404) {
       throw new Error('No profit declared for today');
     }
     throw error;
   }
   ```

#### **Display States:**

**A. Loading State:**

- Shows shimmer/skeleton loader
- `<ShimmerCard />` component

**B. Error State (404 - No Profit):**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Today's Profit</CardTitle>
    <CardDescription>No profit declared</CardDescription>
  </CardHeader>
  <CardContent>
    <p>No profit has been declared for today. Please check back later.</p>
  </CardContent>
</Card>
```

**C. Error State (Other Errors):**

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-red-600">Error Loading Profit</CardTitle>
    <CardDescription>{error.message}</CardDescription>
  </CardHeader>
  <CardContent>
    <button onClick={() => refetch()}>Try again</button>
  </CardContent>
</Card>
```

**D. Success State (Profit Available):**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Today's Profit</CardTitle>
    <CardDescription>{displayDate}</CardDescription>
    <Badge>{isDistributed ? 'Distributed' : 'Pending'}</Badge>
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold">{profitPercentage.toFixed(2)}%</div>
    <p>
      {isDistributed
        ? 'Profit has been distributed to all active stakes'
        : 'Profit will be distributed at the end of the day'}
    </p>
  </CardContent>
</Card>
```

#### **Display Details:**

- **Profit Percentage:** Large, bold number (e.g., "1.50%")
- **Date:** Formatted as "Monday, Jan 15, 2025"
- **Status Badge:**
  - 🟢 "Distributed" - Profit has been distributed
  - 🟡 "Pending" - Profit will be distributed at end of day
- **Info Message:**
  - If distributed: "Profit has been distributed to all active stakes"
  - If pending: "Profit will be distributed at the end of the day"

#### **Auto-Refresh:**

- **Refetch Interval:** 5 minutes
- **Stale Time:** 5 minutes
- **On Window Focus:** Refetches if data is stale
- **Manual Refresh:** "Try again" button on error

### **2. Daily ROS Performance Component**

**File:** `src/components/dashboard/DailyROSPerformance.tsx`

#### **Component Mount:**

1. **Fetches Today's Profit:**

   ```typescript
   const { data: todayProfit } = useTodayProfit();
   ```

2. **Uses Today's Profit for Display:**
   - Shows today's profit percentage
   - Shows today's date
   - Shows distribution status

3. **Historical Data (Future Enhancement):**
   - Currently uses `rosApi.getDailyEarnings()` for historical data
   - Will be migrated to `useProfitHistory()` in future

#### **Display:**

- **Today's Profit:** From `useTodayProfit()`
- **Historical Chart:** From old ROS API (to be migrated)
- **Performance Metrics:** Calculated from historical data

---

## 🔄 Data Flow Architecture

### **Complete Data Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
│                  /admin/daily-profit                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   DailyProfitCalendar Component      │
        │   - useDeclaredDailyProfits()         │
        │   - React Query Hook                  │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   dailyProfitService.getDeclaredProfits() │
        │   - createAdminApi()                  │
        │   - Adds 2FA code to query params     │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   GET /api/v1/admin/daily-profit/     │
        │        declared?startDate=...         │
        │        &endDate=...&twoFACode=123456  │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Backend API                         │
        │   - Validates 2FA                     │
        │   - Returns declared profits          │
        │   - Includes future dates (admin view)│
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   React Query Cache                  │
        │   - Stores response                  │
        │   - Key: ['admin', 'daily-profit',   │
        │           'declared', filters]      │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Calendar Updates                    │
        │   - Maps profits to dates            │
        │   - Color codes days                 │
        │   - Shows badges                     │
        └───────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    USER DASHBOARD                          │
│                  /dashboard (main)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   TodayROSCard Component             │
        │   - useTodayProfit()                 │
        │   - React Query Hook                 │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   dailyProfitService.getTodayProfit() │
        │   - Uses axios directly              │
        │   - Adds user token to headers       │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   GET /api/v1/daily-profit/today     │
        │   Authorization: Bearer <userToken>   │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Backend API                         │
        │   - Validates user token              │
        │   - Returns ONLY today's profit       │
        │   - NEVER returns future dates        │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   React Query Cache                  │
        │   - Stores response                  │
        │   - Key: ['daily-profit', 'today']    │
        │   - Auto-refresh every 5 minutes    │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   Card Updates                        │
        │   - Shows profit percentage           │
        │   - Shows date                        │
        │   - Shows distribution status         │
        └───────────────────────────────────────┘
```

### **Declaration Flow:**

```
Admin clicks "Declare Profit"
         │
         ▼
DeclareProfitModal opens
         │
         ▼
User fills form (date, percentage, description)
         │
         ▼
User clicks "Declare Profit"
         │
         ▼
Frontend validation (date, percentage)
         │
         ▼
2FA prompt (if admin has 2FA enabled)
         │
         ▼
POST /api/v1/admin/daily-profit/declare
Body: { date, profitPercentage, description, twoFACode }
         │
         ▼
Backend validates & saves
         │
         ▼
Success response
         │
         ▼
React Query cache invalidation
         │
         ▼
Calendar refetches & updates
         │
         ▼
Toast notification: "Profit declared successfully"
```

---

## 🔌 API Endpoints & Calls

### **Admin Endpoints:**

| Endpoint                              | Method | Purpose                  | 2FA Location | Frontend Hook                    |
| ------------------------------------- | ------ | ------------------------ | ------------ | -------------------------------- |
| `/admin/daily-profit/declare`         | POST   | Declare single day       | Request body | `useDeclareDailyProfit()`        |
| `/admin/daily-profit/declare-bulk`    | POST   | Declare multiple days    | Request body | `useDeclareBulkDailyProfit()`    |
| `/admin/daily-profit/declared`        | GET    | Get all declared profits | Query params | `useDeclaredDailyProfits()`      |
| `/admin/daily-profit/:date`           | PATCH  | Update future profit     | Request body | `useUpdateDailyProfit()`         |
| `/admin/daily-profit/:date`           | DELETE | Delete future profit     | Request body | `useDeleteDailyProfit()`         |
| `/admin/daily-profit/test-distribute` | POST   | Test distribution        | Request body | `useTestDistributeDailyProfit()` |

### **User Endpoints:**

| Endpoint                | Method | Purpose            | Auth         | Frontend Hook        |
| ----------------------- | ------ | ------------------ | ------------ | -------------------- |
| `/daily-profit/today`   | GET    | Get today's profit | Bearer token | `useTodayProfit()`   |
| `/daily-profit/history` | GET    | Get profit history | Bearer token | `useProfitHistory()` |

### **Request Examples:**

**Admin - Declare Profit:**

```typescript
POST /api/v1/admin/daily-profit/declare
Headers: {
  Authorization: "Bearer <adminToken>",
  Content-Type: "application/json"
}
Body: {
  "date": "2025-01-15",
  "profitPercentage": 1.5,
  "description": "Normal day",
  "twoFACode": "123456"
}
```

**Admin - Get Declared Profits:**

```typescript
GET /api/v1/admin/daily-profit/declared?startDate=2025-01-15&endDate=2025-02-14&twoFACode=123456
Headers: {
  Authorization: "Bearer <adminToken>"
}
```

**User - Get Today's Profit:**

```typescript
GET / api / v1 / daily - profit / today;
Headers: {
  Authorization: 'Bearer <userToken>';
}
```

---

## 🔐 2FA Handling

### **How 2FA Works:**

1. **Admin Layout Initialization:**

   ```typescript
   // src/app/(admin)/admin/layout.tsx
   useEffect(() => {
     dailyProfitService.set2FACodeGetter(get2FACode);
   }, [promptFor2FA]);
   ```

2. **2FA Code Getter:**
   - Uses `TwoFAContext` (`use2FA()`)
   - Shows modal to enter 2FA code
   - Returns code or null

3. **Code Caching:**
   - Codes cached for **85 seconds**
   - Reduces repeated prompts
   - Cache cleared on `2FA_CODE_INVALID` error

4. **Request Interceptor:**

   ```typescript
   // In createAdminApi (adminService.ts)
   requestInterceptor: (config) => {
     const is2FAEnabled = adminAuthService.getCurrentAdmin()?.twoFAEnabled;

     if (is2FAEnabled) {
       const cachedCode = getCached2FA();
       if (cachedCode) {
         // Use cached code
         if (config.method === 'get') {
           config.params = { ...config.params, twoFACode: cachedCode };
         } else {
           config.data = { ...config.data, twoFACode: cachedCode };
         }
       } else {
         // Prompt for new code
         const code = await get2FACode();
         if (code) {
           setCached2FA(code, 85); // Cache for 85 seconds
           // Add to request
         }
       }
     }
   };
   ```

5. **Error Handling:**
   - `2FA_CODE_REQUIRED` → Prompts for code
   - `2FA_CODE_INVALID` → Clears cache, shows error, prompts again
   - `2FA_MANDATORY` → Redirects to 2FA setup

---

## ⏰ Cron Job Integration

### **Backend Cron Job:**

- **Schedule:** Runs daily at **23:59:59** (end of day)
- **Action:** Distributes today's profit to all active stakes
- **Updates:** Sets `isDistributed: true` and `distributedAt: timestamp`

### **Frontend Display:**

1. **Calendar View:**
   - Shows "Distributed" badge (green) after cron runs
   - Shows "Pending" badge (yellow) before cron runs

2. **Today's Profit Card:**
   - Shows "Distributed" badge if `isDistributed: true`
   - Shows "Pending" badge if `isDistributed: false`

3. **Auto-Refresh:**
   - User dashboard auto-refreshes every 5 minutes
   - Admin calendar refetches when opened

4. **Test Distribution:**
   - Admin can manually trigger distribution
   - Useful for testing without waiting for cron

---

## ⚠️ Error Handling

### **Error Scenarios:**

1. **No Profit Declared (404):**
   - **User View:** Shows "No profit declared" message
   - **Admin View:** Shows "Not Declared" badge

2. **2FA Required (403):**
   - Automatically prompts for 2FA code
   - Retries request with code

3. **Invalid 2FA (403):**
   - Clears 2FA cache
   - Shows error toast
   - Prompts for new code

4. **Validation Error (400):**
   - Shows validation messages
   - Highlights invalid fields

5. **Network Error:**
   - Shows error message
   - Provides "Try again" button

6. **Unauthorized (401):**
   - Redirects to login
   - Clears auth tokens

---

## 📦 State Management

### **React Query Cache:**

**Query Keys:**

```typescript
{
  // Admin queries
  adminDailyProfits: (filters) => ['admin', 'daily-profit', 'declared', filters],

  // User queries
  todayProfit: ['daily-profit', 'today'],
  profitHistory: (limit, offset) => ['daily-profit', 'history', limit, offset],
}
```

**Cache Invalidation:**

- On successful declaration → Invalidates `adminDailyProfits`
- On successful update → Invalidates `adminDailyProfits` and `todayProfit`
- On successful delete → Invalidates `adminDailyProfits`
- On successful distribution → Invalidates `adminDailyProfits` and `todayProfit`

**Stale Time:**

- Admin queries: 1 minute
- User queries: 5 minutes

**Refetch:**

- Admin: Manual refetch on actions
- User: Auto-refetch every 5 minutes

---

## 🎨 UI Components

### **Admin Components:**

1. **DailyProfitCalendar:**
   - 30-day calendar grid
   - Color-coded days
   - Status badges
   - Click to declare/edit

2. **DeclareProfitModal:**
   - Date picker
   - Percentage input
   - Description textarea
   - 2FA prompt

3. **BulkDeclareModal:**
   - Date range picker
   - Percentage input
   - 2FA prompt

4. **DeclaredProfitsList:**
   - Filterable table
   - Edit/Delete actions
   - Distribution status

5. **DistributionStatus:**
   - Today's status
   - Test distribution button
   - Distribution results

### **User Components:**

1. **TodayROSCard:**
   - Large profit percentage
   - Date display
   - Status badge
   - Info message

2. **DailyROSPerformance:**
   - Today's profit
   - Historical chart
   - Performance metrics

---

## 🚀 Complete User Journey

### **Admin Journey:**

1. **Login to Admin Dashboard**
   - Navigate to `/admin/login`
   - Enter credentials
   - Enter 2FA code (if enabled)
   - Redirected to `/admin/overview`

2. **Navigate to Daily Profit**
   - Click "Daily Profit" in sidebar
   - Or navigate to `/admin/daily-profit`

3. **View Calendar**
   - See 30-day calendar
   - See declared profits (green/yellow badges)
   - See undeclared dates (white)

4. **Declare Profit for Today**
   - Click today's date (or "Declare Profit" button)
   - Modal opens
   - Date pre-filled (today)
   - Enter percentage (e.g., 1.5)
   - Enter description (optional)
   - Click "Declare Profit"
   - Enter 2FA code
   - Success! Calendar updates

5. **Declare Profit for Future Date**
   - Click future date (within 30 days)
   - Modal opens
   - Change date if needed
   - Enter percentage
   - Enter description
   - Click "Declare Profit"
   - Enter 2FA code
   - Success! Calendar shows new profit

6. **Bulk Declare**
   - Click "Bulk Declare" button
   - Select start date
   - Select end date
   - Enter percentage
   - Click "Declare"
   - Enter 2FA code
   - Success! All dates in range updated

7. **Edit Profit**
   - Click on declared date
   - Modal opens (pre-filled)
   - Change percentage
   - Click "Update Profit"
   - Enter 2FA code
   - Success! Calendar updates

8. **Delete Profit**
   - Go to "Declared Profits List"
   - Click "Delete" on future profit
   - Confirm deletion
   - Enter 2FA code
   - Success! Profit removed

9. **Test Distribution**
   - Click "Test Distribution" button
   - Enter 2FA code
   - See distribution results
   - Status updates to "Distributed"

10. **Wait for Cron Job**
    - At 23:59:59, cron runs automatically
    - Profit distributed to all active stakes
    - Status updates to "Distributed"
    - Calendar shows green badge

### **User Journey:**

1. **Login to User Dashboard**
   - Navigate to `/login`
   - Enter credentials
   - Redirected to `/dashboard`

2. **View Today's Profit**
   - See "Today's Profit" card
   - Shows profit percentage (e.g., "1.50%")
   - Shows date (e.g., "Monday, Jan 15, 2025")
   - Shows status badge:
     - 🟡 "Pending" - Will be distributed at end of day
     - 🟢 "Distributed" - Already distributed

3. **No Profit Declared**
   - If admin hasn't declared profit:
     - Card shows "No profit declared"
     - Message: "No profit has been declared for today. Please check back later."

4. **Auto-Refresh**
   - Card auto-refreshes every 5 minutes
   - Updates if profit is declared
   - Updates if distribution status changes

5. **After Distribution (End of Day)**
   - At 23:59:59, cron distributes profit
   - Status badge changes to "Distributed"
   - Info message: "Profit has been distributed to all active stakes"
   - User's stake balance increases

---

## 📊 Summary

### **Admin Dashboard:**

- ✅ 30-day calendar view
- ✅ Declare/edit/delete profits
- ✅ Bulk declaration
- ✅ Distribution status
- ✅ Test distribution
- ✅ Filterable list view

### **User Dashboard:**

- ✅ Today's profit card
- ✅ Auto-refresh every 5 minutes
- ✅ Distribution status
- ✅ Error handling (no profit declared)
- ✅ Clean, user-friendly display

### **Data Flow:**

- ✅ React Query for caching
- ✅ Automatic cache invalidation
- ✅ Optimistic updates
- ✅ Error handling

### **Security:**

- ✅ 2FA for all admin operations
- ✅ Code caching (85 seconds)
- ✅ Automatic prompts
- ✅ Error handling

### **Integration:**

- ✅ Cron job support
- ✅ Distribution status display
- ✅ Test distribution available
- ✅ Real-time updates

---

**Everything is working and ready for production!** 🚀
