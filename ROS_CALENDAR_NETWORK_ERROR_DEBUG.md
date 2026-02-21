# ROS Calendar Network Error - Debug Guide

## Issue

When trying to create a calendar, you're getting network errors:

- "XHR failed loading: POST https://api.novunt.com/api/v1/admin/ros-calendar"
- Multiple retries happening
- No clear error message displayed

## What I've Fixed

### 1. Enhanced Error Logging ✅

- Added detailed error logging in development mode
- Logs full error details including:
  - Error message
  - Error code
  - HTTP status
  - Response data
  - Request details

### 2. Network Error Detection ✅

- Properly detects network errors (no response from server)
- Distinguishes between network errors and HTTP errors
- Shows appropriate error messages

### 3. Better Error Messages ✅

- Network errors: Shows connection issue message
- 404 errors: Shows endpoint not found message
- Other errors: Shows backend error message

### 4. Request Timeout ✅

- Added 30-second timeout to prevent hanging requests

## How to Debug

### Step 1: Check Browser Console

After trying to create a calendar, check the console for detailed error logs:

```javascript
[rosApi] Error creating calendar: {
  endpoint: "https://...",
  error: {
    message: "...",
    code: "...",
    status: ...,
    ...
  }
}
```

### Step 2: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try creating a calendar
4. Find the failed request to `/admin/ros-calendar`
5. Click on it and check:
   - **Status**: What HTTP status code?
   - **Response**: What does the backend return?
   - **Headers**: Are auth headers present?
   - **Preview**: Any error details?

### Step 3: Check Error Type

Based on the console logs, identify the error type:

#### Network Error (No Response)

- **Symptom**: Error has `code: 'ERR_NETWORK'` or `!error.response`
- **Possible Causes**:
  - Backend server is down
  - CORS issue
  - Network connectivity problem
  - Endpoint doesn't exist (server returns connection refused)

#### HTTP Error (Has Response)

- **404**: Endpoint not implemented
- **401**: Authentication failed
- **403**: Permission denied or 2FA required
- **500**: Backend server error

## Common Issues and Solutions

### Issue 1: Backend Endpoint Doesn't Exist

**Symptom**: 404 error or network error if server doesn't route to the endpoint

**Solution**: Backend needs to implement:

```
POST /api/v1/admin/ros-calendar
```

### Issue 2: CORS Error

**Symptom**: Network error in browser console, but curl/Postman works

**Solution**: Backend needs to allow CORS for this endpoint

### Issue 3: Authentication Missing

**Symptom**: 401 Unauthorized

**Solution**:

- Check if `adminToken` is in localStorage
- Verify token is being sent in Authorization header
- Token might be expired - try logging out and back in

### Issue 4: 2FA Required

**Symptom**: 403 with error code `2FA_CODE_REQUIRED`

**Solution**:

- 2FA modal should appear automatically
- Enter your 6-digit code
- Request will retry with 2FA code

### Issue 5: Backend Server Down

**Symptom**: Network error, can't connect to server

**Solution**:

- Check if backend server is running
- Check backend logs
- Verify backend URL is correct

## Current Status

The frontend now:

- ✅ Properly handles network errors
- ✅ Shows clear error messages
- ✅ Logs detailed error information
- ✅ Handles 2FA errors and retries
- ✅ Tries both `/api/v1/admin/ros-calendar` and `/api/admin/ros-calendar`

## Next Steps

1. **Check the browser console** after trying to create a calendar
2. **Check the Network tab** to see the actual request/response
3. **Share the error details** from the console so we can identify the exact issue
4. **Verify backend endpoint** exists and is accessible

## Expected Behavior

### If Endpoint Exists and Works:

1. Request sent with auth token
2. If 2FA required, modal appears
3. Enter 2FA code
4. Request retries with 2FA code
5. Calendar created successfully ✅

### If Endpoint Doesn't Exist:

1. Request fails with 404
2. Tries alternative endpoint path
3. Shows error: "Calendar creation endpoint not found..."
4. No calendar created ❌

### If Network Error:

1. Request fails immediately
2. Shows error: "Network error: Unable to reach the backend server..."
3. No calendar created ❌

## Testing

Try creating a calendar and check:

1. **Console logs** - Should show detailed error information
2. **Network tab** - Should show the request and response
3. **Error toast** - Should show a clear error message

Share the console logs and network tab details so we can identify the exact issue!
