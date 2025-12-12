# Backend API Specification: Pool Distributions History Endpoint

**Status:** 🔴 **REQUIRED FOR FRONTEND**  
**Priority:** High  
**Date:** January 2025  
**Affected Endpoint:** `/api/v1/user-rank/my-pool-distributions`  
**Frontend Component:** Distribution History Card (Rank & Qualification Tab)

---

## 🎯 **PURPOSE**

This endpoint provides the complete pool distribution history for a user, displaying all earnings from both Performance Pool (rank_pool) and Premium Pool (redistribution_pool) distributions. The data is used in the "Distribution History" card on the Rank & Qualification page.

---

## 📋 **ENDPOINT SPECIFICATION**

### **Endpoint URL**

```
GET /api/v1/user-rank/my-pool-distributions
```

### **Authentication**

- ✅ **Required**: User must be authenticated
- ✅ **Authorization**: Returns only distributions for the authenticated user

### **Request Parameters (Query String)**

| Parameter          | Type   | Required | Default | Description                                              |
| ------------------ | ------ | -------- | ------- | -------------------------------------------------------- |
| `page`             | number | No       | `1`     | Page number for pagination (1-indexed)                   |
| `limit`            | number | No       | `20`    | Number of distributions per page (max: 100)              |
| `distributionType` | string | No       | `null`  | Filter by type: `'rank_pool'` or `'redistribution_pool'` |

**Example Requests:**

```
GET /api/v1/user-rank/my-pool-distributions?page=1&limit=20
GET /api/v1/user-rank/my-pool-distributions?page=2&limit=20&distributionType=rank_pool
GET /api/v1/user-rank/my-pool-distributions?distributionType=redistribution_pool
```

---

## 📊 **RESPONSE STRUCTURE**

