# 🚨 CRITICAL BACKEND BUG: Date Timezone Issue Blocking Multi-Slot Distributions

**Status:** PRODUCTION CRITICAL  
**Priority:** P0  
**Impact:** Users cannot queue daily distributions  
**Date Reported:** February 13, 2026  
**Current System Date:** February 13, 2026 (Africa/Lagos timezone, UTC+1)

---

## Executive Summary

The backend is incorrectly calculating "today's date" and returning **February 12, 2026** when it should return **February 13, 2026**. This causes the system to:

- ❌ Reject new distribution queue requests with 409 error
- ❌ Unable to queue multiple distributions per day
- ❌ Users cannot distribute ROS/stakes as scheduled
- ❌ Production environment blocked for daily operations

---

## Problem Details

### What's Happening

When the frontend tries to queue a new distribution for today (Feb 13), the backend responds:

```json
{
  "success": false,
  "message": "Today's distribution has already been executed. Check history for details."
}
```

**Error Code:** HTTP 409 Conflict

### Why This Is Wrong

1. **Current Date/Time:** February 13, 2026 (in Africa/Lagos timezone)
2. **Backend Response:** Returns date `"2026-02-12"` (yesterday)
3. **Expected Behavior:** Should return date `"2026-02-13"` (today)

### Evidence of the Bug

**API Response from `/admin/daily-declaration-returns/today/status`:**

```json
{
  "date": "2026-02-12", // ❌ WRONG - Should be 2026-02-13
  "status": "COMPLETED",
  "multiSlotEnabled": false,
  "scheduledFor": "2026-02-12T14:59:59.000Z" // ❌ WRONG - Should be 2026-02-13
}
```

**What Should Be Returned:**

```json
{
  "date": "2026-02-13", // ✅ CORRECT
  "status": "PENDING", // ✅ No execution yet today
  "multiSlotEnabled": true,
  "scheduledFor": "2026-02-13T11:46:59.000Z" // ✅ Today's first slot
}
```

---

## Root Cause Analysis

This is a **timezone/date calculation bug** in the backend. Possible causes:

### 1. **Timezone Not Set to Africa/Lagos (UTC+1)**

- Server timezone might be UTC or another timezone
- Backend might not be using the configured timezone for date calculations
- Environment variable `TZ` or config setting might be incorrect

### 2. **Hardcoded Timezone in Code**

- Date calculations might be hardcoded to use UTC or server's local timezone
- Not using the configured `Africa/Lagos` timezone from settings
- `new Date()` in Node.js uses system timezone, which might be wrong

### 3. **Date Comparison Logic Error**

- The "today" check might be using UTC date instead of Africa/Lagos date
- Time zone offset not being applied correctly
- Off-by-one error in date calculation

### 4. **Database Timezone Issue**

- Dates stored in UTC but not being converted to Africa/Lagos for comparison
- The stored `date: "2026-02-12"` is lingering from yesterday

---

## Impact on Users

### Frontend Behavior

```
Current Flow:
1. User opens Daily Declaration Returns page
2. Tries to queue distribution for today (Feb 13)
3. Enters ROS percentages (1% for each of 2 slots)
4. Clicks "Queue Distribution" button
5. Frontend sends POST request with:
   - distributionSlots: [{slotNumber: 1, rosPercentage: 1}, {slotNumber: 2, rosPercentage: 1}]
   - multiSlotEnabled: true
   - 2FA code: valid

Result: ❌ 409 error - "distribution has already been executed"
Real Problem: Backend thinks it's still Feb 12
```

### Business Impact

- **No distributions queued:** Users' stakes are not being distributed
- **ROS calculations blocked:** Return on Stake cannot be processed
- **Premium/Performance pools blocked:** Pool distributions cannot be executed
- **Time-sensitive:** Multiple slots need to execute throughout the day (11:46:59, 12:59:59, etc.)
- **User trust damaged:** Scheduled distributions not happening

---

## How to Fix This

### IMMEDIATE ACTIONS (Next 30 minutes)

#### 1. Verify Backend Server Timezone

**SSH into the backend server (13.60.171.166:5001) and run:**

