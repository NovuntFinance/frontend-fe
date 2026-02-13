# Backend Requirements: Per-Slot Status Tracking for Multi-Slot ROS Distribution

## Executive Summary

The frontend has been updated to support **independent status tracking for each distribution slot** instead of a single global status for all slots. This allows:

- **20+ daily distributions** with different execution times
- **Granular control**: Each slot can be PENDING/EXECUTING/COMPLETED/FAILED independently
- **Continuous operations**: Queue new distributions while previous slots are still executing or completed
- **Better visibility**: Admins see exactly which time slots succeeded/failed

**Backend must now track and update status for each individual slot, not just one global status.**

---

## Current System vs. Required System

### Current System (INCORRECT ❌)

```json
{
  "status": "PENDING", // ❌ Single status for ALL slots
  "multiSlotEnabled": true,
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 2.5, "scheduledFor": "..." },
    { "slotNumber": 2, "rosPercentage": 3.0, "scheduledFor": "..." },
    { "slotNumber": 3, "rosPercentage": 2.0, "scheduledFor": "..." }
  ]
}
```

**Problem**: When slot 1 completes, the entire form becomes locked. Admin cannot queue new distributions or modify pending slots.

### Required System (CORRECT ✅)

```json
{
  "status": "PENDING",  // Overall summary (can be computed from slots)
  "multiSlotEnabled": true,
  "distributionSlots": [
    {
      "slotNumber": 1,
      "rosPercentage": 2.5,
      "scheduledFor": "2026-02-13T08:00:00.000Z",
      "status": "COMPLETED",  // ✅ Individual slot status
      "executionDetails": { ... }
    },
    {
      "slotNumber": 2,
      "rosPercentage": 3.0,
      "scheduledFor": "2026-02-13T10:00:00.000Z",
      "status": "EXECUTING",  // ✅ Independent from slot 1
      "executionDetails": null
    },
    {
      "slotNumber": 3,
      "rosPercentage": 2.0,
      "scheduledFor": "2026-02-13T14:00:00.000Z",
      "status": "PENDING",  // ✅ Can still be modified
      "executionDetails": null
    }
  ]
}
```

**Benefit**: Slot 1 is locked (completed), Slot 2 is running, Slot 3 can still be edited. Admin can queue more slots for later today.

---

## Required Database Schema Changes

### Update `DailyDistributionQueue` Collection/Table

Add a **`status` field to each slot** in the `distributionSlots` array:

#### Before (Current Schema)

```javascript
{
  _id: ObjectId("..."),
  date: "2026-02-13",
  premiumPoolAmount: 5000,
  performancePoolAmount: 3000,
  description: "Morning distributions",
  multiSlotEnabled: true,
  distributionSlots: [
    {
      slotNumber: 1,
      rosPercentage: 2.5,
      scheduledFor: ISODate("2026-02-13T08:00:00.000Z")
      // ❌ No status field
    },
    {
      slotNumber: 2,
      rosPercentage: 3.0,
      scheduledFor: ISODate("2026-02-13T10:00:00.000Z")
      // ❌ No status field
    }
  ],
  status: "PENDING",  // ❌ Global status only
  queuedAt: ISODate("..."),
  queuedBy: ObjectId("...")
}
```

#### After (Required Schema)

```javascript
{
  _id: ObjectId("..."),
  date: "2026-02-13",
  premiumPoolAmount: 5000,
  performancePoolAmount: 3000,
  description: "Morning distributions",
  multiSlotEnabled: true,
  distributionSlots: [
    {
      slotNumber: 1,
      rosPercentage: 2.5,
      scheduledFor: ISODate("2026-02-13T08:00:00.000Z"),
      status: "COMPLETED",  // ✅ Per-slot status
      executionDetails: {
        executedAt: ISODate("2026-02-13T08:00:05.000Z"),
        rosStats: { ... },
        premiumPoolStats: { ... },
        performancePoolStats: { ... }
      }
    },
    {
      slotNumber: 2,
      rosPercentage: 3.0,
      scheduledFor: ISODate("2026-02-13T10:00:00.000Z"),
      status: "PENDING",  // ✅ Per-slot status
      executionDetails: null
    }
  ],
  status: "PENDING",  // Global status (computed: has pending slots)
  queuedAt: ISODate("..."),
  queuedBy: ObjectId("...")
}
```

