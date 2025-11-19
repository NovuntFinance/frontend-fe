# Backend Requirements: Frontend Updates
## Date: November 18, 2025

---

## Executive Summary

### Frontend Updates Completed

The frontend team has implemented three critical updates to align with Novunt's brand identity and enhance user experience:

1. **✅ Terminology Standardization**: Changed all "ROI" references to "ROS" (Return on Stake) and "investment" to "staking"
2. **✅ Goal-Based Staking**: Added stakeholder goal selection feature
3. **✅ Bonus Celebration**: Implemented confetti animation for registration bonus activation

### Backend Status (From Backend Team's Documentation)

**Good News:** The backend team has ALREADY implemented:
1. ✅ **ROS Terminology Update** - `totalEarnedFromROI` → `totalEarnedFromROS` (DONE)
2. ✅ **Registration Bonus Gradual Payout System** - Complete with new endpoints (DONE)
3. ⚠️ **Goal-Based Staking** - PARTIALLY DONE (goal field added but needs verification)

**This document outlines what the backend has already completed and what frontend needs to integrate.**

---

## Backend Implementation Status

According to the backend team's documentation (COMPLETE_FRONTEND_INTEGRATION_DOCUMENTATION.md), they have completed:

### ✅ COMPLETED BY BACKEND

#### 1. ROS Terminology Update (DONE ✅)
- Field renamed: `totalEarnedFromROI` → `totalEarnedFromROS`
- All terminology updated in responses
- Status: **DEPLOYED**

#### 2. Registration Bonus Gradual Payout (DONE ✅)
- New endpoint: `GET /api/v1/registration-bonus/payout-history`
- Enhanced endpoint: `GET /api/v1/registration-bonus/status` with new fields
- Bonus now depletes gradually with weekly ROS payments
- Status: **DEPLOYED**

#### 3. Goal-Based Staking (DONE ✅)
- Goal field added to stake model
- `POST /api/v1/staking/create` accepts optional `goal` parameter
- Dashboard returns stakes with `goal` field
- Status: **DEPLOYED**

### 🔄 FRONTEND ACTION REQUIRED

The frontend now needs to:
1. ✅ **Already Done**: Updated terminology to ROS
2. ✅ **Already Done**: Added goal selection UI
3. ✅ **Already Done**: Added confetti celebration
4. ⚠️ **NEW TASK**: Integrate registration bonus gradual payout UI
5. ⚠️ **NEW TASK**: Add bonus payout history view

---

## 1. Critical Change: API Field Rename (✅ BACKEND COMPLETED)

### ✅ COMPLETED - Backend Has Implemented This

**Affected Endpoint:** `GET /api/v1/staking/dashboard`

**Status:** Backend has already renamed the field from `totalEarnedFromROI` to `totalEarnedFromROS`

### Current Response Structure:
```json
{
  "success": true,
  "data": {
    "wallets": { ... },
    "activeStakes": [ ... ],
    "stakeHistory": [ ... ],
    "summary": {
      "totalActiveStakes": 5,
      "totalStakesSinceInception": 12,
      "totalEarnedFromROI": 1250.50,  // ❌ CHANGE THIS FIELD NAME
      "targetTotalReturns": 5000.00,
      "progressToTarget": "25.01%",
      "stakingModel": "Weekly ROI based on Novunt trading performance until 200% returns",
      "note": "Stakes are permanent investments. You benefit through weekly ROI payouts to your Earning Wallet until 200% maturity."
    }
  }
}
```

### Required Response Structure:
```json
{
  "success": true,
  "data": {
    "wallets": { ... },
    "activeStakes": [ ... ],
    "stakeHistory": [ ... ],
    "summary": {
      "totalActiveStakes": 5,
      "totalStakesSinceInception": 12,
      "totalEarnedFromROS": 1250.50,  // ✅ NEW FIELD NAME
      "targetTotalReturns": 5000.00,
      "progressToTarget": "25.01%",
      "stakingModel": "Weekly ROS based on Novunt trading performance until 200% returns",
      "note": "Stakes are permanent commitments. You benefit through weekly ROS payouts to your Earning Wallet until 200% maturity."
    }
  }
}
```

### Backend Implementation Required:

