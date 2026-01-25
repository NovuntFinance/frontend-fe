# Backend API Specification: Daily Declaration Returns

**Date**: January 2025  
**Priority**: 🔴 **HIGH** - Frontend Merge Dependency  
**Status**: 📋 **AWAITING BACKEND IMPLEMENTATION**

---

## 📋 Executive Summary

The frontend team is merging the **Pool Declaration** and **Daily Profit** pages into a unified **"Daily Declaration Returns"** page. This requires backend API changes to support declaring pools + ROS for specific dates in a single operation.

**Current State**:

- Pool Declaration: Date-agnostic (declares pools for "now")
- Daily Profit: Date-specific (declares ROS + pools for specific dates)

**Desired State**:

- Unified endpoint: Declare pools + ROS for a specific date in one operation
- Unified response: Return both pool and ROS declaration status
- Enhanced queries: Get all declarations (pools + ROS) together

---

## 🎯 Goals

1. **Unified Declaration**: Declare pools + ROS for a specific date in one API call
2. **Data Consistency**: Ensure pools and ROS are declared together for the same date
3. **Backward Compatibility**: Keep existing endpoints working (don't break current functionality)
4. **Enhanced Queries**: Get all declarations (pools + ROS) in one response

---

## 🔌 Required API Changes

### Option 1: New Unified Endpoint (Recommended)

Create a new endpoint that combines pool declaration + daily profit declaration:

#### **POST `/api/v1/admin/daily-declaration-returns/declare`**

**Purpose**: Declare pools + ROS for a specific date in one operation

**Authentication**: Admin only (requires 2FA)

**Request Body**:

```json
{
  "date": "2025-01-20", // YYYY-MM-DD format (required)
  "premiumPoolAmount": 10000, // Dollar amount (required, >= 0)
  "performancePoolAmount": 5000, // Dollar amount (required, >= 0)
  "rosPercentage": 0.55, // 0-2.2 percentage (required)
  "description": "Normal day", // Optional string
  "autoDistributePools": false, // Optional boolean (default: false)
  "autoDistributeROS": false, // Optional boolean (default: false)
  "twoFACode": "123456" // Required if admin has 2FA enabled
}
```

**Validation Rules**:

- `date`: Must be today or future date, max 30 days ahead
- `premiumPoolAmount`: >= 0
- `performancePoolAmount`: >= 0
- `rosPercentage`: 0-2.2 (inclusive)
- At least one pool amount must be > 0 OR rosPercentage > 0
- Cannot declare for a date that already has a declaration (return 409 Conflict)

**Response** (Success - 200):

```json
{
  "success": true,
  "message": "Daily declaration returns declared successfully",
  "data": {
    "declaration": {
      "date": "2025-01-20",
      "premiumPoolAmount": 10000,
      "performancePoolAmount": 5000,
      "rosPercentage": 0.55,
      "description": "Normal day",
      "totalPoolAmount": 15000,
      "declaredBy": {
        "_id": "admin123",
        "email": "admin@novunt.com",
        "username": "admin"
      },
      "declaredAt": "2025-01-15T10:30:00.000Z"
    },
    "poolDistribution": {
      "distributed": false, // true if autoDistributePools was true
      "distributedAt": null, // ISO timestamp if distributed
      "performancePool": {
        "distributed": 0, // Number of users who received
        "totalDistributed": 0 // Total amount distributed
      },
      "premiumPool": {
        "distributed": 0,
        "totalDistributed": 0
      },
      "totalDistributed": 0
    },
    "rosDistribution": {
      "scheduled": false, // true if autoDistributeROS was true
      "scheduledFor": null, // Date if scheduled
      "distributed": false, // true if ROS was distributed
      "distributedAt": null // ISO timestamp if distributed
    },
    "qualifiers": {
      "performancePool": {
        "totalQualifiers": 150,
        "byRank": {
          "Associate Stakeholder": 50,
          "Principal Strategist": 40,
          "Elite Capitalist": 30,
          "Wealth Architect": 20,
          "Finance Titan": 10
        }
      },
      "premiumPool": {
        "totalQualifiers": 75,
        "byRank": {
          "Principal Strategist": 30,
          "Elite Capitalist": 25,
          "Wealth Architect": 15,
          "Finance Titan": 5
        }
      }
    }
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input (validation errors)
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin or 2FA invalid
- `409 Conflict`: Date already has a declaration
- `500 Internal Server Error`: Server error

---

#### **GET `/api/v1/admin/daily-declaration-returns/declared`**

**Purpose**: Get all declarations (pools + ROS) for a date range

**Authentication**: Admin only (2FA not required for GET)

**Query Parameters**:

- `startDate` (optional): YYYY-MM-DD format, default: today
- `endDate` (optional): YYYY-MM-DD format, default: today + 30 days
- `includeDistributed` (optional): boolean, default: true

**Response** (Success - 200):

```json
{
  "success": true,
  "data": {
    "declarations": [
      {
        "date": "2025-01-20",
        "premiumPoolAmount": 10000,
        "performancePoolAmount": 5000,
        "rosPercentage": 0.55,
        "description": "Normal day",
        "totalPoolAmount": 15000,
        "poolsDistributed": false,
        "poolsDistributedAt": null,
        "rosDistributed": false,
        "rosDistributedAt": null,
        "declaredBy": {
          "_id": "admin123",
          "email": "admin@novunt.com",
          "username": "admin"
        },
        "declaredAt": "2025-01-15T10:30:00.000Z",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "totalDates": 1,
      "totalPoolAmount": 15000,
      "totalROSDeclared": 0.55,
      "distributedDates": 0,
      "pendingDates": 1
    }
  },
  "meta": {
    "startDate": "2025-01-15",
    "endDate": "2025-02-14",
    "count": 1
  }
}
```

---

#### **PATCH `/api/v1/admin/daily-declaration-returns/:date`**

**Purpose**: Update a future declaration (pools + ROS)

**Authentication**: Admin only (requires 2FA)

**Request Body** (all fields optional):

```json
{
  "premiumPoolAmount": 12000,
  "performancePoolAmount": 6000,
  "rosPercentage": 0.6,
  "description": "Updated description",
  "twoFACode": "123456"
}
```

**Validation**:

- Cannot update if pools or ROS already distributed (return 409 Conflict)
- Cannot update past dates (return 400 Bad Request)
- At least one field must be provided

**Response**: Same structure as POST response

---

#### **DELETE `/api/v1/admin/daily-declaration-returns/:date`**

**Purpose**: Delete a future declaration

**Authentication**: Admin only (requires 2FA)

**Request Body**:

```json
{
  "twoFACode": "123456"
}
```

**Validation**:

- Cannot delete if pools or ROS already distributed (return 409 Conflict)
- Cannot delete past dates (return 400 Bad Request)

**Response**:

```json
{
  "success": true,
  "message": "Daily declaration returns deleted successfully"
}
```

---

#### **POST `/api/v1/admin/daily-declaration-returns/:date/distribute`**

**Purpose**: Manually trigger distribution for a specific date

**Authentication**: Admin only (requires 2FA)

**Request Body**:

```json
{
  "distributePools": true, // Distribute pools
  "distributeROS": true, // Distribute ROS
  "twoFACode": "123456"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Distribution completed successfully",
  "data": {
    "date": "2025-01-20",
    "poolDistribution": {
      "distributed": true,
      "distributedAt": "2025-01-20T00:00:00.000Z",
      "performancePool": {
        "distributed": 150,
        "totalDistributed": 5000
      },
      "premiumPool": {
        "distributed": 75,
        "totalDistributed": 10000
      },
      "totalDistributed": 15000
    },
    "rosDistribution": {
      "distributed": true,
      "distributedAt": "2025-01-20T00:00:00.000Z",
      "rosPercentage": 0.55,
      "totalStakes": 500,
      "processedStakes": 500,
      "totalDistributed": 2750
    }
  }
}
```

---

### Option 2: Enhance Existing Endpoints (Alternative)

If creating new endpoints is not preferred, enhance existing endpoints:

#### **Enhancement 1: Daily Profit Declare Endpoint**

**POST `/api/v1/admin/daily-profit/declare`** (existing)

**Add to Request Body**:

```json
{
  "date": "2025-01-20",
  "premiumPoolAmount": 10000,
  "performancePoolAmount": 5000,
  "rosPercentage": 0.55,
  "description": "Normal day",
  "autoDistributePools": false, // NEW FIELD
  "twoFACode": "123456"
}
```

**Enhancement**: If `autoDistributePools: true`, automatically call pool distribution logic after declaring daily profit.

**Response Enhancement**: Include pool distribution status in response if `autoDistributePools` was true.

---

#### **Enhancement 2: Pool Declare Endpoint**

**POST `/api/v1/admin/pool/declare`** (existing)

**Add to Request Body**:

```json
{
  "performancePoolAmount": 5000,
  "premiumPoolAmount": 10000,
  "date": "2025-01-20", // NEW FIELD (optional)
  "rosPercentage": 0.55, // NEW FIELD (optional)
  "autoDistribute": false,
  "notes": "Notes"
}
```

**Enhancement**:

- If `date` is provided, associate pool declaration with that date
- If `rosPercentage` is provided, also declare ROS for that date
- If both `date` and `rosPercentage` provided, create unified declaration

---

## 🔄 Data Model Considerations

### Database Schema

**Option A: Single Collection** (Recommended)

```javascript
{
  _id: ObjectId,
  date: String,                    // YYYY-MM-DD (unique index)
  premiumPoolAmount: Number,
  performancePoolAmount: Number,
  rosPercentage: Number,           // 0-2.2
  description: String,

  // Pool Distribution Status
  poolsDistributed: Boolean,
  poolsDistributedAt: Date,
  poolsDistributionDetails: {
    performancePool: {
      distributed: Number,
      totalDistributed: Number
    },
    premiumPool: {
      distributed: Number,
      totalDistributed: Number
    },
    totalDistributed: Number
  },

  // ROS Distribution Status
  rosDistributed: Boolean,
  rosDistributedAt: Date,
  rosDistributionDetails: {
    totalStakes: Number,
    processedStakes: Number,
    totalDistributed: Number
  },

  // Metadata
  declaredBy: ObjectId (ref: User),
  declaredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Option B: Keep Separate Collections** (Alternative)

- Keep `DailyProfit` collection for ROS
- Keep `PoolDeclaration` collection for pools
- Link them via `date` field
- Query both and merge in API response

**Recommendation**: Option A (single collection) for better data consistency and simpler queries.

---

## 🔍 Query Requirements

### Get Qualifier Counts (Reuse Existing)

**GET `/api/v1/admin/pool/qualifiers`** (existing, no changes needed)

This endpoint should continue to work as-is, returning real-time qualifier counts.

---

### Get Declaration for Specific Date

**GET `/api/v1/admin/daily-declaration-returns/:date`**

**Response**:

```json
{
  "success": true,
  "data": {
    "date": "2025-01-20",
    "premiumPoolAmount": 10000,
    "performancePoolAmount": 5000,
    "rosPercentage": 0.55,
    "description": "Normal day",
    "poolsDistributed": false,
    "rosDistributed": false,
    "declaredBy": { "_id": "...", "email": "...", "username": "..." },
    "declaredAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**404 Not Found**: If date has no declaration

---

## ⚠️ Important Considerations

### 1. **Backward Compatibility**

**CRITICAL**: Existing endpoints must continue to work:

- `POST /api/v1/admin/pool/declare` - Should still work (date-agnostic)
- `POST /api/v1/admin/daily-profit/declare` - Should still work (date-specific)
- `GET /api/v1/admin/daily-profit/declared` - Should still work

**Recommendation**:

- New unified endpoint calls existing endpoints internally OR
- Keep existing endpoints, new endpoint is a convenience wrapper

### 2. **Distribution Logic**

**Pool Distribution**:

- Uses current qualifier counts at time of distribution
- Distributes equally among qualifiers
- Updates user wallets

**ROS Distribution**:

- Uses ROS percentage to calculate returns on stake
- Distributes to all active stakes
- Updates stake balances

**Important**: Both distributions should be independent - can distribute pools without ROS and vice versa.

### 3. **Date Validation**

- Cannot declare for past dates
- Cannot declare more than 30 days in advance
- Cannot update/delete if already distributed
- Cannot declare duplicate dates (409 Conflict)

### 4. **2FA Requirements**

- All POST/PATCH/DELETE operations require 2FA
- GET operations do NOT require 2FA
- 2FA code in request body (not query params for POST/PATCH/DELETE)

---

## 📊 Example Workflows

### Workflow 1: Declare Pools + ROS for Today

**Request**:

```json
POST /api/v1/admin/daily-declaration-returns/declare
{
  "date": "2025-01-15",
  "premiumPoolAmount": 10000,
  "performancePoolAmount": 5000,
  "rosPercentage": 0.55,
  "description": "Normal day",
  "autoDistributePools": false,
  "autoDistributeROS": false,
  "twoFACode": "123456"
}
```

**Response**: Declaration created, pools and ROS scheduled but not distributed

---

### Workflow 2: Declare and Auto-Distribute

**Request**:

```json
POST /api/v1/admin/daily-declaration-returns/declare
{
  "date": "2025-01-15",
  "premiumPoolAmount": 10000,
  "performancePoolAmount": 5000,
  "rosPercentage": 0.55,
  "autoDistributePools": true,
  "autoDistributeROS": true,
  "twoFACode": "123456"
}
```

**Response**: Declaration created, pools distributed immediately, ROS distributed immediately

---

### Workflow 3: Update Future Declaration

**Request**:

```json
PATCH /api/v1/admin/daily-declaration-returns/2025-01-20
{
  "premiumPoolAmount": 12000,
  "rosPercentage": 0.60,
  "twoFACode": "123456"
}
```

**Response**: Updated declaration (only changed fields updated)

---

### Workflow 4: Manual Distribution

**Request**:

```json
POST /api/v1/admin/daily-declaration-returns/2025-01-20/distribute
{
  "distributePools": true,
  "distributeROS": true,
  "twoFACode": "123456"
}
```

**Response**: Distribution completed for both pools and ROS

---

## 🧪 Testing Requirements

### Test Cases

1. **Declare for Future Date**
   - ✅ Success: Valid date (today + 1 to today + 30)
   - ❌ Error: Past date (400 Bad Request)
   - ❌ Error: Date > 30 days ahead (400 Bad Request)

2. **Duplicate Declaration**
   - ❌ Error: Declare same date twice (409 Conflict)

3. **Update Declaration**
   - ✅ Success: Update future date
   - ❌ Error: Update past date (400 Bad Request)
   - ❌ Error: Update distributed date (409 Conflict)

4. **Delete Declaration**
   - ✅ Success: Delete future date
   - ❌ Error: Delete past date (400 Bad Request)
   - ❌ Error: Delete distributed date (409 Conflict)

5. **Distribution**
   - ✅ Success: Distribute pools only
   - ✅ Success: Distribute ROS only
   - ✅ Success: Distribute both
   - ❌ Error: Distribute already distributed date (409 Conflict)

6. **Qualifier Counts**
   - ✅ Returns real-time counts
   - ✅ Includes breakdown by rank

---

## 📝 Implementation Notes

### Backend Implementation Steps

1. **Create New Endpoints** (if Option 1 chosen)
   - `POST /api/v1/admin/daily-declaration-returns/declare`
   - `GET /api/v1/admin/daily-declaration-returns/declared`
   - `PATCH /api/v1/admin/daily-declaration-returns/:date`
   - `DELETE /api/v1/admin/daily-declaration-returns/:date`
   - `POST /api/v1/admin/daily-declaration-returns/:date/distribute`

2. **Database Schema** (if Option A chosen)
   - Create new collection OR enhance existing `DailyProfit` collection
   - Add indexes: `date` (unique), `declaredAt`, `poolsDistributed`, `rosDistributed`

3. **Business Logic**
   - Reuse existing pool distribution logic
   - Reuse existing ROS distribution logic
   - Add validation for unified declaration
   - Ensure data consistency (pools + ROS for same date)

4. **Error Handling**
   - Proper HTTP status codes
   - Clear error messages
   - Validation errors in response body

5. **Testing**
   - Unit tests for each endpoint
   - Integration tests for full workflows
   - Edge case testing (past dates, duplicates, etc.)

---

## ✅ Acceptance Criteria

- [ ] Can declare pools + ROS for a specific date in one API call
- [ ] Can get all declarations (pools + ROS) in one query
- [ ] Can update future declarations
- [ ] Can delete future declarations
- [ ] Can distribute pools and ROS independently
- [ ] Existing endpoints still work (backward compatible)
- [ ] Proper error handling and validation
- [ ] 2FA required for all mutations
- [ ] Date validation (no past dates, max 30 days ahead)
- [ ] Cannot modify distributed declarations

---

## 📞 Questions for Backend Team

1. **Preferred Approach**: Option 1 (new endpoints) or Option 2 (enhance existing)?
2. **Database Schema**: Single collection or keep separate collections?
3. **Distribution Timing**: Should pools and ROS distribute at same time or independently?
4. **Backward Compatibility**: Keep existing endpoints indefinitely or deprecate after migration?
5. **Timeline**: When can this be implemented?

---

**Status**: 📋 **AWAITING BACKEND RESPONSE**  
**Contact**: Frontend Team for questions or clarifications
