# 🚀 Notification System - Quick Start Guide

Get the notification system up and running in 5 minutes!

---

## ⚡ Quick Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> Replace with your actual backend API URL

### 2. Start the Development Server

```bash
pnpm dev
```

### 3. Test It Out

Navigate to: `http://localhost:3000/dashboard`

You should see:

- 🔔 Notification bell icon in the top-right header
- Badge shows unread count (if any notifications exist)
- Click the bell to open the notification center

---

## 🧪 Create Test Notifications

### Option 1: Using cURL (Backend Test Endpoint)

```bash
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "title": "💰 Deposit Confirmed",
    "message": "Your deposit of $100 USDT has been confirmed and credited to your account.",
    "type": "deposit",
    "metadata": {
      "amount": 100,
      "currency": "USDT",
      "ctaUrl": "/dashboard/transactions",
      "ctaText": "View Transaction"
    }
  }'
```

### Option 2: Multiple Test Notifications

Create a variety of test notifications:

```bash
# Deposit
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"title":"Deposit Confirmed","message":"Your deposit of $100 has been confirmed.","type":"deposit"}'

# Withdrawal
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"title":"Withdrawal Processed","message":"Your withdrawal of $50 is being processed.","type":"withdrawal"}'

# Bonus
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"title":"Bonus Received!","message":"You received a $20 welcome bonus!","type":"bonus"}'

# Referral
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"title":"New Referral","message":"Someone joined using your referral code!","type":"referral"}'

# Security Alert
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"title":"Security Alert","message":"New login detected from a different device.","type":"security"}'
```

---

## 📱 Features to Test

### ✅ 1. Notification Badge

- Look for the red badge on the bell icon
- Shows unread count
- Updates in real-time (polls every 30s)

### ✅ 2. Notification Center (Dropdown)

- Click the bell icon
- See list of notifications
- Tabs: All, 💰, 💸, 🎁, ⚠️
- "Mark all as read" button

### ✅ 3. Notification Actions

- **Click notification** → Marks as read
- **Click X** → Deletes notification
- **Click CTA button** → Navigates to link

### ✅ 4. Full Notification Page

- Go to `/dashboard/notifications`
- See all notifications with filters
- Filter by type
- Toggle "Unread Only"
- Infinite scroll (load more)

### ✅ 5. Real-time Updates

- Create new notification (via API)
- Wait up to 30 seconds
- Badge should update automatically
- New notification appears in list

---

## 🎯 Test Scenarios

### Scenario 1: Basic Flow

1. ✅ Open dashboard
2. ✅ Create test notification
3. ✅ See badge update (1)
4. ✅ Click bell → dropdown opens
5. ✅ Click notification → marks as read
6. ✅ Badge updates (0)

### Scenario 2: Multiple Notifications

1. ✅ Create 5+ test notifications
2. ✅ Badge shows count
3. ✅ Open dropdown → see all
4. ✅ Click "Mark all as read"
5. ✅ Badge clears

### Scenario 3: Filtering

1. ✅ Create notifications of different types
2. ✅ Go to `/dashboard/notifications`
3. ✅ Use type filter dropdown
4. ✅ Only matching types shown
5. ✅ Toggle "Unread Only"

### Scenario 4: Deep Linking

1. ✅ Create notification with `ctaUrl`
2. ✅ Click the CTA button
3. ✅ Navigates to correct page

### Scenario 5: Pagination

1. ✅ Create 50+ notifications
2. ✅ Go to `/dashboard/notifications`
3. ✅ Scroll to bottom
4. ✅ "Load More" button appears
5. ✅ Click → more notifications load

---

## 🎨 Notification Types

### Available Types

| Type         | Icon | Use Case                | Color  |
| ------------ | ---- | ----------------------- | ------ |
| `deposit`    | 💰   | Deposit confirmations   | Green  |
| `withdrawal` | 💸   | Withdrawal updates      | Blue   |
| `bonus`      | 🎁   | Bonus credits           | Gold   |
| `referral`   | 👥   | Referral earnings       | Purple |
| `earning`    | 📈   | Profit/ROI updates      | Green  |
| `system`     | ℹ️   | System announcements    | Blue   |
| `alert`      | ⚠️   | Warnings/actions needed | Orange |
| `security`   | 🔒   | Security events         | Red    |

---

## 🔍 Debugging

### Check API Connection

```bash
# Test if API is accessible
curl http://localhost:5000/api/v1/notifications

# Expected: 200 OK with notification data
```

### Check Browser Console

Open DevTools → Console:

```javascript
// Get current notification state
window.__NOTIFICATION_DEBUG__ = true;

// Check store
import { useNotificationStore } from '@/store/notificationStore';
console.log(useNotificationStore.getState());
```

### Common Issues

**Issue: Badge not showing**

- Check if notifications exist in backend
- Verify API URL in `.env.local`
- Check browser console for errors

**Issue: Dropdown not opening**

- Check for JavaScript errors
- Verify React component is rendering
- Check z-index conflicts

**Issue: Mark as read not working**

- Verify authentication
- Check API endpoint response
- Ensure using `_id` (not `notificationId`)

---

## 📊 What's Tracking?

The notification system tracks **all user activities**:

✅ **Financial Activities**

- Deposits (confirmed, pending, failed)
- Withdrawals (approved, processing, completed)
- Stakes (created, matured, claimed)
- Transfers (sent, received)

✅ **Rewards & Bonuses**

- Welcome bonuses
- Referral bonuses
- Achievement rewards
- Promotional bonuses

✅ **Team & Social**

- New referrals
- Team member activities
- Rank promotions
- Leaderboard achievements

✅ **System & Security**

- Account updates
- Security alerts
- System maintenance
- Important announcements

---

## 🎉 You're All Set!

The notification system is now tracking all your activities. You should see:

✅ Real-time updates
✅ Badge with unread count
✅ Beautiful notification UI
✅ Deep linking to relevant pages
✅ Filtering and search
✅ Mobile-responsive design

**Happy tracking! 🚀**

---

## 📚 Next Steps

- Read the full guide: `NOTIFICATION_SYSTEM_GUIDE.md`
- Check API reference: `Frontend_Notification_API_Reference.md`
- Run tests: `pnpm test notifications`
- Customize styling: See "Customization" in main guide

---

## 💬 Support

If you encounter issues:

1. Check the troubleshooting section in `NOTIFICATION_SYSTEM_GUIDE.md`
2. Review browser console for errors
3. Verify API connectivity
4. Check authentication status

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-24  
**Status**: ✅ Ready to Use
