# Backend Implementation Request: Multi-Slot Distribution System

## 📋 Overview

We need to implement a **Multi-Slot Distribution System** that allows the admin to schedule and execute multiple ROS (Returns on Stake) distributions throughout the day, instead of just one at 3:59:59 PM.

**Current System:** One distribution per day at fixed time (3:59:59 PM Nigeria Time)  
**New System:** 1-10 configurable distribution slots per day at custom times

**Frontend Status:** ✅ 100% Complete and ready  
**Backend Status:** ❌ Needs implementation  
**Priority:** High - Frontend is blocked waiting for these endpoints

---

## 🎯 Business Requirements

1. **Admin can configure 1-10 distribution time slots per day**
   - Each slot has a specific time (HH:MM:SS format)
   - Example: Slot 1 at 09:00:00, Slot 2 at 15:00:00, Slot 3 at 21:00:00

2. **Admin can select timezone for execution**
   - Support 60+ timezones (Africa/Lagos, America/New_York, Europe/London, etc.)
   - All slot times execute in the selected timezone

3. **Admin can enable/disable the cron schedule**
   - When disabled, scheduled distributions don't auto-execute
   - Manual queuing still works

4. **Admin can queue distribution with per-slot ROS percentages**
   - Single-slot mode: One ROS % for entire day (legacy, must stay working)
   - Multi-slot mode: Different ROS % for each slot
   - Example: Slot 1: 1.5%, Slot 2: 2.0%, Slot 3: 1.0%

5. **System executes each slot independently**
   - Each slot runs at its scheduled time
   - Status tracked per slot (PENDING → EXECUTING → COMPLETED/FAILED)
   - Frontend displays real-time status for each slot

6. **Configuration changes apply without server restart**
   - When admin updates schedule, cron jobs restart automatically
   - No manual intervention required

---

## 🗄️ Database Schema

### Table 1: `cron_distribution_settings`

Stores the main cron configuration (one active record at a time).

```sql
CREATE TABLE cron_distribution_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  number_of_slots INT NOT NULL CHECK(number_of_slots BETWEEN 1 AND 10),
  timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Lagos',
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,  -- admin user_id
  INDEX idx_enabled (is_enabled),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Notes:**

- Only keep the most recent record (or use single-row table pattern)
- `number_of_slots` dictates how many schedule entries exist
- `is_enabled` controls whether cron jobs run

### Table 2: `cron_distribution_schedules`

Stores individual slot time configurations.

```sql
CREATE TABLE cron_distribution_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  settings_id INT NOT NULL,
  slot_number INT NOT NULL CHECK(slot_number >= 1),
  hour INT NOT NULL CHECK(hour BETWEEN 0 AND 23),
  minute INT NOT NULL CHECK(minute BETWEEN 0 AND 59),
  second INT NOT NULL CHECK(second BETWEEN 0 AND 59),
  label VARCHAR(50),  -- Optional: "Morning", "Afternoon", etc.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (settings_id) REFERENCES cron_distribution_settings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slot_per_setting (settings_id, slot_number)
);
```

**Notes:**

- One record per slot
- `slot_number` starts at 1 (not 0)
- Time is stored as separate hour/minute/second integers
- Cascade delete when settings are updated

### Table 3: `distribution_slot_executions`

Tracks daily distribution execution per slot (for status monitoring).

```sql
CREATE TABLE distribution_slot_executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  distribution_date DATE NOT NULL,
  slot_number INT NOT NULL,
  slot_time TIME NOT NULL,  -- Scheduled execution time
  ros_percentage DECIMAL(5,2) NOT NULL,  -- ROS for this slot
  premium_pool_percentage DECIMAL(5,2),
  performance_pool_amount DECIMAL(15,2),
  status ENUM('PENDING', 'EXECUTING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  basic_pool_amount DECIMAL(15,2),  -- Calculated after execution
  premium_pool_amount_distributed DECIMAL(15,2),  -- Actual distributed amount
  total_users_processed INT,
  execution_started_at TIMESTAMP NULL,
  execution_completed_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_daily_slot (distribution_date, slot_number),
  INDEX idx_date_status (distribution_date, status),
  INDEX idx_date_slot (distribution_date, slot_number)
);
```

**Notes:**

- One record per slot per day
- Created when admin queues distribution
- Updated by cron job during execution
- `status` transitions: PENDING → EXECUTING → COMPLETED/FAILED
- Store execution details for frontend display

---

## 🔌 API Endpoints to Implement

### Endpoint 1: Get Available Timezones

**Endpoint:** `GET /api/cron/timezones`  
**Authentication:** None (public endpoint)  
**Description:** Returns list of supported timezones

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "timezone": "Africa/Lagos",
      "offset": "UTC+1:00",
      "region": "Africa"
    },
    {
      "timezone": "Africa/Cairo",
      "offset": "UTC+2:00",
      "region": "Africa"
    },
    {
      "timezone": "America/New_York",
      "offset": "UTC-5:00",
      "region": "Americas"
    },
    {
      "timezone": "America/Los_Angeles",
      "offset": "UTC-8:00",
      "region": "Americas"
    },
    {
      "timezone": "Europe/London",
      "offset": "UTC+0:00",
      "region": "Europe"
    },
    {
      "timezone": "Europe/Paris",
      "offset": "UTC+1:00",
      "region": "Europe"
    },
    {
      "timezone": "Asia/Dubai",
      "offset": "UTC+4:00",
      "region": "Asia"
    },
    {
      "timezone": "Asia/Tokyo",
      "offset": "UTC+9:00",
      "region": "Asia"
    },
    {
      "timezone": "Pacific/Auckland",
      "offset": "UTC+13:00",
      "region": "Pacific"
    }
  ]
}
```

