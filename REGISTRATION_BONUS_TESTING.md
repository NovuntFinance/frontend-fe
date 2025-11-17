# Registration Bonus Banner - Testing Guide

## 🧪 Why You Can't See It on Existing Accounts

The Registration Bonus Banner **only appears for users who have a registration bonus record** in the backend database. 

### For Existing Accounts:
- ❌ **No bonus record exists** → API returns 404 → Banner hides (correct behavior)
- ✅ **This is expected** - existing accounts registered before the bonus feature was implemented

### For New Accounts:
- ✅ **Bonus record created automatically** during registration → Banner shows
- ✅ **7-day deadline** starts from registration date
- ✅ **Requirements tracking** begins immediately

---

## 🔍 How to Debug

### 1. Check Browser Console

Open browser DevTools (F12) and look for:

```
[RegistrationBonusBanner] Status: { ... }
[registrationBonusApi] Status response: { ... }
```

**What to look for:**
- `status: 404` = No bonus record (normal for existing accounts)
- `hasData: false` = No data returned
- `isDismissed: true` = Banner was dismissed (check localStorage)

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Filter by "registration-bonus"
3. Look for `GET /api/v1/registration-bonus/status`
4. Check response:
   - **200 OK** = Bonus record exists
   - **404 Not Found** = No bonus record (normal for existing accounts)
   - **401 Unauthorized** = Auth issue

### 3. Check localStorage

```javascript
// In browser console:
localStorage.getItem('novunt_bonus_dismissed')
// Returns: "true" if dismissed, null if not
```

**To reset:**
```javascript
localStorage.removeItem('novunt_bonus_dismissed')
// Then refresh page
```

---

## ✅ Testing Options

### Option 1: Register a New Account (Recommended)

1. **Log out** of your current account
2. **Register a new account** with a different email
3. **Log in** to the new account
4. **Check dashboard** - banner should appear immediately

**Why this works:**
- Backend creates bonus record automatically during registration
- Deadline starts from registration date
- All requirements start as incomplete

### Option 2: Backend Creates Test Record

Ask backend team to create a test registration bonus record for your user:

```javascript
// Backend should create:
{
  userId: "your_user_id",
  status: "pending",
  bonusPercentage: 10,
  deadline: "2025-01-XX", // 7 days from now
  registrationDate: new Date(),
  // ... other fields
}
```

### Option 3: Check Development Mode Messages

In **development mode**, the banner shows helpful debug messages:

- **404 Error:** Shows blue debug card explaining why banner is hidden
- **Dismissed:** Shows yellow debug card with reset instructions
- **No Data:** Shows orange debug card with troubleshooting tips

---

## 🎯 Expected Behavior by Account Type

| Account Type | Has Bonus Record? | Banner Shows? | Status |
|-------------|------------------|--------------|--------|
| **New Account** (registered after feature) | ✅ Yes | ✅ Yes | Shows banner |
| **Existing Account** (registered before feature) | ❌ No | ❌ No | Hidden (404) |
| **Account with Completed Bonus** | ✅ Yes | ❌ No | Hidden (status: completed) |
| **Account with Expired Bonus** | ✅ Yes | ⚠️ Maybe | Shows expired card |
| **Account with Active Bonus** | ✅ Yes | ✅ Yes | Shows success card |

---

## 🐛 Common Issues & Solutions

### Issue: Banner not showing on new account

**Check:**
1. ✅ Is user authenticated?
2. ✅ Does API return 200 (not 404)?
3. ✅ Is `data.success === true`?
4. ✅ Is `data.data.status` not "completed" or "cancelled"?

**Solution:**
- Check backend logs
- Verify bonus record was created during registration
- Check API endpoint is working: `GET /api/v1/registration-bonus/status`

### Issue: Banner shows but requirements don't update

**Check:**
1. ✅ Is API polling enabled? (should refresh every 30s)
2. ✅ Are profile updates calling bonus status refresh?
3. ✅ Is React Query cache invalidated after updates?

**Solution:**
- Manually refresh: `refetch()` in browser console
- Check network tab for polling requests
- Verify cache invalidation in mutations

### Issue: Countdown timer not updating

**Check:**
1. ✅ Is `timeRemaining` in milliseconds?
2. ✅ Is `deadline` valid ISO 8601 date?
3. ✅ Is countdown hook running? (check console)

**Solution:**
- Verify API response format
- Check browser console for errors
- Ensure component is mounted

---

## 📊 Testing Checklist

### For New Accounts:
- [ ] Banner appears immediately after login
- [ ] Progress shows 25% (registration complete)
- [ ] Countdown timer shows ~7 days remaining
- [ ] Requirements show correct status
- [ ] Navigation links work
- [ ] Progress updates after completing requirements
- [ ] Bonus activates after first stake

### For Existing Accounts:
- [ ] Banner does NOT appear (404 expected)
- [ ] No console errors
- [ ] Dashboard loads normally

### For Testing Bonus Activation:
- [ ] Create first stake
- [ ] Check bonus is processed automatically
- [ ] Verify bonus amount is correct (10% of stake)
- [ ] Confirm success card appears
- [ ] Verify bonus stake appears in stakes list

---

## 🔧 Manual Testing Commands

### In Browser Console:

```javascript
// Check bonus status manually
fetch('/api/v1/registration-bonus/status', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(console.log)

// Reset dismissed state
localStorage.removeItem('novunt_bonus_dismissed')
location.reload()

// Force refresh bonus status
// (if using React Query DevTools)
```

---

## 📝 Backend Requirements for Testing

For existing accounts to see the banner, backend needs to:

1. **Create bonus record** for the user
2. **Set registration date** to current date (or within 7 days)
3. **Set status** to "pending" or "requirements_met"
4. **Set deadline** to 7 days from registration date

**Example backend script:**
```javascript
// Create test bonus record
await RegistrationBonus.create({
  userId: existingUserId,
  status: 'pending',
  bonusPercentage: 10,
  registrationDate: new Date(),
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  // ... other fields
});
```

---

## ✅ Summary

**For existing accounts:**
- ❌ Banner won't show (no bonus record)
- ✅ This is **correct behavior**
- ✅ Register new account to test

**For new accounts:**
- ✅ Banner shows automatically
- ✅ All features work as expected
- ✅ Bonus activates after requirements met

**Need to test on existing account?**
- Ask backend to create test bonus record
- Or register a new test account

---

**Status:** ✅ Implementation Complete - Ready for Testing with New Accounts

