# 🚀 Backend Prompt: User Profit History Endpoint Implementation

## 📋 Overview

The frontend Daily ROS Performance graph requires a user-facing endpoint to fetch historical profit/ROS data. Currently, the endpoint `/api/v1/daily-profit/history` either doesn't exist or returns empty data, causing the graph to show "No data available".

---

## 🎯 Required Endpoint

### **GET `/api/v1/daily-profit/history`**

**Purpose**: Get profit history for authenticated users (past distributed dates only)

**Authentication**: User Bearer token (not admin, no 2FA required)

**Query Parameters**:

- `limit` (optional, number): Number of records to return (default: 30, max: 100)
- `offset` (optional, number): Pagination offset (default: 0)

**Example Request**:

```http
GET /api/v1/daily-profit/history?limit=7&offset=0
Authorization: Bearer <user_token>
```

---

## 📊 Expected Response Format

### **Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "profits": [
      {
        "date": "2026-01-30",
        "profitPercentage": 2.2,
        "premiumPoolAmount": 10000,
        "performancePoolAmount": 5000,
        "rosPercentage": 0.55,
        "isDistributed": true
      },
      {
        "date": "2026-01-29",
        "profitPercentage": 2.2,
        "premiumPoolAmount": 12000,
        "performancePoolAmount": 6000,
        "rosPercentage": 0.6,
        "isDistributed": true
      },
      {
        "date": "2026-01-28",
        "profitPercentage": 2.2,
        "premiumPoolAmount": 8000,
        "performancePoolAmount": 4000,
        "rosPercentage": 0.5,
        "isDistributed": true
      }
    ],
    "pagination": {
      "limit": 7,
      "offset": 0,
      "total": 15
    }
  }
}
```

### **Empty Response (200 OK - No Data)**

```json
{
  "success": true,
  "data": {
    "profits": [],
    "pagination": {
      "limit": 7,
      "offset": 0,
      "total": 0
    }
  }
}
```

### **Error Response (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

---

## 🔍 Data Requirements

### **What Data to Return**

1. **Only Distributed Profits**: Return only profits where `isDistributed: true` or `rosDistributed: true`
2. **Past Dates Only**: Only return dates that are in the past (before today)
3. **Sorted by Date**: Return in descending order (newest first) or ascending (oldest first) - frontend will sort
4. **Include ROS Percentage**: Must include `rosPercentage` field (critical for graph)

### **Data Source**

The endpoint should query from one of these sources:

**Option A: Daily Profit Collection** (if still using legacy system)

```javascript
// Query DailyProfit collection
const profits = await DailyProfit.find({
  isDistributed: true,
  date: { $lt: today }, // Only past dates
})
  .sort({ date: -1 })
  .limit(limit)
  .skip(offset);
```

**Option B: Daily Declaration Returns Collection** (if using unified system)

```javascript
// Query DailyDeclarationReturn collection
const declarations = await DailyDeclarationReturn.find({
  rosDistributed: true, // Only distributed ROS
  date: { $lt: today }, // Only past dates
})
  .sort({ date: -1 })
  .limit(limit)
  .skip(offset);