**Implementation Notes:**

- Can be static data (hardcoded array)
- Include at least 60+ common timezones
- Group by region for frontend display
- Use IANA timezone names (moment-timezone or date-fns-tz)

---

### Endpoint 2: Get Current Distribution Schedule

**Endpoint:** `GET /api/cron/distribution-schedule`  
**Authentication:** Admin token required  
**Description:** Returns current cron configuration

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "numberOfSlots": 3,
    "timezone": "Africa/Lagos",
    "isEnabled": true,
    "schedules": [
      {
        "slotNumber": 1,
        "hour": 9,
        "minute": 0,
        "second": 0,
        "label": "Morning Distribution"
      },
      {
        "slotNumber": 2,
        "hour": 15,
        "minute": 0,
        "second": 0,
        "label": "Afternoon Distribution"
      },
      {
        "slotNumber": 3,
        "hour": 21,
        "minute": 0,
        "second": 0,
        "label": "Evening Distribution"
      }
    ],
    "nextExecution": "2026-02-11T09:00:00Z",
    "createdAt": "2026-02-10T10:30:00Z",
    "updatedAt": "2026-02-11T08:00:00Z"
  }
}
```

**Response (No Schedule Configured):**

```json
{
  "success": false,
  "message": "No distribution schedule configured",
  "statusCode": 404
}
```

**Implementation Logic:**

1. Query `cron_distribution_settings` for most recent enabled record
2. Join with `cron_distribution_schedules` to get slot times
3. Order schedules by `slot_number ASC`
4. Calculate `nextExecution` based on current time and timezone
5. Return 404 if no settings exist

---

### Endpoint 3: Update Distribution Schedule

**Endpoint:** `PATCH /api/cron/distribution-schedule`  
**Authentication:** Admin token + 2FA code required  
**Description:** Updates cron configuration and restarts cron jobs

**Request Headers:**

```
Authorization: Bearer <admin_token>
X-2FA-Code: 123456
Content-Type: application/json
```

**Request Body:**

```json
{
  "numberOfSlots": 3,
  "timezone": "Africa/Lagos",
  "schedules": [
    {
      "slotNumber": 1,
      "hour": 9,
      "minute": 0,
      "second": 0,
      "label": "Morning"
    },
    {
      "slotNumber": 2,
      "hour": 15,
      "minute": 0,
      "second": 0,
      "label": "Afternoon"
    },
    {
      "slotNumber": 3,
      "hour": 21,
      "minute": 0,
      "second": 0,
      "label": "Evening"
    }
  ]
}
```

**Validation Rules:**

- `numberOfSlots`: Integer between 1-10
- `timezone`: Must be valid IANA timezone
- `schedules`: Array length must equal `numberOfSlots`
- Each schedule must have:
  - `slotNumber`: 1 to numberOfSlots (unique, sequential)
  - `hour`: 0-23
  - `minute`: 0-59
  - `second`: 0-59
  - `label`: Optional string, max 50 chars
- No duplicate slot numbers
- No duplicate times (each slot must have unique time)

**Response (Success):**

```json
{
  "success": true,
  "message": "Distribution schedule updated successfully. Cron jobs restarted.",
  "data": {
    "numberOfSlots": 3,
    "timezone": "Africa/Lagos",
    "isEnabled": true,
    "schedules": [
      /* same as GET response */
    ],
    "nextExecution": "2026-02-11T09:00:00Z"
  }
}
```

**Response (Validation Error):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "numberOfSlots must be between 1 and 10",
    "Duplicate slot number: 2",
    "Invalid hour value: 25 (must be 0-23)"
  ],
  "statusCode": 400
}
```

