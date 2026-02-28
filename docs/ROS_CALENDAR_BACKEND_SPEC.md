# ROS Calendar – Backend Implementation Spec

**Purpose:** Document the backend API contract for the ROS Calendar on the user dashboard. The frontend is synced with the backend's multi-slot Daily Declaration Returns.

---

## 1. Context & Business Goal

The **ROS Calendar** is a widget on the user dashboard that displays daily Return on Staking (ROS) percentages for each day of a month. Users can navigate between months and see:

- Each day's declared ROS % (e.g. 0.9%, 1.6%)
- A visual progress bar per day
- A monthly average at the bottom

**Requirement:** When an admin declares profits for a day (via Daily Declaration Returns slot-by-slot), that day's ROS should appear in the user's ROS Calendar and update regularly without a full page refresh.

---

## 2. Primary Endpoint (Backend Multi-Slot API)

**Endpoint:** `GET /api/v1/daily-profit/calendar`

**Auth:** Required (Bearer token / session)

### 2.1 Request

```
GET /api/v1/daily-profit/calendar?year=2026&month=2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Full year (e.g. 2026). Default: current. |
| `month` | number | No | Month 1–12 (January = 1, February = 2). Default: current. |

**Base URL:** Same as existing API (e.g. `NEXT_PUBLIC_API_URL` without `/api/v1`).

### 2.2 Response Format

```json
{
  "success": true,
  "data": {
    "calendar": {
      "2026-02-01": 0,
      "2026-02-02": 0.5,
      "2026-02-03": 0,
      "2026-02-28": 1.2
    },
    "year": 2026,
    "month": 2,
    "today": "2026-02-28"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `calendar` | object | Map of `YYYY-MM-DD` → ROS percentage (number) |
| `today` | string | Current platform day (YYYY-MM-DD). Used to highlight "today" in the calendar. |
| `year` | number | Echo of requested year |
| `month` | number | Echo of requested month (1–12) |

### 2.3 Multi-Slot Behaviour

1. **Today:** Sums all **completed** slot declarations for the day. As the admin declares more slots (e.g. Slot 1: 0%, Slot 2: 0.3%, Slot 3: 0.4%, Slot 4: 0.5%), the total grows (e.g. 1.2%) and updates in real time.
2. **Past days:** Uses distributed profit (single or summed multi-slot).
3. **Future days / no declaration:** Returns `0` for that date.

**Note:** Multi-slot sums can exceed 2.2%. The frontend caps the progress bar at 100% for values ≥ 2.2%.

---

## 3. What the Frontend Does

- **Component:** `RosCalendarCard` (dashboard)
- **Data source:** `useRosCalendarData(year, month)` React Query hook
- **Polling:** Refetches every **60 seconds** so new slot declarations appear quickly
- **API calls:** The frontend tries these endpoints in order:

| Priority | Endpoint | Params |
|----------|----------|--------|
| 1 | `GET /api/v1/daily-profit/calendar` | `year`, `month` (1–12) |
| 2 | `GET /api/v1/ros/calendar` or `GET /api/ros/calendar` | `year`, `month` |
| 3 | `getDailyEarnings('ALL')` filtered by month | — |

- **`data.calendar`:** Used for daily ROS values.
- **`data.today`:** Used to highlight the current platform day (falls back to client date if absent).

---

## 4. Data Source & Mapping

The backend derives daily ROS from **Daily Declaration Returns** (slot-by-slot):

- **Admin API:** `GET /api/v1/admin/daily-declaration-returns/declared`
- **Model:** Slots with `date`, `rosPercentage`, `status` (e.g. COMPLETED)
- **Today:** Sum all completed slots for the date.
- **Past days:** Distributed profit (single or summed multi-slot).
- **Platform time:** All dates use `platform_day_start_utc` (default: midnight UTC).

---

## 5. Error Handling

| Status | Meaning | Frontend behaviour |
|--------|---------|--------------------|
| 200 | Success | Use response data |
| 401 | Unauthorized | User must log in again |
| 404 | Not implemented | Fall back to legacy endpoints or mock data |
| 500 | Server error | Fall back to mock data or empty |

The frontend treats 404 as "endpoint not implemented" and does not surface an error to the user.

---

## 6. Summary Checklist for Backend

- [x] Implement `GET /api/v1/daily-profit/calendar?year=&month=`
- [x] Require user JWT authentication
- [x] Return `{ data: { calendar: { "YYYY-MM-DD": number }, today, year, month } }`
- [x] Use Daily Declaration Returns (slot-by-slot) as data source
- [x] Today: sum completed slots; past days: distributed profit
- [x] Include `data.today` for calendar highlighting
- [x] Frontend polls every 60s for fresh declarations

---

## 7. Frontend Reference

- **API client:** `src/services/rosApi.ts` → `getDailyRosForMonth(year, month)`
- **Query hook:** `src/lib/queries.ts` → `useRosCalendarData(year, month)`
- **Component:** `src/components/dashboard/RosCalendarCard.tsx`

For the full backend spec, see `novunt-backend-main/docs/FRONTEND_ROS_CALENDAR_API.md`.
