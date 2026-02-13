# Platform Time System - Developer Quick Reference

**🚀 TL;DR:** All date/time must use UTC methods. Platform "day" boundaries come from backend setting `platform_day_start_utc`.

---

## ⚡ Quick Rules

### ✅ DO:

```typescript
// ✅ Use UTC methods
date.setUTCHours(0, 0, 0, 0);
date.getUTCDate();
date.getUTCMonth();

// ✅ Use platform time utilities
import { getCurrentPlatformDayRange } from '@/utils/platformTime';
const { start, end } = getCurrentPlatformDayRange(platformDayStart);

// ✅ Use platform time hooks
import { usePlatformDayRange } from '@/hooks/usePlatformTime';
const { start, end } = usePlatformDayRange();

// ✅ Use ISO strings for API calls
const startDate = new Date().toISOString();
```

### ❌ DON'T:

```typescript
// ❌ Never use local time methods
date.setHours(0, 0, 0, 0);
date.getDate();
date.getMonth();

// ❌ Don't hardcode timezone offsets
const nigerianOffset = 1 * 60 * 60 * 1000; // NO!

// ❌ Don't calculate "today" locally
const today = new Date();
today.setHours(0, 0, 0, 0); // WRONG!

// ❌ Don't reference specific timezones
// "Nigerian Time", "Baker Island Time", "UTC+1"
```

---

## 📦 Available Imports

### Utility Functions

```typescript
import {
  getCachedPlatformDayStart, // Get platform day start (cached)
  getCurrentPlatformDayStart, // Get current day start Date
  getCurrentPlatformDayRange, // Get {start, end} for current day
  getTimeUntilReset, // Get milliseconds until reset
  formatDuration, // Format duration (e.g., "5h 23m")
  getCurrentPlatformDayStartISO, // Get start as ISO string
  getCurrentPlatformDayEndISO, // Get end as ISO string
} from '@/utils/platformTime';
```

### React Hooks

```typescript
import {
  usePlatformDayStart, // Get platform day start time
  usePlatformDayRange, // Get day boundaries
  useTimeUntilReset, // Get countdown to reset
  useOnPlatformDayReset, // Callback on reset
  usePlatformDay, // Get everything
} from '@/hooks/usePlatformTime';
```

### Service

```typescript
import {
  getPlatformDayStart, // Fetch from backend (with caching)
  initializePlatformSettings, // Initialize on app load
  invalidatePlatformDayStart, // Force refresh
} from '@/services/platformSettingsService';
```

### Store

```typescript
import { usePlatformConfigStore } from '@/store/platformConfigStore';

const platformDayStart = usePlatformConfigStore(
  (state) => state.platformDayStart
);
```

---

## 🎯 Common Use Cases

### 1. Get "Today" for API Queries

```typescript
import { usePlatformDayRange } from '@/hooks/usePlatformTime';

function TransactionHistory() {
  const { start, end } = usePlatformDayRange();

  // Start and end are ISO strings ready for API
  const { data } = useQuery({
    queryKey: ['transactions', start, end],
    queryFn: () => api.get(`/transactions?start=${start}&end=${end}`),
  });
}
```

### 2. Show Reset Timer

```typescript
import { useTimeUntilReset } from '@/hooks/usePlatformTime';

function DailyEarnings() {
  const { formatted } = useTimeUntilReset();

  return (
    <div>
      <h3>Today's Earnings</h3>
      <p>Resets in {formatted}</p>
    </div>
  );
}
```

### 3. Refetch Data at Reset

```typescript
import { useOnPlatformDayReset } from '@/hooks/usePlatformTime';

function Dashboard() {
  const { refetch } = useQuery({ ... });

  useOnPlatformDayReset(refetch);
}
```

### 4. Date Picker "Today" Button

```typescript
import { usePlatformDayRange } from '@/hooks/usePlatformTime';

function DatePicker() {
  const { startDate, endDate } = usePlatformDayRange();

  const handleTodayClick = () => {
    setDateRange({ start: startDate, end: endDate });
  };
}
```

### 5. Manual Calculation (No Hooks)

```typescript
import {
  getCachedPlatformDayStart,
  getCurrentPlatformDayRange,
} from '@/utils/platformTime';

async function fetchData() {
  const platformDayStart = await getCachedPlatformDayStart();
  const { start, end } = getCurrentPlatformDayRange(platformDayStart);

  return fetch(
    `/api/data?start=${start.toISOString()}&end=${end.toISOString()}`
  );
}
```

---

## 🔄 Migration Patterns

### Before (❌ Wrong)

```typescript
// OLD: Using local time
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

fetchData(today.toISOString(), tomorrow.toISOString());
```

### After (✅ Correct)

```typescript
// NEW: Using platform time
import { usePlatformDayRange } from '@/hooks/usePlatformTime';

const { start, end } = usePlatformDayRange();
fetchData(start, end);
```