**Response (2FA Error):**

```json
{
  "success": false,
  "message": "Invalid 2FA code",
  "statusCode": 401
}
```

**Implementation Logic:**

1. Validate admin token
2. **Validate 2FA code** (if admin has 2FA enabled)
3. Validate request body (see validation rules above)
4. Begin database transaction:
   - Insert new `cron_distribution_settings` record
   - Delete old `cron_distribution_schedules` for previous setting
   - Insert new `cron_distribution_schedules` records
   - Commit transaction
5. **CRITICAL:** Call `restartCronJobs()` function to reload schedules
6. Return updated configuration

---

### Endpoint 4: Toggle Cron Enable/Disable

**Endpoint:** `POST /api/cron/toggle`  
**Authentication:** Admin token + 2FA code required  
**Description:** Enables or disables automatic cron execution

**Request Headers:**

```
Authorization: Bearer <admin_token>
X-2FA-Code: 123456
Content-Type: application/json
```

**Request Body:**

```json
{
  "isEnabled": true
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Cron job enabled successfully",
  "data": {
    "isEnabled": true,
    "nextExecution": "2026-02-11T09:00:00Z"
  }
}
```

**Implementation Logic:**

1. Validate admin token
2. **Validate 2FA code**
3. Update `is_enabled` field in `cron_distribution_settings`
4. If enabling: Call `startCronJobs()`
5. If disabling: Call `stopCronJobs()`
6. Return new status

---

### Endpoint 5: Get Cron Status (Public)

**Endpoint:** `GET /api/cron/cron-status`  
**Authentication:** None (public endpoint)  
**Description:** Returns current cron job status

**Response:**

```json
{
  "isEnabled": true,
  "nextExecution": "2026-02-11T09:00:00Z",
  "totalSlots": 3,
  "timezone": "Africa/Lagos"
}
```

**Implementation Logic:**

1. Query `cron_distribution_settings` for active configuration
2. Calculate next execution time across all slots
3. Return public info (no sensitive data)

---

### Endpoint 6: Update Queue Distribution Endpoint (MODIFY EXISTING)

**Endpoint:** `POST /api/daily-declaration-returns/queue-distribution`  
**Authentication:** Admin token + 2FA code required  
**Description:** Queue distribution for today (single or multi-slot)

