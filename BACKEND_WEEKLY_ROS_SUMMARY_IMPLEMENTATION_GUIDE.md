# Backend Implementation Guide: Weekly ROS Summary Endpoint

**Priority:** 🔴 **HIGH**  
**Status:** ⏳ **AWAITING IMPLEMENTATION**  
**Date:** January 2025  
**Frontend Status:** ✅ **READY - AWAITING BACKEND**

---

## 📋 Executive Summary

The frontend requires a new endpoint `/api/analytics/weekly-summary` that returns a user's weekly Return on Stake (ROS) performance. This endpoint is **critical** for displaying the Weekly ROS card on the user dashboard.

**Current Status:**

- ✅ Frontend is fully implemented and ready
- ⏳ Backend endpoint returns 404 (not implemented)
- ⏳ Frontend gracefully handles 404 but shows "0%" until endpoint is available

---

## 🎯 What This Endpoint Does

Returns the user's **weekly ROS summary** for the current week (Monday-Sunday), including:

- Weekly ROS percentage (admin-declared total)
- Total earnings for the week (stake returns only)
- Daily breakdown (day-by-day ROS and earnings)
- Week information (week number, year, dates)

**Important:** ROS is **Return on Stake ONLY** - does NOT include referrals, bonuses, pool distributions, or any other earnings.

---

## 📍 Endpoint Specification

### **GET `/api/analytics/weekly-summary`**

**Authentication:** Required (Bearer Token from user login)  
**Method:** GET  
**Base URL:** `/api/analytics/weekly-summary` (or `/api/v1/analytics/weekly-summary` if using versioning)

**Headers:**

```
Authorization: Bearer <user_access_token>
Content-Type: application/json
```

---

## 📊 Response Structure

### **Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "startDate": "2024-12-16T00:00:00.000Z",
    "endDate": "2024-12-22T23:59:59.999Z",
    "totalEarnings": 38.5,
    "weeklyRos": 3.85,
    "status": "pending",
    "dailyBreakdown": [
      {
        "date": "2024-12-16T00:00:00.000Z",
        "dayOfWeek": "Monday",
        "ros": 1.12,
        "earnings": 11.2
      },
      {
        "date": "2024-12-17T00:00:00.000Z",
        "dayOfWeek": "Tuesday",
        "ros": 0.49,
        "earnings": 4.9
      },
      {
        "date": "2024-12-18T00:00:00.000Z",
        "dayOfWeek": "Wednesday",
        "ros": 1.18,
        "earnings": 11.8
      },
      {
        "date": "2024-12-19T00:00:00.000Z",
        "dayOfWeek": "Thursday",
        "ros": 0.23,
        "earnings": 2.3
      },
      {
        "date": "2024-12-20T00:00:00.000Z",
        "dayOfWeek": "Friday",
        "ros": 0.83,
        "earnings": 8.3
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
  },
  "meta": {
    "response_time_ms": 45
  }
}
```

---

## 🔧 Field Specifications

| Field            | Type              | Required | Description                                                                                             |
| ---------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `weekNumber`     | number            | ✅       | ISO week number (1-52/53)                                                                               |
| `year`           | number            | ✅       | Year (e.g., 2025)                                                                                       |
| `startDate`      | string (ISO 8601) | ✅       | Week start date (Monday, 00:00:00)                                                                      |
| `endDate`        | string (ISO 8601) | ✅       | Week end date (Sunday, 23:59:59)                                                                        |
| `totalEarnings`  | number            | ✅       | Sum of all daily earnings (stake returns only)                                                          |
| `weeklyRos`      | number            | ✅       | **Admin-declared weekly total** from ROS calendar. **Only displayed at end of week** (0.00 during week) |
| `status`         | string            | ✅       | `"pending"` (week in progress) or `"completed"` (week finished)                                         |
| `dailyBreakdown` | array             | ✅       | Array of day objects. **During week: only completed days. At end: all 7 days.**                         |

### **Daily Breakdown Object:**

| Field       | Type              | Required | Description                                                                                      |
| ----------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `date`      | string (ISO 8601) | ✅       | Date of the day                                                                                  |
| `dayOfWeek` | string            | ✅       | Full day name ("Monday", "Tuesday", etc.)                                                        |
| `ros`       | number            | ✅       | Daily ROS percentage (from calendar, randomly split by backend)                                  |
| `earnings`  | number            | ✅       | Daily earnings: `(Total Active Stake) × (Daily ROS %) / 100`. **Only displayed at close of day** |

---

## 🎯 Critical Business Rules

### **1. Weekly ROS is Admin-Declared, NOT Calculated**

**✅ CORRECT Implementation:**

```javascript
// Get weekly ROS from ROS calendar's totalWeeklyPercentage
const weeklyRos = rosCalendar.totalWeeklyPercentage || 0;
```

**❌ WRONG Implementation:**

```javascript
// ❌ DO NOT calculate by summing daily percentages
const weeklyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);

