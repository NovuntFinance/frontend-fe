# Support Ticket → Admin Connection

## Overview

For support tickets created by users to appear in the admin dashboard, the **backend** must connect both flows:

1. **User flow**: User submits form → `POST /api/assistant/support/escalate`
2. **Admin flow**: Admin views tickets → `GET /api/v1/admin/support`

Both must read/write the **same ticket storage** (database).

---

## Required Backend Endpoints

### User-Side (no `/v1` prefix)

| Method | Endpoint                                         | Purpose             |
| ------ | ------------------------------------------------ | ------------------- |
| POST   | `/api/assistant/support/escalate`                | Create ticket       |
| GET    | `/api/assistant/support/tickets`                 | List user's tickets |
| GET    | `/api/assistant/support/tickets/:ticketId`       | Get ticket detail   |
| POST   | `/api/assistant/support/tickets/:ticketId/reply` | User reply          |

### Admin-Side (with `/v1` prefix)

| Method | Endpoint                                   | Purpose                     |
| ------ | ------------------------------------------ | --------------------------- |
| GET    | `/api/v1/admin/support/stats`              | Dashboard stats             |
| GET    | `/api/v1/admin/support`                    | List all tickets            |
| GET    | `/api/v1/admin/support/:ticketId`          | Get ticket (with user info) |
| POST   | `/api/v1/admin/support/:ticketId/reply`    | Admin reply                 |
| PUT    | `/api/v1/admin/support/:ticketId/assign`   | Assign to agent             |
| PUT    | `/api/v1/admin/support/:ticketId/status`   | Update status               |
| PUT    | `/api/v1/admin/support/:ticketId/priority` | Update priority             |

---

## Data Flow

```
User submits form
    ↓
POST /api/assistant/support/escalate
    ↓
Backend stores ticket in DB (with userId, subject, description, etc.)
    ↓
Admin opens /admin/support
    ↓
GET /api/v1/admin/support
    ↓
Backend returns same tickets from DB (with user details)
```

---

## Verification Checklist

- [ ] Backend has `POST /api/assistant/support/escalate` implemented
- [ ] Backend stores tickets in a shared database/table
- [ ] Backend has `GET /api/v1/admin/support` returning those tickets
- [ ] Admin dashboard at `/admin/support` shows tickets
- [ ] `NEXT_PUBLIC_API_URL` points to the correct backend (e.g. `https://api.novunt.com/api/v1`)

---

## Fallback for Users

If the API is unavailable, the form shows:

- Support section in the app
- Support section in the app

Users can still reach support via these channels.
