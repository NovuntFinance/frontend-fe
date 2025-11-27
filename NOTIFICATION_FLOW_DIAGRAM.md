# 📊 Notification System - Flow Diagram

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
│  (Deposit, Withdraw, Stake, Referral, etc.)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                 │
│  Creates notification via internal notification service          │
│  POST /api/internal/notifications                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                    │
│  Stores notification in MongoDB                                  │
│  { user, title, message, type, metadata, isRead, createdAt }    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND POLLING                               │
│  Every 30 seconds:                                               │
│  - fetchUnreadCount() → GET /api/v1/notifications/counts        │
│  - fetchNotifications() → GET /api/v1/notifications             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 NOTIFICATION STORE                               │
│  Zustand store updates state:                                    │
│  - notifications: Notification[]                                 │
│  - unreadCount: number                                           │
│  - pagination: PaginationInfo                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI UPDATES                                    │
│  React components re-render:                                     │
│  - NotificationBadge (shows unread count)                        │
│  - NotificationCenter (dropdown list)                            │
│  - NotificationList (full page)                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  USER INTERACTIONS                               │
│  - Click notification → markAsRead()                             │
│  - Click delete → deleteNotification()                           │
│  - Click "Mark all read" → markAllAsRead()                       │
│  - Click CTA → navigate to metadata.ctaUrl                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API CALLS                                     │
│  PATCH /api/v1/notifications/:id/read                            │
│  DELETE /api/v1/notifications/:id                                │
│  PATCH /api/v1/notifications/mark-all-read                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                DATABASE UPDATE                                   │
│  Updates notification record                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
Dashboard Layout
└── NotificationCenter (Header)
    ├── NotificationBadge (Bell Icon)
    │   └── useUnreadCount() hook
    └── DropdownMenu
        └── Tabs
            ├── Tab: All
            │   └── NotificationList
            │       └── NotificationItem (multiple)
            ├── Tab: Deposits
            │   └── NotificationList (filtered)
            ├── Tab: Withdrawals
            │   └── NotificationList (filtered)
            └── ... (other tabs)

Notifications Page (/dashboard/notifications)
├── Filters
│   ├── Type Dropdown
│   └── Unread Toggle
├── Activity Stats Cards
└── NotificationList
    └── NotificationItem (multiple)
        ├── Icon (type-based)
        ├── Title & Message
        ├── Timestamp
        ├── CTA Button (optional)
        └── Delete Button
```

---

## 🔄 Hook Flow

```
useNotifications()
│
├── useEffect (Initial Fetch)
│   └── fetchNotifications(filters)
│       └── API: GET /notifications
│           └── Store: setNotifications()
│               └── UI: Re-render
│
├── useEffect (Polling)
│   └── setInterval(30s)
│       ├── fetchNotifications(filters)
│       └── fetchUnreadCount()
│           └── Store: setUnreadCount()
│               └── Badge: Update
│
├── useEffect (New Notification Detection)
│   └── Compare previousIds with currentIds
│       └── onNewNotification(new notifications)
│           └── Show toast / Play sound
│
└── Return
    ├── notifications: Notification[]
    ├── unreadCount: number
    ├── loading: boolean
    ├── error: string | null
    └── Actions
        ├── markAsRead(id)
        ├── markAllAsRead()
        ├── deleteNotification(id)
        └── loadMore()
```

---

## 🎨 Notification Type Flow

```
Backend Event              Notification Type       UI Display
─────────────────────────────────────────────────────────────
Deposit confirmed    →     deposit           →    💰 Green
Withdrawal approved  →     withdrawal        →    💸 Blue
Bonus credited       →     bonus             →    🎁 Gold
New referral         →     referral          →    👥 Purple
Earning received     →     earning           →    📈 Green
System update        →     system            →    ℹ️ Blue
Action required      →     alert             →    ⚠️ Orange
Security event       →     security          →    🔒 Red
```

---

## ⚡ Real-time Update Flow

```
Time: T=0
┌────────────────────────────────────────┐
│ User deposits $100                      │
└────────┬───────────────────────────────┘
         │
Time: T=1s
         ▼
┌────────────────────────────────────────┐
│ Backend creates notification            │
│ { type: 'deposit', title: 'Deposit...' }│
└────────┬───────────────────────────────┘
         │
