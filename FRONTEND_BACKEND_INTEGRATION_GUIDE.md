# 🔄 Frontend-Backend Integration Guide

## Multi-Slot Distribution System Refactoring

**Date**: February 13, 2026  
**Frontend Version**: v2.0 (Multi-Slot Only)  
**Status**: ✅ Frontend Complete - Backend Integration Required

---

## 📋 Executive Summary

The frontend has been **completely refactored** to remove single-slot distribution mode and make **multi-slot the only distribution method**. This enables **20+ ROS distributions per day** with an optimized user experience.

### What Changed

- ❌ **REMOVED**: Single-slot distribution mode (legacy system)
- ✅ **ENHANCED**: Multi-slot system now supports 20+ daily distributions
- ✅ **ADDED**: Bulk operations (Set All, Clear All)
- ✅ **FIXED**: Pool amount field mapping bug
- ✅ **OPTIMIZED**: UI for handling many slots efficiently

---

## 🎯 Frontend Architecture Changes

### 1. **Distribution Mode Removal**

**BEFORE (Old System):**

```typescript
// Users could toggle between two modes
type DistributionMode = 'single' | 'multi';

// Single-slot request
interface QueueSingleSlotRequest {
  rosPercentage: number;
  premiumPoolAmount: number;
  performancePoolAmount: number;
  description?: string;
}

// Multi-slot request
interface QueueMultiSlotRequest {
  multiSlotEnabled: true;
  distributionSlots: { slotNumber: number; rosPercentage: number }[];
  rosPercentage: number; // Total
  premiumPoolAmount: number;
  performancePoolAmount: number;
}
```

**AFTER (New System):**

```typescript
// Only one mode exists now
// Always sends multi-slot format

interface QueueMultiSlotRequest {
  multiSlotEnabled: true;
  distributionSlots: {
    slotNumber: number;
    rosPercentage: number;
  }[];
  rosPercentage: number; // Sum of all slot ROS percentages
  premiumPoolAmount: number;
  performancePoolAmount: number;
  description?: string;
  twoFACode?: string;
}
```

**Impact**: Frontend ALWAYS sends `multiSlotEnabled: true` now, even for a single distribution time.

---

### 2. **Enhanced Multi-Slot Input Component**

**File**: `src/components/admin/dailyDeclarationReturns/MultiSlotRosInput.tsx`

**New Features:**

- **Bulk Operations**:
  - "Set All" button - Apply same ROS % to all slots instantly
  - "Clear All" button - Reset all slots to 0%
  - Quick fill input field

- **Optimized for 20+ Slots**:
  - Scrollable container (max-height: 600px)
  - Compact card design (smaller padding, text)
  - Slot count in header: "ROS Distribution by Slot (20 slots)"

**Example UI Flow:**

```
1. Admin enters "0.5" in Quick Fill input
2. Clicks "Set All" → All 20 slots = 0.5%
3. Manually adjusts Slot 5 to 1.0%
4. Clicks "Queue Distribution"
```

---

### 3. **Critical Bug Fix: Pool Amount Field Mapping**

**Issue**: Distribution History was showing **$0** for all pool amounts.

**Root Cause**: Field name mismatch

- ✅ Backend sends: `totalPoolAmount`
- ❌ Frontend was reading: `poolsAmount` (doesn't exist)

**Fix Applied:**

```typescript
// src/types/dailyDeclarationReturns.ts
export interface HistoryEntry {
  date: string;
  status: 'COMPLETED' | 'FAILED';
  rosPercentage: number;
  totalPoolAmount: number; // ✅ Now correct
  poolsAmount?: number; // Deprecated (backwards compatibility)
  usersCount: number;
  executedAt: string;
  executedAtISO: string;
  error?: string;
}

// src/components/admin/dailyDeclarationReturns/HistoryTable.tsx
const poolsAmount = record?.totalPoolAmount ?? record?.poolsAmount ?? 0;
```

**Backend Verification Required**: Ensure the history endpoint returns `totalPoolAmount` field.

---

## ⚠️ Error Handling & Validation

### Error Response Format

**All endpoints must return errors in this format:**

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional context for debugging"
  }
}
```

### Standard Error Codes

#### Authentication Errors (401)

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": {
    "code": "INVALID_TOKEN"
  }
}

{
  "success": false,
  "message": "Invalid 2FA code",
  "error": {
    "code": "INVALID_2FA_CODE"
  }
}
```

#### Authorization Errors (403)

```json
{
  "success": false,
  "message": "Admin role required",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

#### Validation Errors (400)

```json
{
  "success": false,
  "message": "Invalid ROS percentage",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "rosPercentage",
      "value": 150,
      "expected": "0-100"
    }
  }
}