**IMPORTANT:** This endpoint already exists. You need to **modify it** to support multi-slot mode while keeping single-slot mode working.

**Request Body (Single-Slot - Legacy):**

```json
{
  "mode": "single",
  "ros": 2.5,
  "premiumPoolPercentage": 10,
  "performancePoolAmount": 5000,
  "description": "Optional notes"
}
```

**Request Body (Multi-Slot - NEW):**

```json
{
  "mode": "multi",
  "slots": [
    {
      "slotNumber": 1,
      "slotTime": "09:00:00",
      "ros": 1.5
    },
    {
      "slotNumber": 2,
      "slotTime": "15:00:00",
      "ros": 2.0
    },
    {
      "slotNumber": 3,
      "slotTime": "21:00:00",
      "ros": 1.0
    }
  ],
  "premiumPoolPercentage": 10,
  "performancePoolAmount": 5000,
  "description": "Optional notes"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Distribution queued successfully for 3 slots",
  "data": {
    "distributionDate": "2026-02-11",
    "mode": "multi",
    "slots": [
      {
        "slotNumber": 1,
        "slotTime": "09:00:00",
        "rosPercentage": 1.5,
        "status": "PENDING",
        "scheduledFor": "2026-02-11T09:00:00Z"
      },
      {
        "slotNumber": 2,
        "slotTime": "15:00:00",
        "rosPercentage": 2.0,
        "status": "PENDING",
        "scheduledFor": "2026-02-11T15:00:00Z"
      },
      {
        "slotNumber": 3,
        "slotTime": "21:00:00",
        "rosPercentage": 1.0,
        "status": "PENDING",
        "scheduledFor": "2026-02-11T21:00:00Z"
      }
    ]
  }
}
```

**Implementation Logic:**

**For Single-Slot Mode (keep existing logic):**

1. Validate 2FA
2. Create one distribution record with status PENDING
3. Schedule execution for 3:59:59 PM Nigeria Time
4. Return confirmation

**For Multi-Slot Mode (NEW):**

1. Validate 2FA
2. Validate that `slots.length` matches configured `numberOfSlots`
3. For each slot in request:
   - Validate `slotNumber` exists in cron schedule
   - Validate `slotTime` matches configured time for that slot
   - Insert `distribution_slot_executions` record:
     - `distribution_date`: Today's date
     - `slot_number`: From request
     - `slot_time`: From request
     - `ros_percentage`: From request
     - `premium_pool_percentage`: From request
     - `performance_pool_amount`: From request
     - `status`: 'PENDING'
     - `execution_started_at`: NULL
     - `execution_completed_at`: NULL
4. Return array of queued slots
5. Cron jobs will auto-execute at scheduled times

**Validation:**

- Can only queue once per day (check if records already exist for today)
- Slot count must match cron configuration
- Slot times must match cron configuration
- ROS values must be 0-100

---

### Endpoint 7: Update Today Status Endpoint (MODIFY EXISTING)

**Endpoint:** `GET /api/daily-declaration-returns/today-status`  
**Authentication:** Admin token required  
**Description:** Get today's distribution status

**IMPORTANT:** This endpoint already exists. You need to **modify it** to return per-slot status for multi-slot distributions.

**Response (Single-Slot - Legacy):**

```json
{
  "success": true,
  "data": {
    "status": "PENDING",
    "multiSlotEnabled": false,
    "scheduledFor": "2026-02-11T15:59:59Z",
    "values": {
      "rosPercentage": 2.5,
      "premiumPoolAmount": 10000,
      "performancePoolAmount": 5000,
      "description": "Daily distribution"
    }
  }
}
```

**Response (Multi-Slot - NEW):**

