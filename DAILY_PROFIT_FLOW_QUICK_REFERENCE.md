# 📋 Daily Profit Flow - Quick Reference

**Quick guide for understanding the daily profit system flow**

---

## 🎛️ Admin Dashboard (`/admin/daily-profit`)

### **What Admins See:**

- **30-Day Calendar:** Shows next 30 days with color coding
- **Status Badges:**
  - 🟢 Green = Distributed
  - 🟡 Yellow = Pending (declared, not yet distributed)
  - ⚪ White = Not Declared
- **Distribution Status Panel:** Shows today's distribution status

### **What Admins Can Do:**

1. **Declare Profit (Single Day):**
   - Click date → Modal opens → Enter percentage → 2FA → Done
   - **API:** `POST /api/v1/admin/daily-profit/declare`

2. **Bulk Declare:**
   - Click "Bulk Declare" → Select date range → Enter percentage → 2FA → Done
   - **API:** `POST /api/v1/admin/daily-profit/declare-bulk`

3. **Edit Profit:**
   - Click declared date → Modal opens (pre-filled) → Change → 2FA → Done
   - **API:** `PATCH /api/v1/admin/daily-profit/:date`

4. **Delete Profit:**
   - List view → Click "Delete" → Confirm → 2FA → Done
   - **API:** `DELETE /api/v1/admin/daily-profit/:date`

5. **Test Distribution:**
   - Click "Test Distribution" → 2FA → See results
   - **API:** `POST /api/v1/admin/daily-profit/test-distribute`

---

## 👤 User Dashboard (`/dashboard`)

### **What Users See:**

- **Today's Profit Card:**
  - Large profit percentage (e.g., "1.50%")
  - Date (e.g., "Monday, Jan 15, 2025")
  - Status badge:
    - 🟡 "Pending" = Will be distributed at end of day
    - 🟢 "Distributed" = Already distributed

### **What Happens:**

1. **Card Loads:**
   - **API:** `GET /api/v1/daily-profit/today`
   - Auto-refreshes every 5 minutes

2. **No Profit Declared:**
   - Shows "No profit declared" message
   - User-friendly error state

3. **After Distribution (23:59:59):**
   - Status changes to "Distributed"
   - User's stake balance increases
   - Card updates automatically

---

## 🔄 Complete Flow

```
ADMIN DECLARES PROFIT
         │
         ▼
Admin clicks date → Modal → Enter % → 2FA → API call
         │
         ▼
Backend saves profit declaration
         │
         ▼
Calendar updates (shows yellow "Pending" badge)
         │
         ▼
USER SEES PROFIT
         │
         ▼
User dashboard loads → API call → Shows profit % → "Pending" badge
         │
         ▼
END OF DAY (23:59:59)
         │
         ▼
Cron job runs → Distributes profit to all active stakes
         │
         ▼
Backend updates: isDistributed = true
         │
         ▼
User dashboard auto-refreshes → Shows "Distributed" badge
         │
         ▼
Admin calendar updates → Shows green "Distributed" badge
```

---

## 🔐 2FA Flow

1. **Admin Action** (declare/edit/delete)
2. **2FA Modal Opens** (if admin has 2FA enabled)
3. **Admin Enters Code** (from authenticator app)
4. **Code Cached** (85 seconds)
5. **Request Sent** (with 2FA code)
6. **Backend Validates** (2FA code)
7. **Success/Error** (toast notification)

---

## ⏰ Cron Job Flow

1. **Daily at 23:59:59:**
   - Cron job runs automatically
   - Finds today's declared profit
   - Distributes to all active stakes
   - Updates `isDistributed = true`
   - Sets `distributedAt = timestamp`

2. **Frontend Updates:**
   - User dashboard auto-refreshes (every 5 min)
   - Status badge changes to "Distributed"
   - Admin calendar shows green badge

---

## 📊 Data Flow

**Admin View:**

- **API:** `GET /api/v1/admin/daily-profit/declared`
- **Returns:** All declared profits (including future dates)
- **Cache:** React Query (1 minute stale time)

**User View:**

- **API:** `GET /api/v1/daily-profit/today`
- **Returns:** ONLY today's profit (never future dates)
- **Cache:** React Query (5 minutes stale time, auto-refresh)

---

## 🎯 Key Points

1. **Admin can declare up to 30 days ahead**
2. **Users only see today's profit** (never future dates)
3. **Distribution happens automatically** at 23:59:59
4. **Status updates in real-time** (auto-refresh)
5. **2FA required for all admin operations**
6. **Past dates cannot be edited** (only future dates)

---

## 🚀 Quick Actions

**Admin:**

- Declare: Click date → Enter % → 2FA → Done
- Edit: Click declared date → Change % → 2FA → Done
- Delete: List view → Delete → 2FA → Done
- Test: Click "Test Distribution" → 2FA → See results

**User:**

- View: Open dashboard → See today's profit
- Wait: Profit distributed at end of day
- Check: Status badge shows distribution status

---

**For detailed documentation, see:** `DAILY_PROFIT_COMPLETE_FLOW_DOCUMENTATION.md`