// ❌ DO NOT calculate as average
const averageRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0) / 7;
```

**How It Works:**

1. **Admin declares** weekly total at start of week (e.g., 3.85%) → stored in `rosCalendar.totalWeeklyPercentage`
2. **Backend randomly splits** this total across 7 days → stored in `rosCalendar.dailyPercentages`
3. Weekly ROS is **predetermined** at start of week, not calculated

---

### **2. ROS is Return on Stake ONLY**

**✅ Include:**

- Stake returns only
- Earnings calculated from: `(Total Active Stake) × (Daily ROS %) / 100`

**❌ Exclude:**

- Referral commissions
- Registration bonuses
- Pool distributions
- Any other earnings sources

---

### **3. Display Timing Rules (CRITICAL)**

#### **Daily Profit Display:**

- Daily profit is **only displayed at the close of that day**
- Example: Monday's profit is declared/displayed at the end of Monday (23:59:59), not before or at the start
- During the day, previous day's data should be shown (if available)

#### **Weekly Profit Display:**

- Weekly profit is **only displayed at the end of the week** (Sunday 23:59:59)
- Even though the weekly total is predetermined at the start of the week, it's only shown to users at the end
- During the week, `weeklyRos` should be `0.00` in the response
- At end of week, `weeklyRos` should be the actual value from calendar

**Implementation:**

```javascript
const isWeekComplete = now > weekEnd;
const displayWeeklyRos = isWeekComplete ? rosCalendar.totalWeeklyPercentage : 0;
```

#### **Daily Breakdown Filtering:**

- **During week**: Only include days that have been completed (closed)
- **At end of week**: Include all 7 days

**Implementation:**

```javascript
// Filter to only include completed days during the week
const completedDays = dailyBreakdown.filter((day, index) => {
  const dayDate = new Date(weekStart);
  dayDate.setDate(weekStart.getDate() + index);
  dayDate.setHours(23, 59, 59, 999); // End of day
  return now >= dayDate; // Only include if day has closed
});

const displayDailyBreakdown = isWeekComplete ? dailyBreakdown : completedDays;
```

---

### **4. Week Format: Monday-Sunday**

- Week starts on **Monday** (00:00:00)
- Week ends on **Sunday** (23:59:59)
- All 7 days must be included in `dailyBreakdown` array (at end of week)

---

## 📐 Step-by-Step Implementation

### **Step 1: Calculate Current Week (Monday-Sunday)**

```javascript
const now = new Date();
const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based

const weekStart = new Date(now);
weekStart.setDate(now.getDate() - daysSinceMonday);
weekStart.setHours(0, 0, 0, 0); // Monday 00:00:00

