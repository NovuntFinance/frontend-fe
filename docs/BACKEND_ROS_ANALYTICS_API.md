# Backend ROS Analytics API Specification

## Overview

The frontend requires two ROS (Return on Stake) analytics endpoints to display weekly and daily earnings data. These endpoints are currently returning 404, but the frontend handles this gracefully.

## Base URL

All endpoints should be under: `/api/analytics/` (or `/api/v1/analytics/` if your backend uses versioning)

---

## 1. Weekly Summary Endpoint

### Endpoint

```
GET /api/analytics/weekly-summary
```

### Authentication

- **Required**: Yes
- **Header**: `Authorization: Bearer <access_token>`
- **Cookies**: `auth_token` (if using cookie-based auth)

### Response Format

```json
{
  "success": true,
  "data": {
    "weekNumber": 15,
    "year": 2024,
    "startDate": "2024-04-07T00:00:00.000Z",
    "endDate": "2024-04-13T23:59:59.999Z",
    "totalEarnings": 1250.5,
    "averageRos": 12.5,
    "status": "pending",
    "dailyBreakdown": [
      {
        "date": "2024-04-07T00:00:00.000Z",
        "dayOfWeek": "Sunday",
        "ros": 10.2,
        "earnings": 102.0
      },
      {
        "date": "2024-04-08T00:00:00.000Z",
        "dayOfWeek": "Monday",
        "ros": 12.5,
        "earnings": 125.0
      }
      // ... up to 7 days
    ]
  }
}
```

### Field Descriptions

- `weekNumber`: Week number of the year (1-52/53)
- `year`: Year (e.g., 2024)
- `startDate`: ISO 8601 date string for week start (Sunday)
- `endDate`: ISO 8601 date string for week end (Saturday)
- `totalEarnings`: Total earnings for the week in USDT
- `averageRos`: Average ROS percentage for the week
- `status`: `"pending"` (week in progress) or `"completed"` (week finished)
- `dailyBreakdown`: Array of 7 objects, one per day
  - `date`: ISO 8601 date string
  - `dayOfWeek`: Full day name ("Sunday", "Monday", etc.)
  - `ros`: ROS percentage for that day
  - `earnings`: Earnings in USDT for that day

### Error Responses

- `401 Unauthorized`: User not authenticated
- `404 Not Found`: No data available (frontend handles this gracefully)
- `500 Internal Server Error`: Server error

---

## 2. Daily Earnings Endpoint

### Endpoint

```
GET /api/analytics/daily-earnings?timeRange=7D|30D|ALL
```

### Authentication

- **Required**: Yes
- **Header**: `Authorization: Bearer <access_token>`
- **Cookies**: `auth_token` (if using cookie-based auth)

### Query Parameters

- `timeRange` (required): One of:
  - `"7D"` - Last 7 days
  - `"30D"` - Last 30 days
  - `"ALL"` - All time

### Response Format

```json
{
  "success": true,
  "data": {
    "dailyData": [
      {
        "date": "2024-04-07T00:00:00.000Z",
        "amount": 102.5,
        "ros": 10.25
      },
      {
        "date": "2024-04-08T00:00:00.000Z",
        "amount": 125.0,
        "ros": 12.5
      }
      // ... more days based on timeRange
    ],
    "summary": {
      "totalEarnings": 1250.5,
      "averageRos": 11.75,
      "bestDay": {
        "date": "2024-04-10T00:00:00.000Z",
        "amount": 150.0
      }
    }
  }
}
```

### Field Descriptions

- `dailyData`: Array of daily earnings
  - `date`: ISO 8601 date string
  - `amount`: Earnings in USDT for that day
  - `ros`: ROS percentage for that day
- `summary`:
  - `totalEarnings`: Sum of all earnings in the time range
  - `averageRos`: Average ROS across all days
  - `bestDay`: Day with highest earnings
    - `date`: ISO 8601 date string
    - `amount`: Earnings amount

### Error Responses

- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid `timeRange` parameter
- `404 Not Found`: No data available (frontend handles this gracefully)
- `500 Internal Server Error`: Server error

---

## Data Source Notes

### Where to Get This Data

These endpoints should aggregate data from:

1. **Staking transactions** - Daily/weekly ROS payouts
2. **Referral commissions** - If included in earnings
3. **Registration bonuses** - If included in earnings
4. **Other income sources** - As defined by your business logic

### ROS Calculation

ROS (Return on Stake) is typically calculated as:

```
ROS = (Daily Earnings / Staked Amount) * 100
```

### Week Calculation

- Week starts on **Sunday** (day 0)
- Week ends on **Saturday** (day 6)
- Week number should follow ISO 8601 week numbering standard

---

## Frontend Integration

The frontend is already calling these endpoints:

- **File**: `src/services/rosApi.ts`
- **Components**:
  - `src/components/dashboard/WeeklyROSCard.tsx`
  - `src/components/dashboard/DailyROSPerformance.tsx`

### Current Behavior

- Frontend gracefully handles 404 errors
- Components show empty/loading states when endpoints are unavailable
- No user-facing errors when endpoints don't exist

### After Implementation

Once these endpoints are implemented:

1. Frontend will automatically start displaying data
2. No frontend code changes needed
3. Components will show real earnings data

---

## Testing

### Test Cases

1. **Authenticated user with data**: Should return 200 with data
2. **Authenticated user without data**: Should return 200 with empty arrays
3. **Unauthenticated request**: Should return 401
4. **Invalid timeRange**: Should return 400
5. **Server error**: Should return 500

### Sample Test Requests

```bash
# Weekly Summary
curl -X GET "https://your-backend.com/api/analytics/weekly-summary" \
  -H "Authorization: Bearer <token>"

# Daily Earnings (7 days)
curl -X GET "https://your-backend.com/api/analytics/daily-earnings?timeRange=7D" \
  -H "Authorization: Bearer <token>"

# Daily Earnings (30 days)
curl -X GET "https://your-backend.com/api/analytics/daily-earnings?timeRange=30D" \
  -H "Authorization: Bearer <token>"
```

---

## Priority

- **Priority**: Medium (features work without it, but data display is enhanced)
- **Timeline**: Can be implemented after core features are stable
- **Impact**: Improves user experience by showing earnings analytics

---

## Questions?

If you need clarification on:

- Data structure requirements
- Calculation methods
- Authentication flow
- Error handling

Please refer to the frontend code in `src/services/rosApi.ts` for the exact expected formats.