{
  "success": false,
  "message": "Distribution already exists for today",
  "error": {
    "code": "DISTRIBUTION_ALREADY_QUEUED"
  }
}

{
  "success": false,
  "message": "Total ROS does not match sum of slots",
  "error": {
    "code": "SLOT_ROS_MISMATCH",
    "details": {
      "declared": 10.5,
      "calculated": 9.8
    }
  }
}
```

#### Business Logic Errors (422)

```json
{
  "success": false,
  "message": "Cannot modify executing distribution",
  "error": {
    "code": "DISTRIBUTION_IN_PROGRESS"
  }
}

{
  "success": false,
  "message": "Cannot queue distribution for past date",
  "error": {
    "code": "INVALID_DATE"
  }
}
```

### Validation Rules

#### 1. **Queue Distribution Request**

```typescript
// Backend must validate:
{
  multiSlotEnabled: true,                    // ✅ Must be true
  distributionSlots: [                       // ✅ Array length: 1-100
    {
      slotNumber: number,                    // ✅ Sequential: 1, 2, 3...
      rosPercentage: number                  // ✅ 0-100
    }
  ],
  rosPercentage: number,                     // ✅ = sum(slot.rosPercentage)
  premiumPoolAmount: number,                 // ✅ >= 0
  performancePoolAmount: number,             // ✅ >= 0
  description?: string,                      // ✅ Max 500 chars
  twoFACode?: string                         // ✅ 6 digits, required if 2FA enabled
}
```

**Validation Checks**:

```javascript
// 1. Ensure multiSlotEnabled is true
if (data.multiSlotEnabled !== true) {
  throw new ValidationError('Multi-slot mode is required');
}

// 2. Validate slot count
if (data.distributionSlots.length === 0) {
  throw new ValidationError('At least one slot required');
}
if (data.distributionSlots.length > 100) {
  throw new ValidationError('Maximum 100 slots allowed');
}

// 3. Validate slot numbers are sequential
const slotNumbers = data.distributionSlots
  .map((s) => s.slotNumber)
  .sort((a, b) => a - b);
for (let i = 0; i < slotNumbers.length; i++) {
  if (slotNumbers[i] !== i + 1) {
    throw new ValidationError(
      `Slot numbers must be sequential starting from 1`
    );
  }
}

// 4. Validate ROS percentages
for (const slot of data.distributionSlots) {
  if (slot.rosPercentage < 0 || slot.rosPercentage > 100) {
    throw new ValidationError(`Slot ${slot.slotNumber}: ROS must be 0-100%`);
  }
}

// 5. Validate total ROS matches sum
const calculatedTotal = data.distributionSlots.reduce(
  (sum, s) => sum + s.rosPercentage,
  0
);
const tolerance = 0.001; // Allow floating point precision
if (Math.abs(calculatedTotal - data.rosPercentage) > tolerance) {
  throw new ValidationError(
    `Total ROS (${data.rosPercentage}) must equal sum of slots (${calculatedTotal})`
  );
}

// 6. Validate pool amounts
if (data.premiumPoolAmount < 0 || data.performancePoolAmount < 0) {
  throw new ValidationError('Pool amounts cannot be negative');
}

// 7. Check for existing distribution today
const existingDistribution = await DailyDeclarationReturn.findOne({
  date: moment().tz(timezone).format('YYYY-MM-DD'),
});
if (existingDistribution) {
  throw new BusinessLogicError('Distribution already queued for today');
}
```

#### 2. **Modify Distribution Request**

```javascript
// Backend must validate:
// - Distribution exists and is PENDING
// - Same validation rules as queue request
// - Cannot modify slots that are EXECUTING or COMPLETED

const distribution = await DailyDeclarationReturn.findOne({ date: today });

if (!distribution) {
  throw new NotFoundError('No distribution found for today');
}

if (distribution.status === 'EXECUTING') {
  throw new BusinessLogicError('Cannot modify executing distribution');
}

if (distribution.status === 'COMPLETED') {
  throw new BusinessLogicError('Cannot modify completed distribution');
}

// Allow modifications to PENDING slots only
const pendingSlots = distribution.distributionSlots.filter(
  (s) => s.status === 'PENDING'
);
if (pendingSlots.length === 0) {
  throw new BusinessLogicError('No pending slots to modify');
}
```

#### 3. **Cron Settings Validation**

```javascript
// When creating distribution schedule
const schedules = data.schedules.map((s) => ({
  slotNumber: s.slotNumber,
  hour: s.hour, // ✅ 0-23
  minute: s.minute, // ✅ 0-59
  second: s.second, // ✅ 0-59
}));