Time: T=1-30s (waiting for poll)
         ▼
┌────────────────────────────────────────┐
│ Frontend poll interval triggers         │
│ GET /notifications/counts               │
└────────┬───────────────────────────────┘
         │
Time: T=30s
         ▼
┌────────────────────────────────────────┐
│ API returns: { unreadCount: 1 }         │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Store updates: unreadCount = 1          │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Badge shows: "1"                        │
└────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
Frontend Request
│
├── Include credentials: true
├── Include session cookie
│
└── Axios Request
    │
    └── Backend Middleware: betterAuthMiddleware
        │
        ├── Verify session/token
        │   │
        │   ├── ✅ Valid → Continue
        │   └── ❌ Invalid → 401 Unauthorized
        │
        └── Extract userId from session
            │
            └── API Handler
                │
                └── Query: { user: userId }
                    │
                    └── Return only user's notifications
```

---

## 🎭 State Machine

```
Notification State Machine
──────────────────────────

Initial State: Not Created
│
├── onCreate() → Created (isRead: false)
│   │
│   ├── User views → markAsRead()
│   │   │
│   │   └── Read (isRead: true)
│   │       │
│   │       └── User deletes → deleteNotification()
│   │           │
│   │           └── Deleted (removed from DB)
│   │
│   └── User deletes → deleteNotification()
│       │
│       └── Deleted (removed from DB)
```

---

## 📱 User Interaction Flow

```
User opens dashboard
│
└── Dashboard Layout loads
    │
    ├── NotificationCenter mounts
    │   │
    │   └── useUnreadCount() starts polling
    │       │
    │       └── Badge shows count (if > 0)
    │
    └── User clicks bell icon
        │
        └── Dropdown opens
            │
            ├── NotificationList loads
            │   │
            │   └── Shows notifications
            │       │
            │       ├── User clicks notification
            │       │   │
            │       │   ├── Marks as read (optimistic)
            │       │   ├── API call in background
            │       │   └── Badge updates
            │       │
            │       ├── User clicks delete
            │       │   │
            │       │   ├── Removes from list (optimistic)
            │       │   └── API call in background
            │       │
            │       └── User clicks CTA
            │           │
            │           └── Navigates to ctaUrl
            │
            └── User clicks "View All"
                │
                └── Navigates to /dashboard/notifications
                    │
                    └── Full page with filters
```

---

## 🧪 Testing Flow

```
Test Suite
│
├── Unit Tests (API Service)
│   │
│   ├── Test getNotifications()
│   ├── Test markAsRead()
│   ├── Test deleteNotification()
│   └── Test error handling
│
├── Component Tests (React Testing Library)
│   │
│   ├── Test NotificationItem
│   │   ├── Renders correctly
│   │   ├── Click handlers work
│   │   └── Keyboard navigation
│   │
│   └── Test NotificationBadge
│       ├── Shows count
│       └── Updates on change
│
└── Integration Tests (Hooks)
    │
    └── Test useNotifications
        ├── Fetches on mount
        ├── Polls at interval
        └── Detects new notifications
```

---

## 📊 Performance Optimization Flow

```
Optimization Strategy
│
├── Lightweight Polling
│   └── Only fetch unread count (2KB)
│       vs Full notifications (20KB)
│
├── Pagination
│   └── Load 20 items at a time
│       vs All items at once
│
├── Memoization
│   └── useMemo for expensive calculations
│       vs Recalculate on every render
│
├── Debouncing
│   └── Debounce mark as read (500ms)
│       vs API call on every click
│
└── Lazy Loading
    └── Infinite scroll
        vs Load all upfront
```

---

## 🎯 Error Handling Flow

```
API Call
│
├── Try
│   └── Fetch data
│       │
│       ├── Success → Update store
│       │   │
│       │   └── UI shows data
│       │
│       └── Error → Catch
│           │
│           └── handleNotificationError()
│               │
│               ├── Axios Error
│               │   └── Extract message from response
│               │
│               ├── Network Error
│               │   └── Show "Network error"
│               │
│               └── Unknown Error
│                   └── Show "Unexpected error"
│
└── Update store with error
    │
    └── UI shows error state
        │
        └── User can retry
```

---

This flow diagram shows the complete lifecycle of a notification from creation to display and user interaction! 🎉