#### Status Field Schema

```typescript
status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
```

**Allowed Values:**

- `PENDING`: Slot is scheduled but not yet executed
- `EXECUTING`: Slot execution has started (cron job running)
- `COMPLETED`: Slot executed successfully
- `FAILED`: Slot execution encountered an error

---

## API Endpoint Changes

### 1. **GET /api/admin/daily-declaration-returns/today/status**

#### Current Response (INCORRECT ❌)

```json
{
  "exists": true,
  "status": "PENDING",
  "data": {
    "premiumPoolAmount": 5000,
    "performancePoolAmount": 3000,
    "description": "Morning distributions",
    "queuedAt": "2026-02-13T07:00:00.000Z"
  },
  "multiSlotEnabled": true,
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 2.5, "scheduledFor": "..." }
  ]
}
```

#### Required Response (CORRECT ✅)

```json
{
  "exists": true,
  "status": "PENDING", // Overall status summary
  "data": {
    "premiumPoolAmount": 5000,
    "performancePoolAmount": 3000,
    "description": "Morning distributions",
    "queuedAt": "2026-02-13T07:00:00.000Z"
  },
  "multiSlotEnabled": true,
  "distributionSlots": [
    {
      "slotNumber": 1,
      "rosPercentage": 2.5,
      "scheduledFor": "2026-02-13T08:00:00.000Z",
      "status": "COMPLETED", // ✅ REQUIRED
      "executionDetails": {
        "executedAt": "2026-02-13T08:00:05.123Z",
        "rosStats": {
          "processedStakes": 150,
          "totalDistributed": 3750.5
        },
        "premiumPoolStats": {
          "qualifiedUsers": 45,
          "totalDistributed": 2250.75
        },
        "performancePoolStats": {
          "qualifiedUsers": 30,
          "totalDistributed": 1500.25
        }
      }
    },
    {
      "slotNumber": 2,
      "rosPercentage": 3.0,
      "scheduledFor": "2026-02-13T10:00:00.000Z",
      "status": "EXECUTING", // ✅ REQUIRED
      "executionDetails": null
    },
    {
      "slotNumber": 3,
      "rosPercentage": 2.0,
      "scheduledFor": "2026-02-13T14:00:00.000Z",
      "status": "PENDING", // ✅ REQUIRED
      "executionDetails": null
    }
  ],
  "lastExecution": null // Can be removed or computed from slots
}
```

**Key Changes:**

1. Each object in `distributionSlots` array **MUST include `status` field**
2. Each slot **MUST include `executionDetails`** (null if not executed, object if completed/failed)
3. `status` field in each slot is **MANDATORY**

---

### 2. **POST /api/admin/daily-declaration-returns/queue** (Multi-Slot)

#### Request Body (No Changes)

```json
{
  "premiumPoolAmount": 5000,
  "performancePoolAmount": 3000,
  "description": "Afternoon distributions",
  "multiSlot": true,
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 2.5 },
    { "slotNumber": 2, "rosPercentage": 3.0 },
    { "slotNumber": 3, "rosPercentage": 2.0 }
  ],
  "twoFactorCode": "123456"
}
```

#### Required Backend Logic Changes

**When creating new queue document:**

