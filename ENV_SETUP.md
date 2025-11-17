# Environment Setup Guide

## 📝 Create `.env.local` File

Create a `.env.local` file in the root of the project with the following content:

```bash
# Production Backend URL (RECOMMENDED)
NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1

# Disable proxy (not needed with BetterAuth)
NEXT_PUBLIC_USE_PROXY=false
```

## 🔄 Alternative Backend URLs

### For Testing with Direct Render URL:
```bash
NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
```

### For Local Development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## ✅ Quick Setup Commands

```bash
# Create the file
echo "NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1" > .env.local
echo "NEXT_PUBLIC_USE_PROXY=false" >> .env.local

# Restart dev server
pnpm dev
```

## 🔒 Security Notes

- ✅ `.env.local` is gitignored (never commit it)
- ✅ For production deployment, set these in Vercel/hosting dashboard
- ✅ All variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- ✅ Backend requires `withCredentials: true` in all requests

## 📊 Vercel Deployment

**CRITICAL:** Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1
NEXT_PUBLIC_USE_PROXY=false
```

**Important Notes:**
- The URL **MUST** include `/api/v1` at the end
- After setting the environment variable, **force redeploy** without build cache
- Go to Vercel Dashboard → Deployments → Latest deployment → Redeploy → **Uncheck "Use existing Build Cache"**

## 🔍 Debugging API Configuration

If you encounter CORS/connection issues, check the API configuration in the browser console:

```javascript
// Check current API configuration
window.checkApiConfig()

// Check environment variable
window.__NOVUNT_ENV_VAR__

// Check actual API URL being used
window.__NOVUNT_API_URL__
```

The console will also automatically log the API URL when the app loads.

## ✨ Optional Environment Variables

```bash
# Feature flags
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_ENABLE_DEMO_MODE=true

# Debug mode (development only)
# NEXT_PUBLIC_DEBUG=true
```