```json
{
  "success": true,
  "data": {
    "status": "PENDING", // Overall: PENDING if any slot pending, EXECUTING if any executing, COMPLETED if all completed
    "multiSlotEnabled": true,
    "distributionDate": "2026-02-11",
    "distributionSlots": [
      {
        "slotNumber": 1,
        "slotTime": "09:00:00",
        "rosPercentage": 1.5,
        "status": "COMPLETED",
        "scheduledFor": "2026-02-11T09:00:00Z",
        "executionDetails": {
          "executionTime": "2026-02-11T09:00:03Z",
          "basicPoolAmount": 12000.5,
          "premiumPoolAmount": 1200.0,
          "totalDistributed": 13200.5,
          "totalUsersProcessed": 150,
          "message": "Distribution completed successfully"
        }
      },
      {
        "slotNumber": 2,
        "slotTime": "15:00:00",
        "rosPercentage": 2.0,
        "status": "EXECUTING",
        "scheduledFor": "2026-02-11T15:00:00Z",
        "executionDetails": {
          "executionTime": "2026-02-11T15:00:02Z"
        }
      },
      {
        "slotNumber": 3,
        "slotTime": "21:00:00",
        "rosPercentage": 1.0,
        "status": "PENDING",
        "scheduledFor": "2026-02-11T21:00:00Z",
        "executionDetails": null
      }
    ],
    "values": {
      "premiumPoolPercentage": 10,
      "performancePoolAmount": 5000,
      "description": "Multi-slot distribution"
    }
  }
}
```

**Response (Failed Slot):**

```json
{
  "slotNumber": 2,
  "slotTime": "15:00:00",
  "rosPercentage": 2.0,
  "status": "FAILED",
  "scheduledFor": "2026-02-11T15:00:00Z",
  "executionDetails": {
    "executionTime": "2026-02-11T15:00:02Z",
    "message": "Insufficient pool balance",
    "error": "PoolBalanceError: Available balance $5000 is less than required $15000"
  }
}
```

**Implementation Logic:**

1. Query `distribution_slot_executions` for today's date
2. If no records found, check legacy single-slot table
3. For each slot execution record:
   - Include `slot_number`, `slot_time`, `ros_percentage`, `status`
   - If status is EXECUTING or COMPLETED or FAILED, include `executionDetails`
   - Join execution times, amounts, error messages
4. Calculate overall status:
   - If any slot is EXECUTING → overall EXECUTING
   - If any slot is FAILED → overall FAILED
   - If all slots are COMPLETED → overall COMPLETED
   - Otherwise → overall PENDING
5. Return complete status object

---

## ⚙️ Cron Job Implementation

### Core Requirements

1. **Multiple Scheduled Jobs**
   - Create one cron job per slot
   - Each job runs at its configured time
   - Use timezone-aware scheduling (moment-timezone, date-fns-tz, or node-cron with timezone support)

2. **Dynamic Job Management**
   - Load schedule from database on server startup
   - When admin updates schedule (PATCH endpoint), stop all jobs and restart with new schedule
   - When admin disables cron (POST toggle), stop all jobs
   - When admin enables cron, start all jobs

3. **Execution Flow per Slot**