// Transform to profit history format
const profits = declarations.map((decl) => ({
  date: decl.date,
  profitPercentage: decl.rosPercentage, // Legacy field
  premiumPoolAmount: decl.premiumPoolAmount,
  performancePoolAmount: decl.performancePoolAmount,
  rosPercentage: decl.rosPercentage,
  isDistributed: decl.rosDistributed,
}));
```

---

## 🔐 Security & Privacy

### **Important Rules**

1. **User Authentication Required**: Must verify user token
2. **No Future Dates**: Never return future profit declarations
3. **Only Distributed**: Only return profits that have been distributed
4. **No Admin Data**: Don't include admin-only fields (declaredBy, etc.)

### **Privacy Considerations**

- Users should only see distributed profits (not pending/declared)
- No sensitive admin information should be exposed
- Past dates only (users can't see future declarations)

---

## 📝 Implementation Checklist

### **Backend Implementation Steps**

- [ ] **1. Create Route Handler**
  - Route: `GET /api/v1/daily-profit/history`
  - Middleware: User authentication (Bearer token)
  - No 2FA required (user endpoint)

- [ ] **2. Query Database**
  - Filter: `isDistributed: true` OR `rosDistributed: true`
  - Filter: `date < today` (past dates only)
  - Sort: By date (descending or ascending)
  - Pagination: Use `limit` and `offset` params

- [ ] **3. Transform Data**
  - Map to expected response format
  - Include all required fields:
    - `date` (YYYY-MM-DD format)
    - `profitPercentage` (legacy field, can be same as rosPercentage)
    - `premiumPoolAmount` (number)
    - `performancePoolAmount` (number)
    - `rosPercentage` (number, 0-100)
    - `isDistributed` (boolean, should always be true)

- [ ] **4. Calculate Pagination**
  - Total count of matching records
  - Return pagination object with `limit`, `offset`, `total`

- [ ] **5. Error Handling**
  - 401: Invalid/missing token
  - 500: Server errors
  - Return proper error format

- [ ] **6. Response Format**
  - Wrap in `{ success: true, data: {...} }` format
  - Include pagination metadata

---

## 🧪 Testing Examples

### **Test Case 1: Get Last 7 Days**

```bash
curl -X GET "https://your-backend-url.com/api/v1/daily-profit/history?limit=7&offset=0" \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json"
```

**Expected**: Returns up to 7 most recent distributed profits

---

### **Test Case 2: Pagination**

```bash
curl -X GET "https://your-backend-url.com/api/v1/daily-profit/history?limit=30&offset=0" \
  -H "Authorization: Bearer <user_token>"
```

**Expected**: Returns first 30 records, with `pagination.total` showing total available

---

### **Test Case 3: No Data**

```bash
# If no distributed profits exist yet
curl -X GET "https://your-backend-url.com/api/v1/daily-profit/history?limit=7" \
  -H "Authorization: Bearer <user_token>"
