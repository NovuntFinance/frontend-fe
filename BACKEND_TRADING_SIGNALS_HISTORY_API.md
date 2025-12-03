# Backend Trading Signals History API - Implementation Guide

## Overview

The frontend requires a new endpoint to fetch trading signals history with advanced filtering capabilities. This endpoint should return up to 100 days of trading signals data with support for filtering, pagination, and search.

## Base URL

All endpoints should be under: `/api/v1/trading-signals/` (or your existing trading signals API path)

---

## Endpoint Specification

### GET `/api/v1/trading-signals/history`

Fetches historical trading signals with filtering and pagination support.

#### Authentication

- **Required**: Yes
- **Header**: `Authorization: Bearer <access_token>`
- **Cookies**: `auth_token` (if using cookie-based auth)

---

## Query Parameters

| Parameter        | Type    | Required | Default | Description                                                       |
| ---------------- | ------- | -------- | ------- | ----------------------------------------------------------------- |
| `days`           | number  | No       | 100     | Number of days of history to retrieve (max: 100)                  |
| `limit`          | number  | No       | 20      | Number of results per page (max: 100)                             |
| `offset`         | number  | No       | 0       | Number of records to skip (for pagination)                        |
| `profitableOnly` | boolean | No       | false   | Filter to show only profitable trades (`true`/`false`)            |
| `dayTradesOnly`  | boolean | No       | false   | Filter to show only day trades (entry and exit on same day)       |
| `marketType`     | string  | No       | all     | Filter by market type: `forex`, `crypto`, `metals`, `commodities` |
| `symbol`         | string  | No       | -       | Filter by specific trading pair (e.g., `EUR/USD`, `BTC/USDT`)     |
| `search`         | string  | No       | -       | Search in symbol, market type, or direction fields                |

---

## Request Examples

### Basic Request (Last 100 days, first page)

```
GET /api/v1/trading-signals/history?days=100&limit=20&offset=0
```

### Filter by Profitable Trades Only

```
GET /api/v1/trading-signals/history?days=100&profitableOnly=true
```

### Filter Day Trades Only

```
GET /api/v1/trading-signals/history?days=100&dayTradesOnly=true
```

### Filter by Market Type

```
GET /api/v1/trading-signals/history?days=100&marketType=forex
```

### Filter by Symbol

```
GET /api/v1/trading-signals/history?days=100&symbol=EUR/USD
```

### Search Across Fields

```
GET /api/v1/trading-signals/history?days=100&search=EUR
```

### Combined Filters

```
GET /api/v1/trading-signals/history?days=100&marketType=forex&profitableOnly=true&limit=50&offset=0
```

---

## Response Format