```javascript
// Pseudo-code for each slot's cron job
async function executeSlot(slotNumber, scheduledTime) {
  const today = moment().format('YYYY-MM-DD');

  // 1. Check if distribution is queued for this slot today
  const execution = await DistributionSlotExecution.findOne({
    where: {
      distribution_date: today,
      slot_number: slotNumber,
      status: 'PENDING',
    },
  });

  if (!execution) {
    console.log(`No distribution queued for slot ${slotNumber} today`);
    return;
  }

  try {
    // 2. Update status to EXECUTING
    await execution.update({
      status: 'EXECUTING',
      execution_started_at: new Date(),
    });

    // 3. Perform distribution calculation
    const totalStakes = await calculateTotalActiveStakes();
    const basicPoolAmount = (totalStakes * execution.ros_percentage) / 100;
    const premiumPoolAmount = execution.premium_pool_percentage
      ? (totalStakes * execution.premium_pool_percentage) / 100
      : 0;

    // 4. Execute distribution to users
    const distributionResult = await distributeToUsers({
      basicPoolAmount,
      premiumPoolAmount,
      performancePoolAmount: execution.performance_pool_amount,
      rosPercentage: execution.ros_percentage,
      date: today,
      slotNumber: slotNumber,
    });

    // 5. Update status to COMPLETED
    await execution.update({
      status: 'COMPLETED',
      basic_pool_amount: distributionResult.basicPoolAmount,
      premium_pool_amount_distributed: distributionResult.premiumPoolAmount,
      total_users_processed: distributionResult.usersProcessed,
      execution_completed_at: new Date(),
    });

    console.log(`Slot ${slotNumber} distribution completed successfully`);
  } catch (error) {
    // 6. Update status to FAILED
    await execution.update({
      status: 'FAILED',
      error_message: error.message,
      execution_completed_at: new Date(),
    });

    console.error(`Slot ${slotNumber} distribution failed:`, error);

    // Optional: Send alert to admins
    await sendAdminAlert({
      type: 'DISTRIBUTION_FAILED',
      slotNumber,
      error: error.message,
      date: today,
    });
  }
}
```

4. **Job Scheduler Example (Using node-cron)**

```javascript
const cron = require('node-cron');
const moment = require('moment-timezone');

// Global storage for cron jobs
let activeCronJobs = [];

// Function to load and start cron jobs
async function startCronJobs() {
  // Stop existing jobs first
  stopCronJobs();

  // Load settings from database
  const settings = await CronDistributionSettings.findOne({
    where: { is_enabled: true },
    include: [{ model: CronDistributionSchedule, as: 'schedules' }],
  });

  if (!settings) {
    console.log('No cron settings configured');
    return;
  }

  console.log(
    `Starting ${settings.schedules.length} cron jobs in ${settings.timezone}`
  );

  // Create cron job for each slot
  settings.schedules.forEach((schedule) => {
    const cronExpression = `${schedule.second} ${schedule.minute} ${schedule.hour} * * *`;

    const job = cron.schedule(
      cronExpression,
      async () => {
        console.log(
          `Executing slot ${schedule.slot_number} at ${schedule.hour}:${schedule.minute}:${schedule.second}`
        );
        await executeSlot(schedule.slot_number, schedule);
      },
      {
        scheduled: true,
        timezone: settings.timezone,
      }
    );

    activeCronJobs.push({
      slotNumber: schedule.slot_number,
      job: job,
      schedule: cronExpression,
    });

    console.log(
      `Cron job registered for slot ${schedule.slot_number}: ${cronExpression} (${settings.timezone})`
    );
  });
}

// Function to stop all cron jobs
function stopCronJobs() {
  activeCronJobs.forEach(({ job, slotNumber }) => {
    job.stop();
    console.log(`Stopped cron job for slot ${slotNumber}`);
  });
  activeCronJobs = [];
}

// Function to restart cron jobs (called after schedule update)
async function restartCronJobs() {
  console.log('Restarting cron jobs...');
  stopCronJobs();
  await startCronJobs();
  console.log('Cron jobs restarted successfully');
}

// Initialize on server startup
startCronJobs();
```

---

## 🧪 Testing Requirements

### Unit Tests

Test each component independently:

