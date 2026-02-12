# Backend Issue Report: Scheduled Distribution Cron Job Not Executing

**Date:** February 12, 2026  
**Priority:** HIGH  
**Component:** Daily Declaration Returns - Scheduled Distribution System  
**Issue Type:** Cron Job / Background Scheduler Failure

---

## Executive Summary

The scheduled distribution system is not executing distributions at their scheduled times. Distributions queued via the `/api/v1/admin/daily-declaration-returns/today/queue` endpoint remain in **PENDING** status indefinitely, even after their scheduled execution time has passed.

**Impact:**

- Admins queue distributions expecting automatic execution at scheduled times
- Users do not receive their daily ROS (Return on Stake) profits
- Pool distributions (Premium/Performance) are not processed
- Manual intervention required for every distribution

---

## Current vs Expected Behavior

### ❌ Current Behavior (Broken)

1. Admin fills "Today's Distribution" form with:
   - ROS Percentage: 1%
   - Premium Pool Amount: $0
   - Performance Pool Amount: $0
   - Scheduled time: 14:30 UTC

2. Frontend calls: `POST /api/v1/admin/daily-declaration-returns/today/queue`

3. Backend responds with:

   ```json
   {
     "success": true,
     "message": "Distribution queued successfully",
     "data": {
       "today": "2026-02-12",
       "status": "PENDING",
       "scheduledFor": "2026-02-12T14:30:00.000Z",
       "values": {
         "rosPercentage": 1,
         "premiumPoolAmount": 0,
         "performancePoolAmount": 0
       }
     }
   }
   ```

4. **PROBLEM**: Time 14:30 UTC passes, but distribution remains in PENDING status
   - Status never changes to EXECUTING → COMPLETED
   - No stakes are processed
   - No transactions created
   - Users see no profit in their stake cards

5. Frontend polls `GET /api/v1/admin/daily-declaration-returns/today/status` and still sees:
   ```json
   {
     "status": "PENDING",
     "scheduledFor": "2026-02-12T14:30:00.000Z"
   }
   ```

### ✅ Expected Behavior (How It Should Work)

1. Admin queues distribution → Backend stores it with PENDING status ✅ (This works)

2. **Backend cron job runs every minute** checking for pending distributions

3. **At scheduled time (14:30 UTC)**:
   - Cron detects pending distribution with `scheduledFor <= NOW()`
   - Changes status to EXECUTING
   - Processes all active stakes matching the date
   - Calculates and distributes ROS profits to users
   - Processes premium/performance pool distributions
   - Changes status to COMPLETED
   - Records execution stats (processedStakes, totalDistributed, etc.)

4. Frontend polls status and sees:

   ```json
   {
     "status": "COMPLETED",
     "scheduledFor": "2026-02-12T14:30:00.000Z",
     "lastExecution": {
       "status": "COMPLETED",
       "rosStats": {
         "processedStakes": 150,
         "totalDistributed": 1234.56
       },
       "executedAt": "2026-02-12T14:30:05.123Z",
       "executionTimeMs": 5123
     }
   }
   ```

5. Users see profits in:
   - Stake cards (totalEarned increases)
   - Staking transaction history (new ROI_EARNED records)
   - Main transactions page

---

## Technical Details

### Backend Architecture Expected

The scheduled distribution system requires:

1. **Persistent Storage** (Database)

   ```
   Collection: DailyDeclarationReturns or similar
   Document Structure:
   {
     date: "2026-02-12",
     status: "PENDING" | "SCHEDULED" | "EXECUTING" | "COMPLETED" | "FAILED",
     scheduledFor: Date,
     values: {
       rosPercentage: Number,
       premiumPoolAmount: Number,
       performancePoolAmount: Number,
       description: String
     },
     multiSlotEnabled: Boolean,
     distributionSlots: Array,
     lastExecution: {
       status: String,
       rosStats: Object,
       premiumPoolStats: Object,
       performancePoolStats: Object,
       executedAt: Date,
       executionTimeMs: Number,
       error: String
     }
   }
   ```