```javascript
// Pseudo-code for backend
async function queueMultiSlotDistribution(data) {
  // Get cron settings to calculate scheduledFor times
  const cronSettings = await getCronSettings();

  // Map each slot with PENDING status
  const distributionSlots = data.distributionSlots.map((slot) => {
    const cronSlot = cronSettings.slots.find(
      (s) => s.slotNumber === slot.slotNumber
    );

    return {
      slotNumber: slot.slotNumber,
      rosPercentage: slot.rosPercentage,
      scheduledFor: calculateScheduledTime(
        cronSlot.time,
        cronSettings.timezone
      ),
      status: 'PENDING', // ✅ Initialize as PENDING
      executionDetails: null, // ✅ Initialize as null
    };
  });

  // Create queue document
  const queueDoc = {
    date: getTodayDate(),
    premiumPoolAmount: data.premiumPoolAmount,
    performancePoolAmount: data.performancePoolAmount,
    description: data.description,
    multiSlotEnabled: true,
    distributionSlots: distributionSlots,
    status: 'PENDING', // Overall status
    queuedAt: new Date(),
    queuedBy: req.user._id,
  };

  await DailyDistributionQueue.create(queueDoc);

  return { message: 'Distribution queued successfully' };
}
```

---

### 3. **POST /api/admin/daily-declaration-returns/modify**

#### Request Body (No Changes)

```json
{
  "premiumPoolAmount": 6000,
  "performancePoolAmount": 4000,
  "description": "Updated amounts",
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 2.5 },
    { "slotNumber": 2, "rosPercentage": 3.5 }, // Modified
    { "slotNumber": 3, "rosPercentage": 2.0 }
  ],
  "twoFactorCode": "123456"
}
```

#### Required Backend Logic Changes

**When updating queue document:**

```javascript
async function modifyDistribution(data) {
  const existingQueue = await DailyDistributionQueue.findOne({
    date: getTodayDate()
  });

  // ✅ Preserve status of each slot when modifying
  const updatedSlots = data.distributionSlots.map((newSlot) => {
    const existingSlot = existingQueue.distributionSlots.find(
      s => s.slotNumber === newSlot.slotNumber
    );

    // If slot exists and is COMPLETED or FAILED, preserve it
    if (existingSlot && (existingSlot.status === 'COMPLETED' || existingSlot.status === 'FAILED')) {
      return existingSlot;  // Don't modify completed/failed slots
    }

    // If slot is PENDING or EXECUTING, allow modification
    return {
      slotNumber: newSlot.slotNumber,
      rosPercentage: newSlot.rosPercentage,
      scheduledFor: existingSlot?.scheduledFor || calculateScheduledTime(...),
      status: existingSlot?.status || "PENDING",  // ✅ Preserve existing status
      executionDetails: existingSlot?.executionDetails || null
    };
  });

  existingQueue.premiumPoolAmount = data.premiumPoolAmount;
  existingQueue.performancePoolAmount = data.performancePoolAmount;
  existingQueue.description = data.description;
  existingQueue.distributionSlots = updatedSlots;

  await existingQueue.save();

  return { message: "Distribution modified successfully" };
}
```

**Important Rules:**

1. **DO NOT allow modification of COMPLETED or FAILED slots**
2. **Preserve status field** when updating PENDING slots
3. **Preserve executionDetails** from completed slots

---

## Cron Job Execution Logic Changes

### Current Cron Job (INCORRECT ❌)

```javascript
// ❌ Sets global status only
async function executeDistribution() {
  const queue = await DailyDistributionQueue.findOne({
    date: getTodayDate(),
    status: 'PENDING',
  });

  // Execute distribution
  queue.status = 'EXECUTING'; // ❌ Global status
  await queue.save();

  // ... run distribution logic ...

  queue.status = 'COMPLETED'; // ❌ Global status
  await queue.save();
}
```

**Problem**: After slot 1 completes, global status becomes COMPLETED. Slot 2 and 3 never execute because cron job checks `status === "PENDING"`.

---

### Required Cron Job (CORRECT ✅)