---

## 🧪 Testing

### Test in Different Timezones

```typescript
// Set your browser/OS timezone to:
// - UTC
// - UTC+1 (Nigeria/Lagos)
// - UTC-5 (New York)
// - UTC+9 (Tokyo)

// Verify:
// 1. All show same "today"
// 2. Reset timer counts down consistently
// 3. No timezone-related errors in console
```

### Test with Different Platform Day Starts

```typescript
// Change backend setting to:
// - "00:00:00" (midnight UTC)
// - "06:00:00" (6 AM UTC)
// - "12:00:00" (noon UTC)

// Verify:
// 1. Frontend picks up new value within 5 minutes
// 2. Day boundaries update correctly
// 3. Reset timer updates
```

---

## 🐛 Debugging

### Check Platform Day Start Value

```typescript
// In any component:
import { usePlatformDayStart } from '@/hooks/usePlatformTime';

const platformDayStart = usePlatformDayStart();
console.log('Platform day start:', platformDayStart); // "00:00:00"
```

### Check Store State

```typescript
// In browser console:
// 1. Install React DevTools
// 2. Open Components tab
// 3. Find any component
// 4. Check "platformConfigStore" in Context

// Or programmatically:
import { usePlatformConfigStore } from '@/store/platformConfigStore';
console.log(usePlatformConfigStore.getState());
```

### Force Refresh

```typescript
import { invalidatePlatformDayStart } from '@/services/platformSettingsService';

// Force immediate refetch from backend
invalidatePlatformDayStart();
```

### Check Backend Endpoint

```bash
# Test in terminal:
curl http://localhost:5000/api/v1/settings/public/platform_day_start_utc

# Expected response:
# {
#   "success": true,
#   "data": {
#     "key": "platform_day_start_utc",
#     "value": "00:00:00"
#   }
# }
```

---

## 📝 When to Use Platform Time

### Use Platform Time For:

- ✅ Daily earnings calculations
- ✅ "Today" filters in transaction history
- ✅ Daily performance metrics
- ✅ Reset timers and countdowns
- ✅ Day-based aggregations
- ✅ Staking dashboard day boundaries
- ✅ ROS (Return on Stake) calculations

### Don't Use Platform Time For:

- ❌ User profile age calculations (use local calendar)
- ❌ Date of birth inputs
- ❌ Appointment scheduling (user-specific)
- ❌ Display of "Posted 2 hours ago" (relative time)
- ❌ Timezone-specific events

---

## 🚨 Common Mistakes

### 1. Mixing Local and UTC Methods

```typescript
// ❌ BAD: Mixing methods
const date = new Date();
date.setUTCHours(0, 0, 0, 0); // UTC
const day = date.getDate(); // Local - WRONG!

// ✅ GOOD: All UTC
const date = new Date();
date.setUTCHours(0, 0, 0, 0);
const day = date.getUTCDate();
```

### 2. Calculating "Today" Without Platform Time

```typescript
// ❌ BAD: Local calculation
const today = new Date();
today.setHours(0, 0, 0, 0);

// ✅ GOOD: Platform time
const { start } = usePlatformDayRange();
```

### 3. Hardcoding Timezone Offsets

```typescript
// ❌ BAD: Hardcoded offset
const nigerianTime = new Date().getTime() + 1 * 60 * 60 * 1000;

// ✅ GOOD: Use platform time utilities
const { start } = getCurrentPlatformDayRange(platformDayStart);
```

---

## ⏱️ Performance Tips

### 1. Use Hooks in Components

```typescript
// ✅ GOOD: Automatic caching and updates
const { start, end } = usePlatformDayRange();
```

### 2. Avoid Redundant Fetches

```typescript
// ❌ BAD: Fetching multiple times
const dayStart1 = await getCachedPlatformDayStart();
const dayStart2 = await getCachedPlatformDayStart();

// ✅ GOOD: Fetch once, reuse
const dayStart = await getCachedPlatformDayStart();
// dayStart is cached for 5 minutes
```

### 3. Memoize Calculations

```typescript
// ✅ GOOD: Memoize expensive calculations
const dayRange = useMemo(
  () => getCurrentPlatformDayRange(platformDayStart),
  [platformDayStart]
);
```

---

## 📞 Need Help?

1. **Check Documentation:**
   - `FRONTEND_PLATFORM_TIME_IMPLEMENTATION_COMPLETE.md`
   - Backend docs: `FRONTEND_QUICK_START.md`

2. **Debugging:**
   - Check console logs for errors
   - Verify backend endpoint is accessible
   - Check React DevTools for store state

3. **Questions:**
   - Slack: #frontend-team
   - GitHub Issues: Tag with `platform-time`

---

**Last Updated:** February 13, 2026
