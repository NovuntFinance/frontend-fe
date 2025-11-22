# Setup Guide for Monitoring & Analytics

## Sentry Error Tracking Setup

### 1. Install Sentry
```bash
pnpm add @sentry/nextjs
```

### 2. Run Sentry Wizard
```bash  
npx @sentry/wizard@latest -i nextjs
```

### 3. Configure Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Initialize in Root Layout
Add to `src/app/layout.tsx`:
```typescript
import { initSentry } from '@/lib/error-tracking';

// In root layout or _app
if (typeof window !== 'undefined') {
  initSentry();
}
```

### 5. Integrate with Auth Store
Add to `src/store/authStore.ts`:
```typescript
import { setSentryUser, clearSentryUser } from '@/lib/error-tracking';

// When user logs in
setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// When user logs out
clearSentryUser();
```

---

## Analytics Setup

### Option A: Vercel Analytics (Recommended for Next.js)

#### 1. Install
```bash
pnpm add @vercel/analytics
```

#### 2. Add to Root Layout
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### 3. Environment Variable
```bash
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

### Option B: Google Analytics 4

#### 1. Add Script to Layout
```typescript
import Script from 'next/script';

export default function RootLayout() {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### 2. Environment Variable
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Option C: Plausible Analytics (Privacy-Focused)

#### 1. Add Script
```typescript
import Script from 'next/script';

<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
/>
```

#### 2. Environment Variable
```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

---

## Using Analytics in Components

### Track Page Views (Automatic)
```typescript
import { useAnalytics } from '@/lib/analytics';

function MyComponent() {
  useAnalytics(); // Auto-tracks page views
  return <div>Content</div>;
}
```

### Track Custom Events
```typescript
import { AnalyticsEvents } from '@/lib/analytics';

function DepositButton() {
  const handleDeposit = async () => {
    AnalyticsEvents.depositInitiated(amount, 'USD');
    // ... deposit logic
    AnalyticsEvents.depositCompleted(amount, 'USD', txId);
  };
  
  return <button onClick={handleDeposit}>Deposit</button>;
}
```

### Track Errors
```typescript
import { AnalyticsEvents } from '@/lib/analytics';
import { captureException } from '@/lib/error-tracking';

try {
  await riskyOperation();
} catch (error) {
  // Send to Sentry
  captureException(error as Error);
  
  // Track in analytics
  AnalyticsEvents.errorOccurred('deposit_failed', error.message);
}
```

---

## Zustand DevTools Setup

### 1. Install Redux DevTools Extension
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### 2. Update Auth Store
```typescript
import { withDevtoolsAndPersist } from '@/lib/zustand-devtools';

export const useAuthStore = create<AuthState>()(
  withDevtoolsAndPersist(
    'AuthStore', // Name in DevTools
    (set, get) => ({
      // ... your state
    }),
    {
      name: 'auth-storage',
      // ... persist options
    }
  )
);
```

### 3. Update UI Store
```typescript
import { withDevtools } from '@/lib/zustand-devtools';

export const useUIStore = create<UIState>()(
  withDevtools(
    'UIStore',
    (set) => ({
      // ... your state
    })
  )
);
```

### 4. Use DevTools
1. Open browser DevTools (F12)
2. Go to "Redux" tab
3. Select store from dropdown
4. Inspect state and actions
5. Time-travel through state changes

---

## Testing the Setup

### Test Sentry
```typescript
import { captureException, captureMessage } from '@/lib/error-tracking';

// Test error tracking
try {
  throw new Error('Test error');
} catch (error) {
  captureException(error as Error, { context: 'test' });
}

// Test message tracking
captureMessage('Test message', 'info');
```

### Test Analytics
```typescript
import { analytics, AnalyticsEvents } from '@/lib/analytics';

// Test custom event
analytics.track('test_event', { test: true });

// Test convenience function
AnalyticsEvents.loginSuccess();
```

### Verify in Dashboards
1. **Sentry**: Check [sentry.io](https://sentry.io) dashboard
2. **Vercel**: Check Vercel dashboard analytics tab
3. **Google Analytics**: Check [analytics.google.com](https://analytics.google.com)
4. **Plausible**: Check your Plausible dashboard

---

## Production Checklist

- [ ] Sentry DSN configured
- [ ] Analytics provider configured
- [ ] Error tracking tested
- [ ] Page view tracking verified
- [ ] Custom events firing correctly
- [ ] User identification working
- [ ] Zustand DevTools disabled in production
- [ ] Source maps uploaded to Sentry (optional)
- [ ] Performance monitoring enabled
- [ ] Session replay configured (optional)

---

## Monitoring Dashboard Access

### Sentry
- URL: https://sentry.io/organizations/your-org/projects/
- View errors, performance, releases

### Vercel Analytics
- URL: https://vercel.com/dashboard/analytics
- View page views, top pages, visitors

### Google Analytics
- URL: https://analytics.google.com
- View real-time, acquisition, behavior

---

## Support & Troubleshooting

### Sentry Not Tracking
1. Check NEXT_PUBLIC_SENTRY_DSN is set
2. Verify initSentry() is called
3. Check browser console for errors
4. Verify environment is 'production'

### Analytics Not Tracking
1. Check environment variables
2. Verify scripts are loaded (check Network tab)
3. Check browser console for errors
4. Disable ad blockers for testing

### DevTools Not Showing
1. Verify extension is installed
2. Check you're in development mode
3. Refresh page after installing extension
4. Check browser console for errors