```

**Expected**: Returns `{ success: true, data: { profits: [], pagination: {...} } }`

---

### **Test Case 4: Unauthorized**

```bash
curl -X GET "https://your-backend-url.com/api/v1/daily-profit/history?limit=7"
# No Authorization header
```

**Expected**: Returns `401 Unauthorized` error

---

## 🔗 Integration with Existing System

### **If Using Daily Profit Collection**

The endpoint should query the existing `DailyProfit` collection:

```javascript
// Example implementation
router.get('/daily-profit/history', authenticateUser, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const profits = await DailyProfit.find({
      isDistributed: true,
      date: { $lt: today },
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DailyProfit.countDocuments({
      isDistributed: true,
      date: { $lt: today },
    });

    const formattedProfits = profits.map((p) => ({
      date: p.date,
      profitPercentage: p.rosPercentage || p.profitPercentage,
      premiumPoolAmount: p.premiumPoolAmount || 0,
      performancePoolAmount: p.performancePoolAmount || 0,
      rosPercentage: p.rosPercentage || 0,
      isDistributed: true,
    }));

    res.json({
      success: true,
      data: {
        profits: formattedProfits,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profit history',
      error: { message: error.message },
    });
  }
});
```

---

### **If Using Daily Declaration Returns Collection**

The endpoint should query the unified `DailyDeclarationReturn` collection:

```javascript
// Example implementation
router.get('/daily-profit/history', authenticateUser, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const declarations = await DailyDeclarationReturn.find({
      rosDistributed: true, // Only distributed
      date: { $lt: today }, // Past dates only
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select(
        'date premiumPoolAmount performancePoolAmount rosPercentage rosDistributed'
      );

    const total = await DailyDeclarationReturn.countDocuments({
      rosDistributed: true,
      date: { $lt: today },
    });

    const profits = declarations.map((decl) => ({
      date: decl.date,
      profitPercentage: decl.rosPercentage, // Legacy field
      premiumPoolAmount: decl.premiumPoolAmount,
      performancePoolAmount: decl.performancePoolAmount,
      rosPercentage: decl.rosPercentage,
      isDistributed: decl.rosDistributed,
    }));

    res.json({
      success: true,
      data: {
        profits,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profit history',
      error: { message: error.message },
    });
  }
});
```

---

## ⚠️ Critical Requirements

### **Must Have**

1. ✅ **Return `rosPercentage` field** - This is critical for the graph to work
2. ✅ **Only distributed profits** - Don't return pending/undeclared profits
3. ✅ **Past dates only** - Never return future dates
4. ✅ **Proper pagination** - Include `limit`, `offset`, `total` in response
5. ✅ **User authentication** - Verify Bearer token
6. ✅ **Error handling** - Proper 401/500 error responses

### **Data Format Requirements**

- `date`: String in `YYYY-MM-DD` format (e.g., "2026-01-30")
- `rosPercentage`: Number (0-100, can be decimal like 0.55)
- `premiumPoolAmount`: Number (dollar amount)
- `performancePoolAmount`: Number (dollar amount)
- `isDistributed`: Boolean (should always be `true` for this endpoint)
- `profitPercentage`: Number (legacy field, can be same as `rosPercentage`)

---

## 🐛 Debugging Tips

### **If Frontend Shows "No Data Available"**

1. **Check if endpoint exists**: Test with curl/Postman
2. **Check authentication**: Verify token is valid
3. **Check database**: Ensure there are distributed profits with past dates
4. **Check response format**: Verify it matches expected structure
5. **Check `rosPercentage` field**: Must be present and valid number

### **Common Issues**

- **Empty array returned**: No distributed profits exist yet (expected for new systems)
- **404 error**: Endpoint not implemented (needs backend implementation)
- **401 error**: Authentication issue (check token)
- **Missing `rosPercentage`**: Graph won't work without this field

---

## 📞 Frontend Integration

### **Frontend Already Implemented**

The frontend is **ready** and waiting for this endpoint:

- ✅ Service: `dailyProfitService.getProfitHistory()`
- ✅ Hook: `useProfitHistory(limit, offset)`
- ✅ Component: `DailyROSPerformance` (uses the hook)
- ✅ Error handling: Gracefully handles 404/empty responses
- ✅ Debug logging: Comprehensive logging in development mode

### **What Frontend Expects**

```typescript
// Frontend expects this structure:
interface ProfitHistoryResponse {
  success: boolean;
  data: {
    profits: Array<{
      date: string; // "YYYY-MM-DD"
      profitPercentage: number;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      rosPercentage: number; // CRITICAL - must be present
      isDistributed: boolean;
    }>;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
```

---

## ✅ Success Criteria

The endpoint is working correctly when:

1. ✅ Returns 200 OK with proper data structure
2. ✅ Includes `rosPercentage` in each profit object
3. ✅ Only returns distributed profits (past dates)
4. ✅ Pagination works correctly
5. ✅ Frontend graph displays data correctly
6. ✅ No console errors in browser DevTools

---

## 🚀 Priority

**HIGH PRIORITY** - This endpoint is needed for the Daily ROS Performance graph to function. Without it, users see "No data available" even when profits have been distributed.

---

## 📝 Notes

- This is a **user-facing endpoint** (not admin)
- **No 2FA required** (user authentication only)
- Should be **fast** (consider caching if needed)
- Should handle **large datasets** efficiently (use pagination)
- **Backward compatible** with existing Daily Profit system

---

**Status**: ⏳ **Awaiting Backend Implementation**  
**Frontend Status**: ✅ **Ready and Waiting**  
**Date**: January 31, 2026