// Validate time values
for (const schedule of schedules) {
  if (schedule.hour < 0 || schedule.hour > 23) {
    throw new ValidationError(`Invalid hour: ${schedule.hour}`);
  }
  if (schedule.minute < 0 || schedule.minute > 59) {
    throw new ValidationError(`Invalid minute: ${schedule.minute}`);
  }
  if (schedule.second < 0 || schedule.second > 59) {
    throw new ValidationError(`Invalid second: ${schedule.second}`);
  }
}

// Check for duplicate time slots
const timeStrings = schedules.map((s) => `${s.hour}:${s.minute}:${s.second}`);
const uniqueTimes = new Set(timeStrings);
if (uniqueTimes.size !== timeStrings.length) {
  throw new ValidationError('Duplicate time slots detected');
}
```

---

## � Authentication & Authorization

### Headers Required for ALL Admin Endpoints

#### 1. **Bearer Token (Required)**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The JWT token contains:

```json
{
  "userId": "admin_id",
  "email": "admin@novunt.com",
  "role": "admin",
  "twoFAEnabled": true,
  "twoFAVerified": false,
  "iat": 1708000000,
  "exp": 1708086400
}
```

**Backend Must**:

- Verify JWT signature
- Check token expiration
- Extract admin details from token
- Use for audit logs (who queued distributions)

#### 2. **2FA Code (Required for Write Operations)**

Frontend sends `twoFACode` in **request body** (not headers):

```json
// POST/PATCH/DELETE requests
{
  "distributionSlots": [...],
  "rosPercentage": 1.0,
  "premiumPoolAmount": 1000,
  "performancePoolAmount": 1000,
  "twoFACode": "123456"  // ✅ 6-digit TOTP code
}
```

**Backend Must**:

- Verify TOTP code against admin's secret
- Accept codes within ±2 time steps (~90 second window)
- Return `401 Unauthorized` with `code: 'INVALID_2FA_CODE'` if wrong
- Skip 2FA validation for GET requests (read-only)

**Frontend Behavior**:

- Caches valid 2FA code for 85 seconds
- Auto-reuses cached code for multiple requests
- Prompts modal only when cache expired or invalid

#### 3. **CORS Configuration**

```javascript
// Backend must allow:
app.use(
  cors({
    origin: [
      'http://localhost:3000', // Development
      'https://novunt.vercel.app', // Production
      'https://novunt.com',
    ],
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

---

## 🔌 Backend API Requirements

### API Base URL

```
Development:  http://localhost:5001/api/v1
Production:   https://api.novunt.com/api/v1
```

**Environment Variable**: `NEXT_PUBLIC_API_URL`

### Required Endpoints (Must Be Implemented)

#### 1. **Queue Multi-Slot Distribution**

**Endpoint**: `POST /api/v1/admin/daily-declaration-returns/today/queue`

**Request Body (Always Multi-Slot Now):**

```json
{
  "multiSlotEnabled": true,
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 0.5 },
    { "slotNumber": 2, "rosPercentage": 0.3 },
    { "slotNumber": 3, "rosPercentage": 0.8 }
  ],
  "rosPercentage": 1.6,
  "premiumPoolAmount": 1000,
  "performancePoolAmount": 1000,
  "description": "Daily distribution",
  "twoFACode": "123456"
}
```

**⚠️ BREAKING CHANGE**: Frontend will **NEVER** send the old single-slot format anymore.

**Backend Must**:

- Accept `multiSlotEnabled: true` as the default/only format
- Handle `distributionSlots` array (1 to 20+ slots)
- Validate total ROS = sum of all slot ROS percentages
- Store each slot's ROS percentage separately

---

#### 2. **Get Today's Distribution Status**

**Endpoint**: `GET /api/v1/admin/daily-declaration-returns/today/status`

**Response Must Include:**

```json
{
  "success": true,
  "data": {
    "status": "PENDING" | "EXECUTING" | "COMPLETED" | "FAILED" | "EMPTY",
    "multiSlotEnabled": true,
    "distributionSlots": [
      {
        "slotNumber": 1,
        "rosPercentage": 0.5,
        "scheduledFor": "2026-02-13T09:00:00Z",
        "status": "PENDING" | "EXECUTING" | "COMPLETED" | "FAILED",
        "executionDetails": {
          "executedAt": "2026-02-13T09:00:15Z",
          "rosStats": {
            "processedStakes": 100,
            "totalDistributed": 500.50
          },
          "premiumPoolStats": {
            "usersReceived": 20,
            "totalDistributed": 1000.00
          },
          "performancePoolStats": {
            "usersReceived": 15,
            "totalDistributed": 1000.00
          },
          "executionTimeMs": 1523,
          "error": null
        }
      }
    ],
    "values": {
      "premiumPoolAmount": 1000,
      "performancePoolAmount": 1000,
      "description": "Daily distribution"
    },
    "scheduledFor": "2026-02-13T09:00:00Z",
    "queuedBy": { ... },
    "queuedAt": "2026-02-13T08:55:00Z"
  }
}
```

**Key Fields**:

- `multiSlotEnabled`: Must be `true` always
- `distributionSlots`: Array of slot execution statuses
- Each slot tracks its own execution state

---

#### 3. **Modify Pending Distribution**

**Endpoint**: `PATCH /api/v1/admin/daily-declaration-returns/today/modify`

**Request Body:**

```json
{
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 0.6 },
    { "slotNumber": 2, "rosPercentage": 0.4 }
  ],
  "rosPercentage": 1.0,
  "premiumPoolAmount": 1500,
  "performancePoolAmount": 1500,
  "description": "Updated",
  "twoFACode": "123456"
}
```

**Backend Must**:

- Allow modification of pending distributions only
- Update all slot ROS percentages
- Recalculate total ROS

---

#### 4. **Get Distribution History**

**Endpoint**: `GET /api/v1/admin/daily-declaration-returns/history`

**⚠️ CRITICAL FIX REQUIRED**: Response must include `totalPoolAmount`

**Response:**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "date": "2026-02-12",
        "status": "COMPLETED",
        "rosPercentage": 1.6,
        "totalPoolAmount": 2000.0, // ✅ THIS FIELD IS CRITICAL
        "usersCount": 45,
        "executedAt": "3:59:59 PM",
        "executedAtISO": "2026-02-12T15:59:59Z"
      }
    ],
    "totalRecords": 100,
    "currentPage": 1,
    "pageLimit": 50
  }
}
```

**Backend Must**:

- Return `totalPoolAmount` field (sum of premium + performance pools)
- Do NOT use `poolsAmount` (old field name)

---

#### 5. **Cron Settings Endpoints**

**✅ Already Implemented** (Backend confirmed working):

1. `GET /api/v1/admin/cron-settings/timezones`
2. `GET /api/v1/admin/cron-settings/distribution-schedule`
3. `PUT /api/v1/admin/cron-settings/distribution-schedule`
4. `PATCH /api/v1/admin/cron-settings/distribution-schedule/toggle`
5. `GET /cron-status` (public)

**No changes needed** - these endpoints work correctly.

---

## � Timezone & Scheduling

### Cron Settings Structure

#### Get Distribution Schedule

**Endpoint**: `GET /api/v1/admin/cron-settings/distribution-schedule`

**Response**:

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "timezone": "Africa/Lagos",
    "numberOfSlots": 20,
    "schedules": [
      {
        "slotNumber": 1,
        "hour": 0,
        "minute": 30,
        "second": 0,
        "displayTime": "00:30:00"
      },
      {
        "slotNumber": 2,
        "hour": 1,
        "minute": 30,
        "second": 0,
        "displayTime": "01:30:00"
      }
    ]
  }
}
```