### Success Response (200 OK)

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
    },
    {
      "id": "signal_1234567891",
      "symbol": "BTC/USDT",
      "marketType": "crypto",
      "direction": "LONG",
      "entryPrice": 42500.5,
      "exitPrice": 42850.75,
      "entryTime": "2024-01-15T14:20:00.000Z",
      "exitTime": "2024-01-15T18:45:00.000Z",
      "pipsPoints": 350.25,
      "profitUSD": 72.0,
      "isProfitable": true,
      "duration": 265,
      "minutesAgo": 120
    }
  ],
  "count": 1250,
  "page": 1,
  "totalPages": 63,
  "hasMore": true,
  "stats": {
    "totalSignals": 1250,
    "profitableSignals": 1000,
    "dayTrades": 450,
    "totalProfit": 125000.5,
    "winRate": 80.0
  }
}
```

### Response Fields

#### Root Object

- `success` (boolean): Always `true` for successful responses
- `data` (array): Array of trading signal objects
- `count` (number): **Total count of signals matching the filters** (not just current page)
- `page` (number, optional): Current page number
- `totalPages` (number, optional): Total number of pages
- `hasMore` (boolean, optional): Whether there are more pages available
- `stats` (object, optional): **Aggregate statistics across ALL matching signals** (not just current page)
  - `totalSignals` (number): Total number of signals matching filters (same as `count`)
  - `profitableSignals` (number): Total number of profitable signals matching filters
  - `dayTrades` (number): Total number of day trades matching filters
  - `totalProfit` (number): Sum of `profitUSD` for all profitable signals matching filters
  - `winRate` (number): Win rate percentage (profitableSignals / totalSignals \* 100)

#### Trading Signal Object

- `id` (string): Unique identifier for the signal
- `symbol` (string): Trading pair symbol (e.g., `EUR/USD`, `BTC/USDT`, `XAU/USD`)
- `marketType` (string): Market category - `forex`, `crypto`, `metals`, or `commodities`
- `direction` (string): Trade direction - `LONG` or `SHORT`
- `entryPrice` (number): Entry price for the trade
- `exitPrice` (number): Exit price for the trade
- `entryTime` (string): ISO 8601 timestamp of entry
- `exitTime` (string): ISO 8601 timestamp of exit
- `pipsPoints` (number): Profit/loss in pips (forex) or points (crypto/metals)
- `profitUSD` (number): Profit/loss in USD (negative for losses)
- `isProfitable` (boolean): Whether the trade was profitable
- `duration` (number): Duration of trade in minutes
- `minutesAgo` (number): Minutes elapsed since exit time

---

## Filtering Logic

### Day Trades Filter (`dayTradesOnly=true`)

A day trade is defined as a trade where both `entryTime` and `exitTime` occur on the same calendar day (same date, regardless of time).

**Example:**

- Entry: `2024-01-15T10:32:00Z`
- Exit: `2024-01-15T22:03:00Z`
- **Result**: This is a day trade ✅

- Entry: `2024-01-15T22:00:00Z`
- Exit: `2024-01-16T02:00:00Z`
- **Result**: This is NOT a day trade ❌

### Profitable Only Filter (`profitableOnly=true`)

Filter signals where `isProfitable === true` OR `profitUSD > 0`.

### Market Type Filter (`marketType`)

Filter signals where `marketType` exactly matches the provided value (`forex`, `crypto`, `metals`, or `commodities`).

### Symbol Filter (`symbol`)

Filter signals where `symbol` contains the provided string (case-insensitive partial match).

**Example:**

- Filter: `symbol=EUR` → Matches `EUR/USD`, `EUR/GBP`, etc.
- Filter: `symbol=EUR/USD` → Matches only `EUR/USD`

### Search Filter (`search`)

Search across multiple fields:

- `symbol` (partial match, case-insensitive)
- `marketType` (partial match, case-insensitive)
- `direction` (partial match, case-insensitive)

**Example:**

- Search: `EUR` → Matches signals with `EUR/USD`, `EUR/GBP`, etc.
- Search: `SHORT` → Matches all SHORT trades
- Search: `forex` → Matches all forex trades

---

## Pagination

### Offset-Based Pagination

The endpoint uses offset-based pagination:

- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

**Example:**

- Page 1: `limit=20&offset=0` (items 1-20)
- Page 2: `limit=20&offset=20` (items 21-40)
- Page 3: `limit=20&offset=40` (items 41-60)

### Response Pagination Info

The response should include:

- `count`: Total number of signals matching all filters (across all pages)
- `page`: Current page number (calculated as `Math.floor(offset / limit) + 1`)
- `totalPages`: Total number of pages (calculated as `Math.ceil(count / limit)`)
- `hasMore`: Boolean indicating if there are more pages (`offset + limit < count`)

---

## Sorting

**Default Sort Order**: Most recent first (by `exitTime` descending)

Signals should be sorted by `exitTime` in descending order (newest first) before applying pagination.

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid parameter: days must be between 1 and 100"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Data Requirements

### Date Range

- The endpoint should return signals from the last `days` days (up to 100 days)
- Calculate the date range: `[today - days days, today]`
- Include signals where `exitTime` falls within this range

### Data Source

- Signals should come from your existing trading signals database/collection
- Ensure all signals have complete data (entry, exit, prices, times, etc.)

---

## Performance Considerations

1. **Database Indexing**: Ensure indexes on:
   - `exitTime` (for date range filtering and sorting)
   - `marketType` (for market type filtering)
   - `symbol` (for symbol filtering)
   - `isProfitable` (for profitable filter)
   - Compound index: `(exitTime, marketType, isProfitable)`

2. **Query Optimization**:
   - Apply date range filter first (most selective)
   - Then apply other filters
   - Sort before pagination
   - Use database-level filtering instead of application-level filtering when possible

3. **Response Size**:
   - Limit maximum `limit` to 100 items per page
   - Consider caching frequently accessed queries

---

## Testing Checklist

- [ ] Basic request returns signals from last 100 days
- [ ] Pagination works correctly (offset/limit)
- [ ] `profitableOnly=true` returns only profitable trades
- [ ] `dayTradesOnly=true` returns only same-day trades
- [ ] `marketType` filter works for all four types (forex, crypto, metals, commodities)
- [ ] `symbol` filter performs case-insensitive partial matching
- [ ] `search` filter searches across symbol, marketType, and direction
- [ ] Combined filters work together correctly
- [ ] `count` returns total matching signals (not just current page)
- [ ] `stats` object is included in response with aggregate statistics
- [ ] `stats.profitableSignals` matches count of profitable signals across ALL pages
- [ ] `stats.dayTrades` matches count of day trades across ALL pages
- [ ] `stats.totalProfit` is sum of all profitable signals' profitUSD across ALL pages
- [ ] `stats.winRate` is calculated correctly (profitableSignals / totalSignals \* 100)
- [ ] Sorting is by `exitTime` descending (newest first)
- [ ] Date range calculation is correct (last N days)
- [ ] Error handling for invalid parameters
- [ ] Authentication is required
- [ ] Response format matches specification exactly

---

## Frontend Integration

The frontend is already configured to call this endpoint at:

```
GET /api/v1/trading-signals/history
```

The frontend expects:

- Response format exactly as specified above
- `count` field to represent total filtered results (for pagination)
- **`stats` object with aggregate statistics** - **REQUIRED** for accurate dashboard cards
  - The frontend displays summary cards showing "Total Signals", "Profitable", "Day Trades", and "Total Profit"
  - These cards must show statistics for **ALL matching signals**, not just the current page
  - Without the `stats` object, the cards will only show statistics from the 20 signals on the current page, which is incorrect
- All filtering to be done server-side
- Signals sorted by `exitTime` descending

---

## Example Implementation Pseudocode

```javascript
async function getTradingSignalsHistory(req, res) {
  const {
    days = 100,
    limit = 20,
    offset = 0,
    profitableOnly = false,
    dayTradesOnly = false,
    marketType,
    symbol,
    search,
  } = req.query;

  // Validate inputs
  const daysNum = Math.min(Math.max(parseInt(days) || 100, 1), 100);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const offsetNum = Math.max(parseInt(offset) || 0, 0);

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  // Build query
  let query = {
    exitTime: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  // Apply filters
  if (profitableOnly === 'true') {
    query.isProfitable = true;
  }

  if (dayTradesOnly === 'true') {
    // Add logic to filter same-day trades
    // This might require aggregation or application-level filtering
  }

  if (marketType) {
    query.marketType = marketType;
  }

  if (symbol) {
    query.symbol = { $regex: symbol, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { symbol: { $regex: search, $options: 'i' } },
      { marketType: { $regex: search, $options: 'i' } },
      { direction: { $regex: search, $options: 'i' } },
    ];
  }

  // Get total count (for pagination)
  const totalCount = await TradingSignal.countDocuments(query);

  // Calculate aggregate statistics across ALL matching signals (not just current page)
  // This is critical for the frontend dashboard cards
  // NOTE: For better performance, use database aggregation instead of fetching all records
  // Example MongoDB aggregation:
  // const statsResult = await TradingSignal.aggregate([
  //   { $match: query },
  //   { $group: {
  //     _id: null,
  //     profitableSignals: { $sum: { $cond: [{ $or: ['$isProfitable', { $gt: ['$profitUSD', 0] }] }, 1, 0] } },
  //     dayTrades: { $sum: { $cond: [{ $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$entryTime' } }, { $dateToString: { format: '%Y-%m-%d', date: '$exitTime' } }] }, 1, 0] } },
  //     totalProfit: { $sum: { $cond: [{ $gt: ['$profitUSD', 0] }, '$profitUSD', 0] } }
  //   }}
  // ]);
  const allMatchingSignals = await TradingSignal.find(query).lean();
  const profitableSignals = allMatchingSignals.filter(
    (s) => s.isProfitable === true || s.profitUSD > 0
  ).length;
  const dayTrades = allMatchingSignals.filter((s) => {
    const entry = new Date(s.entryTime);
    const exit = new Date(s.exitTime);
    return entry.toDateString() === exit.toDateString();
  }).length;
  const totalProfit = allMatchingSignals
    .filter((s) => s.isProfitable === true || s.profitUSD > 0)
    .reduce((sum, s) => sum + s.profitUSD, 0);
  const winRate = totalCount > 0 ? (profitableSignals / totalCount) * 100 : 0;

  // Fetch paginated results
  const signals = await TradingSignal.find(query)
    .sort({ exitTime: -1 }) // Newest first
    .skip(offsetNum)
    .limit(limitNum)
    .lean();

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limitNum);
  const currentPage = Math.floor(offsetNum / limitNum) + 1;

  return res.json({
    success: true,
    data: signals,
    count: totalCount,
    page: currentPage,
    totalPages: totalPages,
    hasMore: offsetNum + limitNum < totalCount,
    stats: {
      totalSignals: totalCount,
      profitableSignals: profitableSignals,
      dayTrades: dayTrades,
      totalProfit: totalProfit,
      winRate: winRate,
    },
  });
}
```

---

## Questions or Clarifications?

If you need clarification on any aspect of this specification, please reach out to the frontend team. The frontend is ready and waiting for this endpoint to be implemented.

---

## Priority

**HIGH PRIORITY** - This endpoint is required for the Trading Signals History page which is already built and deployed in the frontend. Users will see errors until this endpoint is implemented.

---

**Last Updated**: 2024-01-15
**Frontend Status**: ✅ Ready and waiting for backend implementation