```bash
# Check current system timezone
date
# Should show: Thu Feb 13 11:xx:xx WAT 2026 (or Africa/Lagos)

# Check TZ environment variable
echo $TZ
# Should show: Africa/Lagos (or be empty if system TZ is correct)

# Verify system timezone setting
timedatectl status
# Should show: Africa/Lagos or UTC+01:00

# If wrong, set it:
sudo timedatectl set-timezone Africa/Lagos

# Verify the change
date
```

#### 2. Check Backend Configuration

In your backend code, find where you calculate "today's date":

**❌ WRONG (using UTC):**

```javascript
const today = new Date(); // Uses server timezone
const dateStr = today.toISOString().split('T')[0]; // Always UTC
```

**✅ CORRECT (using Africa/Lagos):**

```javascript
const tz = require('moment-timezone');
const today = tz.tz('Africa/Lagos').format('YYYY-MM-DD');
// OR using date-fns:
const today = formatInTimeZone(new Date(), 'Africa/Lagos', 'yyyy-MM-dd');
```

#### 3. Find All Date Calculations in Backend

Search for these patterns and ensure they use **Africa/Lagos timezone**:

**Files/Areas to Check:**

- [ ] `/api/admin/daily-declaration-returns/today/status` endpoint
- [ ] `/api/admin/daily-declaration-returns/today/queue` endpoint
- [ ] Distribution scheduling cron job
- [ ] Date comparison logic (e.g., `if (distribution.date === today)`)
- [ ] Any `new Date()` usage for date logic
- [ ] Database queries filtering by date

**Search Commands:**

```bash
# Find all date-related code
grep -r "new Date()" src/
grep -r "toISOString()" src/
grep -r "getDate()" src/
grep -r "distribution.date" src/
grep -r "today" src/ | grep -i date
```

#### 4. Restart Backend Service

After making timezone changes:

```bash
# If running with PM2
pm2 restart all

# If using Docker
docker-compose restart backend

# If running with systemd
sudo systemctl restart backend

# Verify it's running
curl -v http://13.60.171.166:5001/health
```

#### 5. Verify the Fix

**Test 1: Check API returns correct date**

```bash
curl -X GET https://api.novunt.com/api/v1/admin/daily-declaration-returns/today/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should have:
# "date": "2026-02-13"  (not 2026-02-12)
```

**Test 2: Try queuing a distribution**

```bash
curl -X POST https://api.novunt.com/api/v1/admin/daily-declaration-returns/today/queue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "multiSlotEnabled": true,
    "distributionSlots": [
      {"slotNumber": 1, "rosPercentage": 1},
      {"slotNumber": 2, "rosPercentage": 1}
    ],
    "rosPercentage": 2,
    "premiumPoolAmount": 0,
    "performancePoolAmount": 0,
    "twoFACode": "VALID_CODE"
  }'

# Should return 200 with success message, not 409
```

---

## Additional Context: Multi-Slot System Design

### What the Frontend Expects

The frontend has implemented a complete **per-slot distribution system**:

1. **Multiple Time Slots:** Up to 100 slots per day
2. **Independent Execution:** Each slot executes at its scheduled time (e.g., 11:46:59, 12:59:59)
3. **Per-Slot Status Tracking:** Each slot has status: PENDING → EXECUTING → COMPLETED
4. **Daily Queue:** Users should be able to queue a new distribution for each day

### Current Distribution Schedule (Configured)

- **Slot 1:** 11:46:59 WAT (Africa/Lagos)
- **Slot 2:** 12:59:59 WAT (Africa/Lagos)
- **Timezone:** Africa/Lagos (UTC+1)

### Expected Flow

```
Day: February 13, 2026
├── 11:46:59 WAT: Slot 1 executes (PENDING → EXECUTING → COMPLETED)
├── 12:59:59 WAT: Slot 2 executes (PENDING → EXECUTING → COMPLETED)
└── Tomorrow (Feb 14): Can queue new distribution

Current Behavior: ❌
Day: February 13, 2026 (but backend thinks it's Feb 12)
├── Cannot queue distribution (already executed yesterday)
├── Cannot distribute ROS
└── System is blocked
```