### Timezone Handling

**Critical**: All times are in the configured timezone, NOT UTC.

```javascript
// When queuing distribution
const scheduledTime = moment()
  .tz(cronSettings.timezone)
  .hour(schedule.hour)
  .minute(schedule.minute)
  .second(schedule.second);

slot.scheduledFor = scheduledTime.toISOString();
```

### Cron Job Execution

```javascript
// Runs every minute
cron.schedule('* * * * *', async () => {
  const now = moment().tz(cronSettings.timezone);

  // Find pending slots scheduled for now or earlier
  const pendingSlots = await DistributionSlotExecution.findAll({
    where: {
      status: 'PENDING',
      scheduledFor: { $lte: now.toDate() },
    },
  });

  for (const slot of pendingSlots) {
    await executeSlot(slot);
  }
});

async function executeSlot(slot) {
  await slot.update({ status: 'EXECUTING' });

  try {
    // 1. Distribute ROS
    const rosStats = await distributeROS(slot.ros_percentage);

    // 2. Distribute pools (only on first slot)
    let poolStats = null;
    if (slot.slot_number === 1) {
      poolStats = await distributePools({
        premium: distribution.premium_pool_amount,
        performance: distribution.performance_pool_amount,
      });
    }

    // 3. Mark completed
    await slot.update({
      status: 'COMPLETED',
      processed_stakes: rosStats.processedStakes,
      total_ros_distributed: rosStats.totalDistributed,
      ...poolStats,
    });
  } catch (error) {
    await slot.update({
      status: 'FAILED',
      error_message: error.message,
    });
  }
}
```

