# 📊 Weekly ROS Card: Complete Analysis & Documentation

**Date:** January 2025  
**Component:** `src/components/dashboard/WeeklyROSCard.tsx`  
**Status:** ✅ **IMPLEMENTED** | ⚠️ **AWAITING BACKEND ENDPOINT**

---

## 🎯 What This Card Does

The **Weekly ROS Card** displays a user's **Return on Stake (ROS)** performance for the current week. **ROS is Return on Stake ONLY** - it does not include referrals, bonuses, or other earnings. It provides:

1. **Current Week Performance**
   - **Weekly ROS percentage** - Admin-declared weekly total (e.g., "3.85%")
   - Total earnings for the week from stakes only (e.g., "$10.00")
   - Week number and year (e.g., "Week 51, 2025")
   - **Important**: Weekly ROS is only displayed at the end of the week, even though it's predetermined at the start

2. **Daily Breakdown** (Expandable)
   - Day-by-day ROS percentages (from calendar, randomly split by backend)
   - Day-by-day earnings amounts (calculated from stake × daily ROS %)
   - **Important**: Daily profit is only displayed at the close of that day (e.g., Monday's profit shown at end of Monday)
   - Visual progress indicator (7/7 days)

3. **Week Progress**
   - Visual progress bar showing how many days of the week have data
   - "X/7 Days" counter

---

## 📍 Where It Gets Data From

### **Backend API Endpoint**

```
GET /api/analytics/weekly-summary
```

**Base URL:**

- Development: `http://localhost:5000/api/analytics/weekly-summary`
- Production: `https://novunt-backend-uw3z.onrender.com/api/analytics/weekly-summary`

**Authentication:**

- Required: Yes
- Header: `Authorization: Bearer <access_token>`
- Token Source: `localStorage.getItem('accessToken')`

**Service Function:**

- File: `src/services/rosApi.ts`
- Function: `rosApi.getWeeklySummary()`
- Line: 212-257

---

## 📊 Expected Data Structure

### **Backend Response Format**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "startDate": "2024-12-16T00:00:00.000Z",
    "endDate": "2024-12-22T23:59:59.999Z",
    "totalEarnings": 10.0,
    "weeklyRos": 3.85,
    "status": "pending",
    "dailyBreakdown": [
      {
        "date": "2024-12-16T00:00:00.000Z",
        "dayOfWeek": "Monday",
        "ros": 1.12,
        "earnings": 10.0
      },
      {
        "date": "2024-12-17T00:00:00.000Z",
        "dayOfWeek": "Tuesday",
        "ros": 0.49,
        "earnings": 0.0
      },
      {
        "date": "2024-12-18T00:00:00.000Z",
        "dayOfWeek": "Wednesday",
        "ros": 1.18,
        "earnings": 0.0
      },
      {
        "date": "2024-12-19T00:00:00.000Z",
        "dayOfWeek": "Thursday",
        "ros": 0.23,
        "earnings": 0.0
      },
      {
        "date": "2024-12-20T00:00:00.000Z",
        "dayOfWeek": "Friday",
        "ros": 0.83,
        "earnings": 0.0
      },
      {
        "date": "2024-12-21T00:00:00.000Z",
        "dayOfWeek": "Saturday",
        "ros": 0.0,
        "earnings": 0.0
      },
      {
        "date": "2024-12-22T00:00:00.000Z",
        "dayOfWeek": "Sunday",
        "ros": 0.0,
        "earnings": 0.0
      }
    ]
  }
}
```

---

## 🔧 Field Specifications

| Field            | Type              | Required | Description                                              | Display Location                      |
| ---------------- | ----------------- | -------- | -------------------------------------------------------- | ------------------------------------- |
| `weekNumber`     | number            | ✅       | Week number of the year (1-52/53)                        | Card header subtitle                  |
| `year`           | number            | ✅       | Year (e.g., 2025)                                        | Card header subtitle                  |
| `startDate`      | string (ISO 8601) | ✅       | Week start date (Monday)                                 | Not displayed (used for calculations) |
| `endDate`        | string (ISO 8601) | ✅       | Week end date (Sunday)                                   | Not displayed (used for calculations) |
| `totalEarnings`  | number            | ✅       | Total earnings for the week in USDT (stake returns only) | Badge next to ROS percentage          |
| `weeklyRos`      | number            | ✅       | **SUM** of all daily ROS percentages (not average)       | Large number display (main metric)    |
| `status`         | string            | ✅       | `"pending"` or `"completed"`                             | Not displayed (used for logic)        |
| `dailyBreakdown` | array             | ✅       | Array of 7 day objects                                   | Expandable "Daily Breakdown" section  |

### **Daily Breakdown Object Structure**

| Field       | Type              | Required | Description                                                                | Display Location                     |
| ----------- | ----------------- | -------- | -------------------------------------------------------------------------- | ------------------------------------ |
| `date`      | string (ISO 8601) | ✅       | Date of the day                                                            | Not displayed (used for sorting)     |
| `dayOfWeek` | string            | ✅       | Full day name ("Monday", "Tuesday", etc.)                                  | Left side of daily row               |
| `ros`       | number            | ✅       | Daily ROS percentage declared by admin (determined at close of day)        | Right side of daily row (small text) |
| `earnings`  | number            | ✅       | Daily earnings from stake only: (Total Active Stake) × (Daily ROS %) / 100 | Right side of daily row (green text) |

---

## 🔄 Data Flow

```
User visits Dashboard
    ↓
