# ✅ Sentry Setup Verification Checklist

## 1️⃣ Configuration Files Created ✅

The Sentry wizard successfully created:
- ✅ `sentry.server.config.ts` - Server-side tracking
- ✅ `sentry.edge.config.ts` - Edge/middleware tracking
- ✅ `.env.local` - Contains your SENTRY_DSN
- ✅ `next.config.*` - Updated with Sentry integration

**Your Sentry DSN**: `https://25743c5c8c6de3e984e0792b4e94f96c@o4510407588315136.ingest.de.sentry.io/4510407588708432`

---

## 2️⃣ Configuration Review

### ✅ What's Configured:
- **Performance Monitoring**: Enabled (tracesSampleRate: 1 = 100%)
- **Error Logs**: Enabled (enableLogs: true)
- **User Context**: Enabled (sendDefaultPii: true)
- **Region**: Germany (de.sentry.io)

### ⚠️ Recommended Adjustments for Production:

**Update these files for production optimization:**

`sentry.server.config.ts` and `sentry.edge.config.ts`:
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Reduce sampling in production to save quota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Add release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
  
  enableLogs: true,
  sendDefaultPii: false, // Disable PII for privacy
  
  // Better error filtering
  beforeSend(event) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Event:', event);
      return null;
    }
    return event;
  },
  
  // Ignore common noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Failed to fetch',
  ],
});
```

---

## 3️⃣ Test Sentry Integration

### Method 1: Test Error Page (If created by wizard)
1. **Start dev server** (if not running):
   ```bash
   pnpm dev
   ```

2. **Visit test page**:
   ```
   http://localhost:3000/sentry-example-page
   ```

3. **Click "Throw error!"** button

4. **Check Sentry Dashboard**:
   - Go to: https://o4510407588315136.sentry.io/
   - You should see the test error appear within ~30 seconds

### Method 2: Manual Test in Code
Add this to any page to test:
```typescript
// Test Sentry
import * as Sentry from '@sentry/nextjs';

function TestButton() {
  const testSentry = () => {
    try {
      throw new Error('Test error from Novunt Frontend!');
    } catch (error) {
      Sentry.captureException(error);
      console.log('Error sent to Sentry!');
    }
  };
  
  return <button onClick={testSentry}>Test Sentry</button>;
}
```

---

## 4️⃣ Integrate with Your Error Tracking Utility

Update `src/lib/error-tracking.ts` to use the existing Sentry config:

```typescript
// Remove initSentry() - already initialized by Sentry's auto-config
// Keep other functions like setSentryUser, captureException, etc.
```

---

## 5️⃣ Verify Environment Variables

Check `.env.local` has:
```bash
SENTRY_DSN=https://25743c5c8c6de3e984e0792b4e94f96c@o4510407588315136.ingest.de.sentry.io/4510407588708432
SENTRY_ORG=novunt-africa-g3
SENTRY_PROJECT=novunt-frontend

# Optional - add these
NODE_ENV=development
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 6️⃣ Important Note from Wizard ⚠️

**Remove `--turbo` flag from your dev script:**

The wizard warned: "Don't forget to remove `--turbo` or `--turbopack` from your dev command"

**Current `package.json`:**
```json
"dev": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev --turbo"
```

**Should be (for Sentry to work in dev):**
```json
"dev": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev"
```

Or keep a separate script:
```bash
"dev": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev",
"dev:turbo": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev --turbo"
```

---

## 7️⃣ Restart Dev Server

After making changes:
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

---

## 8️⃣ Production Deployment Setup

### Add to `.env.production`:
```bash
SENTRY_DSN=https://25743c5c8c6de3e984e0792b4e94f96c@o4510407588315136.ingest.de.sentry.io/4510407588708432
SENTRY_ORG=novunt-africa-g3
SENTRY_PROJECT=novunt-frontend
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Vercel Deployment:
Add these environment variables in Vercel dashboard:
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN` (for source maps - get from Sentry settings)

---

## 9️⃣ Sentry Dashboard Access

**Your Sentry Organization**: https://o4510407588315136.sentry.io/

### What to Monitor:
1. **Issues** - See all errors
2. **Performance** - See slow pages/API calls
3. **Releases** - Track deployments
4. **Alerts** - Set up notifications

### Recommended Alerts:
- Error rate > 5% → Slack/Email
- Response time p95 > 3s → Warning
- Critical errors → Immediate notification

---

## 🎯 Quick Verification Steps

1. ✅ **Files created** - `sentry.*.config.ts` exist
2. ✅ **Environment variables** - `.env.local` has SENTRY_DSN
3. ⚠️ **Remove --turbo** - Update package.json dev script
4. 🔄 **Restart server** - Stop and start pnpm dev
5. 🧪 **Test error** - Visit test page or throw test error
6. 👀 **Check dashboard** - See error in Sentry within 30s
7. ✅ **Production ready** - Configure production env vars

---

## ✅ Success Criteria

You'll know Sentry is working when:
- ✅ Test errors appear in Sentry dashboard
- ✅ No console errors about Sentry
- ✅ Performance traces visible in dashboard
- ✅ User context captured with errors

---

## 📚 Next Steps

1. Update production environment variables
2. Configure alerts for critical errors
3. Set up performance monitoring thresholds
4. Integrate with Slack/Discord for notifications
5. Upload source maps for better error tracking

**Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Status**: ✅ Sentry installed and configured!  
**Action Required**: Remove `--turbo` flag and restart dev server to test
