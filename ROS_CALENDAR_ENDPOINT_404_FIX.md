# ROS Calendar Endpoint 404 - Fix Applied

## Issue

You're getting this error when trying to create a calendar:

> "Calendar creation endpoint not found. The backend endpoint may not be implemented yet."

This happens because the backend endpoint for creating ROS calendars returns a 404 error.

## What I've Fixed

### 1. Added Multiple Endpoint Path Support

The frontend now tries **both possible endpoint paths**:

1. **First attempt**: `/api/v1/admin/ros-calendar` (if backend uses versioning)
2. **Fallback**: `/api/admin/ros-calendar` (if backend doesn't use versioning)

If one returns 404, it automatically tries the other.

### 2. Enhanced Error Messages

- More descriptive error messages showing which endpoints were tried
- Better handling of different HTTP status codes (401, 403, 404, etc.)
- Development console logging to help debug

### 3. Better Debugging

In development mode, the console will now show:

- Which endpoint is being attempted
- The payload being sent
- Whether the endpoint was found or not
- Which endpoint worked (if any)

## What This Means

### If the Endpoint Exists

- The frontend will automatically find and use the correct endpoint path
- Calendar creation will work seamlessly

### If the Endpoint Doesn't Exist

- You'll see a clear error message indicating which paths were tried
- The error message explains that the backend may need to implement the endpoint

## Backend Requirements

For the calendar creation to work, your backend needs to implement **one of these endpoints**:

### Option 1: With Versioning (Recommended)

```
POST /api/v1/admin/ros-calendar
```

### Option 2: Without Versioning

```
POST /api/admin/ros-calendar
```

### Required Request Format

**Headers:**

- `Authorization: Bearer <adminToken>`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "weekStartDate": "2025-01-20T00:00:00.000Z",
  "targetWeeklyPercentage": 5.0,
  "description": "Week starting 2025-01-20 - Random 5%"
}
```

**Or for manual mode:**

```json
{
  "weekStartDate": "2025-01-20T00:00:00.000Z",
  "dailyPercentages": {
    "monday": 0.5,
    "tuesday": 0.8,
    "wednesday": 0.6,
    "thursday": 0.9,
    "friday": 1.2,
    "saturday": 0.7,
    "sunday": 0.3
  },
  "description": "Week starting 2025-01-20 - Manual"
}
```

### Required Response Format

**Success (200):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "weekStartDate": "2025-01-20T00:00:00.000Z",
    "weekEndDate": "2025-01-26T23:59:59.999Z",
    "weekNumber": 4,
    "year": 2025,
    "status": "active",
    "totalWeeklyPercentage": 5.0,
    "targetWeeklyPercentage": 5.0,
    "dailyPercentages": {
      "sunday": 0.3,
      "monday": 0.5,
      "tuesday": 0.8,
      "wednesday": 0.6,
      "thursday": 0.9,
      "friday": 1.2,
      "saturday": 0.7
    },
    "isActive": true,
    "isRandomized": true,
    "createdAt": "2025-01-20T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Admin not authenticated
- `403 Forbidden` - Admin doesn't have permission
- `404 Not Found` - Endpoint doesn't exist (what you're seeing now)
- `400 Bad Request` - Invalid request data

## Testing

1. **Open browser console** (F12 → Console tab)
2. **Try creating a calendar** from the admin panel
3. **Check console logs** - you'll see:
   ```
   [rosApi] Attempting to create calendar at: http://localhost:5000/api/v1/admin/ros-calendar
   [rosApi] Payload: { weekStartDate: "...", ... }
   ```
4. **If 404**: You'll see it trying the second endpoint
5. **Check Network tab** to see the actual request/response

## Next Steps

### For Frontend (Already Done ✅)

- ✅ Code updated to try both endpoint paths
- ✅ Better error messages
- ✅ Debug logging

### For Backend (Needs Implementation)

The backend team needs to implement the calendar creation endpoint. Share this document with them, specifically:

1. **Endpoint path**: `/api/v1/admin/ros-calendar` or `/api/admin/ros-calendar`
2. **Request/Response formats**: See above
3. **Authentication**: Must accept `adminToken` in Authorization header

## Related Files

- `src/services/rosApi.ts` - Updated `createCalendar()` function
- `src/components/admin/ros/CalendarManagement.tsx` - Error handling

## Notes

- The frontend will automatically detect which endpoint path works
- No code changes needed when backend implements the endpoint
- Clear error messages help identify issues quickly
- Development logging helps with debugging