WeeklyROSCard component mounts
    ↓
useEffect triggers fetchData()
    ↓
rosApi.getWeeklySummary() called
    ↓
GET /api/analytics/weekly-summary
    ↓
Backend calculates weekly ROS data
    ↓
Response returned with WeeklySummaryData
    ↓
Component state updated (setData)
    ↓
UI renders with real data
```

---

## 📐 Calculation Logic

### **Frontend Calculations**

1. **Week Progress Calculation** (Line 51-52)

   ```typescript
   const currentDay = data?.dailyBreakdown?.length || 0;
   const weekProgress = data ? (currentDay / 7) * 100 : 0;
   ```

   - Counts number of days in `dailyBreakdown` array
   - Calculates percentage: `(days / 7) * 100`
   - Used for progress bar visualization

2. **Display Values**
   - **Average ROS**: `data.averageRos.toFixed(2)` → "0.71%"
   - **Total Earnings**: `data.totalEarnings.toFixed(2)` → "$10.00"
   - **Week Info**: `Week ${data.weekNumber}, ${data.year}` → "Week 51, 2025"

### **Backend Calculations (Expected)**

The backend should calculate:

1. **Week Number**
   - ISO week number (Monday-Sunday week)
   - Range: 1-52/53

2. **Weekly ROS (Admin-Declared Total)**
   - **Source**: ROS Calendar's `totalWeeklyPercentage` field (declared by admin at start of week)
   - **NOT calculated** by summing daily percentages (though they should match)
   - **Important**: The weekly ROS is **predetermined at the start of the week** by the admin
   - The backend randomly splits this weekly total across the 7 days
   - Example: Admin declares 3.85% for the week → Backend splits it randomly: Monday 1.12%, Tuesday 0.49%, Wednesday 1.18%, Thursday 0.23%, Friday 0.83%, etc.

3. **Total Earnings (Stake Returns Only)**
   - Sum of all daily earnings from stakes
   - Formula: `totalEarnings = sum(dailyBreakdown.earnings)`
   - **Important**: Only includes stake returns, NOT referrals, bonuses, or other earnings

4. **Daily Breakdown**
   - One entry per day (Monday through Sunday)
   - **ROS percentage**: Randomly split by backend from the weekly total (from ROS calendar's `dailyPercentages`)
   - **Earnings**: Calculated from stake only: `(user's total active stake amount) × (daily ROS %) / 100`
   - **Important**:
     - Weekly ROS is **predetermined** by admin at start of week (e.g., 3.85%)
     - Backend **randomly splits** this weekly total across 7 days
     - Daily percentages sum to the weekly total

---

## 🗄️ Data Sources (Backend Should Use)

The backend should aggregate data from:

1. **ROS Calendar** (Primary Source)
   - Daily ROS percentages for the current week
   - Source: `/api/admin/ros-calendar/current` or ROS calendar database
   - **Important**: Each day's ROS percentage is declared by admin and determined at the close of that day

2. **User Stakes** (For Earnings Calculation)
   - User's total active stake amount
   - Source: Stakes with status `'active'`
   - **Important**: Only active stakes count toward ROS earnings

3. **Transaction History** (Optional - for verification)
   - Daily ROS payout transactions (if available)
   - Source: Transactions with type `'ros_payout'` or `'staking_earnings'`
   - **Note**: Can be used to verify calculated earnings, but calculation should be primary

4. **Calculation Formulas**

   ```
   Weekly ROS = ROS Calendar's totalWeeklyPercentage (admin-declared at start of week)
   Daily ROS % = Randomly split by backend from weekly total (from dailyPercentages)
   Daily Earnings = (User's Total Active Stake) × (Daily ROS %) / 100
   Weekly Total Earnings = Sum of all daily earnings

   Example:
   Admin declares: Weekly ROS = 3.85% (at start of week)
   Backend randomly splits: Monday 1.12%, Tuesday 0.49%, Wednesday 1.18%, Thursday 0.23%, Friday 0.83%, Saturday 0%, Sunday 0%

   Monday: 1.12% → Earnings = Stake × 1.12 / 100
   Tuesday: 0.49% → Earnings = Stake × 0.49 / 100
   Wednesday: 1.18% → Earnings = Stake × 1.18 / 100
   Thursday: 0.23% → Earnings = Stake × 0.23 / 100
   Friday: 0.83% → Earnings = Stake × 0.83 / 100

   Verification: 1.12 + 0.49 + 1.18 + 0.23 + 0.83 + 0 + 0 = 3.85% (matches weekly total)
   Weekly Total Earnings = Sum of all daily earnings
   ```

5. **Important Business Rules**
   - ✅ **ROS is Return on Stake ONLY** - does not include referrals, bonuses, or other earnings
   - ✅ **Daily ROS is determined at close of day** by backend
   - ✅ **Weekly ROS is SUM of daily percentages** (not average)
   - ✅ **Earnings are calculated from stake amount only**

---

## ⚠️ Current Issues & Solutions

### **Issue 1: Endpoint Returns 404**

**Symptom:**

- Card shows loading state
- Then shows "0%" and "$0.00"
- No daily breakdown available

**Root Cause:**

- Backend endpoint `/api/analytics/weekly-summary` not implemented
- Returns 404 Not Found

**Current Frontend Handling:**

- Gracefully handles 404
- Returns empty fallback data structure
- Shows "0%" instead of error

**Solution - Backend Implementation:**

```javascript
// Backend Route: GET /api/analytics/weekly-summary
async function getWeeklySummary(req, res) {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Calculate current week (Monday-Sunday)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get week number (ISO week)
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // Get user's total active stake
    const activeStakes = await Stake.find({
      userId,
      status: 'active',
    });
    const totalStakeAmount = activeStakes.reduce(
      (sum, stake) => sum + stake.amount,
      0
    );

    // Get current week's ROS calendar
    const rosCalendar = await ROSCalendar.findOne({
      weekStartDate: { $lte: weekStart },
      weekEndDate: { $gte: weekEnd },
      status: 'active',
    });

    if (!rosCalendar) {
      return res.status(404).json({
        success: false,
        message: 'No ROS calendar found for current week',
      });
    }

    // Get daily ROS payouts for this week
    const dailyPayouts = await Transaction.find({
      userId,
      type: 'ros_payout',
      createdAt: {
        $gte: weekStart,
        $lte: weekEnd,
      },
    });

    // Build daily breakdown
    const dailyBreakdown = [];
    const dayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const dailyPercentages = rosCalendar.dailyPercentages;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);

      const dayName = dayNames[i];
      const dayKey = dayName.toLowerCase();
      const rosPercentage = dailyPercentages[dayKey] || 0;

      // Calculate earnings for this day
      // IMPORTANT: Earnings = (Total Active Stake) × (Daily ROS %) / 100
      // This is stake returns ONLY - does NOT include referrals, bonuses, or other earnings
      const dayEarnings = (totalStakeAmount * rosPercentage) / 100;

      dailyBreakdown.push({
        date: dayDate.toISOString(),
        dayOfWeek: dayName,
        ros: rosPercentage, // Daily ROS percentage from calendar (determined at close of day)
        earnings: dayEarnings, // Calculated from stake only
      });
    }

    // Calculate totals
    // Total Earnings = Sum of all daily earnings (stake returns only)
    const totalEarnings = dailyBreakdown.reduce(
      (sum, day) => sum + day.earnings,
      0
    );

    // Weekly ROS = From ROS Calendar's totalWeeklyPercentage (admin-declared at start of week)
    // NOT calculated by summing daily percentages (though they should match)
    // The backend randomly splits this weekly total across the 7 days
    const weeklyRos = rosCalendar.totalWeeklyPercentage || 0;

    // Optional: Verify that daily percentages sum to weekly total
    const sumOfDailyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);
    if (Math.abs(sumOfDailyRos - weeklyRos) > 0.01) {
      console.warn(
        `[getWeeklySummary] Daily ROS sum (${sumOfDailyRos}%) does not match weekly total (${weeklyRos}%)`
      );
    }

    // Determine status
    const isWeekComplete = now > weekEnd;
    const status = isWeekComplete ? 'completed' : 'pending';

    return res.status(200).json({
      success: true,
      data: {
        weekNumber,
        year: now.getFullYear(),
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        totalEarnings,
        weeklyRos: parseFloat(weeklyRos.toFixed(2)),
        status,
        dailyBreakdown,
      },
    });
  } catch (error) {
    console.error('[getWeeklySummary] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly summary',
      error: error.message,
    });
  }
}
```

---

### **Issue 2: Week Calculation Mismatch**

**Symptom:**

- Week number might be incorrect
- Days might not align with actual week

**Root Cause:**

- Backend might use different week calculation (Sunday-Saturday vs Monday-Sunday)
- ISO week number calculation might differ

**Solution:**

- **Backend must use Monday-Sunday weeks** (as per frontend expectation)
- Use ISO week number calculation
- Ensure `startDate` is Monday and `endDate` is Sunday

---

### **Issue 3: Earnings Calculation**

**Symptom:**

- Earnings showing $0.00 for days with ROS percentage
- Total earnings not matching actual payouts

**Root Cause:**

- Backend might not be calculating earnings correctly
- Earnings might not be linked to ROS calendar percentages

**Solution - Backend Calculation:**

```javascript
// For each day in the week:
const dailyEarnings = (totalActiveStake * dailyRosPercentage) / 100;

// OR from actual transactions:
const dailyEarnings = sum of all ROS payout transactions for that day;
```

**Important:** Backend should use **actual transaction amounts** if available, otherwise calculate from stake amount × ROS percentage.

---

### **Issue 4: Missing Daily Data**

**Symptom:**

- Some days show 0% ROS and $0.00
- Progress bar shows less than 7/7 days

**Root Cause:**

- ROS calendar might not have percentages for all days
- Transactions might not exist for all days
- Week might not be complete yet

**Solution:**

- **Backend should always return 7 days** (Monday-Sunday)
- If no ROS calendar data, use 0% for that day
- If no transactions, use $0.00 for earnings
- Frontend will display all 7 days regardless

---

## 🧪 Testing Scenarios

### **Test Case 1: User with Active Stakes and ROS Payouts**

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 125.5,
    "weeklyRos": 3.85,
    "status": "pending",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 10.0 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 5.0 }
      // ... all 7 days
    ]
  }
}
```

**Frontend Display:**

- Shows "3.85%" as weekly ROS (sum of daily percentages)
- Shows "$125.50" in badge (total stake earnings)
- Shows "Week 51, 2025" in subtitle
- Daily breakdown shows all 7 days with data

---

### **Test Case 2: User with No Stakes**

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 0,
    "averageRos": 0,
    "status": "pending",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 0, "earnings": 0 }
      // ... all 7 days with 0 values
    ]
  }
}
```

