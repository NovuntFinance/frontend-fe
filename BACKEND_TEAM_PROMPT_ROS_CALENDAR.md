# Backend Team: ROS Calendar Creation Endpoint Implementation

## 🎯 Objective

Implement a backend endpoint to create ROS (Return on Stake) weekly calendars for admin users. The frontend is fully implemented and ready - we just need the backend endpoint to complete the feature.

---

## 📋 Current Status

### Frontend Status: ✅ **COMPLETE**

- ✅ 2FA modal integration
- ✅ Error handling
- ✅ Request formatting
- ✅ Multiple endpoint path support
- ✅ Ready to work once endpoint is implemented

### Backend Status: ⚠️ **NEEDS IMPLEMENTATION**

- ❌ Endpoint doesn't exist or isn't responding
- ❌ Returns network error when called

---

## 🔍 Problem Description

When an admin tries to create a ROS calendar:

1. **First Request** → Backend returns `400 Bad Request` with error code `2FA_CODE_REQUIRED`
2. **User enters 2FA code** → Frontend retries the request with 2FA code
3. **Retry Request** → Fails with network error (endpoint not found/not responding)

**Error Message:**

```
Network error: Unable to reach the backend server.
Please check your internet connection or if the backend is running.
```

---

## 📍 Required Endpoint

### Endpoint Path (Choose ONE):

**Option 1 (Recommended - with versioning):**

```
POST /api/v1/admin/ros-calendar
```

**Option 2 (Alternative - without versioning):**

```
POST /api/admin/ros-calendar
```

**Note:** Frontend will try both paths automatically, so either one works.

---

## 🔐 Authentication Requirements

### Required Headers:

1. **Authorization Header** (Required)

   ```
   Authorization: Bearer <adminToken>
   ```

   - Token from admin login
   - Must validate admin user
   - Must check if user has admin/superAdmin role

2. **2FA Code Header** (Required for admin operations)

   ```
   X-2FA-Code: <6-digit-code>
   ```

   - 6-digit code from authenticator app
   - Must validate 2FA code before processing
   - Return `400` with `2FA_CODE_REQUIRED` if missing
   - Return `400` with `2FA_CODE_INVALID` if invalid

3. **Content-Type Header**
   ```
   Content-Type: application/json
   ```

---

## 📥 Request Body Format

### For Random Distribution Mode:

```json
{
  "weekStartDate": "2025-12-01T00:00:00.000Z",
  "targetWeeklyPercentage": 12.0,
  "description": "Week starting 2025-12-01 - Random 12%",
  "twoFACode": "123456"
}
```

**Fields:**

- `weekStartDate` (string, ISO 8601, required): Monday of the week (must be a Monday)
- `targetWeeklyPercentage` (number, required): Total percentage for the week (e.g., 12.0 for 12%)
- `description` (string, optional): Human-readable description
- `twoFACode` (string, optional): Can be in header instead (preferred: use `X-2FA-Code` header)

### For Manual Distribution Mode:

```json
{
  "weekStartDate": "2025-12-01T00:00:00.000Z",
  "dailyPercentages": {
    "sunday": 1.5,
    "monday": 1.8,
    "tuesday": 2.0,
    "wednesday": 1.9,
    "thursday": 1.7,
    "friday": 1.6,
    "saturday": 1.5
  },
  "description": "Week starting 2025-12-01 - Manual",
  "twoFACode": "123456"
}
```

**Fields:**

- `weekStartDate` (string, ISO 8601, required): Monday of the week
- `dailyPercentages` (object, required): Object with keys: `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`
  - Each value is a number (percentage for that day)
  - Sum should equal `targetWeeklyPercentage` if provided
- `description` (string, optional): Human-readable description
- `twoFACode` (string, optional): Can be in header instead

---

## 📤 Response Format

### Success Response (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "weekStartDate": "2025-12-01T00:00:00.000Z",
    "weekEndDate": "2025-12-07T23:59:59.999Z",
    "weekNumber": 49,
    "year": 2025,
    "status": "active",
    "totalWeeklyPercentage": 12.0,
    "targetWeeklyPercentage": 12.0,
    "dailyPercentages": {
      "sunday": 1.5,
      "monday": 1.8,
      "tuesday": 2.0,
      "wednesday": 1.9,
      "thursday": 1.7,
      "friday": 1.6,
      "saturday": 1.5
    },
    "isActive": true,
    "isRandomized": true,
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-01T10:00:00.000Z"
  }
}
```

**Or simpler format (also accepted):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "weekStartDate": "2025-12-01T00:00:00.000Z",
  "weekEndDate": "2025-12-07T23:59:59.999Z",
  "weekNumber": 49,
  "year": 2025,
  "status": "active",
  "totalWeeklyPercentage": 12.0,
  "targetWeeklyPercentage": 12.0,
  "dailyPercentages": {
    "sunday": 1.5,
    "monday": 1.8,
    "tuesday": 2.0,
    "wednesday": 1.9,
    "thursday": 1.7,
    "friday": 1.6,
    "saturday": 1.5
  },
  "isActive": true,
  "isRandomized": true,
  "createdAt": "2025-12-01T10:00:00.000Z"
}
```