const weekEnd = new Date(weekStart);
weekEnd.setDate(weekEnd.getDate() + 6);
weekEnd.setHours(23, 59, 59, 999); // Sunday 23:59:59
```

---

### **Step 2: Calculate Week Number (ISO Week)**

```javascript
const yearStart = new Date(now.getFullYear(), 0, 1);
const weekNumber = Math.ceil(
  (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
);
```

---

### **Step 3: Get User's Total Active Stake**

```javascript
const activeStakes = await Stake.find({
  userId: req.user._id,
  status: 'active',
});

const totalStakeAmount = activeStakes.reduce(
  (sum, stake) => sum + stake.amount,
  0
);
```

**Important:**

- Only include stakes with `status: 'active'`
- Sum all active stake amounts
- This is used to calculate daily earnings

---

### **Step 4: Get Current Week's ROS Calendar**

```javascript
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
```

**Calendar Fields Used:**

- `totalWeeklyPercentage` → Weekly ROS total (admin-declared)
- `dailyPercentages.monday` → Monday's ROS %
- `dailyPercentages.tuesday` → Tuesday's ROS %
- `dailyPercentages.wednesday` → Wednesday's ROS %
- `dailyPercentages.thursday` → Thursday's ROS %
- `dailyPercentages.friday` → Friday's ROS %
- `dailyPercentages.saturday` → Saturday's ROS %
- `dailyPercentages.sunday` → Sunday's ROS %

---

### **Step 5: Build Daily Breakdown**

```javascript
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
  const dayKey = dayName.toLowerCase(); // 'monday', 'tuesday', etc.

  // Get ROS percentage from calendar (randomly split by backend from weekly total)
  const rosPercentage = dailyPercentages[dayKey] || 0;

  // Calculate earnings: (Total Active Stake) × (Daily ROS %) / 100
  // IMPORTANT: This is stake returns ONLY, NOT referrals, bonuses, or other earnings
  const dayEarnings = (totalStakeAmount * rosPercentage) / 100;

  dailyBreakdown.push({
    date: dayDate.toISOString(),
    dayOfWeek: dayName,
    ros: rosPercentage,
    earnings: dayEarnings,
  });
}
```

---

### **Step 6: Filter Completed Days (Display Timing)**

```javascript
// Only include days that have been completed (closed)
// Daily profit is only displayed at the close of that day
const completedDays = dailyBreakdown.filter((day, index) => {
  const dayDate = new Date(weekStart);
  dayDate.setDate(weekStart.getDate() + index);
  dayDate.setHours(23, 59, 59, 999); // End of day
  return now >= dayDate; // Only include if day has closed
});
```

---

### **Step 7: Calculate Totals**

```javascript
// Total Earnings = Sum of all daily earnings (stake returns only)
// Only include earnings from completed days
const totalEarnings = completedDays.reduce((sum, day) => sum + day.earnings, 0);

// Weekly ROS = From ROS Calendar's totalWeeklyPercentage (admin-declared at start of week)
const weeklyRos = rosCalendar.totalWeeklyPercentage || 0;

// Optional: Verify that daily percentages sum to weekly total
const sumOfDailyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);
if (Math.abs(sumOfDailyRos - weeklyRos) > 0.01) {
  console.warn(
    `[getWeeklySummary] Daily ROS sum (${sumOfDailyRos}%) does not match weekly total (${weeklyRos}%)`
  );
}
```

---

### **Step 8: Determine Status**

```javascript
const isWeekComplete = now > weekEnd;
const status = isWeekComplete ? 'completed' : 'pending';
```

---

### **Step 9: Apply Display Timing Rules**

```javascript
// Weekly ROS is only displayed at the end of the week
// Even though it's predetermined, it's only shown when week is complete
const displayWeeklyRos = isWeekComplete ? weeklyRos : 0; // Only show at end of week

// Total earnings can be shown during week (partial earnings)
const displayTotalEarnings = totalEarnings; // Show partial earnings during week

