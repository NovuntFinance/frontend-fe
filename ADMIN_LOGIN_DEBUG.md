# Admin Login 401 Error - Debug Guide

## Issue

Admin login is failing with a 401 Unauthorized error:

- **Error**: `Request failed with status code 401`
- **Error Message**: "Invalid credentials."
- **Endpoint**: `POST /api/v1/admin/login`

## What We've Fixed

### 1. Enhanced Error Handling

- ✅ Added detailed error message extraction
- ✅ Added development logging to see backend responses
- ✅ Improved error message display in UI

### 2. Enhanced Service Logging

- ✅ Added request logging (URL, identifier, password length)
- ✅ Added detailed error logging with full response data
- ✅ Added proper error re-throwing

## Debugging Steps

### Step 1: Check Console Logs

After the fixes, when you try to login, check the browser console for:

```javascript
[AdminAuthService] Login request: {
  url: "...",
  identifier: "superadmin@novunt.com",
  passwordLength: ...
}

[AdminAuthService] Login failed: {
  url: "...",
  status: 401,
  statusText: "...",
  errorData: {...},  // ← Check this for backend error details
  message: "..."
}

Backend error response: {
  status: 401,
  statusText: "...",
  data: {...}  // ← This shows what the backend is actually saying
}
```

### Step 2: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try logging in again
4. Find the request to `/admin/login`
5. Check:
   - **Request URL**: Should be `https://novunt-backend-uw3z.onrender.com/api/v1/admin/login`
   - **Request Payload**: Should show `{"identifier": "...", "password": "..."}`
   - **Response**: Click on the request and check the **Response** tab to see what the backend returned

### Step 3: Verify Backend Endpoint

The endpoint should be:

- **URL**: `${NEXT_PUBLIC_API_URL}/admin/login`
- **Method**: POST
- **Body**: `{ "identifier": "email or username", "password": "password" }`
- **Headers**: `Content-Type: application/json`

### Step 4: Check Backend Status

The backend URL from your logs is:

```
https://novunt-backend-uw3z.onrender.com/api/v1
```

Verify:

1. Is the backend running?
2. Does the `/admin/login` endpoint exist?
3. What format does it expect?

## Possible Causes

### 1. Wrong Credentials

- ❌ Email/password combination is incorrect
- ✅ **Solution**: Verify credentials with backend team

### 2. Backend Endpoint Issue

- ❌ Endpoint might expect different field names (e.g., `email` instead of `identifier`)
- ❌ Endpoint might require additional fields
- ✅ **Solution**: Check backend API documentation

### 3. Backend Configuration

- ❌ Admin user might not exist in database
- ❌ Admin user might be disabled
- ✅ **Solution**: Verify admin user exists and is active

### 4. CORS or Network Issue

- ❌ CORS might be blocking the request
- ❌ Network connectivity issue
- ✅ **Solution**: Check Network tab for CORS errors

## Next Steps

1. **Check the enhanced console logs** - They now show detailed backend responses
2. **Check Network tab** - See the actual request/response
3. **Verify credentials** - Confirm with backend team that the credentials are correct
4. **Check backend logs** - See what the backend is receiving and why it's rejecting

## Testing with Different Credentials

Try these to narrow down the issue:

1. Use a known working admin account
2. Check if regular user login works (to verify backend is accessible)
3. Test with different email formats (e.g., just username if backend supports it)

## Expected Backend Response Format

On success, backend should return:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "admin@novunt.com",
      "username": "...",
      "role": "admin" | "superAdmin",
      "twoFAEnabled": false,
      "twoFASecret": null,
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

On error (401), backend might return:

```json
{
  "success": false,
  "message": "Invalid credentials.",
  "error": "..."
}
```

## Contact Backend Team

If credentials are correct and endpoint exists, ask backend team:

1. What is the exact endpoint path?
2. What format does it expect? (field names, required fields)
3. Are there any special requirements?
4. Can they check backend logs for the failed request?
