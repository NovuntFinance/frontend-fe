# 🚀 Quick Fix for CORS Error

## The Problem
You're getting CORS errors when trying to complete email verification.

## ✅ Solution 1: Restart Dev Server (Most Common Fix)

The environment variable is set correctly, but Next.js needs a restart to pick it up:

1. **Stop the dev server** (Press `Ctrl+C` in the terminal)
2. **Start it again:**
   ```bash
   npm run dev
   ```
3. **Clear browser cache** (F12 → Right-click refresh → "Empty Cache and Hard Reload")
4. **Try again**

## ✅ Solution 2: Verify Environment Variable

Your `.env.local` looks correct, but let's double-check:

1. **Check the file exists:**
   ```powershell
   Get-Content .env.local
   ```

2. **Should show:**
   ```
   NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
   ```

3. **If missing or wrong, fix it:**
   ```powershell
   @"
   NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
   NEXT_PUBLIC_USE_PROXY=false
   "@ | Out-File -FilePath .env.local -Encoding utf8
   ```

4. **Restart dev server**

## ✅ Solution 3: Wake Up Backend Server

Render.com free tier servers "sleep" after inactivity. Wake it up:

1. **Open in browser:**
   ```
   https://novunt-backend-uw3z.onrender.com
   ```

2. **Wait 30-60 seconds** for server to wake up

3. **Then try your request again**

## ✅ Solution 4: Check Browser Console

Open DevTools (F12) → Console and check:

```javascript
// Should show the correct URL
window.__NOVUNT_API_URL__
// Expected: "https://novunt-backend-uw3z.onrender.com/api/v1"

// Should show the env var
window.__NOVUNT_ENV_VAR__
// Expected: "https://novunt-backend-uw3z.onrender.com/api/v1"
```

If these are wrong, the environment variable isn't being picked up.

## ✅ Solution 5: Use Alternative Backend URL

If Render.com backend is having issues, try the production URL:

1. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1
   ```

2. **Restart dev server**

## 🔍 Debug Steps

1. **Check Network Tab:**
   - Open DevTools (F12) → Network tab
   - Filter by "complete-registration"
   - Check the request URL - should be `https://novunt-backend-uw3z.onrender.com/api/v1/better-auth/complete-registration`
   - Check the error - if it says "CORS" or "Network Error", it's a CORS issue

2. **Check Console:**
   - Look for `[API Client] Backend URL:` log
   - Should show the correct URL

3. **Check Backend:**
   - Visit: https://novunt-backend-uw3z.onrender.com
   - Should load (even if it's an error page, server is awake)

## 🎯 Most Likely Fix

**90% of the time, it's Solution 1:**
1. Stop dev server
2. Restart dev server
3. Clear browser cache
4. Try again

The environment variable is already set correctly in your `.env.local` file.

---

## Still Not Working?

1. Check if backend is accessible: https://novunt-backend-uw3z.onrender.com
2. Check browser console for detailed error messages
3. Try Solution 5 (alternative backend URL)
4. Contact backend team to verify CORS configuration allows `http://localhost:3000`