// Daily breakdown: only completed days during week, all days at end
const displayDailyBreakdown = isWeekComplete ? dailyBreakdown : completedDays;
```

---

### **Step 10: Return Response**

```javascript
return res.status(200).json({
  success: true,
  data: {
    weekNumber,
    year: now.getFullYear(),
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
    totalEarnings: parseFloat(displayTotalEarnings.toFixed(2)),
    weeklyRos: parseFloat(displayWeeklyRos.toFixed(2)), // Only shown at end of week
    status,
    dailyBreakdown: displayDailyBreakdown, // Only completed days during week, all days at end
  },
});
```

---

## 📋 Complete Implementation Code

```javascript
// Backend Route: GET /api/analytics/weekly-summary
async function getWeeklySummary(req, res) {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Step 1: Calculate current week (Monday-Sunday)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceMonday);
    weekStart.setHours(0, 0, 0, 0); // Monday 00:00:00

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // Sunday 23:59:59

    // Step 2: Calculate week number (ISO week)
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // Step 3: Get user's total active stake
    const activeStakes = await Stake.find({
      userId,
      status: 'active',
    });
    const totalStakeAmount = activeStakes.reduce(
      (sum, stake) => sum + stake.amount,
      0
    );

    // Step 4: Get current week's ROS calendar
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

    // Step 5: Build daily breakdown
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

      // Get ROS percentage from calendar (randomly split by backend from weekly total)
      const rosPercentage = dailyPercentages[dayKey] || 0;

      // Calculate earnings: (Total Active Stake) × (Daily ROS %) / 100
      // IMPORTANT: This is stake returns ONLY, NOT referrals, bonuses, or other earnings
      const dayEarnings = (totalStakeAmount * rosPercentage) / 100;

      dailyBreakdown.push({
        date: dayDate.toISOString(),
        dayOfWeek: dayName,
        ros: rosPercentage,
        earnings: dayEarnings,
      });
    }

    // Step 6: Filter completed days (display timing)
    const completedDays = dailyBreakdown.filter((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      dayDate.setHours(23, 59, 59, 999); // End of day
      return now >= dayDate; // Only include if day has closed
    });

    // Step 7: Calculate totals
    const totalEarnings = completedDays.reduce(
      (sum, day) => sum + day.earnings,
      0
    );
    const weeklyRos = rosCalendar.totalWeeklyPercentage || 0;

    // Optional: Verify that daily percentages sum to weekly total
    const sumOfDailyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);
    if (Math.abs(sumOfDailyRos - weeklyRos) > 0.01) {
      console.warn(
        `[getWeeklySummary] Daily ROS sum (${sumOfDailyRos}%) does not match weekly total (${weeklyRos}%)`
      );
    }

    // Step 8: Determine status
    const isWeekComplete = now > weekEnd;
    const status = isWeekComplete ? 'completed' : 'pending';

    // Step 9: Apply display timing rules
    const displayWeeklyRos = isWeekComplete ? weeklyRos : 0; // Only show at end of week
    const displayTotalEarnings = totalEarnings; // Show partial earnings during week
    const displayDailyBreakdown = isWeekComplete
      ? dailyBreakdown
      : completedDays; // Only completed days during week

    // Step 10: Return response
    return res.status(200).json({
      success: true,
      data: {
        weekNumber,
        year: now.getFullYear(),
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        totalEarnings: parseFloat(displayTotalEarnings.toFixed(2)),
        weeklyRos: parseFloat(displayWeeklyRos.toFixed(2)), // Only shown at end of week
        status,
        dailyBreakdown: displayDailyBreakdown, // Only completed days during week, all days at end
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

## 🧪 Test Cases

### **Test Case 1: Complete Week (End of Week)**

**Scenario:**

- Current time: Sunday 23:59:59 (end of week)
- User has $1,000 in active stakes
- ROS Calendar: Weekly total 3.85%, Daily: Mon 1.12%, Tue 0.49%, Wed 1.18%, Thu 0.23%, Fri 0.83%, Sat 0%, Sun 0%

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 38.5,
    "weeklyRos": 3.85,
    "status": "completed",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 11.2 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 4.9 },
      { "dayOfWeek": "Wednesday", "ros": 1.18, "earnings": 11.8 },
      { "dayOfWeek": "Thursday", "ros": 0.23, "earnings": 2.3 },
      { "dayOfWeek": "Friday", "ros": 0.83, "earnings": 8.3 },
      { "dayOfWeek": "Saturday", "ros": 0.0, "earnings": 0.0 },
      { "dayOfWeek": "Sunday", "ros": 0.0, "earnings": 0.0 }
    ]
  }
}
```

**Verification:**

- ✅ `weeklyRos = 3.85` (from calendar, shown because week is complete)
- ✅ `status = "completed"`
- ✅ All 7 days included in `dailyBreakdown`
- ✅ `totalEarnings = 11.20 + 4.90 + 11.80 + 2.30 + 8.30 + 0 + 0 = $38.50`

---

### **Test Case 2: Incomplete Week (During Week)**

**Scenario:**

- Current time: Wednesday 14:00:00 (during the day, before close)
- User has $1,000 in active stakes
- ROS Calendar: Weekly total 3.85%, Daily: Mon 1.12%, Tue 0.49%, Wed 1.18%, Thu 0.23%, Fri 0.83%, Sat 0%, Sun 0%

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 16.1,
    "weeklyRos": 0.0,
    "status": "pending",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 11.2 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 4.9 }
    ]
  }
}
```

