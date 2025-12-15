# Backend API Specification: Weekly ROS Summary

**Priority:** 🔴 **HIGH**  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Date:** January 2025

---

## 🎯 Overview

The Weekly ROS Summary endpoint provides users with their **Return on Stake (ROS)** performance for the current week. **ROS is Return on Stake ONLY** - it does not include referrals, bonuses, pool distributions, or any other earnings.

---

## 📋 Required Endpoint

### **GET `/api/analytics/weekly-summary`**

**Authentication:** Required (Bearer Token)  
**Description:** Returns the user's weekly ROS summary for the current week (Monday-Sunday).

---

## 📊 Response Structure

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
  },
  "meta": {
    "response_time_ms": 45
  }
}
```

---

## 🔧 Field Specifications

| Field            | Type              | Required | Description                                                                                        |
| ---------------- | ----------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `weekNumber`     | number            | ✅       | ISO week number (1-52/53)                                                                          |
| `year`           | number            | ✅       | Year (e.g., 2025)                                                                                  |
| `startDate`      | string (ISO 8601) | ✅       | Week start date (Monday, 00:00:00)                                                                 |
| `endDate`        | string (ISO 8601) | ✅       | Week end date (Sunday, 23:59:59)                                                                   |
| `totalEarnings`  | number            | ✅       | **Sum of all daily earnings** (stake returns only)                                                 |
| `weeklyRos`      | number            | ✅       | **Admin-declared weekly total** from ROS calendar (NOT calculated). Only displayed at end of week. |
| `status`         | string            | ✅       | `"pending"` (week in progress) or `"completed"` (week finished)                                    |
| `dailyBreakdown` | array             | ✅       | Array of 7 day objects (Monday through Sunday)                                                     |

### **Daily Breakdown Object**

| Field       | Type              | Required | Description                                                                        |
| ----------- | ----------------- | -------- | ---------------------------------------------------------------------------------- |
| `date`      | string (ISO 8601) | ✅       | Date of the day                                                                    |
| `dayOfWeek` | string            | ✅       | Full day name ("Monday", "Tuesday", etc.)                                          |
| `ros`       | number            | ✅       | Daily ROS percentage from calendar (declared by admin, determined at close of day) |
| `earnings`  | number            | ✅       | Daily earnings from stake only: `(Total Active Stake) × (Daily ROS %) / 100`       |

---

## 🎯 Critical Business Rules

### **1. Weekly ROS is Admin-Declared, NOT Calculated**

**✅ CORRECT Source:**

```javascript
// Weekly ROS comes from ROS Calendar's totalWeeklyPercentage (admin-declared at start of week)
weeklyRos = rosCalendar.totalWeeklyPercentage; // e.g., 3.85%
```

**✅ How It Works:**

1. **Admin declares** weekly total at start of week (e.g., 3.85%)
2. **Backend randomly splits** this total across 7 days
3. Daily percentages sum to the weekly total (for verification)

**❌ WRONG Calculation:**

```javascript
// ❌ DO NOT calculate by summing daily percentages
weeklyRos = sum(dailyBreakdown.ros); // ❌ WRONG - use calendar's totalWeeklyPercentage instead