### Error Responses:

#### 400 Bad Request - 2FA Code Required:

```json
{
  "success": false,
  "message": "2FA code is required for admin operations",
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "Two-factor authentication code is required for this operation"
  }
}
```

#### 400 Bad Request - Invalid 2FA Code:

```json
{
  "success": false,
  "message": "Invalid 2FA code",
  "error": {
    "code": "2FA_CODE_INVALID",
    "message": "The provided 2FA code is invalid or expired"
  }
}
```

#### 400 Bad Request - Validation Error:

```json
{
  "success": false,
  "message": "Invalid request data",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "weekStartDate must be a Monday",
    "details": {
      "field": "weekStartDate",
      "issue": "Date is not a Monday"
    }
  }
}
```

#### 401 Unauthorized:

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication token is required"
  }
}
```

#### 403 Forbidden:

```json
{
  "success": false,
  "message": "Forbidden",
  "error": {
    "code": "ADMIN_REQUIRED",
    "message": "Admin access is required for this operation"
  }
}
```

#### 409 Conflict - Calendar Already Exists:

```json
{
  "success": false,
  "message": "Calendar already exists for this week",
  "error": {
    "code": "CALENDAR_EXISTS",
    "message": "A calendar for week 49, 2025 already exists"
  }
}
```

---

## ✅ Validation Requirements

### 1. Authentication Validation:

- ✅ Verify `Authorization` header contains valid admin token
- ✅ Verify user has `admin` or `superAdmin` role
- ✅ Return `401` if token missing/invalid
- ✅ Return `403` if user is not admin

### 2. 2FA Validation:

- ✅ Check for `X-2FA-Code` header or `twoFACode` in body
- ✅ Return `400` with `2FA_CODE_REQUIRED` if missing
- ✅ Validate 2FA code against user's authenticator
- ✅ Return `400` with `2FA_CODE_INVALID` if invalid/expired

### 3. Request Data Validation:

- ✅ `weekStartDate` must be a valid ISO 8601 date
- ✅ `weekStartDate` must be a Monday (validate day of week)
- ✅ `targetWeeklyPercentage` must be a positive number (if provided)
- ✅ `dailyPercentages` must contain all 7 days (if provided)
- ✅ Sum of `dailyPercentages` should equal `targetWeeklyPercentage` (if both provided)
- ✅ Each daily percentage must be a positive number

### 4. Business Logic Validation:

- ✅ Check if calendar already exists for the week
- ✅ Return `409 Conflict` if duplicate
- ✅ Calculate `weekNumber` and `year` from `weekStartDate`
- ✅ Calculate `weekEndDate` (Sunday 23:59:59.999 of same week)
- ✅ If random mode: distribute `targetWeeklyPercentage` across 7 days
- ✅ If manual mode: use provided `dailyPercentages`

---

## 🔧 Implementation Details

### Week Calculation:

- **Week Start**: Monday 00:00:00.000
- **Week End**: Sunday 23:59:59.999
- **Week Number**: ISO week number (1-53)
- **Year**: Year of the week

### Random Distribution (if `targetWeeklyPercentage` provided):

- Distribute the total percentage across 7 days
- Each day should get a random percentage
- Sum must equal `targetWeeklyPercentage`
- Example: 12% total → ~1.7% per day (with some variation)

### Manual Distribution (if `dailyPercentages` provided):

- Use the exact percentages provided
- Validate all 7 days are present
- Calculate `totalWeeklyPercentage` as sum of daily percentages

### Database Schema (Suggested):

```javascript
{
  _id: ObjectId,
  weekStartDate: Date,        // Monday 00:00:00
  weekEndDate: Date,         // Sunday 23:59:59.999
  weekNumber: Number,        // ISO week number (1-53)
  year: Number,              // Year
  status: String,            // "active" | "inactive" | "completed"
  totalWeeklyPercentage: Number,
  targetWeeklyPercentage: Number,
  dailyPercentages: {
    sunday: Number,
    monday: Number,
    tuesday: Number,
    wednesday: Number,
    thursday: Number,
    friday: Number,
    saturday: Number
  },
  isActive: Boolean,
  isRandomized: Boolean,     // true if random, false if manual
  description: String,
  createdBy: ObjectId,       // Admin user ID
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing Instructions

### Test Case 1: Create Calendar with Random Distribution

**Request:**

```bash
curl -X POST https://api.novunt.com/api/v1/admin/ros-calendar \
  -H "Authorization: Bearer <adminToken>" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-12-01T00:00:00.000Z",
    "targetWeeklyPercentage": 12.0,
    "description": "Week starting 2025-12-01 - Random 12%"
  }'
```

**Expected Response:** `200 OK` with calendar data

### Test Case 2: Create Calendar with Manual Distribution

**Request:**

```bash
curl -X POST https://api.novunt.com/api/v1/admin/ros-calendar \
  -H "Authorization: Bearer <adminToken>" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-12-01T00:00:00.000Z",
    "dailyPercentages": {
      "sunday": 1.5,
      "monday": 1.8,
      "tuesday": 2.0,
      "wednesday": 1.9,
      "thursday": 1.7,
      "friday": 1.6,
      "saturday": 1.5
    },
    "description": "Week starting 2025-12-01 - Manual"
  }'
```

**Expected Response:** `200 OK` with calendar data

### Test Case 3: Missing 2FA Code

**Request:**

```bash
curl -X POST https://api.novunt.com/api/v1/admin/ros-calendar \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-12-01T00:00:00.000Z",
    "targetWeeklyPercentage": 12.0
  }'
```

**Expected Response:** `400 Bad Request` with `2FA_CODE_REQUIRED`

### Test Case 4: Invalid 2FA Code

**Request:**

```bash
curl -X POST https://api.novunt.com/api/v1/admin/ros-calendar \
  -H "Authorization: Bearer <adminToken>" \
  -H "X-2FA-Code: 000000" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-12-01T00:00:00.000Z",
    "targetWeeklyPercentage": 12.0
  }'
```

**Expected Response:** `400 Bad Request` with `2FA_CODE_INVALID`

### Test Case 5: Invalid Date (Not Monday)

**Request:**

```bash
curl -X POST https://api.novunt.com/api/v1/admin/ros-calendar \
  -H "Authorization: Bearer <adminToken>" \
  -H "X-2FA-Code: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-12-02T00:00:00.000Z",
    "targetWeeklyPercentage": 12.0
  }'
```

**Expected Response:** `400 Bad Request` with validation error

### Test Case 6: Duplicate Calendar

**Request:** (Same as Test Case 1, but run twice)

**Expected Response:** First request `200 OK`, second request `409 Conflict`

---

## 📝 Additional Notes

### Priority:

- **High** - This is blocking the admin calendar management feature

### Dependencies:

- Admin authentication system (already exists)
- 2FA validation system (already exists)
- Database for storing calendars

### Edge Cases to Handle:

1. ✅ Week overlaps (prevent creating calendars for overlapping weeks)
2. ✅ Past dates (should we allow creating calendars for past weeks?)
3. ✅ Future dates (how far in advance can calendars be created?)
4. ✅ Concurrent requests (handle race conditions for duplicate checks)

### Security Considerations:

- ✅ Validate admin token on every request
- ✅ Validate 2FA code on every request
- ✅ Rate limiting (prevent abuse)
- ✅ Input sanitization (prevent injection attacks)
- ✅ Authorization checks (only admins can create calendars)

---

## 🚀 Quick Start Checklist

- [ ] Create route handler for `POST /api/v1/admin/ros-calendar` (or `/api/admin/ros-calendar`)
- [ ] Add authentication middleware (verify admin token)
- [ ] Add 2FA validation middleware (verify `X-2FA-Code` header)
- [ ] Implement request validation (weekStartDate, percentages, etc.)
- [ ] Implement business logic (calculate week number, distribute percentages)
- [ ] Create database model/schema for calendar entries
- [ ] Implement duplicate check (prevent creating same week twice)
- [ ] Return proper success response with calendar data
- [ ] Return proper error responses for all error cases
- [ ] Test with Postman/curl
- [ ] Test with frontend integration
- [ ] Deploy to production

---

## 📞 Questions or Issues?

If you have any questions or need clarification on:

- Request/response formats
- Validation rules
- Business logic requirements
- Error handling

Please reach out to the frontend team. We're ready to test as soon as the endpoint is implemented! 🎉

---

## ✅ Acceptance Criteria

The endpoint is considered complete when:

1. ✅ Returns `200 OK` with calendar data when valid request with 2FA code is sent
2. ✅ Returns `400` with `2FA_CODE_REQUIRED` when 2FA code is missing
3. ✅ Returns `400` with `2FA_CODE_INVALID` when 2FA code is wrong
4. ✅ Returns `400` with validation error when `weekStartDate` is not a Monday
5. ✅ Returns `409` when calendar for that week already exists
6. ✅ Returns `401` when admin token is missing/invalid
7. ✅ Returns `403` when user is not an admin
8. ✅ Frontend can successfully create calendars through the UI
9. ✅ Random distribution mode works correctly
10. ✅ Manual distribution mode works correctly

---

**Thank you for implementing this endpoint! The frontend is ready and waiting. 🚀**
