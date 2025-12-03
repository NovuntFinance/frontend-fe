# Backend Team - Trading Signals History API Implementation Request

## 🎯 Objective

We need a new API endpoint to power the **Trading Signals History** page in the frontend. This page allows users to view and filter up to 100 days of trading signals history.

## 📋 What's Needed

**New Endpoint:** `GET /api/v1/trading-signals/history`

This endpoint should:

- Return trading signals from the last 100 days
- Support filtering by: profitable trades, day trades, market type, symbol, and search
- Support pagination (offset/limit based)
- Return total count for accurate pagination

## 📄 Full Specification

**Complete implementation guide:** See `BACKEND_TRADING_SIGNALS_HISTORY_API.md` in the frontend repository.

This document includes:

- ✅ Complete endpoint specification
- ✅ All query parameters with examples
- ✅ Request/response formats
- ✅ Filtering logic details
- ✅ Pagination requirements
- ✅ Error handling
- ✅ Performance considerations
- ✅ Testing checklist
- ✅ Example implementation pseudocode

## 🚀 Quick Start

### Endpoint

```
GET /api/v1/trading-signals/history
```

### Key Query Parameters

- `days` (default: 100, max: 100) - Number of days of history
- `limit` (default: 20, max: 100) - Results per page
- `offset` (default: 0) - Pagination offset
- `profitableOnly` (boolean) - Filter profitable trades only
- `dayTradesOnly` (boolean) - Filter same-day trades only
- `marketType` (string) - Filter by: `forex`, `crypto`, `metals`, `commodities`
- `symbol` (string) - Filter by trading pair (e.g., `EUR/USD`)
- `search` (string) - Search across symbol, marketType, direction

### Expected Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "signal_1234567890",
      "symbol": "EUR/USD",
      "marketType": "forex",
      "direction": "SHORT",
      "entryPrice": 1.16669,
      "exitPrice": 1.16244,
      "entryTime": "2024-01-15T10:32:00.000Z",
      "exitTime": "2024-01-15T22:03:00.000Z",
      "pipsPoints": 425.0,
      "profitUSD": 187.5,
      "isProfitable": true,
      "duration": 690,
      "minutesAgo": 45
    }
  ],
  "count": 1250,
  "page": 1,
  "totalPages": 63,
  "hasMore": true
}
```

**Important:** The `count` field must represent the **total number of signals matching all filters** (not just the current page), as this is used for pagination in the frontend.

## 🔍 Key Filtering Requirements

### Day Trades Filter

A day trade = entry and exit occur on the **same calendar day** (same date, regardless of time).

### Profitable Only Filter

Filter where `isProfitable === true` OR `profitUSD > 0`.

### Search Filter

Search across: `symbol`, `marketType`, and `direction` fields (case-insensitive partial match).

## 📊 Sorting

**Default:** Sort by `exitTime` descending (newest first) before pagination.

## ⚡ Performance Notes

1. **Database Indexing Recommended:**
   - `exitTime` (for date range and sorting)
   - `marketType` (for filtering)
   - `symbol` (for filtering)
   - `isProfitable` (for filtering)
   - Compound index: `(exitTime, marketType, isProfitable)`

2. **Query Optimization:**
   - Apply date range filter first (most selective)
   - Use database-level filtering (not application-level)
   - Sort before pagination

## ✅ Testing Checklist

Please verify:

- [ ] Basic request returns signals from last 100 days
- [ ] Pagination works (offset/limit)
- [ ] All filters work individually and combined
- [ ] `count` returns total matching signals (not just current page)
- [ ] Sorting is by `exitTime` descending
- [ ] Error handling for invalid parameters
- [ ] Authentication is required
- [ ] Response format matches specification exactly

## 🎨 Frontend Status

✅ **Frontend is complete and ready** - The Trading Signals History page is already built and deployed. It will show errors until this endpoint is implemented.

**Frontend Location:** `/dashboard/trading-signals`

## 📞 Questions?

If you need clarification on any aspect, please refer to the detailed specification in `BACKEND_TRADING_SIGNALS_HISTORY_API.md` or reach out to the frontend team.

## 🔥 Priority

**HIGH PRIORITY** - This endpoint is blocking the Trading Signals History feature. Users cannot access this page until the endpoint is implemented.

---

## Example Request

```
GET /api/v1/trading-signals/history?days=100&limit=20&offset=0&marketType=forex&profitableOnly=true
```

## Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "signal_1234567890",
      "symbol": "EUR/USD",
      "marketType": "forex",
      "direction": "SHORT",
      "entryPrice": 1.16669,
      "exitPrice": 1.16244,
      "entryTime": "2024-01-15T10:32:00.000Z",
      "exitTime": "2024-01-15T22:03:00.000Z",
      "pipsPoints": 425.0,
      "profitUSD": 187.5,
      "isProfitable": true,
      "duration": 690,
      "minutesAgo": 45
    }
  ],
  "count": 1250,
  "page": 1,
  "totalPages": 63,
  "hasMore": true
}
```

---

**Ready to implement?** See `BACKEND_TRADING_SIGNALS_HISTORY_API.md` for complete details! 🚀