```javascript
async function executeMultiSlotDistribution() {
  const now = new Date();

  // Find today's queue
  const queue = await DailyDistributionQueue.findOne({
    date: getTodayDate(),
    multiSlotEnabled: true,
  });

  if (!queue || !queue.distributionSlots) return;

  // ✅ Find all PENDING slots that are due for execution
  const slotsToExecute = queue.distributionSlots.filter((slot) => {
    const scheduledTime = new Date(slot.scheduledFor);
    return slot.status === 'PENDING' && scheduledTime <= now;
  });

  if (slotsToExecute.length === 0) {
    console.log('No pending slots ready for execution');
    return;
  }

  // ✅ Execute EACH slot independently
  for (const slot of slotsToExecute) {
    await executeSlot(queue, slot);
  }

  // ✅ Update global status based on all slots
  await updateGlobalStatus(queue);
}

async function executeSlot(queue, slot) {
  try {
    console.log(
      `Executing slot ${slot.slotNumber} with ROS ${slot.rosPercentage}%`
    );

    // ✅ 1. Mark slot as EXECUTING
    await DailyDistributionQueue.updateOne(
      {
        _id: queue._id,
        'distributionSlots.slotNumber': slot.slotNumber,
      },
      {
        $set: { 'distributionSlots.$.status': 'EXECUTING' },
      }
    );

    // ✅ 2. Execute ROS distribution for this slot only
    const rosStats = await distributeROS(
      slot.rosPercentage,
      queue.premiumPoolAmount,
      queue.performancePoolAmount
    );

    // ✅ 3. Execute Premium Pool distribution
    const premiumPoolStats = await distributePremiumPool(
      queue.premiumPoolAmount
    );

    // ✅ 4. Execute Performance Pool distribution
    const performancePoolStats = await distributePerformancePool(
      queue.performancePoolAmount
    );

    // ✅ 5. Mark slot as COMPLETED with execution details
    await DailyDistributionQueue.updateOne(
      {
        _id: queue._id,
        'distributionSlots.slotNumber': slot.slotNumber,
      },
      {
        $set: {
          'distributionSlots.$.status': 'COMPLETED',
          'distributionSlots.$.executionDetails': {
            executedAt: new Date(),
            rosStats: {
              processedStakes: rosStats.processedStakes,
              totalDistributed: rosStats.totalDistributed,
            },
            premiumPoolStats: {
              qualifiedUsers: premiumPoolStats.qualifiedUsers,
              totalDistributed: premiumPoolStats.totalDistributed,
            },
            performancePoolStats: {
              qualifiedUsers: performancePoolStats.qualifiedUsers,
              totalDistributed: performancePoolStats.totalDistributed,
            },
          },
        },
      }
    );

    console.log(`✅ Slot ${slot.slotNumber} completed successfully`);
  } catch (error) {
    console.error(`❌ Slot ${slot.slotNumber} failed:`, error);

    // ✅ 6. Mark slot as FAILED if error occurs
    await DailyDistributionQueue.updateOne(
      {
        _id: queue._id,
        'distributionSlots.slotNumber': slot.slotNumber,
      },
      {
        $set: {
          'distributionSlots.$.status': 'FAILED',
          'distributionSlots.$.executionDetails': {
            executedAt: new Date(),
            error: error.message,
            errorStack: error.stack,
          },
        },
      }
    );
  }
}

// ✅ Update global status based on all slot statuses
async function updateGlobalStatus(queue) {
  const slots = queue.distributionSlots;

  const hasExecuting = slots.some((s) => s.status === 'EXECUTING');
  const hasPending = slots.some((s) => s.status === 'PENDING');
  const allCompleted = slots.every((s) => s.status === 'COMPLETED');
  const hasFailed = slots.some((s) => s.status === 'FAILED');

  let globalStatus;
  if (hasExecuting) {
    globalStatus = 'EXECUTING';
  } else if (hasPending) {
    globalStatus = 'PENDING';
  } else if (allCompleted) {
    globalStatus = 'COMPLETED';
  } else if (hasFailed) {
    globalStatus = 'FAILED';
  }

  await DailyDistributionQueue.updateOne(
    { _id: queue._id },
    { $set: { status: globalStatus } }
  );
}
```

---

## Cron Schedule Configuration