2. **Cron Job / Background Scheduler**

   ```javascript
   // Example using node-cron or similar

   // Run every minute
   cron.schedule('* * * * *', async () => {
     try {
       console.log('[Cron] Checking for pending distributions...');

       const now = new Date();
       const todayStr = now.toISOString().split('T')[0];

       // Find distributions scheduled for execution
       const pendingDistributions = await DailyDeclarationReturns.find({
         date: todayStr,
         status: { $in: ['PENDING', 'SCHEDULED'] },
         scheduledFor: { $lte: now },
       });

       if (pendingDistributions.length === 0) {
         console.log('[Cron] No pending distributions found');
         return;
       }

       for (const distribution of pendingDistributions) {
         console.log(`[Cron] Executing distribution for ${distribution.date}`);

         // Update status to EXECUTING
         distribution.status = 'EXECUTING';
         await distribution.save();

         try {
           // Execute the distribution
           const result = await executeDistribution(distribution);

           // Update to COMPLETED
           distribution.status = 'COMPLETED';
           distribution.lastExecution = {
             status: 'COMPLETED',
             rosStats: result.rosStats,
             premiumPoolStats: result.premiumPoolStats,
             performancePoolStats: result.performancePoolStats,
             executedAt: new Date(),
             executionTimeMs: result.executionTimeMs,
           };
           await distribution.save();

           console.log(
             `[Cron] Distribution completed for ${distribution.date}`
           );
         } catch (error) {
           // Update to FAILED
           distribution.status = 'FAILED';
           distribution.lastExecution = {
             status: 'FAILED',
             error: error.message,
             executedAt: new Date(),
           };
           await distribution.save();

           console.error(
             `[Cron] Distribution failed for ${distribution.date}:`,
             error
           );
         }
       }
     } catch (error) {
       console.error('[Cron] Error in distribution cron job:', error);
     }
   });
   ```

3. **Distribution Execution Logic**
   - Should call the same logic as manual distribution endpoint
   - Process ROS: Update all active stakes with today's profit
   - Process Premium Pool: Distribute to qualified premium users
   - Process Performance Pool: Distribute to qualified performance users
   - Create transaction records
   - Update user wallet balances
   - Record audit trail

---

## Diagnostic Steps for Backend Team

### 1. Check if Cron Service is Running

**Question:** Is there a cron job or background scheduler configured for daily distributions?

**Where to check:**

- Main server entry point (app.js, server.js, index.js)
- Separate cron service file (e.g., `cron/distributionScheduler.js`)
- Background job queue (Bull, Agenda, etc.)

**What to look for:**

```javascript
// Should see something like this
const distributionCron = require('./cron/distributionScheduler');
distributionCron.start();
```

**Test:** Add logging to verify cron is running:

```javascript
console.log('[Cron] Distribution scheduler started at', new Date());
```

### 2. Check Environment Variables

**Required variables:**

```env
CRON_ENABLED=true
DISTRIBUTION_CRON_ENABLED=true
# Or similar - check your env configuration
```

**Verify:**

```javascript
if (process.env.CRON_ENABLED !== 'true') {
  console.warn('[Cron] Cron jobs are DISABLED by environment variable');
}
```

### 3. Check Timezone Configuration

**Issue:** Scheduled times might be compared incorrectly due to timezone mismatches

**Frontend sends:** ISO 8601 UTC timestamp: `"2026-02-12T14:30:00.000Z"`

**Backend should:**

- Store as UTC Date object
- Compare using UTC time: `new Date() >= scheduledFor`
- NOT convert to local server timezone

**Common mistake:**

```javascript
// ❌ Wrong - compares local server time to UTC
const now = new Date(); // Local time
const scheduled = new Date(distribution.scheduledFor); // UTC
if (now >= scheduled) { ... } // Mismatch!

// ✅ Correct - both in UTC
const nowUTC = new Date(); // Already UTC in ISO format
const scheduledUTC = new Date(distribution.scheduledFor); // UTC
if (nowUTC >= scheduledUTC) { ... } // Correct!
```

### 4. Check Database Queries

**Issue:** Query might not find pending distributions

**Test query directly:**

```javascript
// In MongoDB shell or application
const now = new Date();
const todayStr = now.toISOString().split('T')[0];

db.dailyDeclarationReturns.find({
  date: todayStr,
  status: { $in: ['PENDING', 'SCHEDULED'] },
  scheduledFor: { $lte: now },
});

// Should return the queued distribution
```

**Check indexes:**

```javascript
// Ensure indexes exist for performance
db.dailyDeclarationReturns.createIndex({ date: 1, status: 1, scheduledFor: 1 });
```

### 5. Check for Silent Failures

**Issue:** Cron job might be throwing errors silently

**Add comprehensive error handling:**

```javascript
cron.schedule('* * * * *', async () => {
  try {
    // ... distribution logic
  } catch (error) {
    console.error('[Cron] CRITICAL ERROR in distribution scheduler:', error);
    console.error('[Cron] Stack trace:', error.stack);

    // Optional: Send alert to monitoring service
    // alerting.critical('Distribution cron failed', error);
  }
});
```

### 6. Check Process Lifecycle