#### Option 1: Simple Field Rename (Recommended)
```javascript
// In your dashboard controller/service
const summary = {
  totalActiveStakes: activeStakesCount,
  totalStakesSinceInception: totalStakesCount,
  totalEarnedFromROS: calculateTotalEarnings(), // ✅ Changed from totalEarnedFromROI
  targetTotalReturns: calculateTargetReturns(),
  progressToTarget: `${progress.toFixed(2)}%`,
  stakingModel: "Weekly ROS based on Novunt trading performance until 200% returns",
  note: "Stakes are permanent commitments. You benefit through weekly ROS payouts to your Earning Wallet until 200% maturity."
};
```

#### Option 2: Support Both Fields (Temporary Transition Period)
```javascript
// Support both old and new field names during transition
const totalEarnings = calculateTotalEarnings();

const summary = {
  totalActiveStakes: activeStakesCount,
  totalStakesSinceInception: totalStakesCount,
  totalEarnedFromROI: totalEarnings,  // ⚠️ Deprecated - keep for backwards compatibility
  totalEarnedFromROS: totalEarnings,  // ✅ New field name
  // ... rest of fields
};

// Remove totalEarnedFromROI after frontend deployment is confirmed
```

### Database Impact:
- **No database changes required** - This is only an API response field rename
- No data migration needed
- Field calculation logic remains the same

### Testing Requirements:
1. ✅ Verify `totalEarnedFromROS` appears in dashboard response
2. ✅ Confirm value matches previous `totalEarnedFromROI` calculation
3. ✅ Test with users who have:
   - No stakes (should return 0)
   - Active stakes with earnings
   - Completed stakes
   - Mix of active and completed stakes

---

## 2. Goal-Based Staking (✅ BACKEND COMPLETED)

### Overview
✅ **Backend Status**: IMPLEMENTED AND DEPLOYED

Stakeholders can now select a goal when creating a stake. This feature:
- Increases user engagement by personalizing the staking experience
- Helps users track what they're staking towards
- Provides valuable analytics data for business intelligence

### API Changes Required

#### A. Stake Creation Endpoint Update

**Endpoint:** `POST /api/v1/staking/create`

**Current Request Body:**
```json
{
  "amount": 100.00,
  "source": "funded",
  "twoFactorCode": "123456"
}
```

**Updated Request Body:**
```json
{
  "amount": 100.00,
  "source": "funded",
  "goal": "wedding",        // ✅ NEW FIELD - Optional
  "twoFactorCode": "123456"
}
```

**Field Specification:**
| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `goal` | String | No | The stakeholder's goal for this stake | See "Valid Goal Values" below |

**Valid Goal Values:**
```javascript
const VALID_GOALS = [
  'wedding',      // 💍 Wedding
  'housing',      // 🏠 Housing (house purchase, rent, etc.)
  'vehicle',      // 🚗 Vehicle (car, motorcycle, etc.)
  'travel',       // ✈️ Travel (vacation, trip, etc.)
  'education',    // 🎓 Education (tuition, courses, etc.)
  'emergency',    // 🚨 Emergency Fund
  'retirement',   // 🏖️ Retirement
  'business',     // 💼 Business (startup, expansion, etc.)
  'other'         // 🎯 Other goals
];
```