**Current**: One cron job checks `status === "PENDING"` globally

**Required**: Cron job runs every minute and checks **each slot individually**

```javascript
// Schedule cron to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Checking for pending multi-slot distributions...');
  await executeMultiSlotDistribution();
});
```

**Why every minute?**

- With 20+ slots per day, some scheduled times may be 1-2 minutes apart
- Need to catch all due slots quickly
- Individual slot status prevents re-execution

---

## Migration Script for Existing Data

If you have existing queue documents without per-slot status:

```javascript
async function migrateExistingQueues() {
  const queues = await DailyDistributionQueue.find({
    multiSlotEnabled: true,
    'distributionSlots.status': { $exists: false }, // Missing status field
  });

  for (const queue of queues) {
    const updatedSlots = queue.distributionSlots.map((slot) => ({
      ...slot,
      status: queue.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
      executionDetails:
        queue.status === 'COMPLETED'
          ? {
              executedAt: queue.lastExecution?.executedAt || new Date(),
              rosStats: { processedStakes: 0, totalDistributed: 0 },
              premiumPoolStats: { qualifiedUsers: 0, totalDistributed: 0 },
              performancePoolStats: { qualifiedUsers: 0, totalDistributed: 0 },
            }
          : null,
    }));

    queue.distributionSlots = updatedSlots;
    await queue.save();
  }

  console.log(`Migrated ${queues.length} queue documents`);
}

// Run once during deployment
migrateExistingQueues();
```

---

## Testing Checklist

### 1. **Queue New Multi-Slot Distribution**

- [ ] POST `/queue` creates slots with `status: "PENDING"`
- [ ] Each slot has `executionDetails: null`
- [ ] GET `/today/status` returns slots with status field

### 2. **Cron Execution**

- [ ] Cron job finds PENDING slots that are due
- [ ] Slot status updates to EXECUTING during execution
- [ ] Slot status updates to COMPLETED on success
- [ ] Slot status updates to FAILED on error
- [ ] Other slots remain PENDING (not affected)

### 3. **Modify Distribution**

- [ ] Can modify PENDING slots
- [ ] CANNOT modify COMPLETED slots (preserve them)
- [ ] CANNOT modify FAILED slots (preserve them)
- [ ] Modification preserves existing slot statuses

### 4. **Frontend Integration**

- [ ] Each slot displays correct status badge (Pending/Executing/Completed/Failed)
- [ ] Completed slots are locked (grayed out, disabled inputs)
- [ ] Pending slots remain editable
- [ ] "Queue New Distribution" button appears after some slots complete
- [ ] Status overview shows counts: "3 Pending, 1 Executing, 5 Completed"

### 5. **Edge Cases**

- [ ] All slots completed → Can queue new distribution
- [ ] Some slots failed → Can retry failed slots or queue new ones
- [ ] Slots scheduled at same time → Execute in order
- [ ] Daylight saving time transitions handled correctly

---

## Example Timeline Scenario

**Day: February 13, 2026**
**Cron Schedule**: 3 slots at 08:00, 10:00, 14:00

### 07:00 AM - Admin Queues Distribution

```json
{
  "status": "PENDING",
  "distributionSlots": [
    { "slotNumber": 1, "scheduledFor": "08:00", "status": "PENDING" },
    { "slotNumber": 2, "scheduledFor": "10:00", "status": "PENDING" },
    { "slotNumber": 3, "scheduledFor": "14:00", "status": "PENDING" }
  ]
}
```

### 08:00 AM - Slot 1 Executes

```json
{
  "status": "EXECUTING", // Global status
  "distributionSlots": [
    { "slotNumber": 1, "scheduledFor": "08:00", "status": "EXECUTING" }, // ⏳
    { "slotNumber": 2, "scheduledFor": "10:00", "status": "PENDING" },
    { "slotNumber": 3, "scheduledFor": "14:00", "status": "PENDING" }
  ]
}
```

### 08:00:15 AM - Slot 1 Completes