**Issue:** Cron might not survive server restarts or crashes

**Verify:**

- Does cron restart when server restarts?
- Is cron initialized after database connection is established?
- Are there any unhandled promise rejections killing the process?

**Recommended:**

```javascript
// Don't start cron until DB is ready
await connectToDatabase();
await distributionCron.start();
console.log('[Server] Distribution cron started successfully');
```

---

## Testing & Verification

### Test Case 1: Queue Distribution for Near-Future Time

**Setup:**

1. Note current UTC time: `14:25:00`
2. Queue distribution for: `14:27:00` (2 minutes from now)
3. Use test values:
   ```json
   {
     "rosPercentage": 1,
     "premiumPoolAmount": 0,
     "performancePoolAmount": 0
   }
   ```

**Expected Results:**

- `14:25:00` - Distribution queued, status = PENDING ✅
- `14:26:00` - Still PENDING (before scheduled time) ✅
- `14:27:00` - Status changes to EXECUTING ✅
- `14:27:05` - Status changes to COMPLETED ✅
- Stakes processed, transactions created ✅

**How to verify:**

```bash
# Check backend logs at 14:27
# Should see:
# [Cron] Checking for pending distributions...
# [Cron] Executing distribution for 2026-02-12
# [Distribution] Processing 150 active stakes
# [Distribution] ROS distributed: $1234.56
# [Cron] Distribution completed for 2026-02-12
```

### Test Case 2: Multiple Distributions (Multi-Slot)

If multi-slot scheduling is implemented:

```json
{
  "multiSlotEnabled": true,
  "distributionSlots": [
    { "slotNumber": 1, "rosPercentage": 0.5, "scheduledFor": "14:00:00" },
    { "slotNumber": 2, "rosPercentage": 0.5, "scheduledFor": "18:00:00" }
  ],
  "premiumPoolAmount": 1000,
  "performancePoolAmount": 2000
}
```

**Expected:**

- 14:00 - Slot 1 executes (0.5% ROS only)
- 18:00 - Slot 2 executes (0.5% ROS + pools)
- Each slot tracked independently

---

## API Endpoints Involved

### 1. Queue Distribution (Already Working)

```
POST /api/v1/admin/daily-declaration-returns/today/queue
```

**Request:**

```json
{
  "rosPercentage": 1,
  "premiumPoolAmount": 0,
  "performancePoolAmount": 0,
  "description": "Daily 1% ROS distribution",
  "twoFACode": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Distribution queued successfully",
  "data": {
    "today": "2026-02-12",
    "status": "PENDING",
    "scheduledFor": "2026-02-12T14:30:00.000Z",
    "values": { ... }
  }
}
```

### 2. Get Today's Status (Working, but shows stale data)

```
GET /api/v1/admin/daily-declaration-returns/today/status
```

**Response Should Update After Execution:**

```json
{
  "success": true,
  "data": {
    "today": "2026-02-12",
    "status": "COMPLETED",
    "scheduledFor": "2026-02-12T14:30:00.000Z",
    "values": {
      "rosPercentage": 1,
      "premiumPoolAmount": 0,
      "performancePoolAmount": 0
    },
    "lastExecution": {
      "status": "COMPLETED",
      "rosStats": {
        "processedStakes": 150,
        "totalDistributed": 1234.56
      },
      "premiumPoolStats": {
        "usersReceived": 0,
        "totalDistributed": 0
      },
      "performancePoolStats": {
        "usersReceived": 0,
        "totalDistributed": 0
      },
      "executionTimeMs": 5123,
      "executedAt": "2026-02-12T14:30:05.123Z"
    }
  }
}
```

### 3. Manual Distribution (Workaround - Currently Working)

```
POST /api/v1/admin/daily-declaration-returns/:date/distribute
```

**This works immediately** - Use same logic for cron execution!

---

## Recommended Implementation

### File Structure

```
backend/
├── src/
│   ├── cron/
│   │   ├── index.js                    # Main cron service
│   │   └── distributionScheduler.js    # Distribution-specific cron
│   ├── services/
│   │   └── distributionService.js      # Shared distribution logic
│   └── routes/
│       └── dailyDeclarationReturns.js  # API routes
```

### distributionScheduler.js (Recommended)

