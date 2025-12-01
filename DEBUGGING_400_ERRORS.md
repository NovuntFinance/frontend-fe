# Debugging 400 Errors - Guide

## 🔍 Current Issue

You're getting `400 Bad Request` errors when:

1. Trying to create a calendar
2. Fetching the current calendar

## 🛠️ What I've Fixed

### 1. **Enhanced Error Logging** ✅

- Fixed empty object `{}` logging issue
- Now logs each error property separately
- Shows actual error messages, status codes, and response data

### 2. **Better Error Handling for getCurrentCalendar** ✅

- Now handles 400 errors gracefully (returns null instead of throwing)
- Better logging to see what's happening

## 📋 Next Steps

### Step 1: Check the Console Logs

After trying to create a calendar, you should now see **detailed logs** like:

```
[rosApi] Error creating calendar:
  - Endpoint: https://...
  - Message: Request failed with status code 400
  - Status: 400
  - Response Data: {
      "success": false,
      "message": "...",
      "error": {
        "code": "...",
        "message": "..."
      }
    }
```

### Step 2: Look for These Specific Errors

The 400 error could be:

1. **2FA Required** (most likely)
   - Error code: `2FA_CODE_REQUIRED`
   - Solution: Frontend should detect this and show modal (already working)

2. **Validation Error**
   - Error message: "Week start date must be a Monday"
   - Solution: Check the date you're selecting

3. **Missing Required Fields**
   - Error message: "Missing required field: ..."
   - Solution: Check form data

4. **Authentication Error**
   - Error message: "Invalid token" or "Unauthorized"
   - Solution: Re-login as admin

### Step 3: Check Network Tab

1. Open DevTools (F12) → **Network** tab
2. Try creating a calendar
3. Find the failed request
4. Click on it
5. Check:
   - **Status**: Should show `400`
   - **Response** tab: Should show the actual error message
   - **Headers** tab: Check if `Authorization` and `X-2FA-Code` are present

### Step 4: Share the Actual Error Message

Once you see the detailed logs, please share:

- The actual error message from the backend
- The error code (if any)
- The response data

This will help identify if it's:

- A frontend issue (wrong data format)
- A backend issue (validation failing)
- An authentication issue (2FA required)

## 🎯 Most Likely Scenarios

### Scenario 1: 2FA Required ✅

**What you'll see:**

```
Status: 400
Response: {
  "error": {
    "code": "2FA_CODE_REQUIRED",
    "message": "2FA code is required..."
  }
}
```

**What should happen:**

- Frontend detects this automatically
- 2FA modal appears ✅
- You enter code and retry

**If this isn't happening:**

- The error detection might not be working
- Check console logs for `[CalendarManagement] 2FA required...`

### Scenario 2: Validation Error

**What you'll see:**

```
Status: 400
Response: {
  "message": "Week start date must be a Monday"
}
```

**Solution:**

- Make sure the date you select is a Monday
- Check the date format is correct

### Scenario 3: Missing 2FA Code on Retry

**What you'll see:**

```
Status: 400
Response: {
  "error": {
    "code": "2FA_CODE_REQUIRED",
    ...
  }
}
```

**Solution:**

- The 2FA code might not be sent correctly
- Check console for `[rosApi] Request with 2FA code:` log
- Verify `X-2FA-Code` header is present

## 🔧 Quick Test

Try this to see the actual error:

1. Open browser console
2. Try creating a calendar
3. Look for the new detailed error logs
4. Copy the **Response Data** from the logs
5. Share it so we can see what the backend is actually saying

## 📝 Expected Behavior

After the logging improvements, you should see:

1. **Detailed error logs** showing actual error messages
2. **Response data** showing what backend returned
3. **Clear indication** of what went wrong

If you still see empty objects `{}`, let me know and we can debug further.

---

**The improved logging should now show you exactly what the backend error is!** 🎯