```javascript
// Test timezone endpoint
describe('GET /api/cron/timezones', () => {
  it('should return list of timezones', async () => {
    const response = await request(app).get('/api/cron/timezones');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(50);
    expect(response.body.data[0]).toHaveProperty('timezone');
    expect(response.body.data[0]).toHaveProperty('offset');
    expect(response.body.data[0]).toHaveProperty('region');
  });
});

// Test schedule update
describe('PATCH /api/cron/distribution-schedule', () => {
  it('should update schedule with valid 2FA', async () => {
    const response = await request(app)
      .patch('/api/cron/distribution-schedule')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-2FA-Code', '123456')
      .send({
        numberOfSlots: 2,
        timezone: 'Africa/Lagos',
        schedules: [
          { slotNumber: 1, hour: 10, minute: 0, second: 0 },
          { slotNumber: 2, hour: 16, minute: 0, second: 0 },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.numberOfSlots).toBe(2);
  });

  it('should reject invalid 2FA code', async () => {
    const response = await request(app)
      .patch('/api/cron/distribution-schedule')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-2FA-Code', 'wrong')
      .send({
        /* valid payload */
      });

    expect(response.status).toBe(401);
  });

  it('should validate numberOfSlots range', async () => {
    const response = await request(app)
      .patch('/api/cron/distribution-schedule')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-2FA-Code', '123456')
      .send({
        numberOfSlots: 15, // Invalid: > 10
        timezone: 'Africa/Lagos',
        schedules: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain(
      'numberOfSlots must be between 1 and 10'
    );
  });
});

// Test multi-slot queue
describe('POST /api/daily-declaration-returns/queue-distribution', () => {
  it('should queue multi-slot distribution', async () => {
    const response = await request(app)
      .post('/api/daily-declaration-returns/queue-distribution')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-2FA-Code', '123456')
      .send({
        mode: 'multi',
        slots: [
          { slotNumber: 1, slotTime: '09:00:00', ros: 1.5 },
          { slotNumber: 2, slotTime: '15:00:00', ros: 2.0 },
        ],
        premiumPoolPercentage: 10,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.slots).toHaveLength(2);
  });

  it('should maintain backward compatibility with single-slot', async () => {
    const response = await request(app)
      .post('/api/daily-declaration-returns/queue-distribution')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-2FA-Code', '123456')
      .send({
        mode: 'single',
        ros: 2.5,
        premiumPoolPercentage: 10,
      });

    expect(response.status).toBe(201);
  });
});
```

### Integration Tests

Test end-to-end workflows:

1. **Complete Flow Test:**
   - Configure 3-slot schedule via PATCH endpoint
   - Verify cron jobs restarted
   - Queue distribution via POST endpoint
   - Check status via GET endpoint (all PENDING)
   - Wait for first slot time (or mock time)
   - Check status again (first EXECUTING/COMPLETED, rest PENDING)
   - Verify amounts distributed correctly

2. **Timezone Test:**
   - Set schedule in America/New_York timezone
   - Set slot for 14:00:00 (2 PM EST)
   - Verify execution happens at correct UTC time
   - Change timezone to Asia/Dubai
   - Verify next execution adjusts correctly

3. **Enable/Disable Test:**
   - Queue distribution
   - Disable cron via POST /api/cron/toggle
   - Wait past scheduled time
   - Verify distribution did NOT execute
   - Re-enable cron
   - Queue new distribution
   - Verify it executes

### Manual Testing Checklist

```bash
# 1. Get timezones
curl https://api.novunt.com/api/cron/timezones

# 2. Update schedule (replace TOKEN and 2FA_CODE)
curl -X PATCH https://api.novunt.com/api/cron/distribution-schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "numberOfSlots": 3,
    "timezone": "Africa/Lagos",
    "schedules": [
      {"slotNumber": 1, "hour": 9, "minute": 0, "second": 0, "label": "Morning"},
      {"slotNumber": 2, "hour": 15, "minute": 0, "second": 0, "label": "Afternoon"},
      {"slotNumber": 3, "hour": 21, "minute": 0, "second": 0, "label": "Evening"}
    ]
  }'

# 3. Get schedule
curl -H "Authorization: Bearer TOKEN" \
  https://api.novunt.com/api/cron/distribution-schedule

# 4. Queue multi-slot distribution
curl -X POST https://api.novunt.com/api/daily-declaration-returns/queue-distribution \
  -H "Authorization: Bearer TOKEN" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "multi",
    "slots": [
      {"slotNumber": 1, "slotTime": "09:00:00", "ros": 1.5},
      {"slotNumber": 2, "slotTime": "15:00:00", "ros": 2.0},
      {"slotNumber": 3, "slotTime": "21:00:00", "ros": 1.0}
    ],
    "premiumPoolPercentage": 10
  }'

# 5. Check status
curl -H "Authorization: Bearer TOKEN" \
  https://api.novunt.com/api/daily-declaration-returns/today-status

# 6. Disable cron
curl -X POST https://api.novunt.com/api/cron/toggle \
  -H "Authorization: Bearer TOKEN" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{"isEnabled": false}'

# 7. Check public status
curl https://api.novunt.com/api/cron/cron-status
```