### **Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "distributions": [
      {
        "_id": "distribution_id_123",
        "rankName": "Stakeholder",
        "distributionType": "rank_pool",
        "totalPoolAmount": 50000,
        "userShare": 0.025,
        "bonusAmount": 1250,
        "verificationIcon": "blue",
        "isQualified": true,
        "distributionPeriod": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "totalEarnings": {
      "rankPool": 12500,
      "redistributionPool": 6250,
      "total": 18750
    }
  }
}
```

### **Empty Response (No Distributions)**

```json
{
  "success": true,
  "data": {
    "distributions": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    },
    "totalEarnings": {
      "rankPool": 0,
      "redistributionPool": 0,
      "total": 0
    }
  }
}
```

### **Error Response (404 Not Found)**

```json
{
  "success": false,
  "message": "No distributions found for this user"
}
```

---

## 🔍 **FIELD SPECIFICATIONS**

### **Distribution Object (`distributions[]`)**

Each distribution object **MUST** contain the following fields:

#### **1. `_id` (string, required)**

- **Description**: Unique identifier for the distribution record
- **Format**: MongoDB ObjectId or UUID string
- **Example**: `"507f1f77bcf86cd799439011"`

#### **2. `rankName` (string, required)**

- **Description**: User's rank name at the time of distribution
- **Format**: String matching rank names (e.g., "Stakeholder", "Associate", "Associate Stakeholder")
- **Example**: `"Stakeholder"`
- **Usage**: Displayed as a badge next to pool type

#### **3. `distributionType` (string, required)**

- **Description**: Type of pool distribution
- **Allowed Values**:
  - `"rank_pool"` - Performance Pool distribution
  - `"redistribution_pool"` - Premium Pool distribution
- **Example**: `"rank_pool"`
- **Usage**: Frontend displays "Performance Pool" for `rank_pool` and "Premium Pool" for `redistribution_pool`

#### **4. `totalPoolAmount` (number, required)**

- **Description**: Total amount in the pool for this distribution period
- **Format**: Number (decimal, 2 decimal places)
- **Example**: `50000.00`
- **Note**: Used for reference, may be displayed in future features

#### **5. `userShare` (number, required)**

- **Description**: User's share of the pool as a decimal (0-1)
- **Format**: Number between 0 and 1 (e.g., 0.025 = 2.5%)
- **Example**: `0.025` (represents 2.5%)
- **Calculation**: `userShare = userBonusAmount / totalPoolAmount`
- **Usage**: Frontend displays as percentage: `(userShare * 100).toFixed(2) + "%"`

#### **6. `bonusAmount` (number, required)**

- **Description**: Amount the user received from this distribution
- **Format**: Number (decimal, 2 decimal places)
- **Example**: `1250.00`
- **Calculation**: `bonusAmount = totalPoolAmount * userShare`
- **Usage**: Displayed prominently as "+$1,250.00" in green

#### **7. `verificationIcon` (string, required)**

- **Description**: Icon color indicator for UI display
- **Allowed Values**:
  - `"blue"` - Performance Pool, Qualified
  - `"green"` - Premium Pool, Qualified
  - `"red"` - Not Qualified
- **Example**: `"blue"`
- **Logic**:
  - `"blue"` if `distributionType === "rank_pool" && isQualified === true`
  - `"green"` if `distributionType === "redistribution_pool" && isQualified === true`
  - `"red"` if `isQualified === false`

#### **8. `isQualified` (boolean, required)**

- **Description**: Whether the user was qualified for this distribution
- **Format**: Boolean (`true` or `false`)
- **Example**: `true`
- **Usage**:
  - If `true`: Shows checkmark icon and "Qualified" badge
  - If `false`: Shows X icon, no badge, and `bonusAmount` should be 0

#### **9. `distributionPeriod` (string, required)**

- **Description**: The period/date this distribution covers
- **Format**: ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Example**: `"2024-01-15T00:00:00.000Z"`
- **Usage**: Displayed as "Period: Jan 15, 2024" (formatted by frontend)
- **Note**: Typically the start of the distribution period (e.g., Monday of the week)

#### **10. `createdAt` (string, required)**

- **Description**: When the distribution record was created/paid out
- **Format**: ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Example**: `"2024-01-16T10:30:00.000Z"`
- **Usage**: Displayed as "Jan 16, 2024" below the bonus amount

---

### **Pagination Object (`pagination`)**

#### **1. `page` (number, required)**

- **Description**: Current page number
- **Format**: Integer, 1-indexed
- **Example**: `1`

#### **2. `limit` (number, required)**

- **Description**: Number of items per page
- **Format**: Integer
- **Example**: `20`

#### **3. `total` (number, required)**

- **Description**: Total number of distributions matching the filter
- **Format**: Integer
- **Example**: `45`
- **Note**: Should reflect filtered count if `distributionType` is provided

#### **4. `totalPages` (number, required)**

- **Description**: Total number of pages
- **Format**: Integer
- **Calculation**: `totalPages = Math.ceil(total / limit)`
- **Example**: `3`

---

### **Total Earnings Object (`totalEarnings`)**

#### **1. `rankPool` (number, required)**

- **Description**: Sum of all Performance Pool (`rank_pool`) earnings for the user
- **Format**: Number (decimal, 2 decimal places)
- **Example**: `12500.00`
- **Calculation**: Sum of `bonusAmount` where `distributionType === "rank_pool"`

#### **2. `redistributionPool` (number, required)**

- **Description**: Sum of all Premium Pool (`redistribution_pool`) earnings for the user
- **Format**: Number (decimal, 2 decimal places)
- **Example**: `6250.00`
- **Calculation**: Sum of `bonusAmount` where `distributionType === "redistribution_pool"`

#### **3. `total` (number, required)**

- **Description**: Sum of all pool earnings (both types)
- **Format**: Number (decimal, 2 decimal places)
- **Example**: `18750.00`
- **Calculation**: `total = rankPool + redistributionPool`

**Important Notes:**

- These totals should be calculated from **ALL** user distributions, not just the current page
- Totals should respect the `distributionType` filter if provided
- If `distributionType === "rank_pool"`, `redistributionPool` should be 0 in totals
- If `distributionType === "redistribution_pool"`, `rankPool` should be 0 in totals

---

## 🔄 **FILTERING LOGIC**

### **Filter by Distribution Type**

When `distributionType` query parameter is provided:

**If `distributionType === "rank_pool"`:**

- Return only distributions where `distributionType === "rank_pool"`
- Set `totalEarnings.redistributionPool = 0`
- Set `totalEarnings.total = totalEarnings.rankPool`

**If `distributionType === "redistribution_pool"`:**

- Return only distributions where `distributionType === "redistribution_pool"`
- Set `totalEarnings.rankPool = 0`
- Set `totalEarnings.total = totalEarnings.redistributionPool`

**If `distributionType` is not provided:**

- Return all distributions (both types)
- Calculate totals for both pools

---

## 📅 **SORTING REQUIREMENTS**

### **Default Sort Order**

- **Primary**: Sort by `distributionPeriod` in **descending order** (newest first)
- **Secondary**: If same period, sort by `createdAt` in **descending order** (newest first)

**Example:**

```
Most Recent → Oldest
2024-01-15 → 2024-01-08 → 2024-01-01 → 2023-12-25
```

---

## 🧮 **CALCULATION REQUIREMENTS**

### **1. User Share Calculation**

```javascript
userShare = bonusAmount / totalPoolAmount;
// Example: 1250 / 50000 = 0.025 (2.5%)
```

### **2. Bonus Amount Calculation**

```javascript
bonusAmount = totalPoolAmount * userShare;
// Example: 50000 * 0.025 = 1250
```

### **3. Verification Icon Logic**

```javascript
if (distributionType === 'rank_pool' && isQualified === true) {
  verificationIcon = 'blue';
} else if (distributionType === 'redistribution_pool' && isQualified === true) {
  verificationIcon = 'green';
} else {
  verificationIcon = 'red';
}
```

### **4. Total Earnings Calculation**

```javascript
// Calculate from ALL user distributions (not just current page)
rankPoolTotal = sum(bonusAmount where distributionType === "rank_pool")
redistributionPoolTotal = sum(bonusAmount where distributionType === "redistribution_pool")
total = rankPoolTotal + redistributionPoolTotal
```

---

## ✅ **VALIDATION REQUIREMENTS**

### **Field Validation**

1. **`_id`**: Must be unique, non-empty string
2. **`rankName`**: Must be a valid rank name from your rank system
3. **`distributionType`**: Must be exactly `"rank_pool"` or `"redistribution_pool"`
4. **`totalPoolAmount`**: Must be >= 0
5. **`userShare`**: Must be between 0 and 1 (inclusive)
6. **`bonusAmount`**: Must be >= 0
7. **`verificationIcon`**: Must be `"blue"`, `"green"`, or `"red"`
8. **`isQualified`**: Must be boolean
9. **`distributionPeriod`**: Must be valid ISO 8601 date string
10. **`createdAt`**: Must be valid ISO 8601 date string

### **Data Consistency**

- If `isQualified === false`, `bonusAmount` should be `0`
- `userShare` should match: `userShare ≈ bonusAmount / totalPoolAmount` (within rounding tolerance)
- `verificationIcon` should match qualification status and distribution type

---

## 📝 **EXAMPLE RESPONSES**

### **Example 1: Multiple Distributions (All Types)**

```json
{
  "success": true,
  "data": {
    "distributions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "rankName": "Stakeholder",
        "distributionType": "rank_pool",
        "totalPoolAmount": 50000,
        "userShare": 0.025,
        "bonusAmount": 1250,
        "verificationIcon": "blue",
        "isQualified": true,
        "distributionPeriod": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-16T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "rankName": "Associate",
        "distributionType": "redistribution_pool",
        "totalPoolAmount": 40000,
        "userShare": 0.015625,
        "bonusAmount": 625,
        "verificationIcon": "green",
        "isQualified": true,
        "distributionPeriod": "2024-01-08T00:00:00.000Z",
        "createdAt": "2024-01-09T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "rankName": "Stakeholder",
        "distributionType": "rank_pool",
        "totalPoolAmount": 45000,
        "userShare": 0.022222,
        "bonusAmount": 1000,
        "verificationIcon": "blue",
        "isQualified": true,
        "distributionPeriod": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-02T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "rankName": "Associate",
        "distributionType": "redistribution_pool",
        "totalPoolAmount": 35000,
        "userShare": 0,
        "bonusAmount": 0,
        "verificationIcon": "red",
        "isQualified": false,
        "distributionPeriod": "2023-12-25T00:00:00.000Z",
        "createdAt": "2023-12-26T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 4,
      "totalPages": 1
    },
    "totalEarnings": {
      "rankPool": 2250,
      "redistributionPool": 625,
      "total": 2875
    }
  }
}
```

### **Example 2: Filtered by Performance Pool**

```json
{
  "success": true,
  "data": {
    "distributions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "rankName": "Stakeholder",
        "distributionType": "rank_pool",
        "totalPoolAmount": 50000,
        "userShare": 0.025,
        "bonusAmount": 1250,
        "verificationIcon": "blue",
        "isQualified": true,
        "distributionPeriod": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    },
    "totalEarnings": {
      "rankPool": 1250,
      "redistributionPool": 0,
      "total": 1250
    }
  }
}
```

### **Example 3: Paginated Response (Page 2)**

```json
{
  "success": true,
  "data": {
    "distributions": [
      // Distributions 21-40
    ],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "totalEarnings": {
      "rankPool": 12500,
      "redistributionPool": 6250,
      "total": 18750
    }
  }
}
```

### **Example 4: No Distributions**

```json
{
  "success": true,
  "data": {
    "distributions": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    },
    "totalEarnings": {
      "rankPool": 0,
      "redistributionPool": 0,
      "total": 0
    }
  }
}
```

---

## 🚨 **CRITICAL REQUIREMENTS**

### **1. Data Accuracy**

- ✅ All monetary values must be accurate and match actual distributions
- ✅ `bonusAmount` must reflect what the user actually received
- ✅ `userShare` must be calculated correctly

### **2. Performance**

- ✅ Endpoint should respond in < 500ms for typical queries
- ✅ Use database indexes on: `userId`, `distributionType`, `distributionPeriod`
- ✅ Pagination should be efficient (limit results per query)

### **3. Security**

- ✅ Only return distributions for the authenticated user
- ✅ Validate user authentication on every request
- ✅ Do not expose other users' distribution data

### **4. Data Consistency**

- ✅ `isQualified` must accurately reflect qualification status at distribution time
- ✅ `rankName` must match user's rank at the time of distribution
- ✅ Dates must be accurate and in correct timezone

---

## 🔍 **EDGE CASES TO HANDLE**

### **1. User Has No Distributions**

- Return empty array with `total: 0`
- Set all `totalEarnings` to `0`

### **2. User Has Distributions But None Match Filter**

- Return empty array
- Set `totalEarnings` based on filter:
  - If `distributionType === "rank_pool"`: `rankPool = 0`, `redistributionPool = 0`, `total = 0`
  - If `distributionType === "redistribution_pool"`: Same as above

### **3. Invalid Page Number**

- If `page < 1`, default to `page = 1`
- If `page > totalPages`, return empty array with correct pagination info

### **4. Invalid Limit**

- If `limit < 1`, default to `limit = 20`
- If `limit > 100`, cap at `limit = 100`

### **5. Invalid Distribution Type**

- If `distributionType` is not `"rank_pool"` or `"redistribution_pool"`, ignore filter and return all

### **6. Missing Fields**

- All required fields must be present
- If a field is missing, return appropriate error (400 Bad Request)

---

## 🧪 **TESTING SCENARIOS**

### **Test Case 1: Get All Distributions**

```
GET /api/v1/user-rank/my-pool-distributions?page=1&limit=20
Expected: Returns all distributions, both types, sorted newest first
```

### **Test Case 2: Filter by Performance Pool**

```
GET /api/v1/user-rank/my-pool-distributions?distributionType=rank_pool
Expected: Returns only rank_pool distributions, redistributionPool total = 0
```

### **Test Case 3: Filter by Premium Pool**

```
GET /api/v1/user-rank/my-pool-distributions?distributionType=redistribution_pool
Expected: Returns only redistribution_pool distributions, rankPool total = 0
```

### **Test Case 4: Pagination**

```
GET /api/v1/user-rank/my-pool-distributions?page=2&limit=10
Expected: Returns distributions 11-20, correct pagination info
```

### **Test Case 5: No Distributions**

```
GET /api/v1/user-rank/my-pool-distributions
Expected: Empty array, totals = 0, pagination shows 0 total
```

### **Test Case 6: Qualified vs Not Qualified**

```
Expected:
- Qualified distributions have isQualified: true, bonusAmount > 0
- Not qualified distributions have isQualified: false, bonusAmount = 0
```

---

## 📊 **DATABASE CONSIDERATIONS**

### **Recommended Indexes**

```sql
-- User ID index (required for filtering)
CREATE INDEX idx_user_distributions ON distributions(userId);