**Verification:**

- ✅ `weeklyRos = 0.00` (not displayed until end of week, even though predetermined as 3.85%)
- ✅ `status = "pending"`
- ✅ Only completed days (Monday, Tuesday) in `dailyBreakdown`
- ✅ Wednesday not included because it hasn't closed yet
- ✅ `totalEarnings = 11.20 + 4.90 = $16.10` (only completed days)

---

### **Test Case 3: User with No Stakes**

**Scenario:**

- Current time: End of week
- User has $0 in active stakes
- ROS Calendar exists with weekly total 3.85%

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 0.0,
    "weeklyRos": 3.85,
    "status": "completed",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 0.0 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 0.0 }
      // ... all days with ros from calendar, but earnings = 0
    ]
  }
}
```

**Verification:**

- ✅ `weeklyRos = 3.85` (from calendar, shown because week is complete)
- ✅ `totalEarnings = $0.00` (no stakes = no earnings)
- ✅ All days show ROS percentages from calendar
- ✅ All days show $0.00 earnings

---

## ⚠️ Common Mistakes to Avoid

### **❌ Mistake 1: Calculating Weekly ROS Instead of Using Calendar Value**

```javascript
// ❌ WRONG - Calculating by summing daily percentages
const weeklyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);

// ✅ CORRECT - Using admin-declared weekly total from calendar
const weeklyRos = rosCalendar.totalWeeklyPercentage || 0;
```

---

### **❌ Mistake 2: Including Non-Stake Earnings**

```javascript
// ❌ WRONG - Includes referrals, bonuses, etc.
const totalEarnings = sum(allTransactions.amount);

// ✅ CORRECT - Only stake returns
const dayEarnings = (totalStakeAmount * rosPercentage) / 100;
const totalEarnings = sum(dailyBreakdown.map((day) => day.earnings));
```

---

### **❌ Mistake 3: Showing Weekly ROS During Week**

```javascript
// ❌ WRONG - Showing weekly ROS during week
const displayWeeklyRos = weeklyRos; // Always shows value

// ✅ CORRECT - Only show at end of week
const isWeekComplete = now > weekEnd;
const displayWeeklyRos = isWeekComplete ? weeklyRos : 0;
```

---

### **❌ Mistake 4: Including Future Days in Daily Breakdown**

```javascript
// ❌ WRONG - Including all days during week
const displayDailyBreakdown = dailyBreakdown; // All 7 days

// ✅ CORRECT - Only completed days during week
const completedDays = dailyBreakdown.filter((day, index) => {
  const dayDate = new Date(weekStart);
  dayDate.setDate(weekStart.getDate() + index);
  dayDate.setHours(23, 59, 59, 999);
  return now >= dayDate;
});
const displayDailyBreakdown = isWeekComplete ? dailyBreakdown : completedDays;
```

---

### **❌ Mistake 5: Using Wrong Week Format**

```javascript
// ❌ WRONG - Sunday-Saturday week
const weekStart = getSundayOfWeek(now);