---

## ✅ Success Criteria

The implementation is complete when:

1. ✅ All 5 new endpoints are implemented and working
2. ✅ Existing queue and status endpoints are updated for multi-slot support
3. ✅ Single-slot mode still works (backward compatibility)
4. ✅ Database tables created with proper constraints
5. ✅ Cron jobs execute at configured times in correct timezone
6. ✅ Status tracking works per slot (PENDING → EXECUTING → COMPLETED/FAILED)
7. ✅ Schedule updates restart cron jobs without server restart
8. ✅ 2FA validation works on PATCH and POST endpoints
9. ✅ Validation prevents invalid configurations (slots >10, invalid times, etc.)
10. ✅ Error handling provides clear messages
11. ✅ Frontend can successfully:
    - Fetch timezones
    - View current schedule
    - Update schedule
    - Toggle enable/disable
    - Queue multi-slot distribution
    - View per-slot status in real-time

---

## 📚 Reference Documentation

Frontend implementation is complete. Review these files in the frontend repo:

- **MULTI_SLOT_IMPLEMENTATION_COMPLETE.md** - Full frontend architecture
- **MULTI_SLOT_TEST_RESULTS.md** - Comprehensive test cases
- **MULTI_SLOT_BACKEND_NOT_READY.md** - Detailed explanation of missing endpoints
- **TESTING_READY_SUMMARY.md** - Quick reference guide

All TypeScript types and API contracts are defined in:

- `src/types/cronSettings.ts`
- `src/types/dailyDeclarationReturns.ts`
- `src/services/cronSettingsService.ts`

---

## ⏱️ Time Estimate

**Total Estimated Time: 3-5 days** (for experienced backend developer)

Breakdown:

- Database schema & models: 4-6 hours
- Timezone endpoint: 1 hour (static data)
- Get schedule endpoint: 2-3 hours
- Update schedule endpoint: 4-6 hours (includes validation & 2FA)
- Toggle endpoint: 2-3 hours
- Cron status endpoint: 1 hour
- Update queue endpoint: 4-6 hours (multi-slot logic)
- Update status endpoint: 4-6 hours (per-slot status)
- Cron job implementation: 8-12 hours (scheduler + execution logic)
- Testing: 6-8 hours
- Documentation: 2-3 hours

---

## 🚀 Deployment Notes

1. **Database Migration:**
   - Run migration to create 3 new tables
   - No data migration needed (fresh feature)

2. **Environment Variables:**
   - Ensure timezone support libraries are installed
   - Configure cron job timezone handling

3. **Server Restart:**
   - After deployment, cron jobs will auto-start
   - Verify logs show "Cron jobs started" message

4. **Monitoring:**
   - Add logging for cron executions
   - Alert on failed slot executions
   - Track execution duration per slot

5. **Rollback Plan:**
   - If issues occur, can disable cron via toggle endpoint
   - Single-slot mode continues working
   - Database tables can remain (won't affect existing functionality)

---

## 📞 Support

**Questions?** Contact frontend developer with:

- Endpoint specification questions
- Response format clarifications
- Integration testing coordination

**Frontend is ready and blocked on these endpoints.** Once implemented, the feature will work immediately without frontend changes.

---

**Priority: HIGH**  
**Estimated Completion: 3-5 days**  
**Status: Ready for Backend Implementation**  
**Last Updated: February 11, 2026**
