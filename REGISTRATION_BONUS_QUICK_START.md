# Registration Bonus Banner - Quick Start Guide

## 🚀 Quick Integration

### 1. Import and Add to Dashboard

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { RegistrationBonusBanner } from '@/components/registration-bonus/RegistrationBonusBanner';

// In your component:
<RegistrationBonusBanner />
```

### 2. Stake Processing (Already Integrated!)

The bonus is automatically processed when users create their first stake. No additional code needed!

### 3. Manual Refresh (Optional)

```typescript
import { useRegistrationBonus } from '@/hooks/useRegistrationBonus';

const { refetch } = useRegistrationBonus();

// After profile update or social media follow:
refetch();
```

---

## 📋 Component Checklist

- [x] ✅ Types defined (`src/types/registrationBonus.ts`)
- [x] ✅ API service created (`src/services/registrationBonusApi.ts`)
- [x] ✅ Hooks created (`src/hooks/useRegistrationBonus.ts`, `useCountdown.ts`)
- [x] ✅ Main banner component (`RegistrationBonusBanner.tsx`)
- [x] ✅ Progress stepper (`ProgressStepper.tsx`)
- [x] ✅ Countdown timer (`CountdownTimer.tsx`)
- [x] ✅ Requirement sections (Social, Profile, Stake)
- [x] ✅ State components (Activated, Expired, Error)
- [x] ✅ Dashboard integration
- [x] ✅ Stake creation integration

---

## 🎯 Key Features

✅ **Auto-refresh:** Polls every 30 seconds when active  
✅ **Smart polling:** Different intervals based on status  
✅ **Error handling:** Graceful degradation  
✅ **Responsive:** Works on all devices  
✅ **Accessible:** WCAG 2.1 AA compliant  
✅ **Performant:** Optimized animations and API calls  

---

## 🔧 Configuration

### Polling Intervals

- **Pending/Requirements Met:** 30 seconds
- **Bonus Active:** 5 minutes
- **Expired/Completed:** No polling

### API Endpoints

- `GET /api/v1/registration-bonus/status` - Get status
- `POST /api/v1/registration-bonus/process-stake` - Process stake

---

## 🐛 Troubleshooting

### Banner not showing?

1. Check user is authenticated
2. Check API response (404 = no bonus available)
3. Check browser console for errors
4. Verify `NEXT_PUBLIC_API_URL` is set correctly

### Bonus not activating?

1. Verify stake creation response includes `isFirstStake: true`
2. Check `registrationBonusEligible: true` in response
3. Verify stake amount >= $20
4. Check backend logs for processing errors

### Countdown not updating?

1. Check `timeRemaining` is in milliseconds
2. Verify `deadline` is valid ISO 8601 date
3. Check browser console for errors

---

## 📚 Full Documentation

See `REGISTRATION_BONUS_IMPLEMENTATION.md` for complete documentation.

---

**Status:** ✅ Ready for Production