---

## �🔄 Data Flow & Integration

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN DAILY WORKFLOW                        │
└─────────────────────────────────────────────────────────────┘

Step 1: Configure Schedule (One-time)
┌──────────────────────────────────────────────────┐
│ Frontend: /admin/settings/distribution-schedule │
│                                                  │
│ Admin sets 20 time slots:                       │
│  • Slot 1:  00:30:00                            │
│  • Slot 2:  01:30:00                            │
│  • ...                                           │
│  • Slot 20: 23:30:00                            │
└──────────────────────────────────────────────────┘
         │
         ├──> PUT /api/v1/admin/cron-settings/distribution-schedule
         │
         └──> Backend stores: {
                numberOfSlots: 20,
                schedules: [
                  { slotNumber: 1, hour: 0, minute: 30, second: 0 },
                  { slotNumber: 2, hour: 1, minute: 30, second: 0 },
                  ...
                ],
                timezone: "Africa/Lagos"
              }

Step 2: Queue Daily Distribution
┌──────────────────────────────────────────────────┐
│ Frontend: /admin/daily-declaration-returns       │
│                                                  │
│ Admin uses bulk operations:                      │
│  • Quick Fill: "0.5" → Set All                  │
│  • Adjust Slot 5: 1.0%                          │
│  • Premium Pool: $1000                          │
│  • Performance Pool: $1000                      │
│  • Click "Queue Distribution"                   │
└──────────────────────────────────────────────────┘
         │
         ├──> POST /api/v1/admin/daily-declaration-returns/today/queue
         │    {
         │      "multiSlotEnabled": true,
         │      "distributionSlots": [
         │        { "slotNumber": 1, "rosPercentage": 0.5 },
         │        { "slotNumber": 2, "rosPercentage": 0.5 },
         │        { "slotNumber": 3, "rosPercentage": 0.5 },
         │        { "slotNumber": 4, "rosPercentage": 0.5 },
         │        { "slotNumber": 5, "rosPercentage": 1.0 },
         │        ...
         │      ],
         │      "rosPercentage": 10.5,
         │      "premiumPoolAmount": 1000,
         │      "performancePoolAmount": 1000
         │    }
         │
         └──> Backend creates:
              • DailyDeclarationReturn record
              • DistributionSlotExecution records (20 rows)
              • Each slot: status = "PENDING", scheduledFor = calculated time

Step 3: Cron Job Execution (Automatic)
┌──────────────────────────────────────────────────┐
│ Backend Cron Job (runs every minute)             │
│                                                  │
│ At 00:30:00 WAT:                                │
│  • Find Slot 1 with status = PENDING            │
│  • Execute ROS distribution (0.5%)              │
│  • Update slot status → EXECUTING → COMPLETED   │
│  • Record execution stats                       │
│                                                  │
│ At 01:30:00 WAT:                                │
│  • Find Slot 2 with status = PENDING            │
│  • Execute ROS distribution (0.5%)              │
│  • ...repeat for all 20 slots                   │
└──────────────────────────────────────────────────┘

Step 4: Real-Time Monitoring
┌──────────────────────────────────────────────────┐
│ Frontend polls every 30s:                        │
│ GET /api/v1/admin/daily-declaration-returns/     │
│     today/status                                 │
│                                                  │
│ Displays:                                        │
│  • Slot 1: ✅ COMPLETED (0.5% at 00:30)         │
│  • Slot 2: ✅ COMPLETED (0.5% at 01:30)         │
│  • Slot 3: ⏳ EXECUTING (0.5% at 02:30)         │
│  • Slot 4: ⏰ PENDING (0.5% at 03:30)           │
│  • ...                                           │
└──────────────────────────────────────────────────┘