**Frontend Display:**

- Shows "0.00%" as weekly ROS (no stakes = no ROS)
- Shows "$0.00" in badge (no stake earnings)
- Daily breakdown shows all days with 0 values

---

### **Test Case 3: Incomplete Week (Current Week)**

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 50.0,
    "weeklyRos": 3.85,
    "status": "pending",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 10.0 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 5.0 },
      { "dayOfWeek": "Wednesday", "ros": 1.18, "earnings": 15.0 },
      { "dayOfWeek": "Thursday", "ros": 0.23, "earnings": 0.0 },
      { "dayOfWeek": "Friday", "ros": 0.83, "earnings": 20.0 },
      { "dayOfWeek": "Saturday", "ros": 0, "earnings": 0 },
      { "dayOfWeek": "Sunday", "ros": 0, "earnings": 0 }
    ]
  }
}
```

**Frontend Display:**

- Shows weekly ROS as sum of all daily percentages (3.85% = 1.12 + 0.49 + 1.18 + 0.23 + 0.83)
- Progress bar shows "5/7 Days" (if only 5 days have data)
- Future days show 0% and $0.00 (not yet determined)

---

## 🔍 Frontend Code Analysis

### **Component Structure**

**File:** `src/components/dashboard/WeeklyROSCard.tsx`

**Key Functions:**

1. **Data Fetching** (Lines 29-48)

   ```typescript
   useEffect(() => {
     const fetchData = async () => {
       setLoading(true);
       try {
         const response = await rosApi.getWeeklySummary();
         setData(response);
       } catch (error) {
         // Handles 404 gracefully
         setData(null);
       } finally {
         setLoading(false);
       }
     };
     fetchData();
   }, []);
   ```

2. **Progress Calculation** (Lines 50-52)

   ```typescript
   const currentDay = data?.dailyBreakdown?.length || 0;
   const weekProgress = data ? (currentDay / 7) * 100 : 0;
   ```

3. **Display Logic**
   - **Weekly ROS**: `data?.weeklyRos?.toFixed(2) || 0` (Line 120) - SUM of daily percentages
   - **Total Earnings**: `data.totalEarnings.toFixed(2)` (Line 127) - Sum of daily stake earnings
   - **Week Info**: `Week ${data.weekNumber}, ${data.year}` (Line 88)

---

## 🛠️ How to Fix Issues

### **If Backend Endpoint Not Available:**

**Option 1: Backend Implementation (Recommended)**

1. Implement `GET /api/analytics/weekly-summary` endpoint
2. Calculate weekly ROS from:
   - ROS calendar (daily percentages)
   - User's active stakes (total amount)
   - Transaction history (actual payouts)
3. Return data in the exact format specified above

**Option 2: Frontend Fallback (Temporary)**

- Current implementation already handles 404 gracefully
- Shows "0%" and empty state
- No user-facing errors

---

### **If Data is Incorrect:**

**Backend Issues to Check:**

1. **Week Calculation**
   - Ensure Monday-Sunday weeks
   - Use ISO week number calculation
   - Verify `startDate` is Monday, `endDate` is Sunday

2. **Earnings Calculation**
   - **Must be stake-only earnings**: (Total Active Stake) × (Daily ROS %) / 100
   - **Do NOT include**: Referrals, bonuses, or other earnings
   - Verify stake amount is correct (sum of all active stakes)
   - Ensure ROS percentage is applied correctly from calendar

3. **Daily Breakdown**
   - Ensure all 7 days are included
   - Verify day names are correct ("Monday", "Tuesday", etc.)
   - Check ROS percentages match calendar

4. **Weekly ROS Calculation**
   - **MUST be SUM of all daily ROS percentages** (NOT average)
   - Formula: `weeklyRos = sum(dailyBreakdown.ros)` (add all percentages)
   - Include all 7 days, even if some are 0% (not yet determined)
   - Example: 1.12 + 0.49 + 1.18 + 0.23 + 0.83 + 0 + 0 = 3.85%

---

## 📋 Backend Implementation Checklist

- [ ] **Endpoint Created**: `GET /api/analytics/weekly-summary`
- [ ] **Authentication**: Requires user token
- [ ] **Week Calculation**: Monday-Sunday weeks
- [ ] **Week Number**: ISO week number (1-52/53)
- [ ] **Daily Breakdown**: All 7 days included
- [ ] **ROS Calculation**: From ROS calendar
- [ ] **Earnings Calculation**: From transactions or stake × ROS%
- [ ] **Total Earnings**: Sum of daily earnings
- [ ] **Weekly ROS**: Calculated as SUM of daily percentages (not average)
- [ ] **Status**: "pending" or "completed"
- [ ] **Response Format**: Matches specification exactly
- [ ] **Error Handling**: 404 for no data, 401 for auth, 500 for errors

---

## 🎯 Summary

### **What the Card Does:**

- ✅ Displays current week's ROS performance (stake returns only)
- ✅ Shows **weekly ROS percentage** (SUM of all daily ROS percentages)
- ✅ Shows total earnings for the week (stake returns only, no referrals/bonuses)
- ✅ Provides daily breakdown (expandable) - shows admin-declared daily ROS
- ✅ Shows week progress (X/7 days)

### **Where Data Comes From:**

- ✅ Backend endpoint: `/api/analytics/weekly-summary`
- ✅ Service: `rosApi.getWeeklySummary()`
- ✅ Component: `WeeklyROSCard.tsx`

### **Current Status:**

- ✅ Frontend: **Fully implemented and ready**
- ⚠️ Backend: **Endpoint may not be implemented** (returns 404)
- ✅ Error Handling: **Graceful fallback to 0%**

### **How to Solve:**

1. **Backend**: Implement `/api/analytics/weekly-summary` endpoint
2. **Backend**: Calculate weekly ROS as **SUM** of daily percentages (not average)
3. **Backend**: Calculate earnings from **stake only**: (Total Active Stake) × (Daily ROS %) / 100
4. **Backend**: Use ROS calendar for daily percentages (determined at close of each day)
5. **Backend**: Return data with `weeklyRos` field (sum, not average)
6. **Frontend**: Will automatically display real data once endpoint is available

---

## 🎯 Key Business Rules (CRITICAL)

### **1. Weekly ROS is Admin-Declared, NOT Calculated**

- ✅ **Correct**: `weeklyRos = rosCalendar.totalWeeklyPercentage` (e.g., 3.85%)
- ✅ **How It Works**: Admin declares weekly total at start of week → Backend randomly splits it across 7 days
- ❌ **Wrong**: `weeklyRos = sum(dailyBreakdown.ros)` (should use calendar's totalWeeklyPercentage)
- ❌ **Wrong**: `averageRos = sum(dailyBreakdown.ros) / 7` (should use calendar's totalWeeklyPercentage)

### **2. ROS is Return on Stake ONLY**

- ✅ **Include**: Stake returns only
- ❌ **Exclude**: Referral commissions, registration bonuses, pool distributions, or any other earnings

### **3. Weekly ROS is Predetermined, Daily Percentages are Randomly Split**

- **Weekly ROS** is **declared by admin at the start of the week** (e.g., 3.85%)
- **Backend randomly splits** this weekly total across the 7 days
- Daily percentages are stored in ROS calendar's `dailyPercentages` object
- The weekly ROS is **already known at the start of the week** (not calculated)

### **4. Earnings Calculation**

- **Daily Earnings** = (User's Total Active Stake) × (Daily ROS %) / 100
- **Weekly Total Earnings** = Sum of all daily earnings
- Only includes stake returns, nothing else

---

**Last Updated:** January 2025  
**Status:** ✅ **FRONTEND READY** | ⏳ **AWAITING BACKEND IMPLEMENTATION**