---

## Code Changes Required

### Backend Codebase Changes

**File: `src/services/dailyDeclarationReturnsService.ts`** (or equivalent)

```javascript
// ❌ WRONG - Remove this
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// ✅ CORRECT - Use this
const getTodayDate = () => {
  const tz = require('moment-timezone');
  return tz.tz('Africa/Lagos').format('YYYY-MM-DD');
  // Or alternatively:
  // const { formatInTimeZone } = require('date-fns-tz');
  // return formatInTimeZone(new Date(), 'Africa/Lagos', 'yyyy-MM-dd');
};

// Apply to all endpoints:
// - GET /today/status
// - POST /today/queue
// - POST /today/modify
// - Any date filtering in cron jobs
```

**File: `src/cron/distributionCronJob.ts`** (or equivalent)

```javascript
// Ensure cron job uses correct timezone for scheduling
const schedule = require('node-schedule');
const tz = 'Africa/Lagos';

// ❌ WRONG
schedule.scheduleJob('0 0 * * *', () => {
  /* job */
}); // UTC time

// ✅ CORRECT
schedule.scheduleJob(
  {
    rule: '46 11 * * *', // 11:46 AM
    tz: 'Africa/Lagos',
  },
  () => {
    /* execute slot 1 */
  }
);

schedule.scheduleJob(
  {
    rule: '59 12 * * *', // 12:59 PM
    tz: 'Africa/Lagos',
  },
  () => {
    /* execute slot 2 */
  }
);
```

---

## Verification Checklist

After making changes, verify:

- [ ] Backend server timezone is set to `Africa/Lagos`
- [ ] `date` command returns correct time with WAT timezone
- [ ] All date calculations in code use Africa/Lagos timezone
- [ ] `/today/status` endpoint returns today's date (2026-02-13)
- [ ] POST `/today/queue` accepts requests for today
- [ ] Returns 201 or 200 with success message (not 409)
- [ ] Frontend can successfully queue distributions
- [ ] Slots execute at scheduled times (11:46:59 and 12:59:59)
- [ ] Per-slot status changes PENDING → EXECUTING → COMPLETED
- [ ] Users receive ROS distributions as expected

---

## Timeline & Urgency

| When               | Action                                                     |
| ------------------ | ---------------------------------------------------------- |
| **NOW**            | Backend team investigates and fixes timezone issue         |
| **Within 1 hour**  | Restart backend service with timezone fix                  |
| **Within 2 hours** | Verify fix in production                                   |
| **Today**          | Users can queue distributions and execute them on schedule |

---

## Questions for Backend Team

Please confirm:

1. **What timezone is the backend server currently using?**

   ```bash
   date
   # Response should show Africa/Lagos or WAT
   ```

2. **Is the `TZ` environment variable set?**

   ```bash
   echo $TZ
   ```

3. **Where is "today's date" calculated in the codebase?**
   - Which file? Which function?

4. **What packages are used for date/timezone handling?**
   - moment-timezone?
   - date-fns-tz?
   - Luxon?
   - Plain JavaScript Date?

5. **Has the timezone been changed recently?**
   - Any recent deployments?
   - Any infrastructure changes?

---

## Contact & Support

**Frontend Team Status:**

- ✅ Multi-slot UI fully implemented
- ✅ Per-slot status tracking working
- ✅ Queue button fixed and functional
- ✅ Ready to queue distributions once backend date is correct

**Waiting for Backend Team:**

- 🔴 Date/timezone fix
- 🔴 Backend restart with correct timezone
- 🔴 Production verification

---

## References

- Backend IP: `13.60.171.166:5001`
- Production URL: `https://api.novunt.com/api/v1`
- Configured Timezone: `Africa/Lagos (UTC+1)`
- Current System Date: `2026-02-13`
- Expected Today's Date in API: `2026-02-13`
- Actual Today's Date in API: `2026-02-12` ❌

---

**Please respond with:**

1. Timezone investigation results
2. Root cause found
3. Fix applied
4. Backend restart completed
5. Verification that API returns correct date
6. Confirmation users can now queue distributions