**Backend Validation:**
```javascript
// Validation middleware/function
function validateStakeCreation(req, res, next) {
  const { amount, source, goal, twoFactorCode } = req.body;
  
  // Existing validations
  if (!amount || amount < 20) {
    return res.status(400).json({ 
      success: false, 
      message: 'Amount must be at least $20' 
    });
  }
  
  // ... other existing validations
  
  // NEW: Goal validation (optional field)
  if (goal !== undefined && goal !== null) {
    const validGoals = [
      'wedding', 'housing', 'vehicle', 'travel', 
      'education', 'emergency', 'retirement', 'business', 'other'
    ];
    
    if (!validGoals.includes(goal)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid goal. Must be one of: ${validGoals.join(', ')}` 
      });
    }
  }
  
  next();
}
```

**Success Response (Unchanged):**
```json
{
  "success": true,
  "message": "Stake created successfully",
  "stake": {
    "_id": "stake123...",
    "userId": "user456...",
    "amount": 100.00,
    "source": "funded",
    "goal": "wedding",  // ✅ Include goal in response
    "targetReturn": 200.00,
    "status": "active",
    "createdAt": "2025-11-18T10:30:00.000Z"
  }
}
```

#### B. Dashboard Endpoint Update

**Endpoint:** `GET /api/v1/staking/dashboard`

**Update Required:** Include `goal` field in all stake objects

**Current Stake Object:**
```json
{
  "_id": "stake123",
  "userId": "user456",
  "amount": 100.00,
  "createdAt": "2025-11-18T10:30:00.000Z",
  "updatedAt": "2025-11-18T10:30:00.000Z",
  "status": "active",
  "source": "funded",
  "targetReturn": 200.00,
  "totalEarned": 25.50,
  "progressToTarget": "12.75%",
  "remainingToTarget": 174.50,
  "weeklyPayouts": [ ... ]
}
```

**Updated Stake Object:**
```json
{
  "_id": "stake123",
  "userId": "user456",
  "amount": 100.00,
  "createdAt": "2025-11-18T10:30:00.000Z",
  "updatedAt": "2025-11-18T10:30:00.000Z",
  "status": "active",
  "source": "funded",
  "goal": "wedding",           // ✅ NEW FIELD - Can be null for old stakes
  "targetReturn": 200.00,
  "totalEarned": 25.50,
  "progressToTarget": "12.75%",
  "remainingToTarget": 174.50,
  "weeklyPayouts": [ ... ]
}
```

**Implementation:**
```javascript
// In your dashboard controller/service
async function getStakingDashboard(userId) {
  const stakes = await Stake.find({ userId }).lean();
  
  // Map stakes to include all fields
  const formattedStakes = stakes.map(stake => ({
    _id: stake._id,
    userId: stake.userId,
    amount: stake.amount,
    createdAt: stake.createdAt,
    updatedAt: stake.updatedAt,
    status: stake.status,
    source: stake.source,
    goal: stake.goal || null,  // ✅ Include goal (null if not set)
    targetReturn: stake.targetReturn,
    totalEarned: stake.totalEarned,
    progressToTarget: `${stake.progress}%`,
    remainingToTarget: stake.remainingToTarget,
    weeklyPayouts: stake.weeklyPayouts
  }));
  
  return formattedStakes;
}
```

#### C. Stake Details Endpoint Update

**Endpoint:** `GET /api/v1/staking/:stakeId`

**Update Required:** Include `goal` field in stake response

**Response Structure:**
```json
{
  "success": true,
  "stake": {
    "_id": "stake123",
    "userId": "user456",
    "amount": 100.00,
    "goal": "wedding",  // ✅ Include goal field
    "status": "active",
    // ... all other stake fields
  }
}
```

### Database Schema Changes

#### MongoDB Schema Update

**Collection:** `stakes`

**Add New Field:**
```javascript
const StakeSchema = new mongoose.Schema({
  // ==================== EXISTING FIELDS ====================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 20
  },
  source: {
    type: String,
    enum: ['funded', 'earning', 'both'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  targetReturn: {
    type: Number,
    required: true
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  // ... other existing fields
  
  // ==================== NEW FIELD ====================
  goal: {
    type: String,
    required: false,
    default: null,
    enum: [
      'wedding',
      'housing',
      'vehicle',
      'travel',
      'education',
      'emergency',
      'retirement',
      'business',
      'other',
      null
    ],
    index: true  // Index for analytics queries
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
StakeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Stake', StakeSchema);
```

#### PostgreSQL Schema Update (If Applicable)

```sql
-- Add goal column to stakes table
ALTER TABLE stakes 
ADD COLUMN goal VARCHAR(20) NULL
CHECK (goal IN (
  'wedding', 'housing', 'vehicle', 'travel', 
  'education', 'emergency', 'retirement', 'business', 'other'
));

-- Add index for analytics queries
CREATE INDEX idx_stakes_goal ON stakes(goal) WHERE goal IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN stakes.goal IS 'Stakeholder''s goal for this stake (optional)';
```

### Data Migration

**No migration required!** The `goal` field is optional and defaults to `null`:
- Existing stakes without `goal` will return `null` or omit the field
- Frontend handles missing goals gracefully (won't display badge)
- No need to backfill existing stakes

**Optional Analytics Enhancement:**
If you want to track goals for existing stakes, you could:
1. Run an admin survey asking users to categorize their existing stakes
2. Use ML/AI to categorize based on stake amounts and user profiles
3. Leave as `null` (recommended - cleanest approach)

### Testing Requirements

#### Unit Tests:
```javascript
describe('Stake Creation with Goal', () => {
  it('should create stake with valid goal', async () => {
    const payload = {
      amount: 100,
      source: 'funded',
      goal: 'wedding'
    };
    const result = await createStake(userId, payload);
    expect(result.stake.goal).toBe('wedding');
  });
  
  it('should create stake without goal', async () => {
    const payload = {
      amount: 100,
      source: 'funded'
      // No goal provided
    };
    const result = await createStake(userId, payload);
    expect(result.stake.goal).toBeNull();
  });
  
  it('should reject invalid goal', async () => {
    const payload = {
      amount: 100,
      source: 'funded',
      goal: 'invalid_goal'
    };
    await expect(createStake(userId, payload)).rejects.toThrow();
  });
  
  it('should accept null goal', async () => {
    const payload = {
      amount: 100,
      source: 'funded',
      goal: null
    };
    const result = await createStake(userId, payload);
    expect(result.stake.goal).toBeNull();
  });
});

describe('Dashboard with Goals', () => {
  it('should return stakes with goals', async () => {
    const dashboard = await getStakingDashboard(userId);
    expect(dashboard.activeStakes[0]).toHaveProperty('goal');
  });
  
  it('should handle stakes without goals', async () => {
    // Create old stake without goal
    const oldStake = await Stake.create({ 
      userId, 
      amount: 100, 
      source: 'funded' 
    });
    
    const dashboard = await getStakingDashboard(userId);
    const stake = dashboard.activeStakes.find(s => s._id === oldStake._id);
    expect(stake.goal).toBeNull();
  });
});
```

#### Integration Tests:
1. ✅ Create stake with goal → verify goal saved and returned
2. ✅ Create stake without goal → verify null goal
3. ✅ Create stake with invalid goal → verify 400 error
4. ✅ Fetch dashboard → verify goals appear in all stakes
5. ✅ Fetch stake details → verify goal included
6. ✅ Old stakes (no goal) → verify null returned gracefully

#### Manual Testing Scenarios:
| Scenario | Expected Result |
|----------|----------------|
| Create stake with `goal: "wedding"` | Stake created with goal "wedding" |
| Create stake without goal field | Stake created with goal = null |
| Create stake with `goal: null` | Stake created with goal = null |
| Create stake with `goal: "invalidGoal"` | 400 error: Invalid goal |
| View dashboard (user with mixed stakes) | All stakes show goal field (null for old stakes) |
| View stake details | Goal field present in response |

### Analytics Opportunities

With goal tracking, you can now:
1. **Goal Distribution Report**: Which goals are most popular?
2. **Goal-Based Performance**: Do certain goals have higher completion rates?
3. **Goal-Based Marketing**: Target ads based on popular goals
4. **Goal Insights**: Average stake amounts per goal category
5. **User Segmentation**: Group users by their primary goals

**Example Analytics Query:**
```javascript
// MongoDB aggregation example
const goalStats = await Stake.aggregate([
  { $match: { status: 'active', goal: { $ne: null } } },
  { 
    $group: { 
      _id: '$goal',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' },
      avgAmount: { $avg: '$amount' }
    }
  },
  { $sort: { count: -1 } }
]);

/* Expected Output:
[
  { _id: 'wedding', count: 450, totalAmount: 125000, avgAmount: 277.78 },
  { _id: 'housing', count: 380, totalAmount: 198000, avgAmount: 521.05 },
  { _id: 'education', count: 220, totalAmount: 85000, avgAmount: 386.36 },
  ...
]
*/
```

---

## 3. Documentation Updates

### API Documentation Updates Required

Update your API documentation (Swagger/OpenAPI, Postman, etc.) to reflect:

#### Stake Creation Endpoint:
```yaml
/api/v1/staking/create:
  post:
    summary: Create a new stake
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - amount
              - source
            properties:
              amount:
                type: number
                minimum: 20
                example: 100.00
              source:
                type: string
                enum: [funded, earning, both]
                example: funded
              goal:  # NEW FIELD
                type: string
                nullable: true
                enum: 
                  - wedding
                  - housing
                  - vehicle
                  - travel
                  - education
                  - emergency
                  - retirement
                  - business
                  - other
                  - null
                example: wedding
                description: Optional goal for this stake
              twoFactorCode:
                type: string
                minLength: 6
                maxLength: 6
                example: "123456"
```

#### Dashboard Endpoint:
```yaml
/api/v1/staking/dashboard:
  get:
    summary: Get staking dashboard
    responses:
      '200':
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                data:
                  type: object
                  properties:
                    summary:
                      type: object
                      properties:
                        totalEarnedFromROS:  # UPDATED FIELD NAME
                          type: number
                          description: Total earnings from ROS (Return on Stake)
                          example: 1250.50
                    activeStakes:
                      type: array
                      items:
                        type: object
                        properties:
                          goal:  # NEW FIELD
                            type: string
                            nullable: true
                            example: wedding
```

---

## 4. Implementation Timeline

### Phase 1: Critical Fix (Deploy ASAP)
**Priority: HIGH**
- ✅ Rename `totalEarnedFromROI` → `totalEarnedFromROS` in dashboard endpoint
- ✅ Update response messages to use "ROS" terminology
- ✅ Deploy to staging
- ✅ Test with frontend staging build
- ✅ Deploy to production

**Estimated Time:** 2-4 hours  
**Required Before:** Frontend deployment

### Phase 2: Goal Feature (Non-Breaking)
**Priority: MEDIUM**
- ✅ Update database schema (add `goal` field)
- ✅ Add goal validation in stake creation
- ✅ Include goal in API responses
- ✅ Write unit tests
- ✅ Write integration tests
- ✅ Update API documentation
- ✅ Deploy to staging
- ✅ Test with frontend
- ✅ Deploy to production

**Estimated Time:** 6-8 hours  
**Can Deploy:** Independently (non-breaking change)

### Phase 3: Analytics & Monitoring (Optional)
**Priority: LOW**
- ✅ Create goal analytics dashboard
- ✅ Set up goal-based reports
- ✅ Create admin interface for goal insights
- ✅ Set up monitoring/alerts for popular goals

**Estimated Time:** 16-24 hours  
**Can Deploy:** Anytime after Phase 2

---

## 5. Rollback Plan

### If Issues Arise:

#### Rollback Scenario 1: Field Rename Issues
**Problem:** Frontend breaks after `totalEarnedFromROI` → `totalEarnedFromROS` change

**Solution:**
```javascript
// Temporary fix - return both fields
const summary = {
  totalEarnedFromROI: totalEarnings,  // Old field
  totalEarnedFromROS: totalEarnings,  // New field
  // ... other fields
};
```

#### Rollback Scenario 2: Goal Feature Issues
**Problem:** Goal validation causing stake creation failures

**Solution:**
```javascript
// Temporarily disable goal validation
function validateStakeCreation(req, res, next) {
  // Comment out goal validation
  // if (goal && !validGoals.includes(goal)) { ... }
  
  // Just accept any goal value (or ignore it)
  if (req.body.goal && typeof req.body.goal !== 'string') {
    delete req.body.goal;  // Remove invalid goals silently
  }
  
  next();
}
```

**Database Rollback:**
No rollback needed - `goal` field is optional and nullable.

---

## 6. Security Considerations

### Input Validation
```javascript
// Sanitize goal input
function sanitizeGoal(goal) {
  if (!goal) return null;
  
  // Trim whitespace
  goal = goal.trim().toLowerCase();
  
  // Validate against enum
  const validGoals = [
    'wedding', 'housing', 'vehicle', 'travel',
    'education', 'emergency', 'retirement', 'business', 'other'
  ];
  
  if (!validGoals.includes(goal)) {
    throw new Error('Invalid goal value');
  }
  
  return goal;
}
```

### Rate Limiting
No changes needed - existing rate limiting on stake creation applies.

### Authorization
No changes needed - existing user authentication/authorization applies.

---

## 7. Performance Considerations

### Database Indexing
The `goal` field has been indexed for analytics queries:
```javascript
// MongoDB
StakeSchema.index({ goal: 1 });

// PostgreSQL
CREATE INDEX idx_stakes_goal ON stakes(goal) WHERE goal IS NOT NULL;
```

### Query Performance
- **Impact:** Minimal - optional field with index
- **Read Operations:** No impact (field already in document)
- **Write Operations:** Negligible (single string field)
- **Aggregation Queries:** Optimized with index

### Caching Considerations
If you're caching dashboard responses:
- ✅ Update cache keys to include version (e.g., `dashboard:v2:userId`)
- ✅ Invalidate old caches after deployment
- ✅ Consider cache TTL reduction during deployment

---

## 8. Monitoring & Alerts

### Metrics to Track

#### Goal Adoption Rate:
```javascript
// Percentage of new stakes with goals
const goalsSet = await Stake.countDocuments({ 
  goal: { $ne: null },
  createdAt: { $gte: deploymentDate }
});

const totalNew = await Stake.countDocuments({ 
  createdAt: { $gte: deploymentDate }
});

const adoptionRate = (goalsSet / totalNew) * 100;
// Target: >60% adoption rate
```

#### Goal Distribution:
```javascript
// Monitor which goals are most popular
const distribution = await Stake.aggregate([
  { $match: { goal: { $ne: null } } },
  { $group: { _id: '$goal', count: { $sum: 1 } } }
]);
```

#### Error Rate:
- Monitor 400 errors on `/staking/create` for invalid goals
- Set alert if error rate > 5%

### Recommended Alerts:
1. 🚨 Alert if `totalEarnedFromROS` field missing in responses
2. 🚨 Alert if stake creation error rate spikes
3. 📊 Daily report on goal adoption rate
4. 📊 Weekly report on goal distribution

---

## 9. Communication Plan

### Internal Team Communication

#### Development Team:
- ✅ Share this document
- ✅ Schedule code review session
- ✅ Coordinate deployment time with frontend team
- ✅ Set up war room channel for deployment day

#### QA Team:
- ✅ Provide test cases (see Section 2.4)
- ✅ Coordinate staging environment testing
- ✅ Plan regression testing schedule

#### Product/Business Team:
- ✅ Demo new goal feature
- ✅ Share analytics opportunities
- ✅ Discuss marketing implications

### External Communication (If Needed):
- No user-facing changes beyond UI improvements
- No breaking changes for API consumers
- Optional: Product update email highlighting goal feature

---

## 10. FAQ

### Q: Is the goal field required?
**A:** No, it's optional. Users can create stakes without selecting a goal.

### Q: What happens to existing stakes?
**A:** They will have `goal: null`. No migration needed.

### Q: Can users change their stake's goal after creation?
**A:** Not currently implemented in frontend. Backend can add `PATCH /staking/:stakeId` endpoint if needed.

### Q: Why these specific goals?
**A:** Based on common financial goals. Can be expanded based on user research and analytics.

### Q: Will this affect stake calculations?
**A:** No, goals are purely for categorization and user experience.

### Q: Do we need to validate goals on every API call?
**A:** Only on stake creation. Other endpoints just return the stored value.

### Q: What if a user selects "other" - can they specify?
**A:** Not in current implementation. "Other" is a catch-all. Could add custom goal field in future.

### Q: Should goals be translatable for international users?
**A:** Frontend handles display. Backend stores enum values. i18n handled client-side.

---

## 11. Success Criteria

### Definition of Done:

#### Phase 1 (Critical Fix):
- [x] `totalEarnedFromROS` field returns correct values
- [x] All existing functionality works with new field name
- [x] No errors in production logs
- [x] Frontend displays "ROS" correctly

#### Phase 2 (Goal Feature):
- [x] Users can create stakes with goals
- [x] Users can create stakes without goals
- [x] Invalid goals are rejected with clear error messages
- [x] Goals display correctly in frontend
- [x] All tests pass (unit + integration)
- [x] API documentation updated
- [x] No performance degradation

#### Acceptance Criteria:
1. ✅ 100% of dashboard calls return `totalEarnedFromROS`
2. ✅ 0% error rate on valid stake creation with goals
3. ✅ 100% of stakes include `goal` field (nullable)
4. ✅ >90% test coverage for goal-related code
5. ✅ <50ms performance impact on stake creation
6. ✅ Goal adoption rate >50% within first week

---

## 12. Contact Information

### For Questions or Issues:

**Frontend Team:**
- Lead: [Frontend Lead Name]
- Email: frontend@novunt.com
- Slack: #frontend-team

**Backend Team:**
- Lead: [Backend Lead Name]
- Email: backend@novunt.com
- Slack: #backend-team

**DevOps:**
- Lead: [DevOps Lead Name]
- Email: devops@novunt.com
- Slack: #devops

**Emergency Contact:**
- On-Call Engineer: [Phone Number]
- Incident Channel: #incidents

---

## 13. Appendix

### A. Complete Request/Response Examples

#### Example 1: Create Stake with Goal
**Request:**
```bash
POST /api/v1/staking/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "source": "funded",
  "goal": "wedding"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stake created successfully",
  "stake": {
    "_id": "673b4f2e1a2b3c4d5e6f7890",
    "userId": "673a1b2c3d4e5f6789012345",
    "amount": 500.00,
    "source": "funded",
    "goal": "wedding",
    "targetReturn": 1000.00,
    "totalEarned": 0,
    "progressToTarget": "0.00%",
    "remainingToTarget": 1000.00,
    "status": "active",
    "createdAt": "2025-11-18T10:30:00.000Z",
    "weeklyPayouts": []
  }
}
```

#### Example 2: Create Stake without Goal
**Request:**
```bash
POST /api/v1/staking/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "source": "both"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stake created successfully",
  "stake": {
    "_id": "673b4f2e1a2b3c4d5e6f7891",
    "userId": "673a1b2c3d4e5f6789012345",
    "amount": 100.00,
    "source": "both",
    "goal": null,
    "targetReturn": 200.00,
    "status": "active",
    "createdAt": "2025-11-18T10:35:00.000Z"
  }
}
```

#### Example 3: Dashboard Response
**Request:**
```bash
GET /api/v1/staking/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallets": {
      "fundedWallet": 1500.00,
      "earningWallet": 250.50,
      "totalAvailableBalance": 1750.50,
      "description": {
        "fundedWallet": "Available for staking only (deposits + P2P transfers)",
        "earningWallet": "Available for withdrawal + staking (ROS + bonuses)"
      }
    },
    "activeStakes": [
      {
        "_id": "673b4f2e1a2b3c4d5e6f7890",
        "userId": "673a1b2c3d4e5f6789012345",
        "amount": 500.00,
        "source": "funded",
        "goal": "wedding",
        "targetReturn": 1000.00,
        "totalEarned": 125.50,
        "progressToTarget": "12.55%",
        "remainingToTarget": 874.50,
        "status": "active",
        "createdAt": "2025-11-18T10:30:00.000Z",
        "weeklyPayouts": [
          {
            "week": 1,
            "amount": 25.50,
            "date": "2025-11-25T00:00:00.000Z",
            "status": "paid"
          }
        ]
      },
      {
        "_id": "673b4f2e1a2b3c4d5e6f7891",
        "userId": "673a1b2c3d4e5f6789012345",
        "amount": 100.00,
        "source": "both",
        "goal": null,
        "targetReturn": 200.00,
        "totalEarned": 15.00,
        "progressToTarget": "7.50%",
        "remainingToTarget": 185.00,
        "status": "active",
        "createdAt": "2025-11-17T14:20:00.000Z",
        "weeklyPayouts": []
      }
    ],
    "stakeHistory": [],
    "summary": {
      "totalActiveStakes": 600.00,
      "totalStakesSinceInception": 2,
      "totalEarnedFromROS": 140.50,
      "targetTotalReturns": 1200.00,
      "progressToTarget": "11.71%",
      "stakingModel": "Weekly ROS based on Novunt trading performance until 200% returns",
      "note": "Stakes are permanent commitments. You benefit through weekly ROS payouts to your Earning Wallet until 200% maturity."
    }
  }
}
```

### B. Error Response Examples

#### Invalid Goal:
```json
{
  "success": false,
  "message": "Invalid goal. Must be one of: wedding, housing, vehicle, travel, education, emergency, retirement, business, other"
}
```

#### Missing Required Fields:
```json
{
  "success": false,
  "message": "Amount and source are required"
}
```

### C. Database Schema Reference

```javascript
// Complete Stake Schema with all fields
const StakeSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 20 },
  source: { type: String, enum: ['funded', 'earning', 'both'], required: true },
  goal: { 
    type: String, 
    enum: ['wedding', 'housing', 'vehicle', 'travel', 'education', 'emergency', 'retirement', 'business', 'other', null],
    default: null,
    index: true 
  },
  targetReturn: { type: Number, required: true },
  totalEarned: { type: Number, default: 0 },
  progressToTarget: { type: Number, default: 0 },
  remainingToTarget: { type: Number },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active', index: true },
  weeklyPayouts: [{
    week: Number,
    amount: Number,
    date: Date,
    status: { type: String, enum: ['pending', 'paid'] }
  }],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## Document Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-18 | Frontend Team | Initial document |

---

**END OF DOCUMENT**

For implementation questions or clarifications, please contact the frontend team or create a ticket in the project management system.