Step 5: History & Reporting
┌──────────────────────────────────────────────────┐
│ Frontend: Distribution History Tab               │
│                                                  │
│ GET /api/v1/admin/daily-declaration-returns/     │
│     history                                      │
│                                                  │
│ Shows:                                           │
│  Date       Status      ROS    Pools $    Users │
│  2026-02-12 COMPLETED   10.5%  $2,000     45    │
│  2026-02-11 COMPLETED   8.0%   $2,000     42    │
│  2026-02-10 COMPLETED   15.0%  $10,000    50    │
└──────────────────────────────────────────────────┘
```

---

## 🗄️ Backend Database Schema (Recommended)

### 1. **Daily Declaration Returns Table**

```sql
CREATE TABLE daily_declaration_returns (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  premium_pool_amount DECIMAL(15,2) NOT NULL,
  performance_pool_amount DECIMAL(15,2) NOT NULL,
  total_pool_amount DECIMAL(15,2) GENERATED ALWAYS AS
    (premium_pool_amount + performance_pool_amount) STORED,
  -- ✅ Add computed column for frontend compatibility

  multi_slot_enabled BOOLEAN DEFAULT true,  -- Always true now
  total_ros_percentage DECIMAL(5,2) NOT NULL,
  description TEXT,

  status VARCHAR(20) DEFAULT 'PENDING',
  -- PENDING, EXECUTING, COMPLETED, FAILED

  queued_by_admin_id INT REFERENCES admins(id),
  queued_at TIMESTAMP DEFAULT NOW(),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **Distribution Slot Executions Table** (NEW)

```sql
CREATE TABLE distribution_slot_executions (
  id SERIAL PRIMARY KEY,
  distribution_id INT REFERENCES daily_declaration_returns(id),
  slot_number INT NOT NULL,
  ros_percentage DECIMAL(5,2) NOT NULL,

  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  -- PENDING, EXECUTING, COMPLETED, FAILED

  -- Execution results
  executed_at TIMESTAMP,
  processed_stakes INT,
  total_ros_distributed DECIMAL(15,2),
  premium_pool_users INT,
  premium_pool_distributed DECIMAL(15,2),
  performance_pool_users INT,
  performance_pool_distributed DECIMAL(15,2),
  execution_time_ms INT,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(distribution_id, slot_number)
);
```

---

## 🔧 Backend Implementation Checklist

### Phase 1: Database Changes ✅

- [ ] Add `multi_slot_enabled` column (default true)
- [ ] Add `total_pool_amount` computed column
- [ ] Create `distribution_slot_executions` table
- [ ] Add indexes on `scheduled_for`, `status` columns

### Phase 2: API Endpoint Updates 🔄

- [ ] **Queue Endpoint**: Accept only multi-slot format
  - [ ] Validate `multiSlotEnabled === true`
  - [ ] Create slot execution records
  - [ ] Calculate scheduled times based on cron settings

- [ ] **Status Endpoint**: Return multi-slot details
  - [ ] Include `distributionSlots` array
  - [ ] Show per-slot execution status
  - [ ] Include execution stats for completed slots

- [ ] **History Endpoint**: Return `totalPoolAmount`
  - [ ] Add `totalPoolAmount` to response (CRITICAL)
  - [ ] Remove old `poolsAmount` field
  - [ ] Test with frontend

- [ ] **Modify Endpoint**: Update slot ROS percentages
  - [ ] Allow editing of pending slots
  - [ ] Recalculate total ROS

### Phase 3: Cron Job Implementation ⏰

- [ ] **Slot Execution Logic**:

  ```javascript
  // Pseudo-code
  async function executePendingSlots() {
    const now = moment().tz(cronSettings.timezone);

    // Find slots scheduled for this minute
    const pendingSlots = await DistributionSlotExecution.findAll({
      where: {
        status: 'PENDING',
        scheduled_for: {
          $lte: now.toDate(),
        },
      },
    });

    for (const slot of pendingSlots) {
      await executeSlot(slot);
    }
  }

  async function executeSlot(slot) {
    // 1. Update status to EXECUTING
    await slot.update({ status: 'EXECUTING' });

    try {
      // 2. Distribute ROS percentage
      const rosStats = await distributeROS(slot.ros_percentage);

      // 3. Distribute pools (only on first slot of the day)
      const poolStats =
        slot.slot_number === 1
          ? await distributePools(slot.distribution_id)
          : null;

      // 4. Update slot as COMPLETED
      await slot.update({
        status: 'COMPLETED',
        executed_at: new Date(),
        processed_stakes: rosStats.processedStakes,
        total_ros_distributed: rosStats.totalDistributed,
        ...poolStats,
      });
    } catch (error) {
      await slot.update({
        status: 'FAILED',
        error_message: error.message,
      });
    }
  }
  ```

- [ ] **Schedule Cron Job**:
  ```javascript
  // Run every minute
  cron.schedule('* * * * *', executePendingSlots);
  ```

### Phase 4: Testing & Validation ✅

- [ ] Test with 1 slot (backward compatibility)
- [ ] Test with 20 slots (full scale)
- [ ] Verify `totalPoolAmount` in history response
- [ ] Test slot status progression
- [ ] Test concurrent slot executions
- [ ] Load test with multiple admins

---

## 🧪 Integration Testing Script

### Frontend Testing Steps

```bash
# 1. Start frontend dev server
cd frontend-fe
pnpm run dev

# 2. Navigate to:
http://localhost:3000/admin/daily-declaration-returns

# 3. Test Operations:
✅ Verify no "Single-Slot" toggle exists
✅ See multi-slot ROS inputs
✅ Test "Set All" button with 0.5%
✅ Test "Clear All" button
✅ Manually adjust individual slots
✅ Set premium/performance pools
✅ Click "Queue Distribution"
```

### Backend API Testing

```bash
# 1. Test Queue Endpoint
curl -X POST http://api.novunt.com/api/v1/admin/daily-declaration-returns/today/queue \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "multiSlotEnabled": true,
    "distributionSlots": [
      { "slotNumber": 1, "rosPercentage": 0.5 },
      { "slotNumber": 2, "rosPercentage": 0.5 }
    ],
    "rosPercentage": 1.0,
    "premiumPoolAmount": 1000,
    "performancePoolAmount": 1000
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Distribution queued successfully",
#   "data": { ... }
# }

# 2. Test Status Endpoint
curl http://api.novunt.com/api/v1/admin/daily-declaration-returns/today/status \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "data": {
#     "status": "PENDING",
#     "multiSlotEnabled": true,
#     "distributionSlots": [ ... ]
#   }
# }

# 3. Test History Endpoint (CRITICAL)
curl http://api.novunt.com/api/v1/admin/daily-declaration-returns/history \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "data": {
#     "records": [
#       {
#         "date": "2026-02-12",
#         "totalPoolAmount": 2000.00  // ✅ MUST BE PRESENT
#       }
#     ]
#   }
# }

# ❌ WRONG: "poolsAmount" field
# ✅ RIGHT: "totalPoolAmount" field
```

---

## 🚨 Critical Integration Points

### 1. **Field Name Change** (HIGHEST PRIORITY)

```diff
# Backend History Endpoint Response
{
  "records": [
    {
      "date": "2026-02-12",
-     "poolsAmount": 2000.00,     // ❌ OLD (Frontend won't read this)
+     "totalPoolAmount": 2000.00  // ✅ NEW (Frontend expects this)
    }
  ]
}
```

**Action**: Update history endpoint to return `totalPoolAmount`.

### 2. **Multi-Slot Always Enabled**

```typescript
// Frontend ALWAYS sends this now
{
  "multiSlotEnabled": true,  // ✅ This is mandatory
  "distributionSlots": [ ... ]
}
```

**Action**: Backend must handle this as the default format.

### 3. **Slot Execution Independence**

Each slot must execute independently:

- Slot 1 at 00:30 → ROS 0.5% + Pools $2000
- Slot 2 at 01:30 → ROS 0.5% only (pools already distributed)
- Slot 3 at 02:30 → ROS 0.3% only
- ...

**Action**: Implement per-slot execution tracking.

---

## 📊 Monitoring & Logging

### Backend Should Log:

```javascript
// Queue action
console.log(
  `[QUEUE] Admin ${adminId} queued ${slots.length} slots for ${date}`
);

// Cron execution
console.log(`[CRON] Executing Slot ${slotNumber} (ROS: ${ros}%) at ${now}`);

// Completion
console.log(
  `[SUCCESS] Slot ${slotNumber} completed in ${time}ms. Distributed: $${amount}`
);

// Failure
console.error(`[ERROR] Slot ${slotNumber} failed: ${error.message}`);
```

### Frontend Already Logs:

```javascript
// Form submission
console.log('Queuing distribution:', payload);

// Status polling
console.log('Distribution status:', statusData);

// Errors
console.error('Failed to queue distribution:', error);
```

---

## 🎯 Success Criteria

### Frontend ✅

- [x] Single-slot mode removed
- [x] Multi-slot enhanced for 20+ slots
- [x] Bulk operations working
- [x] Pool amount bug fixed
- [x] Code pushed to GitHub

### Backend (Pending)

- [ ] Database schema updated
- [ ] Queue endpoint accepts multi-slot only
- [ ] Status endpoint returns slot details
- [ ] History endpoint returns `totalPoolAmount`
- [ ] Cron job executes slots independently
- [ ] All endpoints tested with frontend

### Integration Tests ✅

- [ ] Frontend can queue 20 slots
- [ ] Backend stores all slots correctly
- [ ] Cron executes slots at scheduled times
- [ ] Frontend shows real-time execution status
- [ ] History displays correct pool amounts

---

## 📞 Support & Contact

**Frontend Repository**: https://github.com/NovuntFinance/frontend-fe  
**Current Branch**: `main`  
**Latest Commits**:

- `e0894df` - Multi-slot refactoring
- `3a575f8` - Linting fixes
- `a527075` - Pool amount field fix

**Questions?**

- Frontend issues: Check GitHub Issues
- Backend integration: Use this document as reference
- API contract: See "Backend API Requirements" section

---

## 🚀 Quick Start for Backend Team

1. **Read this entire document**
2. **Update history endpoint** to return `totalPoolAmount` (1 hour)
3. **Update queue endpoint** to handle multi-slot only (2 hours)
4. **Implement slot execution table** (3 hours)
5. **Update cron job** to execute slots independently (4 hours)
6. **Test with frontend** (2 hours)

**Total Estimated Time**: 1-2 days for complete integration

---

## 📝 Quick Reference: API Contracts

### Request Payloads (What Frontend Sends)

#### Queue Distribution

```json
POST /api/v1/admin/daily-declaration-returns/today/queue
Authorization: Bearer <token>

{
  "multiSlotEnabled": true,
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 0.5 },
    { "slotNumber": 2, "rosPercentage": 0.3 }
  ],
  "rosPercentage": 0.8,
  "premiumPoolAmount": 1000,
  "performancePoolAmount": 1000,
  "description": "Daily distribution",
  "twoFACode": "123456"
}
```

#### Modify Distribution

```json
PATCH /api/v1/admin/daily-declaration-returns/today/modify
Authorization: Bearer <token>

{
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 0.6 },
    { "slotNumber": 2, "rosPercentage": 0.4 }
  ],
  "rosPercentage": 1.0,
  "premiumPoolAmount": 1500,
  "performancePoolAmount": 1500,
  "description": "Updated",
  "twoFACode": "123456"
}
```

### Response Payloads (What Frontend Expects)

#### Today's Status

```json
GET /api/v1/admin/daily-declaration-returns/today/status

{
  "success": true,
  "data": {
    "today": "2026-02-13",
    "status": "PENDING",
    "multiSlotEnabled": true,
    "distributionSlots": [
      {
        "slotNumber": 1,
        "rosPercentage": 0.5,
        "scheduledFor": "2026-02-13T09:00:00Z",
        "status": "PENDING",
        "executionDetails": null
      }
    ],
    "values": {
      "premiumPoolAmount": 1000,
      "performancePoolAmount": 1000,
      "description": "Daily distribution"
    }
  }
}
```

#### History

```json
GET /api/v1/admin/daily-declaration-returns/history

{
  "success": true,
  "data": {
    "records": [
      {
        "date": "2026-02-12",
        "status": "COMPLETED",
        "rosPercentage": 1.6,
        "totalPoolAmount": 2000.00,    // ✅ CRITICAL FIELD
        "usersCount": 45,
        "executedAt": "3:59:59 PM",
        "executedAtISO": "2026-02-12T15:59:59Z"
      }
    ],
    "totalRecords": 100,
    "currentPage": 1,
    "pageLimit": 50
  }
}
```

### Critical Fields Mapping

| Frontend Reads      | Backend Must Send   | Type    | Notes                            |
| ------------------- | ------------------- | ------- | -------------------------------- |
| `totalPoolAmount`   | `totalPoolAmount`   | number  | ✅ REQUIRED in history           |
| `multiSlotEnabled`  | `multiSlotEnabled`  | boolean | Always `true` now                |
| `distributionSlots` | `distributionSlots` | array   | Slot details with status         |
| `scheduledFor`      | `scheduledFor`      | string  | ISO 8601 timestamp               |
| `executedAtISO`     | `executedAtISO`     | string  | ISO 8601 timestamp               |
| `executedAt`        | `executedAt`        | string  | Display format (e.g., "3:59 PM") |

### Error Codes

| Code                          | HTTP | Meaning                              |
| ----------------------------- | ---- | ------------------------------------ |
| `INVALID_TOKEN`               | 401  | JWT expired or invalid               |
| `INVALID_2FA_CODE`            | 401  | TOTP code wrong                      |
| `VALIDATION_ERROR`            | 400  | Invalid input data                   |
| `DISTRIBUTION_ALREADY_QUEUED` | 400  | Already exists for today             |
| `SLOT_ROS_MISMATCH`           | 400  | Total ≠ sum of slots                 |
| `DISTRIBUTION_IN_PROGRESS`    | 422  | Cannot modify executing distribution |
| `INVALID_DATE`                | 422  | Cannot queue for past date           |

---

**Last Updated**: February 13, 2026  
**Document Version**: 1.0  
**Frontend Status**: ✅ Production Ready  
**Backend Status**: ⏳ Integration Required
