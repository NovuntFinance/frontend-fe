# Backend API Specification: Staking Streak

**Priority:** 🔴 **HIGH**  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Date:** January 2025

---

## 🎯 Overview

The Staking Streak feature tracks consecutive days where a user has at least one active stake. This gamification element encourages consistent engagement with the platform.

---

## 📋 Required Endpoint

### **GET `/api/v1/staking/streak`**

**Authentication:** Required (Bearer Token)  
**Description:** Returns the user's current staking streak and related statistics.

---

## 📊 Response Structure

```json
{
  "success": true,
  "data": {
    "currentStreak": 45,
    "longestStreak": 67,
    "totalActiveDays": 120,
    "lastActiveDate": "2025-01-15T00:00:00.000Z",
    "streakStartDate": "2024-12-01T00:00:00.000Z",
    "isActiveToday": true,
    "daysUntilNextMilestone": 5,
    "nextMilestone": 50,
    "weeklyProgress": [
      {
        "date": "2025-01-15T00:00:00.000Z",
        "hasActiveStake": true
      },
      {
        "date": "2025-01-14T00:00:00.000Z",
        "hasActiveStake": true
      },
      {
        "date": "2025-01-13T00:00:00.000Z",
        "hasActiveStake": true
      },
      {
        "date": "2025-01-12T00:00:00.000Z",
        "hasActiveStake": true
      },
      {
        "date": "2025-01-11T00:00:00.000Z",
        "hasActiveStake": true
      },
      {
        "date": "2025-01-10T00:00:00.000Z",
        "hasActiveStake": true
      },
      {
        "date": "2025-01-09T00:00:00.000Z",
        "hasActiveStake": true
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

| Field                    | Type              | Required | Description                                                         |
| ------------------------ | ----------------- | -------- | ------------------------------------------------------------------- |
| `currentStreak`          | number            | ✅       | Current consecutive days with at least one active stake             |
| `longestStreak`          | number            | ✅       | Highest streak ever achieved by the user                            |
| `totalActiveDays`        | number            | ✅       | Total days user has had active stakes (not necessarily consecutive) |
| `lastActiveDate`         | string (ISO 8601) | ✅       | Last date user had an active stake                                  |
| `streakStartDate`        | string (ISO 8601) | ✅       | Date when current streak started                                    |
| `isActiveToday`          | boolean           | ✅       | Whether user has an active stake today                              |
| `daysUntilNextMilestone` | number            | ✅       | Days until next milestone (10, 25, 50, 100, etc.)                   |
| `nextMilestone`          | number            | ✅       | Next milestone number (e.g., 50, 100)                               |
| `weeklyProgress`         | array             | ✅       | Array of last 7 days showing if user had active stake each day      |

---

## 📐 Calculation Logic

### **What Counts as an "Active Day"?**

A day counts toward the streak if:

- User has **at least one stake** with status `'active'` at any point during that day
- The stake was created before or during that day
- The stake has not been completed or cancelled before that day

### **Streak Calculation Algorithm**

```javascript
function calculateStakingStreak(userId) {
  // 1. Get all user's stakes
  const stakes = await Stake.find({ userId });

  // 2. Get all dates where user had active stakes
  const activeDates = new Set();

  stakes.forEach(stake => {
    const startDate = new Date(stake.startDate);
    const endDate = stake.completionDate
      ? new Date(stake.completionDate)
      : new Date(); // Current date if still active

    // Add all dates between start and end (inclusive)
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Only count if stake was active on this date
      if (stake.status === 'active' ||
          (stake.status === 'completed' && date < new Date(stake.completionDate))) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        activeDates.add(dateKey);
      }
    }
  });

  // 3. Sort dates in descending order
  const sortedDates = Array.from(activeDates).sort().reverse();

  // 4. Calculate current streak (consecutive days from today backwards)
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date();

  while (true) {
    const dateKey = checkDate.toISOString().split('T')[0];
    if (activeDates.has(dateKey)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break; // Streak broken
    }
  }

  // 5. Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  sortedDates.forEach(dateKey => {
    const currentDate = new Date(dateKey);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        tempStreak++; // Consecutive
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1; // Reset
      }
    }
    prevDate = currentDate;
  });
  longestStreak = Math.max(longestStreak, tempStreak);

  // 6. Get streak start date
  const streakStartDate = sortedDates[0]
    ? new Date(sortedDates[0])
    : null;

  // 7. Check if active today
  const isActiveToday = activeDates.has(today);

  // 8. Calculate next milestone
  const milestones = [10, 25, 50, 100, 200, 365];
  const nextMilestone = milestones.find(m => m > currentStreak) || null;
  const daysUntilNextMilestone = nextMilestone
    ? nextMilestone - currentStreak
    : 0;

  // 9. Get weekly progress (last 7 days)
  const weeklyProgress = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    weeklyProgress.push({
      date: date.toISOString(),
      hasActiveStake: activeDates.has(dateKey)
    });
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: activeDates.size,
    lastActiveDate: sortedDates[0] ? new Date(sortedDates[0]).toISOString() : null,
    streakStartDate: streakStartDate ? streakStartDate.toISOString() : null,
    isActiveToday,
    daysUntilNextMilestone,
    nextMilestone,
    weeklyProgress
  };
}
```

---

## 🗄️ Database Considerations

### **Recommended Indexes**

```javascript
// Stake Model Indexes
StakeSchema.index({ userId: 1, status: 1, startDate: 1 });
StakeSchema.index({ userId: 1, completionDate: 1 });
```

### **Caching Strategy**

Consider caching streak data:

- **Cache Key:** `staking:streak:${userId}`
- **Cache Duration:** 1 hour (or until next stake activity)
- **Invalidate:** When stake is created, completed, or cancelled

---

## 🧪 Test Cases

### **Test Case 1: New User (No Stakes)**

```json
{
  "currentStreak": 0,
  "longestStreak": 0,
  "totalActiveDays": 0,
  "lastActiveDate": null,
  "streakStartDate": null,
  "isActiveToday": false,
  "daysUntilNextMilestone": 10,
  "nextMilestone": 10,
  "weeklyProgress": [
    { "date": "2025-01-15", "hasActiveStake": false },
    { "date": "2025-01-14", "hasActiveStake": false }
    // ... all false
  ]
}
```

### **Test Case 2: Active Streak (45 days)**

```json
{
  "currentStreak": 45,
  "longestStreak": 45,
  "totalActiveDays": 45,
  "lastActiveDate": "2025-01-15T00:00:00.000Z",
  "streakStartDate": "2024-12-01T00:00:00.000Z",
  "isActiveToday": true,
  "daysUntilNextMilestone": 5,
  "nextMilestone": 50,
  "weeklyProgress": [
    // All 7 days should have hasActiveStake: true
  ]
}
```

### **Test Case 3: Broken Streak**

```json
{
  "currentStreak": 0,
  "longestStreak": 67,
  "totalActiveDays": 120,
  "lastActiveDate": "2025-01-10T00:00:00.000Z", // 5 days ago
  "streakStartDate": null, // No current streak
  "isActiveToday": false,
  "daysUntilNextMilestone": 10,
  "nextMilestone": 10,
  "weeklyProgress": [
    { "date": "2025-01-15", "hasActiveStake": false },
    { "date": "2025-01-14", "hasActiveStake": false },
    { "date": "2025-01-13", "hasActiveStake": false },
    { "date": "2025-01-12", "hasActiveStake": false },
    { "date": "2025-01-11", "hasActiveStake": false },
    { "date": "2025-01-10", "hasActiveStake": true }, // Last active day
    { "date": "2025-01-09", "hasActiveStake": true }
  ]
}
```

---

## ⚡ Performance Optimization

### **Option 1: Real-time Calculation (Simple)**

- Calculate on-demand when endpoint is called
- Suitable for users with < 100 stakes
- Response time: ~50-200ms

### **Option 2: Cached Calculation (Recommended)**

- Calculate and cache streak data
- Update cache when:
  - New stake is created
  - Stake is completed
  - Stake is cancelled
- Response time: ~10-50ms

### **Option 3: Pre-calculated Field (Best Performance)**

- Store streak data in user document
- Update on stake events
- Response time: ~5-20ms

**Recommended:** Option 2 (Cached Calculation)

---

## 🔄 Cache Invalidation

Invalidate streak cache when:

1. **Stake Created:** User creates a new stake
2. **Stake Completed:** Stake reaches 200% ROS
3. **Stake Cancelled:** User cancels a stake
4. **Daily Update:** Background job runs at midnight to update streaks

---

## 📝 Implementation Example

```javascript
// routes/staking.js or controllers/stakingController.js