// ❌ DO NOT calculate as average
averageRos = sum(dailyBreakdown.ros) / 7; // ❌ WRONG
```

### **2. ROS is Return on Stake ONLY**

**✅ Include:**

- Stake returns only
- Earnings calculated from: `(Total Active Stake) × (Daily ROS %) / 100`

**❌ Exclude:**

- Referral commissions
- Registration bonuses
- Pool distributions
- Any other earnings sources

### **3. Weekly ROS is Predetermined, Daily Percentages are Randomly Split**

- **Weekly ROS** is **declared by admin at the start of the week** (e.g., 3.85%)
- **Backend randomly splits** this weekly total across the 7 days
- Daily percentages are stored in ROS calendar's `dailyPercentages` object
- Daily percentages always sum to the weekly total
- The weekly ROS is **already known at the start of the week** (not calculated)

### **4. Display Timing Rules**

- **Daily Profit Display**:
  - Daily profit is **only displayed at the close of that day**
  - Example: Monday's profit is declared/displayed at the end of Monday, not before or at the start
  - During the day, previous day's data should be shown (if available)
- **Weekly Profit Display**:
  - Weekly profit is **only displayed at the end of the week** (Sunday 23:59:59)
  - Even though the weekly total is predetermined at the start of the week, it's only shown to users at the end
  - During the week, only completed days' data should be shown

**Backend Implementation Note:**

- The backend knows the weekly total from the start (from calendar)
- But should only return it in the API response when the week is complete (`status: 'completed'`)
- For incomplete weeks (`status: 'pending'`), daily breakdown should only include completed days

### **4. Week Format: Monday-Sunday**

- Week starts on **Monday** (00:00:00)
- Week ends on **Sunday** (23:59:59)
- All 7 days must be included in `dailyBreakdown` array

---

## 📐 Calculation Logic

### **Step 1: Get Current Week (Monday-Sunday)**

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

### **Step 2: Get User's Total Active Stake**

```javascript
const activeStakes = await Stake.find({
  userId,
  status: 'active',
});
const totalStakeAmount = activeStakes.reduce(
  (sum, stake) => sum + stake.amount,
  0
);
```

**Important:** Only include stakes with `status: 'active'`. Exclude completed or cancelled stakes.

### **Step 3: Get Current Week's ROS Calendar**

```javascript
const rosCalendar = await ROSCalendar.findOne({
  weekStartDate: { $lte: weekStart },
  weekEndDate: { $gte: weekEnd },
  status: 'active',
});
```

**Important:**

- Use the ROS calendar that covers the current week
- The calendar contains:
  - `totalWeeklyPercentage`: Admin-declared weekly ROS total (e.g., 3.85%)
  - `dailyPercentages`: Object with daily percentages randomly split by backend
    - `{ monday: 1.12, tuesday: 0.49, wednesday: 1.18, ... }`

### **Step 4: Build Daily Breakdown**

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
  // The backend randomly splits the admin-declared weekly total across 7 days
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

### **Step 5: Calculate Totals**

```javascript
// Total Earnings = Sum of all daily earnings (stake returns only)
const totalEarnings = dailyBreakdown.reduce(
  (sum, day) => sum + day.earnings,
  0
);

// Weekly ROS = SUM of all daily ROS percentages (NOT average)
const weeklyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);
```

### **Step 6: Determine Status**

```javascript
const isWeekComplete = now > weekEnd;
const status = isWeekComplete ? 'completed' : 'pending';
```

---

## 🧪 Example Calculation

### **Scenario:**

- User has **$1,000** in active stakes
- ROS Calendar for current week:
  - Monday: 1.12%
  - Tuesday: 0.49%
  - Wednesday: 1.18%
  - Thursday: 0.23%
  - Friday: 0.83%
  - Saturday: 0.00% (not yet determined)
  - Sunday: 0.00% (not yet determined)

### **Daily Breakdown Calculation:**

```javascript
Monday:
  ros: 1.12%
  earnings: ($1,000 × 1.12) / 100 = $11.20

Tuesday:
  ros: 0.49%
  earnings: ($1,000 × 0.49) / 100 = $4.90

Wednesday:
  ros: 1.18%
  earnings: ($1,000 × 1.18) / 100 = $11.80

Thursday:
  ros: 0.23%
  earnings: ($1,000 × 0.23) / 100 = $2.30

Friday:
  ros: 0.83%
  earnings: ($1,000 × 0.83) / 100 = $8.30

Saturday:
  ros: 0.00% (not yet determined)
  earnings: ($1,000 × 0.00) / 100 = $0.00

Sunday:
  ros: 0.00% (not yet determined)
  earnings: ($1,000 × 0.00) / 100 = $0.00