```json
{
  "status": "PENDING",  // Global status (still has pending slots)
  "distributionSlots": [
    {"slotNumber": 1, "scheduledFor": "08:00", "status": "COMPLETED", "executionDetails": {...}},  // ✅
    {"slotNumber": 2, "scheduledFor": "10:00", "status": "PENDING"},
    {"slotNumber": 3, "scheduledFor": "14:00", "status": "PENDING"}
  ]
}
```

**Frontend UI**: Slot 1 is locked with green checkmark. Slots 2 & 3 still editable.

### 09:30 AM - Admin Modifies Slot 3

```json
{
  "status": "PENDING",
  "distributionSlots": [
    { "slotNumber": 1, "status": "COMPLETED", "rosPercentage": 2.5 }, // ✅ Preserved
    { "slotNumber": 2, "status": "PENDING", "rosPercentage": 3.0 }, // Unchanged
    { "slotNumber": 3, "status": "PENDING", "rosPercentage": 3.5 } // 📝 Modified (was 2.0)
  ]
}
```

### 10:00 AM - Slot 2 Executes

```json
{
  "status": "EXECUTING",
  "distributionSlots": [
    { "slotNumber": 1, "status": "COMPLETED" },
    { "slotNumber": 2, "status": "EXECUTING" }, // ⏳
    { "slotNumber": 3, "status": "PENDING" }
  ]
}
```

### 10:00:20 AM - Slot 2 Completes

```json
{
  "status": "PENDING", // Still pending (slot 3 remaining)
  "distributionSlots": [
    { "slotNumber": 1, "status": "COMPLETED" },
    { "slotNumber": 2, "status": "COMPLETED" }, // ✅
    { "slotNumber": 3, "status": "PENDING" }
  ]
}
```

### 14:00 AM - Slot 3 Executes

```json
{
  "status": "EXECUTING",
  "distributionSlots": [
    { "slotNumber": 1, "status": "COMPLETED" },
    { "slotNumber": 2, "status": "COMPLETED" },
    { "slotNumber": 3, "status": "EXECUTING" } // ⏳
  ]
}
```

### 14:00:18 AM - All Slots Completed

```json
{
  "status": "COMPLETED", // ALL slots done
  "distributionSlots": [
    { "slotNumber": 1, "status": "COMPLETED" },
    { "slotNumber": 2, "status": "COMPLETED" },
    { "slotNumber": 3, "status": "COMPLETED" } // ✅
  ]
}
```

**Frontend UI**: All slots locked. "Queue New Distribution" button appears.

---

## Summary of Backend Changes Required

### ✅ Must Do (CRITICAL)

1. **Add `status` field** to each slot in `distributionSlots` array
2. **Add `executionDetails`** field to each slot
3. **Update GET /today/status** to return per-slot status
4. **Update POST /queue** to initialize slots with `status: "PENDING"`
5. **Update POST /modify** to preserve COMPLETED/FAILED slot statuses
6. **Refactor cron job** to execute slots individually based on per-slot status
7. **Update global status calculation** based on all slot statuses

### 📋 Optional (Recommended)

1. Add migration script for existing data
2. Add logging for slot execution timeline
3. Add retry mechanism for FAILED slots
4. Add admin endpoint to retry failed slots
5. Add slot execution metrics/monitoring

---

## Questions for Backend Team?

If anything is unclear, please ask:

1. Database structure questions
2. Cron job scheduling conflicts
3. Timezone handling for scheduled times
4. Error handling strategies
5. Testing environment setup

**Contact**: Frontend team ready to test as soon as per-slot status is implemented!

---

## Frontend Readiness Status

✅ **Frontend is 100% ready** for per-slot status tracking:

- UI displays individual slot badges (PENDING/EXECUTING/COMPLETED/FAILED)
- Completed slots are locked automatically
- Pending slots remain editable
- Status overview shows aggregate counts
- Queue button appears when appropriate

**Waiting on**: Backend implementation of per-slot status tracking as described in this document.