/**
 * GET /api/v1/staking/streak
 * Get user's staking streak information
 */
async function getStakingStreak(req, res) {
  try {
    const userId = req.user._id;

    // Check cache first
    const cacheKey = `staking:streak:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        meta: {
          response_time_ms: 5,
          cached: true,
        },
      });
    }

    // Calculate streak
    const streakData = await calculateStakingStreak(userId);

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(streakData));

    return res.status(200).json({
      success: true,
      data: streakData,
      meta: {
        response_time_ms: Date.now() - startTime,
        cached: false,
      },
    });
  } catch (error) {
    console.error('[getStakingStreak] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch staking streak',
      error: error.message,
    });
  }
}

// Cache invalidation on stake events
async function invalidateStreakCache(userId) {
  const cacheKey = `staking:streak:${userId}`;
  await redis.del(cacheKey);
}

// Call this when stake is created/completed/cancelled
// In your stake creation handler:
await invalidateStreakCache(userId);
```

---

## ✅ Frontend Integration

Once backend is implemented, frontend will:

1. **Fetch streak data** from `/api/v1/staking/streak`
2. **Display current streak** (e.g., "45 days")
3. **Show weekly progress** (7-day visual indicator)
4. **Update in real-time** when stakes are created/completed

---

## 🎯 Summary

**What Backend Must Implement:**

1. ✅ **Endpoint:** `GET /api/v1/staking/streak`
2. ✅ **Calculate:** Current streak, longest streak, total active days
3. ✅ **Track:** Weekly progress (last 7 days)
4. ✅ **Cache:** Streak data for performance
5. ✅ **Invalidate:** Cache on stake events

**Response Fields:**

- `currentStreak` (number) - Consecutive days with active stake
- `longestStreak` (number) - Highest streak ever
- `totalActiveDays` (number) - Total days with active stakes
- `isActiveToday` (boolean) - Has active stake today
- `weeklyProgress` (array) - Last 7 days status
- `nextMilestone` (number) - Next milestone (10, 25, 50, 100, etc.)
- `daysUntilNextMilestone` (number) - Days until milestone

**Priority:** 🔴 **HIGH** - Currently showing hardcoded "45 days"

---

**Last Updated:** January 2025  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**