-- Distribution type index (for filtering)
CREATE INDEX idx_distribution_type ON distributions(distributionType);

-- Distribution period index (for sorting)
CREATE INDEX idx_distribution_period ON distributions(distributionPeriod DESC);

-- Composite index for common queries
CREATE INDEX idx_user_type_period ON distributions(userId, distributionType, distributionPeriod DESC);
```

### **Query Optimization**

- Use database aggregation for `totalEarnings` calculation
- Limit results in database query (don't fetch all then paginate in application)
- Cache `totalEarnings` if distributions are historical (not changing)

---

## 🔗 **RELATED ENDPOINTS**

This endpoint works alongside:

- `/api/v1/user-rank/my-incentive-wallet` - Provides current wallet balance and qualification status
- `/api/v1/user-rank/rank-progress` - Provides current rank and qualification info

---

## 📝 **SUMMARY**

**What Frontend Needs:**

1. ✅ List of all user's pool distributions
2. ✅ Filter by distribution type (Performance/Premium)
3. ✅ Pagination support (page, limit)
4. ✅ Total earnings breakdown (by pool type)
5. ✅ Complete distribution details (amount, share, period, qualification status)
6. ✅ Proper sorting (newest first)
7. ✅ Accurate qualification status and icon colors

**What Backend Must Provide:**

1. ✅ All required fields in each distribution object
2. ✅ Accurate calculations (userShare, bonusAmount, totals)
3. ✅ Proper filtering by distributionType
4. ✅ Correct pagination metadata
5. ✅ Accurate totalEarnings (calculated from ALL distributions, not just current page)
6. ✅ Proper verificationIcon based on type and qualification
7. ✅ Security (user-specific data only)

---

## 🆘 **SUPPORT**

### **Questions?**

- **API Structure**: Check `FRONTEND_COMPLETE_API_REFERENCE.md`
- **Data Types**: Check `src/types/teamRank.ts` in frontend codebase
- **Integration**: Check `src/services/teamRankApi.ts` in frontend codebase

### **Testing the Endpoint**

```bash
# Get all distributions
curl -X GET "http://localhost:5000/api/v1/user-rank/my-pool-distributions?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Filter by Performance Pool
curl -X GET "http://localhost:5000/api/v1/user-rank/my-pool-distributions?distributionType=rank_pool" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Filter by Premium Pool
curl -X GET "http://localhost:5000/api/v1/user-rank/my-pool-distributions?distributionType=redistribution_pool" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

**Last Updated:** January 2025  
**Status:** 🔴 **REQUIRED FOR FRONTEND IMPLEMENTATION**