```javascript
const cron = require('node-cron');
const DailyDeclarationReturn = require('../models/DailyDeclarationReturn');
const { executeDistribution } = require('../services/distributionService');

class DistributionScheduler {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.warn('[DistributionCron] Already running');
      return;
    }

    // Run every minute
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.checkAndExecuteDistributions();
    });

    this.isRunning = true;
    console.log('[DistributionCron] Started - checking every minute');
  }

  async checkAndExecuteDistributions() {
    if (process.env.CRON_ENABLED !== 'true') {
      return; // Cron disabled
    }

    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      console.log(`[DistributionCron] Checking at ${now.toISOString()}`);

      // Find pending distributions
      const pendingDistributions = await DailyDeclarationReturn.find({
        date: todayStr,
        status: { $in: ['PENDING', 'SCHEDULED'] },
        scheduledFor: { $lte: now },
      });

      if (pendingDistributions.length === 0) {
        console.log('[DistributionCron] No pending distributions');
        return;
      }

      console.log(
        `[DistributionCron] Found ${pendingDistributions.length} distributions to execute`
      );

      // Execute each distribution
      for (const distribution of pendingDistributions) {
        await this.executeDistribution(distribution);
      }
    } catch (error) {
      console.error('[DistributionCron] Error:', error);
      console.error('[DistributionCron] Stack:', error.stack);
    }
  }

  async executeDistribution(distribution) {
    const startTime = Date.now();

    try {
      console.log(
        `[DistributionCron] Executing distribution for ${distribution.date}`
      );

      // Update status
      distribution.status = 'EXECUTING';
      await distribution.save();

      // Execute distribution (reuse same logic as manual distribution)
      const result = await executeDistribution({
        date: distribution.date,
        rosPercentage: distribution.values.rosPercentage,
        premiumPoolAmount: distribution.values.premiumPoolAmount,
        performancePoolAmount: distribution.values.performancePoolAmount,
        distributeROS: distribution.values.rosPercentage > 0,
        distributePools:
          distribution.values.premiumPoolAmount +
            distribution.values.performancePoolAmount >
          0,
      });

      // Update to COMPLETED
      const executionTimeMs = Date.now() - startTime;
      distribution.status = 'COMPLETED';
      distribution.lastExecution = {
        status: 'COMPLETED',
        rosStats: result.rosStats,
        premiumPoolStats: result.premiumPoolStats,
        performancePoolStats: result.performancePoolStats,
        executedAt: new Date(),
        executionTimeMs,
      };
      await distribution.save();

      console.log(`[DistributionCron] Completed in ${executionTimeMs}ms`);
      console.log(
        `[DistributionCron] ROS: ${result.rosStats?.totalDistributed || 0} distributed to ${result.rosStats?.processedStakes || 0} stakes`
      );
    } catch (error) {
      console.error(`[DistributionCron] Failed:`, error);

      // Update to FAILED
      distribution.status = 'FAILED';
      distribution.lastExecution = {
        status: 'FAILED',
        error: error.message,
        executedAt: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
      await distribution.save();
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.isRunning = false;
      console.log('[DistributionCron] Stopped');
    }
  }
}

module.exports = new DistributionScheduler();
```

### Initialize in server startup

```javascript
// server.js or app.js
const distributionScheduler = require('./cron/distributionScheduler');

async function startServer() {
  await connectDatabase();

  // Start distribution scheduler
  if (process.env.CRON_ENABLED === 'true') {
    distributionScheduler.start();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
```

---

## Quick Checklist for Backend Team

- [ ] Cron job file exists and is imported in server startup
- [ ] Cron job actually runs (add console.log and verify in logs)
- [ ] Environment variable `CRON_ENABLED=true` is set
- [ ] Database query finds pending distributions correctly
- [ ] Timezone handling is correct (all UTC)
- [ ] Distribution execution logic works (reuse manual distribution code)
- [ ] Status updates from PENDING → EXECUTING → COMPLETED
- [ ] Error handling catches and logs failures
- [ ] Cron restarts on server restart
- [ ] No unhandled promise rejections killing the process

---

## Expected Timeline

**Immediate Fix (1-2 hours):**

1. Verify cron service exists and is running
2. Add comprehensive logging
3. Test with near-future scheduled time
4. Deploy fix

**Long-term Improvements:**

- Add health check endpoint: `GET /api/v1/admin/cron/status`
- Add monitoring/alerting for failed distributions
- Add admin UI control: pause/resume scheduler
- Add retry logic for failed distributions

---

## Contact & Questions

**Frontend Lead:** Available for clarification on expected behavior  
**Test Account:** `owolabiayodele@gmail.com` with 100 USDT active stake  
**Expected Result:** After 1% distribution, should see 1 USDT profit

**Questions to Answer:**

1. Does the cron service exist in the backend codebase?
2. Is CRON_ENABLED set to true in production environment?
3. What do the backend logs show at the scheduled execution time?
4. Are there any error logs related to distribution execution?
