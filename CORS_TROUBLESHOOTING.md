# 🔧 CORS Error Troubleshooting Guide

## Current Issue
You're getting CORS errors when trying to connect to the backend:
```
Unable to connect to the server. This may be a CORS configuration issue.
Request URL: https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/complete-registration
```

## Quick Fixes

### 1. Check Backend Server Status

The backend might be sleeping (Render.com free tier). Try:

**Option A: Wake up the backend**
- Visit: https://novunt-backend-uw3z.onrender.com/api/v1/health (if available)
- Or: https://novunt-backend-uw3z.onrender.com
- Wait 30-60 seconds for the server to wake up
- Then retry your request

**Option B: Check if backend is running**
```powershell
# Test backend connectivity
Invoke-WebRequest -Uri "https://novunt-backend-uw3z.onrender.com" -UseBasicParsing
```

### 2. Verify Environment Variable

Check your `.env.local` file:

```bash
# Should contain:
NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
```

**To fix:**
1. Open `.env.local` in your project root
2. Ensure it contains:
   ```
   NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
   ```
3. **Restart your dev server** (stop and run `pnpm dev` again)

### 3. Use Alternative Backend URL

If the Render.com backend is down, try the production URL:

**Update `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1
```

Then restart your dev server.

### 4. Check Browser Console

Open DevTools (F12) → Console tab and check:
- `[API Client] Backend URL:` - Should show the correct URL
- `[API Client] Environment Variable:` - Should show the env var value

You can also check:
```javascript
// In browser console
window.__NOVUNT_API_URL__
window.__NOVUNT_ENV_VAR__
```

### 5. Clear Browser Cache

Sometimes cached requests cause issues:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 6. Check Network Tab

In DevTools → Network tab:
1. Filter by "complete-registration"
2. Check the request:
   - **Status**: Should be 200 or 401 (not CORS error)
   - **Headers**: Check if CORS headers are present
   - **Request URL**: Should match your env var

### 7. Backend CORS Configuration

If backend is running but CORS fails, the backend needs to allow:
- **Origin**: `http://localhost:3000` (for dev)
- **Methods**: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- **Headers**: `Content-Type, Authorization, Accept`
- **Credentials**: `true`

**Contact backend team** if CORS headers are missing.

## Common Solutions

### Solution 1: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

### Solution 2: Recreate .env.local
```bash
# Delete existing .env.local
Remove-Item .env.local

# Create new one
@"
NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
"@ | Out-File -FilePath .env.local -Encoding utf8

# Restart dev server
pnpm dev
```

### Solution 3: Use Proxy (Temporary Workaround)

If backend CORS is not configured, you can use Next.js API proxy:

1. **Update `.env.local`:**
```env
NEXT_PUBLIC_API_URL=/api/proxy
NEXT_PUBLIC_USE_PROXY=true
```

2. **The proxy route already exists** at `src/app/api/proxy/(proxy)/[...path]/route.ts`

3. **Restart dev server**

## Testing Backend Connection

### Test 1: Simple Health Check
```powershell
Invoke-WebRequest -Uri "https://novunt-backend-uw3z.onrender.com" -UseBasicParsing
```

### Test 2: API Endpoint Check
```powershell
Invoke-WebRequest -Uri "https://novunt-backend-uw3z.onrender.com/api/v1/health" -UseBasicParsing
```

### Test 3: CORS Preflight
```powershell
$headers = @{
    "Origin" = "http://localhost:3000"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "Content-Type, Authorization"
}
Invoke-WebRequest -Uri "https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/complete-registration" -Method OPTIONS -Headers $headers -UseBasicParsing
```

## Expected Behavior

✅ **Working:**
- Request completes successfully
- No CORS errors in console
- Response has status 200, 201, 400, 401, etc. (not CORS error)

❌ **Not Working:**
- CORS error in console
- Network error
- "Unable to connect to the server" message
- Status 0 or no response

## Next Steps

1. **First**: Check if backend is accessible
2. **Second**: Verify `.env.local` is correct
3. **Third**: Restart dev server
4. **Fourth**: Check browser console for detailed errors
5. **Fifth**: Contact backend team if CORS is not configured

## Still Having Issues?

1. Check backend logs (if you have access)
2. Verify backend CORS configuration
3. Try using the proxy route as a workaround
4. Check if backend server is running (Render.com might have spun it down)

---

**Note**: Render.com free tier servers "sleep" after inactivity. The first request might take 30-60 seconds to wake up the server.