```

### **Totals:**

```javascript
weeklyRos = 1.12 + 0.49 + 1.18 + 0.23 + 0.83 + 0 + 0 = 3.85%
totalEarnings = 11.20 + 4.90 + 11.80 + 2.30 + 8.30 + 0 + 0 = $38.50
```

---

## 🗄️ Data Sources

### **1. ROS Calendar** (Primary Source for Weekly and Daily ROS)

**Source:** ROS Calendar database/model  
**Query:**

```javascript
const rosCalendar = await ROSCalendar.findOne({
  weekStartDate: { $lte: weekStart },
  weekEndDate: { $gte: weekEnd },
  status: 'active',
});
```

**Fields Used:**

- `totalWeeklyPercentage` → **Admin-declared weekly ROS total** (e.g., 3.85%)
  - This is the **primary source** for `weeklyRos` field
  - Declared by admin at the start of the week
  - Backend randomly splits this total across 7 days
- `dailyPercentages.monday` → Monday's ROS % (randomly split by backend)
- `dailyPercentages.tuesday` → Tuesday's ROS % (randomly split by backend)
- `dailyPercentages.wednesday` → Wednesday's ROS % (randomly split by backend)
- `dailyPercentages.thursday` → Thursday's ROS % (randomly split by backend)
- `dailyPercentages.friday` → Friday's ROS % (randomly split by backend)
- `dailyPercentages.saturday` → Saturday's ROS % (randomly split by backend)
- `dailyPercentages.sunday` → Sunday's ROS % (randomly split by backend)

**Important:**

- **Weekly ROS** is **predetermined** by admin at start of week (stored in `totalWeeklyPercentage`)
- **Daily percentages** are **randomly split by backend** from the weekly total
- Daily percentages always sum to the weekly total (for verification)

### **2. User Stakes** (For Earnings Calculation)

**Source:** Stake database/model  
**Query:**

```javascript
const activeStakes = await Stake.find({
  userId,
  status: 'active',
});
```

**Calculation:**

```javascript
const totalStakeAmount = activeStakes.reduce(
  (sum, stake) => sum + stake.amount,
  0
);
```

**Important:**

- Only include stakes with `status: 'active'`
- Sum all active stake amounts
- This is used to calculate daily earnings

### **3. Transaction History** (Optional - for verification)

**Note:** You can optionally verify calculated earnings against actual transactions, but **calculation should be primary**:

```javascript
// Optional: Verify against transactions
const rosTransactions = await Transaction.find({
  userId,
  type: 'ros_payout', // or 'staking_earnings'
  createdAt: {
    $gte: weekStart,
    $lte: weekEnd,
  },
});
```

**However:** The primary calculation method should be:

```
Daily Earnings = (Total Active Stake) × (Daily ROS %) / 100
```

---

## 📋 Complete Backend Implementation

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

      // Get ROS percentage from calendar (declared by admin, determined at close of day)
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

    // Step 6: Calculate totals
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

    // Step 7: Determine status
    const isWeekComplete = now > weekEnd;
    const status = isWeekComplete ? 'completed' : 'pending';

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

### **Test Case 1: User with Active Stakes**

**Input:**

- User has $1,000 in active stakes
- ROS Calendar: Monday 1.12%, Tuesday 0.49%, Wednesday 1.18%, Thursday 0.23%, Friday 0.83%, Saturday 0%, Sunday 0%

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 38.5,
    "weeklyRos": 3.85,
    "status": "pending",
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

- ✅ `weeklyRos = 1.12 + 0.49 + 1.18 + 0.23 + 0.83 + 0 + 0 = 3.85%` (SUM, not average)
- ✅ `totalEarnings = 11.20 + 4.90 + 11.80 + 2.30 + 8.30 + 0 + 0 = $38.50`

---

### **Test Case 2: User with No Stakes**

**Input:**

- User has $0 in active stakes
- ROS Calendar exists with percentages

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 0,
    "weeklyRos": 3.85,
    "status": "pending",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 0.0 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 0.0 }
      // ... all days with ros from calendar, but earnings = 0
    ]
  }
}
```

**Verification:**

- ✅ `weeklyRos = 3.85%` (sum of calendar percentages, even if user has no stakes)
- ✅ `totalEarnings = $0.00` (no stakes = no earnings)

---

### **Test Case 3: Incomplete Week**

**Input:**

- Current day: Wednesday
- ROS Calendar: Monday 1.12%, Tuesday 0.49%, Wednesday 1.18%, Thursday-Sunday: 0% (not yet determined)

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "totalEarnings": 27.9,
    "weeklyRos": 2.79,
    "status": "pending",
    "dailyBreakdown": [
      { "dayOfWeek": "Monday", "ros": 1.12, "earnings": 11.2 },
      { "dayOfWeek": "Tuesday", "ros": 0.49, "earnings": 4.9 },
      { "dayOfWeek": "Wednesday", "ros": 1.18, "earnings": 11.8 },
      { "dayOfWeek": "Thursday", "ros": 0.0, "earnings": 0.0 },
      { "dayOfWeek": "Friday", "ros": 0.0, "earnings": 0.0 },
      { "dayOfWeek": "Saturday", "ros": 0.0, "earnings": 0.0 },
      { "dayOfWeek": "Sunday", "ros": 0.0, "earnings": 0.0 }
    ]
  }
}
```

**Verification:**

- ✅ `weeklyRos = 1.12 + 0.49 + 1.18 + 0 + 0 + 0 + 0 = 2.79%` (sum of determined days)
- ✅ Future days show 0% and $0.00

---

## ⚠️ Common Mistakes to Avoid

### **❌ Mistake 1: Calculating Weekly ROS Instead of Using Calendar Value**

```javascript
// ❌ WRONG - Calculating by summing daily percentages
const weeklyRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0);