// ✅ CORRECT - Monday-Sunday week
const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
const weekStart = new Date(now);
weekStart.setDate(now.getDate() - daysSinceMonday);
weekStart.setHours(0, 0, 0, 0);
```

---

## ✅ Implementation Checklist

- [ ] **Endpoint Created**: `GET /api/analytics/weekly-summary`
- [ ] **Authentication**: Requires user token (Bearer token)
- [ ] **Week Calculation**: Monday-Sunday weeks (not Sunday-Saturday)
- [ ] **Week Number**: ISO week number (1-52/53)
- [ ] **Get ROS Calendar**: Query active calendar for current week
- [ ] **Get User Stakes**: Sum all active stakes for user
- [ ] **Build Daily Breakdown**: All 7 days with ROS % and earnings
- [ ] **Filter Completed Days**: Only include closed days during week
- [ ] **Calculate Totals**: Sum of daily earnings (stake returns only)
- [ ] **Get Weekly ROS**: From `rosCalendar.totalWeeklyPercentage` (NOT calculated)
- [ ] **Display Timing**: Weekly ROS only at end of week (0.00 during week)
- [ ] **Status**: "pending" or "completed" based on week end date
- [ ] **Response Format**: Matches specification exactly
- [ ] **Error Handling**: 404 for no calendar, 401 for auth, 500 for errors
- [ ] **Testing**: Test with complete week, incomplete week, no stakes, no calendar

---

## 🔍 Data Sources

### **1. ROS Calendar** (Primary Source)

**Model/Collection:** `ROSCalendar` or similar  
**Query:**

```javascript
const rosCalendar = await ROSCalendar.findOne({
  weekStartDate: { $lte: weekStart },
  weekEndDate: { $gte: weekEnd },
  status: 'active',
});
```

**Fields Used:**

- `totalWeeklyPercentage` (number) - Admin-declared weekly ROS total
- `dailyPercentages.monday` (number) - Monday's ROS %
- `dailyPercentages.tuesday` (number) - Tuesday's ROS %
- `dailyPercentages.wednesday` (number) - Wednesday's ROS %
- `dailyPercentages.thursday` (number) - Thursday's ROS %
- `dailyPercentages.friday` (number) - Friday's ROS %
- `dailyPercentages.saturday` (number) - Saturday's ROS %
- `dailyPercentages.sunday` (number) - Sunday's ROS %

---

### **2. User Stakes** (For Earnings Calculation)

**Model/Collection:** `Stake` or similar  
**Query:**

```javascript
const activeStakes = await Stake.find({
  userId,
  status: 'active',
});
```

**Fields Used:**

- `amount` (number) - Stake amount
- `status` (string) - Must be `'active'`

**Calculation:**

```javascript
const totalStakeAmount = activeStakes.reduce(
  (sum, stake) => sum + stake.amount,
  0
);
```

---

## 📝 Summary

**What Backend Must Implement:**

1. ✅ **Endpoint:** `GET /api/analytics/weekly-summary`
2. ✅ **Get Weekly ROS:** From `rosCalendar.totalWeeklyPercentage` (admin-declared, NOT calculated)
3. ✅ **Calculate Earnings:** From stake only: `(Total Active Stake) × (Daily ROS %) / 100`
4. ✅ **Use ROS Calendar:** Get weekly total and daily percentages from active ROS calendar
5. ✅ **Week Format:** Monday-Sunday weeks
6. ✅ **Exclude Non-Stake Earnings:** Do NOT include referrals, bonuses, or other earnings
7. ✅ **Display Timing Rules:**
   - Weekly ROS only displayed at end of week (0.00 during week)
   - Daily profit only displayed at close of that day
   - During week, only include completed days in response

**Response Fields:**

- `weeklyRos` (number) - Admin-declared weekly total. **Only displayed at end of week** (0.00 during week)
- `totalEarnings` (number) - Sum of daily earnings (stake returns only)
- `dailyBreakdown` (array) - Day objects. **During week: only completed days. At end: all 7 days.**
- `status` (string) - "pending" or "completed"
- `weekNumber`, `year`, `startDate`, `endDate`

**Priority:** 🔴 **HIGH** - Frontend is ready and waiting for this endpoint

---

## 🆘 Questions or Issues?

If you have questions or need clarification:

1. Check the complete analysis: `WEEKLY_ROS_CARD_COMPLETE_ANALYSIS.md`
2. Check the API specification: `BACKEND_WEEKLY_ROS_SUMMARY_API_SPECIFICATION.md`
3. Test with the provided test cases
4. Verify response format matches specification exactly

---

**Last Updated:** January 2025  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Frontend Status:** ✅ **READY**
