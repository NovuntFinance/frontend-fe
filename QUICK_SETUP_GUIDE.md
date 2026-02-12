# Quick Setup Guide - Multi-Slot Distribution System

## ⚡ 5-Minute Setup

Follow these steps to complete the integration:

---

## Step 1: Add Route for Cron Settings Page (2 minutes)

### Option A: If using Next.js App Router (app/ directory)

Create this file:

```
app/admin/settings/distribution-schedule/page.tsx
```

Copy the contents from `EXAMPLE_ROUTE_PAGE.tsx` in the root directory.

### Option B: If using Next.js Pages Router (pages/ directory)

Create this file:

```
pages/admin/settings/distribution-schedule.tsx
```

Use this code:

```tsx
import { CronSettingsPage } from '@/components/admin/cronSettings';

export default function DistributionSchedulePage() {
  return <CronSettingsPage />;
}
```

---

## Step 2: Add Navigation Link (2 minutes)

Find your admin sidebar/navigation component and add a new menu item:

```tsx
import { Clock } from 'lucide-react';

// Add this to your navigation items array:
{
  label: 'Distribution Schedule',
  href: '/admin/settings/distribution-schedule',
  icon: Clock,
  permission: 'settings.update', // Or your equivalent permission check
  group: 'Settings', // Optional grouping
}
```

**Example locations to look for:**

- `src/components/admin/AdminSidebar.tsx`
- `src/components/navigation/AdminNav.tsx`
- `src/config/navigation.ts`

---

## Step 3: Verify Backend Connection (1 minute)

Open your browser console and run:

```javascript
// Test backend health
fetch('https://api.novunt.com/health')
  .then((r) => r.json())
  .then(console.log);

// Test cron status (no auth needed)
fetch('https://api.novunt.com/cron-status')
  .then((r) => r.json())
  .then(console.log);
```

Expected responses:

```json
// Health check
{"status":"ok","uptime":123456,"timestamp":"2026-02-11T..."}

// Cron status
{"status":"active","mode":"dynamic","numberOfSlots":1,...}
```

---

## Step 4: Start Development Server

```bash
pnpm run dev
# or
npm run dev
# or
yarn dev
```

---

## Step 5: Test the Features

### Test Cron Settings Page:

1. Navigate to: `http://localhost:3000/admin/settings/distribution-schedule`
2. You should see the current schedule
3. Click "Edit Schedule"
4. Try changing:
   - Timezone (search works)
   - Number of slots (1-10)
   - Time for each slot
5. Click "Save Changes"
6. ✅ Should see success toast and updated settings

### Test Declaration Form:

1. Navigate to your existing "Daily Declaration Returns" page
2. You should see a new "Distribution Mode" toggle
3. Try switching between Single-Slot and Multi-Slot modes
4. In Multi-Slot mode:
   - Should see per-slot ROS inputs
   - Should show current schedule info
   - Should calculate total ROS
5. Queue a multi-slot distribution
6. ✅ Should see success and slot status cards

---

## Troubleshooting

### Issue: "Cannot find module '@/components/admin/cronSettings'"

**Solution**: Make sure you created all the files. Check:

- `src/components/admin/cronSettings/CronSettingsPage.tsx`
- `src/components/admin/cronSettings/index.ts`

### Issue: "Cannot find module '@/types/cronSettings'"

**Solution**: Make sure you created:

- `src/types/cronSettings.ts`

### Issue: "2FA modal doesn't appear"

**Solution**: Make sure your 2FA context is set up correctly. The services are already configured to use it.

### Issue: "API returns 401 Unauthorized"

**Solution**:

1. Make sure you're logged in as an admin
2. Check your admin token is valid
3. Verify you have the required permissions

### Issue: "Cron settings not loading"

**Solution**:

1. Check backend is running: `curl https://api.novunt.com/health`
2. Check cron settings exist: `curl https://api.novunt.com/cron-status`
3. Check browser console for errors

---

## Testing Checklist

After setup, verify these work:

**Cron Settings Page:**

- [ ] Page loads without errors
- [ ] Shows current schedule (if exists)
- [ ] Timezone dropdown has 60+ options
- [ ] Can search timezones
- [ ] Can add/remove slots
- [ ] Can set time for each slot
- [ ] Validation works (prevents invalid times)
- [ ] Save button works
- [ ] Toggle enable/disable works

**Declaration Form:**

- [ ] Mode toggle visible
- [ ] Can switch between Single/Multi
- [ ] Single mode: works as before
- [ ] Multi mode: shows cron settings info
- [ ] Multi mode: shows per-slot ROS inputs
- [ ] Multi mode: calculates total ROS
- [ ] Can queue single-slot distribution
- [ ] Can queue multi-slot distribution

**Status Dashboard:**

- [ ] Single-slot status shows (legacy mode)
- [ ] Multi-slot status cards show
- [ ] Slot cards expand/collapse
- [ ] Status colors correct
- [ ] Real-time updates work

---

## Environment Variables

Make sure you have:

```env
NEXT_PUBLIC_API_URL=https://api.novunt.com
```

Or the API URL is correctly configured in your services.

---

## Additional Configuration (Optional)

### Add TypeScript Path Alias (if not already set)

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Add UI Components (if missing)

Make sure you have these shadcn/ui components installed:

- Card
- Button
- Input
- Label
- Select
- RadioGroup
- Alert
- Badge
- Switch

If missing, install them:

```bash
npx shadcn-ui@latest add card button input label select alert badge switch
```

---

## Success!

Once all checks pass, you're done! 🎉

The Multi-Slot Distribution System is now fully integrated and ready to use.

---

## Need Help?

If you encounter issues:

1. Check the console for errors
2. Verify all files were created (see MULTI_SLOT_IMPLEMENTATION_COMPLETE.md)
3. Ensure backend is running and accessible
4. Check your admin permissions
5. Review the backend documentation files for API details

---

## Next Steps

After successful setup:

1. **Test in staging** - Try all features with test data
2. **Configure initial schedule** - Set your preferred distribution times
3. **Queue a test distribution** - Try single-slot first, then multi-slot
4. **Monitor execution** - Watch the status dashboard during execution
5. **Deploy to production** - Once confident, deploy your changes

---

**Estimated Total Time**: ~5-10 minutes including testing

**Difficulty**: Easy ⭐

**Prerequisites**:

- Admin account with settings.update permission
- Backend running and accessible
- Basic Next.js knowledge

---

Good luck! 🚀