// ❌ WRONG - Calculating as average
const averageRos = dailyBreakdown.reduce((sum, day) => sum + day.ros, 0) / 7;

// ✅ CORRECT - Using admin-declared weekly total from calendar
const weeklyRos = rosCalendar.totalWeeklyPercentage || 0;
```

### **❌ Mistake 2: Including Non-Stake Earnings**

```javascript
// ❌ WRONG - Includes referrals, bonuses, etc.
const totalEarnings = sum(allTransactions.amount);

// ✅ CORRECT - Only stake returns
const totalEarnings = sum(dailyBreakdown.map((day) => day.earnings));
// Where day.earnings = (Total Active Stake) × (Daily ROS %) / 100
```

### **❌ Mistake 3: Using Wrong Week Format**

```javascript
// ❌ WRONG - Sunday-Saturday week
const weekStart = getSundayOfWeek(now);

// ✅ CORRECT - Monday-Sunday week
const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
const weekStart = new Date(now);
weekStart.setDate(now.getDate() - daysSinceMonday);
```

### **❌ Mistake 4: Not Including All 7 Days**

```javascript
// ❌ WRONG - Only includes days with data
const dailyBreakdown = daysWithData;

// ✅ CORRECT - Always includes all 7 days
for (let i = 0; i < 7; i++) {
  // Always add all 7 days, even if some are 0%
}
```

---

## ✅ Implementation Checklist

- [ ] **Endpoint Created**: `GET /api/analytics/weekly-summary`
- [ ] **Authentication**: Requires user token
- [ ] **Week Calculation**: Monday-Sunday weeks (not Sunday-Saturday)
- [ ] **Week Number**: ISO week number (1-52/53)
- [ ] **Daily Breakdown**: All 7 days included (Monday-Sunday)
- [ ] **ROS Source**: From ROS calendar (admin-declared percentages)
- [ ] **Earnings Calculation**: `(Total Active Stake) × (Daily ROS %) / 100`
- [ ] **Weekly ROS**: From ROS calendar's `totalWeeklyPercentage` (admin-declared, NOT calculated)
- [ ] **Display Timing**: Weekly ROS only displayed at end of week (even though predetermined)
- [ ] **Daily Display Timing**: Daily profit only displayed at close of that day
- [ ] **Filter Completed Days**: Only include completed days in response during the week
- [ ] **Total Earnings**: Sum of daily earnings (stake returns only)
- [ ] **Exclude Non-Stake Earnings**: No referrals, bonuses, or other earnings
- [ ] **Status**: "pending" or "completed" based on week end date
- [ ] **Response Format**: Matches specification exactly
- [ ] **Error Handling**: 404 for no calendar, 401 for auth, 500 for errors

---

## 🎯 Summary

**What Backend Must Implement:**

1. ✅ **Endpoint:** `GET /api/analytics/weekly-summary`
2. ✅ **Get Weekly ROS:** From ROS calendar's `totalWeeklyPercentage` (admin-declared at start of week)
3. ✅ **Calculate Earnings:** From stake only: `(Total Active Stake) × (Daily ROS %) / 100`
4. ✅ **Use ROS Calendar:** Get weekly total and daily percentages from active ROS calendar
5. ✅ **Week Format:** Monday-Sunday weeks
6. ✅ **Exclude Non-Stake Earnings:** Do NOT include referrals, bonuses, or other earnings
7. ✅ **Return Field:** `weeklyRos` (from calendar, not calculated)

**Response Fields:**

- `weeklyRos` (number) - **Admin-declared weekly total** from ROS calendar (NOT calculated)
- `totalEarnings` (number) - Sum of daily earnings (stake returns only)
- `dailyBreakdown` (array) - All 7 days with ROS % and earnings
- `weekNumber` (number) - ISO week number
- `status` (string) - "pending" or "completed"

**Priority:** 🔴 **HIGH** - Currently showing "0%" because endpoint not implemented

---

**Last Updated:** January 2025  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**
